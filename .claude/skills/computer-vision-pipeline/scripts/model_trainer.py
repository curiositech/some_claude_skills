#!/usr/bin/env python3
"""
YOLO Model Trainer

Fine-tune YOLOv8 on custom datasets for specialized object detection.
Supports data preparation, training, validation, and export.

Usage:
    python model_trainer.py prepare <images_dir/> <annotations_dir/> <output_dir/>
    python model_trainer.py train <data.yaml> [--model yolov8n.pt] [--epochs 100]
    python model_trainer.py validate <model.pt> <data.yaml>
    python model_trainer.py export <model.pt> [--format onnx]

Examples:
    python model_trainer.py prepare ./images/ ./annotations/ ./dataset/
    python model_trainer.py train dataset.yaml --model yolov8n.pt --epochs 100 --imgsz 640
    python model_trainer.py validate runs/train/exp/weights/best.pt dataset.yaml
    python model_trainer.py export runs/train/exp/weights/best.pt --format onnx
"""

import os
import sys
import argparse
import yaml
import shutil
from pathlib import Path
from typing import Dict, List, Tuple
import json

from ultralytics import YOLO
import cv2


class ModelTrainer:
    """Fine-tune YOLO models on custom datasets"""

    def __init__(self):
        pass

    def prepare_dataset(
        self,
        images_dir: str,
        annotations_dir: str,
        output_dir: str,
        train_split: float = 0.8,
        class_names: List[str] = None
    ) -> str:
        """
        Prepare dataset in YOLO format

        Args:
            images_dir: Directory containing images
            annotations_dir: Directory containing YOLO format labels (.txt)
            output_dir: Output directory for prepared dataset
            train_split: Fraction of data for training (rest for validation)
            class_names: List of class names (if None, infer from annotations)

        Returns:
            Path to generated data.yaml file
        """
        print(f"\n📦 Preparing dataset...")
        print(f"   Images: {images_dir}")
        print(f"   Annotations: {annotations_dir}")
        print(f"   Output: {output_dir}\n")

        # Create directory structure
        train_images = os.path.join(output_dir, 'images', 'train')
        val_images = os.path.join(output_dir, 'images', 'val')
        train_labels = os.path.join(output_dir, 'labels', 'train')
        val_labels = os.path.join(output_dir, 'labels', 'val')

        for dir_path in [train_images, val_images, train_labels, val_labels]:
            os.makedirs(dir_path, exist_ok=True)

        # Get all image files
        image_files = []
        for ext in ['*.jpg', '*.jpeg', '*.png']:
            image_files.extend(Path(images_dir).glob(ext))

        print(f"Found {len(image_files)} images")

        # Infer class names if not provided
        if class_names is None:
            class_names = self._infer_class_names(annotations_dir)
            print(f"Inferred {len(class_names)} classes: {class_names}")

        # Split into train/val
        import random
        random.shuffle(image_files)
        split_idx = int(len(image_files) * train_split)
        train_files = image_files[:split_idx]
        val_files = image_files[split_idx:]

        print(f"\nSplit:")
        print(f"  Train: {len(train_files)} images")
        print(f"  Val: {len(val_files)} images\n")

        # Copy files
        for image_path in train_files:
            # Copy image
            shutil.copy(image_path, train_images)

            # Copy label
            label_path = Path(annotations_dir) / f"{image_path.stem}.txt"
            if label_path.exists():
                shutil.copy(label_path, train_labels)

        for image_path in val_files:
            shutil.copy(image_path, val_images)
            label_path = Path(annotations_dir) / f"{image_path.stem}.txt"
            if label_path.exists():
                shutil.copy(label_path, val_labels)

        # Create data.yaml
        data_yaml = {
            'path': os.path.abspath(output_dir),
            'train': 'images/train',
            'val': 'images/val',
            'names': {i: name for i, name in enumerate(class_names)}
        }

        yaml_path = os.path.join(output_dir, 'data.yaml')
        with open(yaml_path, 'w') as f:
            yaml.dump(data_yaml, f)

        print(f"✅ Dataset prepared: {output_dir}")
        print(f"   Config: {yaml_path}\n")

        return yaml_path

    def train(
        self,
        data_yaml: str,
        model: str = 'yolov8n.pt',
        epochs: int = 100,
        imgsz: int = 640,
        batch: int = 16,
        patience: int = 50,
        device: str = '0'
    ) -> Dict:
        """
        Train YOLO model

        Args:
            data_yaml: Path to data.yaml config
            model: Base model to fine-tune
            epochs: Number of training epochs
            imgsz: Image size for training
            batch: Batch size
            patience: Early stopping patience
            device: GPU device (0, 1, ...) or 'cpu'

        Returns:
            Training results dictionary
        """
        print(f"\n🏋️ Training model...")
        print(f"   Base model: {model}")
        print(f"   Data: {data_yaml}")
        print(f"   Epochs: {epochs}")
        print(f"   Image size: {imgsz}")
        print(f"   Batch size: {batch}\n")

        # Load model
        yolo_model = YOLO(model)

        # Train
        results = yolo_model.train(
            data=data_yaml,
            epochs=epochs,
            imgsz=imgsz,
            batch=batch,
            patience=patience,
            device=device,
            project='runs/train',
            name='exp',
            exist_ok=True,
            verbose=True
        )

        print(f"\n✅ Training complete")
        print(f"   Best weights: runs/train/exp/weights/best.pt")
        print(f"   Last weights: runs/train/exp/weights/last.pt\n")

        return results

    def validate(
        self,
        model_path: str,
        data_yaml: str,
        imgsz: int = 640,
        batch: int = 16
    ) -> Dict:
        """
        Validate trained model

        Args:
            model_path: Path to trained model weights
            data_yaml: Path to data.yaml config
            imgsz: Image size for validation
            batch: Batch size

        Returns:
            Validation metrics
        """
        print(f"\n🔍 Validating model...")
        print(f"   Model: {model_path}")
        print(f"   Data: {data_yaml}\n")

        model = YOLO(model_path)

        # Validate
        metrics = model.val(
            data=data_yaml,
            imgsz=imgsz,
            batch=batch,
            verbose=True
        )

        print(f"\n✅ Validation complete")
        print(f"\nMetrics:")
        print(f"   mAP50: {metrics.box.map50:.4f}")
        print(f"   mAP50-95: {metrics.box.map:.4f}")
        print(f"   Precision: {metrics.box.mp:.4f}")
        print(f"   Recall: {metrics.box.mr:.4f}\n")

        # Per-class metrics
        print("Per-class AP50:")
        for i, ap in enumerate(metrics.box.ap50):
            print(f"   Class {i}: {ap:.4f}")

        return metrics

    def export(
        self,
        model_path: str,
        format: str = 'onnx',
        imgsz: int = 640
    ) -> str:
        """
        Export model to different format

        Args:
            model_path: Path to trained model weights
            format: Export format (onnx, torchscript, coreml, tflite, etc.)
            imgsz: Image size for exported model

        Returns:
            Path to exported model
        """
        print(f"\n📦 Exporting model...")
        print(f"   Model: {model_path}")
        print(f"   Format: {format}")
        print(f"   Image size: {imgsz}\n")

        model = YOLO(model_path)

        # Export
        export_path = model.export(
            format=format,
            imgsz=imgsz
        )

        print(f"\n✅ Export complete")
        print(f"   Exported to: {export_path}\n")

        return export_path

    def _infer_class_names(self, annotations_dir: str) -> List[str]:
        """Infer class names from annotation files"""
        class_ids = set()

        for label_file in Path(annotations_dir).glob('*.txt'):
            with open(label_file, 'r') as f:
                for line in f:
                    parts = line.strip().split()
                    if parts:
                        class_ids.add(int(parts[0]))

        # Generate default names
        return [f'class_{i}' for i in sorted(class_ids)]

    def create_annotation_template(
        self,
        image_path: str,
        output_path: str,
        class_id: int = 0
    ):
        """
        Create annotation template for an image

        YOLO format: <class_id> <x_center> <y_center> <width> <height>
        All values normalized to [0, 1]

        Args:
            image_path: Path to image
            output_path: Path to save annotation .txt
            class_id: Default class ID
        """
        # Read image to get dimensions
        img = cv2.imread(image_path)
        h, w = img.shape[:2]

        # Example annotation (centered box, 50% of image)
        x_center = 0.5
        y_center = 0.5
        width = 0.5
        height = 0.5

        annotation = f"{class_id} {x_center} {y_center} {width} {height}\n"

        with open(output_path, 'w') as f:
            f.write(annotation)

        print(f"Created annotation template: {output_path}")
        print(f"  Format: class_id x_center y_center width height")
        print(f"  Example: {annotation.strip()}")


def main():
    parser = argparse.ArgumentParser(description='Train custom YOLO models')
    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # Prepare command
    prepare_parser = subparsers.add_parser('prepare', help='Prepare dataset in YOLO format')
    prepare_parser.add_argument('images_dir', help='Directory containing images')
    prepare_parser.add_argument('annotations_dir', help='Directory containing YOLO annotations')
    prepare_parser.add_argument('output_dir', help='Output directory for prepared dataset')
    prepare_parser.add_argument('--train-split', type=float, default=0.8, help='Train split ratio')
    prepare_parser.add_argument('--classes', nargs='+', help='Class names')

    # Train command
    train_parser = subparsers.add_parser('train', help='Train YOLO model')
    train_parser.add_argument('data_yaml', help='Path to data.yaml config')
    train_parser.add_argument('--model', default='yolov8n.pt', help='Base model to fine-tune')
    train_parser.add_argument('--epochs', type=int, default=100, help='Number of epochs')
    train_parser.add_argument('--imgsz', type=int, default=640, help='Image size')
    train_parser.add_argument('--batch', type=int, default=16, help='Batch size')
    train_parser.add_argument('--patience', type=int, default=50, help='Early stopping patience')
    train_parser.add_argument('--device', default='0', help='GPU device (0, 1, ...) or cpu')

    # Validate command
    validate_parser = subparsers.add_parser('validate', help='Validate trained model')
    validate_parser.add_argument('model', help='Path to trained model weights')
    validate_parser.add_argument('data_yaml', help='Path to data.yaml config')
    validate_parser.add_argument('--imgsz', type=int, default=640, help='Image size')
    validate_parser.add_argument('--batch', type=int, default=16, help='Batch size')

    # Export command
    export_parser = subparsers.add_parser('export', help='Export trained model')
    export_parser.add_argument('model', help='Path to trained model weights')
    export_parser.add_argument('--format', default='onnx', help='Export format')
    export_parser.add_argument('--imgsz', type=int, default=640, help='Image size')

    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        sys.exit(1)

    trainer = ModelTrainer()

    if args.command == 'prepare':
        trainer.prepare_dataset(
            args.images_dir,
            args.annotations_dir,
            args.output_dir,
            train_split=args.train_split,
            class_names=args.classes
        )

    elif args.command == 'train':
        trainer.train(
            args.data_yaml,
            model=args.model,
            epochs=args.epochs,
            imgsz=args.imgsz,
            batch=args.batch,
            patience=args.patience,
            device=args.device
        )

    elif args.command == 'validate':
        trainer.validate(
            args.model,
            args.data_yaml,
            imgsz=args.imgsz,
            batch=args.batch
        )

    elif args.command == 'export':
        trainer.export(
            args.model,
            format=args.format,
            imgsz=args.imgsz
        )


if __name__ == '__main__':
    main()
