---
title: Glassmorphism Patterns for SwiftUI
sidebar_label: Glassmorphism Patterns for ...
sidebar_position: 2
---
# Glassmorphism Patterns for SwiftUI

Complete SwiftUI implementations for glassmorphic UI components.

## Core Glass Card Component

```swift
struct GlassCard<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(20)
            .background(.ultraThinMaterial)  // Key: System blur material
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(0.6),
                                Color.white.opacity(0.2)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1.5
                    )
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .shadow(color: .black.opacity(0.1), radius: 10, y: 5)
    }
}
```

## Material Hierarchy

iOS provides 5 material types for glassmorphism:

```swift
// Material options (from most to least transparent)
.background(.ultraThinMaterial)    // Most transparent (floating panels)
.background(.thinMaterial)         // Subtle blur (toolbars)
.background(.regularMaterial)      // Balanced (sheets, modals)
.background(.thickMaterial)        // Strong blur (backgrounds)
.background(.ultraThickMaterial)   // Opaque-ish (critical UI)

// Selection criteria:
// - Content importance: critical UI = thicker
// - Visual hierarchy: foreground = thinner, background = thicker
// - Readability needs: text-heavy = thicker
```

## Advanced Glass with Gradient Border

```swift
struct GlassPanel: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Create Collage")
                .font(.title2.weight(.semibold))
                .foregroundStyle(.white)

            Text("AI will find photos that belong together")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.7))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(24)
        .background {
            // Multi-layer glass effect
            ZStack {
                // Blur layer
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)

                // Gradient overlay for depth
                LinearGradient(
                    colors: [
                        Color.white.opacity(0.15),
                        Color.clear
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .blendMode(.overlay)

                // Border gradient
                RoundedRectangle(cornerRadius: 20)
                    .strokeBorder(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(0.8),
                                Color.white.opacity(0.2),
                                Color.purple.opacity(0.3)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 2
                    )
            }
        }
        .shadow(color: .purple.opacity(0.3), radius: 20, y: 10)
    }
}
```

## Adaptive Glass (Dark/Light Mode)

```swift
struct AdaptiveGlassCard: View {
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack {
            // Content
        }
        .padding()
        .background {
            if colorScheme == .dark {
                // Dark mode: lighter glass
                RoundedRectangle(cornerRadius: 16)
                    .fill(.thinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.white.opacity(0.3), lineWidth: 1)
                    )
            } else {
                // Light mode: subtle tint
                RoundedRectangle(cornerRadius: 16)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.black.opacity(0.1), lineWidth: 1)
                    )
            }
        }
    }
}
```

## Card Style Variants

```swift
enum GlassCardStyle {
    case thin        // Minimal blur
    case regular     // Standard
    case thick       // Heavy blur, more opaque
    case neon        // Glass + colored glow
}

struct StyledGlassCard<Content: View>: View {
    let style: GlassCardStyle
    let content: Content

    init(style: GlassCardStyle, @ViewBuilder content: () -> Content) {
        self.style = style
        self.content = content()
    }

    var body: some View {
        content
            .padding(20)
            .background(materialForStyle)
            .overlay(borderForStyle)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .shadow(color: shadowColorForStyle, radius: shadowRadiusForStyle, y: 5)
    }

    @ViewBuilder
    private var materialForStyle: some ShapeStyle {
        switch style {
        case .thin:
            AnyShapeStyle(.ultraThinMaterial)
        case .regular:
            AnyShapeStyle(.regularMaterial)
        case .thick:
            AnyShapeStyle(.thickMaterial)
        case .neon:
            AnyShapeStyle(.thinMaterial)
        }
    }

    @ViewBuilder
    private var borderForStyle: some View {
        if style == .neon {
            RoundedRectangle(cornerRadius: 16)
                .stroke(
                    LinearGradient(
                        colors: [.vaporwavePink, .vaporwaveCyan],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 2
                )
        } else {
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.white.opacity(0.3), lineWidth: 1)
        }
    }

    private var shadowColorForStyle: Color {
        style == .neon ? .vaporwavePink.opacity(0.4) : .black.opacity(0.1)
    }

    private var shadowRadiusForStyle: CGFloat {
        style == .neon ? 20 : 10
    }
}
```

## Glass Sheet (Modal Presentation)

```swift
.sheet(isPresented: $showingModal) {
    GlassSheet {
        VStack(spacing: 20) {
            Text("Export Collage")
                .font(.vaporwaveTitle)

            // Content
        }
        .padding()
    }
    .presentationDetents([.medium, .large])
    .presentationDragIndicator(.visible)
}

struct GlassSheet<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .background(.regularMaterial)
            .overlay(
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(0.1),
                                Color.clear
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
            )
    }
}
```

## Performance Optimization

### Lazy Loading for Photo Grids

```swift
struct OptimizedPhotoGrid: View {
    let photos: [Photo]

    var body: some View {
        ScrollView {
            LazyVGrid(
                columns: [
                    GridItem(.adaptive(minimum: 150), spacing: 16)
                ],
                spacing: 16
            ) {
                ForEach(photos) { photo in
                    AsyncImage(url: photo.thumbnailURL) { phase in
                        switch phase {
                        case .empty:
                            // Placeholder glass card
                            GlassCard {
                                ProgressView()
                            }
                            .frame(height: 150)

                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(height: 150)
                                .clipped()
                                .clipShape(RoundedRectangle(cornerRadius: 12))

                        case .failure:
                            GlassCard {
                                Image(systemName: "photo.fill")
                                    .foregroundColor(.gray)
                            }
                            .frame(height: 150)

                        @unknown default:
                            EmptyView()
                        }
                    }
                }
            }
            .padding()
        }
        .scrollIndicators(.hidden)  // Cleaner aesthetic
    }
}
```

### Drawing Group for Complex Glass

```swift
struct OptimizedGlassStack: View {
    var body: some View {
        VStack(spacing: 20) {
            ForEach(0..&lt;10) { index in
                GlassCard {
                    Text("Card \(index)")
                }
            }
        }
        .drawingGroup()  // Flatten into single texture (faster rendering)
    }
}
```

## Accessibility Considerations

```swift
struct AccessibleGlassCard<Content: View>: View {
    let content: Content
    @Environment(\.accessibilityReduceTransparency) var reduceTransparency

    var body: some View {
        content
            .padding(20)
            .background {
                if reduceTransparency {
                    // Solid background for accessibility
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(.systemBackground).opacity(0.95))
                } else {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(.ultraThinMaterial)
                }
            }
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.white.opacity(0.3), lineWidth: 1)
            )
    }
}
```

## Why Glassmorphism for Photo Apps

1. **Content-aware**: Photos visible through translucent UI
2. **Adaptive**: Automatically adjusts to any photo color palette
3. **Premium feel**: Modern, polished aesthetic
4. **Better accessibility**: Superior contrast compared to neumorphism
5. **System integration**: Uses iOS Material system for best performance
