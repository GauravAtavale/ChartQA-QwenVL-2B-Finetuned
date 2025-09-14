#!/usr/bin/env python3
"""
Test script to verify the extension backend is working
"""

import requests
import base64
import io
from PIL import Image, ImageDraw

def create_test_chart():
    """Create a simple test chart image"""
    # Create a simple bar chart
    img = Image.new('RGB', (400, 300), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw axes
    draw.line([(50, 250), (350, 250)], fill='black', width=2)  # X-axis
    draw.line([(50, 50), (50, 250)], fill='black', width=2)   # Y-axis
    
    # Draw bars
    bars = [60, 120, 80, 150, 100]  # Heights
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May']
    
    for i, (height, label) in enumerate(zip(bars, labels)):
        x = 80 + i * 50
        y = 250 - height
        width = 30
        
        # Draw bar
        draw.rectangle([x, y, x + width, 250], fill='blue')
        
        # Draw label
        draw.text((x + 5, 255), label, fill='black')
    
    # Add title
    draw.text((150, 20), "Monthly Sales", fill='black')
    
    return img

def test_backend():
    """Test the backend with a simple chart"""
    base_url = "http://localhost:5001"
    
    print("🧪 Testing Chart QA Backend with Sample Chart")
    print("=" * 50)
    
    # Create test image
    print("1. Creating test chart...")
    test_img = create_test_chart()
    
    # Convert to base64
    img_buffer = io.BytesIO()
    test_img.save(img_buffer, format='PNG')
    img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
    print("✅ Test chart created")
    
    # Test questions
    test_questions = [
        "What does this chart show?",
        "What is the highest value?",
        "Which month has the lowest sales?",
        "Describe the trend in this data"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n{i}. Testing question: '{question}'")
        
        test_data = {
            "image": img_base64,
            "question": question
        }
        
        try:
            response = requests.post(
                f"{base_url}/analyze",
                json=test_data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success!")
                print(f"   Answer: {result.get('answer', 'N/A')}")
            else:
                print(f"❌ Failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Backend testing completed!")

if __name__ == "__main__":
    test_backend()
