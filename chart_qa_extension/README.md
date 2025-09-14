# Chart QA Chrome Extension

A Chrome extension that allows you to take screenshots and ask questions about charts and images using your fine-tuned Qwen2-VL model.

## Features

- 📸 **Screenshot Capture**: Take full-page or area screenshots
- 🤖 **AI Analysis**: Ask questions about charts and images
- 🎯 **Area Selection**: Select specific areas for analysis
- 💬 **Natural Language**: Ask questions in plain English
- ⚡ **Fast Processing**: Optimized for quick responses

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Backend Server

```bash
cd backend
python start_server.py
```

The server will start on `http://localhost:5001`

### 3. Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chart_qa_extension` folder
5. The extension should now appear in your extensions bar

### 4. Test the Extension

1. Click the extension icon in your browser toolbar
2. Navigate to a webpage with charts or images
3. Click "Capture Screenshot" to take a screenshot
4. Enter a question about the image
5. Click "Analyze with AI" to get your answer

## Usage

### Taking Screenshots
- **Full Page**: Click "📸 Capture Screenshot" to capture the visible area
- **Area Selection**: Click "🎯 Select Area" to select a specific region

### Asking Questions
- Enter natural language questions about the image
- Examples:
  - "What does this chart show?"
  - "What is the highest value in this graph?"
  - "Describe the trend in this data"
  - "What are the main categories shown?"

### Getting Results
- The AI will analyze your image and provide a detailed answer
- Results are displayed in the extension popup
- Processing typically takes 5-15 seconds depending on image complexity

## Model Information

This extension uses your fine-tuned Qwen2-VL-2B model with LoRA adapters specifically trained for chart QA tasks. The model is located at:
`/Users/gauravatavale/Documents/AI_research/chartQA_finetuning/lora_model_1k`

## Troubleshooting

### Backend Issues
- Ensure the backend server is running on port 5001
- Check that all dependencies are installed
- Verify the model path is correct in `backend/app.py`

### Extension Issues
- Make sure the extension is loaded in Chrome
- Check the browser console for any JavaScript errors
- Ensure the backend URL is correct in `popup.js`

### Performance
- Large images may take longer to process
- Consider resizing very large screenshots for faster processing
- The model uses GPU acceleration when available

## File Structure

```
chart_qa_extension/
├── manifest.json          # Extension manifest
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── content.js            # Content script for area selection
├── background.js         # Background service worker
├── icons/                # Extension icons
├── backend/
│   ├── app.py           # Flask server
│   ├── start_server.py  # Server startup script
│   └── requirements.txt # Python dependencies
└── README.md            # This file
```

## API Endpoints

- `GET /health` - Health check
- `GET /status` - Model status
- `POST /analyze` - Analyze image with question

## Development

To modify the extension:
1. Make changes to the relevant files
2. Reload the extension in Chrome (`chrome://extensions/`)
3. Test your changes

To modify the backend:
1. Make changes to `backend/app.py`
2. Restart the server
3. Test the API endpoints

## License

This project is for personal use with your fine-tuned model.
