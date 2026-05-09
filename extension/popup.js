document.addEventListener('DOMContentLoaded', async () => {
  const historyList = document.getElementById('history-list');
  const emptyHistory = document.getElementById('empty-history');
  const permissionView = document.getElementById('permission-view');
  const historyView = document.getElementById('history-view');
  const grantBtn = document.getElementById('grant-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');

  // Check clipboard permission using the official Chrome API
  const checkPermission = async () => {
    return new Promise((resolve) => {
      chrome.permissions.contains({
        permissions: ['clipboardRead']
      }, (result) => {
        resolve(result);
      });
    });
  };

  const renderHistory = async () => {
    const storage = await chrome.storage.local.get(['history']);
    const history = storage.history || [];
    
    historyList.innerHTML = '';
    
    if (history.length === 0) {
      emptyHistory.classList.remove('hidden');
      clearAllBtn.classList.add('hidden');
      return;
    }
    
    emptyHistory.classList.add('hidden');
    clearAllBtn.classList.remove('hidden');
    
    // Show only last 3 items as per requirement
    const displayItems = history.slice(0, 3);
    
    displayItems.forEach((item, index) => {
      const itemWrapper = document.createElement('div');
      itemWrapper.className = 'item-wrapper';
      
      const itemEl = document.createElement('div');
      itemEl.className = 'history-item';
      itemEl.innerHTML = `
        <div class="item-content">${escapeHtml(item.text)}</div>
        <div class="item-time">${formatTime(item.timestamp)}</div>
        <div class="copied-badge">Copied!</div>
      `;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '✕';
      deleteBtn.title = 'Delete item';
      
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteItem(item.timestamp);
      });
      
      itemEl.addEventListener('click', () => {
        copyToClipboard(item.text, itemEl);
      });
      
      itemWrapper.appendChild(itemEl);
      itemWrapper.appendChild(deleteBtn);
      historyList.appendChild(itemWrapper);
    });
  };

  const deleteItem = async (timestamp) => {
    const storage = await chrome.storage.local.get(['history']);
    let history = storage.history || [];
    history = history.filter(item => item.timestamp !== timestamp);
    await chrome.storage.local.set({ history });
    renderHistory();
  };

  const clearAll = async () => {
    if (confirm('Are you sure you want to clear all history?')) {
      await chrome.storage.local.set({ history: [] });
      renderHistory();
    }
  };

  const copyToClipboard = async (text, element) => {
    try {
      await navigator.clipboard.writeText(text);
      element.classList.add('copied');
      setTimeout(() => element.classList.remove('copied'), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const init = async () => {
    const hasPermission = await checkPermission();
    
    if (!hasPermission) {
      permissionView.classList.remove('hidden');
      historyView.classList.add('hidden');
    } else {
      permissionView.classList.add('hidden');
      historyView.classList.remove('hidden');
      renderHistory();
    }
  };

  grantBtn.addEventListener('click', () => {
    // Request permission explicitly
    chrome.permissions.request({
      permissions: ['clipboardRead']
    }, (granted) => {
      if (granted) {
        init();
      } else {
        alert('ClipStream needs clipboard access to sync your items.');
      }
    });
  });

  clearAllBtn.addEventListener('click', clearAll);

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  init();
  
  // Refresh history when popup becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      init();
    }
  });
});
