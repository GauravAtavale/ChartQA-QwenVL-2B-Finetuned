#!/usr/bin/env python3
"""
Test script for the Chart QA backend
"""

import requests
import base64
import json
from PIL import Image
import io

def create_test_image():
    """Create a simple test image"""
    # Create a simple chart-like image
    img = Image.new('RGB', (400, 300), color='white')
    
    # You could add some chart elements here
    # For now, just return a simple colored rectangle
    return img

def test_backend():
    """Test the backend API"""
    base_url = "http://localhost:5001"
    
    print("🧪 Testing Chart QA Backend")
    print("=" * 40)
    
    # Test 1: Health check
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test 2: Status check
    print("\n2. Testing status endpoint...")
    try:
        response = requests.get(f"{base_url}/status", timeout=5)
        if response.status_code == 200:
            print("✅ Status check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Status check failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Status check failed: {e}")
    
    # Test 3: Create test image
    print("\n3. Creating test image...")
    test_img = create_test_image()
    
    # Convert to base64
    img_buffer = io.BytesIO()
    test_img.save(img_buffer, format='PNG')
    img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
    print("✅ Test image created")
    
    # Test 4: Analyze endpoint
    print("\n4. Testing analyze endpoint...")
    test_data = {
        "image": img_base64,
        "question": "What do you see in this image?"
    }
    
    try:
        response = requests.post(
            f"{base_url}/analyze",
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analysis test passed")
            print(f"   Question: {result.get('question', 'N/A')}")
            print(f"   Answer: {result.get('answer', 'N/A')[:100]}...")
        else:
            print(f"❌ Analysis test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Analysis test failed: {e}")
    
    print("\n" + "=" * 40)
    print("🎉 Backend testing completed!")
    print("\nIf all tests passed, your backend is ready!")
    print("You can now load the Chrome extension and start using it.")

if __name__ == "__main__":
    test_backend()
