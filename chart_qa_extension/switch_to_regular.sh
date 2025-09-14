#!/bin/bash

# 📱 Switch to Regular Mode
# This script switches your extension back to regular popup mode

echo "📱 Switching to Regular Mode..."

# Restore regular manifest
cp manifest_regular.json manifest.json

# Restore regular popup
cp popup_simple.html popup.html
cp popup_simple.js popup.js

echo "✅ Switched to Regular Mode!"
echo ""
echo "🔄 To switch back to full screen mode:"
echo "   ./switch_to_fullscreen.sh"
echo ""
echo "📝 Changes made:"
echo "   - manifest.json → Regular version"
echo "   - popup.html → Regular version"
echo "   - popup.js → Regular version"
