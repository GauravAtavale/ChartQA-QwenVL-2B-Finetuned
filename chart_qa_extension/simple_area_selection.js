// Simple area selection approach
// This will be injected directly into the page

function createSimpleAreaSelector() {
  console.log('Creating simple area selector...');
  
  // Remove any existing selector
  const existing = document.getElementById('simple-area-selector');
  if (existing) {
    existing.remove();
  }
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'simple-area-selector';
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.5) !important;
    z-index: 999999 !important;
    cursor: crosshair !important;
  `;
  
  // Add instructions
  const instructions = document.createElement('div');
  instructions.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    background: black !important;
    color: white !important;
    padding: 10px 20px !important;
    border-radius: 5px !important;
    font-family: Arial, sans-serif !important;
    font-size: 14px !important;
    z-index: 1000000 !important;
  `;
  instructions.textContent = 'Click and drag to select area • Press ESC to cancel';
  overlay.appendChild(instructions);
  
  let isSelecting = false;
  let startX, startY;
  let selectionBox = null;
  
  // Mouse events
  overlay.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    
    // Create selection box
    selectionBox = document.createElement('div');
    selectionBox.style.cssText = `
      position: fixed !important;
      border: 2px solid #00ff00 !important;
      background: rgba(0, 255, 0, 0.1) !important;
      pointer-events: none !important;
      z-index: 1000000 !important;
    `;
    overlay.appendChild(selectionBox);
  });
  
  overlay.addEventListener('mousemove', (e) => {
    if (!isSelecting || !selectionBox) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    
    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
  });
  
  overlay.addEventListener('mouseup', (e) => {
    if (!isSelecting) return;
    
    e.preventDefault();
    isSelecting = false;
    
    const endX = e.clientX;
    const endY = e.clientY;
    
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    
    // Clean up
    overlay.remove();
    
    // Send result
    if (width > 10 && height > 10) {
      // Send message to extension
      window.postMessage({
        type: 'CHART_QA_AREA_SELECTED',
        selection: { x: left, y: top, width, height }
      }, '*');
    } else {
      window.postMessage({
        type: 'CHART_QA_AREA_CANCELLED'
      }, '*');
    }
  });
  
  // ESC key
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleKeydown);
      window.postMessage({
        type: 'CHART_QA_AREA_CANCELLED'
      }, '*');
    }
  };
  
  document.addEventListener('keydown', handleKeydown);
  document.body.appendChild(overlay);
  
  console.log('Simple area selector created');
}

// Start the selector
createSimpleAreaSelector();


