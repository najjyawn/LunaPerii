import React from 'react';
import { motion } from 'motion/react';
import { PhaseInfo } from '../types/cycle';
import { Sparkles, Calendar, Heart } from 'lucide-react';

interface CycleDialProps {
  phaseInfo: PhaseInfo;
  onOpenLogModal: () => void;
}

export const CycleDial: React.FC<CycleDialProps> = ({ phaseInfo, onOpenLogModal }) => {
  const {
    phase,
    title,
    subtitle,
    dayInCycle,
    totalCycleDays,
    daysUntilNextPeriod,
    daysUntilOvulation
  } = phaseInfo;

  // Arc math for SVG ring
  const radius = 120;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progressRatio = Math.min(1, Math.max(0, dayInCycle / totalCycleDays));
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Current angle for indicator dot
  const currentAngle = (dayInCycle / totalCycleDays) * 360 - 90;
  const rad = (currentAngle * Math.PI) / 180;
  const dotX = 140 + (radius - strokeWidth / 2) * Math.cos(rad);
  const dotY = 140 + (radius - strokeWidth / 2) * Math.sin(rad);

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Outer Glow container */}
      <div className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] flex items-center justify-center">
        {/* SVG Cycle Ring */}
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 280 280">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="25%" stopColor="#fb923c" />
              <stop offset="55%" stopColor="#c084fc" />
              <stop offset="80%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            
            <filter id="dialShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#f43f5e" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Background Track with soft segments */}
          <circle
            cx="140"
            cy="140"
            r={normalizedRadius}
            fill="transparent"
            stroke="#fed7aa"
            strokeWidth={strokeWidth}
            className="opacity-25"
          />

          {/* Menstruation Track Segment (First ~5 days) */}
          <circle
            cx="140"
            cy="140"
            r={normalizedRadius}
            fill="transparent"
            stroke="#fda4af"
            strokeWidth={strokeWidth}
            strokeDasharray={`${(5 / totalCycleDays) * circumference} ${circumference}`}
            strokeDashoffset="0"
            className="opacity-40"
          />

          {/* Fertile & Ovulation Segment (~day 10 to 16) */}
          <circle
            cx="140"
            cy="140"
            r={normalizedRadius}
            fill="transparent"
            stroke="#d8b4fe"
            strokeWidth={strokeWidth}
            strokeDasharray={`${(6 / totalCycleDays) * circumference} ${circumference}`}
            strokeDashoffset={-((9 / totalCycleDays) * circumference)}
            className="opacity-40"
          />

          {/* Active Progress Path */}
          <motion.circle
            cx="140"
            cy="140"
            r={normalizedRadius}
            fill="transparent"
            stroke="url(#ringGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            filter="url(#dialShadow)"
          />

          {/* Current Day Pointer Dot */}
          <circle
            cx={dotX}
            cy={dotY}
            r="9"
            fill="#ffffff"
            stroke="#f43f5e"
            strokeWidth="3.5"
            className="drop-shadow-sm"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
          <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 inline" />
            {phase === 'menstrual' ? 'Sedang Haid' : 'Siklus Aktif'}
          </span>

          <div className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight font-display">
            Hari {dayInCycle}
          </div>

          <div className="text-xs text-slate-500 font-medium mt-0.5">
            dari {totalCycleDays} hari siklus
          </div>

          <div className="mt-3 px-3 py-1 rounded-full bg-white/90 border border-rose-100 shadow-xs text-xs font-semibold text-slate-700">
            {phase === 'menstrual' ? (
              <span className="text-rose-600">Fase Menstruasi</span>
            ) : daysUntilOvulation > 0 ? (
              <span className="text-purple-600">{daysUntilOvulation} hari lagi ovulasi</span>
            ) : (
              <span className="text-rose-600">{daysUntilNextPeriod} hari lagi haid</span>
            )}
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={onOpenLogModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-medium text-xs sm:text-sm shadow-md shadow-rose-200 transition-all cursor-pointer"
        >
          <Heart className="w-4 h-4 fill-white text-white" />
          <span>Catat Kondisi Hari Ini</span>
        </button>
      </div>
    </div>
  );
};
