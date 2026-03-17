"""
Exports a trained PyTorch model to ONNX for optimised server-side inference.

Usage:
    python model/src/export_onnx.py --weights model/weights/best_model.pth \
                                     --out     model/exports/defect_model.onnx
"""
# pyright: reportMissingImports=false
import argparse
import torch
from model.architectures.defect_cnn import DefectClassifier


def export(args):
    model = DefectClassifier(num_classes=args.num_classes, pretrained=False)
    model.load_state_dict(torch.load(args.weights, map_location="cpu"))
    model.eval()

    dummy = torch.randn(1, 3, 224, 224)
    torch.onnx.export(
        model,
        dummy,
        args.out,
        opset_version=17,
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={"input": {0: "batch_size"}, "logits": {0: "batch_size"}},
    )
    print(f"Exported ONNX model → {args.out}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights",     default="model/weights/best_model.pth")
    parser.add_argument("--out",         default="model/exports/defect_model.onnx")
    parser.add_argument("--num_classes", type=int, default=6)
    export(parser.parse_args())
