-- Create the waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Set up Row Level Security (RLS) for waitlist
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Clips Table (Clipboard History)
CREATE TABLE IF NOT EXISTS clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  display_value TEXT,
  type TEXT DEFAULT 'TEXT',
  is_sensitive BOOLEAN DEFAULT false,
  source_device TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Clips
CREATE POLICY "Users can view their own clips" ON clips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clips" ON clips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clips" ON clips
  FOR DELETE USING (auth.uid() = user_id);

-- Devices Table
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'extension', 'cli', 'android', 'vscode'
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Devices
CREATE POLICY "Users can view their own devices" ON devices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own devices" ON devices
  FOR ALL USING (auth.uid() = user_id);

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'lifetime')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Auto-create profile trigger for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, tier)
  VALUES (new.id, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure all existing auth users have profiles
INSERT INTO public.profiles (id, tier)
SELECT id, 'free' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Invite/License Keys Table
CREATE TABLE IF NOT EXISTS public.invite_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_code TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'lifetime')),
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ
);

ALTER TABLE public.invite_keys ENABLE ROW LEVEL SECURITY;

-- Allow users to view keys they have redeemed
CREATE POLICY "Users can view their own redeemed keys" ON public.invite_keys
  FOR SELECT USING (auth.uid() = used_by);

-- Secure License Key Activation Function (RPC)
CREATE OR REPLACE FUNCTION public.activate_license_key(p_key_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier TEXT;
  v_is_used BOOLEAN;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Select and lock the key record to avoid race conditions
  SELECT tier, is_used INTO v_tier, v_is_used
  FROM public.invite_keys
  WHERE key_code = p_key_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'KEY_NOT_FOUND';
  END IF;

  IF v_is_used THEN
    RETURN 'KEY_ALREADY_USED';
  END IF;

  -- Mark key as used
  UPDATE public.invite_keys
  SET is_used = true,
      used_by = v_user_id,
      used_at = now()
  WHERE key_code = p_key_code;

  -- Update or insert profile tier
  INSERT INTO public.profiles (id, tier, updated_at)
  VALUES (v_user_id, v_tier, now())
  ON CONFLICT (id)
  DO UPDATE SET tier = v_tier, updated_at = now();

  RETURN 'SUCCESS';
END;
$$;

-- Updated Trigger Functions checking user profile tier
CREATE OR REPLACE FUNCTION public.enforce_daily_sync_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INT;
  user_tier TEXT;
BEGIN
  -- Get user tier
  SELECT COALESCE(tier, 'free') INTO user_tier
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Pro and Lifetime tiers get unlimited syncs
  IF user_tier = 'pro' OR user_tier = 'lifetime' THEN
    -- Update usage_stats just for logging/analytics, but don't block
    INSERT INTO public.usage_stats (user_id, date, sync_count)
    VALUES (NEW.user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET sync_count = usage_stats.sync_count + 1;
    
    RETURN NEW;
  END IF;

  -- Free tier is limited to 200 daily syncs
  SELECT COALESCE(sync_count, 0) INTO current_count
  FROM public.usage_stats
  WHERE user_id = NEW.user_id AND date = CURRENT_DATE;

  IF current_count >= 200 THEN
    RAISE EXCEPTION 'DAILY_LIMIT_REACHED';
  END IF;

  INSERT INTO public.usage_stats (user_id, date, sync_count)
  VALUES (NEW.user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET sync_count = usage_stats.sync_count + 1;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_clip_history_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tier TEXT;
BEGIN
  -- Get user tier
  SELECT COALESCE(tier, 'free') INTO user_tier
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF user_tier = 'pro' OR user_tier = 'lifetime' THEN
    -- Pro & Lifetime: Keep 90 days history (prune older than 90 days)
    DELETE FROM public.clips
    WHERE user_id = NEW.user_id
      AND created_at < (NOW() - INTERVAL '90 days');
  ELSE
    -- Free: Limit to 50 clips total
    DELETE FROM public.clips
    WHERE id IN (
      SELECT id
      FROM public.clips
      WHERE user_id = NEW.user_id
      ORDER BY created_at DESC
      OFFSET 50
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_device_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  device_count INT;
  user_tier TEXT;
BEGIN
  -- Get user tier
  SELECT COALESCE(tier, 'free') INTO user_tier
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Get current device count
  SELECT count(*) INTO device_count
  FROM public.devices
  WHERE user_id = NEW.user_id;
  
  -- Free tier is limited to 2 devices
  IF user_tier = 'free' AND device_count >= 2 THEN
    RAISE EXCEPTION 'DEVICE_LIMIT_REACHED';
  END IF;
  
  -- Pro tier is limited to 10 devices
  IF user_tier = 'pro' AND device_count >= 10 THEN
    RAISE EXCEPTION 'DEVICE_LIMIT_REACHED';
  END IF;

  -- Lifetime tier has no device limit
  
  RETURN NEW;
END;
$$;

-- Create trigger for device limits
DROP TRIGGER IF EXISTS trigger_enforce_device_limit ON public.devices;
CREATE TRIGGER trigger_enforce_device_limit
  BEFORE INSERT ON public.devices
  FOR EACH ROW EXECUTE FUNCTION public.enforce_device_limit();


