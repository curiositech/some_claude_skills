declare module 'butterchurn' {
  interface VisualizerOptions {
    width: number;
    height: number;
    pixelRatio?: number;
    textureRatio?: number;
  }

  interface Visualizer {
    connectAudio(audioNode: AudioNode): void;
    loadPreset(preset: unknown, transitionTime: number): void;
    render(): void;
    setRendererSize(width: number, height: number, options?: { pixelRatio?: number }): void;
  }

  function createVisualizer(
    audioContext: AudioContext,
    canvas: HTMLCanvasElement,
    options: VisualizerOptions
  ): Visualizer;

  export { createVisualizer };
  export default { createVisualizer };
}

declare module 'butterchurn-presets' {
  function getPresets(): Record<string, unknown>;
  export { getPresets };
  export default { getPresets };
}
