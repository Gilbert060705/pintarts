import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import requests
from io import BytesIO

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def generate_initial_taste_vector(preferences):
    prompt = f"A painting style that is {', '.join(preferences)}"
    inputs = processor(text=[prompt], return_tensors="pt", padding=True)

    with torch.no_grad():
        outputs = model.text_model(**inputs)
        text_features = outputs.pooler_output
        # Normalize the features
        text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)
    
    return text_features.squeeze().tolist()

def get_text_embedding(query):
    inputs = processor(text=[query], return_tensors="pt", padding=True, truncation=True)

    with torch.no_grad():
        outputs = model.text_model(**inputs)
        text_features = outputs.pooler_output
        # Normalize the features
        text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)
    
    return text_features.squeeze().tolist()

def get_image_embedding(image_url):
    """
    Generate embedding for an image from URL using CLIP vision encoder
    Projects to 512 dimensions to match text embeddings
    
    Args:
        image_url: URL of the image to embed
        
    Returns:
        List of floats representing the image embedding (512 dimensions)
    """
    try:
        # Download image from URL
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        
        # Open image
        image = Image.open(BytesIO(response.content)).convert("RGB")
        
        # Process image with CLIP
        inputs = processor(images=image, return_tensors="pt")
        
        with torch.no_grad():
            # Get image features in the shared embedding space (512 dims)
            outputs = model.get_image_features(**inputs)
            
            # Handle both tensor and model output formats
            if hasattr(outputs, 'pooler_output'):
                image_features = outputs.pooler_output
            elif isinstance(outputs, torch.Tensor):
                image_features = outputs
            else:
                # Fallback: try to convert to tensor
                image_features = torch.tensor(outputs)
            
            # Normalize the features
            image_features = image_features / torch.norm(image_features, p=2, dim=-1, keepdim=True)
        
        return image_features.squeeze().tolist()
        
    except Exception as e:
        raise Exception(f"Failed to generate image embedding: {str(e)}")