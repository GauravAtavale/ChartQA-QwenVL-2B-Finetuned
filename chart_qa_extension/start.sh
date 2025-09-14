#!/bin/bash

echo "🚀 Starting Chart QA Extension Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Please run this script from the chart_qa_extension directory"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed or not in PATH"
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed or not in PATH"
    exit 1
fi

echo "✅ Python and pip are available"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Start the backend server
echo "🌐 Starting backend server..."
echo "The server will start on http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo "=================================="

python3 start_server.py
