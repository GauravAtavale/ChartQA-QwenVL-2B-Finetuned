// Simple capture approach - no special permissions needed
// This uses the browser's built-in screenshot API

async function simpleAreaCapture() {
  console.log('Starting simple area capture...');
  
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Current tab:', tab);
    
    // Capture the visible area
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 90
    });
    
    console.log('Screenshot captured');
    
    // Create a simple crop interface
    return await createCropInterface(dataUrl);
    
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw error;
  }
}

// Create a simple crop interface
function createCropInterface(dataUrl) {
  return new Promise((resolve) => {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.8) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    `;
    
    // Create crop container
    const cropContainer = document.createElement('div');
    cropContainer.style.cssText = `
      background: white !important;
      border-radius: 8px !important;
      padding: 20px !important;
      max-width: 90vw !important;
      max-height: 90vh !important;
      overflow: auto !important;
    `;
    
    // Create image
    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.cssText = `
      max-width: 100% !important;
      height: auto !important;
      display: block !important;
      cursor: crosshair !important;
    `;
    
    // Create instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      margin-bottom: 15px !important;
      font-family: Arial, sans-serif !important;
      font-size: 16px !important;
      color: #333 !important;
      text-align: center !important;
    `;
    instructions.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">🎯 Select Area to Analyze</div>
      <div style="font-size: 14px; color: #666;">Click and drag on the image below to select the area you want to analyze</div>
    `;
    
    // Create buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      margin-top: 15px !important;
      text-align: center !important;
    `;
    
    const cropBtn = document.createElement('button');
    cropBtn.textContent = '✅ Use Selected Area';
    cropBtn.style.cssText = `
      background: #4CAF50 !important;
      color: white !important;
      border: none !important;
      padding: 10px 20px !important;
      border-radius: 4px !important;
      margin-right: 10px !important;
      cursor: pointer !important;
      font-size: 14px !important;
    `;
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '❌ Cancel';
    cancelBtn.style.cssText = `
      background: #f44336 !important;
      color: white !important;
      border: none !important;
      padding: 10px 20px !important;
      border-radius: 4px !important;
      cursor: pointer !important;
      font-size: 14px !important;
    `;
    
    // Selection state
    let isSelecting = false;
    let startX, startY;
    let selectionBox = null;
    
    // Mouse events
    img.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isSelecting = true;
      startX = e.offsetX;
      startY = e.offsetY;
      
      // Remove existing selection
      if (selectionBox) {
        selectionBox.remove();
      }
      
      // Create selection box
      selectionBox = document.createElement('div');
      selectionBox.style.cssText = `
        position: absolute !important;
        border: 2px solid #4CAF50 !important;
        background: rgba(76, 175, 80, 0.1) !important;
        pointer-events: none !important;
        z-index: 10 !important;
      `;
      
      // Position relative to image
      const imgRect = img.getBoundingClientRect();
      selectionBox.style.left = (imgRect.left + startX) + 'px';
      selectionBox.style.top = (imgRect.top + startY) + 'px';
      selectionBox.style.width = '0px';
      selectionBox.style.height = '0px';
      
      document.body.appendChild(selectionBox);
    });
    
    img.addEventListener('mousemove', (e) => {
      if (!isSelecting || !selectionBox) return;
      
      const currentX = e.offsetX;
      const currentY = e.offsetY;
      
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      
      const imgRect = img.getBoundingClientRect();
      selectionBox.style.left = (imgRect.left + left) + 'px';
      selectionBox.style.top = (imgRect.top + top) + 'px';
      selectionBox.style.width = width + 'px';
      selectionBox.style.height = height + 'px';
    });
    
    img.addEventListener('mouseup', (e) => {
      if (!isSelecting) return;
      
      isSelecting = false;
      
      const endX = e.offsetX;
      const endY = e.offsetY;
      
      const left = Math.min(startX, endX);
      const top = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);
      
      if (width > 10 && height > 10) {
        // Valid selection
        cropBtn.disabled = false;
        cropBtn.textContent = `✅ Use Selected Area (${width}×${height})`;
      } else {
        cropBtn.disabled = true;
        cropBtn.textContent = '✅ Use Selected Area';
      }
    });
    
    // Button events
    cropBtn.disabled = true;
    cropBtn.addEventListener('click', () => {
      if (selectionBox) {
        const rect = selectionBox.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        
        const x = rect.left - imgRect.left;
        const y = rect.top - imgRect.top;
        const width = rect.width;
        const height = rect.height;
        
        // Crop the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
        
        const croppedDataUrl = canvas.toDataURL('image/png');
        
        overlay.remove();
        resolve(croppedDataUrl);
      }
    });
    
    cancelBtn.addEventListener('click', () => {
      overlay.remove();
      resolve(null);
    });
    
    // Assemble UI
    buttonContainer.appendChild(cropBtn);
    buttonContainer.appendChild(cancelBtn);
    
    cropContainer.appendChild(instructions);
    cropContainer.appendChild(img);
    cropContainer.appendChild(buttonContainer);
    
    overlay.appendChild(cropContainer);
    document.body.appendChild(overlay);
  });
}

// Export for use
window.simpleAreaCapture = simpleAreaCapture;


