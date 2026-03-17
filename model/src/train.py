"""
Training script — fine-tunes DefectClassifier on the prepared dataset.

Usage:
    python model/src/train.py --data_dir dataset/splits --epochs 30 --batch_size 32
"""
# pyright: reportMissingImports=false
import argparse
import json
from pathlib import Path

import torch
from torch import nn, optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

from model.architectures.defect_cnn import DefectClassifier

LABELS = ["OK", "crack", "scratch", "misalignment", "missing_component", "corrosion"]


def get_transforms(split: str):
    if split == "train":
        return transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])
    return transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])


def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on {device}")

    train_ds = datasets.ImageFolder(args.data_dir + "/train", transform=get_transforms("train"))
    val_ds   = datasets.ImageFolder(args.data_dir + "/val",   transform=get_transforms("val"))

    train_dl = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True,  num_workers=4)
    val_dl   = DataLoader(val_ds,   batch_size=args.batch_size, shuffle=False, num_workers=4)

    model = DefectClassifier(num_classes=len(train_ds.classes), pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)

    best_acc = 0.0
    history  = []

    for epoch in range(1, args.epochs + 1):
        model.train()
        running_loss = 0.0
        for images, labels in train_dl:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            loss = criterion(model(images), labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        scheduler.step()

        # ── Validation ──────────────────────────────────────────────────────
        model.eval()
        correct = total = 0
        with torch.no_grad():
            for images, labels in val_dl:
                images, labels = images.to(device), labels.to(device)
                preds = model(images).argmax(dim=1)
                correct += (preds == labels).sum().item()
                total   += labels.size(0)
        acc = correct / total
        history.append({"epoch": epoch, "loss": running_loss / len(train_dl), "val_acc": acc})
        print(f"Epoch {epoch:3d}/{args.epochs} — loss: {history[-1]['loss']:.4f}  val_acc: {acc:.4f}")

        if acc > best_acc:
            best_acc = acc
            Path(args.save_dir).mkdir(parents=True, exist_ok=True)
            torch.save(model.state_dict(), f"{args.save_dir}/best_model.pth")
            print(f"  ↳ Saved best model (acc={best_acc:.4f})")

    with open(f"{args.save_dir}/history.json", "w") as f:
        json.dump(history, f, indent=2)
    print(f"\nTraining complete. Best val accuracy: {best_acc:.4f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir",   default="dataset/splits")
    parser.add_argument("--save_dir",   default="model/weights")
    parser.add_argument("--epochs",     type=int,   default=30)
    parser.add_argument("--batch_size", type=int,   default=32)
    parser.add_argument("--lr",         type=float, default=1e-3)
    train(parser.parse_args())
