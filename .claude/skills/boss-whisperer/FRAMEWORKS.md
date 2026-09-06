# The decode engine

The psychological frameworks behind The Decode. Harvested from the year-old TheBossWhisperer
app (`server/openai.ts`) and extended with two further lenses: Munger's
misjudgment inversion and the Gottman communication read.

Run these on the **tokenised** text (`[BOSS]`, `[COMPANY]`, …). Synthesise — never dump the raw
frameworks at the user. Use only the layers the input can support. Every claim the evidence
can't carry is `(inference)` or a gap.

---

## Layer 1 — Munger inversion (the spine)

Charlie Munger, *The Psychology of Human Misjudgment*: humans run on a small set of standard
misjudgment tendencies. Find the two or three that drive **this** boss, then **invert** — the
flaw in their reasoning *is* the handle for working with them.

Scan for the tendencies that fit the evidence (this is the working subset, not all 25):

- **Reward/punishment superresponse** — what are they *actually* incentivised on (bonus, their
  own boss's approval, a board metric)? Behaviour that looks irrational usually serves a hidden
  incentive. Find the incentive, predict the behaviour.
- **Liking/loving & disliking/hating** — they over-trust people they like and discount people
  they don't, regardless of the work. Which camp is the user in, and why?
- **Consistency & commitment** — once they've said a thing publicly, they defend it past the
  evidence. Don't make them reverse in public; give them a face-saving off-ramp.
- **Social proof** — they move when peers/the market/the board move. Frame the ask as what
  others already do.
- **Authority-misinfluence** — they defer up and expect deference down. Who is *their*
  authority figure, and how does that shape what they'll greenlight?
- **Deprivation superreaction (loss aversion)** — they feel a loss ~2x a gain. Frame proposals
  as protecting against a loss, not chasing an upside.
- **Availability / recency** — the last vivid thing dominates their read. Timing of the ask
  matters as much as the ask.
- **Stress / first-conclusion bias** — under pressure they lock onto the first answer. Don't
  bring big asks into their stress windows.

**The inversion move:** name the flaw, then state the *working-with-it* play. Not "they're
arrogant" but "they're consistency-locked, so never ask them to U-turn in a meeting — give them
the new data privately and let them arrive at it." The flaw is the instruction.

## Layer 2 — Therapeutic profile (why they tick)

The six-framework engine. Produces mechanism, triggers, and motivators. For each, infer only
what the evidence supports; rate the numeric scales as rough reads, not measurements.

1. **CBT** — cognitive distortions (catastrophising, black-and-white thinking, mind-reading),
   the behavioural patterns that reinforce them, what they're averse to, and the healthy coping
   they already use. → tells you their triggers and what *not* to poke.
2. **IFS (Internal Family Systems)** — protector parts (how they shield from vulnerability),
   exile parts (the wound underneath), firefighter parts (the reactive behaviour under stress),
   and their self-leadership capacity (can they get back to calm-confident?). → tells you what's
   really happening when they flare.
3. **Transactional Analysis** — their stroke economy (how they give/withhold recognition), and
   which ego state dominates: Critical/Nurturing Parent, Adult, or Adaptive/Free Child. → tells
   you which mode to meet them in. ("They're in Critical Parent right now — don't meet it with
   Child.")
4. **Attachment** — secure / anxious / avoidant / disorganised in *work* relationships, plus how
   it shifts under stress, and how it shows up (trust, micromanagement, withdrawal). → tells you
   how to build trust and what reads as threat.
5. **Big Five** — rough 0–100 on Openness, Conscientiousness, Extraversion, Agreeableness,
   Neuroticism. → calibrates tone, detail level, and pace.
6. **DISC** — rough 0–100 on Dominance, Influence, Steadiness, Conscientiousness. → the fastest
   communication-style match: a high-D wants the headline, a high-S wants the reassurance, a
   high-C wants the evidence.

Output of this layer feeds the manage-up playbook: preferred tone, response style, meeting vs
email, best timing, trigger words to avoid, words that land.

## Layer 3 — Gottman read (only with a transcript)

Score the *communication*, not the person. From John Gottman's research on what predicts
relationship breakdown, adapted to the workplace.

- **The Four Horsemen** — flag and quote instances of:
  - *Criticism* (attacking character, "you always…") vs a specific complaint.
  - *Contempt* (the strongest signal — sarcasm, condescension, eye-roll-in-text). The most
    corrosive; if it's present, name it.
  - *Defensiveness* (counter-attacking, victim-stance, refusing any responsibility).
  - *Stonewalling* (withdrawal, one-word replies, going silent / ghosting threads).
- **Bids for connection** — small moves for attention/engagement, and whether the boss turns
  *toward*, *away*, or *against* them. A boss who consistently turns away from bids is telling
  you something.
- **Repair attempts** — does anyone de-escalate, soften, joke, reset? Whether repairs land is
  more diagnostic than whether conflict happens.

Output: the real emotional weather of the relationship, and where the user is (often
unknowingly) feeding a horseman they could drop.

---

## Source the methods (link them in the Decode)

Part of the appeal is that this is built on real, named frameworks — not vibes. Cite the two
headline methods by name in the Decode and link the canonical source so the user can read it:

- **Munger — *The Psychology of Human Misjudgment***. Charlie Munger's speech cataloguing the
  ~25 standard causes of human misjudgment; definitive text is in *Poor Charlie's Almanack*.
  Link a stable transcript (e.g. the widely-cited [fs.blog / Farnam Street](https://fs.blog/great-talks/psychology-human-misjudgment/)
  version) — verify the link resolves before publishing it.
- **Gottman — the Four Horsemen** (and bids / repair attempts). From John & Julie Gottman's
  research; canonical write-up at [The Gottman Institute](https://www.gottman.com/blog/the-four-horsemen-recognizing-criticism-contempt-defensiveness-and-stonewalling/) —
  again, verify before publishing.

Don't fabricate a precise URL. If unsure a deep link resolves, link the institute/book by name
rather than a guessed slug. The point is to give the user a real source to go read, not to
look authoritative with a dead link.

## Synthesis rules

- **One read, not three reports.** Weave the layers into a single decode. Reference frameworks
  naturally if at all ("that's classic consistency-commitment", "they turn away from your bids
  in writing") — never as headings the user has to wade through.
- **Mechanism over label.** "They're avoidant-attached, so written praise lands better than a
  surprise in a meeting" beats "they are avoidant."
- **Evidence discipline.** Thin input → thin honest decode. Mark `(inference)`. A confident
  fabrication about a real person the user works with every day is worse than a recorded gap.
- **Stay on the line.** Every recommendation is "understand and work with", never "exploit".
