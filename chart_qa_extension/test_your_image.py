#!/usr/bin/env python3
"""
Test script using your specific image: plot_1_test.png
"""

import requests
import base64
import io
from PIL import Image
import os

def test_with_your_image():
    """Test the backend with your specific image"""
    base_url = "http://localhost:5001"
    image_path = "/Users/gauravatavale/Documents/AI_research/chartQA_finetuning/plot_1_test.png"
    
    print("🧪 Testing Chart QA Backend with YOUR Image")
    print("=" * 60)
    print(f"Image: {image_path}")
    
    # Check if image exists
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return
    
    print("✅ Image found!")
    
    # Load and convert image to base64
    print("\n1. Loading and processing image...")
    try:
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        # Convert to base64
        img_base64 = base64.b64encode(image_data).decode('utf-8')
        print("✅ Image converted to base64")
        
        # Get image info
        img = Image.open(io.BytesIO(image_data))
        print(f"   Image size: {img.width}x{img.height}")
        print(f"   Image mode: {img.mode}")
        
    except Exception as e:
        print(f"❌ Error loading image: {e}")
        return
    
    # Test questions
    test_questions = [
        "What does this chart show?",
        "What is the title of this chart?",
        "What are the main data points or values shown?",
        "Describe the trend or pattern in this data",
        "What type of chart is this?"
    ]
    
    print(f"\n2. Testing {len(test_questions)} questions...")
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n--- Question {i} ---")
        print(f"Q: {question}")
        
        test_data = {
            "image": img_base64,
            "question": question
        }
        
        try:
            print("   Sending request to server...")
            response = requests.post(
                f"{base_url}/analyze",
                json=test_data,
                timeout=60  # Increased timeout for model processing
            )
            
            if response.status_code == 200:
                result = response.json()
                answer = result.get('answer', 'No answer received')
                print(f"✅ Success!")
                print(f"A: {answer}")
            else:
                print(f"❌ Failed: HTTP {response.status_code}")
                print(f"   Response: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request error: {e}")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 Testing completed!")
    print("\nIf you see successful answers above, your backend is working!")
    print("You can now use the Chrome extension.")

if __name__ == "__main__":
    test_with_your_image()
