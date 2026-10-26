export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type MoodType = 
  | 'happy' 
  | 'calm' 
  | 'sensitive' 
  | 'tired' 
  | 'irritated' 
  | 'crampy' 
  | 'anxious' 
  | 'energetic' 
  | 'loving';

export type SymptomType = 
  | 'cramps' 
  | 'headache' 
  | 'bloating' 
  | 'breast_tenderness' 
  | 'acne' 
  | 'backache' 
  | 'cravings' 
  | 'insomnia' 
  | 'nausea'
  | 'fatigue';

export type MucusType = 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white';

export interface DailyLog {
  date: string; // YYYY-MM-DD
  isPeriod: boolean;
  flow: FlowIntensity;
  moods: MoodType[];
  symptoms: SymptomType[];
  mucus?: MucusType;
  waterGlasses: number; // 0 - 12
  hadSex?: boolean;
  tookPill?: boolean;
  notes?: string;
  temperature?: number; // °C, e.g. 36.5
}

export interface PeriodCycle {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  cycleLength: number; // in days
  periodLength: number; // in days
}

export type CyclePhase = 'menstrual' | 'follicular' | 'fertile' | 'ovulation' | 'luteal';

export type MascotAccessory = 'none' | 'flower' | 'tea' | 'blanket' | 'bow' | 'sunglasses';

export interface CycleSettings {
  userName: string;
  cycleLength: number; // default 28
  periodLength: number; // default 5
  lutealLength: number; // default 14
  mascotAccessory: MascotAccessory;
  discreetMode: boolean;
}

export interface PhaseInfo {
  phase: CyclePhase;
  title: string;
  subtitle: string;
  dayInCycle: number;
  totalCycleDays: number;
  daysUntilNextPeriod: number;
  daysUntilOvulation: number;
  energyLevel: 'low' | 'rising' | 'peak' | 'winding_down';
  description: string;
  mascotSpeech: string;
  colorBg: string;
  colorBorder: string;
  colorAccent: string;
}
