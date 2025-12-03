---
title: HRV Biofeedback & Interoception Training
sidebar_label: HRV Biofeedback & Interocep...
sidebar_position: 3
---
# HRV Biofeedback & Interoception Training

## HRV Biofeedback Protocol

```python
class HRVBiofeedbackTraining:
    """Train emotional awareness through HRV feedback"""

    def __init__(self):
        self.session_history = []

    def guided_breathing_session(self, duration_minutes=10):
        """
        Resonance frequency breathing to increase HRV
        Typical resonance: 5.5-6.5 breaths/minute
        """

        breath_rate = 6  # breaths per minute (0.1 Hz - ideal for HRV)
        inhale_seconds = 5
        exhale_seconds = 5

        protocol = {
            'duration': duration_minutes,
            'breath_rate': breath_rate,
            'goal': 'Increase RMSSD by 20% from baseline',
            'emotional_check': 'Rate your emotional state 0-10 before/after'
        }

        return protocol

    def emotion_body_mapping(self):
        """
        Exercise to connect HRV changes with emotional states
        """

        mapping_protocol = """
        1. Baseline measurement (5 min rest, measure HRV)

        2. Emotion induction series:
           - Recall calm memory (3 min) → Measure HRV
           - Recall stressful memory (3 min) → Measure HRV
           - Recall joyful memory (3 min) → Measure HRV
           - Return to neutral (3 min) → Measure HRV

        3. For each state, note:
           - Physical sensations (chest tight? stomach warm?)
           - Breathing pattern (fast? slow? shallow?)
           - HRV metrics (RMSSD, LF/HF)
           - Emotional label (even if vague)

        4. Build personal emotion-HRV map:
           "When RMSSD drops to X and I feel tightness in chest,
            that's probably anxiety/stress"
        """

        return mapping_protocol
```

## Interoception Training Exercises

### Body Scan with HRV Feedback

```
1. Lie down in quiet space
2. Start HRV measurement
3. Systematically scan body:
   - Feet → legs → pelvis → abdomen → chest → arms → head
4. At each location, ask:
   - "What sensations am I aware of?"
   - "Is there tension, warmth, tingling, nothing?"
5. When you notice strong sensation, check HRV:
   - Did it change?
   - What might that mean emotionally?
6. Practice labeling:
   - "Tight chest + low HRV = anxiety"
   - "Warm belly + high HRV = calm/contentment"
```

## Practical Applications

### Daily HRV-Emotion Check-In

**Morning Routine:**
```
1. Upon waking, measure HRV (3-5 min)
2. Note sleep quality
3. Check HRV metrics against baseline:
   - Higher than baseline? → Good recovery, ready for challenges
   - Lower than baseline? → Need rest/recovery day
4. Ask: "How do I feel?" (use emotion wheel if needed)
5. Connect: "My HRV is X, I feel Y" → Build association
```

**Stress Response Training:**
```
When you feel "off" but can't identify the emotion:

1. Stop and measure HRV for 2 minutes
2. If LF/HF > 2.5 and RMSSD low → Stress response active
3. Physical sensations check:
   - Rapid heartbeat? Shallow breathing? → Anxiety
   - Slumped posture? Fatigue? → Sadness
   - Clenched jaw? Tense shoulders? → Anger
4. Use HRV biofeedback breathing to downregulate
5. Re-measure: Did HRV improve? How do you feel now?
```

## Case Example: Putting It Together

**Client Profile:**
- High-functioning professional with burnout
- TAS-20 score: 64 (alexithymia)
- Somatic complaints: chronic tension, GI issues
- Says "I just feel stressed all the time"

**Intervention:**

**Week 1-2: Baseline & Education**
- Daily morning HRV measurement → Baseline RMSSD: 22ms (low)
- Learn about ANS, HRV, emotion-body connection
- Begin emotion wheel practice

**Week 3-4: HRV Biofeedback Training**
- 10 min/day resonance breathing
- Track HRV improvement during session
- Note: "When I breathe slowly, chest relaxes, HRV goes up"
- Building association: relaxed body = parasympathetic = calm

**Week 5-6: Emotion Differentiation**
- Before/after HRV measurements with emotion induction
- Discover: Work emails → RMSSD drops to 15ms, chest tightens = anxiety
- Discover: Talking to friend → RMSSD rises to 35ms, chest opens = contentment
- Expanding from "stressed" to "anxious" vs. "frustrated" vs. "overwhelmed"

**Week 7-8: Integration**
- Real-time HRV alerts when stress response activates
- Prompt: "Check in - what emotion might this be?"
- Use breathing to regulate, re-measure
- TAS-20 retest: 56 (improvement)
- RMSSD baseline: 32ms (significant improvement)

**Outcome:**
- Can identify 5-6 distinct emotions vs. just "stressed"
- Uses HRV as early warning system
- Has tools (breathing) to regulate
- Physical symptoms reduced by 40%
