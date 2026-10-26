import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CyclePhase, MascotAccessory } from '../types/cycle';
import { MASCOT_DIALOGUES } from '../utils/cycleCalculations';
import { Heart, Sparkles, MessageCircleHeart } from 'lucide-react';

interface MascotLunaProps {
  phase: CyclePhase;
  accessory?: MascotAccessory;
  onAccessoryChange?: (acc: MascotAccessory) => void;
  dayInCycle: number;
}

export const MascotLuna: React.FC<MascotLunaProps> = ({
  phase,
  accessory = 'flower',
  onAccessoryChange,
  dayInCycle
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHappyJump, setIsHappyJump] = useState(false);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [showSpeech, setShowSpeech] = useState(true);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Periodic natural eye blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 220);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  const dialogues = MASCOT_DIALOGUES[phase] || MASCOT_DIALOGUES.follicular;

  const handleMascotClick = (e: React.MouseEvent) => {
    setIsHappyJump(true);
    setTimeout(() => setIsHappyJump(false), 700);

    // Cycle through dialogues
    setCurrentDialogueIndex((prev) => (prev + 1) % dialogues.length);
    setShowSpeech(true);

    // Floating heart effect
    const rect = e.currentTarget.getBoundingClientRect();
    const newHeart = {
      id: Date.now(),
      x: e.clientX - rect.left + (Math.random() * 30 - 15),
      y: e.clientY - rect.top - 20
    };
    setFloatingHearts((prev) => [...prev.slice(-4), newHeart]);

    // Mini confetti burst on click
    confetti({
      particleCount: 18,
      spread: 45,
      origin: {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      },
      colors: ['#fb7185', '#f472b6', '#c084fc', '#fde047'],
      disableForReducedMotion: true
    });
  };

  // Phase color themes for Luna's body/aura
  const bodyColors = {
    menstrual: {
      aura: 'from-rose-200/50 via-pink-100/40 to-transparent',
      bodyGrad: ['#ff8da1', '#ff6b8b'],
      cheeks: '#ff4d6d',
      name: 'Luna Nyaman',
      badge: 'Menstruasi',
      badgeBg: 'bg-rose-100 text-rose-700'
    },
    follicular: {
      aura: 'from-amber-200/50 via-orange-100/40 to-transparent',
      bodyGrad: ['#ffb703', '#fb8500'],
      cheeks: '#f77f00',
      name: 'Luna Semangat',
      badge: 'Fase Folikular',
      badgeBg: 'bg-amber-100 text-amber-800'
    },
    fertile: {
      aura: 'from-purple-200/50 via-violet-100/40 to-transparent',
      bodyGrad: ['#c084fc', '#a855f7'],
      cheeks: '#9333ea',
      name: 'Luna Mempesona',
      badge: 'Masa Subur',
      badgeBg: 'bg-purple-100 text-purple-700'
    },
    ovulation: {
      aura: 'from-fuchsia-200/50 via-pink-200/40 to-transparent',
      bodyGrad: ['#f472b6', '#e879f9'],
      cheeks: '#db2777',
      name: 'Luna Bersinar',
      badge: 'Puncak Ovulasi',
      badgeBg: 'bg-fuchsia-100 text-fuchsia-700'
    },
    luteal: {
      aura: 'from-orange-200/50 via-amber-100/40 to-transparent',
      bodyGrad: ['#fb923c', '#ea580c'],
      cheeks: '#c2410c',
      name: 'Luna Cozy',
      badge: 'Fase Luteal',
      badgeBg: 'bg-orange-100 text-orange-800'
    }
  }[phase] || {
    aura: 'from-rose-200/50 via-pink-100/40 to-transparent',
    bodyGrad: ['#ff8da1', '#ff6b8b'],
    cheeks: '#ff4d6d',
    name: 'Luna',
    badge: 'Siklus',
    badgeBg: 'bg-rose-100 text-rose-700'
  };

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-sm mx-auto">
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        {showSpeech && (
          <motion.div
            key={currentDialogueIndex + '-' + phase}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="relative mb-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-rose-100 text-xs text-slate-700 max-w-[290px] text-center"
          >
            <div className="font-semibold text-rose-600 flex items-center justify-center gap-1.5 mb-0.5 text-[11px]">
              <MessageCircleHeart className="w-3.5 h-3.5 text-rose-500 inline shrink-0" />
              <span>{bodyColors.name} berkata:</span>
            </div>
            <p className="leading-relaxed font-medium">"{dialogues[currentDialogueIndex]}"</p>
            {/* Speech pointer */}
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating hearts container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <AnimatePresence>
          {floatingHearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{ opacity: 1, scale: 0.5, y: 0 }}
              animate={{ opacity: 0, scale: 1.4, y: -70 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ left: heart.x, top: heart.y }}
              className="absolute text-rose-500 font-bold"
            >
              <Heart className="w-5 h-5 fill-rose-400 text-rose-500" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mascot Interactive Figure */}
      <motion.div
        onClick={handleMascotClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.93 }}
        animate={
          isHappyJump
            ? {
                y: [0, -24, 4, -8, 0],
                rotate: [0, -4, 4, -2, 0],
                scale: [1, 1.12, 0.96, 1.04, 1]
              }
            : {
                y: [0, -6, 0],
                rotate: [0, 0.8, -0.8, 0]
              }
        }
        transition={
          isHappyJump
            ? { duration: 0.65, ease: 'easeInOut' }
            : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
        }
        className="cursor-pointer relative group flex flex-col items-center justify-center p-2"
        role="button"
        tabIndex={0}
        aria-label="Maskot Luna - Ketuk untuk berinteraksi"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMascotClick(e as unknown as React.MouseEvent);
          }
        }}
      >
        {/* Soft magical background aura */}
        <div
          className={`absolute -inset-4 bg-gradient-radial ${bodyColors.aura} rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity`}
        />

        {/* Luna SVG Character */}
        <svg
          viewBox="0 0 200 200"
          className="w-44 h-44 drop-shadow-md relative z-10 transition-transform duration-200"
        >
          <defs>
            <linearGradient id={`lunaGrad-${phase}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={bodyColors.bodyGrad[0]} />
              <stop offset="100%" stopColor={bodyColors.bodyGrad[1]} />
            </linearGradient>

            <linearGradient id="teaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Sparkle stars when in ovulation/fertile */}
          {(phase === 'ovulation' || phase === 'fertile') && (
            <g className="animate-pulse">
              <path
                d="M 35 45 Q 40 45 40 40 Q 40 45 45 45 Q 40 45 40 50 Q 40 45 35 45"
                fill="#fbbf24"
              />
              <path
                d="M 160 50 Q 164 50 164 46 Q 164 50 168 50 Q 164 50 164 54 Q 164 50 160 50"
                fill="#f472b6"
              />
            </g>
          )}

          {/* Little Cute Ears / Tuft */}
          <path
            d="M 55 75 Q 40 45 68 55 Z"
            fill={`url(#lunaGrad-${phase})`}
            className="transition-all"
          />
          <path
            d="M 145 75 Q 160 45 132 55 Z"
            fill={`url(#lunaGrad-${phase})`}
            className="transition-all"
          />
          <path d="M 58 70 Q 48 52 66 58 Z" fill="#ffd1dc" />
          <path d="M 142 70 Q 152 52 134 58 Z" fill="#ffd1dc" />

          {/* Luna's Main Teardrop/Cloud Body */}
          <path
            d="M 100 35 C 155 35 175 80 175 125 C 175 168 145 185 100 185 C 55 185 25 168 25 125 C 25 80 45 35 100 35 Z"
            fill={`url(#lunaGrad-${phase})`}
          />

          {/* Luna's Soft Tummy Highlight */}
          <ellipse
            cx="100"
            cy="138"
            rx="52"
            ry="40"
            fill="#ffffff"
            opacity="0.32"
          />

          {/* Rosy Blushing Cheeks */}
          <ellipse
            cx="58"
            cy="124"
            rx="12"
            ry="8"
            fill={bodyColors.cheeks}
            opacity="0.45"
          />
          <ellipse
            cx="142"
            cy="124"
            rx="12"
            ry="8"
            fill={bodyColors.cheeks}
            opacity="0.45"
          />

          {/* Eyes (Open vs Blinking vs Happy Closed) */}
          {isBlinking || phase === 'menstrual' && isHappyJump ? (
            // Curved closed peaceful/happy eyes
            <g stroke="#374151" strokeWidth="3.5" strokeLinecap="round" fill="none">
              <path d="M 62 108 Q 74 116 84 108" />
              <path d="M 116 108 Q 126 116 138 108" />
            </g>
          ) : phase === 'ovulation' ? (
            // Sparkly wink eye
            <g>
              {/* Left Eye: Big sparkle eye */}
              <ellipse cx="73" cy="108" rx="8" ry="10" fill="#1f2937" />
              <circle cx="71" cy="104" r="3.2" fill="#ffffff" />
              <circle cx="76" cy="112" r="1.5" fill="#ffffff" />

              {/* Right Eye: Cute playful wink */}
              <path
                d="M 118 110 Q 128 102 138 110"
                stroke="#1f2937"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ) : (
            // Friendly wide cute eyes
            <g>
              {/* Left Eye */}
              <ellipse cx="73" cy="108" rx="8" ry="10" fill="#1f2937" />
              <circle cx="70" cy="105" r="3.2" fill="#ffffff" />
              <circle cx="76" cy="112" r="1.5" fill="#ffffff" />

              {/* Right Eye */}
              <ellipse cx="127" cy="108" rx="8" ry="10" fill="#1f2937" />
              <circle cx="124" cy="105" r="3.2" fill="#ffffff" />
              <circle cx="130" cy="112" r="1.5" fill="#ffffff" />
            </g>
          )}

          {/* Cute Mouth */}
          {isHappyJump ? (
            // Big open happy mouth
            <path
              d="M 91 122 Q 100 136 109 122 Z"
              fill="#e11d48"
              stroke="#be123c"
              strokeWidth="1.5"
            />
          ) : phase === 'menstrual' ? (
            // Gentle gentle smile with comforting expression
            <path
              d="M 93 124 Q 100 130 107 124"
              stroke="#374151"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            // Sweet kitten smile
            <path
              d="M 91 124 Q 96 128 100 124 Q 104 128 109 124"
              stroke="#374151"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Cute Little Hands */}
          <circle cx="48" cy="144" r="9" fill={bodyColors.bodyGrad[0]} />
          <circle cx="152" cy="144" r="9" fill={bodyColors.bodyGrad[0]} />

          {/* ACCESSORIES OVERLAYS */}
          {accessory === 'flower' && (
            <g transform="translate(122, 45)">
              <circle cx="10" cy="10" r="7" fill="#fb7185" />
              <circle cx="2" cy="10" r="7" fill="#f472b6" />
              <circle cx="18" cy="10" r="7" fill="#f472b6" />
              <circle cx="10" cy="2" r="7" fill="#fda4af" />
              <circle cx="10" cy="18" r="7" fill="#fda4af" />
              <circle cx="10" cy="10" r="5" fill="#fde047" />
            </g>
          )}

          {accessory === 'tea' && (
            <g transform="translate(86, 136)">
              {/* Hot Tea Mug */}
              <rect x="5" y="6" width="18" height="20" rx="3" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
              <path d="M 23 10 C 28 10 28 18 23 18" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <rect x="7" y="9" width="14" height="4" rx="1" fill="#fbbf24" />
              {/* Steam */}
              <path d="M 10 3 Q 12 0 10 -3" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M 16 3 Q 18 0 16 -3" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {accessory === 'blanket' && (
            <g transform="translate(50, 145)">
              {/* Cozy soft mint blanket */}
              <path
                d="M 5 0 C 30 18 70 18 95 0 C 95 24 85 36 50 36 C 15 36 5 24 5 0 Z"
                fill="#a7f3d0"
                stroke="#6ee7b7"
                strokeWidth="1.5"
              />
              <circle cx="30" cy="18" r="3" fill="#34d399" opacity="0.6" />
              <circle cx="70" cy="18" r="3" fill="#34d399" opacity="0.6" />
            </g>
          )}

          {accessory === 'bow' && (
            <g transform="translate(88, 38)">
              {/* Cute Pink Bow */}
              <polygon points="12,12 0,5 0,19" fill="#f43f5e" />
              <polygon points="12,12 24,5 24,19" fill="#f43f5e" />
              <circle cx="12" cy="12" r="4.5" fill="#ffe4e6" />
            </g>
          )}

          {accessory === 'sunglasses' && (
            <g transform="translate(60, 98)">
              {/* Cool Sunglasses */}
              <rect x="0" y="4" width="34" height="20" rx="6" fill="#1e293b" />
              <rect x="46" y="4" width="34" height="20" rx="6" fill="#1e293b" />
              <line x1="32" y1="12" x2="48" y2="12" stroke="#1e293b" strokeWidth="4" />
              {/* Lens shine */}
              <line x1="4" y1="8" x2="16" y2="20" stroke="#ffffff" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
              <line x1="50" y1="8" x2="62" y2="20" stroke="#ffffff" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
            </g>
          )}
        </svg>

        {/* Playful tap hint badge */}
        <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-500 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-rose-100/70 shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Ketuk Luna untuk bicara</span>
        </div>
      </motion.div>

      {/* Accessory Selector Bar */}
      {onAccessoryChange && (
        <div className="mt-3 flex items-center gap-1.5 p-1 bg-white/70 backdrop-blur-xs rounded-xl border border-rose-100 shadow-xs text-xs">
          <span className="text-[10px] font-medium text-slate-500 px-1.5">Aksesoris:</span>
          {[
            { id: 'flower', label: '🌸 Bunga' },
            { id: 'tea', label: '☕ Teh' },
            { id: 'blanket', label: '🧣 Selimut' },
            { id: 'bow', label: '🎀 Pita' },
            { id: 'sunglasses', label: '🕶️ Kacamata' }
          ].map((acc) => (
            <button
              key={acc.id}
              onClick={() => onAccessoryChange(acc.id as MascotAccessory)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                accessory === acc.id
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-rose-50'
              }`}
            >
              {acc.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
