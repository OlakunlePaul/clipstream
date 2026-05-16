import { getSession } from "../lib/supabase";
import { classifyClip } from "@clipstream/shared/src/classifier";

const ALARM_NAME = "clipCheck";
const OFFSCREEN_PATH = "src/offscreen/index.html";

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
        
        // Save to local history (Step 4 placeholder)
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
    chrome.storage.local.get("session").then((data) => {
      sendResponse(data.session || null);
    });
    return true;
  }
  
  if (message.type === "SIGN_OUT") {
    chrome.storage.local.remove("session").then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});
