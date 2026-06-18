"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Settings } from "lucide-react";
import { ToolPalette } from "@/components/mspaint/ToolPalette/ToolPalette";
import { ColorPalette } from "@/components/mspaint/ColorPalette/ColorPalette";
import { Canvas } from "@/components/mspaint/Canvas/Canvas";
import { MenuBar } from "@/components/mspaint/MenuBar/MenuBar";
import { StatusBar } from "@/components/mspaint/StatusBar/StatusBar";
import { PromptInput } from "@/components/mspaint/PromptInput/PromptInput";
import { PlaybackControls } from "@/components/mspaint/PlaybackControls/PlaybackControls";
import { CommandLog } from "@/components/mspaint/CommandLog/CommandLog";
import { ReferencePanel, type ReferenceImageData } from "@/components/mspaint/ReferencePanel";
import { openSettingsWindow } from "@/lib/windowHelpers";
import { LS_KEY_ANTHROPIC, LS_KEY_MODEL, type MsPaintModel } from "@/components/desktop/SettingsWindow";
import { cn } from "@/lib/utils";
import type {
  ToolType, FillMode, BrushShape, ToolSize, PaintCommand, PlaybackState,
} from "@/lib/mspaint/types";
import { DEFAULT_FOREGROUND, DEFAULT_BACKGROUND } from "@/lib/mspaint/colors";

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * MSPaintAppContent
 *
 * Full ms_paint_skill UI rendered as a component (no route-level Window wrapper).
 * Reflection / aesthetic scoring stripped — those require disk-based routes
 * not available on Cloudflare Pages.
 */
export function MSPaintAppContent() {
  const [selectedTool, setSelectedTool] = useState<ToolType>("pencil");
  const [foregroundColor, setForegroundColor] = useState(DEFAULT_FOREGROUND);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND);
  const [toolSize, setToolSize] = useState<ToolSize>(1);
  const [brushShape, setBrushShape] = useState<BrushShape>("circle");
  const [fillMode, setFillMode] = useState<FillMode>("outline");
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const [commands, setCommands] = useState<PaintCommand[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false, isPaused: false,
    currentCommandIndex: 0, totalCommands: 0, speed: 1,
    ghostCursorPosition: null, ghostCursorTool: null, ghostCursorColor: null,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [aiThinking, setAiThinking] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [commandThumbnails, setCommandThumbnails] = useState<Map<number, string>>(new Map());
  const [referenceImages, setReferenceImages] = useState<ReferenceImageData[]>([]);
  const [recommendedTools, setRecommendedTools] = useState<string[]>([]);
  const [promptClassification, setPromptClassification] = useState<{
    category: string; subcategories: string[];
  } | null>(null);
  const [clearSignal, setClearSignal] = useState(0);
  const [sessionId, setSessionId] = useState(generateSessionId);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Free-tier quota (Cloudflare-powered drawings before a key is required)
  const [usesRemaining, setUsesRemaining] = useState<number | null>(null);
  const [usesLimit, setUsesLimit] = useState<number>(5);
  const [unlimited, setUnlimited] = useState(false);

  const currentPromptRef = useRef<string>("");
  const currentGenerationIdRef = useRef<string | null>(null);
  // Iterative "look as you go" + vision critique (admin-controlled flags)
  const needsAnotherTurnRef = useRef(false);
  const canDrawRef = useRef(false);
  const categoryRef = useRef<string>("general");
  const passRef = useRef(0);
  const cumulativeCmdRef = useRef(0);
  const flagsRef = useRef<{ references: boolean; critique: boolean; iterative: boolean; maxTurns: number }>({
    references: false, critique: false, iterative: false, maxTurns: 1,
  });

  // Fetch the current free-tier quota on mount (cookie set by the server)
  useEffect(() => {
    fetch("/api/mspaint/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setUsesRemaining(d.usesRemaining ?? null);
        if (typeof d.usesLimit === "number") setUsesLimit(d.usesLimit);
      })
      .catch(() => {});
  }, []);

  // Sync API key status from localStorage (re-check when window gains focus)
  useEffect(() => {
    const check = () => setHasApiKey(!!localStorage.getItem(LS_KEY_ANTHROPIC));
    check();
    window.addEventListener("focus", check);
    return () => window.removeEventListener("focus", check);
  }, []);

  const handleCommandExecuted = useCallback((commandIndex: number) => {
    if (!canvasRef) return;
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = 40; thumbCanvas.height = 30;
    const thumbCtx = thumbCanvas.getContext("2d");
    if (thumbCtx) {
      thumbCtx.drawImage(canvasRef, 0, 0, 40, 30);
      const thumbnail = thumbCanvas.toDataURL("image/png", 0.5);
      setCommandThumbnails(prev => new Map(prev).set(commandIndex, thumbnail));
    }
  }, [canvasRef]);

  const handlePromptSubmit = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    setReferenceImages([]);
    setRecommendedTools([]);
    setPromptClassification(null);
    setSessionId(generateSessionId());
    currentPromptRef.current = prompt;

    try {
      const canvasSnapshot = canvasRef?.toDataURL("image/png");
      const userApiKey = localStorage.getItem(LS_KEY_ANTHROPIC) || undefined;
      const userModel   = (localStorage.getItem(LS_KEY_MODEL) as MsPaintModel | null) || undefined;
      const response = await fetch("/api/mspaint/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, canvasSnapshot, apiKey: userApiKey, model: userModel }),
      });

      const data = await response.json();
      if (!response.ok) {
        // Quota exhausted — reflect it in the UI before surfacing the message.
        if (data.quotaExceeded) {
          setUsesRemaining(0);
          setUnlimited(false);
        }
        throw new Error(data.error || `Generate failed: ${response.statusText}`);
      }

      // Track quota + which generation this is (for the output snapshot upload).
      currentGenerationIdRef.current = data.generationId || null;
      needsAnotherTurnRef.current = !!data.needsAnotherTurn;
      canDrawRef.current = !!data.canDraw;
      categoryRef.current = data.category || "general";
      passRef.current = 0;
      cumulativeCmdRef.current = Array.isArray(data.commands) ? data.commands.length : 0;
      if (data.flags) flagsRef.current = data.flags;
      setUnlimited(!!data.unlimited);
      if (!data.unlimited && typeof data.usesRemaining === "number") {
        setUsesRemaining(data.usesRemaining);
      }

      setAiThinking(data.thinking || null);
      setAiDescription(data.description || null);
      setCommandThumbnails(new Map());
      setCommands(data.commands);
      setReferenceImages(data.referenceImages || []);
      setRecommendedTools(data.recommendedTools || []);
      setPromptClassification(data.classification || null);
      setPlaybackState(prev => ({
        ...prev,
        totalCommands: data.commands.length,
        currentCommandIndex: 0,
        isPlaying: true, isPaused: false,
      }));
    } catch (error) {
      console.error("[MSPaint] Generate error:", error);
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(`MS Paint: ${msg}\n\nIf you need an API key, open Settings from the Skills menu.`);
    } finally {
      setIsGenerating(false);
    }
  }, [canvasRef]);

  // When playback finishes: optionally let the agent take another turn
  // (look-as-you-go), then upload the final render and (optionally) critique it.
  const handlePlaybackComplete = useCallback(async () => {
    const genId = currentGenerationIdRef.current;
    if (!genId || !canvasRef) return;
    const image = canvasRef.toDataURL("image/png");
    const flags = flagsRef.current;

    // 1. Agent-requested continuation ("I want another turn to keep drawing").
    if (
      flags.iterative && canDrawRef.current && needsAnotherTurnRef.current &&
      passRef.current < flags.maxTurns - 1
    ) {
      passRef.current += 1;
      try {
        const r = await fetch("/api/mspaint/continue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generationId: genId,
            prompt: currentPromptRef.current,
            category: categoryRef.current,
            pass: passRef.current,
            currentImage: image,
          }),
        });
        const d = await r.json();
        if (d.ok && Array.isArray(d.commands) && d.commands.length) {
          needsAnotherTurnRef.current = !!d.needsAnotherTurn;
          cumulativeCmdRef.current += d.commands.length;
          // Replay the new commands on top of the existing canvas (no clear).
          setCommands(d.commands);
          setPlaybackState((p) => ({
            ...p, totalCommands: d.commands.length, currentCommandIndex: 0,
            isPlaying: true, isPaused: false,
          }));
          return; // loop: this handler fires again when the new pass finishes
        }
      } catch {
        /* fall through to finalize */
      }
    }

    // 2. Finalize: store the rendered output.
    fetch("/api/mspaint/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generationId: genId, image }),
    }).catch(() => {});

    // 3. Optional vision critique of the finished drawing.
    if (flags.critique) {
      fetch("/api/mspaint/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: genId,
          prompt: currentPromptRef.current,
          category: categoryRef.current,
          image,
          commandCount: cumulativeCmdRef.current,
          passCount: passRef.current + 1,
        }),
      }).catch(() => {});
    }
  }, [canvasRef]);

  const handlePlay    = useCallback(() => setPlaybackState(p => ({ ...p, isPlaying: true,  isPaused: false })), []);
  const handlePause   = useCallback(() => setPlaybackState(p => ({ ...p, isPaused: true })), []);
  const handleRestart = useCallback(() => setPlaybackState(p => ({ ...p, currentCommandIndex: 0, isPlaying: true, isPaused: false })), []);
  const handleSkip    = useCallback(() => setPlaybackState(p => ({ ...p, currentCommandIndex: p.totalCommands, isPlaying: false, isPaused: false })), []);
  const handleSpeedChange = useCallback((speed: number) => setPlaybackState(p => ({ ...p, speed })), []);

  const handleSave = useCallback(() => {
    const url = canvasRef?.toDataURL("image/png");
    if (!url) return;
    const a = document.createElement("a");
    a.href = url; a.download = `mspaint-${sessionId}.png`; a.click();
  }, [canvasRef, sessionId]);

  const handleClearCanvas = useCallback(() => {
    setClearSignal(prev => prev + 1);
    setCommands([]);
    setAiThinking(null); setAiDescription(null);
    setCommandThumbnails(new Map());
    setReferenceImages([]); setRecommendedTools([]);
    setPromptClassification(null);
    setSessionId(generateSessionId());
    setPlaybackState({
      isPlaying: false, isPaused: false,
      currentCommandIndex: 0, totalCommands: 0, speed: 1,
      ghostCursorPosition: null, ghostCursorTool: null, ghostCursorColor: null,
    });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Prompt Input */}
      <PromptInput
        onSubmit={handlePromptSubmit}
        isLoading={isGenerating}
        disabled={playbackState.isPlaying && !playbackState.isPaused}
        usesRemaining={usesRemaining}
        usesLimit={usesLimit}
        unlimited={unlimited || hasApiKey}
      />

      {/* API Key status bar */}
      <div className={cn(
        "flex items-center gap-2 px-2 py-1 shrink-0",
        "border-b border-b-[var(--color-border-raised-dark)]",
        "bg-[var(--color-surface)]"
      )}>
        <span className={cn(
          "text-[9px] font-[family-name:var(--font-system)] font-bold",
          "text-[var(--color-success)]"
        )}>
          {hasApiKey
            ? "API key set — unlimited drawing"
            : usesRemaining === 0
              ? "Free drawings used up — add a key in Settings for unlimited"
              : "Free AI drawing (Cloudflare) — no key needed"}
        </span>
        <button
          onClick={() => { openSettingsWindow(); setHasApiKey(!!localStorage.getItem(LS_KEY_ANTHROPIC)); }}
          className={cn(
            "ml-auto flex items-center gap-1 px-2 py-0.5",
            "text-[9px] font-[family-name:var(--font-system)] cursor-pointer",
            "bg-[var(--color-surface-raised)]",
            "border border-t-[var(--color-border-raised-light)] border-l-[var(--color-border-raised-light)]",
            "border-b-[var(--color-border-raised-dark)] border-r-[var(--color-border-raised-dark)]"
          )}
        >
          <Settings size={10} />
          Settings
        </button>
      </div>

      {/* Playback Controls */}
      {commands.length > 0 && (
        <PlaybackControls
          playbackState={playbackState}
          onPlay={handlePlay}
          onPause={handlePause}
          onRestart={handleRestart}
          onSkip={handleSkip}
          onSpeedChange={handleSpeedChange}
        />
      )}

      {/* Main area: Paint window + Command Log */}
      <div style={{ display: "flex", flex: 1, gap: 8, overflow: "hidden", padding: "4px 8px 8px" }}>
        {/* Paint window */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>
          <ReferencePanel referenceImages={referenceImages} />
          <MenuBar />
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <ToolPalette
              selectedTool={selectedTool}
              onToolSelect={setSelectedTool}
              toolSize={toolSize}
              onToolSizeChange={setToolSize}
              brushShape={brushShape}
              onBrushShapeChange={setBrushShape}
              fillMode={fillMode}
              onFillModeChange={setFillMode}
              recommendedTools={recommendedTools}
              promptClassification={promptClassification}
            />
            <Canvas
              width={640}
              height={480}
              selectedTool={selectedTool}
              foregroundColor={foregroundColor}
              backgroundColor={backgroundColor}
              toolSize={toolSize}
              brushShape={brushShape}
              fillMode={fillMode}
              onMouseMove={setMousePos}
              onCanvasRef={setCanvasRef}
              commands={commands}
              playbackState={playbackState}
              onPlaybackStateChange={setPlaybackState}
              onColorPick={(color) => setForegroundColor(color)}
              onCommandExecuted={handleCommandExecuted}
              onPlaybackComplete={handlePlaybackComplete}
              clearSignal={clearSignal}
            />
          </div>
          <ColorPalette
            foregroundColor={foregroundColor}
            backgroundColor={backgroundColor}
            onForegroundChange={setForegroundColor}
            onBackgroundChange={setBackgroundColor}
          />
          <StatusBar mousePos={mousePos} selectedTool={selectedTool} playbackState={playbackState} />
        </div>

        {/* Command Log */}
        {commands.length > 0 && (
          <CommandLog
            thinking={aiThinking}
            description={aiDescription}
            commands={commands}
            currentCommandIndex={playbackState.currentCommandIndex}
            commandThumbnails={commandThumbnails}
          />
        )}
      </div>
    </div>
  );
}
