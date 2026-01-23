# Gesture Hooks

Touch gesture handling for mobile interactions.

## useSwipe Hook

Directional swipe detection with configurable threshold.

```tsx
// hooks/useSwipe.ts
'use client';

import { useRef, TouchEvent } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;  // Minimum distance in pixels (default: 50)
}

export function useSwipe(config: SwipeConfig) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const threshold = config.threshold ?? 50;

  const handleTouchStart = (e: TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current) return;

    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;

    // Determine primary direction (larger delta wins)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold) config.onSwipeRight?.();
      if (deltaX < -threshold) config.onSwipeLeft?.();
    } else {
      if (deltaY > threshold) config.onSwipeDown?.();
      if (deltaY < -threshold) config.onSwipeUp?.();
    }

    touchStart.current = null;
  };

  return { handleTouchStart, handleTouchEnd };
}
```

### Usage

```tsx
function ImageGallery({ images, currentIndex, setCurrentIndex }) {
  const { handleTouchStart, handleTouchEnd } = useSwipe({
    onSwipeLeft: () => setCurrentIndex(i => Math.min(i + 1, images.length - 1)),
    onSwipeRight: () => setCurrentIndex(i => Math.max(i - 1, 0)),
    threshold: 75,  // Require more deliberate swipes
  });

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img src={images[currentIndex]} alt="" />
    </div>
  );
}
```

**Key patterns:**
- Only fires when threshold exceeded (prevents accidental triggers)
- Primary direction detection (no diagonal confusion)
- Optional callbacks for each direction
- Refs for touch state (no re-renders during gesture)

---

## usePullToRefresh Hook

Pull-to-refresh with visual feedback and resistance.

```tsx
// hooks/usePullToRefresh.ts
'use client';

import { useState, useRef } from 'react';

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80;  // Pixels to pull before triggering

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start if at top of scroll container
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);

    // Apply resistance (0.5x) and cap at 120px
    setPullDistance(Math.min(distance * 0.5, 120));
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    startY.current = null;
  };

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
```

### Usage with Visual Indicator

```tsx
function RefreshableList({ items, onRefresh }) {
  const { containerRef, pullDistance, isRefreshing, handlers } =
    usePullToRefresh(onRefresh);

  return (
    <div
      ref={containerRef}
      {...handlers}
      className="h-full overflow-y-auto"
    >
      {/* Pull indicator */}
      <div
        className="flex justify-center items-center overflow-hidden transition-all"
        style={{ height: pullDistance }}
      >
        {isRefreshing ? (
          <Spinner className="w-6 h-6 animate-spin" />
        ) : (
          <ArrowDown
            className="w-6 h-6 transition-transform"
            style={{
              transform: `rotate(${Math.min(pullDistance / threshold, 1) * 180}deg)`
            }}
          />
        )}
      </div>

      {/* Content */}
      {items.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  );
}
```

**Key patterns:**
- Only activates at scroll top (doesn't hijack normal scrolling)
- 0.5x resistance feels natural (not 1:1 with finger movement)
- 120px cap prevents over-pull
- Arrow rotates as progress indicator
- Async refresh with loading state
