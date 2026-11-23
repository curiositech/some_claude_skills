#!/usr/bin/env python3
"""render_check.py — open a page at real viewports and report what breaks.

OPTIONAL, and the only script in this bundle with a dependency. Everything else
here is stdlib-only; this needs Playwright, because the findings it produces
cannot be derived from source text. A page that horizontally scrolls at 390px
scrolls because of computed layout, not because of anything greppable.

    pip install playwright            # the browsers are often already present
    python3 scripts/render_check.py URL_OR_FILE --json render.json

Then merge into the normal report, which is the point of emitting this schema:

    python3 scripts/humanize_review.py page.html --findings render.json \
        --out report.html

WHY THIS EXISTS AS A SEPARATE LAYER. The static pass can tell you a page has no
responsive variants and no viewport meta. It cannot tell you that the pricing
table is 1180px wide inside a 390px screen, or which element is the culprit.
This names the element, which is the difference between a complaint and a fix.

WHAT IT REPORTS. Every finding here is a defect you can reproduce by opening the
page, so none of it is an inference about who built it and none of it carries
the fairness caveat the rest of this skill insists on. It is the same class as a
dead citation: a fact about whether the thing works.

  horizontal-overflow-at-mobile   the page scrolls sideways, plus the widest
                                  offending elements by selector
  tap-target-too-small            interactive targets under 44x44 CSS px
  body-text-below-readable        rendered text under 12px
  low-contrast-text               computed contrast below WCAG AA
  image-without-dimensions        <img> with no width/height, which shifts layout
  text-spacing-override-breaks-the-layout  with --probe-a11y: applies the WCAG
                                  1.4.12 spacing values and measures the clipping
  forced-colors-mode-erases-the-interface  with --probe-a11y: what loses its only
                                  boundary when the OS takes over the palette
  escape-and-focus-declared-not-wired   with --probe-modals: opens each trigger and
                                  tests focus-in, Escape, Tab containment, restore
"""

import argparse
import json
import os
import sys
from pathlib import Path

VIEWPORTS = [("reflow-320", 320, 640), ("mobile", 390, 844),
             ("tablet", 768, 1024), ("desktop", 1280, 900)]

# Collected in one pass in the page so the DOM is walked once per viewport.
PROBE = r"""() => {
  const out = {overflow: [], taps: [], small: [], contrast: [], noDim: []};
  const docW = document.documentElement.scrollWidth;
  const winW = window.innerWidth;
  out.scrollWidth = docW;
  out.innerWidth = winW;

  const sel = (el) => {
    if (!el || el === document.body) return 'body';
    if (el.id) return '#' + el.id;
    const cls = (el.getAttribute('class') || '').trim().split(/\s+/)
      .filter(Boolean).slice(0, 3).join('.');
    return el.tagName.toLowerCase() + (cls ? '.' + cls : '');
  };

  // Elements wider than the viewport, or sticking out past its right edge.
  if (docW > winW + 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.right > winW + 1 || r.width > winW + 1) {
        // Only report the outermost offender in a chain; a wide child inside a
        // wide parent is one bug, not two.
        let p = el.parentElement, nested = false;
        while (p && p !== document.body) {
          const pr = p.getBoundingClientRect();
          if (pr.right > winW + 1 || pr.width > winW + 1) { nested = true; break; }
          p = p.parentElement;
        }
        if (!nested) out.overflow.push({sel: sel(el), width: Math.round(r.width),
                                        right: Math.round(r.right)});
      }
      if (out.overflow.length >= 8) break;
    }
  }

  const lum = (c) => {
    const m = c.match(/[\d.]+/g); if (!m) return null;
    const [r, g, b] = m.slice(0, 3).map(Number);
    const a = m.length > 3 ? Number(m[3]) : 1;
    if (a < 0.9) return null;               // translucent: not worth guessing
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92
                                 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      const m = c.match(/[\d.]+/g);
      if (m && (m.length < 4 || Number(m[3]) > 0.9)) return c;
      n = n.parentElement;
    }
    return 'rgb(255, 255, 255)';
  };

  const seenTap = new Set(), seenSmall = new Set(), seenContrast = new Set();
  for (const el of document.querySelectorAll(
        'a, button, input, select, textarea, [role="button"], p, li, span, h1, h2, h3, h4')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const tag = el.tagName.toLowerCase();
    const interactive = ['a', 'button', 'input', 'select', 'textarea'].includes(tag)
                        || el.getAttribute('role') === 'button';

    if (interactive && (r.width < 44 || r.height < 44)) {
      const k = sel(el); if (!seenTap.has(k)) { seenTap.add(k);
        out.taps.push({sel: k, w: Math.round(r.width), h: Math.round(r.height),
                       text: (el.innerText || '').trim().slice(0, 30)}); }
    }

    const txt = (el.innerText || '').trim();
    if (!txt) continue;
    const direct = Array.from(el.childNodes)
      .some(n => n.nodeType === 3 && n.textContent.trim().length > 3);
    if (!direct) continue;

    const px = parseFloat(cs.fontSize);
    if (px && px < 12) {
      const k = sel(el); if (!seenSmall.has(k)) { seenSmall.add(k);
        out.small.push({sel: k, px: Math.round(px * 10) / 10,
                        text: txt.slice(0, 30)}); }
    }

    const lf = lum(cs.color), lb = lum(bgOf(el));
    if (lf !== null && lb !== null) {
      const ratio = (Math.max(lf, lb) + 0.05) / (Math.min(lf, lb) + 0.05);
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      const large = px >= 24 || (px >= 18.66 && bold);
      const need = large ? 3.0 : 4.5;
      if (ratio < need) {
        const k = sel(el); if (!seenContrast.has(k)) { seenContrast.add(k);
          out.contrast.push({sel: k, ratio: Math.round(ratio * 100) / 100,
                             need, color: cs.color, bg: bgOf(el),
                             text: txt.slice(0, 30)}); }
      }
    }
  }

  // Measure (characters per line) on real body paragraphs. Estimating from
  // font-size is crude, so measure a real string in the element's own computed
  // font and divide the element's content width by the resulting advance width.
  out.measure = [];
  const meas = document.createElement('canvas').getContext('2d');
  const seenMeasure = new Set();
  for (const el of document.querySelectorAll('p, li')) {
    const txt = (el.innerText || '').trim();
    if (txt.length < 120) continue;                  // short blocks cannot show it
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 100) continue;
    meas.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const sample = 'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz';
    const adv = meas.measureText(sample).width / sample.length;
    if (!adv) continue;
    const padding = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const cpl = Math.round((r.width - padding) / adv);
    const k = sel(el);
    if (cpl > 85 && !seenMeasure.has(k)) {
      seenMeasure.add(k);
      out.measure.push({sel: k, cpl, px: Math.round(r.width)});
    }
  }
  out.measure = out.measure.slice(0, 6);

  for (const img of document.querySelectorAll('img')) {
    if (!img.getAttribute('width') || !img.getAttribute('height')) {
      const r = img.getBoundingClientRect();
      if (r.width > 40 && r.height > 40)
        out.noDim.push({sel: sel(img), src: (img.getAttribute('src') || '').slice(0, 60)});
    }
  }
  out.taps = out.taps.slice(0, 10);
  out.small = out.small.slice(0, 10);
  out.contrast = out.contrast.slice(0, 10);
  out.noDim = out.noDim.slice(0, 6);
  return out;
}"""


def finding(file, ism, severity, excerpt, explanation, rewrite):
    return {"file": file, "line": 0, "excerpt": excerpt[:300], "ism": ism,
            "dialect": "generic-llm", "severity": severity,
            "explanation": explanation, "rewrite": rewrite,
            "layer": "render", "family": "defect"}


# The one check in this bundle that source review provably cannot settle.
# Generated modals carried an Escape handler in 79% of trials and Escape worked
# in 59%, and 1,031 of 1,032 failures threw no console error. So a static pass
# reports success on a broken modal, and only driving it in a browser disagrees.
MODAL_PROBE = r"""() => {
  const open = document.querySelector('dialog[open], [role="dialog"], [role="alertdialog"]');
  if (!open) return null;
  const r = open.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  const focusable = open.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
  return {
    native: open.tagName.toLowerCase() === 'dialog',
    modal: open.matches('dialog[open]') ? !!open.getAttribute('open') : true,
    focusables: focusable.length,
    focusInside: open.contains(document.activeElement),
    activeTag: document.activeElement ? document.activeElement.tagName.toLowerCase() : null,
  };
}"""


CONTAINED_JS = r"""() => {
  const d = document.querySelector('dialog[open], [role="dialog"], [role="alertdialog"]');
  return d ? d.contains(document.activeElement) : true;
}"""


def probe_modals(page, target, limit=6):
    """Open each plausible trigger, then test the four behaviours that matter:
    focus moves in, Escape closes, Tab stays contained, focus returns."""
    out = []
    triggers = page.query_selector_all(
        'button, [role="button"], a[href="#"], [data-testid*="open"], [aria-haspopup="dialog"]')
    tested = 0
    for tr in triggers:
        if tested >= limit:
            break
        try:
            if not tr.is_visible() or not tr.is_enabled():
                continue
            label = (tr.inner_text() or tr.get_attribute("aria-label") or "").strip()[:40]
            tr.focus()
            tr.press("Enter")
            page.wait_for_timeout(180)
            st = page.evaluate(MODAL_PROBE)
            if not st:
                continue                      # this control does not open a dialog
            tested += 1
            name = label or f"trigger #{tested}"
            problems = []

            if not st["focusInside"]:
                problems.append("focus was not moved into the dialog on open")

            # Escape.
            page.keyboard.press("Escape")
            page.wait_for_timeout(180)
            still = page.evaluate(MODAL_PROBE)
            if still:
                problems.append("Escape did not close it")
            else:
                back = page.evaluate(
                    "() => document.activeElement && document.activeElement.tagName.toLowerCase()")
                if back == "body":
                    problems.append("focus was not restored to the trigger on close")

            # Containment, only meaningful while it is still open.
            if still and still["focusables"]:
                escaped = False
                for _ in range(min(still["focusables"] + 2, 12)):
                    page.keyboard.press("Tab")
                    if not page.evaluate(CONTAINED_JS):
                        escaped = True
                        break
                if escaped:
                    problems.append("Tab moved focus out of the dialog into the page behind")
                page.keyboard.press("Escape")
                page.wait_for_timeout(120)
                if page.evaluate(MODAL_PROBE):
                    page.reload(wait_until="domcontentloaded")
                    page.wait_for_timeout(200)

            if problems:
                out.append(finding(
                    target, "escape-and-focus-declared-not-wired", "high",
                    f'modal opened by "{name}"'
                    + (" (native <dialog>)" if st["native"] else " (hand-rolled)")
                    + ": " + "; ".join(problems),
                    "Driven in a browser, not inferred from source. This is the class of "
                    "failure that throws no console error and passes every static check, "
                    "which is why it needed a real keyboard and a real browser to find.",
                    "Stop hand-writing modal behaviour. Native <dialog> opened with "
                    "showModal(), or Radix or React Aria with their defaults left alone, "
                    "supply focus-in, containment, Escape and focus restoration for free. "
                    "If custom code must stay, all four are required and all four need a "
                    "driven test, because source presence is not evidence any of them run."))
        except Exception:
            continue                          # a trigger that navigates or throws is not ours
    return out


# Two WCAG criteria that are a minute of work to test and that nothing in a
# normal review touches, because both need a state the author's browser is not
# in. Neither is visible in a screenshot of the page as shipped.

TEXT_SPACING_CSS = """*, *::before, *::after {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
p { margin-bottom: 2em !important; }"""

SPACING_PROBE = r"""() => {
  const bad = [];
  const sel = el => el.id ? '#' + el.id
    : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  for (const el of document.querySelectorAll('button, a, h1, h2, h3, label, li, th, td, p')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (!(el.innerText || '').trim()) continue;
    const clipped = (cs.overflow === 'hidden' || cs.overflowY === 'hidden')
      && el.scrollHeight > el.clientHeight + 1;
    const wide = (cs.overflow === 'hidden' || cs.overflowX === 'hidden')
      && el.scrollWidth > el.clientWidth + 1;
    if (clipped || wide) bad.push({sel: sel(el), how: clipped ? 'clipped vertically'
                                                             : 'clipped horizontally'});
    if (bad.length >= 8) break;
  }
  return bad;
}"""

FORCED_COLORS_PROBE = r"""() => {
  // Run this in the NORMAL palette. Under forced colors the gradient has already
  // been reverted, so asking what the element relies on after the fact returns
  // nothing -- which is how the first version of this probe silently passed.
  const risky = [];
  const sel = el => el.id ? '#' + el.id
    : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width < 40 || r.height < 20) continue;
    const noBorder = cs.borderTopWidth === '0px' && cs.borderBottomWidth === '0px'
                  && cs.borderLeftWidth === '0px' && cs.borderRightWidth === '0px';
    const hadBg = cs.backgroundImage && cs.backgroundImage !== 'none'
                  && !cs.backgroundImage.includes('url(');
    const hadShadow = cs.boxShadow && cs.boxShadow !== 'none';
    if (noBorder && (hadBg || hadShadow)) {
      el.setAttribute('data-fc-probe', String(risky.length));
      risky.push({sel: sel(el), on: hadBg ? 'a gradient' : 'a shadow'});
    }
    if (risky.length >= 8) break;
  }
  return risky;
}"""

CONFIRM_ERASED_JS = r"""() => {
  // With forced colors active, ask whether the marked elements kept ANY boundary.
  const gone = [];
  for (const el of document.querySelectorAll('[data-fc-probe]')) {
    const cs = getComputedStyle(el);
    const hasBorder = ['Top', 'Bottom', 'Left', 'Right']
      .some(s => parseFloat(cs['border' + s + 'Width']) > 0);
    const hasBg = cs.backgroundImage && cs.backgroundImage !== 'none';
    if (!hasBorder && !hasBg) gone.push(el.getAttribute('data-fc-probe'));
  }
  return gone;
}"""


def probe_text_spacing(page, target):
    """WCAG 1.4.12. Apply the four user values and see what stops fitting."""
    page.add_style_tag(content=TEXT_SPACING_CSS)
    page.wait_for_timeout(200)
    bad = page.evaluate(SPACING_PROBE)
    if not bad:
        return []
    ex = ", ".join(f"{b['sel']} {b['how']}" for b in bad[:4])
    return [finding(
        target, "text-spacing-override-breaks-the-layout", "medium",
        f"{len(bad)} element(s) clip their own text under the WCAG 1.4.12 spacing values: {ex}",
        "A reader with dyslexia raises line height to 1.5, letter spacing to 0.12em and word "
        "spacing to 0.16em, and these controls stop containing their labels. Driven here, not "
        "inferred: the values were applied and the overflow measured. Fixed heights are what "
        "you write when matching a design mock, which is why generated components are full of "
        "them.",
        "min-height instead of height, unitless line-height, and padding rather than a fixed "
        "height to size a control. Never overflow:hidden on a text container unless you are "
        "ellipsising on purpose. Note the criterion applies only to scripts that use these "
        "properties.")]


def probe_forced_colors(page, target):
    """WCAG-adjacent, and only settleable by driving it.

    Mark the elements whose only boundary is a gradient or a shadow while the
    normal palette is still in effect, THEN switch to forced colors and confirm
    the boundary actually vanished. Asking after the switch returns nothing,
    because by then the gradient has already been reverted.
    """
    risky = page.evaluate(FORCED_COLORS_PROBE)
    if not risky:
        return []
    page.emulate_media(forced_colors="active")
    page.wait_for_timeout(200)
    gone = set(page.evaluate(CONFIRM_ERASED_JS))
    page.emulate_media(forced_colors="none")
    erased = [r for i, r in enumerate(risky) if str(i) in gone]
    if not erased:
        return []
    ex = ", ".join(f"{r['sel']} (was {r['on']})" for r in erased[:4])
    return [finding(
        target, "forced-colors-mode-erases-the-interface", "medium",
        f"{len(erased)} element(s) lost their only visible boundary with forced colors "
        f"active: {ex}",
        "Forced colors reverts every background-image that is not a url(), so a card whose "
        "edge was a gradient and a tab whose selected state was a shadow both stop existing. "
        "Confirmed by switching the palette and re-measuring, not inferred from the "
        "stylesheet. It is invisible unless you are on the platform with the setting on, "
        "which nobody on the team is \u2014 and generated UI leans entirely on shadow and "
        "gradient for structure.",
        "Give these elements a real border, and convey state with something forced colors "
        "preserves: a border, an underline, text. Add one @media (forced-colors: active) "
        "block using system colour keywords. Use outline for focus rings, which survives; "
        "box-shadow does not.")]


def run(target, viewports, timeout_ms, probe_modal=False, probe_a11y=False):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("render_check needs Playwright, the one dependency in this bundle:\n"
              "  pip install playwright\n"
              "  playwright install chromium   # skip if the browsers are already present\n"
              "The rest of the skill is stdlib-only and runs without it.",
              file=sys.stderr)
        return None

    url = target
    if not target.startswith(("http://", "https://")):
        p = Path(target).resolve()
        if not p.exists():
            print(f"no such file: {target}", file=sys.stderr)
            return None
        url = p.as_uri()

    # A preinstalled Chromium often does not match the build this Playwright
    # pins, which fails at launch with a download instruction that is wrong when
    # the browser is already on disk. Point at it explicitly instead.
    exe = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
    if not exe:
        for root in (os.environ.get("PLAYWRIGHT_BROWSERS_PATH"), "/opt/pw-browsers"):
            if not root:
                continue
            found = sorted(Path(root).glob("chromium-*/chrome-linux/chrome")) \
                or sorted(Path(root).glob("chromium*/*/headless_shell")) \
                or sorted(Path(root).glob("chromium*/chrome-*/Chromium.app/Contents/MacOS/Chromium"))
            if found:
                exe = str(found[-1])
                break

    out = []
    with sync_playwright() as pw:
        try:
            browser = pw.chromium.launch(executable_path=exe) if exe else pw.chromium.launch()
        except Exception as e:
            print(f"could not launch Chromium: {e}\n"
                  "Set PLAYWRIGHT_CHROMIUM_EXECUTABLE to a Chrome/Chromium binary, or "
                  "run `playwright install chromium`.", file=sys.stderr)
            return None
        for name, w, h in viewports:
            page = browser.new_page(viewport={"width": w, "height": h})
            try:
                page.goto(url, wait_until="networkidle", timeout=timeout_ms)
            except Exception:
                page.goto(url, timeout=timeout_ms)       # networkidle can never settle
            page.wait_for_timeout(250)
            r = page.evaluate(PROBE)
            out += interpret(target, name, w, r)
            if probe_modal and name == "desktop":
                out += probe_modals(page, target)
            if probe_a11y and name == "desktop":
                # forced colors first: the spacing probe mutates the page.
                out += probe_forced_colors(page, target)
                out += probe_text_spacing(page, target)
            page.close()
        browser.close()
    return out


def interpret(target, vp, width, r):
    out = []
    over = r.get("overflow") or []
    if r["scrollWidth"] > r["innerWidth"] + 1:
        worst = ", ".join(f"{o['sel']} ({o['width']}px)" for o in over[:4]) or "unknown element"
        out.append(finding(
            target, "horizontal-overflow-at-mobile",
            # 320px is a WCAG 1.4.10 conformance failure, not a lesser version of
            # the phone case, so it ranks with it rather than below it.
            "high" if vp in ("mobile", "reflow-320") else "medium",
            f"{vp} {width}px: page scrolls to {r['scrollWidth']}px. Widest offenders: {worst}",
            ("The page scrolls sideways at this width. This is the single most common "
             "failure of a site styled to look like a framework without being built with "
             "one, and it is not a matter of taste: content is off screen."
             + (" At 320px this is also a WCAG 1.4.10 Reflow failure, which is the width "
                "a 1280px screen reaches at 400% zoom." if vp == "reflow-320" else "")),
            "Fix the named elements first, outermost one first. The usual causes are a "
            "fixed pixel width that wants max-width:100%, a grid with a hardcoded column "
            "count that needs a single-column form below the breakpoint, 100vw where "
            "100% was meant, and a long unbroken string that needs overflow-wrap:anywhere."))

    taps = r.get("taps") or []
    if vp == "mobile" and len(taps) >= 2:
        ex = ", ".join(f"{t['sel']} {t['w']}x{t['h']}" for t in taps[:4])
        out.append(finding(
            target, "tap-target-too-small", "medium",
            f"{len(taps)} interactive targets under 44x44 at {width}px: {ex}",
            "Controls too small to hit reliably with a thumb. Desktop-first styling that "
            "was never checked on a phone produces this every time.",
            "Give interactive elements a minimum 44x44 hit area: min-height and "
            "min-width, or padding on the control rather than on its container. Inline "
            "text links in prose are exempt."))

    small = r.get("small") or []
    if small:
        ex = ", ".join(f"{s['sel']} {s['px']}px" for s in small[:4])
        out.append(finding(
            target, "body-text-below-readable", "medium",
            f"{len(small)} text elements rendering under 12px at {vp}: {ex}",
            "Text below about 12px is not readable for a lot of people and triggers "
            "zoom-on-focus on iOS for form fields.",
            "Floor body text at 16px and secondary text at 14px. If the layout only "
            "works at 11px, the layout is too dense, not the type too large."))

    con = r.get("contrast") or []
    if con:
        ex = "; ".join(f"{c['sel']} {c['ratio']}:1 (needs {c['need']}:1)" for c in con[:4])
        out.append(finding(
            target, "wcag-fail-from-generated-palette", "high",
            f"{len(con)} text elements below WCAG AA contrast at {vp}: {ex}",
            "A palette chosen for how it looked in a hero screenshot rather than for "
            "whether anyone can read it. The muted-grey-on-white default is the usual "
            "culprit.",
            "Darken the foreground until it passes: 4.5:1 for body text, 3:1 for text "
            "at 24px or 18.66px bold. Fix the token once rather than each element."))

    meas = r.get("measure") or []
    if meas and vp == "desktop":
        ex = ", ".join(f"{m['sel']} {m['cpl']} chars" for m in meas[:4])
        out.append(finding(
            target, "measure-past-75-characters", "medium",
            f"{len(meas)} text blocks over 85 characters per line at {width}px: {ex}",
            "Body text running the full width of a wide container. The eye loses its "
            "place returning to the start of each line, and the reader's error rate goes "
            "up with every extra character. Nobody decided this width; the layout's "
            "width became the text's width.",
            "Constrain the text column rather than the page: max-width around 65ch on "
            "the element that holds prose, or a grid whose text column is narrower than "
            "its media column. 45 to 75 characters is the conventional range and 66 is "
            "the usual target."))

    nd = r.get("noDim") or []
    if nd:
        out.append(finding(
            target, "image-without-dimensions", "low",
            f"{len(nd)} images with no width/height attributes, e.g. {nd[0]['sel']}",
            "Images without intrinsic dimensions shift the layout as they load, which "
            "moves what someone is reading or about to tap.",
            "Set width and height attributes to the real pixel dimensions and let CSS "
            "scale them. The browser reserves the space before the bytes arrive."))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("target", help="URL, or a path to a local HTML file")
    ap.add_argument("--json", default="render-findings.json",
                    help="write findings here for humanize_review.py --findings")
    ap.add_argument("--viewport", action="append", default=[],
                    metavar="NAME:WxH", help="override viewports, repeatable")
    ap.add_argument("--timeout", type=int, default=20000)
    ap.add_argument("--probe-a11y", action="store_true",
                    help="apply the WCAG 1.4.12 text-spacing values and emulate forced colors, "
                         "then measure what stops fitting and what stops being visible. Two "
                         "criteria nobody tests because both need a state the author's browser "
                         "is not in.")
    ap.add_argument("--probe-modals", action="store_true",
                    help="open each plausible trigger and test the four modal behaviours: focus in, Escape closes, Tab contained, focus restored. The one check source review cannot settle.")
    args = ap.parse_args()

    vps = VIEWPORTS
    if args.viewport:
        vps = []
        for v in args.viewport:
            name, _, dims = v.partition(":")
            w, _, h = dims.partition("x")
            vps.append((name, int(w), int(h)))

    res = run(args.target, vps, args.timeout, probe_modal=args.probe_modals,
              probe_a11y=args.probe_a11y)
    if res is None:
        sys.exit(2)

    # Contrast and font size do not change with viewport unless a media query
    # changes them, so reporting the same failure once per viewport is three
    # rows for one bug. Overflow and tap targets ARE viewport-dependent and stay
    # per-viewport, because "breaks on a phone, fine on a laptop" is the finding.
    VIEWPORT_INDEPENDENT = {"wcag-fail-from-generated-palette",
                            "body-text-below-readable", "image-without-dimensions"}
    seen, deduped = set(), []
    for f in res:
        if f["ism"] in VIEWPORT_INDEPENDENT:
            key = (f["ism"], f["excerpt"].split(":", 1)[-1])
            if key in seen:
                continue
            seen.add(key)
            f["excerpt"] = f["excerpt"].replace(
                f" at {vps[0][0]}", " at every viewport tested")
        deduped.append(f)
    res = deduped
    Path(args.json).write_text(json.dumps(res, indent=2), encoding="utf-8")
    print(f"wrote {args.json} ({len(res)} findings across {len(vps)} viewport(s))")
    for f in res:
        print(f"  {f['severity']:6} {f['ism']:32} {f['excerpt'][:74]}")


if __name__ == "__main__":
    main()
