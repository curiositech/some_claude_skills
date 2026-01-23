# SwiftUI Design Patterns

Deep reference for breathtaking SwiftUI component patterns, animations, and iOS-native UI excellence.

## Breathtaking Card Design

```swift
struct BeautifulCard: View {
    let item: Item
    @State private var isPressed = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Image with character
            AsyncImage(url: item.imageURL)
                .frame(height: 200)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .shadow(color: .black.opacity(0.1), radius: 20, y: 10)

            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.system(.title3, design: .rounded, weight: .bold))
                    .foregroundStyle(.primary)

                Text(item.description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            .padding(.horizontal, 4)
        }
        .padding(16)
        .background {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(.ultraThinMaterial)
                .shadow(
                    color: item.accentColor.opacity(0.2),
                    radius: isPressed ? 10 : 20,
                    x: 0,
                    y: isPressed ? 5 : 10
                )
        }
        .scaleEffect(isPressed ? 0.97 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isPressed)
        .onLongPressGesture(minimumDuration: .infinity, maximumDistance: .infinity,
            pressing: { pressing in
                isPressed = pressing
            },
            perform: {}
        )
    }
}
```

## Organic List Design

```swift
struct OrganicList: View {
    let items: [Item]
    @Namespace private var namespace

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                ForEach(items) { item in
                    ItemRow(item: item)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 8)
                        .background(
                            // Subtle alternating background
                            item.id.hashValue % 2 == 0
                                ? Color.clear
                                : Color.primary.opacity(0.02)
                        )
                        .matchedGeometryEffect(id: item.id, in: namespace)
                }
            }
        }
        .background(Color(.systemGroupedBackground))
    }
}
```

## Physics-Based Button Animation

```swift
struct BouncyButton: View {
    @State private var scale: CGFloat = 1.0
    @State private var rotation: Double = 0.0

    var body: some View {
        Button(action: {
            // Haptic feedback
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()

            // Playful animation sequence
            withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
                scale = 0.9
                rotation = -5
            }

            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                withAnimation(.spring(response: 0.5, dampingFraction: 0.4)) {
                    scale = 1.05
                    rotation = 5
                }
            }

            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                    scale = 1.0
                    rotation = 0
                }
            }
        }) {
            Text("Tap me!")
                .font(.headline)
                .foregroundColor(.white)
                .padding(.horizontal, 32)
                .padding(.vertical, 16)
                .background(
                    Capsule()
                        .fill(
                            LinearGradient(
                                colors: [.blue, .purple],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                )
        }
        .scaleEffect(scale)
        .rotationEffect(.degrees(rotation))
    }
}
```

## Breathtaking Onboarding

```swift
struct OnboardingView: View {
    @State private var currentPage = 0
    @Namespace private var animation

    var body: some View {
        ZStack {
            // Animated gradient background
            AnimatedGradientBackground(page: currentPage)

            VStack {
                // Content
                TabView(selection: $currentPage) {
                    ForEach(0..&lt;3) { index in
                        OnboardingPage(index: index)
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))

                // Custom page indicator with personality
                HStack(spacing: 8) {
                    ForEach(0..&lt;3) { index in
                        Capsule()
                            .fill(currentPage == index ? Color.white : Color.white.opacity(0.3))
                            .frame(
                                width: currentPage == index ? 32 : 8,
                                height: 8
                            )
                            .matchedGeometryEffect(id: index, in: animation)
                            .animation(.spring(response: 0.6, dampingFraction: 0.7), value: currentPage)
                    }
                }
                .padding(.bottom, 40)

                // CTA with character
                Button("Get Started") {
                    // Action with celebratory animation
                }
                .buttonStyle(BouncyCTAStyle())
            }
        }
    }
}
```

## Typography with Character

```swift
struct CharacterfulText: View {
    let text: String
    let style: TextStyle

    enum TextStyle {
        case hero, title, body, caption

        var font: Font {
            switch self {
            case .hero:
                return .system(.largeTitle, design: .rounded, weight: .black)
            case .title:
                return .system(.title2, design: .rounded, weight: .bold)
            case .body:
                return .system(.body, design: .default, weight: .regular)
            case .caption:
                return .system(.caption, design: .monospaced, weight: .medium)
            }
        }

        var letterSpacing: CGFloat {
            switch self {
            case .hero: return -0.5
            case .title: return -0.3
            case .body: return 0.2
            case .caption: return 0.5
            }
        }
    }

    var body: some View {
        Text(text)
            .font(style.font)
            .tracking(style.letterSpacing)
    }
}
```

## Emotional Color Palettes

```swift
// Energetic & Playful
extension Color {
    static let energeticPrimary = Color(hex: "FF6B6B")   // Coral red
    static let energeticSecondary = Color(hex: "4ECDC4") // Turquoise
    static let energeticAccent = Color(hex: "FFE66D")    // Sunny yellow
    static let energeticBackground = Color(hex: "F7F7F2") // Warm white
}

// Professional & Trustworthy
extension Color {
    static let proMidnight = Color(hex: "1A202C")   // Deep navy
    static let proTeal = Color(hex: "319795")       // Teal accent
    static let proSlate = Color(hex: "4A5568")      // Slate gray
    static let proIvory = Color(hex: "FFFAF0")      // Ivory background
}

// Calm & Minimal
extension Color {
    static let calmSage = Color(hex: "A8DADC")     // Soft sage
    static let calmNavy = Color(hex: "457B9D")     // Muted navy
    static let calmCoral = Color(hex: "F1FAEE")    // Cream
    static let calmCharcoal = Color(hex: "1D3557") // Charcoal
}
```

## iOS Native Best Practices

### Platform Patterns
- Use system materials (.ultraThinMaterial, .regularMaterial)
- Respect safe areas and Dynamic Island
- Support Dynamic Type (accessibility)
- Implement haptic feedback strategically
- Use SF Symbols with weight matching
- Support dark mode with semantic colors
- Leverage iOS 17+ features (TipKit, SwiftData)

### Animation Best Practices
```swift
// ❌ Generic, lifeless
.animation(.linear(duration: 0.3))

// ✅ Alive, responsive
.animation(.spring(response: 0.6, dampingFraction: 0.7, blendDuration: 0.3))
```

### Spring Parameters Guide
```
Response (0.2-1.0):
├── 0.2-0.3: Snappy, responsive
├── 0.4-0.6: Balanced, natural
└── 0.7-1.0: Slow, dramatic

Damping Fraction (0.3-1.0):
├── 0.3-0.5: Bouncy, playful
├── 0.6-0.8: Natural, organic
└── 0.9-1.0: Minimal bounce, smooth
```
