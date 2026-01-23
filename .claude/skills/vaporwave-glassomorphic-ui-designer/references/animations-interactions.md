# Animations & Micro-Interactions

SwiftUI animations, button styles, and interactive elements for vaporwave-glass UI.

## Button Styles

### Bouncy Neon Button

```swift
struct BouncyNeonButton: ButtonStyle {
    @State private var isHovered = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 24)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(
                        LinearGradient(
                            colors: [.vaporwavePink, .vaporwavePurple],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.white.opacity(0.5), lineWidth: 2)
            )
            // Glow effect
            .shadow(color: .vaporwavePink.opacity(0.6), radius: 15, y: 0)
            .shadow(color: .vaporwavePink.opacity(0.3), radius: 30, y: 0)
            // Press animation
            .scaleEffect(configuration.isPressed ? 0.92 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

// Usage
Button("Create Collage") { /* action */ }
    .buttonStyle(BouncyNeonButton())
```

### Glass Button

```swift
struct GlassButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(
                        LinearGradient(
                            colors: [.white.opacity(0.6), .white.opacity(0.2)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .opacity(configuration.isPressed ? 0.9 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}
```

### Button Variants System

```swift
enum VaporwaveButtonStyle {
    case primary      // Gradient fill, neon glow
    case secondary    // Glass with border
    case minimal      // Text only with underline glow
}

struct VaporwaveButton: View {
    let title: String
    let style: VaporwaveButtonStyle
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.vaporwaveBody)
                .fontWeight(.semibold)
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
        }
        .buttonStyle(styleForType)
    }

    @ViewBuilder
    private var styleForType: some ButtonStyle {
        switch style {
        case .primary:
            PrimaryVaporwaveButtonStyle()
        case .secondary:
            SecondaryGlassButtonStyle()
        case .minimal:
            MinimalGlowButtonStyle()
        }
    }
}

struct PrimaryVaporwaveButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundColor(.white)
            .background(
                LinearGradient(
                    colors: [.vaporwavePink, .vaporwaveCyan],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .shadow(color: .vaporwaveCyan.opacity(0.5), radius: 15, y: 8)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.spring(response: 0.3), value: configuration.isPressed)
    }
}
```

## Staggered Animations

### Cascading List Animation

```swift
struct StaggeredList: View {
    let items: [String]
    @State private var animatedItems: Set<String> = []

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                HStack {
                    Circle()
                        .fill(.vaporwaveCyan)
                        .frame(width: 8, height: 8)
                    Text(item)
                        .font(.vaporwaveBody)
                }
                .opacity(animatedItems.contains(item) ? 1.0 : 0.0)
                .offset(x: animatedItems.contains(item) ? 0 : -20)
            }
        }
        .onAppear {
            for (index, item) in items.enumerated() {
                DispatchQueue.main.asyncAfter(deadline: .now() + Double(index) * 0.1) {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                        animatedItems.insert(item)
                    }
                }
            }
        }
    }
}
```

### Grid Reveal Animation

```swift
struct AnimatedPhotoGrid: View {
    let photos: [Photo]
    @State private var visiblePhotos: Set<UUID> = []

    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 100))], spacing: 12) {
            ForEach(Array(photos.enumerated()), id: \.element.id) { index, photo in
                PhotoThumbnail(photo: photo)
                    .opacity(visiblePhotos.contains(photo.id) ? 1.0 : 0.0)
                    .scaleEffect(visiblePhotos.contains(photo.id) ? 1.0 : 0.8)
                    .onAppear {
                        // Stagger based on grid position
                        let row = index / 3
                        let col = index % 3
                        let delay = Double(row + col) * 0.05

                        DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
                            withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                                visiblePhotos.insert(photo.id)
                            }
                        }
                    }
            }
        }
    }
}
```

## Glow Effects

### Pulsing Glow

```swift
struct PulsingGlow: ViewModifier {
    let color: Color
    let intensity: CGFloat
    @State private var isGlowing = false

    func body(content: Content) -> some View {
        content
            .shadow(
                color: color.opacity(isGlowing ? intensity : intensity * 0.3),
                radius: isGlowing ? 20 : 10,
                y: 0
            )
            .onAppear {
                withAnimation(
                    .easeInOut(duration: 1.5)
                    .repeatForever(autoreverses: true)
                ) {
                    isGlowing = true
                }
            }
    }
}

extension View {
    func pulsingGlow(color: Color = .vaporwaveCyan, intensity: CGFloat = 0.6) -> some View {
        modifier(PulsingGlow(color: color, intensity: intensity))
    }
}
```

### Reactive Glow (Responds to Interaction)

```swift
struct ReactiveGlowButton: View {
    @State private var isPressed = false
    @State private var glowRadius: CGFloat = 10

    var body: some View {
        Button(action: {
            // Action
        }) {
            Text("Tap Me")
                .padding()
                .background(.vaporwavePink)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .shadow(color: .vaporwavePink.opacity(0.8), radius: glowRadius)
        }
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    withAnimation(.spring(response: 0.2)) {
                        isPressed = true
                        glowRadius = 25
                    }
                }
                .onEnded { _ in
                    withAnimation(.spring(response: 0.3)) {
                        isPressed = false
                        glowRadius = 10
                    }
                }
        )
    }
}
```

## Page Transitions

### Dreamy Dissolve

```swift
struct DreamyTransition: ViewModifier {
    let isActive: Bool

    func body(content: Content) -> some View {
        content
            .opacity(isActive ? 1.0 : 0.0)
            .scaleEffect(isActive ? 1.0 : 1.1)  // Slight zoom
            .blur(radius: isActive ? 0 : 10)     // Dreamy blur
            .animation(.easeInOut(duration: 0.5), value: isActive)
    }
}
```

### Sliding Glass Panels

```swift
struct SlidingPanelTransition: ViewModifier {
    let edge: Edge
    let isPresented: Bool

    func body(content: Content) -> some View {
        content
            .offset(offsetForEdge)
            .opacity(isPresented ? 1.0 : 0.0)
            .animation(.spring(response: 0.4, dampingFraction: 0.8), value: isPresented)
    }

    private var offsetForEdge: CGSize {
        guard !isPresented else { return .zero }
        switch edge {
        case .leading: return CGSize(width: -300, height: 0)
        case .trailing: return CGSize(width: 300, height: 0)
        case .top: return CGSize(width: 0, height: -300)
        case .bottom: return CGSize(width: 0, height: 300)
        }
    }
}
```

## Spring Physics Cheat Sheet

```swift
// Snappy, responsive
.spring(response: 0.3, dampingFraction: 0.7)

// Bouncy, playful
.spring(response: 0.5, dampingFraction: 0.5)

// Smooth, elegant
.spring(response: 0.6, dampingFraction: 0.8)

// Dramatic, slow
.spring(response: 0.8, dampingFraction: 0.6)
```

## Animation Timing Guidelines

| Category | Duration | Use Case |
|----------|----------|----------|
| Immediate feedback | 0-100ms | Button press, tap |
| Quick transitions | 150-300ms | Page change, navigation |
| Deliberate animations | 300-500ms | Onboarding, revealing |
| Dramatic moments | 500-1000ms | Celebrations, achievements |

## Accessibility: Reduced Motion

```swift
struct MotionSafeAnimation: ViewModifier {
    @Environment(\.accessibilityReduceMotion) var reduceMotion
    let animation: Animation

    func body(content: Content) -> some View {
        content
            .animation(reduceMotion ? nil : animation, value: UUID())
    }
}

// Alternative transitions for reduced motion
extension AnyTransition {
    static var motionSafe: AnyTransition {
        @Environment(\.accessibilityReduceMotion) var reduceMotion
        return reduceMotion ? .opacity : .asymmetric(
            insertion: .opacity.combined(with: .scale),
            removal: .opacity
        )
    }
}
```

## Interactive Examples

### Pull-to-Refresh with Personality

```swift
struct VaporwaveRefresh: View {
    @State private var isRefreshing = false

    var body: some View {
        ScrollView {
            // Content
        }
        .refreshable {
            // Haptic feedback
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()

            await performRefresh()

            // Success haptic
            let successGenerator = UINotificationFeedbackGenerator()
            successGenerator.notificationOccurred(.success)
        }
    }
}
```

### Delightful Empty State

```swift
struct EmptyStateView: View {
    @State private var rotation: Double = 0

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "photo.on.rectangle.angled")
                .font(.system(size: 60))
                .foregroundStyle(
                    LinearGradient(
                        colors: [.vaporwavePink, .vaporwaveCyan],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .rotationEffect(.degrees(rotation))
                .onAppear {
                    withAnimation(.easeInOut(duration: 3).repeatForever(autoreverses: true)) {
                        rotation = 5
                    }
                }

            Text("No photos yet")
                .font(.vaporwaveTitle)
                .foregroundStyle(.white)

            Text("Start creating beautiful memories")
                .font(.vaporwaveBody)
                .foregroundStyle(.white.opacity(0.7))
        }
        .padding()
    }
}
```
