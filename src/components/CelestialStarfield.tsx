'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface Star {
  id: number;
  top: number; // percentage
  left: number; // percentage
  size: number; // px
  color: string;
  twinkleDuration: number; // seconds
  delay: number; // seconds
  opacity: number;
  symbol: string;
}

const STAR_SYMBOLS = ['✦', '✧', '⋆', '•', '☆', '˖⁺', '˚｡⋆'];
const STAR_COLORS = ['#FFFFFF', '#FFDDF0', '#DCCAFF', '#D9EDFF', '#EDE2FF', '#FFF8DB'];

export function CelestialStarfield() {
  const [mounted, setMounted] = useState(false);
  const [cursorStars, setCursorStars] = useState<{ id: number; x: number; y: number; symbol: string; color: string }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate 65 fixed celestial stars distributed across universe
  const stars: Star[] = useMemo(() => {
    const list: Star[] = [];
    for (let i = 0; i < 70; i++) {
      // Deterministic pseudo-random generation to avoid SSR mismatch
      const pseudoRand1 = ((i * 37) % 100) / 100;
      const pseudoRand2 = ((i * 73) % 100) / 100;
      const pseudoRand3 = ((i * 19) % 100) / 100;
      const pseudoRand4 = ((i * 53) % 100) / 100;

      list.push({
        id: i,
        top: Math.round(pseudoRand1 * 96) + 2, // 2% to 98%
        left: Math.round(pseudoRand2 * 96) + 2, // 2% to 98%
        size: i % 7 === 0 ? 18 : i % 4 === 0 ? 14 : i % 2 === 0 ? 10 : 7,
        color: STAR_COLORS[i % STAR_COLORS.length],
        twinkleDuration: 2 + (pseudoRand3 * 3), // 2s to 5s
        delay: pseudoRand4 * 3, // 0s to 3s
        opacity: 0.35 + (pseudoRand1 * 0.55),
        symbol: STAR_SYMBOLS[i % STAR_SYMBOLS.length],
      });
    }
    return list;
  }, []);

  // Subtle interactive star dust on click
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClick = (e: MouseEvent) => {
      const newStar = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        symbol: STAR_SYMBOLS[Math.floor(Math.random() * STAR_SYMBOLS.length)],
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      };

      setCursorStars(prev => [...prev.slice(-12), newStar]);

      setTimeout(() => {
        setCursorStars(prev => prev.filter(s => s.id !== newStar.id));
      }, 1000);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Constellation Star Field */}
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute font-serif leading-none transition-opacity select-none"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            fontSize: `${star.size}px`,
            color: star.color,
            opacity: star.opacity,
            animation: `twinkle ${star.twinkleDuration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            textShadow: `0 0 8px ${star.color}80`,
          }}
        >
          {star.symbol}
        </span>
      ))}

      {/* 2. Occasional Subtle Shooting Star Animations */}
      <div className="shooting-star-container absolute top-12 left-1/4 w-[280px] h-0.5 overflow-hidden rotate-[32deg] opacity-70">
        <div className="shooting-star" />
      </div>

      <div className="shooting-star-container absolute top-1/3 right-1/5 w-[220px] h-0.5 overflow-hidden rotate-[-25deg] opacity-60" style={{ animationDelay: '4s' }}>
        <div className="shooting-star" style={{ animationDelay: '4s' }} />
      </div>

      <div className="shooting-star-container absolute bottom-1/4 left-1/6 w-[260px] h-0.5 overflow-hidden rotate-[40deg] opacity-50" style={{ animationDelay: '7s' }}>
        <div className="shooting-star" style={{ animationDelay: '7s' }} />
      </div>

      {/* 3. Click Sparkle Stars */}
      {cursorStars.map(star => (
        <span
          key={star.id}
          className="fixed pointer-events-none text-base font-bold animate-ping"
          style={{
            left: star.x - 8,
            top: star.y - 8,
            color: star.color,
            textShadow: `0 0 10px ${star.color}`,
          }}
        >
          {star.symbol}
        </span>
      ))}
    </div>
  );
}
