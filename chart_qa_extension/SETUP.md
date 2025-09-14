# Quick Setup Guide

## 🚀 Getting Started

### Option 1: Automated Setup (Recommended)
```bash
cd /Users/gauravatavale/Documents/chart_qa_extension
./start.sh
```

### Option 2: Manual Setup

1. **Install Backend Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Start the Backend Server**
   ```bash
   python start_server.py
   ```

3. **Load Chrome Extension**
   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `chart_qa_extension` folder

## 🧪 Testing

1. **Test Backend**: Visit `http://localhost:5001/health`
2. **Test Extension**: 
   - Click the extension icon
   - Take a screenshot
   - Ask a question
   - Click "Analyze with AI"

## 📁 File Structure
```
chart_qa_extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension UI
├── popup.js              # Extension logic
├── content.js            # Page interaction
├── background.js         # Background service
├── icons/                # Extension icons
├── backend/
│   ├── app.py           # Flask server
│   ├── start_server.py  # Startup script
│   └── requirements.txt # Dependencies
├── start.sh             # Automated setup
└── README.md            # Full documentation
```

## 🔧 Troubleshooting

- **Backend won't start**: Check Python dependencies and model path
- **Extension not working**: Check browser console and backend connection
- **Model errors**: Verify model files exist at the specified path

## 📞 Support

Check the full README.md for detailed documentation and troubleshooting.
