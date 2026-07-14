/**
 * Cognitive Task Analysis scaffolding for the drawing agent.
 * ==========================================================
 * The free-tier agent doesn't just "emit commands". It runs a small
 * expertise loop drawn from Applied Cognitive Task Analysis (ACTA),
 * the Critical Decision Method, and ShadowBox:
 *
 *   1. Situation assessment  — what kind of thing is this, which tools matter
 *      (handled by the classifier in generate.ts).
 *   2. Wisdom recall         — accrued lessons for this category are injected
 *      below as "Lessons from artists past" (ShadowBox: compare against the
 *      decisions of prior experts).
 *   3. Mental simulation     — the agent must produce an explicit `plan`
 *      before committing to commands.
 *   4. Knowledge elicitation — after drawing, a reflection pass fills a
 *      Cognitive Demands Table + Knowledge Audit, which is stored and becomes
 *      step-2 wisdom for the next agent. This is the accrual flywheel.
 */

import type { Wisdom } from "./db";

/** The drawing-command vocabulary (the agent's formal tools). */
export const PAINT_COMMAND_SPEC = `## Canvas
- Size: 640 x 480 pixels. Origin (0,0) top-left. X right, Y down. Background starts white (#FFFFFF).

## Palette (use ONLY these)
Dark:  #000000 #808080 #800000 #808000 #008000 #008080 #000080 #800080 #008B8B #556B2F #8B4513 #483D8B #4B0082 #191970
Light: #FFFFFF #C0C0C0 #FF0000 #FFFF00 #00FF00 #00FFFF #0000FF #FF00FF #FFA500 #FFC0CB #ADD8E6 #90EE90 #E6E6FA #FFDAB9

## Commands (formal tools)
Color:  {"type":"setForegroundColor","color":"#RRGGBB"}  {"type":"setBackgroundColor","color":"#RRGGBB"}
Draw:   {"type":"drawPixel","x":N,"y":N}  {"type":"drawLine","x1":N,"y1":N,"x2":N,"y2":N}
        {"type":"drawFreehand","points":[{"x":N,"y":N},...]}
        {"type":"drawCurve","startX":N,"startY":N,"endX":N,"endY":N,"controlX1":N,"controlY1":N}
Shape:  {"type":"drawRectangle","x":N,"y":N,"width":N,"height":N,"fillMode":"outline|filled|both"}
        {"type":"drawEllipse","x":N,"y":N,"width":N,"height":N,"fillMode":"..."}
        {"type":"drawRoundedRectangle","x":N,"y":N,"width":N,"height":N,"radius":N,"fillMode":"..."}
        {"type":"drawPolygon","points":[{"x":N,"y":N},...],"fillMode":"..."}
Other:  {"type":"floodFill","x":N,"y":N}  {"type":"spray","x":N,"y":N}  {"type":"sprayPath","points":[...]}
        {"type":"placeText","x":N,"y":N,"text":"...","fontSize":N,"bold":bool}
        {"type":"clearCanvas"}`;

/** Render accrued lessons as a ShadowBox-style briefing for the agent. */
export function renderWisdom(wisdom: Wisdom[]): string {
  if (!wisdom.length) return "";
  const lines = wisdom
    .map((w, i) => {
      const parts: string[] = [];
      if (w.difficultElement) parts.push(`hard part: ${w.difficultElement}`);
      if (w.cuesAndStrategies) parts.push(`what works: ${w.cuesAndStrategies}`);
      if (w.doDifferently) parts.push(`do differently: ${w.doDifferently}`);
      return parts.length ? `${i + 1}. ${parts.join(" — ")}` : "";
    })
    .filter(Boolean);
  if (!lines.length) return "";
  return `\n\n## Lessons from artists past (apply these)\nPrior agents drawing similar subjects learned:\n${lines.join("\n")}`;
}

/** System prompt for the DRAW pass. */
export function buildDrawSystemPrompt(wisdom: Wisdom[]): string {
  return `You are an expert artist working in MS Paint (Windows 3.1 style). You draw by emitting a sequence of paint commands as JSON.

${PAINT_COMMAND_SPEC}
${renderWisdom(wisdom)}

## How to think (do this before drawing)
1. DECOMPOSE the subject into its real parts and draw each one. "A cowboy on a
   horse" = horse body + 4 legs + neck + head + tail, THEN rider torso + arms +
   hat, THEN ground and sky. Draw the thing's actual anatomy/structure, not a
   single box standing in for it.
2. Block in big shapes and background first, then mid-tones, then details last.
3. Pick a small, deliberate colour set from the palette.
4. For people, animals, and plants: build each body part from \`drawPolygon\`
   (5-9 points) or \`drawEllipse\` — organic things are NOT rectangles.
   Rectangles are for buildings, signs, furniture, vehicles.
5. Keep everything inside the 640x480 canvas and cover the whole frame — no large
   empty grey/blank regions unless they are deliberately sky, ground, or water.
   The main subject should span roughly 200-350px.

## Worked example — this is the expected DENSITY and LAYERING
Prompt: "a duck on a pond" (different subject; copy the craft, not the content).
Yours must have the same parts-based structure:
"parts": [
{"part":"sky","commands":[{"type":"setForegroundColor","color":"#ADD8E6"},{"type":"drawRectangle","x":0,"y":0,"width":640,"height":280,"fillMode":"filled"}]},
{"part":"sun","commands":[{"type":"setForegroundColor","color":"#FFA500"},{"type":"drawEllipse","x":500,"y":40,"width":70,"height":70,"fillMode":"filled"}]},
{"part":"clouds","commands":[{"type":"setForegroundColor","color":"#FFFFFF"},{"type":"drawEllipse","x":80,"y":60,"width":120,"height":36,"fillMode":"filled"},{"type":"drawEllipse","x":150,"y":45,"width":90,"height":30,"fillMode":"filled"}]},
{"part":"water","commands":[{"type":"setForegroundColor","color":"#0000FF"},{"type":"drawRectangle","x":0,"y":280,"width":640,"height":200,"fillMode":"filled"}]},
{"part":"duck body","commands":[{"type":"setForegroundColor","color":"#8B4513"},{"type":"drawPolygon","points":[{"x":240,"y":300},{"x":290,"y":280},{"x":360,"y":278},{"x":410,"y":295},{"x":400,"y":330},{"x":330,"y":345},{"x":260,"y":335}],"fillMode":"filled"}]},
{"part":"duck wing","commands":[{"type":"setForegroundColor","color":"#556B2F"},{"type":"drawPolygon","points":[{"x":300,"y":295},{"x":360,"y":288},{"x":385,"y":305},{"x":340,"y":325},{"x":300,"y":318}],"fillMode":"filled"}]},
{"part":"duck head + beak + eye","commands":[{"type":"setForegroundColor","color":"#008000"},{"type":"drawEllipse","x":395,"y":240,"width":52,"height":48,"fillMode":"filled"},{"type":"setForegroundColor","color":"#FFA500"},{"type":"drawPolygon","points":[{"x":443,"y":258},{"x":478,"y":264},{"x":443,"y":272}],"fillMode":"filled"},{"type":"setForegroundColor","color":"#000000"},{"type":"drawEllipse","x":424,"y":252,"width":8,"height":8,"fillMode":"filled"}]},
{"part":"ripples","commands":[{"type":"setForegroundColor","color":"#FFFFFF"},{"type":"drawCurve","startX":200,"startY":360,"endX":300,"endY":362,"controlX1":250,"controlY1":372},{"type":"drawCurve","startX":360,"startY":380,"endX":470,"endY":378,"controlX1":415,"controlY1":390},{"type":"drawCurve","startX":150,"startY":410,"endX":260,"endY":408,"controlX1":205,"controlY1":420}]},
{"part":"reeds","commands":[{"type":"setForegroundColor","color":"#008000"},{"type":"drawLine","x1":80,"y1":460,"x2":86,"y2":330},{"type":"drawLine","x1":100,"y1":460,"x2":98,"y2":345},{"type":"drawLine","x1":118,"y1":460,"x2":126,"y2":338},{"type":"setForegroundColor","color":"#8B4513"},{"type":"drawEllipse","x":80,"y":318,"width":12,"height":26,"fillMode":"filled"},{"type":"drawEllipse","x":120,"y":326,"width":12,"height":26,"fillMode":"filled"}]}
]
Notice: 9 parts, ~30 commands total, background covered edge-to-edge, the duck
is FOUR layered polygon/ellipse parts — not one blob — and details come last.

## Spatial coherence — parts must CONNECT (most common failure)
Parts are not independent islands: every part's coordinates must attach to the
part it belongs to. Reuse the earlier part's numbers when placing the next one.
- A hat sits ON the head: same x-center, its bottom edge touching the head's top y.
- Eyes are INSIDE the head ellipse, ~1/3 from its top, one on each side of center.
- Arms start AT the torso's upper corners; legs start AT the torso's bottom
  corners and END on the ground line.
- A rider's legs wrap the animal's body; wheels touch the ground.
Standing person template (adapt sizes): head = ellipse ~40px wide centered
x=320,y=140; torso = polygon from y=180 to y=300 directly below the head;
arms from (300,190) and (340,190); legs from (305,300) and (335,300) down to
the ground line; hat centered on x=320 touching y=120.

## Hard rules (breaking these ruins the drawing)
- NEVER write the name of the subject as text to substitute for drawing it.
  Writing "cowboy" instead of drawing a cowboy is a failure. \`placeText\` is ONLY
  for text that genuinely belongs IN the scene (a sign, a banner) — never a label.
- Be generous with commands. A recognizable subject needs 25-60 commands;
  a handful of rectangles is not a drawing. Build each part from multiple shapes.
- Make it READABLE as the subject: someone should recognize it without the prompt.

## Finishing the job (important)
Do NOT stop early with a sparse, unfinished drawing. If you would run out of
room before the picture is complete, draw as much as you can THIS turn and set
"needsAnotherTurn": true — you will be shown the current canvas and may continue.
Only set it to false when the drawing is genuinely complete.

## Response format — return ONLY this JSON object, no prose around it:
{
  "thinking": "your artistic reasoning",
  "plan": ["ordered steps, e.g. 'sky', 'ground', 'horse body', 'horse legs', 'rider', 'hat', 'details'"],
  "description": "one short sentence describing the result",
  "needsAnotherTurn": false,
  "parts": [
    {"part": "<plan step name>", "commands": [ ...paint commands... ]},
    ...
  ]
}
STRUCTURAL RULES for "parts" (these are validated):
- One entry per plan step. 6-12 parts total.
- EVERY part must contain 2-8 paint commands. A part with 0 or 1 command is
  invalid — decompose it further (e.g. "rider" -> torso polygon, arm lines,
  head ellipse, hat polygon).
- PAINT ORDER IS PARTS ORDER: parts[0] and parts[1] MUST be the background
  (sky, then ground/floor/water). The subject comes after — anything painted
  later covers what came before, so background after the subject ERASES it.
- The main subject must be 200-350px tall and sit ON the ground line, with the
  ground line in the lower third of the canvas (y ≈ 330-400).`;
}

/**
 * System prompt for a CONTINUATION turn (look-as-you-go). The agent is shown
 * the current canvas image and adds more commands without clearing.
 */
export function buildContinuePrompt(wisdom: Wisdom[]): string {
  return `You are an expert artist continuing an in-progress MS Paint drawing.

${PAINT_COMMAND_SPEC}
${renderWisdom(wisdom)}

You are shown the CURRENT canvas. Add MORE commands to push it toward the goal:
fill empty areas, add missing elements, refine details and shading. Do NOT emit
clearCanvas. Keep going until the picture is complete; set "needsAnotherTurn":
true if you still need another turn after this one.

Return ONLY this JSON object:
{
  "thinking": "what's missing and what you'll add",
  "description": "what you added",
  "needsAnotherTurn": false,
  "commands": [ ...more paint commands... ]
}`;
}

/** Build the user message for a continuation turn. */
export function buildContinueUserContent(prompt: string, pass: number): string {
  return `Goal: "${prompt}". This is continuation turn ${pass}. The image above is the canvas so far. Add what's missing.`;
}

/**
 * Vision critique — the model SEES the rendered drawing and elicits a
 * Cognitive Demands Table + Knowledge Audit grounded in what it actually looks
 * like, plus a 1-5 aesthetic score.
 */
export const CRITIQUE_VISION_SYSTEM = `You are a drawing coach. You are shown the FINISHED MS Paint drawing (image) an AI agent made for a prompt. Judge what you actually see and elicit transferable expertise.

Return ONLY this JSON object:
{
  "aestheticScore": 3.5,
  "difficultElement": "the most cognitively demanding part of this subject",
  "whyDifficult": "why it's hard in MS Paint",
  "commonErrors": "the typical mistake (point to what you see in this image)",
  "cuesAndStrategies": "the concrete technique an expert uses, specific to the command set",
  "whatWorked": ["1-3 things that actually look good"],
  "whatDidnt": ["1-3 things that look wrong/incomplete in the image"],
  "wishIKnew": "one thing that would have helped before starting",
  "doDifferently": "the single highest-leverage change next time",
  "toolsNeeded": ["paint commands most central to this subject"]
}
aestheticScore is 1.0 (awful) to 5.0 (excellent). Be honest and specific to THIS image.`;

export function buildCritiqueUserContent(prompt: string, commandCount: number): string {
  return `The drawing above was made for the prompt: "${prompt}" using ${commandCount} paint commands. Critique what you see and return the JSON.`;
}

/**
 * System prompt for the REFLECT pass — elicits a Cognitive Demands Table
 * (Militello & Hutton) + a Knowledge Audit from the agent about the drawing
 * it just produced. Output feeds the lessons store.
 */
export const REFLECTION_SYSTEM_PROMPT = `You are a drawing coach running a cognitive task analysis on an MS Paint AI agent that just finished a drawing. Elicit transferable expertise.

When the agent's own reasoning trace (its concurrent think-aloud, captured WHILE
it drew) is provided below, treat it as primary evidence: DISTILL the real
strategy, struggle, and decision points it reveals — do not invent a plausible
rationale. A concurrent trace is far more reliable than a guess reconstructed
after the fact. If no trace is provided, infer carefully from the result.

Return ONLY this JSON object:
{
  "difficultElement": "the single most cognitively demanding part of drawing this subject",
  "whyDifficult": "why that part is hard in MS Paint specifically",
  "commonErrors": "the typical mistake a novice agent makes here",
  "cuesAndStrategies": "the concrete technique/cue an expert uses to get it right (actionable, specific to the command set)",
  "whatWorked": ["1-3 things that went well in this attempt"],
  "whatDidnt": ["1-3 things that fell short"],
  "wishIKnew": "one thing that would have helped before starting",
  "doDifferently": "the single highest-leverage change for next time",
  "toolsNeeded": ["paint commands/tools most central to this subject"]
}
Be specific and reusable — another agent drawing the same category should be able to act on cuesAndStrategies and doDifferently.`;

/** Build the reflection user message from the drawing result.
 *
 * `reasoning` is the draw agent's concurrent chain-of-thought (from a reasoning
 * model's <think> trace or reasoning field). When present it anchors the
 * cognitive task analysis in what the agent actually thought, rather than a
 * post-hoc reconstruction. `thinking` is the shorter rationale the agent wrote
 * into its own JSON output.
 */
export function buildReflectionUserContent(
  prompt: string,
  category: string | null,
  description: string | null,
  commandCount: number,
  reasoning?: string | null,
  thinking?: string | null
): string {
  const trace = (reasoning || thinking || "").trim();
  // Cap the trace so a long reasoning dump can't blow the reflection budget.
  const traceBlock = trace
    ? `\n\nAgent's concurrent reasoning trace (think-aloud while drawing):\n"""\n${trace.slice(0, 6000)}\n"""`
    : "\n\n(No reasoning trace was captured for this drawing.)";

  return `Prompt: "${prompt}"
Category: ${category || "general"}
Agent's description of result: ${description || "(none)"}
Commands emitted: ${commandCount}${traceBlock}

Produce the cognitive task analysis JSON now${trace ? ", grounded in the trace above" : ""}.`;
}

/**
 * Strip the JSON-illegal noise LLMs commonly emit — `//` line comments and
 * `/* *​/` block comments — but ONLY outside string literals, so values like
 * "http://..." or "#000000" survive untouched.
 */
function stripJsonNoise(s: string): string {
  let out = "";
  let inStr = false;
  let esc = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      out += c;
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; out += c; continue; }
    if (c === "/" && s[i + 1] === "/") { while (i < s.length && s[i] !== "\n") i++; out += "\n"; continue; }
    if (c === "/" && s[i + 1] === "*") { i += 2; while (i < s.length && !(s[i] === "*" && s[i + 1] === "/")) i++; i++; continue; }
    out += c;
  }
  return out;
}

/**
 * Extract the first balanced JSON object from a model's text output, tolerating
 * the usual LLM mistakes: ```code fences```, `//` and block comments, and
 * trailing commas. Tries the raw slice first (fast path), then a repaired one.
 */
export function extractJson<T = Record<string, unknown>>(text: string): T | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  const repaired = stripJsonNoise(match[0]).replace(/,(\s*[}\]])/g, "$1");
  for (const candidate of [match[0], repaired]) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}
