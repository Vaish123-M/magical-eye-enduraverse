"""
CNN-based defect classifier.

Architecture: MobileNetV3-Small backbone + custom classification head.
Swap the backbone for EfficientNet-B0 by changing `backbone` below.
"""
# pyright: reportMissingImports=false
import torch
import torch.nn as nn
import torchvision.models as models


class DefectClassifier(nn.Module):
    def __init__(self, num_classes: int = 6, pretrained: bool = True):
        super().__init__()
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        backbone = models.mobilenet_v3_small(weights=weights)
        # Replace final classifier
        in_features = backbone.classifier[-1].in_features
        backbone.classifier[-1] = nn.Linear(in_features, num_classes)
        self.model = backbone

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.model(x)
