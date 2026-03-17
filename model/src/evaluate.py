"""
Evaluation script — computes accuracy, precision, recall, F1, and confusion matrix
on the test split.

Usage:
    python model/src/evaluate.py --weights model/weights/best_model.pth
"""
# pyright: reportMissingImports=false
import argparse
import json
from pathlib import Path

import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from sklearn.metrics import classification_report, confusion_matrix  # type: ignore
import numpy as np

from model.architectures.defect_cnn import DefectClassifier


def evaluate(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tf = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    ds = datasets.ImageFolder("dataset/splits/test", transform=tf)
    dl = DataLoader(ds, batch_size=32, shuffle=False, num_workers=4)

    model = DefectClassifier(num_classes=len(ds.classes), pretrained=False).to(device)
    model.load_state_dict(torch.load(args.weights, map_location=device))
    model.eval()

    all_preds, all_labels = [], []
    with torch.no_grad():
        for images, labels in dl:
            images = images.to(device)
            preds  = model(images).argmax(dim=1).cpu().numpy()
            all_preds.extend(preds)
            all_labels.extend(labels.numpy())

    report = classification_report(all_labels, all_preds, target_names=ds.classes, output_dict=True)
    cm     = confusion_matrix(all_labels, all_preds).tolist()

    print(classification_report(all_labels, all_preds, target_names=ds.classes))
    out_path = Path("model/weights/eval_results.json")
    out_path.write_text(json.dumps({"report": report, "confusion_matrix": cm}, indent=2))
    print(f"Results saved to {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", default="model/weights/best_model.pth")
    evaluate(parser.parse_args())
