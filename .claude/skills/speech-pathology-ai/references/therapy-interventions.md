# Therapy Intervention Strategies

## Minimal Pair Contrast Therapy

```python
class MinimalPairTherapy:
    """
    Therapy technique for phonological disorders
    Uses word pairs differing by single phoneme
    """

    minimal_pairs = {
        'r_w': [
            ('rip', 'whip'),
            ('rake', 'wake'),
            ('read', 'weed'),
            ('row', 'woe')
        ],
        's_th': [
            ('sink', 'think'),
            ('song', 'thong'),
            ('sum', 'thumb'),
            ('sank', 'thank')
        ],
        'p_b': [
            ('pan', 'ban'),
            ('pear', 'bear'),
            ('pine', 'bine'),
            ('poke', 'broke')
        ]
    }

    def generate_exercise(self, target_contrast):
        """
        Generate discrimination and production exercises
        """
        pairs = self.minimal_pairs.get(target_contrast, [])

        # Discrimination task
        discrimination = {
            'instruction': "Listen carefully. Are these words the same or different?",
            'trials': [
                {'audio1': pair[0], 'audio2': pair[1], 'answer': 'different'}
                for pair in pairs
            ] + [
                {'audio1': pair[0], 'audio2': pair[0], 'answer': 'same'}
                for pair in pairs[:2]
            ]
        }

        # Production task
        production = {
            'instruction': "Look at the picture and say the word.",
            'trials': [
                {'picture': pair[0], 'target': pair[0], 'foil': pair[1]}
                for pair in pairs
            ]
        }

        return {
            'discrimination': discrimination,
            'production': production
        }
```

## Fluency Shaping Techniques

```python
class FluencyTherapy:
    """
    Interventions for stuttering/cluttering
    """

    @staticmethod
    def easy_onset_exercise():
        """
        Gentle initiation of voicing
        """
        return {
            'name': 'Easy Onset',
            'description': 'Start words gently, like a whisper growing louder',
            'practice_words': ['apple', 'ocean', 'elephant', 'umbrella'],
            'instructions': [
                '1. Take a breath',
                '2. Start the word very softly',
                '3. Gradually increase volume',
                '4. Maintain airflow throughout'
            ],
            'visual_feedback': 'volume_meter'  # Show gradual volume increase
        }

    @staticmethod
    def prolonged_speech():
        """
        Slow, stretched speech pattern
        """
        return {
            'name': 'Prolonged Speech',
            'target_rate': 60,  # words per minute (vs normal 150-200)
            'technique': 'Stretch vowels, gentle transitions',
            'practice_sentences': [
                "I am speaking slowly.",
                "The cat is on the mat.",
                "Today is a good day."
            ],
            'feedback': 'speech_rate_visualization'
        }

    def analyze_disfluencies(self, transcription, timestamps):
        """
        Detect and categorize stuttering moments
        """
        disfluencies = {
            'repetitions': [],      # "I-I-I want"
            'prolongations': [],    # "Sssssnake"
            'blocks': [],           # Silent struggle
            'interjections': []     # "um", "uh"
        }

        # Pattern matching for disfluencies
        # (Would use audio analysis + transcription)

        return disfluencies
```

## AAC (Augmentative and Alternative Communication)

```javascript
class AACDevice {
    constructor() {
        this.vocabulary = this.loadCoreVocabulary();
        this.userProfile = null;
        this.predictionModel = null;
    }

    loadCoreVocabulary() {
        // Fringe, Core vocabulary for AAC
        return {
            core: [
                // High-frequency words (Fringe vocabulary)
                'I', 'you', 'want', 'more', 'go', 'stop', 'help', 'yes', 'no',
                'like', 'here', 'there', 'what', 'who', 'where'
            ],
            fringe: {
                food: ['apple', 'banana', 'water', 'milk', 'snack'],
                activities: ['play', 'read', 'watch', 'listen', 'walk'],
                feelings: ['happy', 'sad', 'angry', 'tired', 'excited']
            }
        };
    }

    predictNextWord(currentPhrase) {
        /**
         * Word prediction using n-gram model or neural LM
         * Speeds up communication significantly
         */
        const words = currentPhrase.split(' ');
        const context = words.slice(-2);  // Bigram context

        // Get predictions from model
        const predictions = this.predictionModel.predict(context);

        // Return top 5 predictions
        return predictions.slice(0, 5);
    }

    speakPhrase(text, options = {}) {
        const utterance = new SpeechSynthesisUtterance(text);

        // Personalized voice settings
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.voice = this.userProfile?.preferredVoice || null;

        speechSynthesis.speak(utterance);
    }

    createSymbolBoard(category) {
        /**
         * Generate visual symbol board (PCS, SymbolStix)
         * For users who benefit from visual supports
         */
        return {
            category,
            symbols: this.vocabulary.fringe[category].map(word => ({
                word,
                symbol: `symbols/${word}.png`,
                audio: `audio/${word}.mp3`
            }))
        };
    }
}
```

## Progress Tracking & Gamification

```python
import numpy as np

class TherapyProgressTracker:
    def __init__(self, client_id):
        self.client_id = client_id
        self.baseline = None
        self.sessions = []

    def record_session(self, session_data):
        """
        Track accuracy, consistency, generalization
        """
        self.sessions.append({
            'date': session_data['date'],
            'target_sound': session_data['target'],
            'accuracy': session_data['accuracy'],
            'trials': session_data['trials'],
            'context': session_data['context']  # isolation, word, sentence, conversation
        })

    def calculate_progress(self):
        """
        Generate progress report
        """
        if not self.sessions:
            return None

        recent = self.sessions[-5:]  # Last 5 sessions

        avg_accuracy = np.mean([s['accuracy'] for s in recent])
        consistency = np.std([s['accuracy'] for s in recent])

        # Trend analysis
        accuracies = [s['accuracy'] for s in self.sessions]
        trend = np.polyfit(range(len(accuracies)), accuracies, deg=1)[0]

        return {
            'current_accuracy': avg_accuracy,
            'consistency': consistency,
            'trend': 'improving' if trend > 0 else 'stable' if abs(trend) < 0.01 else 'declining',
            'sessions_completed': len(self.sessions),
            'ready_for_generalization': avg_accuracy > 80 and consistency < 10
        }

    def suggest_next_step(self):
        """
        Adaptive therapy progression
        """
        progress = self.calculate_progress()

        if progress['current_accuracy'] < 50:
            return "Continue with current level - focus on accuracy"
        elif progress['current_accuracy'] < 80:
            return "Increase difficulty slightly - add complexity"
        elif progress['ready_for_generalization']:
            return "Ready for generalization - move to conversation"
        else:
            return "Maintain current level - build consistency"
```
