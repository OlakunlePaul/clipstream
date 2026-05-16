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
    // 1. Try Modern API
    input.focus();
    const text = await navigator.clipboard.readText();
    if (text) return text;
    
    // 2. Fallback to execCommand if modern API returns empty or fails
    input.value = "";
    input.focus();
    const success = document.execCommand("paste");
    if (success && input.value) return input.value;
    
    throw new Error("Clipboard is empty or inaccessible");
  } catch (error) {
    throw error;
  }
}
