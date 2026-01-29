import torch
from transformers import CLIPProcessor, CLIPModel

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def generate_initial_taste_vector(preferences):
    prompt = f"A painting style that is {', '.join(preferences)}"
    inputs = processor(text=[prompt], return_tensors="pt", padding=True)

    with torch.no_grad():
        text_features = model.get_text_features(**inputs)
        text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)
    
    return text_features.squeeze().tolist()

def get_text_embedding(query):
    inputs = processor(text=[query], return_tensors="pt", padding=True, truncation=True)

    with torch.no_grad():
        text_features = model.get_text_features(**inputs)

    text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)
    
    return text_features.squeeze().tolist()