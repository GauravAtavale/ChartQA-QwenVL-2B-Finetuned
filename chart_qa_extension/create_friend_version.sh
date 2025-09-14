#!/bin/bash

# 🚀 Create Friend Version of Chart QA Extension
# This script creates a version your friend can use with your public server

echo "🎯 Creating friend version of Chart QA Extension..."

# Create friend directory
mkdir -p chart_qa_extension_friend
cd chart_qa_extension_friend

# Copy friend-specific files
cp ../popup_friend.html .
cp ../popup_friend.js .
cp ../popup_friend_fullscreen.html .
cp ../manifest_friend.json manifest.json
cp ../background.js .
cp ../content.js .

# Copy icon files if they exist
if [ -f "../icon16.png" ]; then
    cp ../icon16.png .
fi
if [ -f "../icon48.png" ]; then
    cp ../icon48.png .
fi
if [ -f "../icon128.png" ]; then
    cp ../icon128.png .
fi

echo "✅ Friend version created in: chart_qa_extension_friend/"
echo ""
echo "🔧 Next steps:"
echo "1. Edit popup_friend.js and update the API_BASE_URL"
echo "2. Start your server: python3 start_server.py"
echo "3. Start ngrok: ngrok http 5001"
echo "4. Update the URL in popup_friend.js"
echo "5. Zip the folder and send to your friend!"
echo ""
echo "📖 See SHARING_GUIDE.md for detailed instructions"
echo ""
echo "🖥️  Full Screen Options:"
echo "   - Regular: popup_friend.html (400px width)"
echo "   - Full Screen: popup_friend_fullscreen.html (full browser window)"
echo "   - To use full screen, change manifest.json to point to popup_friend_fullscreen.html"
