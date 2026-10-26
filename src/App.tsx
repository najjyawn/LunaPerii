import React, { useState, useEffect } from 'react';
import { 
  DailyLog, 
  PeriodCycle, 
  CycleSettings, 
  MascotAccessory 
} from './types/cycle';
import { 
  calculateCurrentPhase, 
  formatDateToISO, 
  formatIndonesianDate, 
  getInitialCycles, 
  getInitialLogs, 
  INITIAL_SETTINGS,
  parseISODate,
  addDays
} from './utils/cycleCalculations';
import { MascotLuna } from './components/MascotLuna';
import { CycleDial } from './components/CycleDial';
import { DateCarousel } from './components/DateCarousel';
import { LogModal } from './components/LogModal';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { SelfCareView } from './components/SelfCareView';
import { SettingsModal } from './components/SettingsModal';
import { 
  Heart, 
  Calendar as CalendarIcon, 
  Sparkles, 
  BarChart3, 
  Smile, 
  Settings, 
  Droplet, 
  Shield, 
  Eye, 
  EyeOff,
  Flame,
  Moon,
  Info
} from 'lucide-react';

export default function App() {
  // Navigation Tabs: 'home' | 'calendar' | 'analytics' | 'selfcare'
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'analytics' | 'selfcare'>('home');

  // Persistence State
  const [cycles, setCycles] = useState<PeriodCycle[]>(() => {
    try {
      const saved = localStorage.getItem('lunaperi_cycles');
      return saved ? JSON.parse(saved) : getInitialCycles();
    } catch {
      return getInitialCycles();
    }
  });

  const [logs, setLogs] = useState<Record<string, DailyLog>>(() => {
    try {
      const saved = localStorage.getItem('lunaperi_logs');
      return saved ? JSON.parse(saved) : getInitialLogs();
    } catch {
      return getInitialLogs();
    }
  });

  const [settings, setSettings] = useState<CycleSettings>(() => {
    try {
      const saved = localStorage.getItem('lunaperi_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Selected date for inspection & modal
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateToISO(new Date()));
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDiscreetTempOff, setIsDiscreetTempOff] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lunaperi_cycles', JSON.stringify(cycles));
    } catch (e) {
      console.error('Failed to save cycles to storage', e);
    }
  }, [cycles]);

  useEffect(() => {
    try {
      localStorage.setItem('lunaperi_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save logs to storage', e);
    }
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem('lunaperi_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to storage', e);
    }
  }, [settings]);

  // Current cycle phase calculation
  const phaseInfo = calculateCurrentPhase(cycles, settings, new Date());

  // Latest cycle start date
  const sortedCycles = [...cycles].sort(
    (a, b) => parseISODate(b.startDate).getTime() - parseISODate(a.startDate).getTime()
  );
  const latestCycle = sortedCycles[0] || { startDate: formatDateToISO(new Date()) };

  // Handlers
  const handleSaveLog = (updatedLog: DailyLog) => {
    setLogs((prev) => ({
      ...prev,
      [updatedLog.date]: updatedLog
    }));

    // If marked as period flow, ensure it reflects in cycle tracking
    if (updatedLog.isPeriod && (!latestCycle || updatedLog.date > latestCycle.startDate)) {
      // Check if this date starts a new cycle
      const lastStart = parseISODate(latestCycle.startDate);
      const logDate = parseISODate(updatedLog.date);
      const diff = Math.round((logDate.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));

      // If gap is at least 15 days, record as new cycle start
      if (diff >= 15) {
        const newCycle: PeriodCycle = {
          id: `cycle-${Date.now()}`,
          startDate: updatedLog.date,
          cycleLength: diff,
          periodLength: settings.periodLength
        };
        setCycles((prev) => [newCycle, ...prev]);
      }
    }
  };

  const handleAddPeriodStart = (date: string) => {
    const existingIndex = cycles.findIndex((c) => c.startDate === date);
    if (existingIndex >= 0) return;

    const lastStart = parseISODate(latestCycle.startDate);
    const newStart = parseISODate(date);
    const diffDays = Math.max(1, Math.round((newStart.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24)));

    const newCycle: PeriodCycle = {
      id: `cycle-${Date.now()}`,
      startDate: date,
      endDate: formatDateToISO(addDays(newStart, settings.periodLength - 1)),
      cycleLength: diffDays > 10 ? diffDays : settings.cycleLength,
      periodLength: settings.periodLength
    };

    setCycles((prev) => [newCycle, ...prev]);

    // Also mark in daily log
    setLogs((prev) => ({
      ...prev,
      [date]: {
        ...(prev[date] || {
          date,
          flow: 'medium',
          moods: ['crampy'],
          symptoms: ['cramps'],
          waterGlasses: 6
        }),
        isPeriod: true,
        flow: 'medium'
      }
    }));
  };

  const handleUpdateLatestPeriodDate = (newDate: string) => {
    if (!newDate) return;
    setCycles((prev) => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[0] = {
          ...copy[0],
          startDate: newDate,
          endDate: formatDateToISO(addDays(parseISODate(newDate), settings.periodLength - 1))
        };
      } else {
        copy.push({
          id: `cycle-${Date.now()}`,
          startDate: newDate,
          cycleLength: settings.cycleLength,
          periodLength: settings.periodLength
        });
      }
      return copy;
    });
  };

  const handleResetData = () => {
    setCycles(getInitialCycles());
    setLogs(getInitialLogs());
    setSettings(INITIAL_SETTINGS);
    setSelectedDate(formatDateToISO(new Date()));
  };

  const isDiscreetActive = settings.discreetMode && !isDiscreetTempOff;

  return (
    <div className="min-h-screen bg-rose-50/30 flex flex-col selection:bg-rose-200">
      {/* =========================================================================
          TOP BAR CONTRACT (Mandatory 3 Zones separated by gap-8)
          Zone 1: Single text element wordmark in display face
          Zone 2: 4-5 single-line clean text nav links
          Zone 3: 1 primary action
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setActiveTab('home')}
            className="text-xl font-bold tracking-tight text-rose-600 font-display whitespace-nowrap shrink-0 hover:text-rose-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-sm font-extrabold shadow-xs">
              🌸
            </span>
            <span>LunaPeri</span>
          </button>

          {/* Zone 2: 4-5 concise single-line nav links with hover underlines */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'home' ? 'text-rose-600 underline underline-offset-8 decoration-2' : ''
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'calendar' ? 'text-rose-600 underline underline-offset-8 decoration-2' : ''
              }`}
            >
              Kalender Siklus
            </button>
            <button
              onClick={() => {
                setSelectedDate(formatDateToISO(new Date()));
                setIsLogModalOpen(true);
              }}
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Catat Hari Ini
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'analytics' ? 'text-rose-600 underline underline-offset-8 decoration-2' : ''
              }`}
            >
              Analisis Siklus
            </button>
            <button
              onClick={() => setActiveTab('selfcare')}
              className={`hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'selfcare' ? 'text-rose-600 underline underline-offset-8 decoration-2' : ''
              }`}
            >
              Tips & Relaksasi
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            {settings.discreetMode && (
              <button
                onClick={() => setIsDiscreetTempOff(!isDiscreetTempOff)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-rose-50/60 transition-colors cursor-pointer"
                title={isDiscreetTempOff ? 'Kembali ke mode samaran' : 'Buka sementara tampilan'}
                aria-label="Toggle Discreet Mode"
              >
                {isDiscreetTempOff ? <Eye className="w-4 h-4 text-purple-600" /> : <EyeOff className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-rose-500" />
              <span>Pengaturan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
        {/* User Greeting Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-xs p-4 sm:p-5 rounded-3xl border border-rose-100 shadow-2xs">
          <div>
            <div className="text-xs font-bold text-rose-500 flex items-center gap-1.5 uppercase tracking-wider">
              <span>Selamat Datang</span>
              <span aria-hidden="true">·</span>
              <span>{formatIndonesianDate(formatDateToISO(new Date()))}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 font-display mt-0.5">
              Halo, {settings.userName || 'Manis'}! 👋
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Luna siap menemani dan mengingatkan setiap ritme siklus tubuhmu hari ini.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => {
                setSelectedDate(formatDateToISO(new Date()));
                setIsLogModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-semibold text-xs shadow-md shadow-rose-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Catat Gejala Hari Ini</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: BERANDA (DASHBOARD)
           ========================================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Split Grid: Interactive Mascot Luna + Animated Cycle Dial */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Mascot Card */}
              <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm flex flex-col items-center justify-between relative overflow-hidden">
                <div className="w-full flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="text-xs font-bold text-slate-700">Teman Siklusmu</span>
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    {phaseInfo.title}
                  </span>
                </div>

                <div className="my-auto py-2 w-full flex items-center justify-center">
                  <MascotLuna
                    phase={phaseInfo.phase}
                    accessory={settings.mascotAccessory}
                    onAccessoryChange={(acc) => {
                      setSettings((prev) => ({ ...prev, mascotAccessory: acc }));
                    }}
                    dayInCycle={phaseInfo.dayInCycle}
                  />
                </div>

                <div className="w-full pt-4 mt-2 border-t border-rose-50 text-center">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {phaseInfo.description}
                  </p>
                </div>
              </div>

              {/* Cycle Dial & Status Card */}
              <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm flex flex-col items-center justify-between relative">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Pelacak Putaran Siklus</span>
                  <div className="text-xs font-semibold text-rose-500">
                    {phaseInfo.subtitle}
                  </div>
                </div>

                <div className={`my-auto ${isDiscreetActive ? 'blur-md select-none' : ''}`}>
                  <CycleDial
                    phaseInfo={phaseInfo}
                    onOpenLogModal={() => {
                      setSelectedDate(formatDateToISO(new Date()));
                      setIsLogModalOpen(true);
                    }}
                  />
                </div>

                {/* 3 Quick Mini Metric Pills (Unboxed with clean typography) */}
                <div className="w-full pt-4 border-t border-rose-50 flex items-center justify-around text-center text-xs text-slate-600">
                  <div>
                    <div className="font-bold text-slate-800 tabular-nums">
                      {phaseInfo.daysUntilNextPeriod} Hari
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Menuju Haid</div>
                  </div>
                  <div className="h-6 w-px bg-slate-100" />
                  <div>
                    <div className="font-bold text-slate-800 tabular-nums">
                      {phaseInfo.daysUntilOvulation > 0 ? `${phaseInfo.daysUntilOvulation} Hari` : 'Hari Ini'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Prediksi Ovulasi</div>
                  </div>
                  <div className="h-6 w-px bg-slate-100" />
                  <div>
                    <div className="font-bold text-rose-600 capitalize">
                      {phaseInfo.energyLevel.replace('_', ' ')}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tingkat Energi</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal 11-Day Date Scroller for Rapid Check */}
            <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm">
              <DateCarousel
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setIsLogModalOpen(true);
                }}
                logs={logs}
                cycles={cycles}
                settings={settings}
              />
            </div>

            {/* Daily Wellness Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Daily Nutrition */}
              <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                    <span className="text-lg">🥗</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 font-display">
                    Saran Nutrisi Hari Ini
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {phaseInfo.phase === 'menstrual'
                      ? 'Tingkatkan asupan zat besi seperti bayam, hati ayam, dan daging merah rendah lemak untuk mengganti darah yang keluar.'
                      : phaseInfo.phase === 'ovulation'
                      ? 'Konsumsi antioksidan tinggi seperti buah beri dan kacang kenari untuk menjaga kualitas sel telur dan kilau kulit.'
                      : phaseInfo.phase === 'luteal'
                      ? 'Kurangi konsumsi garam dan kopi berlebih agar terhindar dari perut kembung dan nyeri payudara.'
                      : 'Protein nabati dan gandum utuh membantu metabolisme estrogen bekerja prima.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] font-semibold text-rose-500">
                  Disesuaikan untuk {phaseInfo.title}
                </div>
              </div>

              {/* Water Intake Quick Logger */}
              <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                    <Droplet className="w-5 h-5 fill-sky-400 text-sky-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 font-display">
                      Hidrasi Harian
                    </h3>
                    <span className="text-xs font-bold text-sky-600 tabular-nums">
                      {(logs[formatDateToISO(new Date())]?.waterGlasses || 0)} / 8 Gelas
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Menjaga tubuh terhidrasi mengurangi keparahan kram perut hingga 40%.
                  </p>

                  <div className="flex items-center gap-1.5 mt-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => {
                      const todayIso = formatDateToISO(new Date());
                      const currentGlasses = logs[todayIso]?.waterGlasses || 0;
                      const isDrank = g <= currentGlasses;
                      return (
                        <button
                          key={g}
                          onClick={() => {
                            const newCount = g === currentGlasses ? g - 1 : g;
                            setLogs((prev) => ({
                              ...prev,
                              [todayIso]: {
                                ...(prev[todayIso] || {
                                  date: todayIso,
                                  flow: 'none',
                                  moods: [],
                                  symptoms: [],
                                  waterGlasses: 0
                                }),
                                isPeriod: prev[todayIso]?.isPeriod || false,
                                waterGlasses: newCount
                              }
                            }));
                          }}
                          className={`flex-1 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            isDrank
                              ? 'bg-sky-500 text-white shadow-2xs'
                              : 'bg-sky-50 text-sky-300 hover:bg-sky-100'
                          }`}
                          title={`${g} Gelas`}
                        >
                          <Droplet className="w-3.5 h-3.5 fill-current" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] font-semibold text-sky-600">
                  Target harian: Minimal 2 Liter
                </div>
              </div>

              {/* Movement & Exercise Guide */}
              <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                    <span className="text-lg">🧘</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 font-display">
                    Aktivitas Fisik Ideal
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {phaseInfo.phase === 'menstrual'
                      ? 'Peregangan lembut, jalan santai di taman, atau yoga posisi restoratif (Child\'s pose).'
                      : phaseInfo.phase === 'ovulation'
                      ? 'Latihan kardio intensitas tinggi, HIIT, atau lari santai karena staminamu sedang berada di titik puncak!'
                      : phaseInfo.phase === 'luteal'
                      ? 'Pilates, renang ringan, dan latihan kekuatan terukur tanpa memaksakan denyut jantung terlalu tinggi.'
                      : 'Lari pagi, bersepeda santai, atau zumba bersama teman-teman.'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('selfcare')}
                  className="mt-4 pt-3 border-t border-slate-50 text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <span>Buka Latihan Napas Luna</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: KALENDER SIKLUS
           ========================================================================= */}
        {activeTab === 'calendar' && (
          <CalendarView
            cycles={cycles}
            logs={logs}
            settings={settings}
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
            onOpenLogModal={(date) => {
              setSelectedDate(date);
              setIsLogModalOpen(true);
            }}
            onAddPeriodStart={handleAddPeriodStart}
          />
        )}

        {/* =========================================================================
            TAB 3: ANALISIS SIKLUS
           ========================================================================= */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            cycles={cycles}
            logs={logs}
            settings={settings}
          />
        )}

        {/* =========================================================================
            TAB 4: TIPS & SELF-CARE
           ========================================================================= */}
        {activeTab === 'selfcare' && (
          <SelfCareView />
        )}
      </main>

      {/* =========================================================================
          FIXED MOBILE BOTTOM NAVIGATION (Pattern 1 from mobile touch reference)
          Height: 64px, touch hitboxes >= 44px
         ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-100 shadow-lg px-2">
        <div className="grid grid-cols-4 items-center h-16">
          <button
            onClick={() => setActiveTab('home')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-lg">🌸</span>
            <span className="text-[10px] tracking-tight mt-0.5">Beranda</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'calendar' ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5">Kalender</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'analytics' ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5">Analisis</span>
          </button>

          <button
            onClick={() => setActiveTab('selfcare')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'selfcare' ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5">Self-Care</span>
          </button>
        </div>
      </div>

      {/* Log Modal */}
      <LogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        date={selectedDate}
        initialLog={logs[selectedDate]}
        onSaveLog={handleSaveLog}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(s) => setSettings(s)}
        onResetData={handleResetData}
        latestPeriodDate={latestCycle.startDate}
        onUpdateLatestPeriodDate={handleUpdateLatestPeriodDate}
      />
    </div>
  );
}
