#!/usr/bin/env python3
"""
Compare Pixel Art Scaling Algorithms

Generates side-by-side HTML comparison of all available algorithms:
- Original (1x)
- Nearest-neighbor (for reference)
- EPX 2x
- EPX 4x (EPX 2x applied twice)

Usage:
    python3 compare_algorithms.py input.png output.html
    python3 compare_algorithms.py input.png output.html --scale 2

Requirements:
    pip install Pillow numpy
"""

import argparse
import base64
import sys
from pathlib import Path
from io import BytesIO
import numpy as np
from PIL import Image

# Import our EPX implementation
from scale_epx import scale2x_epx


def nearest_neighbor(pixels: np.ndarray, scale: int) -> np.ndarray:
    """Simple nearest-neighbor scaling for comparison"""
    height, width = pixels.shape[:2]
    output = np.zeros((height * scale, width * scale, pixels.shape[2]), dtype=pixels.dtype)

    for y in range(height * scale):
        for x in range(width * scale):
            src_y = y // scale
            src_x = x // scale
            output[y, x] = pixels[src_y, src_x]

    return output


def img_to_base64(img: Image.Image) -> str:
    """Convert PIL Image to base64 data URL"""
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"


def generate_comparison_html(input_path: Path, output_path: Path, scale: int = 2):
    """
    Generate HTML comparison of scaling algorithms

    Args:
        input_path: Input PNG file
        output_path: Output HTML file
        scale: Target scale factor (2 or 4)
    """
    # Load image
    img = Image.open(input_path)
    if img.mode not in ('RGBA', 'RGB'):
        img = img.convert('RGBA')

    pixels = np.array(img)
    orig_width, orig_height = pixels.shape[1], pixels.shape[0]

    print(f"Processing {input_path}")
    print(f"Original: {orig_width}x{orig_height}")

    # Generate variations
    results = {}

    # Original
    results['original'] = {
        'name': 'Original (1x)',
        'image': img,
        'description': f'{orig_width}×{orig_height} source image',
        'time': 'N/A'
    }

    # Nearest-neighbor (baseline)
    import time
    start = time.time()
    nn_pixels = nearest_neighbor(pixels, scale)
    nn_time = time.time() - start
    results['nearest'] = {
        'name': f'Nearest-Neighbor {scale}x',
        'image': Image.fromarray(nn_pixels, mode=img.mode),
        'description': 'Simple NxN block repetition (blocky)',
        'time': f'{nn_time*1000:.1f}ms'
    }

    # EPX 2x
    start = time.time()
    epx2_pixels = scale2x_epx(pixels)
    epx2_time = time.time() - start
    results['epx2'] = {
        'name': 'EPX 2x',
        'image': Image.fromarray(epx2_pixels, mode=img.mode),
        'description': 'Edge-aware 2x scaling (crisp edges)',
        'time': f'{epx2_time*1000:.1f}ms'
    }

    # EPX 4x (double application)
    if scale >= 4:
        start = time.time()
        epx4_pixels = scale2x_epx(epx2_pixels)
        epx4_time = time.time() - start
        results['epx4'] = {
            'name': 'EPX 4x',
            'image': Image.fromarray(epx4_pixels, mode=img.mode),
            'description': 'EPX applied twice (2x → 4x)',
            'time': f'{(epx2_time + epx4_time)*1000:.1f}ms'
        }

    # Generate HTML
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pixel Art Scaling Comparison - {input_path.name}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Monaco', 'Consolas', monospace;
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
        }}

        .container {{
            max-width: 1400px;
            margin: 0 auto;
        }}

        h1 {{
            font-size: 24px;
            margin-bottom: 10px;
            color: #4ec9b0;
            border-bottom: 2px solid #4ec9b0;
            padding-bottom: 10px;
        }}

        .meta {{
            margin-bottom: 30px;
            font-size: 14px;
            color: #808080;
        }}

        .comparison-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }}

        .result-card {{
            background: #252526;
            border: 1px solid #3e3e42;
            border-radius: 4px;
            padding: 15px;
            transition: transform 0.2s;
        }}

        .result-card:hover {{
            transform: translateY(-2px);
            border-color: #4ec9b0;
        }}

        .result-header {{
            margin-bottom: 10px;
        }}

        .result-name {{
            font-size: 16px;
            font-weight: bold;
            color: #4ec9b0;
            margin-bottom: 5px;
        }}

        .result-time {{
            font-size: 12px;
            color: #ce9178;
        }}

        .result-image {{
            background: #2d2d30;
            border: 1px solid #3e3e42;
            padding: 20px;
            margin-bottom: 10px;
            text-align: center;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
        }}

        .result-image img {{
            max-width: 100%;
            height: auto;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
        }}

        .result-description {{
            font-size: 13px;
            color: #9cdcfe;
            line-height: 1.4;
        }}

        .legend {{
            background: #252526;
            border: 1px solid #4ec9b0;
            border-radius: 4px;
            padding: 20px;
            margin-top: 30px;
        }}

        .legend h2 {{
            font-size: 18px;
            color: #4ec9b0;
            margin-bottom: 15px;
        }}

        .legend-content {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }}

        .legend-item {{
            font-size: 13px;
            line-height: 1.6;
        }}

        .legend-label {{
            color: #ce9178;
            font-weight: bold;
        }}

        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #3e3e42;
            font-size: 12px;
            color: #808080;
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Pixel Art Scaling Comparison</h1>
        <div class="meta">
            <div>Source: <strong>{input_path.name}</strong></div>
            <div>Original size: <strong>{orig_width}×{orig_height}</strong></div>
            <div>Target scale: <strong>{scale}x</strong></div>
        </div>

        <div class="comparison-grid">
"""

    # Add result cards
    for key, result in results.items():
        img_data = img_to_base64(result['image'])
        width, height = result['image'].size

        html += f"""
            <div class="result-card">
                <div class="result-header">
                    <div class="result-name">{result['name']}</div>
                    <div class="result-time">Time: {result['time']}</div>
                </div>
                <div class="result-image">
                    <img src="{img_data}" alt="{result['name']}" width="{width}" height="{height}">
                </div>
                <div class="result-description">
                    {result['description']}<br>
                    Size: {width}×{height}
                </div>
            </div>
"""

    html += """
        </div>

        <div class="legend">
            <h2>Algorithm Comparison</h2>
            <div class="legend-content">
                <div class="legend-item">
                    <span class="legend-label">Nearest-Neighbor:</span><br>
                    Simple NxN block repetition. Fastest but looks blocky. Each original pixel becomes a solid block.
                </div>
                <div class="legend-item">
                    <span class="legend-label">EPX/Scale2x:</span><br>
                    Edge-aware scaling using cardinal neighbors. Preserves sharp edges while smoothing diagonals. 10x faster than hq2x.
                </div>
                <div class="legend-item">
                    <span class="legend-label">EPX 4x (Double):</span><br>
                    EPX algorithm applied twice (2x → 4x). Compounds edge-aware benefits. Good balance of speed and quality.
                </div>
                <div class="legend-item">
                    <span class="legend-label">When to use each:</span><br>
                    • Nearest: Never for display (reference only)<br>
                    • EPX 2x: Fast iteration, transparent sprites<br>
                    • EPX 4x: Production retina assets
                </div>
            </div>
        </div>

        <div class="footer">
            Generated by pixel-art-scaler skill | All images use pixelated rendering for accurate preview
        </div>
    </div>
</body>
</html>
"""

    # Write HTML
    output_path.write_text(html)
    print(f"\n✓ Comparison saved to: {output_path}")
    print(f"  Open in browser: file://{output_path.absolute()}")


def main():
    parser = argparse.ArgumentParser(
        description="Compare pixel art scaling algorithms side-by-side",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 compare_algorithms.py sprite.png comparison.html
  python3 compare_algorithms.py icon.png comparison.html --scale 4

Output:
  Interactive HTML with side-by-side comparisons of all algorithms.
  Uses image-rendering: pixelated for accurate preview.
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
        help='Output HTML file'
    )
    parser.add_argument(
        '--scale',
        type=int,
        choices=[2, 4],
        default=2,
        help='Target scale factor (default: 2)'
    )

    args = parser.parse_args()

    # Validate
    if not args.input.exists():
        print(f"Error: Input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    # Create output directory
    args.output.parent.mkdir(parents=True, exist_ok=True)

    # Generate comparison
    try:
        generate_comparison_html(args.input, args.output, args.scale)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
