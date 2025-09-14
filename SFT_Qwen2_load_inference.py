import torch
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor, TextStreamer
from peft import LoraConfig, get_peft_model, PeftModel
from datasets import load_dataset, Dataset

# Model ID
model_id = "Qwen/Qwen2-VL-2B-Instruct"  # Switched to 2B for lower memory usage

# Check hardware availability
device = "cuda" if torch.cuda.is_available() else "mps"
print(f"Using device: {device}")

# Load processor
processor = AutoProcessor.from_pretrained(
    model_id,
    trust_remote_code=True,  # Required for Qwen models
    # max_length=128  # Limit token length for memory efficiency
)

# Load model with 4-bit quantization for memory efficiency
model = Qwen2VLForConditionalGeneration.from_pretrained(
    model_id,
    device_map=None,
    torch_dtype=torch.bfloat16 if device == "cuda" else torch.float32,  # Fallback to float32 for CPU

).to(device)

# Load and merge LoRA
model = PeftModel.from_pretrained(model, "lora_model_8k") #"lora_model_1k" "lora_model_5k"
merged_model = model.merge_and_unload()

merged_model = merged_model.to(device)
merged_model.eval()  # Set to evaluation mode

# Get data
# Function to convert dataset samples to conversation format
system_message="You are a helpful assistant who can analyze the given images in detail and answer the question appropriately."

def convert_to_conversation(sample):
    conversation = [
        { "role": "user",
          "content" : [
            {"type" : "text",  "text"  : system_message},
            {"type" : "image", "image" : sample["image"]},
              {"type" : "text",  "text"  : sample["query"]}]
        },
        { "role" : "assistant",
          "content" : [
            {"type" : "text",  "text"  : sample["label"]} ]
        },
    ]
    return { "messages" : conversation }

dataset = load_dataset("HuggingFaceM4/ChartQA", split="train", streaming=True) #.select(range(n_samples))
# Take only first `n_samples`
dataset = dataset.take(5)

converted_dataset = [convert_to_conversation(sample) for sample in dataset]


def model_inference(img,user_q):
    msg = [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "You are a helpful assistant who can analyze the given images in detail and answer the question appropriately."},
          {"type": "image", "image": img},
          {"type": "text", "text": user_q}
        ]
      }
    ]
    
    # Apply chat template to format the messages
    text = processor.apply_chat_template(
        msg,
        tokenize=False,
        add_generation_prompt=True  # Add the assistant prompt for generation
    )
    
    inputs = processor(
        image,
        text,
        add_special_tokens = False,
        return_tensors = "pt",
    ).to(device)
    
    text_streamer = TextStreamer(processor.tokenizer, skip_prompt = True)
    _ = model.generate(**inputs, streamer = text_streamer, max_new_tokens = 128,
                       use_cache = True, temperature = 1.5, min_p = 0.1)
    

# inference on a sample
from matplotlib import pyplot as plt

n_example = 1

image = converted_dataset[n_example]['messages'][0]['content'][1]['image']
user_query = converted_dataset[n_example]['messages'][0]['content'][2]['text']

#show image and User query
# image.show()
plt.imshow(image)
print(f"User Query: {user_query}")

model_inference(image,user_query)