import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Wind, 
  Coffee, 
  Moon, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle2,
  Smile
} from 'lucide-react';

export const SelfCareView: React.FC = () => {
  // Breathing exercise state (4-7-8 breathing)
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timerSeconds, setTimerSeconds] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            // Transition phase
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              return 7;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              return 8;
            } else {
              setBreathPhase('inhale');
              setCompletedCycles((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase]);

  const resetBreathing = () => {
    setIsBreathingActive(false);
    setBreathPhase('inhale');
    setTimerSeconds(4);
  };

  const getBreathInstructions = () => {
    switch (breathPhase) {
      case 'inhale':
        return {
          title: 'Tarik Napas Dalam',
          desc: 'Tarik napas lembut melalui hidung, rasakan perut mengembang...',
          scale: 1.35,
          color: 'bg-rose-400 text-white'
        };
      case 'hold':
        return {
          title: 'Tahan Napas',
          desc: 'Tahan dengan rileks, biarkan oksigen menenangkan otot rahim...',
          scale: 1.35,
          color: 'bg-amber-400 text-slate-900'
        };
      case 'exhale':
        return {
          title: 'Hembuskan Perlahan',
          desc: 'Lepaskan semua ketegangan dan rasa kram perlahan lewat bibir...',
          scale: 1,
          color: 'bg-teal-400 text-white'
        };
    }
  };

  const instructions = getBreathInstructions();

  return (
    <div className="space-y-6">
      {/* Interactive Breathing Exercise Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm text-center relative overflow-hidden">
        <div className="max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold mb-2">
            <Wind className="w-3.5 h-3.5" />
            <span>Relaksasi Kram Menstruasi</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-display">
            Latihan Napas 4-7-8 Bersama Luna
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Terbukti klinis membantu mengendurkan otot polos rahim, menurunkan hormon stres kortisol, dan meredakan nyeri kram.
          </p>

          {/* Animated Breathing Circle */}
          <div className="relative my-8 flex items-center justify-center">
            {/* Outer animated halo */}
            <motion.div
              animate={{
                scale: isBreathingActive ? instructions.scale : 1,
                opacity: isBreathingActive ? [0.4, 0.7, 0.4] : 0.3
              }}
              transition={{
                duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 7 : 8,
                ease: 'easeInOut'
              }}
              className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-rose-200 blur-xl pointer-events-none"
            />

            {/* Central circle */}
            <motion.div
              animate={{
                scale: isBreathingActive ? instructions.scale : 1
              }}
              transition={{
                duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 7 : 8,
                ease: 'easeInOut'
              }}
              className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-lg flex flex-col items-center justify-center transition-colors duration-700 z-10 ${
                isBreathingActive ? instructions.color : 'bg-rose-500 text-white'
              }`}
            >
              <span className="text-3xl sm:text-4xl font-extrabold font-display tabular-nums">
                {timerSeconds}s
              </span>
              <span className="text-xs font-bold uppercase tracking-wider mt-1">
                {isBreathingActive ? instructions.title : 'Mulai Napas'}
              </span>
            </motion.div>
          </div>

          <p className="text-xs font-medium text-slate-600 min-h-[36px] flex items-center justify-center">
            {isBreathingActive
              ? instructions.desc
              : 'Duduk rileks, letakkan tangan di perut bawah, lalu tekan tombol Mulai.'}
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-semibold text-sm shadow-md shadow-rose-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isBreathingActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Jeda</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Mulai Latihan</span>
                </>
              )}
            </button>

            <button
              onClick={resetBreathing}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Ulangi dari awal"
              aria-label="Ulangi latihan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {completedCycles > 0 && (
            <div className="mt-4 text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Hebat! Kamu telah menyelesaikan {completedCycles} putaran napas rileks.</span>
            </div>
          )}
        </div>
      </div>

      {/* Comfort Foods & Herbal Recipes */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 font-display mb-1 flex items-center gap-2">
          <Coffee className="w-4 h-4 text-rose-500" />
          <span>Menu & Minuman Alami Pereda Nyeri Menstruasi</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Bahan alami dapur yang kaya zat anti-radang dan magnesium
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-start gap-3">
            <span className="text-2xl shrink-0">🫚</span>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Wedang Jahe Madu Hangat</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Gingerol pada jahe bekerja setara dengan ibuprofen alami untuk meredakan prostaglandin (zat pemicu kontraksi kram rahim).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-start gap-3">
            <span className="text-2xl shrink-0">🍫</span>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Dark Chocolate 70%+</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Kaya akan magnesium dan zat besi yang membantu mengendurkan otot polos serta merangsang hormon kebahagiaan endorfin.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-start gap-3">
            <span className="text-2xl shrink-0">🍵</span>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Teh Chamomile & Peppermint</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Mengandung glisin yang melemaskan kejang otot dan mengurangi perut begah serta mual saat haid.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-3">
            <span className="text-2xl shrink-0">🍌</span>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Pisang & Kacang Almond</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Kaya vitamin B6 dan kalium untuk mencegah retensi air (perut kembung) dan menstabilkan lonjakan emosi PMS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Best Sleep & Rest Positions */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 font-display mb-1 flex items-center gap-2">
          <Moon className="w-4 h-4 text-indigo-500" />
          <span>Posisi Tidur & Peregangan Nyaman Saat Kram</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Bantu tubuh istirahat tanpa tekanan pada rongga perut
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div className="text-3xl mb-2">🛌</div>
            <h4 className="text-xs font-bold text-slate-800">Posisi Janin (Fetal)</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Meringkuk ke samping mengurangi regangan otot perut dan menjaga pembalut tetap di tempat.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div className="text-3xl mb-2">🧘‍♀️</div>
            <h4 className="text-xs font-bold text-slate-800">Child's Pose (Balasana)</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Duduk bertumpu pada lutut lalu rebahkan dada ke lantai. Sangat menenangkan punggung bawah.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div className="text-3xl mb-2">🔥</div>
            <h4 className="text-xs font-bold text-slate-800">Bantalan Hangat (Heating Pad)</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Suhu hangat 40°C di perut bawah melancarkan aliran darah dan memblokir reseptor sinyal nyeri ke otak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
