chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "READ_CLIPBOARD") {
    readClipboard()
      .then((text) => sendResponse({ text, ok: true }))
      .catch((error) => {
        const reason = error.name === "NotAllowedError" ? "permission" : "error";
        sendResponse({ ok: false, reason, error: error.message });
      });
    return true;
  }
});

async function readClipboard(): Promise<string> {
  const input = document.getElementById("clipboard-box") as HTMLTextAreaElement;
  
  try {
    input.value = "";
    input.focus();
    input.select();
    
    // execCommand('paste') is more reliable in offscreen documents
    const success = document.execCommand("paste");
    
    if (success && input.value) {
      return input.value;
    }
    return "";
  } catch (error) {
    console.error("Offscreen clipboard error:", error);
    throw error;
  }
}
