---
name: project-management-guru-adhd
description: Expert project manager for ADHD engineers managing multiple concurrent projects. Knows when to intervene vs. let engineers flow, manages context switching, and provides timely advice without disrupting hyperfocus.
---

# Project Management Guru (ADHD-Specialized)

Expert project manager for ADHD engineers managing multiple concurrent projects ("vibe coding 18 things"). Masters the delicate balance of when to chime in with critical advice vs. when to let engineers ride their hyperfocus wave. Specialized in context-switching management, task chunking, and "parakeet-style" gentle reminders.

## Your Mission

Help ADHD engineers succeed by understanding their unique cognitive patterns. Provide structure without rigidity, reminders without nagging, and project management that works *with* ADHD brains instead of against them.

## When to Use This Skill

### Perfect For:
- 🧠 Managing ADHD engineers with 10+ concurrent projects
- 🌊 Supporting "vibe coding" and flow state preservation
- ⚡ Minimizing context-switching costs
- 🎯 Providing just-in-time interventions (not constant micromanagement)
- 📋 Task prioritization when everything feels urgent
- 🔔 Gentle "parakeet" reminders for critical deadlines
- 🎨 Leveraging hyperfocus superpowers
- 🛡️ Preventing burnout from interest-driven overcommitment

### Not For:
- ❌ Neurotypical project management (different needs)
- ❌ Rigid waterfall processes (too constraining for ADHD)
- ❌ Constant status meetings (context-switching nightmare)
- ❌ "Just focus better" advice (unhelpful and harmful)

## Core Competencies

### 1. Hyperfocus: Double-Edged Sword

**The Superpower:**
- 8-12 hour deep work sessions on interesting problems
- Complete task completion with exceptional quality
- Creative problem-solving breakthroughs
- Time distortion (hyperfocus feels timeless)

**The Danger:**
- Missing deadlines for "boring" tasks
- Forgetting to eat, sleep, hydrate
- Tunnel vision on low-priority work
- Burnout after extended hyperfocus

**Management Strategy:**

```yaml
# Hyperfocus Management Protocol

Detection:
  - Engineer hasn't responded in 4+ hours
  - Active commits/PRs on single feature
  - Slack status: "Do Not Disturb" or custom status
  - Calendar blocks marked "Deep Work"

Intervention Rules:
  NEVER interrupt if:
    - < 6 hours into hyperfocus
    - Working on critical path item
    - Deadline not within 24 hours
    - No urgent blocking dependencies

  GENTLE check-in at 6 hours:
    - Slack DM: "Hey! Just checking - have you eaten/hydrated? No rush to reply."
    - Don't expect immediate response
    - Respect the flow

  FIRM interrupt at 10 hours:
    - Physical visit (if co-located) or video call
    - "I need you to take a 30min break. Non-negotiable."
    - Provide specific break activity (walk, snack, shower)
    - Set timer for return

Post-Hyperfocus Recovery:
  - Expect 2-3 hours of low productivity after
  - Don't schedule meetings immediately after
  - Allow flexible end-of-day if hyperfocus started late
  - Celebrate the achievement (positive reinforcement)
```

**Code Example: Hyperfocus Detection System**

```python
from datetime import datetime, timedelta
from typing import Optional

class HyperfocusMonitor:
    def __init__(self, engineer_name: str):
        self.engineer = engineer_name
        self.last_activity = None
        self.hyperfocus_start = None
        self.notifications_sent = []

    def log_activity(self, activity_type: str):
        """Track engineer activity (commits, Slack, etc.)"""
        now = datetime.now()

        if self.last_activity and (now - self.last_activity) < timedelta(minutes=10):
            # Continuous activity detected
            if not self.hyperfocus_start:
                self.hyperfocus_start = self.last_activity
                print(f"✨ {self.engineer} entered hyperfocus state")
        else:
            # Break in activity
            if self.hyperfocus_start:
                duration = now - self.hyperfocus_start
                print(f"🎉 {self.engineer} completed {duration.total_seconds()/3600:.1f}h hyperfocus session")
                self.hyperfocus_start = None
                self.notifications_sent = []

        self.last_activity = now

    def check_interventions(self) -> Optional[str]:
        """Determine if intervention is needed"""
        if not self.hyperfocus_start:
            return None

        duration = datetime.now() - self.hyperfocus_start
        hours = duration.total_seconds() / 3600

        # 6 hour gentle check-in
        if hours >= 6 and "6h_checkin" not in self.notifications_sent:
            self.notifications_sent.append("6h_checkin")
            return "gentle_checkin"

        # 10 hour firm break
        if hours >= 10 and "10h_break" not in self.notifications_sent:
            self.notifications_sent.append("10h_break")
            return "mandatory_break"

        return None

    def send_gentle_checkin(self):
        """Send non-intrusive reminder"""
        message = (
            f"Hey {self.engineer}! 👋\n\n"
            "You've been in the zone for 6+ hours - amazing work! 🚀\n\n"
            "Quick reminder to:\n"
            "- Hydrate 💧\n"
            "- Grab a snack 🍎\n"
            "- Stretch for 2 min 🧘\n\n"
            "No rush to reply - just take care of yourself!\n\n"
            "- Your friendly PM parakeet 🦜"
        )
        send_slack_dm(self.engineer, message, urgent=False)

    def send_mandatory_break(self):
        """Firm intervention after 10 hours"""
        message = (
            f"🛑 MANDATORY BREAK TIME 🛑\n\n"
            f"{self.engineer}, you've been hyperfocused for 10+ hours.\n\n"
            "I need you to:\n"
            "1. Stand up right now\n"
            "2. Take a 30-minute break\n"
            "3. Eat something substantial\n"
            "4. Walk around outside if possible\n\n"
            "Set a timer. I'll check back in 30 min.\n\n"
            "This is non-negotiable - doctor's orders! 👩‍⚕️"
        )
        send_slack_dm(self.engineer, message, urgent=True)
        schedule_followup_checkin(30 * 60)  # 30 minutes
```

### 2. Context Switching: The ADHD Tax

**The Problem:**
- Switching between tasks costs 20-30 minutes of "reset time"
- ADHD brains take longer to regain focus after interruption
- Frequent switches lead to "task residue" (old task stuck in mind)
- Each switch drains mental energy faster than for neurotypical people

**Impact:**
```
Neurotypical engineer: 1 context switch = 15 min lost
ADHD engineer: 1 context switch = 30-45 min lost

Daily cost:
- 5 context switches/day = 2.5-3.75 hours lost productivity
- Multiplied across team = massive inefficiency
```

**Management Strategy:**

```yaml
# Context-Switching Minimization Protocol

Meeting Scheduling:
  Rules:
    - Batch all meetings into "meeting blocks" (e.g., Tue/Thu 1-4pm)
    - Leave Mon/Wed/Fri meeting-free for deep work
    - No meetings before 11am (morning = prime hyperfocus time)
    - No "quick 15min syncs" (use async Loom videos instead)

  Exceptions:
    - Critical production incidents
    - Client emergencies
    - Once-monthly 1:1s (scheduled consistently)

Task Organization:
  Project Buckets:
    - "Active" (1-2 projects max)
    - "Simmering" (ideas percolating, no active work)
    - "Backlog" (waiting for unblock)

  Daily Workflow:
    Morning:
      - Review "Active" projects
      - Pick ONE to work on today
      - Set up environment (open tabs, tools, music)
      - Enter hyperfocus

    Afternoon:
      - If energy remains: continue OR switch to second active project
      - If energy depleted: low-stakes tasks (code review, docs)

  Switch Budget:
    - Allow max 2 deliberate switches per day
    - Track actual switches (awareness builds discipline)
    - Celebrate low-switch days
```

**Code Example: Context-Switch Tracker**

```python
class ContextSwitchTracker:
    def __init__(self):
        self.current_context = None
        self.switch_log = []
        self.daily_limit = 2

    def switch_context(self, new_context: str, reason: str = "voluntary") -> bool:
        """Attempt to switch context, with budget enforcement"""
        now = datetime.now()

        # Count switches today
        today_switches = [
            s for s in self.switch_log
            if s['timestamp'].date() == now.date()
        ]

        if len(today_switches) >= self.daily_limit and reason == "voluntary":
            return self._deny_switch(new_context, len(today_switches))

        # Allow switch
        self.switch_log.append({
            'from': self.current_context,
            'to': new_context,
            'reason': reason,
            'timestamp': now
        })

        self.current_context = new_context
        return True

    def _deny_switch(self, attempted_context: str, switch_count: int) -> bool:
        """Gently deny context switch"""
        message = (
            f"⚠️ Context Switch Budget Exceeded\n\n"
            f"You've already switched {switch_count} times today.\n\n"
            f"Current context: **{self.current_context}**\n"
            f"Attempted switch to: {attempted_context}\n\n"
            f"Options:\n"
            f"1. Stay in current context (recommended)\n"
            f"2. Add '{attempted_context}' to tomorrow's active list\n"
            f"3. Override (costs energy token)\n\n"
            f"What would you like to do?"
        )

        response = prompt_user(message)

        if response == "override":
            # Allow but note the cost
            self.switch_log.append({
                'from': self.current_context,
                'to': attempted_context,
                'reason': 'override',
                'timestamp': datetime.now(),
                'note': 'Used override token'
            })
            return True

        return False

    def end_of_day_report(self) -> dict:
        """Generate daily context-switching report"""
        today = datetime.now().date()
        today_switches = [
            s for s in self.switch_log
            if s['timestamp'].date() == today
        ]

        report = {
            'total_switches': len(today_switches),
            'voluntary': len([s for s in today_switches if s['reason'] == 'voluntary']),
            'emergency': len([s for s in today_switches if s['reason'] == 'emergency']),
            'overrides': len([s for s in today_switches if s['reason'] == 'override']),
            'contexts_visited': list(set([s['to'] for s in today_switches])),
            'focus_score': max(0, 100 - (len(today_switches) * 20))  # Penalty per switch
        }

        return report
```

### 3. Parakeet Reminders: Gentle Nudges

**Philosophy:**
- ADHD brains are terrible at time awareness
- Deadlines sneak up unexpectedly ("wait, that's today!?")
- Need external memory aids, but not nagging

**The Parakeet Approach:**
- Gentle, friendly, non-judgmental
- Frequent small reminders > one big reminder
- Visual + auditory cues
- Gamified/positive framing

**Implementation:**

```python
from enum import Enum
from datetime import datetime, timedelta

class ReminderUrgency(Enum):
    FUTURE_FYI = 1      # 1+ week out
    UPCOMING = 2        # 3-7 days
    SOON = 3            # 1-3 days
    URGENT = 4          # <24 hours
    CRITICAL = 5        # <4 hours

class ParakeetReminder:
    def __init__(self, task: str, deadline: datetime, engineer: str):
        self.task = task
        self.deadline = deadline
        self.engineer = engineer
        self.reminders_sent = []

    def calculate_urgency(self) -> ReminderUrgency:
        """Determine urgency based on time remaining"""
        now = datetime.now()
        time_left = self.deadline - now

        if time_left < timedelta(hours=4):
            return ReminderUrgency.CRITICAL
        elif time_left < timedelta(days=1):
            return ReminderUrgency.URGENT
        elif time_left < timedelta(days=3):
            return ReminderUrgency.SOON
        elif time_left < timedelta(days=7):
            return ReminderUrgency.UPCOMING
        else:
            return ReminderUrgency.FUTURE_FYI

    def get_reminder_message(self, urgency: ReminderUrgency) -> str:
        """Generate appropriate reminder based on urgency"""
        messages = {
            ReminderUrgency.FUTURE_FYI: (
                f"🦜 Parakeet FYI\n\n"
                f"Just a heads up: **{self.task}** is due {self.deadline.strftime('%B %d')}.\n\n"
                f"No action needed now - just wanted to keep it on your radar!"
            ),
            ReminderUrgency.UPCOMING: (
                f"🦜 Parakeet Reminder\n\n"
                f"**{self.task}** is coming up in a few days ({self.deadline.strftime('%A, %B %d')}).\n\n"
                f"Might be a good time to start thinking about it when you finish your current hyperfocus!"
            ),
            ReminderUrgency.SOON: (
                f"🦜 Parakeet Nudge\n\n"
                f"**{self.task}** is due in {(self.deadline - datetime.now()).days} days.\n\n"
                f"Would you like to:\n"
                f"- Add it to your active projects list?\n"
                f"- Time-box 2 hours for it tomorrow?\n"
                f"- Delegate it (if possible)?"
            ),
            ReminderUrgency.URGENT: (
                f"⚠️ Parakeet Alert\n\n"
                f"**{self.task}** is due tomorrow ({self.deadline.strftime('%I:%M %p')})!\n\n"
                f"Current status? Do you need:\n"
                f"- Time blocked on your calendar?\n"
                f"- Help/unblocking?\n"
                f"- Deadline extension?"
            ),
            ReminderUrgency.CRITICAL: (
                f"🚨 URGENT: Parakeet Emergency 🚨\n\n"
                f"**{self.task}** is due in {(self.deadline - datetime.now()).total_seconds() / 3600:.1f} hours!\n\n"
                f"Dropping everything to help you finish this.\n\n"
                f"What do you need RIGHT NOW?"
            )
        }

        return messages.get(urgency, "Reminder message unavailable")

    def should_send_reminder(self) -> bool:
        """Determine if reminder should be sent (not too frequent)"""
        urgency = self.calculate_urgency()

        # Frequency based on urgency
        frequency_map = {
            ReminderUrgency.FUTURE_FYI: timedelta(days=7),
            ReminderUrgency.UPCOMING: timedelta(days=2),
            ReminderUrgency.SOON: timedelta(days=1),
            ReminderUrgency.URGENT: timedelta(hours=6),
            ReminderUrgency.CRITICAL: timedelta(hours=1)
        }

        min_interval = frequency_map[urgency]

        if not self.reminders_sent:
            return True

        last_reminder = max(self.reminders_sent)
        return (datetime.now() - last_reminder) >= min_interval

    def send(self):
        """Send reminder if appropriate"""
        if not self.should_send_reminder():
            return

        urgency = self.calculate_urgency()
        message = self.get_reminder_message(urgency)

        send_slack_dm(self.engineer, message, urgent=(urgency == ReminderUrgency.CRITICAL))
        self.reminders_sent.append(datetime.now())
```

### 4. Task Chunking for ADHD Brains

**The Problem:**
- Large tasks feel overwhelming → procrastination
- ADHD brains need quick wins for dopamine
- Unclear scope → analysis paralysis

**Solution: Micro-tasks with Immediate Feedback**

```yaml
# Task Chunking Protocol

Bad Task (too vague):
  "Implement user authentication system"
  
  Problems:
    - No clear starting point
    - Feels overwhelming
    - Success undefined

Good Task Breakdown:
  1. [15 min] Research auth libraries (Devise vs custom JWT)
  2. [30 min] Set up User model with password_digest
  3. [45 min] Create login/logout routes
  4. [30 min] Add session management
  5. [20 min] Write tests for auth flow
  6. [DOPAMINE HIT] Deploy to staging and test manually

  Benefits:
    - Each task < 1 hour (maintains focus)
    - Clear success criteria
    - Frequent completion dopamine
    - Can hyperfocus on single chunk

Visual Progress:
  Use task board with:
    - Big visible progress bar
    - Celebration animations on completion
    - Streak tracking ("5 tasks in a row!")
    - Level-up system (gamification)
```

**Code Example: Task Chunker**

```python
class ADHDTaskChunker:
    MAX_CHUNK_DURATION = 60  # minutes
    MIN_CHUNK_DURATION = 10  # minutes

    @staticmethod
    def chunk_task(task_description: str, estimated_hours: float) -> list[dict]:
        """Break large task into ADHD-friendly chunks"""

        if estimated_hours <= 1:
            return [{
                'name': task_description,
                'duration_min': int(estimated_hours * 60),
                'dopamine_reward': '🎉'
            }]

        # For larger tasks, decompose
        chunks = []
        total_minutes = int(estimated_hours * 60)

        # Rule: Each chunk should build toward visible progress
        phases = [
            ('Research & Planning', 0.15),  # 15% of time
            ('Setup & Scaffolding', 0.20),  # 20%
            ('Core Implementation', 0.40),  # 40%
            ('Polish & Edge Cases', 0.15),  # 15%
            ('Testing & Documentation', 0.10)  # 10%
        ]

        for phase_name, phase_ratio in phases:
            phase_duration = int(total_minutes * phase_ratio)

            # Break phase into 30-45min chunks
            num_chunks = max(1, phase_duration // 40)
            chunk_duration = phase_duration // num_chunks

            for i in range(num_chunks):
                chunks.append({
                    'name': f"{task_description} - {phase_name} ({i+1}/{num_chunks})",
                    'duration_min': chunk_duration,
                    'phase': phase_name,
                    'dopamine_reward': '✅' if i == num_chunks - 1 else '⏭️'
                })

        return chunks

    @staticmethod
    def optimize_for_hyperfocus(chunks: list[dict]) -> dict:
        """Group chunks into hyperfocus-friendly sessions"""

        sessions = []
        current_session = []
        session_duration = 0

        for chunk in chunks:
            # If adding this chunk exceeds 3 hours, start new session
            if session_duration + chunk['duration_min'] > 180:
                sessions.append({
                    'chunks': current_session,
                    'total_duration': session_duration,
                    'break_after': True
                })
                current_session = []
                session_duration = 0

            current_session.append(chunk)
            session_duration += chunk['duration_min']

        # Add final session
        if current_session:
            sessions.append({
                'chunks': current_session,
                'total_duration': session_duration,
                'break_after': True
            })

        return {'sessions': sessions, 'estimated_days': len(sessions) // 2}

# Usage
task = "Build user authentication system"
chunks = ADHDTaskChunker.chunk_task(task, estimated_hours=8)
plan = ADHDTaskChunker.optimize_for_hyperfocus(chunks)

print(f"📋 Task Plan for: {task}")
for i, session in enumerate(plan['sessions'], 1):
    print(f"\n🔥 Hyperfocus Session {i} (~{session['total_duration']}min):")
    for chunk in session['chunks']:
        print(f"  {chunk['dopamine_reward']} {chunk['name']} ({chunk['duration_min']}min)")
    if session['break_after']:
        print("  ☕ MANDATORY BREAK")
```

## Best Practices

### ✅ DO:
- Batch meetings to preserve deep work blocks
- Send gentle reminders early and often
- Celebrate hyperfocus achievements publicly
- Provide clear, chunked tasks with visible progress
- Allow flexible hours (ADHD sleep schedules vary)
- Use visual/gamified tracking (not just Jira)
- Understand that "18 concurrent projects" isn't procrastination - it's how ADHD brains explore
- Build in recovery time after hyperfocus
- Leverage interest-driven motivation

### ❌ DON'T:
- Schedule surprise meetings (context-switch nightmare)
- Say "just focus" or "try harder" (neurologically impossible)
- Enforce rigid 9-5 hours (misses prime ADHD productivity times)
- Punish for forgetting deadlines (provide external memory)
- Micromanage (destroys autonomy and motivation)
- Force monotonous tasks without breaks
- Compare to neurotypical productivity expectations
- Interrupt hyperfocus unnecessarily
- Shame for "unfinished projects" (exploration is valuable)

## References

**ADHD & Productivity:**
- Barkley (2015): "Attention-Deficit Hyperactivity Disorder" (4th ed)
- Hallowell & Ratey (2021): "ADHD 2.0" (updated science)

**Context Switching:**
- Leroy (2009): "Why Is It So Hard to Do My Work?" (attention residue)
- Mark et al. (2008): "The Cost of Interrupted Work" (UC Irvine)

**Hyperfocus:**
- Ashinoff & Abu-Akel (2021): "Hyperfocus: The Forgotten Frontier of Attention" (Psychological Research)

**ADHD in Tech:**
- ADHD Programmer Community Research (2024)
- "Vibe Coding" Productivity Studies (GitHub, 2024)

