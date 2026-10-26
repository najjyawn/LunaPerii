import { 
  CyclePhase, 
  CycleSettings, 
  DailyLog, 
  PeriodCycle, 
  PhaseInfo 
} from '../types/cycle';

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(isoString: string): Date {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // noon to avoid timezone daylight shifts
}

export function getDaysDiff(d1: Date, d2: Date): number {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
  return Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const INDONESIAN_DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function formatIndonesianDate(isoString: string, includeYear = true): string {
  const date = parseISODate(isoString);
  const day = date.getDate();
  const month = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return includeYear ? `${day} ${month} ${year}` : `${day} ${month}`;
}

export function formatShortDate(isoString: string): string {
  const date = parseISODate(isoString);
  const day = date.getDate();
  const month = INDONESIAN_MONTHS[date.getMonth()].slice(0, 3);
  return `${day} ${month}`;
}

/**
 * Calculates current cycle information based on last period start date and user settings
 */
export function calculateCurrentPhase(
  cycles: PeriodCycle[],
  settings: CycleSettings,
  targetDate: Date = new Date()
): PhaseInfo {
  // Sort cycles by startDate desc
  const sortedCycles = [...cycles].sort((a, b) => 
    parseISODate(b.startDate).getTime() - parseISODate(a.startDate).getTime()
  );

  const lastCycle = sortedCycles[0];
  const lastStart = lastCycle ? parseISODate(lastCycle.startDate) : addDays(targetDate, -14);
  const cycleLen = settings.cycleLength || 28;
  const periodLen = settings.periodLength || 5;
  const lutealLen = settings.lutealLength || 14;

  const diffDays = getDaysDiff(lastStart, targetDate);
  const cycleDay = (diffDays >= 0 ? (diffDays % cycleLen) : ((diffDays % cycleLen) + cycleLen)) + 1;
  const daysUntilNext = cycleLen - cycleDay + 1;

  // Ovulation typically occurs (cycleLength - lutealLength) days into the cycle
  const ovulationDay = Math.max(1, cycleLen - lutealLen);
  const fertileStart = Math.max(1, ovulationDay - 5);
  const fertileEnd = Math.min(cycleLen, ovulationDay + 1);

  const daysUntilOvulation = ovulationDay - cycleDay;

  let phase: CyclePhase = 'follicular';
  let title = 'Fase Folikular';
  let subtitle = 'Energi sedang meningkat pesat ✨';
  let energyLevel: PhaseInfo['energyLevel'] = 'rising';
  let description = 'Kadar hormon estrogenmu mulai meningkat. Waktu terbaik untuk memulai rencana baru, berolahraga, dan berkarya!';
  let mascotSpeech = 'Hai manis! Tubuhmu sedang bersiap dengan energi segar. Yuk minum air putih & raih harimu!';
  let colorBg = 'bg-amber-50/80';
  let colorBorder = 'border-amber-200';
  let colorAccent = 'text-amber-700';

  if (cycleDay <= periodLen) {
    phase = 'menstrual';
    title = 'Fase Menstruasi (Haid)';
    subtitle = `Hari ke-${cycleDay} Haid 🩸`;
    energyLevel = 'low';
    description = 'Dinding rahim sedang meluruh. Wajar jika merasa lelah atau kram. Luangkan waktu untuk istirahat dan kompres hangat.';
    mascotSpeech = cycleDay === 1 
      ? 'Peluk hangat untukmu! Hari pertama butuh istirahat ekstra dan camilan hangat ya.'
      : 'Jangan lupa ganti pembalut teratur dan minum banyak air hangat ya, sayang!';
    colorBg = 'bg-rose-50/80';
    colorBorder = 'border-rose-200';
    colorAccent = 'text-rose-700';
  } else if (cycleDay === ovulationDay) {
    phase = 'ovulation';
    title = 'Puncak Ovulasi';
    subtitle = 'Puncak Kesuburan & Hormon Bahagia 🌸';
    energyLevel = 'peak';
    description = 'Sel telur dilepaskan hari ini! Peluang kehamilan berada di titik tertinggi. Kulit cerah dan rasa percaya diri memuncak.';
    mascotSpeech = 'Wah, kamu glowing sekali hari ini! Mood dan energimu lagi di puncak terbaik!';
    colorBg = 'bg-purple-50/80';
    colorBorder = 'border-purple-200';
    colorAccent = 'text-purple-700';
  } else if (cycleDay >= fertileStart && cycleDay <= fertileEnd) {
    phase = 'fertile';
    title = 'Jendela Masa Subur';
    subtitle = 'Peluang Kehamilan Tinggi 🌱';
    energyLevel = 'peak';
    description = 'Tubuh memproduksi hormon LH. Libido dan stamina meningkat. Waktu utama jika sedang merencanakan kehamilan.';
    mascotSpeech = 'Masa suburmu sedang berlangsung! Tubuhmu memancarkan pesona luar biasa ✨';
    colorBg = 'bg-violet-50/80';
    colorBorder = 'border-violet-200';
    colorAccent = 'text-violet-700';
  } else if (cycleDay > ovulationDay) {
    phase = 'luteal';
    title = 'Fase Luteal (Pra-Menstruasi)';
    subtitle = 'Fase Santai & Waspada PMS 🛋️';
    energyLevel = 'winding_down';
    description = 'Hormon progesteron mendominasi. Mungkin timbul rasa ngidam makanan manis, kembung, atau sensitif. Bersikaplah lembut pada diri sendiri.';
    mascotSpeech = 'Waktunya self-care! Jangan memaksakan diri kalau lagi cranky, cokelat dan teh herbal selalu menanti.';
    colorBg = 'bg-orange-50/80';
    colorBorder = 'border-orange-200';
    colorAccent = 'text-orange-700';
  }

  return {
    phase,
    title,
    subtitle,
    dayInCycle: cycleDay,
    totalCycleDays: cycleLen,
    daysUntilNextPeriod: daysUntilNext,
    daysUntilOvulation,
    energyLevel,
    description,
    mascotSpeech,
    colorBg,
    colorBorder,
    colorAccent
  };
}

/**
 * Predicts next cycles for calendar & planning
 */
export function predictUpcomingCycles(
  lastCycleStart: string,
  cycleLength: number,
  periodLength: number,
  lutealLength = 14,
  count = 6
) {
  const predictions = [];
  let currentStart = parseISODate(lastCycleStart);

  for (let i = 1; i <= count; i++) {
    const nextStart = addDays(currentStart, cycleLength * i);
    const nextEnd = addDays(nextStart, periodLength - 1);
    const ovulationDate = addDays(nextStart, cycleLength - lutealLength);
    const fertileStart = addDays(ovulationDate, -5);
    const fertileEnd = addDays(ovulationDate, 1);

    predictions.push({
      cycleIndex: i,
      startDate: formatDateToISO(nextStart),
      endDate: formatDateToISO(nextEnd),
      ovulationDate: formatDateToISO(ovulationDate),
      fertileStart: formatDateToISO(fertileStart),
      fertileEnd: formatDateToISO(fertileEnd)
    });
  }

  return predictions;
}

/**
 * Mascot dialogue variations based on user click
 */
export const MASCOT_DIALOGUES: Record<CyclePhase, string[]> = {
  menstrual: [
    'Kamu hebat banget sudah melalui hari ini! Jangan lupa kompres perut hangat ya.',
    'Pijat lembut pinggang bawah atau rebahan posisi janin bisa redakan kram lho.',
    'Tubuhmu lagi bekerja keras membersihkan diri. Beri dirimu pelukan dan istirahat.',
    'Udah ganti pembalut belum, manis? Jaga kebersihan area intim tetap kering ya!',
    'Air putih hangat + teh jahe itu sahabat terbaik hari ini ☕'
  ],
  follicular: [
    'Energi baru! Hari yang pas buat jalan pagi atau mulai hobi baru!',
    'Estrogenmu lagi naik, konsentrasi dan ide-ide kreatif bakal lancar banget ✨',
    'Yuk coba resep masakan sehat hari ini! Sayuran hijau bagus banget di fase ini.',
    'Senyummu manis sekali hari ini! Ayo melangkah dengan percaya diri.',
    'Latihan kardio ringan bakal bikin badanmu makin bugar!'
  ],
  fertile: [
    'Kulit lagi glowing ya? Itu karena hormon estrogen lagi di level optimal!',
    'Jendela masa subur sedang aktif. Cocok dicatat jika sedang program hamil.',
    'Stamina lagi prima! Manfaatkan energi ini untuk menyelesaikan target mingguanmu.',
    'Tubuh wanita itu ajaib sekali! Rasakan sinyal alamiah tubuhmu hari ini.'
  ],
  ovulation: [
    'Hari Ovulasi! Bunga-bunga bermekaran, pesonamu juga lagi memancar maksimal 🌸',
    'Peluang hamil tertinggi dalam sebulan terjadi tepat di hari-hari ini.',
    'Kamu terlihat sangat bersemangat dan menawan hari ini!',
    'Cairan serviks seperti putih telur adalah tanda ovulasi yang sangat sehat.'
  ],
  luteal: [
    'Mau cokelat hitam? Progesteron lagi bikin selera makan meningkat nih 🍫',
    'Kalau tiba-tiba pengen nangis atau baper, ingat ya itu efek hormon PMS. It will pass!',
    'Luangkan waktu 15 menit buat me-time atau dengerin lagu tenang sebelum tidur.',
    'Batasi garam dan kafein berlebih biar kembung dan nyeri payudara berkurang ya.',
    'Tidur cukup 7-8 jam sangat membantu menstabilkan emosi hari ini 🌙'
  ]
};

/**
 * Initial sample data
 */
export const INITIAL_SETTINGS: CycleSettings = {
  userName: 'Bella',
  cycleLength: 28,
  periodLength: 5,
  lutealLength: 14,
  mascotAccessory: 'flower',
  discreetMode: false
};

export function getInitialCycles(): PeriodCycle[] {
  const today = new Date();
  // Set last cycle start to 11 days ago so today is Day 12 (Follicular/Approaching fertile)
  const lastCycleStart = addDays(today, -11);
  const cycle2Start = addDays(lastCycleStart, -28);
  const cycle3Start = addDays(cycle2Start, -29);

  return [
    {
      id: 'cycle-1',
      startDate: formatDateToISO(lastCycleStart),
      endDate: formatDateToISO(addDays(lastCycleStart, 4)),
      cycleLength: 28,
      periodLength: 5
    },
    {
      id: 'cycle-2',
      startDate: formatDateToISO(cycle2Start),
      endDate: formatDateToISO(addDays(cycle2Start, 4)),
      cycleLength: 28,
      periodLength: 5
    },
    {
      id: 'cycle-3',
      startDate: formatDateToISO(cycle3Start),
      endDate: formatDateToISO(addDays(cycle3Start, 5)),
      cycleLength: 29,
      periodLength: 6
    }
  ];
}

export function getInitialLogs(): Record<string, DailyLog> {
  const today = new Date();
  const logs: Record<string, DailyLog> = {};

  // Period days for cycle-1 (11 days ago for 5 days)
  const cycle1Start = addDays(today, -11);
  
  const flows: ('heavy' | 'medium' | 'light' | 'spotting')[] = ['heavy', 'heavy', 'medium', 'light', 'spotting'];
  flows.forEach((flow, i) => {
    const dStr = formatDateToISO(addDays(cycle1Start, i));
    logs[dStr] = {
      date: dStr,
      isPeriod: true,
      flow,
      moods: i < 2 ? ['crampy', 'tired', 'sensitive'] : ['calm'],
      symptoms: i < 2 ? ['cramps', 'backache'] : ['fatigue'],
      waterGlasses: 7,
      notes: i === 0 ? 'Hari pertama, kram agak terasa di siang hari.' : 'Mulai berkurang dan membaik.'
    };
  });

  // Today log
  const todayStr = formatDateToISO(today);
  logs[todayStr] = {
    date: todayStr,
    isPeriod: false,
    flow: 'none',
    moods: ['happy', 'energetic'],
    symptoms: [],
    mucus: 'watery',
    waterGlasses: 5,
    notes: 'Merasa segar dan bersemangat hari ini!'
  };

  return logs;
}
