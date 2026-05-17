import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    if (!token) {
      return new Response(JSON.stringify({ error: 'No token provided' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Verify the token with Google
    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`)
    const googleUser = await googleRes.json()

    if (!googleUser.email) {
      return new Response(JSON.stringify({ error: 'Invalid Google token' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Sign the user into Supabase (or create them)
    // Note: In production, you'd use admin.getUserByEmail then admin.updateUser or similar
    // For this flow, we'll use a direct session generation if possible, 
    // or just return the user info for the client to handle.
    // Here we use admin.createUser which will fail if exists, but we handle it.
    
    // 2. Find or Create User
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) throw listError

    let targetUser = users.find((u: any) => u.email === googleUser.email)

    if (!targetUser) {
      const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
        email: googleUser.email,
        email_confirm: true,
        user_metadata: { 
          full_name: googleUser.name || googleUser.email, 
          avatar_url: googleUser.picture 
        }
      })
      if (createError) throw createError
      targetUser = newUser
    }

    // 3. Generate a login OTP
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: googleUser.email,
    })

    if (linkError) throw linkError

    return new Response(JSON.stringify({ 
      user: targetUser,
      email: googleUser.email,
      otp: linkData.properties.email_otp 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
