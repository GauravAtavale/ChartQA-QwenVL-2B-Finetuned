// Content script for Chart QA Extension
// This script runs in the context of web pages

console.log('Chart QA content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action === 'startAreaSelection') {
    console.log('Starting area selection...');
    handleAreaSelection(request, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  return false;
});

// Handle area selection with improved UI
function handleAreaSelection(request, sendResponse) {
  try {
    // Remove any existing selection overlays
    const existingOverlay = document.getElementById('chart-qa-selection-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    // Create main overlay
    const overlay = document.createElement('div');
    overlay.id = 'chart-qa-selection-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      z-index: 2147483647;
      cursor: crosshair;
      user-select: none;
    `;
    
    // Create instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 2147483648;
      pointer-events: none;
    `;
    instructions.textContent = 'Click and drag to select area • Press ESC to cancel';
    overlay.appendChild(instructions);
    
    let isSelecting = false;
    let startX, startY, endX, endY;
    let selectionBox = null;
    
    // Mouse down - start selection
    overlay.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      
      // Create selection box
      selectionBox = document.createElement('div');
      selectionBox.style.cssText = `
        position: fixed;
        border: 2px solid #4CAF50;
        background: rgba(76, 175, 80, 0.1);
        pointer-events: none;
        z-index: 2147483648;
        box-shadow: 0 0 0 1px rgba(76, 175, 80, 0.3);
      `;
      overlay.appendChild(selectionBox);
      
      // Update cursor
      overlay.style.cursor = 'crosshair';
    });
    
    // Mouse move - update selection
    overlay.addEventListener('mousemove', (e) => {
      if (!isSelecting || !selectionBox) return;
      
      endX = e.clientX;
      endY = e.clientY;
      
      const left = Math.min(startX, endX);
      const top = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);
      
      selectionBox.style.left = left + 'px';
      selectionBox.style.top = top + 'px';
      selectionBox.style.width = width + 'px';
      selectionBox.style.height = height + 'px';
    });
    
    // Mouse up - finish selection
    overlay.addEventListener('mouseup', (e) => {
      if (!isSelecting) return;
      
      e.preventDefault();
      isSelecting = false;
      endX = e.clientX;
      endY = e.clientY;
      
      // Calculate selection area
      const left = Math.min(startX, endX);
      const top = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);
      
      // Only proceed if selection is large enough
      if (width < 10 || height < 10) {
        cleanup();
        sendResponse({ success: false, error: 'Selection too small' });
        return;
      }
      
      // Clean up UI
      cleanup();
      
      // Send selection data back to popup
      sendResponse({
        success: true,
        selection: {
          x: left,
          y: top,
          width: width,
          height: height
        }
      });
    });
    
    // Double click - capture full visible area
    overlay.addEventListener('dblclick', (e) => {
      e.preventDefault();
      cleanup();
      sendResponse({
        success: true,
        selection: {
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    });
    
    // Escape key - cancel selection
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cleanup();
        sendResponse({ success: false, error: 'Selection cancelled' });
      }
    };
    
    // Cleanup function
    function cleanup() {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      document.removeEventListener('keydown', handleEscape);
    }
    
    // Add event listeners
    document.addEventListener('keydown', handleEscape);
    document.body.appendChild(overlay);
    
    // Focus the overlay to capture keyboard events
    overlay.focus();
    
  } catch (error) {
    console.error('Area selection error:', error);
    sendResponse({ success: false, error: error.message });
  }
}
