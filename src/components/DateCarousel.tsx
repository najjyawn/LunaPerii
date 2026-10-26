import React from 'react';
import { 
  addDays, 
  formatDateToISO, 
  INDONESIAN_DAYS_SHORT 
} from '../utils/cycleCalculations';
import { DailyLog, PeriodCycle, CycleSettings } from '../types/cycle';
import { Droplet, Heart, Sparkles } from 'lucide-react';

interface DateCarouselProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  logs: Record<string, DailyLog>;
  cycles: PeriodCycle[];
  settings: CycleSettings;
}

export const DateCarousel: React.FC<DateCarouselProps> = ({
  selectedDate,
  onSelectDate,
  logs,
  cycles,
  settings
}) => {
  // Generate 11 days (5 days back, today, 5 days forward)
  const today = new Date();
  const days = [];
  for (let i = -5; i <= 5; i++) {
    const d = addDays(today, i);
    days.push(d);
  }

  const todayISO = formatDateToISO(today);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-slate-700">Pilih Tanggal</span>
        <button
          onClick={() => onSelectDate(todayISO)}
          className="text-[11px] font-medium text-rose-600 hover:text-rose-700 hover:underline"
        >
          Hari Ini
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {days.map((dateObj) => {
          const iso = formatDateToISO(dateObj);
          const isSelected = selectedDate === iso;
          const isToday = todayISO === iso;
          const dayName = INDONESIAN_DAYS_SHORT[dateObj.getDay()];
          const dateNum = dateObj.getDate();
          const log = logs[iso];
          const hasPeriod = log?.isPeriod || (log?.flow && log.flow !== 'none');
          const hasSymptoms = log && ((log.moods?.length > 0) || (log.symptoms?.length > 0));

          return (
            <button
              key={iso}
              onClick={() => onSelectDate(iso)}
              className={`flex flex-col items-center justify-center min-w-[50px] py-2.5 px-1.5 rounded-2xl transition-all cursor-pointer relative shrink-0 ${
                isSelected
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200 scale-105'
                  : isToday
                  ? 'bg-white border-2 border-rose-300 text-rose-600'
                  : 'bg-white/80 hover:bg-white border border-rose-100/60 text-slate-700'
              }`}
            >
              {/* Day name */}
              <span
                className={`text-[10px] uppercase font-semibold ${
                  isSelected ? 'text-rose-100' : 'text-slate-400'
                }`}
              >
                {dayName}
              </span>

              {/* Day number */}
              <span className="text-base font-bold my-0.5">{dateNum}</span>

              {/* Status indicators */}
              <div className="flex items-center gap-1 mt-1 h-2">
                {hasPeriod && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-rose-500'
                    }`}
                    title="Haid tercatat"
                  />
                )}
                {hasSymptoms && !hasPeriod && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-amber-200' : 'bg-amber-400'
                    }`}
                    title="Gejala dicatat"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
