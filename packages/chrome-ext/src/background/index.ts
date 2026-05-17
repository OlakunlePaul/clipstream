import { getSession, supabase } from "../lib/supabase";
import { classifyClip } from "@clipstream/shared/src/classifier";

const ALARM_NAME = "clipCheck";
const OFFSCREEN_PATH = "offscreen/index.html";

// Sentry Placeholder
const logError = (error: any) => {
  console.error("ClipStream Error:", error);
  // Sentry.captureException(error);
};

// Ably Placeholder
const publishToAbly = async (content: string, metadata: any) => {
  console.log("ClipStream: Publishing to Ably...", { type: metadata.type });
  // await ablyChannel.publish('clip', { content, metadata });
};

chrome.runtime.onInstalled.addListener(() => {
  console.log("ClipStream: Initializing monitoring alarm");
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 / 60 }); // ~1s polling
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await checkClipboard();
  }
});

async function checkClipboard() {
  try {
    const session = await getSession();
    if (!session) return; // Only monitor if signed in

    await ensureOffscreenDocument();
    
    // Heartbeat: Update last_seen
    await registerDevice();
    
    const response = await chrome.runtime.sendMessage({
      type: "READ_CLIPBOARD",
      target: "offscreen"
    });

    if (response?.ok && response.text) {
      const { lastClip } = await chrome.storage.session.get("lastClip");
      
      if (response.text !== lastClip) {
        console.log("ClipStream: New content detected");
        
        // Save to deduplicate
        await chrome.storage.session.set({ lastClip: response.text });

        // Step 3: Content Classifier
        const classification = classifyClip(response.text);

        // Publish to Ably
        await publishToAbly(response.text, classification);
        
        // Save to local history
        const { history = [] } = await chrome.storage.local.get("history");
        const newItem = {
          id: crypto.randomUUID(),
          content: response.text,
          displayValue: classification.displayValue,
          type: classification.type,
          timestamp: Date.now(),
          isSensitive: classification.isSensitive
        };
        await chrome.storage.local.set({ 
          history: [newItem, ...history].slice(0, 30) 
        });

        // Step 5: Save to Cloud (Supabase) if auto-sync is enabled
        const { autoSync = true } = await chrome.storage.local.get("autoSync");
        if (autoSync) {
          await saveClipToCloud(newItem);
        }
      }
    } else if (response?.reason === "permission") {
      console.warn("ClipStream: Clipboard permission missing in offscreen");
    }
  } catch (error) {
    logError(error);
  }
}

async function ensureOffscreenDocument() {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT]
  });

  if (contexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_PATH,
    reasons: [chrome.offscreen.Reason.CLIPBOARD],
    justification: "Monitor clipboard for cross-device synchronization"
  });
}

// Handle messages
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_SESSION") {
    supabase.auth.getSession().then(({ data }) => {
      sendResponse(data.session || null);
    });
    return true;
  }
  
  if (message.type === "SIGN_IN") {
    handleSignIn().then(sendResponse);
    return true;
  }

  if (message.type === "SIGN_OUT") {
    supabase.auth.signOut().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

async function handleSignIn() {
  try {
    // 1. Get Google Token
    const auth = await chrome.identity.getAuthToken({ interactive: true });
    
    if (!auth.token) throw new Error("Failed to get Google token");

    // 2. Exchange Google token for Supabase OTP
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    console.log("ClipStream: Requesting OTP from", `${supabaseUrl}/functions/v1/auth-google`);
    
    const otpResponse = await fetch(`${supabaseUrl}/functions/v1/auth-google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: auth.token })
    });

    const otpData = await otpResponse.json();
    if (otpData.error) throw new Error(otpData.error);

    // 3. Final Handshake: Verify OTP with Supabase Auth
    console.log("ClipStream: Verifying OTP for", otpData.email);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: otpData.email,
      token: otpData.otp,
      type: "magiclink"
    });

    if (verifyError) throw verifyError;
    if (!data.session) throw new Error("Verification succeeded but no session returned");

    // 4. Store session in shared storage
    const { error: sessionError } = await supabase.auth.setSession(data.session);
    if (sessionError) throw sessionError;
    
    // 5. Register this device
    await registerDevice();
    
    return { success: true, session: data.session };
  } catch (error) {
    console.error("ClipStream Auth Error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

let lastHeartbeat = 0;
const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function registerDevice() {
  try {
    const session = await getSession();
    if (!session) return;

    // Throttle heartbeats
    const now = Date.now();
    if (now - lastHeartbeat < HEARTBEAT_INTERVAL) return;

    let { deviceId } = await chrome.storage.local.get("deviceId");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      await chrome.storage.local.set({ deviceId });
    }

    // Upsert device info
    const { error } = await supabase
      .from("devices")
      .upsert({
        id: deviceId,
        user_id: session.user.id,
        name: "Chrome Extension",
        platform: "extension",
        last_seen: new Date().toISOString()
      }, { onConflict: "id" });

    if (error) {
      console.error("ClipStream: Device registration failed", error);
      if (error.message?.includes("DEVICE_LIMIT_REACHED")) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: chrome.runtime.getURL("assets/logo-128.png"),
          title: "Device Limit Reached",
          message: "You've reached the free tier limit of 2 devices. Upgrade to Pro for unlimited devices.",
          priority: 0
        });
      }
    } else {
      lastHeartbeat = now;
      console.log("ClipStream: Device registered/updated");
    }
  } catch (err) {
    console.error("ClipStream: Error in registerDevice", err);
  }
}

async function saveClipToCloud(item: any) {
  try {
    const session = await getSession();
    if (!session) return;

    const { deviceId } = await chrome.storage.local.get("deviceId");

    const { error } = await supabase
      .from("clips")
      .insert({
        user_id: session.user.id,
        content: item.content,
        display_value: item.displayValue,
        type: item.type,
        is_sensitive: item.isSensitive,
        source_device: deviceId
      });

    if (error) {
      console.error("ClipStream: Cloud sync failed", error);
      if (error.message?.includes("DAILY_LIMIT_REACHED")) {
        await chrome.storage.local.set({ autoSync: false });
        chrome.notifications.create({
          type: "basic",
          iconUrl: chrome.runtime.getURL("assets/logo-128.png"),
          title: "Daily Limit Reached",
          message: "You've synced 200 clips today. Auto-sync has been paused. Upgrade to Pro for unlimited syncs.",
          priority: 0
        });
      }
    } else {
      console.log("ClipStream: Clip synced to cloud");
      
      // Show notification if enabled
      const { notifications = true } = await chrome.storage.local.get("notifications");
      if (notifications) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: chrome.runtime.getURL("assets/logo-128.png"),
          title: "Clip Synced",
          message: item.displayValue || "Your clip is now available on all devices.",
          priority: 0
        });
      }
    }
  } catch (err) {
    console.error("ClipStream: Error in saveClipToCloud", err);
  }
}
