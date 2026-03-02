#!/usr/bin/env python3
"""
Batch Pixel Art Scaling

Process entire directories of pixel art with EPX algorithm.

Usage:
    python3 batch_scale.py input_dir/ output_dir/ --scale 2
    python3 batch_scale.py input_dir/ output_dir/ --scale 2 --double

Requirements:
    pip install Pillow numpy
"""

import argparse
import sys
from pathlib import Path
import time
from scale_epx import scale2x_epx
import numpy as np
from PIL import Image


def process_directory(input_dir: Path, output_dir: Path, scale: int = 2, double: bool = False):
    """
    Process all PNG files in input directory

    Args:
        input_dir: Input directory
        output_dir: Output directory
        scale: Scale factor (2 or 3)
        double: Apply algorithm twice for 4x (only with scale=2)
    """
    # Find all PNG files
    png_files = list(input_dir.glob("*.png"))

    if not png_files:
        print(f"No PNG files found in {input_dir}")
        return

    print(f"Found {len(png_files)} PNG files")
    print(f"Scale: {scale}x" + (" (doubled to 4x)" if double else ""))
    print(f"Output: {output_dir}\n")

    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)

    # Process each file
    success_count = 0
    total_time = 0

    for i, input_path in enumerate(png_files, 1):
        print(f"[{i}/{len(png_files)}] {input_path.name}...", end=" ")

        try:
            start = time.time()

            # Load image
            img = Image.open(input_path)
            if img.mode not in ('RGBA', 'RGB'):
                img = img.convert('RGBA')

            pixels = np.array(img)
            orig_size = f"{pixels.shape[1]}x{pixels.shape[0]}"

            # Apply EPX
            if scale == 2:
                scaled = scale2x_epx(pixels)
                if double:
                    scaled = scale2x_epx(scaled)
                    method = "EPX 4x (2x doubled)"
                else:
                    method = "EPX 2x"
            elif scale == 3:
                from scale_epx import scale3x_epx
                scaled = scale3x_epx(pixels)
                method = "EPX 3x"
                if double:
                    print("Warning: Double mode only works with scale=2, ignoring")
            else:
                raise ValueError(f"Unsupported scale: {scale}")

            # Save
            output_path = output_dir / input_path.name
            output_img = Image.fromarray(scaled)
            output_img.save(
                output_path,
                'PNG',
                optimize=True,
                compress_level=9
            )

            elapsed = time.time() - start
            total_time += elapsed

            new_size = f"{scaled.shape[1]}x{scaled.shape[0]}"
            print(f"✓ {orig_size} → {new_size} ({elapsed*1000:.0f}ms)")

            success_count += 1

        except Exception as e:
            print(f"✗ Failed: {e}")

    # Summary
    print(f"\n{'='*60}")
    print(f"Completed: {success_count}/{len(png_files)} files")
    print(f"Total time: {total_time:.1f}s")
    print(f"Average: {(total_time/len(png_files))*1000:.0f}ms per file")
    print(f"Output directory: {output_dir}")


def main():
    parser = argparse.ArgumentParser(
        description="Batch pixel art upscaling with EPX algorithm",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process all icons at 2x
  python3 batch_scale.py skill-art/ skill-art-2x/ --scale 2

  # Process at 4x (2x applied twice)
  python3 batch_scale.py skill-art/ skill-art-4x/ --scale 2 --double

  # Process at 3x
  python3 batch_scale.py skill-art/ skill-art-3x/ --scale 3

Performance:
  EPX is very fast - expect ~10-20ms per 48x48 icon on modern hardware.
  100 icons typically processes in ~1-2 seconds.
        """
    )

    parser.add_argument(
        'input_dir',
        type=Path,
        help='Input directory containing PNG files'
    )
    parser.add_argument(
        'output_dir',
        type=Path,
        help='Output directory for scaled files'
    )
    parser.add_argument(
        '--scale',
        type=int,
        choices=[2, 3],
        default=2,
        help='Scale factor (default: 2)'
    )
    parser.add_argument(
        '--double',
        action='store_true',
        help='Apply algorithm twice for 4x scaling (only with --scale 2)'
    )

    args = parser.parse_args()

    # Validate
    if not args.input_dir.exists():
        print(f"Error: Input directory not found: {args.input_dir}", file=sys.stderr)
        sys.exit(1)

    if not args.input_dir.is_dir():
        print(f"Error: Input path is not a directory: {args.input_dir}", file=sys.stderr)
        sys.exit(1)

    # Process
    try:
        process_directory(args.input_dir, args.output_dir, args.scale, args.double)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
