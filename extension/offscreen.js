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
    return true;
  }
});

async function readClipboard() {
  try {
    // Attempt 1: Modern Clipboard API
    // We try to focus a hidden element first, which sometimes helps in extensions
    const input = document.createElement('textarea');
    document.body.appendChild(input);
    input.focus();
    
    const text = await navigator.clipboard.readText();
    
    document.body.removeChild(input);
    return text;
  } catch (error) {
    console.warn('Modern Clipboard API failed, trying fallback...', error);
    
    // Attempt 2: document.execCommand('paste') fallback
    // This requires a textarea and the document to be 'active' in a specific way
    try {
      const input = document.createElement('textarea');
      document.body.appendChild(input);
      input.focus();
      document.execCommand('paste');
      const text = input.value;
      document.body.removeChild(input);
      
      if (text) return text;
      throw new Error('Fallback paste returned no text');
    } catch (fallbackError) {
      console.error('Fallback failed too:', fallbackError);
      throw error; // Throw the original error if fallback also fails
    }
  }
}
