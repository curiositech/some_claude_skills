'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolType, FillMode, BrushShape, ToolSize, PaintCommand, PlaybackState } from '@/lib/mspaint/types';
import { hexToRgb, rgbToHex } from '@/lib/mspaint/colors';
import { GhostCursor } from '../GhostCursor/GhostCursor';
import styles from './Canvas.module.css';

interface CanvasProps {
  width: number;
  height: number;
  selectedTool: ToolType;
  foregroundColor: string;
  backgroundColor: string;
  toolSize: ToolSize;
  brushShape: BrushShape;
  fillMode: FillMode;
  onMouseMove: (pos: { x: number; y: number } | null) => void;
  onCanvasRef: (ref: HTMLCanvasElement | null) => void;
  commands: PaintCommand[];
  playbackState: PlaybackState;
  onPlaybackStateChange: (state: PlaybackState) => void;
  onColorPick: (color: string) => void;
  onCommandExecuted?: (commandIndex: number) => void;
  onPlaybackComplete?: () => void;
  clearSignal?: number; // Increment to trigger canvas clear
  initialImage?: string; // Base64 PNG to draw before commands (for replaying on existing canvas)
}

export function Canvas({
  width,
  height,
  selectedTool,
  foregroundColor,
  backgroundColor,
  toolSize,
  brushShape,
  fillMode,
  onMouseMove,
  onCanvasRef,
  commands,
  playbackState,
  onPlaybackStateChange,
  onColorPick,
  onCommandExecuted,
  onPlaybackComplete,
  clearSignal,
  initialImage,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);

  // Curve tool state (two-stage: first click = endpoints, second click = control point)
  const [curveStart, setCurveStart] = useState<{ x: number; y: number } | null>(null);
  const [curveEnd, setCurveEnd] = useState<{ x: number; y: number } | null>(null);
  const [curvePhase, setCurvePhase] = useState<'endpoints' | 'control1' | 'control2'>('endpoints');

  // Polygon tool state (accumulate points, close on double-click or back to start)
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([]);

  // Magnifier/zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Clone tool state (source point for stamping)
  const [cloneSource, setCloneSource] = useState<{ x: number; y: number } | null>(null);
  const [isSettingCloneSource, setIsSettingCloneSource] = useState(true);

  // Gradient tool state
  const [gradientStart, setGradientStart] = useState<{ x: number; y: number } | null>(null);

  // History state (tree, not stack - preserves digressions)
  interface HistoryNode {
    id: string;
    imageData: ImageData;
    timestamp: number;
    action: string;
    parentId: string | null;
    children: string[];
  }
  const historyRef = useRef<Map<string, HistoryNode>>(new Map());
  const currentHistoryIdRef = useRef<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Ghost cursor for AI playback - use REFS to avoid re-triggering effects
  const ghostPosRef = useRef<{ x: number; y: number } | null>(null);
  const ghostToolRef = useRef<ToolType | null>(null);
  const ghostColorRef = useRef<string | null>(null);

  // State versions only for triggering UI updates (not used in playback loop)
  const [ghostPosState, setGhostPosState] = useState<{ x: number; y: number } | null>(null);

  // Refs to track current drawing colors (fixes async state closure issue)
  const currentColorRef = useRef<string | null>(null);
  const currentBgColorRef = useRef<string | null>(null);

  // Ref to prevent effect re-entry during command execution
  const isExecutingRef = useRef(false);

  // Lerping state for smooth ghost cursor movement
  const lerpFromRef = useRef<{ x: number; y: number } | null>(null);
  const lerpToRef = useRef<{ x: number; y: number } | null>(null);
  const lerpProgressRef = useRef(0);
  const isLerpingRef = useRef(false);
  const lerpAnimationRef = useRef<number | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    onCanvasRef(canvas);
  }, [width, height, onCanvasRef]);

  // Clear canvas when clearSignal changes
  useEffect(() => {
    if (clearSignal === undefined || clearSignal === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Reset color refs
    currentColorRef.current = null;
    currentBgColorRef.current = null;
  }, [clearSignal, width, height]);

  // Load initial image when provided (for replaying drawings on existing canvas state)
  useEffect(() => {
    if (!initialImage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
    img.src = initialImage.startsWith('data:') ? initialImage : `data:image/png;base64,${initialImage}`;
  }, [initialImage]);

  // Get canvas context
  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  // Get pointer position relative to canvas, mapped to the canvas's internal
  // coordinate space (the canvas is often scaled down on mobile, so screen
  // pixels != canvas pixels — without this scaling, touches land in the wrong spot).
  const getPointerPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width ? canvas.width / rect.width : 1;
    const scaleY = rect.height ? canvas.height / rect.height : 1;
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY),
    };
  }, []);

  // Drawing functions
  const drawPixel = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }, []);

  const drawBrush = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number, shape: BrushShape) => {
    ctx.fillStyle = color;
    const halfSize = Math.floor(size / 2);

    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(x - halfSize, y - halfSize, size, size);
        break;
      case 'diagonalLeft':
        for (let i = 0; i < size; i++) {
          ctx.fillRect(x - halfSize + i, y - halfSize + i, 1, 1);
        }
        break;
      case 'diagonalRight':
        for (let i = 0; i < size; i++) {
          ctx.fillRect(x + halfSize - i, y - halfSize + i, 1, 1);
        }
        break;
    }
  }, []);

  const drawLine = useCallback((ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, lineWidth: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }, []);

  const drawRectangle = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fgColor: string, bgColor: string, mode: FillMode, lineWidth: number) => {
    // MS Paint fillMode logic:
    // - 'filled': fill ONLY with foreground color (no outline)
    // - 'outline': stroke ONLY with foreground color (no fill)
    // - 'both': fill with background color, stroke with foreground color
    if (mode === 'filled') {
      ctx.fillStyle = fgColor;
      ctx.fillRect(x, y, w, h);
    } else if (mode === 'both') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(x, y, w, h);
    } else { // outline
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(x, y, w, h);
    }
  }, []);

  const drawEllipse = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fgColor: string, bgColor: string, mode: FillMode, lineWidth: number) => {
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    const radiusX = Math.abs(w / 2);
    const radiusY = Math.abs(h / 2);

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

    // MS Paint fillMode logic:
    // - 'filled': fill ONLY with foreground color (no outline)
    // - 'outline': stroke ONLY with foreground color (no fill)
    // - 'both': fill with background color, stroke with foreground color
    if (mode === 'filled') {
      ctx.fillStyle = fgColor;
      ctx.fill();
    } else if (mode === 'both') {
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    } else { // outline
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }, []);

  const floodFill = useCallback((ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const targetRgb = hexToRgb(fillColor);
    if (!targetRgb) return;

    const startIdx = (startY * width + startX) * 4;
    const startR = data[startIdx];
    const startG = data[startIdx + 1];
    const startB = data[startIdx + 2];

    // Don't fill if already the target color
    if (startR === targetRgb.r && startG === targetRgb.g && startB === targetRgb.b) return;

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const idx = (y * width + x) * 4;
      if (data[idx] !== startR || data[idx + 1] !== startG || data[idx + 2] !== startB) continue;

      visited.add(key);
      data[idx] = targetRgb.r;
      data[idx + 1] = targetRgb.g;
      data[idx + 2] = targetRgb.b;
      data[idx + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  }, [width, height]);

  const pickColor = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number): string => {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return rgbToHex(pixel[0], pixel[1], pixel[2]);
  }, []);

  const spray = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string, radius: number, particles: number) => {
    ctx.fillStyle = color;
    for (let i = 0; i < particles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const px = Math.floor(x + Math.cos(angle) * r);
      const py = Math.floor(y + Math.sin(angle) * r);
      ctx.fillRect(px, py, 1, 1);
    }
  }, []);

  // Draw Bezier curve (quadratic or cubic)
  const drawCurve = useCallback((
    ctx: CanvasRenderingContext2D,
    startX: number, startY: number,
    endX: number, endY: number,
    controlX1: number, controlY1: number,
    controlX2?: number, controlY2?: number,
    color: string = foregroundColor,
    lineWidth: number = toolSize
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    if (controlX2 !== undefined && controlY2 !== undefined) {
      // Cubic Bezier (two control points)
      ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
    } else {
      // Quadratic Bezier (one control point)
      ctx.quadraticCurveTo(controlX1, controlY1, endX, endY);
    }
    ctx.stroke();
  }, [foregroundColor, toolSize]);

  // Draw gradient fill
  const drawGradient = useCallback((
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    startColor: string,
    endColor: string,
    gradientType: 'linear' | 'radial' = 'linear'
  ) => {
    let gradient: CanvasGradient;

    if (gradientType === 'radial') {
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2;
      gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    } else {
      gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    }

    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  // Draw polygon with points
  const drawPolygon = useCallback((
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    fgColor: string,
    bgColor: string,
    mode: FillMode,
    lineWidth: number
  ) => {
    if (points.length < 3) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();

    if (mode === 'filled') {
      ctx.fillStyle = fgColor;
      ctx.fill();
    } else if (mode === 'both') {
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    } else { // outline
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }, []);

  // Draw rounded rectangle
  const drawRoundedRect = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    radius: number,
    fgColor: string,
    bgColor: string,
    mode: FillMode,
    lineWidth: number
  ) => {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);

    if (mode === 'filled') {
      ctx.fillStyle = fgColor;
      ctx.fill();
    } else if (mode === 'both') {
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    } else { // outline
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }, []);

  // Clone stamp - copy from source to destination
  const stampClone = useCallback((
    ctx: CanvasRenderingContext2D,
    sourceX: number, sourceY: number,
    destX: number, destY: number,
    size: number = 20
  ) => {
    const halfSize = size / 2;
    const imageData = ctx.getImageData(
      sourceX - halfSize, sourceY - halfSize,
      size, size
    );
    ctx.putImageData(imageData, destX - halfSize, destY - halfSize);
  }, []);

  // Generate unique ID for history nodes
  const generateHistoryId = useCallback(() => {
    return `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Save current state to history tree
  const saveHistoryState = useCallback((action: string) => {
    const ctx = getContext();
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const newId = generateHistoryId();

    const newNode: HistoryNode = {
      id: newId,
      imageData,
      timestamp: Date.now(),
      action,
      parentId: currentHistoryIdRef.current,
      children: [],
    };

    // Add as child to current node
    if (currentHistoryIdRef.current) {
      const parentNode = historyRef.current.get(currentHistoryIdRef.current);
      if (parentNode) {
        parentNode.children.push(newId);
      }
    }

    historyRef.current.set(newId, newNode);
    currentHistoryIdRef.current = newId;

    // Update undo/redo availability
    setCanUndo(newNode.parentId !== null);
    setCanRedo(false); // After a new action, no redo available on this branch
  }, [getContext, width, height, generateHistoryId]);

  // Undo - go to parent node
  const undo = useCallback(() => {
    if (!currentHistoryIdRef.current) return;

    const currentNode = historyRef.current.get(currentHistoryIdRef.current);
    if (!currentNode || !currentNode.parentId) return;

    const parentNode = historyRef.current.get(currentNode.parentId);
    if (!parentNode) return;

    const ctx = getContext();
    if (!ctx) return;

    ctx.putImageData(parentNode.imageData, 0, 0);
    currentHistoryIdRef.current = parentNode.id;

    setCanUndo(parentNode.parentId !== null);
    setCanRedo(true); // Can redo back to where we were
  }, [getContext]);

  // Redo - go to most recent child (follows first branch if multiple)
  const redo = useCallback(() => {
    if (!currentHistoryIdRef.current) return;

    const currentNode = historyRef.current.get(currentHistoryIdRef.current);
    if (!currentNode || currentNode.children.length === 0) return;

    // Find the most recent child (by timestamp)
    let latestChild: HistoryNode | null = null;
    for (const childId of currentNode.children) {
      const child = historyRef.current.get(childId);
      if (child && (!latestChild || child.timestamp > latestChild.timestamp)) {
        latestChild = child;
      }
    }

    if (!latestChild) return;

    const ctx = getContext();
    if (!ctx) return;

    ctx.putImageData(latestChild.imageData, 0, 0);
    currentHistoryIdRef.current = latestChild.id;

    setCanUndo(true);
    setCanRedo(latestChild.children.length > 0);
  }, [getContext]);

  // Initialize history with blank canvas state
  useEffect(() => {
    const ctx = getContext();
    if (!ctx) return;

    // Only initialize if history is empty
    if (historyRef.current.size === 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const rootId = generateHistoryId();
      const rootNode: HistoryNode = {
        id: rootId,
        imageData,
        timestamp: Date.now(),
        action: 'Initial canvas',
        parentId: null,
        children: [],
      };
      historyRef.current.set(rootId, rootNode);
      currentHistoryIdRef.current = rootId;
    }
  }, [getContext, width, height, generateHistoryId]);

  // Pointer event handlers (unify mouse + touch + pen)
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    // Stop the browser from treating the gesture as scroll/zoom/select on touch.
    e.preventDefault();
    // Route all subsequent move/up events for this finger to the canvas.
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not all browsers */ }

    const pos = getPointerPos(e);
    const ctx = getContext();
    if (!ctx) return;

    const isAltKey = e.altKey;

    setIsDrawing(true);
    setLastPos(pos);

    switch (selectedTool) {
      case 'pencil':
        drawPixel(ctx, pos.x, pos.y, foregroundColor);
        break;
      case 'brush':
        drawBrush(ctx, pos.x, pos.y, foregroundColor, toolSize * 2, brushShape);
        break;
      case 'eraser':
        drawBrush(ctx, pos.x, pos.y, backgroundColor, toolSize * 3, 'square');
        break;
      case 'fill':
        floodFill(ctx, pos.x, pos.y, foregroundColor);
        saveHistoryState('Fill');
        setIsDrawing(false);
        break;
      case 'colorPicker':
        const color = pickColor(ctx, pos.x, pos.y);
        onColorPick(color);
        setIsDrawing(false);
        break;
      case 'airbrush':
        spray(ctx, pos.x, pos.y, foregroundColor, 10, 10);
        break;
      case 'line':
      case 'rectangle':
      case 'ellipse':
      case 'roundedRectangle':
        setShapeStart(pos);
        break;

      // Curve tool: multi-phase click workflow
      case 'curve':
        if (curvePhase === 'endpoints') {
          setCurveStart(pos);
        } else if (curvePhase === 'control1' && curveStart && curveEnd) {
          // Draw the curve with control point
          drawCurve(ctx, curveStart.x, curveStart.y, curveEnd.x, curveEnd.y, pos.x, pos.y);
          saveHistoryState('Curve');
          // Reset for next curve
          setCurveStart(null);
          setCurveEnd(null);
          setCurvePhase('endpoints');
        }
        break;

      // Polygon tool: accumulate points
      case 'polygon':
        if (polygonPoints.length === 0) {
          setPolygonPoints([pos]);
        } else {
          // Check if clicking near first point to close
          const first = polygonPoints[0];
          const dist = Math.sqrt(Math.pow(pos.x - first.x, 2) + Math.pow(pos.y - first.y, 2));
          if (dist < 10 && polygonPoints.length >= 3) {
            // Close the polygon
            drawPolygon(ctx, polygonPoints, foregroundColor, backgroundColor, fillMode, toolSize);
            saveHistoryState('Polygon');
            setPolygonPoints([]);
          } else {
            setPolygonPoints([...polygonPoints, pos]);
          }
        }
        setIsDrawing(false);
        break;

      // Magnifier: zoom in/out
      case 'magnifier':
        if (e.button === 0) {
          // Left click: zoom in
          const newZoom = Math.min(8, zoomLevel * 2);
          setZoomLevel(newZoom);
        } else if (e.button === 2) {
          // Right click: zoom out
          const newZoom = Math.max(1, zoomLevel / 2);
          setZoomLevel(newZoom);
        }
        // Center pan on click position
        setPanOffset({
          x: pos.x - width / 2 / zoomLevel,
          y: pos.y - height / 2 / zoomLevel,
        });
        setIsDrawing(false);
        break;

      // Clone tool: alt-click sets source, normal click stamps
      case 'clone':
        if (isAltKey || isSettingCloneSource) {
          setCloneSource(pos);
          setIsSettingCloneSource(false);
        } else if (cloneSource) {
          stampClone(ctx, cloneSource.x, cloneSource.y, pos.x, pos.y, toolSize * 10);
          saveHistoryState('Clone stamp');
        }
        setIsDrawing(false);
        break;

      // Gradient tool: start point
      case 'gradient':
        setGradientStart(pos);
        break;
    }
  }, [selectedTool, foregroundColor, backgroundColor, toolSize, brushShape, fillMode, getPointerPos, getContext, drawPixel, drawBrush, floodFill, pickColor, spray, onColorPick, curvePhase, curveStart, curveEnd, drawCurve, polygonPoints, drawPolygon, zoomLevel, width, height, cloneSource, isSettingCloneSource, stampClone, saveHistoryState]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing) e.preventDefault();
    const pos = getPointerPos(e);
    onMouseMove(pos);

    if (!isDrawing) return;

    const ctx = getContext();
    if (!ctx) return;

    switch (selectedTool) {
      case 'pencil':
        if (lastPos) {
          drawLine(ctx, lastPos.x, lastPos.y, pos.x, pos.y, foregroundColor, 1);
        }
        break;
      case 'brush':
        if (lastPos) {
          // Draw line of brush strokes
          const dx = pos.x - lastPos.x;
          const dy = pos.y - lastPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const steps = Math.max(1, Math.floor(dist / 2));

          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Math.floor(lastPos.x + dx * t);
            const y = Math.floor(lastPos.y + dy * t);
            drawBrush(ctx, x, y, foregroundColor, toolSize * 2, brushShape);
          }
        }
        break;
      case 'eraser':
        if (lastPos) {
          const dx = pos.x - lastPos.x;
          const dy = pos.y - lastPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const steps = Math.max(1, Math.floor(dist / 2));

          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Math.floor(lastPos.x + dx * t);
            const y = Math.floor(lastPos.y + dy * t);
            drawBrush(ctx, x, y, backgroundColor, toolSize * 3, 'square');
          }
        }
        break;
      case 'airbrush':
        spray(ctx, pos.x, pos.y, foregroundColor, 10, 10);
        break;
    }

    setLastPos(pos);
  }, [isDrawing, selectedTool, foregroundColor, backgroundColor, toolSize, brushShape, lastPos, getPointerPos, getContext, drawLine, drawBrush, spray, onMouseMove]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    if (!isDrawing) return;

    const pos = getPointerPos(e);
    const ctx = getContext();
    if (!ctx) return;

    if (shapeStart) {
      const x = Math.min(shapeStart.x, pos.x);
      const y = Math.min(shapeStart.y, pos.y);
      const w = Math.abs(pos.x - shapeStart.x);
      const h = Math.abs(pos.y - shapeStart.y);

      switch (selectedTool) {
        case 'line':
          drawLine(ctx, shapeStart.x, shapeStart.y, pos.x, pos.y, foregroundColor, toolSize);
          saveHistoryState('Line');
          break;
        case 'rectangle':
          drawRectangle(ctx, x, y, w, h, foregroundColor, backgroundColor, fillMode, toolSize);
          saveHistoryState('Rectangle');
          break;
        case 'ellipse':
          drawEllipse(ctx, x, y, w, h, foregroundColor, backgroundColor, fillMode, toolSize);
          saveHistoryState('Ellipse');
          break;
        case 'roundedRectangle':
          drawRoundedRect(ctx, x, y, w, h, Math.min(15, w / 4, h / 4), foregroundColor, backgroundColor, fillMode, toolSize);
          saveHistoryState('Rounded Rectangle');
          break;
      }
    }

    // Handle curve tool endpoint drag
    if (selectedTool === 'curve' && curvePhase === 'endpoints' && curveStart) {
      setCurveEnd(pos);
      setCurvePhase('control1');
      // Draw preview line (will be replaced by curve)
      drawLine(ctx, curveStart.x, curveStart.y, pos.x, pos.y, foregroundColor, toolSize);
    }

    // Handle gradient tool
    if (selectedTool === 'gradient' && gradientStart) {
      drawGradient(ctx, gradientStart.x, gradientStart.y, pos.x, pos.y, foregroundColor, backgroundColor, 'linear');
      saveHistoryState('Gradient');
      setGradientStart(null);
    }

    // Save history for freehand tools
    if (selectedTool === 'pencil' || selectedTool === 'brush' || selectedTool === 'eraser' || selectedTool === 'airbrush') {
      saveHistoryState(selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1));
    }

    setIsDrawing(false);
    setLastPos(null);
    setShapeStart(null);
  }, [isDrawing, shapeStart, selectedTool, foregroundColor, backgroundColor, fillMode, toolSize, getPointerPos, getContext, drawLine, drawRectangle, drawEllipse, drawRoundedRect, curvePhase, curveStart, drawGradient, gradientStart, saveHistoryState]);

  const handlePointerLeave = useCallback(() => {
    onMouseMove(null);
    setIsDrawing(false);
    setLastPos(null);
  }, [onMouseMove]);

  // Command execution for AI playback
  const executeCommand = useCallback((cmd: PaintCommand) => {
    const ctx = getContext();
    if (!ctx) return;

    // Use refs for current colors to avoid async state closure issues
    const activeColor = currentColorRef.current || foregroundColor;
    const activeBgColor = currentBgColorRef.current || backgroundColor;

    switch (cmd.type) {
      case 'setForegroundColor':
        // Update BOTH ref (sync) and state (for UI/ghost cursor)
        currentColorRef.current = cmd.color;
        ghostColorRef.current = cmd.color;
        break;
      case 'setBackgroundColor':
        currentBgColorRef.current = cmd.color;
        break;
      case 'drawPixel':
        drawPixel(ctx, cmd.x, cmd.y, activeColor);
        ghostPosRef.current = { x: cmd.x, y: cmd.y };
        break;
      case 'drawLine':
        drawLine(ctx, cmd.x1, cmd.y1, cmd.x2, cmd.y2, activeColor, toolSize);
        ghostPosRef.current = { x: cmd.x2, y: cmd.y2 };
        break;
      case 'drawRectangle':
        drawRectangle(ctx, cmd.x, cmd.y, cmd.width, cmd.height, activeColor, activeBgColor, cmd.fillMode || 'outline', toolSize);
        ghostPosRef.current = { x: cmd.x + cmd.width, y: cmd.y + cmd.height };
        break;
      case 'drawEllipse':
        drawEllipse(ctx, cmd.x, cmd.y, cmd.width, cmd.height, activeColor, activeBgColor, cmd.fillMode || 'outline', toolSize);
        ghostPosRef.current = { x: cmd.x + cmd.width / 2, y: cmd.y + cmd.height / 2 };
        break;
      case 'floodFill':
        floodFill(ctx, cmd.x, cmd.y, activeColor);
        ghostPosRef.current = { x: cmd.x, y: cmd.y };
        break;
      case 'placeText':
        ctx.fillStyle = activeColor;
        ctx.font = `${cmd.bold ? 'bold ' : ''}${cmd.italic ? 'italic ' : ''}${cmd.fontSize || 16}px ${cmd.fontFamily || 'MS Sans Serif'}`;
        ctx.fillText(cmd.text, cmd.x, cmd.y);
        ghostPosRef.current = { x: cmd.x, y: cmd.y };
        break;
      case 'clearCanvas':
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        currentColorRef.current = null;
        currentBgColorRef.current = null;
        break;
      case 'selectTool':
        ghostToolRef.current = cmd.tool;
        break;
      case 'drawPolygon':
        // Draw polygon using the points array
        if (cmd.points && cmd.points.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(cmd.points[0].x, cmd.points[0].y);
          for (let i = 1; i < cmd.points.length; i++) {
            ctx.lineTo(cmd.points[i].x, cmd.points[i].y);
          }
          ctx.closePath();
          // MS Paint fillMode logic
          if (cmd.fillMode === 'filled') {
            ctx.fillStyle = activeColor;
            ctx.fill();
          } else if (cmd.fillMode === 'both') {
            ctx.fillStyle = activeBgColor;
            ctx.fill();
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = toolSize;
            ctx.stroke();
          } else { // outline
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = toolSize;
            ctx.stroke();
          }
          ghostPosRef.current = cmd.points[cmd.points.length - 1];
        }
        break;

      case 'drawCurve':
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = toolSize;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cmd.startX, cmd.startY);
        if (cmd.controlX2 !== undefined && cmd.controlY2 !== undefined) {
          ctx.bezierCurveTo(cmd.controlX1, cmd.controlY1, cmd.controlX2, cmd.controlY2, cmd.endX, cmd.endY);
        } else {
          ctx.quadraticCurveTo(cmd.controlX1, cmd.controlY1, cmd.endX, cmd.endY);
        }
        ctx.stroke();
        ghostPosRef.current = { x: cmd.endX, y: cmd.endY };
        break;

      case 'drawRoundedRectangle':
        const rx = Math.min(cmd.x, cmd.x + cmd.width);
        const ry = Math.min(cmd.y, cmd.y + cmd.height);
        const rw = Math.abs(cmd.width);
        const rh = Math.abs(cmd.height);
        const radius = cmd.radius || Math.min(15, rw / 4, rh / 4);
        ctx.beginPath();
        ctx.roundRect(rx, ry, rw, rh, radius);
        if (cmd.fillMode === 'filled') {
          ctx.fillStyle = activeColor;
          ctx.fill();
        } else if (cmd.fillMode === 'both') {
          ctx.fillStyle = activeBgColor;
          ctx.fill();
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = toolSize;
          ctx.stroke();
        } else {
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = toolSize;
          ctx.stroke();
        }
        ghostPosRef.current = { x: cmd.x + cmd.width, y: cmd.y + cmd.height };
        break;

      case 'drawFreehand':
        if (cmd.points && cmd.points.length > 1) {
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = toolSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(cmd.points[0].x, cmd.points[0].y);
          for (let i = 1; i < cmd.points.length; i++) {
            ctx.lineTo(cmd.points[i].x, cmd.points[i].y);
          }
          ctx.stroke();
          ghostPosRef.current = cmd.points[cmd.points.length - 1];
        }
        break;

      case 'spray':
      case 'sprayPath':
        const sprayPoints = cmd.type === 'sprayPath' ? cmd.points : [{ x: cmd.x, y: cmd.y }];
        ctx.fillStyle = activeColor;
        for (const pt of sprayPoints) {
          for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 10;
            const px = Math.floor(pt.x + Math.cos(angle) * r);
            const py = Math.floor(pt.y + Math.sin(angle) * r);
            ctx.fillRect(px, py, 1, 1);
          }
        }
        ghostPosRef.current = sprayPoints[sprayPoints.length - 1];
        break;

      case 'erase':
      case 'erasePath':
        ctx.fillStyle = activeBgColor || '#FFFFFF';
        const erasePoints = cmd.type === 'erasePath' ? cmd.points : [{ x: cmd.x, y: cmd.y }];
        const eraseSize = toolSize * 3;
        for (const pt of erasePoints) {
          ctx.fillRect(pt.x - eraseSize / 2, pt.y - eraseSize / 2, eraseSize, eraseSize);
        }
        ghostPosRef.current = erasePoints[erasePoints.length - 1];
        break;

      case 'gradientFill':
        let gradient: CanvasGradient;
        if (cmd.gradientType === 'radial') {
          const centerX = (cmd.x1 + cmd.x2) / 2;
          const centerY = (cmd.y1 + cmd.y2) / 2;
          const gradRadius = Math.sqrt(Math.pow(cmd.x2 - cmd.x1, 2) + Math.pow(cmd.y2 - cmd.y1, 2)) / 2;
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, gradRadius);
        } else {
          gradient = ctx.createLinearGradient(cmd.x1, cmd.y1, cmd.x2, cmd.y2);
        }
        gradient.addColorStop(0, cmd.startColor);
        gradient.addColorStop(1, cmd.endColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ghostPosRef.current = { x: cmd.x2, y: cmd.y2 };
        break;

      case 'setCloneSource':
        setCloneSource({ x: cmd.x, y: cmd.y });
        ghostPosRef.current = { x: cmd.x, y: cmd.y };
        break;

      case 'stamp':
        if (cloneSource) {
          const stampSize = toolSize * 10;
          const halfStamp = stampSize / 2;
          const sourceData = ctx.getImageData(
            cloneSource.x - halfStamp, cloneSource.y - halfStamp,
            stampSize, stampSize
          );
          ctx.putImageData(sourceData, cmd.x - halfStamp, cmd.y - halfStamp);
        }
        ghostPosRef.current = { x: cmd.x, y: cmd.y };
        break;

      case 'setZoom':
        setZoomLevel(cmd.level);
        if (cmd.centerX !== undefined && cmd.centerY !== undefined) {
          setPanOffset({
            x: cmd.centerX - width / 2 / cmd.level,
            y: cmd.centerY - height / 2 / cmd.level,
          });
        }
        break;

      case 'undo':
        undo();
        break;

      case 'redo':
        redo();
        break;

      case 'wait':
        // No-op for execution, timing handled by playback loop
        break;

      case 'setToolSize':
        // Tool size is managed externally
        break;

      case 'setBrushShape':
        // Brush shape is managed externally
        break;

      case 'setFillMode':
        // Fill mode is managed externally
        break;

      case 'setSprayDensity':
        // Spray density is managed externally
        break;
    }
  }, [getContext, foregroundColor, backgroundColor, toolSize, width, height, drawPixel, drawLine, drawRectangle, drawEllipse, floodFill, cloneSource, undo, redo]);

  // Get target position from a command (for lerping)
  const getCommandTargetPosition = useCallback((cmd: PaintCommand): { x: number; y: number } | null => {
    switch (cmd.type) {
      case 'drawPixel':
        return { x: cmd.x, y: cmd.y };
      case 'drawLine':
        return { x: cmd.x2, y: cmd.y2 };
      case 'drawRectangle':
      case 'drawEllipse':
      case 'drawRoundedRectangle':
        return { x: cmd.x + cmd.width, y: cmd.y + cmd.height };
      case 'floodFill':
        return { x: cmd.x, y: cmd.y };
      case 'placeText':
        return { x: cmd.x, y: cmd.y };
      case 'spray':
        return { x: cmd.x, y: cmd.y };
      case 'erase':
        return { x: cmd.x, y: cmd.y };
      case 'drawPolygon':
        if (cmd.points && cmd.points.length > 0) {
          return cmd.points[0]; // Start at first point
        }
        return null;
      case 'drawCurve':
        return { x: cmd.endX, y: cmd.endY };
      default:
        return null;
    }
  }, []);

  // Lerp between two points
  const lerpPosition = useCallback((from: { x: number; y: number }, to: { x: number; y: number }, t: number) => {
    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    };
  }, []);

  // Reset all refs when playback restarts from beginning
  useEffect(() => {
    if (playbackState.currentCommandIndex === 0 && playbackState.isPlaying) {
      currentColorRef.current = null;
      currentBgColorRef.current = null;
      ghostPosRef.current = null;
      ghostColorRef.current = null;
      ghostToolRef.current = null;
      isExecutingRef.current = false;
      lerpFromRef.current = null;
      lerpToRef.current = null;
      lerpProgressRef.current = 0;
      isLerpingRef.current = false;
      if (lerpAnimationRef.current) {
        cancelAnimationFrame(lerpAnimationRef.current);
        lerpAnimationRef.current = null;
      }
    }
  }, [playbackState.currentCommandIndex, playbackState.isPlaying]);

  // Playback effect with lerping - smooth ghost cursor animation between commands
  useEffect(() => {
    // Guard: don't run if already executing or lerping
    if (isExecutingRef.current || isLerpingRef.current) return;
    if (!playbackState.isPlaying || playbackState.isPaused) return;

    if (playbackState.currentCommandIndex >= commands.length) {
      // Playback complete
      ghostPosRef.current = null;
      ghostColorRef.current = null;
      ghostToolRef.current = null;
      setGhostPosState(null);
      onPlaybackStateChange({ ...playbackState, isPlaying: false });
      // Notify parent that playback finished
      if (onPlaybackComplete) {
        onPlaybackComplete();
      }
      return;
    }

    const cmdIndex = playbackState.currentCommandIndex;
    const cmd = commands[cmdIndex];
    const targetPos = getCommandTargetPosition(cmd);
    const currentPos = ghostPosRef.current;

    // Lerp duration based on speed (150-300ms for smooth animation)
    const lerpDurationMs = 200 / playbackState.speed;
    const lerpFrames = Math.max(5, Math.floor(lerpDurationMs / 16)); // ~60fps

    // If we have both positions and they're different, animate the cursor
    if (targetPos && currentPos) {
      const distance = Math.sqrt(
        Math.pow(targetPos.x - currentPos.x, 2) + Math.pow(targetPos.y - currentPos.y, 2)
      );

      // Only lerp if there's meaningful distance to cover
      if (distance > 5) {
        isLerpingRef.current = true;
        lerpFromRef.current = { ...currentPos };
        lerpToRef.current = { ...targetPos };
        lerpProgressRef.current = 0;

        let frame = 0;
        const animateLerp = () => {
          frame++;
          const t = Math.min(1, frame / lerpFrames);
          // Ease out cubic for smooth deceleration
          const easedT = 1 - Math.pow(1 - t, 3);

          const interpolatedPos = lerpPosition(lerpFromRef.current!, lerpToRef.current!, easedT);
          ghostPosRef.current = interpolatedPos;

          // Update ghost cursor position during lerp
          onPlaybackStateChange({
            ...playbackState,
            ghostCursorPosition: interpolatedPos,
            ghostCursorTool: ghostToolRef.current,
            ghostCursorColor: ghostColorRef.current,
            isLerping: true,
            lerpProgress: easedT,
          });

          if (t < 1) {
            lerpAnimationRef.current = requestAnimationFrame(animateLerp);
          } else {
            // Lerp complete - now execute the command
            isLerpingRef.current = false;
            isExecutingRef.current = true;

            executeCommand(cmd);
            if (onCommandExecuted) {
              onCommandExecuted(cmdIndex);
            }

            onPlaybackStateChange({
              ...playbackState,
              currentCommandIndex: cmdIndex + 1,
              ghostCursorPosition: ghostPosRef.current,
              ghostCursorTool: ghostToolRef.current,
              ghostCursorColor: ghostColorRef.current,
              isLerping: false,
            });

            isExecutingRef.current = false;
          }
        };

        lerpAnimationRef.current = requestAnimationFrame(animateLerp);
        return;
      }
    }

    // No lerp needed - execute immediately with a short delay
    const delay = 80 / playbackState.speed;
    const timeout = setTimeout(() => {
      isExecutingRef.current = true;

      executeCommand(cmd);
      if (onCommandExecuted) {
        onCommandExecuted(cmdIndex);
      }

      onPlaybackStateChange({
        ...playbackState,
        currentCommandIndex: cmdIndex + 1,
        ghostCursorPosition: ghostPosRef.current,
        ghostCursorTool: ghostToolRef.current,
        ghostCursorColor: ghostColorRef.current,
      });

      isExecutingRef.current = false;
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (lerpAnimationRef.current) {
        cancelAnimationFrame(lerpAnimationRef.current);
      }
      isExecutingRef.current = false;
      isLerpingRef.current = false;
    };
  }, [
    playbackState.isPlaying,
    playbackState.isPaused,
    playbackState.currentCommandIndex,
    playbackState.speed,
    commands,
    executeCommand,
    onPlaybackStateChange,
    onCommandExecuted,
    onPlaybackComplete,
    getCommandTargetPosition,
    lerpPosition,
  ]);

  return (
    <div className={styles.canvasWrapper}>
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={styles.canvas}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onContextMenu={(e) => e.preventDefault()}
        />
        {playbackState.ghostCursorPosition && playbackState.isPlaying && (
          <GhostCursor
            x={playbackState.ghostCursorPosition.x}
            y={playbackState.ghostCursorPosition.y}
            tool={playbackState.ghostCursorTool || selectedTool}
            color={playbackState.ghostCursorColor || foregroundColor}
          />
        )}
      </div>
    </div>
  );
}
