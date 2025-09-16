// Friend version - configurable API URL
let currentScreenshot = null;

// 🔧 CONFIGURE THIS URL FOR YOUR FRIEND
// Replace with your ngrok URL or public IP
const API_BASE_URL = ''; // Change this!

document.addEventListener('DOMContentLoaded', function() {
  console.log('Friend popup loaded');
  
  // Get DOM elements
  const selectAreaBtn = document.getElementById('selectAreaBtn');
  const captureBtn = document.getElementById('captureBtn');
  const previewImage = document.getElementById('previewImage');
  const questionInput = document.getElementById('questionInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const loading = document.getElementById('loading');
  const resultBox = document.getElementById('resultBox');
  
  console.log('DOM elements found:', { selectAreaBtn, captureBtn, previewImage, questionInput, analyzeBtn });
  
  // Event listeners
  selectAreaBtn.addEventListener('click', selectArea);
  captureBtn.addEventListener('click', captureFullScreenshot);
  analyzeBtn.addEventListener('click', analyzeImage);
  questionInput.addEventListener('input', updateAnalyzeButton);
  
  // Update button states
  updateAnalyzeButton();
  
  // Check backend status
  checkBackendStatus();
});

// Select area function - NO SCRIPTING API NEEDED
async function selectArea() {
  console.log('Select Area clicked');
  
  const selectAreaBtn = document.getElementById('selectAreaBtn');
  const originalText = selectAreaBtn.textContent;
  
  try {
    // Update button
    selectAreaBtn.disabled = true;
    selectAreaBtn.textContent = '🎯 Capturing...';
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Current tab:', tab);
    
    // Capture the visible area first
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 90
    });
    
    console.log('Screenshot captured, showing crop interface...');
    
    // Show crop interface directly in the popup
    const croppedDataUrl = await showCropInterface(dataUrl);
    
    if (croppedDataUrl) {
      console.log('Area selected and cropped');
      currentScreenshot = croppedDataUrl;
      const previewImage = document.getElementById('previewImage');
      previewImage.src = croppedDataUrl;
      previewImage.style.display = 'block';
      
      updateAnalyzeButton();
      showMessage('Area selected successfully!', 'success');
    } else {
      showMessage('Area selection cancelled', 'info');
    }
    
  } catch (error) {
    console.error('Error in selectArea:', error);
    showMessage('Error: ' + error.message, 'error');
  } finally {
    // Reset button
    selectAreaBtn.disabled = false;
    selectAreaBtn.textContent = originalText;
  }
}

// Show crop interface in the popup - ULTRA SIMPLE VERSION
function showCropInterface(dataUrl) {
  return new Promise((resolve) => {
    console.log('🚀 Creating ULTRA SIMPLE crop interface...');
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.9) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    `;
    
    // Create crop container
    const cropContainer = document.createElement('div');
    cropContainer.style.cssText = `
      background: white !important;
      border-radius: 12px !important;
      padding: 30px !important;
      max-width: 95vw !important;
      max-height: 95vh !important;
      overflow: auto !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
      text-align: center !important;
    `;
    
    // Create instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      margin-bottom: 20px !important;
      font-family: Arial, sans-serif !important;
      font-size: 18px !important;
      color: #333 !important;
    `;
    instructions.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 10px; color: #4CAF50; font-size: 24px;">🎯 Select Area to Analyze</div>
      <div style="font-size: 16px; color: #666;">Click and drag on the image below to select the area</div>
    `;
    
    // Create image with canvas for selection
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Load image and draw on canvas
    const img = new Image();
    img.onload = function() {
      // Set canvas size to image size (but limit max size)
      const maxSize = 800;
      let canvasWidth = img.width;
      let canvasHeight = img.height;
      
      if (canvasWidth > maxSize || canvasHeight > maxSize) {
        const scale = maxSize / Math.max(canvasWidth, canvasHeight);
        canvasWidth *= scale;
        canvasHeight *= scale;
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.cssText = `
        border: 3px solid #4CAF50 !important;
        border-radius: 8px !important;
        cursor: crosshair !important;
        display: block !important;
        margin: 0 auto !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
      `;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      
      console.log('🚀 Canvas created:', canvasWidth, 'x', canvasHeight);
      
      // Selection state
      let isSelecting = false;
      let startX, startY;
      let selectionRect = null;
      
      // Mouse events
      canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        isSelecting = true;
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        
        console.log('🚀 Selection started at:', startX, startY);
        
        // Clear previous selection
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      });
      
      canvas.addEventListener('mousemove', (e) => {
        if (!isSelecting) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        // Clear and redraw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        
        // Draw selection rectangle
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        
        // Draw selection
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(left, top, width, height);
        
        // Fill selection
        ctx.fillStyle = 'rgba(76, 175, 80, 0.2)';
        ctx.fillRect(left, top, width, height);
        
        // Update button
        if (width > 10 && height > 10) {
          cropBtn.textContent = `✅ Use Selected Area (${Math.round(width)}×${Math.round(height)})`;
          cropBtn.style.background = '#4CAF50';
          cropBtn.style.cursor = 'pointer';
          cropBtn.disabled = false;
        } else {
          cropBtn.textContent = '✅ Use Selected Area';
          cropBtn.style.background = '#ccc';
          cropBtn.style.cursor = 'not-allowed';
          cropBtn.disabled = true;
        }
      });
      
      canvas.addEventListener('mouseup', (e) => {
        if (!isSelecting) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        isSelecting = false;
        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;
        
        const left = Math.min(startX, endX);
        const top = Math.min(startY, endY);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        
        console.log('🚀 Selection ended:', { left, top, width, height });
        
        // Store selection for cropping
        selectionRect = { left, top, width, height };
        
        if (width > 10 && height > 10) {
          cropBtn.disabled = false;
          cropBtn.textContent = `✅ Use Selected Area (${Math.round(width)}×${Math.round(height)})`;
          cropBtn.style.background = '#4CAF50';
          cropBtn.style.cursor = 'pointer';
        } else {
          cropBtn.disabled = true;
          cropBtn.textContent = '✅ Use Selected Area';
          cropBtn.style.background = '#ccc';
          cropBtn.style.cursor = 'not-allowed';
        }
      });
      
      // Button events
      cropBtn.addEventListener('click', () => {
        if (selectionRect && !cropBtn.disabled) {
          console.log('🚀 Cropping with:', selectionRect);
          
          // Create new canvas for cropped image
          const cropCanvas = document.createElement('canvas');
          const cropCtx = cropCanvas.getContext('2d');
          
          cropCanvas.width = selectionRect.width;
          cropCanvas.height = selectionRect.height;
          
          // Draw cropped portion
          cropCtx.drawImage(
            img, 
            selectionRect.left * (img.width / canvasWidth), 
            selectionRect.top * (img.height / canvasHeight),
            selectionRect.width * (img.width / canvasWidth),
            selectionRect.height * (img.height / canvasHeight),
            0, 0, selectionRect.width, selectionRect.height
          );
          
          const croppedDataUrl = cropCanvas.toDataURL('image/png');
          
          console.log('🚀 Image cropped successfully!');
          overlay.remove();
          resolve(croppedDataUrl);
        }
      });
    };
    
    img.src = dataUrl;
    
    // Create buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      margin-top: 20px !important;
      text-align: center !important;
    `;
    
    const cropBtn = document.createElement('button');
    cropBtn.textContent = '✅ Use Selected Area';
    cropBtn.style.cssText = `
      background: #ccc !important;
      color: white !important;
      border: none !important;
      padding: 15px 30px !important;
      border-radius: 8px !important;
      margin-right: 15px !important;
      cursor: not-allowed !important;
      font-size: 16px !important;
      font-weight: bold !important;
    `;
    cropBtn.disabled = true;
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '❌ Cancel';
    cancelBtn.style.cssText = `
      background: #f44336 !important;
      color: white !important;
      border: none !important;
      padding: 15px 30px !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      font-size: 16px !important;
      font-weight: bold !important;
    `;
    
    cancelBtn.addEventListener('click', () => {
      console.log('🚀 Selection cancelled');
      overlay.remove();
      resolve(null);
    });
    
    // Assemble UI
    buttonContainer.appendChild(cropBtn);
    buttonContainer.appendChild(cancelBtn);
    
    cropContainer.appendChild(instructions);
    cropContainer.appendChild(canvas);
    cropContainer.appendChild(buttonContainer);
    
    overlay.appendChild(cropContainer);
    document.body.appendChild(overlay);
    
    console.log('🚀 ULTRA SIMPLE crop interface created and ready');
  });
}

// Capture full screenshot
async function captureFullScreenshot() {
  console.log('Capture full screenshot clicked');
  
  const captureBtn = document.getElementById('captureBtn');
  const originalText = captureBtn.textContent;
  
  try {
    captureBtn.disabled = true;
    captureBtn.textContent = '📸 Capturing...';
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 90
    });
    
    currentScreenshot = dataUrl;
    const previewImage = document.getElementById('previewImage');
    previewImage.src = dataUrl;
    previewImage.style.display = 'block';
    
    updateAnalyzeButton();
    showMessage('Full screenshot captured!', 'success');
    
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    showMessage('Error: ' + error.message, 'error');
  } finally {
    captureBtn.disabled = false;
    captureBtn.textContent = originalText;
  }
}

// Analyze image
async function analyzeImage() {
  const questionInput = document.getElementById('questionInput');
  
  if (!currentScreenshot || !questionInput.value.trim()) {
    showMessage('Please capture a screenshot and enter a question.', 'error');
    return;
  }
  
  const analyzeBtn = document.getElementById('analyzeBtn');
  const loading = document.getElementById('loading');
  const resultBox = document.getElementById('resultBox');
  
  try {
    // Show loading
    loading.style.display = 'block';
    analyzeBtn.disabled = true;
    resultBox.innerHTML = '';
    
    // Compress image
    const base64Data = await compressImage(currentScreenshot);
    
    // Send to backend
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64Data,
        question: questionInput.value.trim()
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Show result
    resultBox.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: 600; color: #FFD700;">
        🤖 AI Analysis:
      </div>
      <div style="line-height: 1.5;">
        ${result.answer || result.error || 'No response received'}
      </div>
    `;
    
    showMessage('Analysis completed!', 'success');
    
  } catch (error) {
    console.error('Error analyzing image:', error);
    resultBox.innerHTML = `
      <div style="color: #ff6b6b;">
        ❌ Error: ${error.message}
      </div>
      <div style="margin-top: 10px; font-size: 12px; color: rgba(255, 255, 255, 0.7);">
        Make sure the backend server is running on ${API_BASE_URL}
      </div>
    `;
    showMessage('Analysis failed: ' + error.message, 'error');
  } finally {
    loading.style.display = 'none';
    analyzeBtn.disabled = false;
  }
}

// Compress image
function compressImage(dataUrl, maxWidth = 1024, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let { width, height } = img;
      if (width > maxWidth || height > maxWidth) {
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      const base64Data = compressedDataUrl.split(',')[1];
      resolve(base64Data);
    };
    img.src = dataUrl;
  });
}

// Update analyze button state
function updateAnalyzeButton() {
  const questionInput = document.getElementById('questionInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  
  const hasQuestion = questionInput.value.trim().length > 0;
  const hasScreenshot = currentScreenshot !== null;
  
  analyzeBtn.disabled = !(hasQuestion && hasScreenshot);
}

// Show message
function showMessage(message, type = 'info') {
  const messageEl = document.createElement('div');
  messageEl.className = type;
  messageEl.textContent = message;
  messageEl.style.marginTop = '10px';
  
  const resultBox = document.getElementById('resultBox');
  resultBox.parentNode.insertBefore(messageEl, resultBox.nextSibling);
  
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.parentNode.removeChild(messageEl);
    }
  }, 3000);
}

// Check backend status
async function checkBackendStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { timeout: 3000 });
    if (response.ok) {
      showMessage('✅ Backend connected', 'success');
    } else {
      showMessage('⚠️ Backend not responding', 'error');
    }
  } catch (error) {
    showMessage('❌ Backend not available. Please start the server.', 'error');
  }
}
