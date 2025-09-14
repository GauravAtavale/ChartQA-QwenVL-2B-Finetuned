// New Area Selector - Direct and Simple
// This script creates a full-screen area selector

(function() {
  'use strict';
  
  console.log('Area selector script loaded');
  
  // Remove any existing selector
  const existing = document.getElementById('chart-qa-area-selector');
  if (existing) {
    existing.remove();
  }
  
  // Create the main overlay
  const overlay = document.createElement('div');
  overlay.id = 'chart-qa-area-selector';
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.4) !important;
    z-index: 2147483647 !important;
    cursor: crosshair !important;
    user-select: none !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  `;
  
  // Create instruction panel
  const instructionPanel = document.createElement('div');
  instructionPanel.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    background: rgba(0, 0, 0, 0.9) !important;
    color: white !important;
    padding: 15px 25px !important;
    border-radius: 8px !important;
    font-size: 16px !important;
    font-weight: 500 !important;
    z-index: 2147483648 !important;
    pointer-events: none !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    border: 2px solid #4CAF50 !important;
  `;
  instructionPanel.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 18px; margin-bottom: 8px;">🎯 Select Area</div>
      <div style="font-size: 14px; opacity: 0.9;">Click and drag to select • Press ESC to cancel</div>
    </div>
  `;
  
  // Create selection box
  const selectionBox = document.createElement('div');
  selectionBox.style.cssText = `
    position: fixed !important;
    border: 3px solid #4CAF50 !important;
    background: rgba(76, 175, 80, 0.1) !important;
    pointer-events: none !important;
    z-index: 2147483648 !important;
    box-shadow: 0 0 0 1px rgba(76, 175, 80, 0.5) !important;
    display: none !important;
  `;
  
  // Create size indicator
  const sizeIndicator = document.createElement('div');
  sizeIndicator.style.cssText = `
    position: fixed !important;
    background: rgba(76, 175, 80, 0.9) !important;
    color: white !important;
    padding: 4px 8px !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    font-weight: 500 !important;
    z-index: 2147483649 !important;
    pointer-events: none !important;
    display: none !important;
  `;
  
  // Add elements to overlay
  overlay.appendChild(instructionPanel);
  overlay.appendChild(selectionBox);
  overlay.appendChild(sizeIndicator);
  
  // Selection state
  let isSelecting = false;
  let startX = 0;
  let startY = 0;
  
  // Mouse down - start selection
  overlay.addEventListener('mousedown', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    
    // Show selection box
    selectionBox.style.display = 'block';
    selectionBox.style.left = startX + 'px';
    selectionBox.style.top = startY + 'px';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    
    console.log('Selection started at:', startX, startY);
  });
  
  // Mouse move - update selection
  overlay.addEventListener('mousemove', function(e) {
    if (!isSelecting) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    
    // Update selection box
    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
    
    // Update size indicator
    if (width > 20 && height > 20) {
      sizeIndicator.style.display = 'block';
      sizeIndicator.style.left = (left + width + 10) + 'px';
      sizeIndicator.style.top = (top - 25) + 'px';
      sizeIndicator.textContent = `${width} × ${height}`;
    } else {
      sizeIndicator.style.display = 'none';
    }
  });
  
  // Mouse up - finish selection
  overlay.addEventListener('mouseup', function(e) {
    if (!isSelecting) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    isSelecting = false;
    
    const endX = e.clientX;
    const endY = e.clientY;
    
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    
    console.log('Selection ended:', { left, top, width, height });
    
    // Clean up
    overlay.remove();
    
    // Send result
    if (width > 20 && height > 20) {
      // Valid selection
      const result = {
        type: 'CHART_QA_AREA_SELECTED',
        selection: { x: left, y: top, width, height }
      };
      
      console.log('Sending selection result:', result);
      
      // Send to extension
      window.postMessage(result, '*');
      
      // Also try chrome message if available
      if (window.chrome && window.chrome.runtime) {
        try {
          window.chrome.runtime.sendMessage(result);
        } catch (e) {
          console.log('Chrome runtime not available');
        }
      }
    } else {
      // Selection too small
      const result = {
        type: 'CHART_QA_AREA_CANCELLED',
        reason: 'Selection too small'
      };
      
      console.log('Selection cancelled:', result);
      window.postMessage(result, '*');
    }
  });
  
  // ESC key - cancel selection
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Selection cancelled by ESC key');
      
      overlay.remove();
      document.removeEventListener('keydown', handleKeydown);
      
      const result = {
        type: 'CHART_QA_AREA_CANCELLED',
        reason: 'User cancelled'
      };
      
      window.postMessage(result, '*');
    }
  }
  
  // Add event listeners
  document.addEventListener('keydown', handleKeydown);
  
  // Add to page
  document.body.appendChild(overlay);
  
  // Focus the overlay
  overlay.focus();
  
  console.log('Area selector overlay created and active');
  
})();


