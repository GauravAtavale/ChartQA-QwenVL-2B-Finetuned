#!/usr/bin/env python3
"""
Startup script for the Chart QA backend server
"""

import os
import sys
import subprocess
import time

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import torch
        import transformers
        import peft
        import flask
        import flask_cors
        from PIL import Image
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please install requirements: pip install -r requirements.txt")
        return False

def main():
    print("🚀 Starting Chart QA Backend Server...")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check if model files exist
    model_path = "/Users/gauravatavale/Documents/AI_research/chartQA_finetuning/lora_model_8k"
    if not os.path.exists(model_path):
        print(f"❌ Model path not found: {model_path}")
        print("Please ensure your fine-tuned model is available at this location")
        sys.exit(1)
    
    print(f"✅ Model path found: {model_path}")
    
    # Start the Flask server
    print("\n🌐 Starting Flask server on http://localhost:5001")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        # Import and run the app
        from app import app, load_model
        
        if load_model():
            app.run(host='0.0.0.0', port=5001, debug=False)
        else:
            print("❌ Failed to load model")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
