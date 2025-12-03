---
title: ADHD Design Patterns & Component Library
sidebar_label: ADHD Design Patterns & Comp...
sidebar_position: 1
---
# ADHD Design Patterns & Component Library

This file contains detailed design patterns, SwiftUI component implementations, testing checklists, and anti-patterns for ADHD-friendly design.

## ADHD Design Patterns Library

### Pattern: Body Doubling Digital Companion

```
Concept: Simulated presence to aid task initiation

┌────────────────────────────┐
│ 👤 Alex is working nearby  │
│                            │
│ 🎯 Current task:           │
│ "Writing report"           │
│                            │
│ ⏱️  Focus timer: 18:23     │
│                            │
│ [Join them] [Solo mode]    │
└────────────────────────────┘

Why it works:
• ADHD brains often initiate tasks better with others
• Virtual presence provides accountability
• Reduces isolation during work
• Optional (can toggle off)
```

### Pattern: Doom Scrolling Blocker

```
Concept: Interrupt infinite scroll with awareness prompts

After 5 minutes of scrolling:
┌────────────────────────────┐
│ ⏸️  Quick check-in         │
│                            │
│ You've been scrolling      │
│ for 5 minutes              │
│                            │
│ Still finding value?       │
│                            │
│ [Yes, continue (5 more)]   │
│ [Actually, I'm done]       │
└────────────────────────────┘

Why it works:
• Interrupts automatic behavior
• Non-judgmental awareness
• Offers easy exit
• Time-based (concrete)
```

### Pattern: Task Breakdown Assistant

```
Concept: Auto-break overwhelming tasks

User enters: "Clean garage"

App suggests:
┌────────────────────────────┐
│ 🤔 That feels big!         │
│ Let's break it down:       │
│                            │
│ ✓ Gather trash bags        │
│   (5 min)                  │
│                            │
│ ✓ Sort into keep/donate    │
│   (20 min)                 │
│                            │
│ ✓ Sweep floor              │
│   (10 min)                 │
│                            │
│ [Use these] [Do it my way] │
└────────────────────────────┘

Why it works:
• Reduces overwhelm
• Makes abstract concrete
• Includes time estimates
• Preserves user agency
```

### Pattern: Hyperfocus Protector

```
Concept: Safeguard hyperfocus sessions

App detects: 90 min of continuous work
┌────────────────────────────┐
│ 🚀 Hyperfocus detected!    │
│                            │
│ You've been crushing it    │
│ for 90 minutes             │
│                            │
│ Friendly reminder:         │
│ • Stand up & stretch       │
│ • Drink water              │
│ • Check the time           │
│                            │
│ [5 min break] [Keep going] │
└────────────────────────────┘

Why it works:
• Respects and celebrates hyperfocus
• Gentle health reminders
• Not forced (user choice)
• Prevents burnout
```

### Pattern: Rejection Sensitivity Shield

```
Concept: Gentle wording to avoid RSD triggers

❌ AVOID (triggers RSD):
"You failed to complete"
"Why didn't you finish?"
"You're behind schedule"

✅ USE INSTEAD:
"Let's see what happened"
"What got in the way?"
"Adjusting timeline..."

Example:
┌────────────────────────────┐
│ Task update needed         │
│                            │
│ "Write report" isn't done  │
│ yet. Life gets busy!       │
│                            │
│ What would help?           │
│ • Need more time?          │
│ • Break into smaller steps?│
│ • Remove from list?        │
│                            │
│ [Choose one]               │
└────────────────────────────┘

Why it works:
• No blame or judgment
• Assumes good intent
• Offers solutions, not criticism
• Empowering language
```

## ADHD-Friendly Component Library

### The "Magic Button"

```swift
// A button that provides immediate, satisfying feedback

struct ADHDFriendlyButton: View {
    let title: String
    let action: () -> Void
    @State private var isPressed = false
    @State private var showConfetti = false

    var body: some View {
        Button(action: {
            // Haptic feedback (immediate)
            let impact = UIImpactFeedbackGenerator(style: .medium)
            impact.impactOccurred()

            // Visual feedback
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                isPressed = true
            }

            // Action with delay for animation
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                action()
                showConfetti = true

                // Reset
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    isPressed = false
                }
            }
        }) {
            Text(title)
                .font(.headline)
                .foregroundColor(.white)
                .padding()
                .frame(maxWidth: .infinity)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(
                            LinearGradient(
                                colors: [.blue, .purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .shadow(
                            color: .blue.opacity(0.4),
                            radius: isPressed ? 5 : 15,
                            y: isPressed ? 2 : 5
                        )
                )
                .scaleEffect(isPressed ? 0.95 : 1.0)
        }
        .overlay(
            ConfettiView(isActive: $showConfetti)
        )
    }
}
```

### The Progress Tracker

```swift
struct ADHDProgressBar: View {
    let current: Int
    let total: Int
    let label: String

    var progress: Double {
        Double(current) / Double(total)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(label)
                    .font(.subheadline)
                    .fontWeight(.medium)

                Spacer()

                Text("\(current)/\(total)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Background
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.gray.opacity(0.2))

                    // Progress fill with gradient
                    RoundedRectangle(cornerRadius: 8)
                        .fill(
                            LinearGradient(
                                colors: [.green, .blue],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geometry.size.width * progress)
                        .animation(.spring(), value: progress)

                    // Percentage text
                    Text("\(Int(progress * 100))%")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                }
            }
            .frame(height: 32)

            // Motivational message
            if progress >= 1.0 {
                Text("🎉 Complete!")
                    .font(.caption)
                    .foregroundColor(.green)
            } else if progress >= 0.75 {
                Text("🔥 Almost there!")
                    .font(.caption)
                    .foregroundColor(.orange)
            }
        }
    }
}
```

### The Gentle Timer

```swift
struct ADHDTimer: View {
    @State private var timeRemaining: TimeInterval
    @State private var isRunning = false
    let totalTime: TimeInterval

    init(minutes: Int) {
        self.totalTime = TimeInterval(minutes * 60)
        self._timeRemaining = State(initialValue: TimeInterval(minutes * 60))
    }

    var progress: Double {
        1.0 - (timeRemaining / totalTime)
    }

    var body: some View {
        VStack(spacing: 16) {
            // Large, readable timer
            Text(timeString(timeRemaining))
                .font(.system(size: 64, weight: .bold, design: .rounded))
                .foregroundColor(.primary)

            // Visual progress ring
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 20)

                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(
                        LinearGradient(
                            colors: [.blue, .purple],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 20, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.linear, value: progress)
            }
            .frame(width: 200, height: 200)

            // What you can do with this time
            VStack(alignment: .leading, spacing: 8) {
                Text("Enough time for:")
                    .font(.caption)
                    .foregroundColor(.secondary)

                ForEach(suggestedActivities(timeRemaining), id: \.self) { activity in
                    HStack {
                        Text("•")
                        Text(activity)
                    }
                    .font(.caption)
                }
            }

            // Controls
            HStack(spacing: 20) {
                Button(isRunning ? "⏸ Pause" : "▶️ Start") {
                    isRunning.toggle()
                }
                .buttonStyle(ADHDButtonStyle())

                Button("🔄 Reset") {
                    timeRemaining = totalTime
                    isRunning = false
                }
                .buttonStyle(ADHDButtonStyle(color: .orange))
            }
        }
        .padding()
    }

    func timeString(_ time: TimeInterval) -> String {
        let minutes = Int(time) / 60
        let seconds = Int(time) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    func suggestedActivities(_ time: TimeInterval) -> [String] {
        let minutes = Int(time) / 60
        switch minutes {
        case 0...2: return ["Quick email", "Water break"]
        case 3...5: return ["Short walk", "Coffee break", "Tidy desk"]
        case 6...10: return ["Meditation", "Snack", "Stretch routine"]
        case 11...20: return ["Read chapter", "Quick workout", "Meal prep"]
        default: return ["Full task block", "Deep work", "Creative project"]
        }
    }
}
```

## Testing for ADHD Accessibility

### Checklist

- [ ] **Cognitive Load**: Can task be completed with \&lt;5 items in working memory?
- [ ] **Task Initiation**: Is the first step obvious and easy?
- [ ] **Time Visibility**: Are all waits/durations shown concretely?
- [ ] **Immediate Feedback**: Does every action give instant response?
- [ ] **Progress Tracking**: Can user see how far they've come?
- [ ] **Error Recovery**: Can mistakes be undone easily?
- [ ] **Interruption Protection**: Can user control notifications?
- [ ] **Visual Engagement**: Is the interface stimulating (not boring)?
- [ ] **Language**: Is copy kind, never shaming?
- [ ] **Flexibility**: Can user customize to their needs?

### User Testing Questions

Ask ADHD users:
1. "What made you want to quit or give up?"
2. "When did you feel overwhelmed?"
3. "What would make this more motivating?"
4. "Did anything shame or discourage you?"
5. "What would your ideal version do differently?"

## Anti-Patterns to Avoid

❌ **Hidden information**: Critical info in submenus or tooltips
❌ **Too many choices**: 10+ options without clear default
❌ **Vague language**: "Soon", "Later", "A while"
❌ **Punishment mechanics**: Streaks that break, permanent failures
❌ **Boring design**: All gray, minimal, no personality
❌ **Forced rigid structure**: One way to do things
❌ **Silent actions**: No feedback when something happens
❌ **Complex onboarding**: 20 screens before value
❌ **Shame language**: "You failed", "Why didn't you..."
❌ **Unrealistic defaults**: Assumes superhuman consistency

## Remember

ADHD isn't a deficit of attention—it's inconsistent attention regulation. Design for brains that:
- Work in bursts, not steady streams
- Need external structure, not just willpower
- Thrive on interest, not "should"
- Require immediate rewards, not delayed gratification
- Struggle with invisible deadlines and abstract time
- Have brilliant capabilities when engaged

**Your job**: Remove friction, add delight, celebrate progress, and never shame.

---

**The golden rule**: If a neurotypical person finds it "too much," it's probably right for ADHD. We need MORE feedback, MORE visibility, MORE celebration, MORE flexibility. Design accordingly. 🧠✨
