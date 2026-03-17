"""
Data preprocessing — resizes, augments, and splits raw images into
dataset/splits/{train,val,test} folders in ImageFolder format.

Usage:
    python model/src/preprocess.py --raw_dir dataset/raw \
                                    --out_dir dataset/splits
"""
# pyright: reportMissingImports=false
import argparse
import shutil
from pathlib import Path
from sklearn.model_selection import train_test_split  # type: ignore
from PIL import Image


SPLIT_RATIOS = (0.7, 0.15, 0.15)   # train / val / test


def preprocess(args):
    raw = Path(args.raw_dir)
    out = Path(args.out_dir)
    classes = [d for d in raw.iterdir() if d.is_dir()]

    for cls in classes:
        images = list(cls.glob("*.jpg")) + list(cls.glob("*.png")) + list(cls.glob("*.jpeg"))
        train_imgs, temp = train_test_split(images, test_size=1 - SPLIT_RATIOS[0], random_state=42)
        val_imgs, test_imgs = train_test_split(temp, test_size=0.5, random_state=42)

        for split_name, split_imgs in [("train", train_imgs), ("val", val_imgs), ("test", test_imgs)]:
            dest = out / split_name / cls.name
            dest.mkdir(parents=True, exist_ok=True)
            for img_path in split_imgs:
                img = Image.open(img_path).convert("RGB").resize((224, 224))
                img.save(dest / img_path.name)

        print(f"{cls.name}: {len(train_imgs)} train / {len(val_imgs)} val / {len(test_imgs)} test")

    print("Preprocessing complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw_dir", default="dataset/raw")
    parser.add_argument("--out_dir", default="dataset/splits")
    preprocess(parser.parse_args())
