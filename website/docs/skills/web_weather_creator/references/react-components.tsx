/**
 * WEB WEATHER CREATOR - React Component Library
 *
 * Ready-to-use React components for atmospheric effects.
 * Copy these into your project and customize.
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';

// ============================================
// SVG FILTERS (include once in your app)
// ============================================

export function WeatherFilters() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      style={{ position: 'absolute', pointerEvents: 'none' }}
    >
      <defs>
        {/* Cumulus clouds */}
        <filter id="cloud-cumulus" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="4" seed="1" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
          <feGaussianBlur in="displaced" stdDeviation="4"/>
        </filter>

        {/* Storm clouds */}
        <filter id="cloud-storm" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="5" seed="4" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="40" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
          <feGaussianBlur in="displaced" stdDeviation="3"/>
          <feColorMatrix type="matrix" values="0.6 0 0 0 0  0 0.6 0 0 0  0 0 0.7 0 0  0 0 0 1 0"/>
        </filter>

        {/* Wave distortion */}
        <filter id="wave-ocean" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="turbulence" baseFrequency="0.005 0.015" numOctaves="3" seed="10" result="turbulence">
            <animate attributeName="baseFrequency" dur="20s" values="0.005 0.015; 0.007 0.018; 0.005 0.015" repeatCount="indefinite"/>
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="40" xChannelSelector="R" yChannelSelector="G"/>
        </filter>

        {/* Fog texture */}
        <filter id="fog-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.003" numOctaves="4" seed="20" result="noise"/>
          <feGaussianBlur in="noise" stdDeviation="25"/>
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"/>
        </filter>

        {/* Lightning glow */}
        <filter id="lightning-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}


// ============================================
// CLOUD SYSTEM
// ============================================

interface CloudLayerProps {
  variant?: 'cumulus' | 'cirrus' | 'stratus' | 'storm';
  layer?: 'back' | 'mid' | 'front';
  className?: string;
}

const cloudConfig = {
  cumulus: { filter: 'url(#cloud-cumulus)', blur: 4 },
  cirrus: { filter: 'url(#cloud-cumulus)', blur: 2 }, // Reuse filter, adjust blur
  stratus: { filter: 'url(#cloud-cumulus)', blur: 6 },
  storm: { filter: 'url(#cloud-storm)', blur: 3 },
};

const layerConfig = {
  back: { zIndex: -1, opacity: 0.3, scale: 1.5, duration: 120 },
  mid: { zIndex: 0, opacity: 0.4, scale: 1.2, duration: 80 },
  front: { zIndex: 2, opacity: 0.12, scale: 0.8, duration: 50 },
};

export function CloudLayer({
  variant = 'cumulus',
  layer = 'back',
  className = '',
}: CloudLayerProps) {
  const cloud = cloudConfig[variant];
  const layerSettings = layerConfig[layer];

  return (
    <div
      className={`cloud-layer ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: layerSettings.zIndex,
        opacity: layerSettings.opacity,
        transform: `scale(${layerSettings.scale})`,
        filter: cloud.filter,
        background: `radial-gradient(
          ellipse 200% 100% at 50% 100%,
          rgba(255, 255, 255, 0.9) 0%,
          transparent 70%
        )`,
        animation: `drift ${layerSettings.duration}s linear infinite${layer === 'front' ? ' reverse' : ''}`,
      }}
    />
  );
}

interface CloudSystemProps {
  variant?: 'cumulus' | 'storm';
  layers?: ('back' | 'mid' | 'front')[];
  className?: string;
}

export function CloudSystem({
  variant = 'cumulus',
  layers = ['back', 'front'],
  className = '',
}: CloudSystemProps) {
  return (
    <div className={`cloud-system ${className}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {layers.map((layer) => (
        <CloudLayer key={layer} variant={variant} layer={layer} />
      ))}
    </div>
  );
}


// ============================================
// WAVE COMPONENT
// ============================================

interface WaveProps {
  color?: string;
  height?: number;
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export function Wave({
  color = '#38bdf8',
  height = 200,
  speed = 'normal',
  className = '',
}: WaveProps) {
  const duration = { slow: 15, normal: 10, fast: 6 }[speed];

  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      className={className}
      style={{ width: '100%', height, display: 'block' }}
    >
      <path
        fill={color}
        filter="url(#wave-ocean)"
      >
        <animate
          attributeName="d"
          dur={`${duration}s`}
          repeatCount="indefinite"
          values="
            M0,160 C360,220 720,100 1080,180 C1260,220 1380,140 1440,160 L1440,320 L0,320 Z;
            M0,180 C360,120 720,200 1080,140 C1260,100 1380,180 1440,140 L1440,320 L0,320 Z;
            M0,160 C360,220 720,100 1080,180 C1260,220 1380,140 1440,160 L1440,320 L0,320 Z
          "
        />
      </path>
    </svg>
  );
}

interface WaveStackProps {
  colors?: string[];
  className?: string;
}

export function WaveStack({
  colors = ['#0c4a6e', '#0369a1', '#38bdf8'],
  className = '',
}: WaveStackProps) {
  return (
    <div className={className} style={{ position: 'relative' }}>
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            bottom: i * 20,
            left: 0,
            right: 0,
            zIndex: colors.length - i,
          }}
        >
          <Wave
            color={color}
            height={150 - i * 20}
            speed={i === 0 ? 'slow' : i === 1 ? 'normal' : 'fast'}
          />
        </div>
      ))}
    </div>
  );
}


// ============================================
// RAIN EFFECT
// ============================================

interface RainEffectProps {
  intensity?: 'light' | 'moderate' | 'heavy';
  windAngle?: number; // degrees
  className?: string;
}

export function RainEffect({
  intensity = 'moderate',
  windAngle = 0,
  className = '',
}: RainEffectProps) {
  const dropCount = { light: 50, moderate: 150, heavy: 300 }[intensity];

  const drops = useMemo(() =>
    Array.from({ length: dropCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.5 + Math.random() * 0.5,
      length: 15 + Math.random() * 20,
      opacity: 0.3 + Math.random() * 0.5,
    })),
    [dropCount]
  );

  return (
    <div
      className={`rain-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        transform: `rotate(${windAngle}deg)`,
      }}
    >
      {drops.map((drop) => (
        <div
          key={drop.id}
          style={{
            position: 'absolute',
            left: `${drop.x}%`,
            width: 2,
            height: drop.length,
            background: `linear-gradient(180deg, transparent 0%, rgba(174, 194, 224, 0.5) 50%, rgba(174, 194, 224, 0.8) 100%)`,
            borderRadius: '0 0 2px 2px',
            opacity: drop.opacity,
            animation: `rain-fall ${drop.duration}s linear infinite`,
            animationDelay: `${drop.delay}s`,
          }}
        />
      ))}
    </div>
  );
}


// ============================================
// LIGHTNING EFFECT
// ============================================

interface LightningEffectProps {
  frequency?: number; // 0-1, chance per interval
  className?: string;
}

export function LightningEffect({
  frequency = 0.3,
  className = '',
}: LightningEffectProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [boltPath, setBoltPath] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < frequency) {
        // Generate random lightning path
        const startX = 30 + Math.random() * 40;
        let path = `M${startX},0`;
        let x = startX;
        let y = 0;

        for (let i = 0; i < 8; i++) {
          x += (Math.random() - 0.5) * 30;
          y += 25 + Math.random() * 15;
          path += ` L${x},${y}`;
        }

        setBoltPath(path);
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 500);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [frequency]);

  if (!isFlashing) return null;

  return (
    <>
      {/* Screen flash */}
      <div
        className={className}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(200, 220, 255, 0.3)',
          pointerEvents: 'none',
          zIndex: 1000,
          animation: 'lightning-flash 0.3s ease-out forwards',
        }}
      />

      {/* Lightning bolt */}
      <svg
        viewBox="0 0 100 200"
        style={{
          position: 'absolute',
          top: 0,
          left: '20%',
          width: '60%',
          height: '50%',
          pointerEvents: 'none',
          zIndex: 1001,
        }}
      >
        <path
          d={boltPath}
          fill="none"
          stroke="white"
          strokeWidth="3"
          filter="url(#lightning-glow)"
          style={{
            strokeDasharray: 500,
            strokeDashoffset: 500,
            animation: 'bolt-draw 0.15s ease-out forwards',
          }}
        />
      </svg>
    </>
  );
}


// ============================================
// FOG LAYER
// ============================================

interface FogLayerProps {
  density?: 'light' | 'medium' | 'dense';
  position?: 'full' | 'ground';
  className?: string;
}

export function FogLayer({
  density = 'medium',
  position = 'full',
  className = '',
}: FogLayerProps) {
  const opacityMap = { light: 0.2, medium: 0.4, dense: 0.6 };

  return (
    <div
      className={`fog-layer ${className}`}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: position === 'ground' ? '60%' : 0,
        pointerEvents: 'none',
        background: position === 'ground'
          ? 'linear-gradient(to top, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 40%, transparent 100%)'
          : 'rgba(255, 255, 255, 0.4)',
        filter: 'url(#fog-filter)',
        opacity: opacityMap[density],
        animation: 'fog-breathe 8s ease-in-out infinite',
      }}
    />
  );
}


// ============================================
// AURORA BOREALIS
// ============================================

interface AuroraEffectProps {
  colors?: string[];
  intensity?: number; // 0-1
  className?: string;
}

export function AuroraEffect({
  colors = ['rgba(0, 255, 128, 0.4)', 'rgba(138, 43, 226, 0.3)', 'rgba(0, 150, 255, 0.3)'],
  intensity = 0.6,
  className = '',
}: AuroraEffectProps) {
  return (
    <div
      className={`aurora-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: 'linear-gradient(to top, #0a0a1a 0%, #1a1a3a 100%)',
      }}
    >
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${10 + i * 5}%`,
            left: '-50%',
            width: '200%',
            height: '40%',
            opacity: intensity,
            mixBlendMode: 'screen',
            filter: 'blur(30px)',
            background: `linear-gradient(90deg, transparent 0%, ${color} 30%, ${color} 70%, transparent 100%)`,
            animation: `aurora-wave ${15 + i * 5}s ease-in-out infinite${i % 2 ? ' reverse' : ''}`,
            animationDelay: `${-i * 3}s`,
          }}
        />
      ))}
    </div>
  );
}


// ============================================
// SKY GRADIENT
// ============================================

type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night';

const skyGradients: Record<TimeOfDay, string> = {
  dawn: 'linear-gradient(to top, #ff6b6b 0%, #feca57 20%, #ff9ff3 40%, #54a0ff 70%, #1a1a2e 100%)',
  morning: 'linear-gradient(to top, #ff9a56 0%, #ffbe76 30%, #ffeaa7 50%, #74b9ff 80%, #0984e3 100%)',
  noon: 'linear-gradient(to top, #74b9ff 0%, #0984e3 50%, #0652dd 100%)',
  afternoon: 'linear-gradient(to top, #74b9ff 0%, #0984e3 40%, #6c5ce7 80%, #2d3436 100%)',
  dusk: 'linear-gradient(to top, #e17055 0%, #fdcb6e 20%, #f8a5c2 40%, #686de0 70%, #30336b 100%)',
  night: 'linear-gradient(to top, #0c2461 0%, #1e3799 40%, #0a1931 100%)',
};

interface SkyGradientProps {
  timeOfDay?: TimeOfDay;
  className?: string;
}

export function SkyGradient({
  timeOfDay = 'noon',
  className = '',
}: SkyGradientProps) {
  return (
    <div
      className={`sky-gradient ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        background: skyGradients[timeOfDay],
        transition: 'background 3s ease-in-out',
      }}
    />
  );
}


// ============================================
// COMPLETE ATMOSPHERE WRAPPER
// ============================================

interface AtmosphereProps {
  weather?: 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'aurora';
  timeOfDay?: TimeOfDay;
  children: React.ReactNode;
  className?: string;
}

export function Atmosphere({
  weather = 'clear',
  timeOfDay = 'noon',
  children,
  className = '',
}: AtmosphereProps) {
  return (
    <div
      className={`atmosphere ${className}`}
      style={{
        position: 'relative',
        minHeight: '100vh',
        isolation: 'isolate',
        overflow: 'hidden',
      }}
    >
      {/* Include filters once */}
      <WeatherFilters />

      {/* Sky background */}
      <SkyGradient timeOfDay={timeOfDay} />

      {/* Weather-specific layers (back) */}
      {(weather === 'cloudy' || weather === 'rainy' || weather === 'stormy') && (
        <CloudLayer variant={weather === 'stormy' ? 'storm' : 'cumulus'} layer="back" />
      )}

      {weather === 'foggy' && <FogLayer density="medium" position="full" />}

      {weather === 'aurora' && <AuroraEffect intensity={0.6} />}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      {/* Weather-specific layers (front) */}
      {(weather === 'cloudy' || weather === 'rainy' || weather === 'stormy') && (
        <CloudLayer variant={weather === 'stormy' ? 'storm' : 'cumulus'} layer="front" />
      )}

      {(weather === 'rainy' || weather === 'stormy') && (
        <RainEffect intensity={weather === 'stormy' ? 'heavy' : 'moderate'} />
      )}

      {weather === 'stormy' && <LightningEffect frequency={0.3} />}

      {weather === 'foggy' && <FogLayer density="light" position="ground" />}
    </div>
  );
}


// ============================================
// REQUIRED CSS (add to your global styles)
// ============================================

/*
@keyframes drift {
  from { transform: translateX(-10%); }
  to { transform: translateX(10%); }
}

@keyframes rain-fall {
  0% { transform: translateY(-100vh); }
  100% { transform: translateY(100vh); }
}

@keyframes lightning-flash {
  0% { opacity: 0; }
  10% { opacity: 1; }
  20% { opacity: 0.5; }
  30% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes bolt-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes fog-breathe {
  0%, 100% { opacity: 0.5; transform: scaleY(1); }
  50% { opacity: 0.7; transform: scaleY(1.1); }
}

@keyframes aurora-wave {
  0%, 100% { transform: translateX(-20%) skewX(-5deg); opacity: 0.4; }
  25% { transform: translateX(-10%) skewX(5deg); opacity: 0.7; }
  50% { transform: translateX(0%) skewX(-3deg); opacity: 0.5; }
  75% { transform: translateX(10%) skewX(3deg); opacity: 0.6; }
}

@media (prefers-reduced-motion: reduce) {
  .cloud-layer,
  .fog-layer,
  .rain-container > div,
  [class*="aurora"] {
    animation: none !important;
  }
}
*/
