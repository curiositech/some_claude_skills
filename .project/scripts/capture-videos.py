#!/usr/bin/env python3
"""
Capture video recordings of user flows on Some Claude Skills website.
Requires: pip install playwright && playwright install chromium
"""

import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

# Configuration
BASE_URL = "http://localhost:3000"
ARCHIVE_DIR = Path(__file__).parent.parent / "archive" / "videos" / "before"
VIEWPORT = {"width": 1920, "height": 1080}


async def record_first_visit_flow(browser):
    """Record a first-time visitor exploring the site."""
    print("\n Recording: First Visit Flow")

    context = await browser.new_context(
        viewport=VIEWPORT,
        record_video_dir=str(ARCHIVE_DIR),
        record_video_size=VIEWPORT
    )
    page = await context.new_page()

    # Land on homepage
    await page.goto(BASE_URL, wait_until="networkidle")
    await asyncio.sleep(2)

    # Scroll down to see featured skills
    await page.evaluate("window.scrollBy(0, 400)")
    await asyncio.sleep(1.5)

    # Scroll to bottom CTAs
    await page.evaluate("window.scrollBy(0, 400)")
    await asyncio.sleep(1.5)

    # Click "Browse All Skills"
    browse_btn = await page.query_selector('text="Open Gallery"')
    if browse_btn:
        await browse_btn.click()
        await asyncio.sleep(2)
    else:
        await page.goto(f"{BASE_URL}/skills", wait_until="networkidle")
        await asyncio.sleep(2)

    # Scroll through skills
    await page.evaluate("window.scrollBy(0, 300)")
    await asyncio.sleep(1)

    # Click on a skill card to open QuickView
    skill_cards = await page.query_selector_all('[class*="skillCard"], [class*="card"]')
    if skill_cards and len(skill_cards) > 0:
        await skill_cards[0].click()
        await asyncio.sleep(2)
        # Close modal
        await page.keyboard.press("Escape")
        await asyncio.sleep(1)

    await context.close()

    # Rename the video file
    videos = list(ARCHIVE_DIR.glob("*.webm"))
    if videos:
        latest = max(videos, key=lambda p: p.stat().st_mtime)
        new_name = ARCHIVE_DIR / "01-first-visit-flow.webm"
        latest.rename(new_name)
        print(f"    Saved: {new_name.name}")


async def record_skill_discovery_flow(browser):
    """Record searching and filtering skills."""
    print("\n Recording: Skill Discovery Flow")

    context = await browser.new_context(
        viewport=VIEWPORT,
        record_video_dir=str(ARCHIVE_DIR),
        record_video_size=VIEWPORT
    )
    page = await context.new_page()

    # Go to skills page
    await page.goto(f"{BASE_URL}/skills", wait_until="networkidle")
    await asyncio.sleep(2)

    # Type in search box
    search_box = await page.query_selector('input[placeholder*="Search"]')
    if search_box:
        await search_box.click()
        await asyncio.sleep(0.5)
        await search_box.type("documentation", delay=100)
        await asyncio.sleep(1.5)

    # Clear search
    if search_box:
        await search_box.fill("")
        await asyncio.sleep(1)

    # Click a tag filter
    tag = await page.query_selector('text="ADHD"')
    if tag:
        await tag.click()
        await asyncio.sleep(1.5)

    # Click another tag
    tag2 = await page.query_selector('text="Automation"')
    if tag2:
        await tag2.click()
        await asyncio.sleep(1.5)

    # Scroll to see results
    await page.evaluate("window.scrollBy(0, 300)")
    await asyncio.sleep(1)

    # Click on a skill
    skill_cards = await page.query_selector_all('[class*="skillCard"], [class*="card"]')
    if skill_cards and len(skill_cards) > 0:
        await skill_cards[0].click()
        await asyncio.sleep(2)

    await context.close()

    # Rename the video file
    videos = list(ARCHIVE_DIR.glob("*.webm"))
    if videos:
        latest = max(videos, key=lambda p: p.stat().st_mtime)
        new_name = ARCHIVE_DIR / "02-skill-discovery-flow.webm"
        latest.rename(new_name)
        print(f"    Saved: {new_name.name}")


async def record_navigation_flow(browser):
    """Record navigating between main pages."""
    print("\n Recording: Navigation Flow")

    context = await browser.new_context(
        viewport=VIEWPORT,
        record_video_dir=str(ARCHIVE_DIR),
        record_video_size=VIEWPORT
    )
    page = await context.new_page()

    # Start at homepage
    await page.goto(BASE_URL, wait_until="networkidle")
    await asyncio.sleep(2)

    # Go to Skills via nav
    await page.click('text="Skills"')
    await asyncio.sleep(0.5)
    skills_link = await page.query_selector('a[href="/skills"]')
    if skills_link:
        await skills_link.click()
    else:
        await page.goto(f"{BASE_URL}/skills")
    await asyncio.sleep(2)

    # Go to Ecosystem via nav
    await page.click('text="Explore"')
    await asyncio.sleep(0.5)
    eco_link = await page.query_selector('a[href="/ecosystem"]')
    if eco_link:
        await eco_link.click()
    else:
        await page.goto(f"{BASE_URL}/ecosystem")
    await asyncio.sleep(2)

    # Scroll ecosystem
    await page.evaluate("window.scrollBy(0, 300)")
    await asyncio.sleep(1)

    # Go to Favorites
    await page.goto(f"{BASE_URL}/favorites", wait_until="networkidle")
    await asyncio.sleep(2)

    # Back to home
    home_link = await page.query_selector('text="Back to Home"')
    if home_link:
        await home_link.click()
    else:
        await page.goto(BASE_URL)
    await asyncio.sleep(2)

    await context.close()

    # Rename the video file
    videos = list(ARCHIVE_DIR.glob("*.webm"))
    if videos:
        latest = max(videos, key=lambda p: p.stat().st_mtime)
        new_name = ARCHIVE_DIR / "03-navigation-flow.webm"
        latest.rename(new_name)
        print(f"    Saved: {new_name.name}")


async def record_mobile_flow(browser):
    """Record mobile experience."""
    print("\n Recording: Mobile Experience Flow")

    mobile_viewport = {"width": 390, "height": 844}

    context = await browser.new_context(
        viewport=mobile_viewport,
        record_video_dir=str(ARCHIVE_DIR),
        record_video_size=mobile_viewport
    )
    page = await context.new_page()

    # Homepage on mobile
    await page.goto(BASE_URL, wait_until="networkidle")
    await asyncio.sleep(2)

    # Scroll through homepage
    await page.evaluate("window.scrollBy(0, 400)")
    await asyncio.sleep(1)
    await page.evaluate("window.scrollBy(0, 400)")
    await asyncio.sleep(1)

    # Open hamburger menu (try multiple selectors)
    menu_btn = await page.query_selector('button:has-text("Menu")')
    if not menu_btn:
        menu_btn = await page.query_selector('[class*="navbar"] button')
    if menu_btn:
        await menu_btn.click()
        await asyncio.sleep(1)

    # Go to skills
    await page.goto(f"{BASE_URL}/skills", wait_until="networkidle")
    await asyncio.sleep(2)

    # Scroll through skills
    await page.evaluate("window.scrollBy(0, 500)")
    await asyncio.sleep(1)
    await page.evaluate("window.scrollBy(0, 500)")
    await asyncio.sleep(1)

    await context.close()

    # Rename the video file
    videos = list(ARCHIVE_DIR.glob("*.webm"))
    if videos:
        latest = max(videos, key=lambda p: p.stat().st_mtime)
        new_name = ARCHIVE_DIR / "04-mobile-experience-flow.webm"
        latest.rename(new_name)
        print(f"    Saved: {new_name.name}")


async def main():
    print("=" * 60)
    print("Some Claude Skills - Video Recording")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Archive: {ARCHIVE_DIR}")

    # Ensure output directory exists
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        await record_first_visit_flow(browser)
        await record_skill_discovery_flow(browser)
        await record_navigation_flow(browser)
        await record_mobile_flow(browser)

        await browser.close()

    print("\n" + "=" * 60)
    print("Video recording complete!")
    print("=" * 60)

    # List all videos
    print("\nCaptured videos:")
    for video in sorted(ARCHIVE_DIR.glob("*.webm")):
        size_mb = video.stat().st_size / (1024 * 1024)
        print(f"  - {video.name} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    asyncio.run(main())
