#!/usr/bin/env python3
"""
Capture screenshots of Some Claude Skills website pages.
Requires: pip install playwright && playwright install chromium
"""

import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

# Configuration
BASE_URL = "http://localhost:3000"
ARCHIVE_DIR = Path(__file__).parent.parent / "archive" / "screenshots" / "before"

PAGES = [
    ("homepage", "/"),
    ("skills", "/skills"),
    ("ecosystem", "/ecosystem"),
    ("favorites", "/favorites"),
]

VIEWPORTS = {
    "desktop": {"width": 1920, "height": 1080},
    "mobile": {"width": 390, "height": 844},
}


async def capture_page(page, name: str, path: str, viewport_name: str, viewport: dict):
    """Capture a single page at a specific viewport."""
    await page.set_viewport_size(viewport)

    url = f"{BASE_URL}{path}"
    print(f"  Navigating to {url} ({viewport_name})...")

    await page.goto(url, wait_until="networkidle")
    await asyncio.sleep(1)  # Extra wait for animations

    # Create output directory
    output_dir = ARCHIVE_DIR / name / viewport_name
    output_dir.mkdir(parents=True, exist_ok=True)

    # Full page screenshot
    output_path = output_dir / f"{name}-{viewport_name}-full.png"
    await page.screenshot(path=str(output_path), full_page=True)
    print(f"    Saved: {output_path.name}")

    # Above-the-fold screenshot
    output_path_fold = output_dir / f"{name}-{viewport_name}-above-fold.png"
    await page.screenshot(path=str(output_path_fold), full_page=False)
    print(f"    Saved: {output_path_fold.name}")

    return output_path


async def capture_quickview_modal(page):
    """Capture the QuickView modal on skills page."""
    await page.set_viewport_size(VIEWPORTS["desktop"])
    await page.goto(f"{BASE_URL}/skills", wait_until="networkidle")
    await asyncio.sleep(1)

    # Try to click on a skill card to open QuickView
    skill_cards = await page.query_selector_all('[class*="skillCard"], [class*="SkillCard"]')
    if skill_cards:
        await skill_cards[0].click()
        await asyncio.sleep(0.5)

        output_dir = ARCHIVE_DIR / "skills" / "desktop"
        output_path = output_dir / "skills-desktop-quickview-modal.png"
        await page.screenshot(path=str(output_path), full_page=False)
        print(f"    Saved: {output_path.name}")

        # Close modal
        await page.keyboard.press("Escape")


async def main():
    print("=" * 60)
    print("Some Claude Skills - Screenshot Capture")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Archive: {ARCHIVE_DIR}")
    print()

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        for page_name, page_path in PAGES:
            print(f"\nCapturing: {page_name}")
            for viewport_name, viewport in VIEWPORTS.items():
                await capture_page(page, page_name, page_path, viewport_name, viewport)

        # Special: QuickView modal
        print(f"\nCapturing: QuickView Modal")
        await capture_quickview_modal(page)

        await browser.close()

    print("\n" + "=" * 60)
    print("Screenshot capture complete!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
