---
title: Component Patterns
sidebar_label: Component Patterns
sidebar_position: 2
---
# Component Patterns

Complete CSS for all Win31 UI components.

## Window Chrome

```jsx
<div className="win31-window">
  {/* Title Bar */}
  <div className="win31-titlebar">
    <div className="win31-titlebar__left">
      <div className="win31-btn-3d win31-btn-3d--small">─</div>
    </div>
    <span className="win31-title-text">PROGRAM.EXE</span>
    <div className="win31-titlebar__right">
      <div className="win31-btn-3d win31-btn-3d--small">▲</div>
      <div className="win31-btn-3d win31-btn-3d--small">▼</div>
    </div>
  </div>

  {/* Content Area */}
  <div className="win31-content">
    {/* Your content here */}
  </div>

  {/* Optional Status Bar */}
  <div className="win31-statusbar">
    <div className="win31-statusbar-panel">Ready</div>
  </div>
</div>
```

```css
.win31-window {
  background: var(--win31-gray);
  border: 3px solid var(--win31-black);
  box-shadow:
    inset 2px 2px 0 var(--win31-white),
    inset -2px -2px 0 var(--win31-dark-gray);
}

.win31-titlebar {
  background: var(--win31-navy);
  color: var(--win31-white);
  padding: 4px 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-pixel);
  font-size: 12px;
  font-weight: bold;
}

.win31-content {
  padding: 12px;
  background: var(--win31-gray);
}

.win31-statusbar {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: var(--win31-gray);
  border-top: 2px solid var(--win31-dark-gray);
}

.win31-statusbar-panel {
  flex: 1;
  padding: 2px 8px;
  font-family: var(--font-pixel);
  font-size: 11px;
  border: 1px solid;
  border-color: var(--win31-dark-gray) var(--win31-white) var(--win31-white) var(--win31-dark-gray);
}
```

## 3D Push Buttons

```css
.win31-btn-3d {
  background: var(--win31-gray);
  border: none;
  padding: 8px 16px;
  font-family: var(--font-pixel);
  font-size: 12px;
  cursor: pointer;

  /* The magic bevel */
  box-shadow:
    inset -2px -2px 0 var(--win31-dark-gray),
    inset 2px 2px 0 var(--win31-white),
    inset -3px -3px 0 var(--win31-black),
    inset 3px 3px 0 var(--win31-light-gray);
}

.win31-btn-3d:hover {
  background: var(--win31-light-gray);
}

.win31-btn-3d:active,
.win31-btn-3d--pressed {
  box-shadow:
    inset 2px 2px 0 var(--win31-dark-gray),
    inset -2px -2px 0 var(--win31-white),
    inset 3px 3px 0 var(--win31-black),
    inset -3px -3px 0 var(--win31-light-gray);
  padding: 9px 15px 7px 17px; /* Shift content down-right */
}

/* Default button (highlighted action) */
.win31-btn-3d--default {
  border: 2px solid var(--win31-black);
}

/* Small variant for titlebar buttons */
.win31-btn-3d--small {
  padding: 2px 6px;
  font-size: 10px;
  min-width: 20px;
}
```

## Form Controls

### Text Input

```css
.win31-input {
  background: var(--win31-white);
  border: 2px solid;
  border-color: var(--win31-dark-gray) var(--win31-white) var(--win31-white) var(--win31-dark-gray);
  box-shadow: inset 1px 1px 0 var(--win31-black);
  padding: 4px 8px;
  font-family: var(--font-code);
  font-size: 12px;
}

.win31-input:focus {
  outline: none;
  border-color: var(--win31-navy);
}
```

### Checkbox

```css
.win31-checkbox {
  appearance: none;
  width: 13px;
  height: 13px;
  background: var(--win31-white);
  border: 2px solid;
  border-color: var(--win31-dark-gray) var(--win31-white) var(--win31-white) var(--win31-dark-gray);
  box-shadow: inset 1px 1px 0 var(--win31-black);
}

.win31-checkbox:checked::after {
  content: '✓';
  display: block;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  line-height: 11px;
}
```

## Panels and Groups

```css
/* Raised panel (toolbar, button group) */
.win31-panel-raised {
  background: var(--win31-gray);
  border: 2px solid;
  border-color: var(--win31-white) var(--win31-black) var(--win31-black) var(--win31-white);
  padding: 8px;
}

/* Sunken panel (content area, list) */
.win31-panel-inset {
  background: var(--win31-white);
  border: 2px solid;
  border-color: var(--win31-dark-gray) var(--win31-white) var(--win31-white) var(--win31-dark-gray);
  box-shadow: inset 1px 1px 0 var(--win31-black);
  padding: 8px;
}

/* Group box (labeled section) */
.win31-groupbox {
  border: 2px solid var(--win31-dark-gray);
  padding: 16px 12px 12px;
  margin-top: 8px;
  position: relative;
}

.win31-groupbox__label {
  position: absolute;
  top: -8px;
  left: 12px;
  background: var(--win31-gray);
  padding: 0 6px;
  font-family: var(--font-pixel);
  font-size: 11px;
}
```

## Responsive Considerations

```css
/* Mobile: Stack windows vertically */
@media (max-width: 768px) {
  .win31-window {
    width: 100%;
    margin-bottom: 16px;
  }

  .win31-content {
    padding: 8px;
  }

  .win31-titlebar {
    font-size: 10px;
  }
}

/* Desktop: Allow side-by-side */
@media (min-width: 769px) {
  .win31-window-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }
}
```
