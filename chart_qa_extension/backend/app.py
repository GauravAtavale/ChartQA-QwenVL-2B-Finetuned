#!/usr/bin/env python3
"""
Flask backend server for Chart QA Extension
Serves the fine-tuned Qwen2-VL model for image analysis
"""

import os
import sys
import base64
import io
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import logging
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor, TextStreamer
from peft import PeftModel
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for Chrome extension

# Global variables for model
model = None
processor = None
device = None

def load_model():
    """Load the fine-tuned model and processor"""
    global model, processor, device
    
    try:
        logger.info("Loading model...")
        
        # Model configuration
        model_id = "Qwen/Qwen2-VL-2B-Instruct"
        lora_path = "/Users/gauravatavale/Documents/AI_research/chartQA_finetuning/lora_model_1k"
        
        # Check hardware availability
        device = "cuda" if torch.cuda.is_available() else "mps"
        logger.info(f"Using device: {device}")
        
        # Load processor
        logger.info("Loading processor...")
        processor = AutoProcessor.from_pretrained(
            model_id,
            trust_remote_code=True,
        )
        
        # Load base model
        logger.info("Loading base model...")
        base_model = Qwen2VLForConditionalGeneration.from_pretrained(
            model_id,
            device_map=None,
            torch_dtype=torch.bfloat16 if device == "cuda" else torch.float32,
        ).to(device)
        
        # Load and merge LoRA
        logger.info("Loading LoRA adapter...")
        model_with_lora = PeftModel.from_pretrained(base_model, lora_path)
        model = model_with_lora.merge_and_unload()
        
        model = model.to(device)
        model.eval()
        
        logger.info("Model loaded successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def analyze_image(image_data, question):
    """Analyze image with the loaded model"""
    global model, processor, device
    
    try:
        # Convert base64 to PIL Image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image if it's too large to prevent memory issues
        max_size = 1024  # Maximum width or height
        if image.width > max_size or image.height > max_size:
            # Calculate new size maintaining aspect ratio
            ratio = min(max_size / image.width, max_size / image.height)
            new_width = int(image.width * ratio)
            new_height = int(image.height * ratio)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            logger.info(f"Resized image from {image.width}x{image.height} to {new_width}x{new_height}")
        
        # Prepare conversation format
        system_message = "You are a helpful assistant who can analyze the given images in detail and answer the question appropriately."
        
        msg = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": system_message},
                    {"type": "image", "image": image},
                    {"type": "text", "text": question}
                ]
            }
        ]
        
        # Apply chat template
        text = processor.apply_chat_template(
            msg,
            tokenize=False,
            add_generation_prompt=True
        )
        
        # Process inputs
        inputs = processor(
            image,
            text,
            add_special_tokens=False,
            return_tensors="pt",
        ).to(device)
        
        # Generate response with memory optimization
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=64,  # Reduced from 128 to save memory
                use_cache=True,
                temperature=1.0,    # Reduced from 1.5
                do_sample=True,
                pad_token_id=processor.tokenizer.eos_token_id,
                num_beams=1,        # Use greedy decoding to save memory
                early_stopping=True
            )
        
        # Decode response
        response_text = processor.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the assistant's response
        if "assistant" in response_text.lower():
            # Find the assistant's response after the prompt
            parts = response_text.split("assistant")
            if len(parts) > 1:
                response_text = parts[-1].strip()
        
        return response_text.strip()
        
    except Exception as e:
        logger.error(f"Error analyzing image: {str(e)}")
        logger.error(traceback.format_exc())
        raise e

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'device': device
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    """Main analysis endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        image_data = data.get('image')
        question = data.get('question')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        if not question:
            return jsonify({'error': 'No question provided'}), 400
        
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        logger.info(f"Analyzing image with question: {question}")
        
        # Analyze the image
        answer = analyze_image(image_data, question)
        
        return jsonify({
            'success': True,
            'answer': answer,
            'question': question
        })
        
    except Exception as e:
        logger.error(f"Error in analyze endpoint: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/status', methods=['GET'])
def status():
    """Get model status"""
    return jsonify({
        'model_loaded': model is not None,
        'processor_loaded': processor is not None,
        'device': device,
        'model_id': "Qwen/Qwen2-VL-2B-Instruct" if model else None
    })

if __name__ == '__main__':
    logger.info("Starting Chart QA Backend Server...")
    
    # Load model on startup
    if load_model():
        logger.info("Server ready!")
        app.run(host='0.0.0.0', port=5001, debug=False)
    else:
        logger.error("Failed to load model. Exiting.")
        sys.exit(1)
