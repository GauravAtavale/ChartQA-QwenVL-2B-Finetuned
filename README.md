# Multimodal-Reasoning-Pipeline
A model that shows you possible questions when you upload an image and a title



Idea is when I upload an image and a title, It should prompt top 10 questions i can ask and get answers from


Datasets and use cases that can be used are as follows:

1. DocVQA Dataset - 
https://www.docvqa.org/datasets

Use Case: Extracting information from documents, invoices, forms, and scanned papers by answering 
questions about their content

2. ChartQA dataset - Chart and graph comprehension
dataset link
https://huggingface.co/datasets/HuggingFaceM4/ChartQA



Notes to self:
Most likely be finalizing working on ChartQA dataset. This is amazing since this is what we need in industry the most - any company any team

(Sept 8th)
Progress so far by steps:

1. Load the data
used the chartqa dataset from- HuggingFaceM4/ChartQA
2. Format the data into image, messages format to give instruction
3. Load the model
Using the Qwen/Qwen2-VL-2B-Instruct instruct moedl due to the size of it.
# Load model with 4-bit quantization for memory efficiency
model = Qwen2VLForConditionalGeneration.from_pretrained(
    model_id,
    device_map=None,
    torch_dtype=torch.bfloat16 if device == "cuda" else torch.float32,  # Fallback to float32 for CPU
).to("mps")
4. config lora and define trainable params -  take care of the lm_head_weight issue
5. Use sfttrainer and train the model

(Sept 9th)
Progress so far:

- fixed the lm.weight issue -- explicitely added as param to be trained
- Tested inference with dummy images
- Fine-tuned with 2 images as a test
-  saved models and adapters

(Sept 11th)
Progress so far:
Running models on Kaggle

(Sept 12th)
Progress so far:
- Unsloth is the fastest way to train VL models on Kaggle
- I figured uot a way to get the lora merged with base model - works perfectly fine
- Next step build a model inference pipeline

(Sept 13th)
Progress so far:
- Uploaded the SFT notebook
- Have a separate notebook for inference
- I can upload the training and inference as a single py file
- Also have a chrome extension ready






