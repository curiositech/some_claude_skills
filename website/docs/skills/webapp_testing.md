---
name: webapp-testing
description: "Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs. Activate on: Playwright, webapp testing, browser automation, E2E testing, UI testing. NOT for API-only testing without browser, unit tests, or mobile app testing."
allowed-tools: Read,Write,Edit,Bash,Glob,Grep
---

# Web Application Testing

Write native Python Playwright scripts to test local web applications.

## When to Use

✅ **Use for:**
- E2E testing of web applications
- UI automation and interaction testing
- Visual regression testing
- Browser log capture and debugging
- Screenshot capture for verification
- Form submission and validation testing

❌ **NOT for:**
- API-only testing without a browser (use requests/httpx)
- Unit testing of individual functions
- Mobile app testing (use Appium)
- Load/performance testing (use k6/Locust)

## Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Start server first, then run Playwright
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

## Core Playwright Patterns

### Basic Test Structure

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)  # Always headless
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')  # CRITICAL for SPAs

    # ... your test logic

    browser.close()
```

### Reconnaissance-Then-Action Pattern

**Step 1: Inspect rendered DOM**
```python
page.screenshot(path='/tmp/inspect.png', full_page=True)
content = page.content()
buttons = page.locator('button').all()
```

**Step 2: Identify selectors** from inspection results

**Step 3: Execute actions** using discovered selectors

## Selector Strategy (Priority Order)

1. **Role-based** (best for accessibility):
   ```python
   page.get_by_role("button", name="Submit")
   page.get_by_role("textbox", name="Email")
   ```

2. **Text-based** (readable, but fragile to copy changes):
   ```python
   page.get_by_text("Sign In")
   page.get_by_label("Password")
   ```

3. **Test IDs** (stable, explicit):
   ```python
   page.get_by_test_id("login-button")
   ```

4. **CSS selectors** (last resort):
   ```python
   page.locator(".btn-primary")
   page.locator("#submit-form")
   ```

## Common Anti-Patterns

### Anti-Pattern: Not Waiting for Network Idle

**Symptom**: Tests pass locally, fail in CI; elements not found

**Problem**: Modern SPAs load content dynamically after initial page load

**Solution**:
```python
# ❌ Wrong
page.goto('http://localhost:3000')
page.click('button')  # Element may not exist yet

# ✅ Correct
page.goto('http://localhost:3000')
page.wait_for_load_state('networkidle')
page.click('button')
```

### Anti-Pattern: Hardcoded Waits

**Symptom**: `time.sleep(3)` scattered throughout tests

**Problem**: Slow, unreliable, doesn't adapt to actual page state

**Solution**:
```python
# ❌ Wrong
time.sleep(5)
page.click('.dynamic-button')

# ✅ Correct
page.wait_for_selector('.dynamic-button', state='visible')
page.click('.dynamic-button')
```

### Anti-Pattern: Inspecting DOM Before JavaScript Executes

**Symptom**: Empty page content, missing elements in static analysis

**Problem**: Reading HTML before client-side rendering completes

**Solution**: Always wait for `networkidle` on dynamic apps before inspection

## Waiting Strategies

```python
# Wait for element to appear
page.wait_for_selector('#my-element')

# Wait for element to be visible
page.wait_for_selector('#my-element', state='visible')

# Wait for element to be hidden
page.wait_for_selector('#my-element', state='hidden')

# Wait for navigation
page.wait_for_url('**/dashboard')

# Wait for network idle (all requests complete)
page.wait_for_load_state('networkidle')

# Custom wait with timeout
page.wait_for_function('document.querySelector(".loaded")')
```

## Screenshot Patterns

```python
# Full page screenshot
page.screenshot(path='/tmp/full.png', full_page=True)

# Element screenshot
page.locator('#header').screenshot(path='/tmp/header.png')

# Before/after comparison
page.screenshot(path='/tmp/before.png')
# ... perform action ...
page.screenshot(path='/tmp/after.png')
```

## Console Log Capture

```python
# Capture all console messages
messages = []
page.on('console', lambda msg: messages.append({
    'type': msg.type,
    'text': msg.text
}))

# Filter errors only
page.on('console', lambda msg:
    print(f'ERROR: {msg.text}') if msg.type == 'error' else None
)
```

## Form Testing

```python
# Fill form fields
page.fill('#email', 'test@example.com')
page.fill('#password', 'secret123')

# Select dropdown
page.select_option('#country', 'US')

# Check checkbox
page.check('#terms')

# Submit form
page.click('button[type="submit"]')

# Verify submission
page.wait_for_url('**/success')
```

## Assertions

```python
from playwright.sync_api import expect

# Element assertions
expect(page.locator('#title')).to_have_text('Welcome')
expect(page.locator('#count')).to_have_text('5')
expect(page.locator('.error')).to_be_hidden()
expect(page.locator('#submit')).to_be_enabled()

# Page assertions
expect(page).to_have_url('http://localhost:3000/dashboard')
expect(page).to_have_title('My App')
```

## Multi-Page Scenarios

```python
# Handle popup windows
with page.expect_popup() as popup_info:
    page.click('#open-popup')
popup = popup_info.value
popup.wait_for_load_state()

# Handle new tabs
with context.expect_page() as new_page_info:
    page.click('a[target="_blank"]')
new_page = new_page_info.value
```

## Test File Organization

```
tests/
├── conftest.py          # Shared fixtures
├── test_login.py        # Login flows
├── test_dashboard.py    # Dashboard features
├── test_forms.py        # Form submissions
└── screenshots/         # Visual artifacts
```

## Running Tests

```bash
# Run single test file
python -m pytest tests/test_login.py

# Run with browser visible (debugging)
PWDEBUG=1 python -m pytest tests/test_login.py

# Generate trace for debugging
python -m pytest --tracing=on tests/test_login.py
```

## Best Practices

1. **Use `sync_playwright()`** for synchronous scripts
2. **Always close the browser** when done
3. **Use descriptive selectors**: role, text, test-id over CSS
4. **Add appropriate waits**: `wait_for_selector()`, `wait_for_load_state()`
5. **Capture screenshots on failure** for debugging
6. **Keep tests independent** - each test should set up its own state

---

**This skill encodes**: Playwright best practices | Selector strategies | Wait patterns | Anti-pattern prevention | E2E testing workflows
