// New Popup Script - Simplified and Reliable
let currentScreenshot = null;
const API_BASE_URL = 'http://localhost:5001';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded');
  
  // Get DOM elements
  const selectAreaBtn = document.getElementById('selectAreaBtn');
  const captureBtn = document.getElementById('captureBtn');
  const previewImage = document.getElementById('previewImage');
  const questionInput = document.getElementById('questionInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const loading = document.getElementById('loading');
  const resultBox = document.getElementById('resultBox');
  
  console.log('DOM elements:', { selectAreaBtn, captureBtn, previewImage, questionInput, analyzeBtn });
  
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

// Select area function - NEW SIMPLE APPROACH
async function selectArea() {
  console.log('Select Area clicked');
  
  const selectAreaBtn = document.getElementById('selectAreaBtn');
  const originalText = selectAreaBtn.textContent;
  
  try {
    // Update button
    selectAreaBtn.disabled = true;
    selectAreaBtn.textContent = '🎯 Selecting...';
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Current tab:', tab);
    
    // Inject the area selector script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['area_selector.js']
    });
    
    console.log('Area selector script injected');
    
    // Listen for the result
    const result = await waitForAreaSelection();
    
    if (result.success) {
      console.log('Area selected:', result.selection);
      await captureSelectedArea(result.selection);
      showMessage(`Area selected: ${result.selection.width}×${result.selection.height}`, 'success');
    } else {
      console.log('Area selection cancelled:', result.error);
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

// Wait for area selection result
function waitForAreaSelection() {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ success: false, error: 'Timeout' });
    }, 30000);
    
    const messageListener = (event) => {
      if (event.data && event.data.type === 'CHART_QA_AREA_SELECTED') {
        clearTimeout(timeout);
        window.removeEventListener('message', messageListener);
        resolve({ success: true, selection: event.data.selection });
      } else if (event.data && event.data.type === 'CHART_QA_AREA_CANCELLED') {
        clearTimeout(timeout);
        window.removeEventListener('message', messageListener);
        resolve({ success: false, error: event.data.reason || 'Cancelled' });
      }
    };
    
    window.addEventListener('message', messageListener);
  });
}

// Capture selected area
async function captureSelectedArea(selection) {
  try {
    console.log('Capturing selected area:', selection);
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Capture full visible area
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 90
    });
    
    // Crop to selected area
    const croppedDataUrl = await cropImage(dataUrl, selection);
    
    // Set as current screenshot
    currentScreenshot = croppedDataUrl;
    const previewImage = document.getElementById('previewImage');
    previewImage.src = croppedDataUrl;
    previewImage.style.display = 'block';
    
    updateAnalyzeButton();
    
  } catch (error) {
    console.error('Error capturing selected area:', error);
    throw error;
  }
}

// Crop image to selected area
function cropImage(dataUrl, selection) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = selection.width;
      canvas.height = selection.height;
      
      ctx.drawImage(
        img,
        selection.x, selection.y, selection.width, selection.height,
        0, 0, selection.width, selection.height
      );
      
      const croppedDataUrl = canvas.toDataURL('image/png');
      resolve(croppedDataUrl);
    };
    img.src = dataUrl;
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


