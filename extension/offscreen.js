chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'offscreen') {
    return;
  }

  if (message.type === 'read-clipboard') {
    readClipboard()
      .then((text) => sendResponse({ text }))
      .catch((error) => {
        console.error('Offscreen: Clipboard read failed', error);
        sendResponse({ error: error.name || error.message || 'Unknown Error' });
      });
    return true; // Keep message channel open for async response
  }
});

async function readClipboard() {
  const input = document.getElementById('clipboard-box');
  
  try {
    // Ensure the element is focused and ready for paste
    input.value = '';
    input.focus();
    input.select();
    
    // Attempt 1: Modern Clipboard API
    try {
      const text = await navigator.clipboard.readText();
      if (text) return text;
    } catch (modernError) {
      console.warn('Modern API failed:', modernError.name || modernError.message);
    }
    
    // Attempt 2: Legacy Fallback (execCommand)
    // This is often more reliable in background contexts if the modern API is blocked
    input.focus();
    const success = document.execCommand('paste');
    const text = input.value;
    
    if (success && text) {
      return text;
    }
    
    // If we get here, both methods failed or the clipboard is just empty
    throw new Error(text ? 'Paste command failed' : 'Clipboard is empty or inaccessible');
  } catch (error) {
    throw error;
  }
}
