"use client";
import { useState, useEffect } from "react";

const WALK_MS = 4200; // how long the walk-slide lasts

const C = {
  skin:     "#C68642",
  hatYellow:"#FFD700",
  hatShadow:"#E6B800",
  vest:     "#FF6B35",
  vestLine: "#FFD700",
  pants:    "#1E3A5F",
  shoe:     "#3D200A",
  outline:  "#222",
  white:    "#FFFFFF",
  beard:    "#5C3317",
};

// ─── SVG Gradients Defs ──────────────────────────────────────────────────────
function Gradients() {
  return (
    <defs>
      {/* Skin gradient */}
      <linearGradient id="skin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E5A65D" />
        <stop offset="100%" stopColor="#A86E30" />
      </linearGradient>
      {/* Safety Vest gradient */}
      <linearGradient id="vest-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF7A30" />
        <stop offset="100%" stopColor="#E04600" />
      </linearGradient>
      {/* Hard hat gradient */}
      <linearGradient id="hat-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFE57F" />
        <stop offset="60%" stopColor="#FFC107" />
        <stop offset="100%" stopColor="#FFA000" />
      </linearGradient>
      {/* Pants gradient */}
      <linearGradient id="pants-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34495E" />
        <stop offset="100%" stopColor="#1C2833" />
      </linearGradient>
      {/* Boots gradient */}
      <linearGradient id="boots-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8A5A36" />
        <stop offset="100%" stopColor="#5C3A21" />
      </linearGradient>
      {/* Sunglasses reflective mirror gradient */}
      <linearGradient id="shades-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2E86C1" />
        <stop offset="40%" stopColor="#85C1E9" />
        <stop offset="70%" stopColor="#1B4F72" />
        <stop offset="100%" stopColor="#0B2545" />
      </linearGradient>
      {/* Reflective stripes */}
      <linearGradient id="reflect-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#E1F5FE" />
        <stop offset="50%" stopColor="#FFF" />
        <stop offset="100%" stopColor="#E1F5FE" />
      </linearGradient>
      {/* Glove gradient */}
      <linearGradient id="glove-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EAECEE" />
        <stop offset="100%" stopColor="#BDC3C7" />
      </linearGradient>
    </defs>
  );
}

// ─── Walking SVG ─────────────────────────────────────────────────────────────
function WalkSVG() {
  return (
    <svg
      viewBox="0 0 90 190"
      width="110"
      height="220"
      style={{ overflow: "visible" }}
    >
      <Gradients />

      {/* ── RIGHT LEG (back, opposite phase) ── */}
      <g style={{
        transformOrigin: "50px 105px",
        animation: "limb-b 0.55s ease-in-out 8 alternate",
      }}>
        {/* thigh */}
        <rect x="46" y="105" width="11" height="34" rx="5.5"
          fill="url(#pants-grad)" stroke={C.outline} strokeWidth="0.8" />
        {/* shin (sub-group pivoting at knee) */}
        <g style={{
          transformOrigin: "51px 139px",
          animation: "shin-b 0.55s ease-in-out 8 alternate",
        }}>
          <rect x="46" y="139" width="11" height="28" rx="5.5"
            fill="url(#pants-grad)" stroke={C.outline} strokeWidth="0.8" />
          {/* boot */}
          <path d="M43 162 L60 162 A 5 5 0 0 1 65 167 L65 173 L43 173 Z" fill="url(#boots-grad)" stroke={C.outline} strokeWidth="0.8" />
          <rect x="41" y="172" width="25" height="3" rx="1" fill="#222" />
        </g>
      </g>

      {/* ── TORSO + HEAD (bob up/down) ── */}
      <g style={{ animation: "body-bob 0.55s ease-in-out 8 alternate" }}>
        {/* Torso / safety vest */}
        <rect x="28" y="68" width="36" height="40" rx="7"
          fill="url(#vest-grad)" stroke={C.outline} strokeWidth="0.8" />
        
        {/* reflective stripes */}
        <rect x="28" y="77" width="36" height="5" rx="1.5" fill="url(#reflect-grad)" stroke={C.outline} strokeWidth="0.4" />
        <rect x="28" y="88" width="36" height="5" rx="1.5" fill="url(#reflect-grad)" stroke={C.outline} strokeWidth="0.4" />
        <line x1="46" y1="68" x2="46" y2="108" stroke="#111" strokeWidth="1" opacity="0.3" />

        {/* NECK */}
        <rect x="42" y="58" width="9" height="12" rx="3" fill="url(#skin-grad)" stroke={C.outline} strokeWidth="0.5" />

        {/* HEAD */}
        <circle cx="46" cy="47" r="16" fill="url(#skin-grad)" stroke={C.outline} strokeWidth="0.8" />
        {/* beard */}
        <ellipse cx="46" cy="56" rx="10" ry="5.5" fill={C.beard} opacity="0.4" />
        
        {/* Safety Aviator Sunglasses */}
        <path d="M34 40 Q39 37 44 40 Q46 45 41 48 Q34 46 34 40 Z" fill="url(#shades-grad)" stroke={C.outline} strokeWidth="0.8" />
        <path d="M47 40 Q52 37 57 40 Q59 45 54 48 Q47 46 47 40 Z" fill="url(#shades-grad)" stroke={C.outline} strokeWidth="0.8" />
        <line x1="44" y1="40" x2="47" y2="40" stroke="#000" strokeWidth="1.5" />
        <path d="M37 42 L40 45" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
        <path d="M50 42 L53 45" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />

        {/* brow */}
        <path d="M34 36 Q40 33 45 36" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M47 36 Q53 33 58 36" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* smile */}
        <path d="M42 52 Q47 57 52 52" stroke="#4A2711" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* HARD HAT brim */}
        <ellipse cx="46" cy="32" rx="22" ry="5.5"
          fill={C.hatShadow} stroke={C.outline} strokeWidth="0.8" />
        {/* hard hat dome */}
        <path d="M26.5 32 Q26.5 9 46 8 Q65.5 9 65.5 32 Z"
          fill="url(#hat-grad)" stroke={C.outline} strokeWidth="0.8" />
        {/* center ridge */}
        <path d="M44 8 Q46 5 48 8 L48 30 L44 30 Z" fill="#FFE57F" opacity="0.7" />
        {/* hat shine */}
        <path d="M32 26 Q35 13 46 11 Q38 13 35 24 Z" fill="rgba(255,255,255,0.4)" />
      </g>

      {/* ── RIGHT ARM (back, opposite) ── */}
      <g style={{
        transformOrigin: "61px 72px",
        animation: "arm-b 0.55s ease-in-out 8 alternate",
      }}>
        <rect x="58" y="72" width="10" height="28" rx="5"
          fill="url(#skin-grad)" stroke={C.outline} strokeWidth="0.8" />
        {/* glove */}
        <circle cx="63" cy="100" r="6" fill="url(#glove-grad)" stroke={C.outline} strokeWidth="0.8" />
      </g>

      {/* ── LEFT LEG (front) ── */}
      <g style={{
        transformOrigin: "38px 105px",
        animation: "limb-a 0.55s ease-in-out 8 alternate",
      }}>
        <rect x="33" y="105" width="11" height="34" rx="5.5"
          fill="url(#pants-grad)" stroke={C.outline} strokeWidth="0.8" />
        <g style={{
          transformOrigin: "38px 139px",
          animation: "shin-a 0.55s ease-in-out 8 alternate",
        }}>
          <rect x="33" y="139" width="11" height="28" rx="5.5"
            fill="url(#pants-grad)" stroke={C.outline} strokeWidth="0.8" />
          {/* boot */}
          <path d="M30 162 L47 162 A 5 5 0 0 1 52 167 L52 173 L30 173 Z" fill="url(#boots-grad)" stroke={C.outline} strokeWidth="0.8" />
          <rect x="28" y="172" width="25" height="3" rx="1" fill="#222" />
        </g>
      </g>

      {/* ── LEFT ARM (front) ── */}
      <g style={{
        transformOrigin: "30px 72px",
        animation: "arm-a 0.55s ease-in-out 8 alternate",
      }}>
        <rect x="20" y="72" width="10" height="28" rx="5"
          fill="url(#skin-grad)" stroke={C.outline} strokeWidth="0.8" />
        {/* glove */}
        <circle cx="25" cy="100" r="6" fill="url(#glove-grad)" stroke={C.outline} strokeWidth="0.8" />
      </g>
    </svg>
  );
}

// ─── Leaning Pose SVG ────────────────────────────────────────────────────────
function LeanSVG() {
  return (
    <svg
      viewBox="0 0 90 190"
      width="110"
      height="220"
      style={{
        overflow: "visible",
        animation: "idle-breathe 2.8s ease-in-out infinite",
        // tilt body into the box (leaning right)
        transform: "rotate(8deg)",
        transformOrigin: "55px 105px",
      }}
    >
      <Gradients />

      {/* RIGHT LEG - straight */}
      <rect x="46" y="105" width="11" height="34" rx="5.5" fill="url(#pants-grad)" stroke={C.outline} strokeWidth="0.8" />
      <rect x="46" y="139" width="11" height="28" rx="5.5" fill="url(#pants-grad)" stroke={C.outline} strokeWidth="0.8" />
      {/* boot */}
      <path d="M43 162 L60 162 A 5 5 0 0 1 65 167 L65 173 L43 173 Z" fill="url(#boots-grad)" stroke={C.outline} strokeWidth="0.8" />
      <rect x="41" y="172" width="25" height="3" rx="1" fill="#222" />

      {/* LEFT LEG - crossed in front, ankle rests on right */}
      <g style={{ transform: "rotate(-20deg)", transformOrigin: "38px 105px" }}>
        <rect x="33" y="105" width="11" height="34" rx="5.5" fill="url(#pants-grad)" stroke={C.outline} strokeWidth="0.8" />
        <rect x="33" y="139" width="11" height="28" rx="5.5" fill="url(#pants-grad)" stroke={C.outline} strokeWidth="0.8" />
        {/* boot */}
        <path d="M30 162 L47 162 A 5 5 0 0 1 52 167 L52 173 L30 173 Z" fill="url(#boots-grad)" stroke={C.outline} strokeWidth="0.8" />
        <rect x="28" y="172" width="25" height="3" rx="1" fill="#222" />
      </g>

      {/* TORSO */}
      <rect x="28" y="68" width="36" height="40" rx="7" fill="url(#vest-grad)" stroke={C.outline} strokeWidth="0.8" />
      <rect x="28" y="77" width="36" height="5" rx="1.5" fill="url(#reflect-grad)" stroke={C.outline} strokeWidth="0.4" />
      <rect x="28" y="88" width="36" height="5" rx="1.5" fill="url(#reflect-grad)" stroke={C.outline} strokeWidth="0.4" />
      <line x1="46" y1="68" x2="46" y2="108" stroke="#111" strokeWidth="1" opacity="0.3" />

      {/* NECK + HEAD */}
      <rect x="42" y="58" width="9" height="12" rx="3" fill="url(#skin-grad)" stroke={C.outline} strokeWidth="0.5" />
      <circle cx="46" cy="47" r="16" fill="url(#skin-grad)" stroke={C.outline} strokeWidth="0.8" />
      <ellipse cx="46" cy="56" rx="10" ry="5.5" fill={C.beard} opacity="0.4" />
      
      {/* Safety Aviator Sunglasses (Winking: right lens glares, left lens tilts smugly) */}
      <path d="M34 40 Q39 37 44 40 Q46 45 41 48 Q34 46 34 40 Z" fill="url(#shades-grad)" stroke={C.outline} strokeWidth="0.8" />
      <path d="M47 40 Q52 37 57 40 Q59 45 54 48 Q47 46 47 40 Z" fill="url(#shades-grad)" stroke={C.outline} strokeWidth="0.8" />
      <line x1="44" y1="40" x2="47" y2="40" stroke="#000" strokeWidth="1.5" />
      <path d="M37 42 L40 45" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
      <path d="M50 42 L53 45" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
      
      <path d="M34 36 Q40 33 45 36" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M47 36 Q53 33 58 36" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* smug smile for the pose */}
      <path d="M41 52 Q46 58 53 51" stroke="#4A2711" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* HARD HAT */}
      <ellipse cx="46" cy="32" rx="22" ry="5.5" fill={C.hatShadow} stroke={C.outline} strokeWidth="0.8" />
      <path d="M26.5 32 Q26.5 9 46 8 Q65.5 9 65.5 32 Z" fill="url(#hat-grad)" stroke={C.outline} strokeWidth="0.8" />
      <path d="M44 8 Q46 5 48 8 L48 30 L44 30 Z" fill="#FFE57F" opacity="0.7" />
      <path d="M32 26 Q35 13 46 11 Q38 13 35 24 Z" fill="rgba(255,255,255,0.4)" />

      {/* RIGHT ARM - raised up & pressed against PT box (to the right) */}
      <g style={{ transform: "rotate(-55deg)", transformOrigin: "61px 72px" }}>
        <rect x="58" y="72" width="10" height="30" rx="5" fill="url(#skin-grad)" stroke={C.outline} strokeWidth="0.8" />
        {/* glove */}
        <circle cx="63" cy="102" r="6" fill="url(#glove-grad)" stroke={C.outline} strokeWidth="0.8" />
      </g>

      {/* LEFT ARM - hanging relaxed */}
      <g style={{ transform: "rotate(18deg)", transformOrigin: "30px 72px" }}>
        <rect x="20" y="72" width="10" height="28" rx="5" fill="url(#skin-grad)" stroke={C.outline} strokeWidth="0.8" />
        {/* glove */}
        <circle cx="25" cy="100" r="6" fill="url(#glove-grad)" stroke={C.outline} strokeWidth="0.8" />
      </g>
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function WalkingWorker({ name }: { name?: string }) {
  const [phase, setPhase] = useState<"walking" | "leaning">("walking");

  useEffect(() => {
    const t = setTimeout(() => setPhase("leaning"), WALK_MS);
    return () => clearTimeout(t);
  }, []);

  if (phase === "walking") {
    return (
      <div
        className="self-end pointer-events-none relative flex flex-col items-center"
        style={{ animation: `walk-slide ${WALK_MS}ms ease-out forwards` }}
      >
        {/* Cute Speech Bubble during entry */}
        <div className="absolute -top-16 bg-white text-slate-800 border-2 border-slate-800 px-4 py-2 rounded-2xl text-xs font-extrabold shadow-lg z-50 whitespace-nowrap">
          Walking in... 🏃‍♂️
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-slate-800 transform rotate-45"></div>
        </div>
        <WalkSVG />
      </div>
    );
  }

  // leaning — pressed right against PT box (no gap: negative left margin)
  return (
    <div
      className="self-end pointer-events-none relative flex flex-col items-center"
      style={{ marginLeft: "-14px" }}
    >
      {/* Speech bubble above head */}
      <div className="absolute -top-16 bg-white text-slate-800 border-2 border-slate-800 px-4 py-2 rounded-2xl text-xs font-extrabold shadow-lg animate-[bounce_1.5s_infinite] z-50 whitespace-nowrap">
        {name ? `Hello ${name}! 👋` : "Hii! 👷"}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-slate-800 transform rotate-45"></div>
      </div>
      <LeanSVG />
    </div>
  );
}
