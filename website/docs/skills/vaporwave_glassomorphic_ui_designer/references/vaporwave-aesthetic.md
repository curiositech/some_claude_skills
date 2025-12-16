---
title: Vaporwave Aesthetic System
sidebar_label: Vaporwave Aesthetic System
sidebar_position: 4
---
# Vaporwave Aesthetic System

Complete color palettes, typography, and visual elements for vaporwave-inspired UI.

## Color Palette System

### Primary Neon Pastels

```swift
extension Color {
    // Vaporwave Core Palette (2025)
    static let vaporwavePink = Color(red: 1.0, green: 0.71, blue: 0.95)      // #FFAFEF
    static let vaporwaveBlue = Color(red: 0.49, green: 0.87, blue: 1.0)      // #7DE0FF
    static let vaporwavePurple = Color(red: 0.71, green: 0.58, blue: 1.0)    // #B595FF
    static let vaporwaveMint = Color(red: 0.67, green: 1.0, blue: 0.89)      // #ABFFE3
    static let vaporwaveOrange = Color(red: 1.0, green: 0.77, blue: 0.54)    // #FFC48A

    // Accent Colors (Higher Saturation)
    static let vaporwaveHotPink = Color(red: 1.0, green: 0.23, blue: 0.68)   // #FF3BAE
    static let vaporwaveCyan = Color(red: 0.0, green: 0.93, blue: 1.0)       // #00EDFF

    // Neutral Base
    static let vaporwaveCharcoal = Color(red: 0.18, green: 0.18, blue: 0.22) // #2E2E38
    static let vaporwaveIvory = Color(red: 0.98, green: 0.96, blue: 0.93)    // #FAF5ED
}
```

### Gradient Combinations

```swift
// Sunset Dream
let sunsetGradient = LinearGradient(
    colors: [.vaporwavePink, .vaporwaveOrange, .vaporwavePurple],
    startPoint: .topLeading,
    endPoint: .bottomTrailing
)

// Cyber Ocean
let cyberOceanGradient = LinearGradient(
    colors: [.vaporwaveBlue, .vaporwaveCyan, .vaporwaveMint],
    startPoint: .top,
    endPoint: .bottom
)

// Twilight Zone
let twilightGradient = LinearGradient(
    colors: [.vaporwavePurple, .vaporwaveBlue, .vaporwavePink],
    startPoint: .topTrailing,
    endPoint: .bottomLeading
)

// Pastel Candy
let candyGradient = LinearGradient(
    colors: [
        .vaporwaveMint,
        .vaporwaveBlue.opacity(0.7),
        .vaporwavePink.opacity(0.6)
    ],
    startPoint: .leading,
    endPoint: .trailing
)
```

### Dynamic Theming System

```swift
struct VaporwaveTheme {
    let primary: Color
    let secondary: Color
    let accent: Color
    let background: LinearGradient

    static let sunsetDream = VaporwaveTheme(
        primary: .vaporwavePink,
        secondary: .vaporwaveOrange,
        accent: .vaporwaveHotPink,
        background: LinearGradient(
            colors: [
                Color.vaporwavePurple.opacity(0.2),
                Color.vaporwaveOrange.opacity(0.1)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    )

    static let cyberNight = VaporwaveTheme(
        primary: .vaporwaveBlue,
        secondary: .vaporwavePurple,
        accent: .vaporwaveCyan,
        background: LinearGradient(
            colors: [
                Color.vaporwaveCharcoal,
                Color.vaporwavePurple.opacity(0.3)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
    )
}
```

### Theme Manager

```swift
class VaporwaveThemeManager: ObservableObject {
    @Published var currentTheme: VaporwaveTheme = .sunsetDream

    enum ThemePreference: String, CaseIterable {
        case sunsetDream = "Sunset Dream"
        case cyberNight = "Cyber Night"
        case pastelCandy = "Pastel Candy"
        case auto = "Auto (Match Photos)"

        var theme: VaporwaveTheme {
            switch self {
            case .sunsetDream: return .sunsetDream
            case .cyberNight: return .cyberNight
            case .pastelCandy: return .init(/* ... */)
            case .auto: return .sunsetDream  // Will adapt to photo colors
            }
        }
    }

    func setTheme(_ preference: ThemePreference) {
        withAnimation(.easeInOut(duration: 0.8)) {
            currentTheme = preference.theme
        }
    }

    func adaptToPhotoPalette(_ colors: [Color]) {
        // Extract dominant colors from photo and create matching theme
        let averageHue = colors.map { $0.hue }.reduce(0, +) / Double(colors.count)
        // Generate complementary vaporwave palette
    }
}
```

## Typography System

### Font Definitions

```swift
extension Font {
    // Headers: Bold, wide tracking for that 80s computer feel
    static let vaporwaveTitle = Font.system(
        size: 32,
        weight: .black,
        design: .rounded  // Softer than default
    ).width(.expanded)    // Wide tracking

    // Body: Clean, readable
    static let vaporwaveBody = Font.system(
        size: 16,
        weight: .medium,
        design: .rounded
    )

    // Captions: Small, mono for that terminal aesthetic
    static let vaporwaveCaption = Font.system(
        size: 12,
        weight: .regular,
        design: .monospaced
    )
}
```

### Text Effects

```swift
struct VaporwaveText: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.vaporwaveTitle)
            .foregroundStyle(
                LinearGradient(
                    colors: [.vaporwavePink, .vaporwaveCyan],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            // Outline effect (vaporwave staple)
            .shadow(color: .vaporwavePurple, radius: 0, x: -2, y: -2)
            .shadow(color: .vaporwaveCyan, radius: 0, x: 2, y: 2)
            .shadow(color: .black.opacity(0.5), radius: 10, y: 5)
    }
}
```

## Visual Elements

### Retro Grid Background

```swift
struct VaporwaveGrid: View {
    var body: some View {
        GeometryReader { geometry in
            Canvas { context, size in
                let spacing: CGFloat = 40

                // Horizontal lines (perspective grid)
                for i in stride(from: 0, through: size.height, by: spacing) {
                    let progress = i / size.height
                    let lineWidth = 1 + (progress * 2)  // Thicker at bottom (perspective)

                    var path = Path()
                    path.move(to: CGPoint(x: 0, y: i))
                    path.addLine(to: CGPoint(x: size.width, y: i))

                    context.stroke(
                        path,
                        with: .color(.vaporwaveCyan.opacity(0.3 + progress * 0.3)),
                        lineWidth: lineWidth
                    )
                }

                // Vertical lines (converging to horizon)
                let horizonY = size.height * 0.3
                let vanishingPointX = size.width / 2

                for x in stride(from: 0, through: size.width, by: spacing) {
                    var path = Path()
                    path.move(to: CGPoint(x: x, y: size.height))
                    path.addLine(to: CGPoint(x: vanishingPointX, y: horizonY))

                    context.stroke(
                        path,
                        with: .color(.vaporwavePink.opacity(0.4)),
                        lineWidth: 1
                    )
                }
            }
        }
        .background(
            LinearGradient(
                colors: [
                    .vaporwavePurple.opacity(0.3),
                    .vaporwaveCharcoal
                ],
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }
}
```

### Scan Lines Effect

```swift
struct ScanLines: View {
    var body: some View {
        GeometryReader { geometry in
            Canvas { context, size in
                for y in stride(from: 0, through: size.height, by: 4) {
                    var path = Path()
                    path.move(to: CGPoint(x: 0, y: y))
                    path.addLine(to: CGPoint(x: size.width, y: y))

                    context.stroke(
                        path,
                        with: .color(.black.opacity(0.1)),
                        lineWidth: 2
                    )
                }
            }
        }
        .allowsHitTesting(false)  // Pass through touches
    }
}
```

### Sun/Moon Shape

```swift
struct VaporwaveSun: View {
    var body: some View {
        ZStack {
            // Sun disc
            Circle()
                .fill(
                    LinearGradient(
                        colors: [
                            .vaporwavePink,
                            .vaporwaveOrange,
                            .vaporwaveHotPink
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .frame(width: 200, height: 200)

            // Horizontal stripes (retrowave sun effect)
            ForEach(0..&lt;10) { i in
                Rectangle()
                    .fill(Color.vaporwaveCharcoal)
                    .frame(height: 3)
                    .offset(y: CGFloat(i) * 15 + 40)
            }
            .clipShape(Circle())
        }
    }
}
```

## 2025 Vaporwave Evolution

### Historical Context

**Original Vaporwave (2010-2015):**
- Critique of consumerism and nostalgia
- 80s/90s mall aesthetic, early internet imagery
- Deliberately glitchy, surreal, melancholic
- Greco-Roman statues, Japanese text, palm trees

**2025 Modern Interpretation:**
- Softer, more accessible (Y2K revival influence)
- Neon pastels over harsh synthwave colors
- Cleaner execution (less glitch, more polish)
- Nostalgic but optimistic
- Dreamlike, not dystopian

### Design Philosophy

> "Make it feel like a dreamlike memory itself." - Design Principle for Photo Apps

When designing for photo applications:
1. **Evoke Emotion** - Nostalgia, joy, wonder through color and motion
2. **Respect Content** - Photos are the hero, UI supports not competes
3. **Enable Flow** - Frictionless creation, experimentation, sharing
4. **Delight Constantly** - Micro-interactions, surprises, polish
5. **Perform Flawlessly** - 60fps animations, instant feedback, GPU-optimized

### Contextual Design

```swift
struct ContextualDesign: View {
    let photoCount: Int
    @Environment(\.colorScheme) var colorScheme
    @Environment(\.sizeCategory) var sizeCategory

    var body: some View {
        ZStack {
            // Busy library (1000+ photos) = Calmer design
            if photoCount > 1000 {
                // Minimal vaporwave (less overwhelming)
                LinearGradient(
                    colors: [
                        Color.vaporwaveIvory,
                        Color.vaporwaveMint.opacity(0.2)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
            } else {
                // Smaller library = More expressive design
                VaporwaveTheme.sunsetDream.background
            }

            // UI adapts to context
            ContentView()
        }
    }
}
```

## Color Psychology for Photo Apps

| Color | Emotion | Use Case |
|-------|---------|----------|
| Pink | Warmth, nostalgia | Memory browsing, love-themed collections |
| Cyan | Energy, freshness | Action buttons, new content |
| Purple | Creativity, mystery | Creation tools, AI features |
| Mint | Calm, growth | Success states, collections |
| Orange | Joy, playfulness | Celebrations, highlights |
