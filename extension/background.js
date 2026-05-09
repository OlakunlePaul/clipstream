const ALARM_NAME = 'clipboard-poll';
const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

// Set up alarm on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.5 }); // Poll every 30 seconds
  console.log('ClipStream: Alarm created');
});

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    readClipboard();
  }
});

async function readClipboard() {
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
  
  try {
    const result = await chrome.runtime.sendMessage({
      type: 'read-clipboard',
      target: 'offscreen'
    });
    
    if (result && result.text) {
      handleNewClipboardItem(result.text);
    }
  } catch (error) {
    console.error('ClipStream: Error reading clipboard:', error);
  }
}

async function setupOffscreenDocument(path) {
  // Check if offscreen document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(path)]
  });

  if (existingContexts.length > 0) {
    return;
  }

  // Create offscreen document
  await chrome.offscreen.createDocument({
    url: path,
    reasons: ['CLIPBOARD'],
    justification: 'Read clipboard in background for sync'
  });
}

async function handleNewClipboardItem(text) {
  if (!text || text.trim() === '') return;

  const storage = await chrome.storage.local.get(['history']);
  let history = storage.history || [];

  // Check if the item is the same as the last one to avoid duplicates
  if (history.length > 0 && history[0].text === text) {
    return;
  }

  // Add new item to history
  const newItem = {
    text: text,
    timestamp: Date.now()
  };

  history = [newItem, ...history].slice(0, 10); // Keep last 10 items

  await chrome.storage.local.set({ history });
  console.log('ClipStream: New clipboard item saved');
}
