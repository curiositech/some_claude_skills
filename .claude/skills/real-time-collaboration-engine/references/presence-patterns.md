# Presence Awareness Patterns

Complete guide to implementing cursors, user awareness, and activity indicators in collaborative apps.

## Why Presence Matters

**Without presence**:
- Users edit same section → conflicts
- No awareness of team activity
- Feels like working alone

**With presence**:
- See who's editing what → avoid conflicts
- Feel connected to team
- Trust the system is working

**Impact**: 40% fewer edit conflicts (Google Docs study)

---

## Pattern 1: User List (Who's Here)

### Basic Implementation

```typescript
interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
  joinedAt: number;
}

// Server
const activeUsers = new Map<string, User>();

io.on('connection', (socket) => {
  socket.on('join', (user: User) => {
    activeUsers.set(socket.id, user);

    // Broadcast to others
    socket.broadcast.emit('user-joined', user);

    // Send current users to new joiner
    socket.emit('users-list', Array.from(activeUsers.values()));
  });

  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    activeUsers.delete(socket.id);

    if (user) {
      io.emit('user-left', { userId: user.id });
    }
  });
});
```

### React Component

```typescript
import { useEffect, useState } from 'react';

function UserList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    socket.on('users-list', (userList) => {
      setUsers(userList);
    });

    socket.on('user-joined', (user) => {
      setUsers(prev => [...prev, user]);
    });

    socket.on('user-left', ({ userId }) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
    });

    return () => {
      socket.off('users-list');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, []);

  return (
    <div className="user-list">
      <h3>{users.length} online</h3>
      {users.map(user => (
        <div key={user.id} className="user-avatar">
          <img src={user.avatar} alt={user.name} />
          <span style={{ color: user.color }}>{user.name}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## Pattern 2: Cursor Tracking

### Server-Side Throttling

```typescript
const CURSOR_UPDATE_INTERVAL = 50; // ms
const userCursors = new Map<string, { position: Position; timestamp: number }>();

io.on('connection', (socket) => {
  let lastCursorUpdate = 0;

  socket.on('cursor-move', (position: Position) => {
    const now = Date.now();

    // Throttle updates
    if (now - lastCursorUpdate < CURSOR_UPDATE_INTERVAL) {
      return;
    }

    lastCursorUpdate = now;
    userCursors.set(socket.id, { position, timestamp: now });

    // Broadcast to room (excluding sender)
    socket.to(socket.roomId).emit('cursor-update', {
      userId: socket.userId,
      position,
      user: socket.user
    });
  });

  socket.on('disconnect', () => {
    userCursors.delete(socket.id);
    socket.to(socket.roomId).emit('cursor-remove', { userId: socket.userId });
  });
});
```

### Client-Side Rendering

```typescript
interface Cursor {
  userId: string;
  position: { x: number; y: number };
  user: User;
}

function CursorOverlay() {
  const [cursors, setCursors] = useState<Map<string, Cursor>>(new Map());

  useEffect(() => {
    socket.on('cursor-update', ({ userId, position, user }) => {
      setCursors(prev => new Map(prev).set(userId, { userId, position, user }));
    });

    socket.on('cursor-remove', ({ userId }) => {
      setCursors(prev => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    });

    // Fade out stale cursors
    const interval = setInterval(() => {
      const now = Date.now();
      setCursors(prev => {
        const next = new Map(prev);
        for (const [userId, cursor] of next) {
          if (now - cursor.timestamp > 3000) {
            next.delete(userId);
          }
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      socket.off('cursor-update');
      socket.off('cursor-remove');
    };
  }, []);

  return (
    <>
      {Array.from(cursors.values()).map(cursor => (
        <RemoteCursor
          key={cursor.userId}
          position={cursor.position}
          color={cursor.user.color}
          name={cursor.user.name}
        />
      ))}
    </>
  );
}

function RemoteCursor({ position, color, name }: {
  position: { x: number; y: number };
  color: string;
  name: string;
}) {
  return (
    <div
      className="remote-cursor"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
        transition: 'all 50ms linear'
      }}
    >
      {/* Cursor SVG */}
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path
          d="M5 3l14 9-6 1-3 6-5-16z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      {/* Name label */}
      <div
        className="cursor-label"
        style={{
          backgroundColor: color,
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '12px',
          marginLeft: '24px',
          whiteSpace: 'nowrap'
        }}
      >
        {name}
      </div>
    </div>
  );
}
```

---

## Pattern 3: Text Selection Highlighting

### Track Selection Ranges

```typescript
interface Selection {
  start: number;
  end: number;
}

interface UserSelection {
  userId: string;
  selection: Selection;
  user: User;
}

function EditorWithSelections() {
  const [selections, setSelections] = useState<Map<string, UserSelection>>(new Map());
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const handleSelectionChange = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = {
      start: editor.selectionStart,
      end: editor.selectionEnd
    };

    // Only send if actually selecting (not just cursor)
    if (selection.start !== selection.end) {
      socket.emit('selection-change', selection);
    }
  };

  useEffect(() => {
    socket.on('user-selection', ({ userId, selection, user }) => {
      setSelections(prev => new Map(prev).set(userId, { userId, selection, user }));
    });

    return () => socket.off('user-selection');
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {/* Highlight layers (behind text) */}
      {Array.from(selections.values()).map(({ userId, selection, user }) => (
        <SelectionHighlight
          key={userId}
          start={selection.start}
          end={selection.end}
          color={user.color}
        />
      ))}

      {/* Actual editor */}
      <textarea
        ref={editorRef}
        onSelect={handleSelectionChange}
        onBlur={() => socket.emit('selection-clear')}
      />
    </div>
  );
}
```

---

## Pattern 4: "User is Typing..." Indicator

### Debounced Typing Status

```typescript
function TypingIndicator() {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTyping = () => {
    socket.emit('typing-start');

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop');
    }, 2000);
  };

  useEffect(() => {
    socket.on('user-typing-start', ({ userId }) => {
      setTypingUsers(prev => new Set(prev).add(userId));
    });

    socket.on('user-typing-stop', ({ userId }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.off('user-typing-start');
      socket.off('user-typing-stop');
    };
  }, []);

  if (typingUsers.size === 0) return null;

  const names = Array.from(typingUsers).map(id => getUserName(id));

  return (
    <div className="typing-indicator">
      {names.join(', ')} {names.length === 1 ? 'is' : 'are'} typing...
      <span className="typing-dots">
        <span>.</span><span>.</span><span>.</span>
      </span>
    </div>
  );
}
```

**CSS Animation**:

```css
.typing-dots span {
  animation: blink 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%, 60%, 100% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
}
```

---

## Pattern 5: Focus/Blur (Tab Active)

### Track User Activity

```typescript
// Server
const userActivity = new Map<string, {
  isActive: boolean;
  lastSeen: number;
}>();

io.on('connection', (socket) => {
  socket.on('user-active', () => {
    userActivity.set(socket.id, {
      isActive: true,
      lastSeen: Date.now()
    });

    socket.broadcast.emit('user-status-change', {
      userId: socket.userId,
      isActive: true
    });
  });

  socket.on('user-idle', () => {
    userActivity.set(socket.id, {
      isActive: false,
      lastSeen: Date.now()
    });

    socket.broadcast.emit('user-status-change', {
      userId: socket.userId,
      isActive: false
    });
  });
});

// Client
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      socket.emit('user-idle');
    } else {
      socket.emit('user-active');
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
```

### Visual Indicator

```typescript
function UserAvatar({ user, isActive }: { user: User; isActive: boolean }) {
  return (
    <div className="user-avatar" data-active={isActive}>
      <img src={user.avatar} alt={user.name} />

      {/* Active indicator (green dot) */}
      <span
        className="active-indicator"
        style={{
          backgroundColor: isActive ? '#00ff00' : '#999',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          border: '2px solid white'
        }}
      />
    </div>
  );
}
```

---

## Pattern 6: Viewport Tracking

**Problem**: Know what part of document others are viewing

```typescript
interface Viewport {
  top: number;
  bottom: number;
}

function ViewportTracker() {
  const throttledUpdateRef = useRef<NodeJS.Timeout>();

  const updateViewport = () => {
    const viewport = {
      top: window.scrollY,
      bottom: window.scrollY + window.innerHeight
    };

    socket.emit('viewport-change', viewport);
  };

  const handleScroll = () => {
    // Throttle to max 2 updates per second
    if (throttledUpdateRef.current) {
      clearTimeout(throttledUpdateRef.current);
    }

    throttledUpdateRef.current = setTimeout(updateViewport, 500);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}

// Visualize where others are
function ViewportIndicators({ users }: { users: UserViewport[] }) {
  return (
    <div className="viewport-indicators">
      {users.map(user => (
        <div
          key={user.id}
          className="viewport-bar"
          style={{
            position: 'fixed',
            right: 0,
            top: `${(user.viewport.top / documentHeight) * 100}%`,
            height: `${((user.viewport.bottom - user.viewport.top) / documentHeight) * 100}%`,
            width: '4px',
            backgroundColor: user.color,
            opacity: 0.5
          }}
        />
      ))}
    </div>
  );
}
```

---

## Pattern 7: Awareness State (Yjs)

**Best Practice**: Use Yjs awareness for automatic cleanup

```typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const ydoc = new Y.Doc();
const provider = new WebsocketProvider('ws://localhost:1234', 'room', ydoc);
const awareness = provider.awareness;

// Set local user state
awareness.setLocalState({
  user: {
    name: 'Alice',
    color: '#ff0000',
    avatar: '/avatars/alice.jpg'
  },
  cursor: null,
  selection: null
});

// Update cursor
const updateCursor = (position: Position) => {
  awareness.setLocalStateField('cursor', position);
};

// Listen to others
awareness.on('change', ({ added, updated, removed }) => {
  const states = awareness.getStates();

  states.forEach((state, clientId) => {
    if (clientId !== awareness.clientID) {
      // Render remote cursor
      renderCursor(state.user, state.cursor);
    }
  });

  // Clean up removed users
  removed.forEach(clientId => {
    removeCursor(clientId);
  });
});
```

**Benefits**:
- Automatic cleanup on disconnect
- Built-in timeout mechanism
- No manual event management

---

## Performance Optimization

### Throttling Cursor Updates

```typescript
import { throttle } from 'lodash-es';

const emitCursor = throttle((position: Position) => {
  socket.emit('cursor-move', position);
}, 50);  // Max 20 updates/second

document.addEventListener('mousemove', (e) => {
  emitCursor({ x: e.clientX, y: e.clientY });
});
```

### Spatial Partitioning (Only Send to Nearby Users)

```typescript
// Server-side: Only broadcast to users in same viewport region
function getRegion(position: Position): string {
  const regionX = Math.floor(position.x / 1000);
  const regionY = Math.floor(position.y / 1000);
  return `${regionX},${regionY}`;
}

socket.on('cursor-move', (position) => {
  const region = getRegion(position);

  // Only emit to users in same region
  socket.to(`region-${region}`).emit('cursor-update', {
    userId: socket.userId,
    position
  });
});
```

---

## Production Checklist

```
□ User list with join/leave notifications
□ Cursor tracking (throttled to 50ms)
□ Selection highlighting (for text editors)
□ "User is typing..." indicator (debounced)
□ Focus/blur activity status
□ Viewport tracking (for long documents)
□ Automatic cleanup on disconnect
□ Stale state timeout (fade after 3 seconds)
□ Throttling (max 20 updates/second)
□ Privacy controls (hide cursor option)
```

---

## Resources

- [Yjs Awareness Protocol](https://docs.yjs.dev/getting-started/working-with-the-awareness-protocol)
- [Figma Multiplayer Cursors](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- [Linear's Real-Time Collaboration](https://linear.app/blog/how-we-built-it-real-time-sync)
