# Alexithymia Assessment & Understanding

## Understanding Alexithymia

**Three Core Components:**

### 1. Difficulty Identifying Feelings (DIF)
- Can't tell if feeling anxious vs. angry vs. sad
- Physical sensations without emotional labels
- "I feel bad" but can't be more specific

### 2. Difficulty Describing Feelings (DDF)
- Know you feel something, can't put it into words
- Limited emotional vocabulary
- Struggle to communicate feelings to others

### 3. Externally-Oriented Thinking (EOT)
- Focus on external events over internal experience
- Concrete thinking about emotions
- Avoid introspection

## Prevalence

~10% of general population, higher in:
- Autism spectrum (50%)
- PTSD (30-40%)
- Eating disorders (40-60%)
- Depression/anxiety (30%)
- Chronic pain conditions (30%)

## Assessment Tools

### Toronto Alexithymia Scale (TAS-20)

20 questions, 5-point Likert scale:
- Score < 51: Non-alexithymia
- Score 52-60: Possible alexithymia
- Score > 61: Alexithymia

**Sample Questions:**
- "I am often confused about what emotion I am feeling"
- "It is difficult for me to find the right words for my feelings"
- "I prefer to analyze problems rather than just describe them"

### BVAQ (Bermond-Vorst Alexithymia Questionnaire)
Distinguishes cognitive vs. affective alexithymia

## The Body-Emotion Disconnection

People with alexithymia often have:
- **Impaired Interoception**: Can't sense internal body states
- **Reduced Insula Activity**: Brain region linking body to emotions
- **High Somatic Symptoms**: Physical complaints without emotional awareness
- **Emotional Dysregulation**: Can't regulate what you can't identify

## Emotion Vocabulary Building

For those with limited emotional words:

```python
emotion_granularity_ladder = {
    'bad': ['uncomfortable', 'upset', 'distressed'],
    'uncomfortable': ['anxious', 'sad', 'angry', 'frustrated'],
    'anxious': ['worried', 'nervous', 'fearful', 'panicked'],
    'sad': ['disappointed', 'lonely', 'grieving', 'hopeless'],
    'angry': ['irritated', 'resentful', 'furious', 'betrayed'],

    'good': ['pleasant', 'positive', 'content'],
    'pleasant': ['happy', 'calm', 'excited', 'proud'],
    'happy': ['joyful', 'delighted', 'cheerful', 'amused'],
    'calm': ['peaceful', 'relaxed', 'serene', 'centered'],
    'excited': ['energized', 'enthusiastic', 'eager', 'thrilled']
}

def expand_emotional_vocabulary(vague_emotion, body_signals, hrv_state, baseline):
    """Help differentiate vague emotions using context"""

    if vague_emotion == 'bad' and hrv_state['rmssd'] < baseline * 0.7:
        if 'chest tight' in body_signals:
            return 'anxious'
        elif 'heavy' in body_signals:
            return 'sad'
        elif 'tense muscles' in body_signals:
            return 'angry'

    # Continue pattern matching...
```
