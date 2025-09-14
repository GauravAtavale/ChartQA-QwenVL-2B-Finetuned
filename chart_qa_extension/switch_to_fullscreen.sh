#!/bin/bash

# 🖥️ Switch to Full Screen Mode
# This script switches your extension to full screen mode

echo "🖥️ Switching to Full Screen Mode..."

# Backup current manifest
cp manifest.json manifest_regular.json

# Switch to full screen manifest
cp manifest_fullscreen.json manifest.json

# Fix the manifest to point to popup.html instead of popup_fullscreen.html
sed -i '' 's/popup_fullscreen.html/popup.html/g' manifest.json

# Switch to full screen popup
cp popup_fullscreen.html popup.html
cp popup_fullscreen.js popup.js

# Fix the popup.html to reference popup.js instead of popup_simple.js
sed -i '' 's/popup_simple.js/popup.js/g' popup.html

echo "✅ Switched to Full Screen Mode!"
echo ""
echo "🔄 To switch back to regular mode:"
echo "   ./switch_to_regular.sh"
echo ""
echo "📝 Changes made:"
echo "   - manifest.json → Full screen version"
echo "   - popup.html → Full screen version"
echo "   - popup.js → Full screen version"
echo "   - manifest_regular.json → Backup of regular version"
