"""
Grad-CAM visualization for model explainability.
Shows which regions of the image contributed to the defect classification.

Usage:
    python model/src/gradcam.py --weights model/weights/best_model.pth --image_path dataset/raw/porosity/sample.jpg
"""
# pyright: reportMissingImports=false
import argparse
from pathlib import Path

import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from torchvision import transforms

from model.architectures.defect_cnn import DefectClassifier


class GradCAM:
    """Grad-CAM implementation for CNN explainability."""
    
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        # Register hooks
        self.target_layer.register_forward_hook(self.save_activation)
        self.target_layer.register_backward_hook(self.save_gradient)
    
    def save_activation(self, module, input, output):
        self.activations = output
    
    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]
    
    def generate_cam(self, input_tensor, target_class=None):
        """Generate Class Activation Map."""
        # Forward pass
        output = self.model(input_tensor)
        
        if target_class is None:
            target_class = output.argmax(dim=1).item()
        
        # Backward pass
        self.model.zero_grad()
        output[0, target_class].backward(retain_graph=True)
        
        # Get gradients and activations
        gradients = self.gradients[0]  # [channels, h, w]
        activations = self.activations[0]  # [channels, h, w]
        
        # Global average pooling of gradients
        weights = gradients.mean(dim=(1, 2))  # [channels]
        
        # Weighted combination of activations
        cam = torch.zeros(activations.shape[1:], dtype=torch.float32)
        for i, w in enumerate(weights):
            cam += w * activations[i]
        
        # ReLU and normalize
        cam = F.relu(cam)
        cam = cam - cam.min()
        cam = cam / (cam.max() + 1e-8)
        
        return cam.cpu().numpy(), target_class


def visualize_gradcam(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Load model
    model = DefectClassifier(num_classes=4, pretrained=False).to(device)
    model.load_state_dict(torch.load(args.weights, map_location=device))
    model.eval()
    
    # Get target layer (last convolutional layer before classifier)
    # For ResNet-based architecture, this is typically layer4
    target_layer = None
    for name, module in model.named_modules():
        if 'layer4' in name or 'features.8' in name:  # Common locations
            target_layer = module
            break
    
    if target_layer is None:
        # Fallback: find the last Conv2d layer
        for name, module in reversed(list(model.named_modules())):
            if isinstance(module, torch.nn.Conv2d):
                target_layer = module
                break
    
    if target_layer is None:
        print("Error: Could not find suitable target layer for Grad-CAM")
        return
    
    gradcam = GradCAM(model, target_layer)
    
    # Load and preprocess image
    image_path = Path(args.image_path)
    if not image_path.exists():
        print(f"Error: Image {image_path} does not exist")
        return
    
    original_image = Image.open(image_path).convert('RGB')
    
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    
    input_tensor = transform(original_image).unsqueeze(0).to(device)
    
    # Generate Grad-CAM
    cam, predicted_class = gradcam.generate_cam(input_tensor)
    
    # Resize CAM to match image size
    cam_resized = Image.fromarray((cam * 255).astype(np.uint8)).resize((224, 224), Image.BILINEAR)
    cam_resized = np.array(cam_resized) / 255.0
    
    # Create visualization
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    
    # Original image
    axes[0].imshow(original_image.resize((224, 224)))
    axes[0].set_title('Original Image')
    axes[0].axis('off')
    
    # Grad-CAM heatmap
    axes[1].imshow(cam_resized, cmap='jet')
    axes[1].set_title('Grad-CAM Heatmap')
    axes[1].axis('off')
    
    # Overlay
    overlay = original_image.resize((224, 224))
    overlay_array = np.array(overlay)
    heatmap = plt.cm.jet(cam_resized)[:, :, :3]
    overlay_array = 0.6 * overlay_array / 255.0 + 0.4 * heatmap
    axes[2].imshow(overlay_array)
    axes[2].set_title(f'Overlay (Pred: {predicted_class})')
    axes[2].axis('off')
    
    plt.tight_layout()
    
    # Save visualization
    output_path = Path(args.save_dir) / f"gradcam_{image_path.stem}.png"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"Grad-CAM visualization saved to {output_path}")
    plt.close()
    
    print(f"Predicted class: {predicted_class}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", default="model/weights/best_model.pth")
    parser.add_argument("--image_path", required=True)
    parser.add_argument("--save_dir", default="model/weights/gradcam")
    visualize_gradcam(parser.parse_args())
