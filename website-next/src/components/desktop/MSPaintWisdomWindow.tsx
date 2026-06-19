"use client";

import { Win31Panel, Win31GroupBox, Win31StatusBar, StatusBarSection } from "@/components/win31";
import {
  Eye, BookOpen, ListOrdered, Brush, NotebookPen,
  ArrowRight, Sparkles, Lightbulb, AlertTriangle,
} from "lucide-react";
import { openMSPaintWindow } from "@/lib/windowHelpers";

/**
 * MSPaintWisdomWindow
 *
 * Public explainer for the MS Paint expertise-accrual loop: every free drawing
 * runs a small Cognitive Task Analysis (ACTA / Critical Decision Method /
 * ShadowBox) and deposits a reusable lesson that the next agent reads first.
 * Content mirrors the real pipeline in functions/_lib/cta.ts + db.ts.
 */

const STEPS = [
  {
    icon: Eye, accent: "#000080", tag: "1 · Assess",
    title: "Situation assessment",
    body: "A fast classifier (≈256 tokens) reads the prompt and decides what kind of subject this is and which paint commands matter — the same first move an expert makes before touching the canvas.",
  },
  {
    icon: BookOpen, accent: "#7c3aed", tag: "2 · Recall",
    title: "Lessons from artists past",
    body: "The agent pulls the highest-rated lessons stored by prior agents who drew this category and injects them into its own brief — ShadowBox: learn from the recorded decisions of experts before you.",
  },
  {
    icon: ListOrdered, accent: "#0891b2", tag: "3 · Plan",
    title: "Mental simulation",
    body: "Before any command, the agent must commit to an explicit ordered plan ('sky gradient → house mass → shaded side → sun'). Planning is forced, not optional.",
  },
  {
    icon: Brush, accent: "#059669", tag: "4 · Draw",
    title: "Emit the commands",
    body: "It blocks in big shapes first, then mid-tones, then details — and may take another look-as-you-go turn rather than stop early on a sparse picture. Vision models can even study reference photos first.",
  },
  {
    icon: NotebookPen, accent: "#d97706", tag: "5 · Reflect",
    title: "Knowledge elicitation",
    body: "Afterward a coaching pass runs a Cognitive Demands Table + Knowledge Audit on the result and writes a lesson — the hard part, the cue that works, the one thing to do differently. That lesson becomes step 2 for the next agent.",
  },
];

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="text-xs font-bold uppercase tracking-[0.12em]"
      style={{ color }}
    >
      {children}
    </span>
  );
}

export function MSPaintWisdomWindow() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div
          className="px-5 py-5 shrink-0"
          style={{ background: "linear-gradient(135deg, #000080 0%, #4a0080 45%, #008080 100%)" }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={16} className="text-[#FFD700]" />
            <Eyebrow color="#FFD700">Expertise accrual</Eyebrow>
          </div>
          <h1 className="text-white font-[family-name:var(--font-window)] text-2xl font-bold leading-tight">
            How MS Paint Gets Smarter
          </h1>
          <p className="text-white/85 font-[family-name:var(--font-system)] text-base mt-2 max-w-[52ch]">
            Every free drawing is also a lesson. The agent runs a small cognitive
            task analysis, then leaves a note for the next agent — so the gallery
            literally draws better over time, with no model retraining.
          </p>
        </div>

        <div className="p-4 space-y-5 font-[family-name:var(--font-system)]">
          {/* The flywheel */}
          <section>
            <Eyebrow color="#000080">The accrual flywheel</Eyebrow>
            <p className="text-sm text-black/70 mt-1 mb-3 max-w-[60ch]">
              Five steps, drawn from{" "}
              <strong>Applied Cognitive Task Analysis (ACTA)</strong>, the{" "}
              <strong>Critical Decision Method</strong>, and{" "}
              <strong>ShadowBox</strong>. Step 5 feeds step 2 of the next run.
            </p>

            <ol className="space-y-2.5">
              {STEPS.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.tag}>
                    <Win31Panel variant="raised" className="p-2">
                      <div className="flex gap-3">
                        <div
                          className="w-9 h-9 shrink-0 flex items-center justify-center border-2"
                          style={{ background: s.accent, borderColor: "rgba(0,0,0,0.25)" }}
                        >
                          <Icon size={18} className="text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <Eyebrow color={s.accent}>{s.tag}</Eyebrow>
                            <span className="text-base font-bold text-black">{s.title}</span>
                          </div>
                          <p className="text-sm text-black/80 mt-0.5 leading-snug">{s.body}</p>
                        </div>
                      </div>
                    </Win31Panel>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Worked example: before -> lesson -> after */}
          <section>
            <Eyebrow color="#059669">A worked example</Eyebrow>
            <p className="text-sm text-black/70 mt-1 mb-3 max-w-[60ch]">
              Two visitors, minutes apart, both type{" "}
              <code className="bg-black/10 px-1 rounded-sm">a red house with a sun</code>.
              Here is what the second agent inherits from the first.
            </p>

            <div className="grid gap-2.5 md:grid-cols-3">
              {/* Before */}
              <Win31GroupBox label="Agent #1 — draws blind">
                <div className="p-1">
                  <p className="text-sm text-black/80 leading-snug">
                    Blocks in a flat red square, a triangle roof, a yellow circle
                    sun. It reads as a child&apos;s drawing: the house floats and
                    looks 2-D.
                  </p>
                  <p className="text-xs text-black/55 mt-2">
                    Aesthetic score: <strong>2.5 / 5</strong>
                  </p>
                </div>
              </Win31GroupBox>

              {/* Lesson elicited */}
              <Win31GroupBox label="Lesson elicited (stored in D1)">
                <div className="p-1 space-y-1.5">
                  <p className="text-sm">
                    <Lightbulb size={13} className="inline mr-1 text-[#d97706]" />
                    <strong>Hard part:</strong> making the house read as solid, not
                    flat.
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-[#059669]">What works:</span>{" "}
                    shade one wall a darker red with a filled polygon to imply a
                    light direction.
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-[#000080]">Do differently:</span>{" "}
                    add a ground line so the house isn&apos;t floating.
                  </p>
                </div>
              </Win31GroupBox>

              {/* After */}
              <Win31GroupBox label="Agent #2 — reads the lesson first">
                <div className="p-1">
                  <p className="text-sm text-black/80 leading-snug">
                    Draws the front wall, then a darker side wall as a polygon, a
                    ground line under it, and offsets the sun. The house now sits
                    in a scene and has volume.
                  </p>
                  <p className="text-xs text-black/55 mt-2">
                    Aesthetic score: <strong>3.8 / 5</strong>
                  </p>
                </div>
              </Win31GroupBox>
            </div>

            {/* The actual injected briefing */}
            <div className="mt-3">
              <Eyebrow color="#000080">What agent #2 actually sees</Eyebrow>
              <pre
                className="mt-1.5 p-3 text-sm leading-relaxed overflow-x-auto text-[#00FF00] bg-black border-2"
                style={{ borderColor: "#000", fontFamily: "var(--font-code, monospace)" }}
              >{`## Lessons from artists past (apply these)
Prior agents drawing similar subjects learned:
1. hard part: making the house read as solid, not flat
   — what works: shade one wall a darker red (filled polygon)
   — do differently: add a ground line so it isn't floating`}</pre>
            </div>
          </section>

          {/* Why this is honest about its limits — ties to reasoning models */}
          <section>
            <Eyebrow color="#d97706">Under the hood: thinking budgets</Eyebrow>
            <div className="mt-1.5 border-l-4 pl-3 py-1" style={{ borderColor: "#d97706" }}>
              <p className="text-sm text-black/80 leading-snug max-w-[62ch]">
                <AlertTriangle size={13} className="inline mr-1 text-[#d97706]" />
                Each draw call has a token budget that holds{" "}
                <em>both</em> the agent&apos;s reasoning and the full command list.
                Plain instruct models spend it all on commands and draw reliably.
                A <strong>reasoning</strong> model spends much of the budget
                thinking out loud first — which is exactly the concurrent
                think-aloud trace that cognitive task analysis prizes. Capturing
                that trace as primary evidence (instead of asking the model to
                reconstruct it afterward) is the next upgrade to this flywheel.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="pt-1">
            <button
              onClick={openMSPaintWindow}
              className="inline-flex items-center gap-2 px-4 py-2 text-base font-bold text-white border-2 cursor-pointer"
              style={{ background: "#000080", borderColor: "#fff #000 #000 #fff" }}
            >
              <Brush size={16} />
              Open MS Paint and add a lesson
              <ArrowRight size={16} />
            </button>
            <p className="text-sm text-black/60 mt-2 max-w-[60ch]">
              Five free drawings, no API key. Each one teaches the next agent.
            </p>
          </section>
        </div>
      </div>

      <Win31StatusBar>
        <StatusBarSection>Assess → Recall → Plan → Draw → Reflect</StatusBarSection>
        <StatusBarSection>ACTA · CDM · ShadowBox</StatusBarSection>
      </Win31StatusBar>
    </div>
  );
}
