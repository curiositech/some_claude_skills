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
1. Block in big shapes and background first, then mid-tones, then details last.
2. Pick a small, deliberate colour set from the palette.
3. Use filled shapes for masses; use lines/curves for contours; use spray for texture/shading.
4. Keep everything inside the 640x480 canvas.

## Finishing the job (important)
Do NOT stop early with a sparse, unfinished drawing. If you would run out of
room before the picture is complete, draw as much as you can THIS turn and set
"needsAnotherTurn": true — you will be shown the current canvas and may continue.
Only set it to false when the drawing is genuinely complete.

## Response format — return ONLY this JSON object, no prose around it:
{
  "thinking": "your artistic reasoning",
  "plan": ["ordered steps you will take, e.g. 'sky gradient', 'mountain silhouette', 'sun'"],
  "description": "one short sentence describing the result",
  "needsAnotherTurn": false,
  "commands": [ ...paint commands... ]
}`;
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

/** Build the reflection user message from the drawing result. */
export function buildReflectionUserContent(
  prompt: string,
  category: string | null,
  description: string | null,
  commandCount: number
): string {
  return `Prompt: "${prompt}"
Category: ${category || "general"}
Agent's description of result: ${description || "(none)"}
Commands emitted: ${commandCount}

Produce the cognitive task analysis JSON now.`;
}

/** Extract the first balanced JSON object from a model's text output. */
export function extractJson<T = Record<string, unknown>>(text: string): T | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}
