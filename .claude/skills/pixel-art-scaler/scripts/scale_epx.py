#!/usr/bin/env python3
"""
EPX/Scale2x Pixel Art Upscaling

Eric's Pixel Expansion algorithm - fast, deterministic pixel art scaling
that preserves sharp edges and only uses original palette colors.

Usage:
    python3 scale_epx.py input.png output.png --scale 2
    python3 scale_epx.py input.png output.png --scale 3

Requirements:
    pip install Pillow numpy
"""

import argparse
import sys
from pathlib import Path
import numpy as np
from PIL import Image


def scale2x_epx(pixels: np.ndarray) -> np.ndarray:
    """
    EPX/Scale2x algorithm - 2x upscaling

    For each pixel P with neighbors:
        A
      C P B
        D

    Output 2x2 block:
      P1 P2
      P3 P4

    Rules:
      P1 = (C == A and C != D and A != B) ? A : P
      P2 = (A == B and A != C and B != D) ? B : P
      P3 = (D == C and D != B and C != A) ? C : P
      P4 = (B == D and B != A and D != C) ? D : P
    """
    height, width = pixels.shape[:2]
    has_alpha = pixels.shape[2] == 4

    # Create output array (2x size)
    output = np.zeros((height * 2, width * 2, pixels.shape[2]), dtype=pixels.dtype)

    for y in range(height):
        for x in range(width):
            # Get center pixel
            P = pixels[y, x]

            # Get neighbors (with boundary handling)
            A = pixels[y - 1, x] if y > 0 else P
            B = pixels[y, x + 1] if x < width - 1 else P
            C = pixels[y, x - 1] if x > 0 else P
            D = pixels[y + 1, x] if y < height - 1 else P

            # Output 2x2 block positions
            out_y = y * 2
            out_x = x * 2

            # Apply EPX rules
            # P1 (top-left)
            if np.array_equal(C, A) and not np.array_equal(C, D) and not np.array_equal(A, B):
                output[out_y, out_x] = A
            else:
                output[out_y, out_x] = P

            # P2 (top-right)
            if np.array_equal(A, B) and not np.array_equal(A, C) and not np.array_equal(B, D):
                output[out_y, out_x + 1] = B
            else:
                output[out_y, out_x + 1] = P

            # P3 (bottom-left)
            if np.array_equal(D, C) and not np.array_equal(D, B) and not np.array_equal(C, A):
                output[out_y + 1, out_x] = C
            else:
                output[out_y + 1, out_x] = P

            # P4 (bottom-right)
            if np.array_equal(B, D) and not np.array_equal(B, A) and not np.array_equal(D, C):
                output[out_y + 1, out_x + 1] = D
            else:
                output[out_y + 1, out_x + 1] = P

    return output


def scale3x_epx(pixels: np.ndarray) -> np.ndarray:
    """
    Scale3x algorithm - 3x upscaling

    Similar logic to Scale2x but outputs 3x3 block per pixel.
    Uses the same neighbor pattern but with 9 output positions.
    """
    height, width = pixels.shape[:2]
    output = np.zeros((height * 3, width * 3, pixels.shape[2]), dtype=pixels.dtype)

    for y in range(height):
        for x in range(width):
            P = pixels[y, x]

            # Get neighbors
            A = pixels[y - 1, x] if y > 0 else P
            B = pixels[y, x + 1] if x < width - 1 else P
            C = pixels[y, x - 1] if x > 0 else P
            D = pixels[y + 1, x] if y < height - 1 else P

            # Diagonal neighbors for Scale3x
            E = pixels[y - 1, x - 1] if y > 0 and x > 0 else P
            F = pixels[y - 1, x + 1] if y > 0 and x < width - 1 else P
            G = pixels[y + 1, x - 1] if y < height - 1 and x > 0 else P
            H = pixels[y + 1, x + 1] if y < height - 1 and x < width - 1 else P

            out_y = y * 3
            out_x = x * 3

            # Scale3x rules (simplified version)
            # Row 0
            output[out_y, out_x] = A if np.array_equal(C, A) else P
            output[out_y, out_x + 1] = A if np.array_equal(A, B) or np.array_equal(A, C) else P
            output[out_y, out_x + 2] = B if np.array_equal(A, B) else P

            # Row 1 (middle)
            output[out_y + 1, out_x] = C if np.array_equal(C, A) or np.array_equal(C, D) else P
            output[out_y + 1, out_x + 1] = P  # Center is always P
            output[out_y + 1, out_x + 2] = B if np.array_equal(B, A) or np.array_equal(B, D) else P

            # Row 2
            output[out_y + 2, out_x] = C if np.array_equal(C, D) else P
            output[out_y + 2, out_x + 1] = D if np.array_equal(D, B) or np.array_equal(D, C) else P
            output[out_y + 2, out_x + 2] = D if np.array_equal(B, D) else P

    return output


def scale_epx(input_path: Path, output_path: Path, scale: int = 2):
    """
    Scale pixel art using EPX/Scale2x/Scale3x algorithm

    Args:
        input_path: Input PNG file
        output_path: Output PNG file
        scale: Scale factor (2 or 3)
    """
    # Load image
    img = Image.open(input_path)

    # Convert to RGBA if needed (preserve transparency)
    if img.mode not in ('RGBA', 'RGB'):
        img = img.convert('RGBA')

    # Convert to numpy array
    pixels = np.array(img)

    print(f"Input: {pixels.shape[1]}x{pixels.shape[0]} ({img.mode})")

    # Apply algorithm
    if scale == 2:
        scaled = scale2x_epx(pixels)
    elif scale == 3:
        scaled = scale3x_epx(pixels)
    else:
        raise ValueError(f"Unsupported scale: {scale}. Use 2 or 3.")

    # Convert back to image
    output_img = Image.fromarray(scaled, mode=img.mode)

    # Save with maximum quality
    output_img.save(
        output_path,
        'PNG',
        optimize=True,
        compress_level=9
    )

    print(f"Output: {scaled.shape[1]}x{scaled.shape[0]} → {output_path}")
    print(f"Algorithm: EPX/Scale{scale}x (deterministic edge-aware)")


def main():
    parser = argparse.ArgumentParser(
        description="EPX/Scale2x/Scale3x pixel art upscaling",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 scale_epx.py sprite.png sprite_2x.png --scale 2
  python3 scale_epx.py icon.png icon_3x.png --scale 3

Algorithm:
  EPX (Eric's Pixel Expansion) examines each pixel's 4 cardinal neighbors
  and intelligently expands to 2x2 or 3x3 blocks based on edge detection.

  Pros: Fast, preserves sharp edges, handles transparency
  Cons: Less sophisticated than hq2x/xBR (no gradient smoothing)
        """
    )

    parser.add_argument(
        'input',
        type=Path,
        help='Input PNG file'
    )
    parser.add_argument(
        'output',
        type=Path,
        help='Output PNG file'
    )
    parser.add_argument(
        '--scale',
        type=int,
        choices=[2, 3],
        default=2,
        help='Scale factor (default: 2)'
    )

    args = parser.parse_args()

    # Validate input
    if not args.input.exists():
        print(f"Error: Input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    # Create output directory if needed
    args.output.parent.mkdir(parents=True, exist_ok=True)

    # Scale
    try:
        scale_epx(args.input, args.output, args.scale)
        print("✓ Success")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
