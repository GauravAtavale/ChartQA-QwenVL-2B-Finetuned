# 🌐 Sharing Your Chart QA Extension with Friends

This guide shows you how to share your extension with friends while hosting the AI server on your Mac.

## 🚀 **Step 1: Make Your Server Public (Choose One Method)**

### Method A: Using ngrok (Recommended - Easiest)

1. **Install ngrok:**
   ```bash
   brew install ngrok
   ```

2. **Sign up for ngrok (Free):**
   - Go to [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
   - Create a free account and verify your email

3. **Get your authtoken:**
   - Go to [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
   - Copy your authtoken

4. **Configure ngrok:**
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

5. **Start your server:**
   ```bash
   cd /Users/gauravatavale/Documents/chart_qa_extension/backend
   python3 start_server.py
   ```

6. **In another terminal, expose your server:**
   ```bash
   ngrok http 5001
   ```

7. **Copy the public URL** (looks like `https://abc123.ngrok.io`)

### Method B: Using your public IP (More complex)

1. **Find your public IP:**
   ```bash
   curl ifconfig.me
   ```

2. **Configure your router** to forward port 5001 to your Mac
3. **Update your Mac's firewall** to allow connections on port 5001
4. **Use your public IP** like `http://YOUR_PUBLIC_IP:5001`

## 🔧 **Step 2: Configure the Friend Version**

1. **Edit the friend version:**
   ```bash
   # Open the friend version file
   open chart_qa_extension/popup_friend.js
   ```

2. **Update line 5** with your public URL:
   ```javascript
   // Change this line:
   const API_BASE_URL = 'https://YOUR_NGROK_URL.ngrok.io';
   
   // To your actual URL:
   const API_BASE_URL = 'https://abc123.ngrok.io';
   ```

## 📦 **Step 3: Package for Your Friend**

1. **Create a friend folder:**
   ```bash
   mkdir chart_qa_extension_friend
   cd chart_qa_extension_friend
   ```

2. **Copy the friend files:**
   ```bash
   cp ../chart_qa_extension/popup_friend.html .
   cp ../chart_qa_extension/popup_friend.js .
   cp ../chart_qa_extension/popup_friend_fullscreen.html .
   cp ../chart_qa_extension/manifest_friend.json manifest.json
   cp ../chart_qa_extension/background.js .
   cp ../chart_qa_extension/content.js .
   cp ../chart_qa_extension/icon*.png .
   ```

3. **Choose display mode:**
   - **Regular Mode (400px width):** Use `popup_friend.html`
   - **Full Screen Mode:** Change `manifest.json` to point to `popup_friend_fullscreen.html`

4. **Zip the folder:**
   ```bash
   cd ..
   zip -r chart_qa_extension_friend.zip chart_qa_extension_friend/
   ```

## 📤 **Step 4: Share with Your Friend**

1. **Send the zip file** to your friend
2. **Send them these instructions:**

---

## 👥 **Instructions for Your Friend**

### **Installation:**

1. **Download and extract** the zip file
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top right)
4. **Click "Load unpacked"** and select the extracted folder
5. **The extension should appear** in your extensions list

### **Usage:**

1. **Click the extension icon** in your browser toolbar
2. **Click "🎯 Select Area"** to choose a specific part of the screen
3. **Or click "📸 Capture Full"** to take a full screenshot
4. **Type your question** in the text box
5. **Click "🤖 Analyze Image"** to get AI insights!

### **Troubleshooting:**

- **If you get connection errors:** Make sure your friend's server is running
- **If the extension doesn't work:** Check the browser console for errors
- **If images don't load:** Try refreshing the page and trying again

---

## 🔄 **Step 5: Keep Your Server Running**

### **For ngrok users:**
- **Keep both terminals open** (server + ngrok)
- **ngrok URLs change** when you restart, so update the friend version
- **Consider ngrok Pro** for permanent URLs

### **For public IP users:**
- **Keep your server running** 24/7
- **Monitor your Mac's power settings** to prevent sleep
- **Consider using a VPS** for better reliability

## 🛡️ **Security Considerations**

1. **Your server is now public** - anyone with the URL can use it
2. **Consider adding authentication** if you want to limit access
3. **Monitor usage** to prevent abuse
4. **Set up rate limiting** to prevent spam

## 📊 **Monitoring Usage**

You can monitor who's using your server by checking the logs:

```bash
# In your server terminal, you'll see requests like:
# 127.0.0.1 - - [DATE] "POST /analyze HTTP/1.1" 200 -
```

## 🖥️ **Full Screen Mode Features**

The full screen version provides:
- **Larger interface** - Uses the entire browser window
- **Better layout** - Two-panel design with screenshot and analysis side-by-side
- **Enhanced UX** - Larger buttons, better spacing, more intuitive workflow
- **Responsive design** - Adapts to different screen sizes
- **Professional look** - Modern gradient design with glassmorphism effects

### **Switch Between Modes:**
```bash
# Switch to full screen
./switch_to_fullscreen.sh

# Switch back to regular
./switch_to_regular.sh
```

## 🎯 **Pro Tips**

1. **Test the friend version** yourself first
2. **Share the ngrok URL** in a secure way (not public)
3. **Consider creating multiple versions** for different friends
4. **Keep backups** of your working configurations
5. **Document any custom changes** you make
6. **Use full screen mode** for better user experience

## 🆘 **Common Issues**

| Issue | Solution |
|-------|----------|
| **ngrok ERR_NGROK_4018** | Sign up at [ngrok.com](https://dashboard.ngrok.com/signup) and add your authtoken |
| **ngrok "tunnel not found"** | Make sure ngrok is running and copy the correct URL |
| **Friend can't connect** | Check if your server is running and ngrok is active |
| **Extension loads but doesn't work** | Verify the API_BASE_URL is correct |
| **Images don't analyze** | Check server logs for errors |
| **Slow responses** | Your server might be overloaded |
| **ngrok URL changes** | Free ngrok URLs change on restart - update the friend version |

---

**🎉 That's it! Your friend can now use your AI-powered chart analysis tool!**
