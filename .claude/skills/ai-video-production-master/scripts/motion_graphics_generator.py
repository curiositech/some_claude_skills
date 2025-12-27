#!/usr/bin/env python3
"""
Motion Graphics Generator

Programmatically generate title cards, lower thirds, data visualizations,
and other synthetic video elements with modern 2025 aesthetics.

Styles:
- neo_brutalist: Raw, glitchy, utilitarian
- deep_glow: Intense light blooms, layered neons
- liquid_motion: Fluid, morphing typography
- retro_revival: 80s/90s grain and neon
- glass_morphism: Frosted glass, depth layers
"""

import argparse
import json
import math
import os
import subprocess
import tempfile
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Optional


class Style(Enum):
    NEO_BRUTALIST = "neo_brutalist"
    DEEP_GLOW = "deep_glow"
    LIQUID_MOTION = "liquid_motion"
    RETRO_REVIVAL = "retro_revival"
    GLASS_MORPHISM = "glass_morphism"


@dataclass
class ColorPalette:
    background: str
    primary: str
    secondary: str
    accent: str
    text: str
    glow: Optional[str] = None


PALETTES = {
    Style.NEO_BRUTALIST: ColorPalette(
        background="#0a0a0a",
        primary="#ff3366",
        secondary="#00ff88",
        accent="#ffff00",
        text="#ffffff",
    ),
    Style.DEEP_GLOW: ColorPalette(
        background="#0d0d1a",
        primary="#7c3aed",
        secondary="#06b6d4",
        accent="#f472b6",
        text="#ffffff",
        glow="#7c3aed",
    ),
    Style.LIQUID_MOTION: ColorPalette(
        background="#1a1a2e",
        primary="#4361ee",
        secondary="#3a0ca3",
        accent="#f72585",
        text="#ffffff",
        glow="#4361ee",
    ),
    Style.RETRO_REVIVAL: ColorPalette(
        background="#1a0a2e",
        primary="#ff006e",
        secondary="#8338ec",
        accent="#ffbe0b",
        text="#ffffff",
        glow="#ff006e",
    ),
    Style.GLASS_MORPHISM: ColorPalette(
        background="#0f172a",
        primary="#38bdf8",
        secondary="#818cf8",
        accent="#f472b6",
        text="#f8fafc",
        glow="#38bdf8",
    ),
}


def generate_svg_title_card(
    title: str,
    subtitle: Optional[str] = None,
    style: Style = Style.DEEP_GLOW,
    width: int = 1920,
    height: int = 1080,
) -> str:
    """Generate an SVG title card."""
    palette = PALETTES[style]

    # Base SVG
    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">',
        '<defs>',
    ]

    # Add glow filter for styles that use it
    if palette.glow:
        svg_parts.append(f'''
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="20" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        ''')

    # Gradient for text
    svg_parts.append(f'''
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:{palette.primary}"/>
            <stop offset="100%" style="stop-color:{palette.secondary}"/>
        </linearGradient>
    </defs>
    ''')

    # Background
    svg_parts.append(f'<rect width="{width}" height="{height}" fill="{palette.background}"/>')

    # Style-specific decorations
    if style == Style.NEO_BRUTALIST:
        # Grid lines
        for i in range(0, width, 100):
            opacity = 0.1 if i % 200 == 0 else 0.05
            svg_parts.append(f'<line x1="{i}" y1="0" x2="{i}" y2="{height}" stroke="{palette.text}" stroke-opacity="{opacity}"/>')
        for i in range(0, height, 100):
            opacity = 0.1 if i % 200 == 0 else 0.05
            svg_parts.append(f'<line x1="0" y1="{i}" x2="{width}" y2="{i}" stroke="{palette.text}" stroke-opacity="{opacity}"/>')
        # Accent block
        svg_parts.append(f'<rect x="60" y="{height//2 - 80}" width="20" height="160" fill="{palette.accent}"/>')

    elif style == Style.DEEP_GLOW:
        # Ambient glow circles
        svg_parts.append(f'<circle cx="{width//4}" cy="{height//3}" r="300" fill="{palette.primary}" opacity="0.1"/>')
        svg_parts.append(f'<circle cx="{3*width//4}" cy="{2*height//3}" r="250" fill="{palette.secondary}" opacity="0.1"/>')

    elif style == Style.GLASS_MORPHISM:
        # Frosted glass panel
        svg_parts.append(f'''
        <rect x="{width//4}" y="{height//4}" width="{width//2}" height="{height//2}"
              rx="20" fill="{palette.background}" fill-opacity="0.5"
              stroke="{palette.primary}" stroke-opacity="0.3"/>
        ''')

    # Title text
    title_y = height // 2 - (50 if subtitle else 0)
    font_size = min(120, width // (len(title) * 0.7))

    filter_attr = 'filter="url(#glow)"' if palette.glow else ''
    svg_parts.append(f'''
    <text x="{width//2}" y="{title_y}"
          font-family="SF Pro Display, -apple-system, sans-serif"
          font-size="{font_size}" font-weight="700"
          fill="url(#textGradient)" text-anchor="middle" {filter_attr}>
        {title}
    </text>
    ''')

    # Subtitle
    if subtitle:
        svg_parts.append(f'''
        <text x="{width//2}" y="{title_y + 80}"
              font-family="SF Pro Display, -apple-system, sans-serif"
              font-size="36" font-weight="400"
              fill="{palette.text}" fill-opacity="0.8" text-anchor="middle">
            {subtitle}
        </text>
        ''')

    svg_parts.append('</svg>')
    return '\n'.join(svg_parts)


def generate_svg_lower_third(
    name: str,
    title: str,
    style: Style = Style.DEEP_GLOW,
    width: int = 1920,
    height: int = 1080,
    position: str = "left",  # left, right, center
) -> str:
    """Generate an SVG lower third overlay."""
    palette = PALETTES[style]

    # Calculate position
    if position == "left":
        x_offset = 80
        text_anchor = "start"
    elif position == "right":
        x_offset = width - 80
        text_anchor = "end"
    else:
        x_offset = width // 2
        text_anchor = "middle"

    y_base = height - 150

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">
    <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:{palette.primary}"/>
            <stop offset="100%" style="stop-color:{palette.secondary}"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.5"/>
        </filter>
    </defs>

    <!-- Background bar -->
    <rect x="{x_offset - 20 if position == 'left' else 0}" y="{y_base - 20}"
          width="500" height="100" rx="4"
          fill="{palette.background}" fill-opacity="0.85" filter="url(#shadow)"/>

    <!-- Accent line -->
    <rect x="{x_offset - 20 if position == 'left' else x_offset - 480}" y="{y_base - 20}"
          width="4" height="100" fill="url(#barGradient)"/>

    <!-- Name -->
    <text x="{x_offset}" y="{y_base + 25}"
          font-family="SF Pro Display, -apple-system, sans-serif"
          font-size="32" font-weight="600"
          fill="{palette.text}" text-anchor="{text_anchor}">
        {name}
    </text>

    <!-- Title -->
    <text x="{x_offset}" y="{y_base + 60}"
          font-family="SF Pro Display, -apple-system, sans-serif"
          font-size="22" font-weight="400"
          fill="{palette.text}" fill-opacity="0.7" text-anchor="{text_anchor}">
        {title}
    </text>
</svg>'''
    return svg


def generate_svg_data_chart(
    data: list[dict],  # [{"label": "A", "value": 75}, ...]
    chart_type: str = "bar",  # bar, horizontal_bar, radial
    title: Optional[str] = None,
    style: Style = Style.DEEP_GLOW,
    width: int = 1920,
    height: int = 1080,
) -> str:
    """Generate an SVG data visualization."""
    palette = PALETTES[style]
    max_value = max(d["value"] for d in data)

    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">',
        '<defs>',
        f'''<linearGradient id="barFill" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style="stop-color:{palette.primary}"/>
            <stop offset="100%" style="stop-color:{palette.secondary}"/>
        </linearGradient>''',
    ]

    if palette.glow:
        svg_parts.append(f'''
        <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        ''')

    svg_parts.append('</defs>')
    svg_parts.append(f'<rect width="{width}" height="{height}" fill="{palette.background}"/>')

    # Title
    if title:
        svg_parts.append(f'''
        <text x="{width//2}" y="80"
              font-family="SF Pro Display, -apple-system, sans-serif"
              font-size="48" font-weight="600"
              fill="{palette.text}" text-anchor="middle">
            {title}
        </text>
        ''')

    chart_area_top = 150 if title else 80
    chart_area_height = height - chart_area_top - 120
    chart_area_width = width - 200

    if chart_type == "bar":
        bar_width = min(80, chart_area_width // len(data) - 20)
        bar_spacing = chart_area_width // len(data)

        for i, d in enumerate(data):
            bar_height = (d["value"] / max_value) * chart_area_height
            x = 100 + i * bar_spacing + (bar_spacing - bar_width) // 2
            y = chart_area_top + chart_area_height - bar_height

            filter_attr = 'filter="url(#barGlow)"' if palette.glow else ''
            svg_parts.append(f'''
            <rect x="{x}" y="{y}" width="{bar_width}" height="{bar_height}"
                  rx="4" fill="url(#barFill)" {filter_attr}/>
            <text x="{x + bar_width//2}" y="{chart_area_top + chart_area_height + 40}"
                  font-family="SF Pro Display, -apple-system, sans-serif"
                  font-size="20" fill="{palette.text}" fill-opacity="0.7" text-anchor="middle">
                {d["label"]}
            </text>
            <text x="{x + bar_width//2}" y="{y - 15}"
                  font-family="SF Pro Display, -apple-system, sans-serif"
                  font-size="24" font-weight="600" fill="{palette.text}" text-anchor="middle">
                {d["value"]}
            </text>
            ''')

    elif chart_type == "radial":
        cx, cy = width // 2, height // 2 + 30
        radius = min(chart_area_width, chart_area_height) // 3

        for i, d in enumerate(data):
            angle = (i / len(data)) * 2 * math.pi - math.pi / 2
            bar_length = (d["value"] / max_value) * radius

            x1 = cx + math.cos(angle) * 50
            y1 = cy + math.sin(angle) * 50
            x2 = cx + math.cos(angle) * (50 + bar_length)
            y2 = cy + math.sin(angle) * (50 + bar_length)

            svg_parts.append(f'''
            <line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"
                  stroke="url(#barFill)" stroke-width="20" stroke-linecap="round"/>
            ''')

            # Label
            label_x = cx + math.cos(angle) * (radius + 80)
            label_y = cy + math.sin(angle) * (radius + 80)
            svg_parts.append(f'''
            <text x="{label_x}" y="{label_y}"
                  font-family="SF Pro Display, -apple-system, sans-serif"
                  font-size="18" fill="{palette.text}" text-anchor="middle" dominant-baseline="middle">
                {d["label"]}
            </text>
            ''')

    svg_parts.append('</svg>')
    return '\n'.join(svg_parts)


def svg_to_png(svg_content: str, output_path: Path, width: int = 1920, height: int = 1080) -> Path:
    """Convert SVG to PNG using system tools."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.svg', delete=False) as f:
        f.write(svg_content)
        svg_path = f.name

    try:
        # Try rsvg-convert first (best quality)
        result = subprocess.run(
            ['rsvg-convert', '-w', str(width), '-h', str(height), '-o', str(output_path), svg_path],
            capture_output=True
        )
        if result.returncode == 0:
            return output_path
    except FileNotFoundError:
        pass

    try:
        # Fall back to ImageMagick
        subprocess.run(
            ['convert', '-background', 'none', '-density', '150', svg_path, str(output_path)],
            check=True, capture_output=True
        )
        return output_path
    except (FileNotFoundError, subprocess.CalledProcessError):
        pass

    # Last resort: save as SVG
    svg_output = output_path.with_suffix('.svg')
    with open(svg_output, 'w') as f:
        f.write(svg_content)
    print(f"Warning: Could not convert to PNG, saved as SVG: {svg_output}")
    return svg_output


def generate_animated_title(
    title: str,
    subtitle: Optional[str] = None,
    style: Style = Style.DEEP_GLOW,
    duration: float = 3.0,
    fps: int = 30,
    output_path: Path = Path("title_animated.mp4"),
) -> Path:
    """Generate an animated title card video using FFmpeg."""
    palette = PALETTES[style]
    width, height = 1920, 1080

    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)

        # Generate frames
        total_frames = int(duration * fps)

        for frame in range(total_frames):
            progress = frame / total_frames

            # Animation: fade in (0-30%), hold (30-70%), fade out (70-100%)
            if progress < 0.3:
                opacity = progress / 0.3
                scale = 0.9 + 0.1 * (progress / 0.3)
            elif progress > 0.7:
                opacity = 1 - (progress - 0.7) / 0.3
                scale = 1.0
            else:
                opacity = 1.0
                scale = 1.0

            # Generate SVG with animation state
            svg = generate_svg_title_card(title, subtitle, style, width, height)

            # Apply opacity via group wrapper
            svg = svg.replace(
                '</defs>',
                f'</defs><g opacity="{opacity}" transform="translate({width/2}, {height/2}) scale({scale}) translate({-width/2}, {-height/2})">'
            ).replace('</svg>', '</g></svg>')

            frame_path = tmpdir / f"frame_{frame:04d}.png"
            svg_to_png(svg, frame_path, width, height)

        # Combine frames with FFmpeg
        subprocess.run([
            'ffmpeg', '-y', '-framerate', str(fps),
            '-i', str(tmpdir / 'frame_%04d.png'),
            '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
            '-preset', 'medium', '-crf', '18',
            str(output_path)
        ], check=True, capture_output=True)

    return output_path


def main():
    parser = argparse.ArgumentParser(description="Motion Graphics Generator")
    parser.add_argument("--type", choices=["title", "lower_third", "chart"], default="title")
    parser.add_argument("--style", choices=[s.value for s in Style], default="deep_glow")
    parser.add_argument("--title", type=str, default="Your Title Here")
    parser.add_argument("--subtitle", type=str, default=None)
    parser.add_argument("--output", type=Path, default=Path("output.png"))
    parser.add_argument("--animated", action="store_true", help="Generate animated video")
    parser.add_argument("--duration", type=float, default=3.0, help="Animation duration (seconds)")
    parser.add_argument("--data", type=str, help="JSON data for charts")
    parser.add_argument("--chart-type", choices=["bar", "horizontal_bar", "radial"], default="bar")
    parser.add_argument("--width", type=int, default=1920)
    parser.add_argument("--height", type=int, default=1080)
    parser.add_argument("--list-styles", action="store_true", help="List available styles")

    args = parser.parse_args()

    if args.list_styles:
        print("Available Styles:")
        for style in Style:
            palette = PALETTES[style]
            print(f"\n  {style.value}:")
            print(f"    Background: {palette.background}")
            print(f"    Primary: {palette.primary}")
            print(f"    Secondary: {palette.secondary}")
            print(f"    Accent: {palette.accent}")
        return

    style = Style(args.style)

    if args.type == "title":
        if args.animated:
            output = generate_animated_title(
                args.title,
                args.subtitle,
                style,
                args.duration,
                output_path=args.output.with_suffix('.mp4'),
            )
            print(f"Generated animated title: {output}")
        else:
            svg = generate_svg_title_card(
                args.title,
                args.subtitle,
                style,
                args.width,
                args.height,
            )
            output = svg_to_png(svg, args.output, args.width, args.height)
            print(f"Generated title card: {output}")

    elif args.type == "lower_third":
        svg = generate_svg_lower_third(
            args.title,
            args.subtitle or "Title",
            style,
            args.width,
            args.height,
        )
        output = svg_to_png(svg, args.output, args.width, args.height)
        print(f"Generated lower third: {output}")

    elif args.type == "chart":
        if args.data:
            data = json.loads(args.data)
        else:
            # Sample data
            data = [
                {"label": "Jan", "value": 65},
                {"label": "Feb", "value": 78},
                {"label": "Mar", "value": 90},
                {"label": "Apr", "value": 81},
                {"label": "May", "value": 95},
            ]

        svg = generate_svg_data_chart(
            data,
            args.chart_type,
            args.title,
            style,
            args.width,
            args.height,
        )
        output = svg_to_png(svg, args.output, args.width, args.height)
        print(f"Generated chart: {output}")


if __name__ == "__main__":
    main()
