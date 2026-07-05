"""
Check class distribution in dataset and generate augmentation recommendations.

Usage:
    python model/src/check_imbalance.py --data_dir dataset/raw
"""
# pyright: reportMissingImports=false
import argparse
from pathlib import Path
from collections import Counter
import json

from torchvision import datasets


def check_imbalance(args):
    data_path = Path(args.data_dir)
    if not data_path.exists():
        print(f"Error: Data directory {data_path} does not exist.")
        return
    
    # Load dataset to get class distribution
    try:
        ds = datasets.ImageFolder(str(data_path))
    except Exception as e:
        print(f"Error loading dataset: {e}")
        print("Make sure the dataset is organized as: data_dir/class_name/images...")
        return
    
    # Count samples per class
    class_counts = Counter([ds.classes[i] for i, _ in ds.samples])
    total_samples = len(ds)
    
    print("\n" + "="*60)
    print("CLASS DISTRIBUTION")
    print("="*60)
    print(f"Total samples: {total_samples}")
    print(f"Number of classes: {len(ds.classes)}")
    print()
    
    for class_name in ds.classes:
        count = class_counts[class_name]
        percentage = (count / total_samples) * 100
        print(f"{class_name:15s}: {count:5d} samples ({percentage:5.2f}%)")
    
    # Calculate imbalance ratio
    max_count = max(class_counts.values())
    min_count = min(class_counts.values())
    imbalance_ratio = max_count / min_count if min_count > 0 else float('inf')
    
    print()
    print(f"Imbalance ratio (max/min): {imbalance_ratio:.2f}")
    
    # Generate recommendations
    print("\n" + "="*60)
    print("RECOMMENDATIONS")
    print("="*60)
    
    if imbalance_ratio > 2.0:
        print("⚠️  Significant class imbalance detected (ratio > 2.0)")
        print("Recommendations:")
        print("  1. Use class-weighted loss in training")
        print("  2. Apply data augmentation to minority classes")
        print("  3. Consider oversampling minority classes")
    elif imbalance_ratio > 1.5:
        print("⚡ Moderate class imbalance detected (ratio > 1.5)")
        print("Recommendations:")
        print("  1. Consider class-weighted loss")
        print("  2. Light augmentation for minority classes")
    else:
        print("✅ Class distribution is balanced")
    
    # Calculate class weights for loss function
    print("\n" + "="*60)
    print("CLASS WEIGHTS (for CrossEntropyLoss)")
    print("="*60)
    
    # Inverse frequency weighting
    class_weights = {}
    for class_name in ds.classes:
        count = class_counts[class_name]
        weight = total_samples / (len(ds.classes) * count)
        class_weights[class_name] = round(weight, 4)
    
    for class_name, weight in class_weights.items():
        print(f"{class_name:15s}: {weight}")
    
    # Save results
    results = {
        "total_samples": total_samples,
        "num_classes": len(ds.classes),
        "class_distribution": dict(class_counts),
        "imbalance_ratio": imbalance_ratio,
        "class_weights": class_weights,
        "recommendations": {
            "use_class_weights": imbalance_ratio > 1.5,
            "use_augmentation": imbalance_ratio > 2.0,
            "use_oversampling": imbalance_ratio > 3.0
        }
    }
    
    output_path = Path(args.save_dir) / "class_distribution.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(results, indent=2))
    print(f"\nResults saved to {output_path}")
    
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", default="dataset/raw")
    parser.add_argument("--save_dir", default="model/weights")
    check_imbalance(parser.parse_args())
