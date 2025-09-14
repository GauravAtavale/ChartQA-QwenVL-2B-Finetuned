#!/usr/bin/env python3
"""
Create simple placeholder icons for the Chrome extension
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """Create a simple icon with the specified size"""
    # Create a new image with a gradient background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a circular background
    margin = size // 8
    draw.ellipse([margin, margin, size-margin, size-margin], 
                fill=(102, 126, 234, 255), outline=(118, 75, 162, 255), width=2)
    
    # Draw a chart icon
    chart_size = size // 3
    chart_x = (size - chart_size) // 2
    chart_y = (size - chart_size) // 2
    
    # Draw bars representing a chart
    bar_width = chart_size // 6
    bar_spacing = bar_width // 2
    
    bars = [0.3, 0.7, 0.5, 0.9, 0.6, 0.4]  # Heights as fractions
    for i, height in enumerate(bars):
        x = chart_x + i * (bar_width + bar_spacing)
        bar_height = int(chart_size * height)
        y = chart_y + chart_size - bar_height
        
        draw.rectangle([x, y, x + bar_width, chart_y + chart_size], 
                      fill=(255, 255, 255, 255))
    
    # Save the icon
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

def main():
    """Create all required icon sizes"""
    icons_dir = "icons"
    os.makedirs(icons_dir, exist_ok=True)
    
    # Create icons in different sizes
    create_icon(16, os.path.join(icons_dir, "icon16.png"))
    create_icon(48, os.path.join(icons_dir, "icon48.png"))
    create_icon(128, os.path.join(icons_dir, "icon128.png"))
    
    print("✅ All icons created successfully!")

if __name__ == "__main__":
    main()
