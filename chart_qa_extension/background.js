// Background script for Chart QA Extension
// This script runs in the background and handles extension lifecycle

// Extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Chart QA Extension installed');
    
    // Set default settings
    chrome.storage.sync.set({
      apiUrl: 'http://localhost:5000',
      autoCapture: false
    });
  } else if (details.reason === 'update') {
    console.log('Chart QA Extension updated');
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startAreaSelection') {
    // Get current active tab and inject content script if needed
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        try {
          // Try to send message first
          chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
            if (chrome.runtime.lastError) {
              // Content script not injected, inject it first
              console.log('Injecting content script...');
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content.js']
              }, () => {
                if (chrome.runtime.lastError) {
                  sendResponse({ success: false, error: 'Failed to inject content script: ' + chrome.runtime.lastError.message });
                } else {
                  // Wait a moment for script to load, then send message
                  setTimeout(() => {
                    chrome.tabs.sendMessage(tabs[0].id, request, sendResponse);
                  }, 100);
                }
              });
            } else {
              sendResponse(response);
            }
          });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      }
    });
    return true; // Keep message channel open
  }
  
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['apiUrl', 'autoCapture'], (result) => {
      sendResponse(result);
    });
    return true;
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Inject content script if needed
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(() => {
      // Ignore errors for pages where content scripts can't be injected
    });
  }
});

// Context menu (optional feature)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeChart',
    title: 'Analyze with Chart QA',
    contexts: ['image']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzeChart') {
    // Open popup or send message to analyze the image
    chrome.action.openPopup();
  }
});
