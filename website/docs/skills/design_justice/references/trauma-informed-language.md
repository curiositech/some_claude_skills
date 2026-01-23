---
title: Trauma-Informed Language Guide
sidebar_label: Trauma-Informed Language Guide
sidebar_position: 4
---
# Trauma-Informed Language Guide

## The Problem

Traditional legal and bureaucratic language:
- Assumes guilt or wrongdoing
- Uses jargon that excludes
- Triggers shame and anxiety
- Creates power imbalances
- Reinforces institutional trauma

Reality for people with records:
- Many have experienced system trauma (courts, jails, probation)
- Formal language triggers fight/flight responses
- Uncertainty causes anxiety spirals
- Shame prevents help-seeking
- Past experiences create distrust

## Core Principles

### 1. Person-First Language

**Always separate the person from the record.**

| ❌ Avoid | ✅ Use Instead |
|----------|----------------|
| Criminal | Person with a criminal record |
| Offender | Person who was convicted |
| Ex-con | Person who was previously incarcerated |
| Felon | Person with a felony conviction |
| Your criminal history | Your record |
| Your offense | The conviction |
| Criminals | People with records |

### 2. Active vs Passive Voice for Agency

Use **active voice** when the user has power:
- "You can file for expungement" ✅
- "Expungement may be filed for" ❌

Use **passive voice** to avoid blame:
- "The charge was dismissed" ✅
- "You got your charge dismissed" ❌ (implies user had to do something wrong first)

### 3. Plain Language Standards

**Target: 6th-8th grade reading level**

| ❌ Legal Jargon | ✅ Plain Language |
|-----------------|-------------------|
| Adjudication | Court decision |
| Nolle prosequi | Case dropped by prosecutor |
| Disposition | How the case ended |
| Motion | Request to the court |
| Petition | Application form |
| Docket | Case schedule/list |
| Jurisdiction | Which court handles your case |
| Statute of limitations | Time limit |
| Indigent | Unable to pay |
| Pro se | Without a lawyer |
| Expungement | Clearing your record |
| Sealing | Hiding from public view |

### 4. Acknowledge Difficulty

**Don't pretend it's easy when it's not.**

❌ "Simply fill out the form and you're done!"
✅ "This process has several steps. We'll guide you through each one."

❌ "It's easy!"
✅ "Many people complete this successfully."

❌ "Just call the court"
✅ "You'll need to contact the court. Here's what to say..."

### 5. Validate Emotions

**Acknowledge that this is stressful.**

```
✅ Good openings:
"We know this process can feel overwhelming."
"It's normal to feel anxious about these steps."
"Many people find this frustrating - you're not alone."
"This system wasn't designed to be easy to navigate."
```

### 6. Celebrate Progress

**Mark milestones without being patronizing.**

```
✅ After completing eligibility check:
"Great news - you may be eligible for expungement."

✅ After completing a form section:
"Section complete. You're making real progress."

✅ After form submission:
"Your application has been submitted. That's a big step."
```

Avoid:
- Over-the-top celebration ("AMAZING! YOU DID IT! 🎉🎉🎉")
- Diminishing language ("That was easy, right?")
- False promises ("You're almost done!" when they're not)

## Tone Guidelines by Context

### Eligibility Results

**If Eligible:**
```
✅ "Based on your answers, you may be eligible for expungement in [State]."

Then immediately:
- What this means
- What the next steps are
- Expected timeline
- What could still go wrong (gently)
```

**If Not Eligible:**
```
✅ "Based on your answers, you may not currently be eligible for expungement
in [State]. Here's why and what options you might have."

Then:
- Clear explanation of WHY (specific disqualifying factor)
- When they MIGHT become eligible (if applicable)
- Alternative options (sealing, pardons, certificates of rehabilitation)
- Resources for legal help (might be exceptions)
```

**Never:**
- "Sorry, you're not eligible" (apologetic but unhelpful)
- "Unfortunately, due to your criminal history..." (shame-inducing)
- Leave them without next steps

### Error Messages

**Form Errors:**
```
❌ "Invalid input"
❌ "Error: Field required"
❌ "You forgot to fill out this field"

✅ "Please enter your date of birth"
✅ "We need this information to check your eligibility"
✅ "This field helps us find the right forms for your county"
```

**System Errors:**
```
❌ "Something went wrong"
❌ "Error 500"

✅ "We couldn't save your progress just now. Don't worry -
   your answers are saved on this device. Please try again in a moment."

✅ "We're having trouble connecting. Your work is saved locally
   and will sync when the connection is restored."
```

### Instructions

**Before a Task:**
```
✅ "In this section, we'll ask about your conviction. This helps us
   determine which forms you need."

✅ "The next questions are about personal information. This stays
   on your device unless you choose to submit it."
```

**During a Task:**
```
✅ "If you don't know the exact date, an estimate is fine."
✅ "You can skip this for now and come back later."
✅ "Don't worry if you're not sure - we'll help you find out."
```

**After a Task:**
```
✅ "Section complete. Your answers have been saved."
✅ "Next, we'll help you fill out the forms."
```

## Color and Visual Language

### Calm Color Palette

Colors carry emotional weight. Avoid alarming colors.

| State | ❌ Avoid | ✅ Use Instead |
|-------|----------|----------------|
| Error | Bright red (#ff0000) | Muted terracotta (#c97a5d) |
| Warning | Alarming yellow (#ffff00) | Warm amber (#d4a03a) |
| Success | Aggressive lime (#00ff00) | Soft olive (#5a6f4e) |
| Info | Cold blue (#0000ff) | Warm teal (#4a9d9e) |

### Visual Hierarchy

```
✅ DO:
- Use whitespace generously
- One primary action per screen
- Progress indicators for multi-step flows
- Icons that support (not replace) text

❌ DON'T:
- Multiple competing CTAs
- Dense walls of text
- Flashing or pulsing elements
- Countdown timers that create pressure
```

### Progress Indicators

```tsx
// Good: Clear, calm progress
<ProgressBar
  current={3}
  total={5}
  label="Step 3 of 5: Personal Information"
/>

// Bad: Pressure-inducing
<div>HURRY! Only 2 steps left! Complete now!</div>
```

## Specific Phrasing Recommendations

### Asking About Convictions

```
❌ "What crime did you commit?"
❌ "Enter your criminal offense"
❌ "Describe your criminal history"

✅ "What type of conviction is on your record?"
✅ "What was the charge?"
✅ "Select the category that best describes the conviction"
```

### Asking About Time Served

```
❌ "How long were you incarcerated?"
❌ "Prison time served"

✅ "Were you sentenced to any time in jail or prison?"
✅ "If yes, how long was the sentence?"
```

### Referring to Past Events

```
❌ "After you committed the offense..."
❌ "Since your crime..."
❌ "When you broke the law..."

✅ "After the conviction..."
✅ "Since the case was closed..."
✅ "From the date the case ended..."
```

### Discussing Fees

```
❌ "The filing fee is $150. Payment required."

✅ "The filing fee is typically $150. If you can't afford this,
   you may qualify for a fee waiver. We'll help you apply for one."
```

### Explaining Denials

```
❌ "Your request was denied due to your criminal record."

✅ "The court did not approve this request. This sometimes happens,
   and there may be other options available. Here's what you can do next..."
```

## Writing Checklist

Before publishing any user-facing text:

```
□ Uses person-first language throughout
□ Reading level is 8th grade or below (use Hemingway App)
□ All legal jargon is explained in plain language
□ Acknowledges difficulty without being discouraging
□ Provides clear next steps (never dead ends)
□ Error messages are helpful, not blaming
□ Success messages are encouraging, not patronizing
□ Colors are calm (no aggressive red/yellow)
□ Timeline expectations are explicit
□ "I don't know" is always a valid answer
□ Skip options exist for optional questions
□ No countdown timers or pressure tactics
```

## Examples: Before & After

### Example 1: Eligibility Question

**Before:**
> "Have you ever been convicted of a violent felony as defined under
> Penal Code Section 667.5(c)?"

**After:**
> "Were you convicted of any of these serious crimes?
> - Murder or attempted murder
> - Kidnapping
> - Robbery
> - Sexual assault
> - Assault with a deadly weapon
>
> [Yes] [No] [I'm not sure]
>
> If you're not sure, that's okay. Select 'I'm not sure' and we'll
> help you figure it out."

### Example 2: Error State

**Before:**
> "Error: Invalid date format. Please enter date as MM/DD/YYYY."

**After:**
> "Please enter the date as month/day/year (example: 03/15/2020).
>
> If you don't remember the exact date, an estimate is fine."

### Example 3: Waiting Period

**Before:**
> "Pursuant to State statute, a mandatory waiting period of 5 years
> must elapse from the date of disposition before petition may be filed."

**After:**
> "You'll need to wait 5 years from when your case ended before
> you can apply.
>
> Your case ended: March 2019
> You can apply starting: March 2024
>
> [Set a reminder for March 2024]"

### Example 4: Ineligibility

**Before:**
> "Based on your responses, you are not eligible for expungement
> at this time. Thank you for using our service."

**After:**
> "Based on your answers, you may not be eligible for expungement
> right now. Here's why:
>
> Your record includes a conviction that currently can't be expunged
> under [State] law (DUI with injury).
>
> **What you can do:**
> - Talk to a lawyer - there may be exceptions we don't know about
> - Apply for a Certificate of Rehabilitation instead
> - Check back if the law changes (many states are updating these rules)
>
> [Find free legal help] [Learn about alternatives]"

## Resources

- Hemingway App (readability testing): hemingwayapp.com
- Plain Language Guidelines: plainlanguage.gov
- Trauma-Informed Care principles: SAMHSA
- Design Justice Network: designjusticenetwork.org
