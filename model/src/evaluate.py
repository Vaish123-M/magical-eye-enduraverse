"""
Evaluation script — computes accuracy, precision, recall, F1, and confusion matrix
on the test split. Generates results.md with metrics and confusion matrix plot.

Usage:
    python model/src/evaluate.py --weights model/weights/best_model.pth --data_dir dataset/splits
"""
# pyright: reportMissingImports=false
import argparse
import json
from pathlib import Path
from datetime import datetime
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from sklearn.metrics import classification_report, confusion_matrix  # type: ignore
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from model.architectures.defect_cnn import DefectClassifier


def evaluate(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Evaluating on {device}")
    
    tf = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    
    test_path = Path(args.data_dir) / "test"
    if not test_path.exists():
        print(f"Error: Test directory {test_path} does not exist. Please prepare dataset first.")
        return
    
    ds = datasets.ImageFolder(str(test_path), transform=tf)
    dl = DataLoader(ds, batch_size=32, shuffle=False, num_workers=4)
    
    print(f"Test set size: {len(ds)} images across {len(ds.classes)} classes")

    model = DefectClassifier(num_classes=2, pretrained=False).to(device)
    model.load_state_dict(torch.load(args.weights, map_location=device))
    model.eval()

    all_preds, all_labels, all_probs = [], [], []
    with torch.no_grad():
        for images, labels in dl:
            images = images.to(device)
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)
            preds = outputs.argmax(dim=1).cpu().numpy()
            all_preds.extend(preds)
            all_labels.extend(labels.numpy())
            all_probs.extend(probs.cpu().numpy())

    # Generate classification report
    report = classification_report(all_labels, all_preds, target_names=ds.classes, output_dict=True)
    cm = confusion_matrix(all_labels, all_preds)
    
    # Print report
    print("\n" + "="*60)
    print("CLASSIFICATION REPORT")
    print("="*60)
    print(classification_report(all_labels, all_preds, target_names=ds.classes))
    
    # Calculate overall accuracy
    accuracy = np.mean(np.array(all_preds) == np.array(all_labels))
    
    # Plot confusion matrix
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=ds.classes, yticklabels=ds.classes)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    
    cm_path = Path(args.save_dir) / "confusion_matrix.png"
    cm_path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(cm_path, dpi=150, bbox_inches='tight')
    print(f"Confusion matrix saved to {cm_path}")
    plt.close()
    
    # Save results to JSON
    results = {
        "timestamp": datetime.utcnow().isoformat(),
        "dataset_size": len(ds),
        "num_classes": len(ds.classes),
        "classes": ds.classes,
        "accuracy": float(accuracy),
        "classification_report": report,
        "confusion_matrix": cm.tolist()
    }
    
    json_path = Path(args.save_dir) / "eval_results.json"
    json_path.write_text(json.dumps(results, indent=2))
    print(f"Results saved to {json_path}")
    
    # Generate results.md
    md_content = f"""# Model Evaluation Results

**Date:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}
**Dataset Size:** {len(ds)} images
**Classes:** {', '.join(ds.classes)}

## Overall Metrics

- **Accuracy:** {accuracy:.4f} ({accuracy*100:.2f}%)

## Per-Class Metrics

| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
"""
    for class_name in ds.classes:
        metrics = report[class_name]
        md_content += f"| {class_name} | {metrics['precision']:.4f} | {metrics['recall']:.4f} | {metrics['f1-score']:.4f} | {int(metrics['support'])} |\n"
    
    md_content += f"""
## Confusion Matrix

![Confusion Matrix](confusion_matrix.png)

```
{cm}
```

## Macro and Weighted Averages

| Metric | Macro Avg | Weighted Avg |
|--------|-----------|-------------|
| Precision | {report['macro avg']['precision']:.4f} | {report['weighted avg']['precision']:.4f} |
| Recall | {report['macro avg']['recall']:.4f} | {report['weighted avg']['recall']:.4f} |
| F1-Score | {report['macro avg']['f1-score']:.4f} | {report['weighted avg']['f1-score']:.4f} |
"""
    
    md_path = Path(args.save_dir) / "results.md"
    md_path.write_text(md_content)
    print(f"Markdown report saved to {md_path}")
    
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", default="model/weights/best_model.pth")
    parser.add_argument("--data_dir", default="dataset/splits")
    parser.add_argument("--save_dir", default="model/weights")
    evaluate(parser.parse_args())
