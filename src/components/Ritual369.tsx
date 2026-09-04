import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Zap, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RotateCcw, 
  Download, 
  Target, 
  ShieldAlert, 
  Activity, 
  Radio, 
  Play, 
  Square,
  Lock,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface RitualPreset {
  id: string;
  title: string;
  tag: string;
  goal3: string;
  action6: string;
  outcome9: string;
}

const PRESETS: RitualPreset[] = [
  {
    id: 'turnus-king',
    title: 'Turnusový Kráľ (DE / AT)',
    tag: 'MONTÁŽE & CASH',
    goal3: 'Získať zákazku na montáže v Mníchove za 32 €/hod na živnosť s pevnou partiou.',
    action6: 'Každý deň odpracovať 10 hodín, držať disciplínu, žiadny chlast a šetriť kapitál.',
    outcome9: 'Čistý zisk 4 500 € mesačne, nezávislosť, vlastná dodávka a rešpekt u klientov.'
  },
  {
    id: 'usw-empire',
    title: 'U.S.W. Streetwear Drop',
    tag: 'BRAND & ULICA',
    goal3: 'Vypredať limitovaný drop 369 mikín a posunúť značku medzi top street kultúru.',
    action6: 'Natáčať surový obsah z garáže, tlačiť promo na TikToku a posielať balíky do 24h.',
    outcome9: 'Komunita 10 000 verných ľudí, kultový brand a vypredaný sklad do 48 hodín.'
  },
  {
    id: 'fleet-logistics',
    title: 'Flotila Rent a Wheel',
    tag: 'DODÁVKY & LOGISTIKA',
    goal3: 'Rozšíriť vozový park o 3 nové dodávky L3H2 a obsadiť linky SK - Nemecko.',
    action6: 'Udržiavať autá v 100% technickom stave, nonstop dispečing a spoľahliví šoféri.',
    outcome9: 'Stabilný mesačný pasívny cashflow, nulové prestoje a spokojní remeselníci.'
  },
  {
    id: 'garage-code',
    title: 'Garážový Kód 369 (Mindset)',
    tag: 'DUCHOVNÁ SILA',
    goal3: 'Prebudiť plnú mentálnu silu, prekonať strachy a prevziať 100% zodpovednosť za život.',
    action6: 'Každé ráno 3x zámer, cez deň 6x nekompromisná práca, večer 9x vďačnosť a vízia.',
    outcome9: 'Nezlomná psychika, neporaziteľná disciplína a život podľa vlastných pravidiel.'
  }
];

export default function Ritual369() {
  // Goals State
  const [goal3, setGoal3] = useState('');
  const [action6, setAction6] = useState('');
  const [outcome9, setOutcome9] = useState('');

  // Daily Repetitions State
  const [reps3, setReps3] = useState(0);
  const [reps6, setReps6] = useState(0);
  const [reps9, setReps9] = useState(0);

  // Audio frequency state
  const [isPlayingFreq, setIsPlayingFreq] = useState(false);
  const [frequency, setFrequency] = useState<369 | 639 | 963>(369);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // UI state
  const [isSealed, setIsSealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [streakDays, setStreakDays] = useState(3);
  const [activeTab, setActiveTab] = useState<'ritual' | 'matrix' | 'manifest'>('ritual');
  const [energyLevel, setEnergyLevel] = useState(100);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('usc_369_ritual_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.goal3) setGoal3(parsed.goal3);
        if (parsed.action6) setAction6(parsed.action6);
        if (parsed.outcome9) setOutcome9(parsed.outcome9);
        if (parsed.reps3) setReps3(parsed.reps3);
        if (parsed.reps6) setReps6(parsed.reps6);
        if (parsed.reps9) setReps9(parsed.reps9);
        if (parsed.isSealed) setIsSealed(parsed.isSealed);
        if (parsed.streakDays) setStreakDays(parsed.streakDays);
      } else {
        // Default preset
        setGoal3(PRESETS[0].goal3);
        setAction6(PRESETS[0].action6);
        setOutcome9(PRESETS[0].outcome9);
      }
    } catch (e) {
      console.warn('Could not load 369 data from localStorage', e);
    }
  }, []);

  // Save to localStorage
  const saveToStorage = (data: Partial<{
    goal3: string;
    action6: string;
    outcome9: string;
    reps3: number;
    reps6: number;
    reps9: number;
    isSealed: boolean;
    streakDays: number;
  }>) => {
    try {
      const current = {
        goal3: data.goal3 ?? goal3,
        action6: data.action6 ?? action6,
        outcome9: data.outcome9 ?? outcome9,
        reps3: data.reps3 ?? reps3,
        reps6: data.reps6 ?? reps6,
        reps9: data.reps9 ?? reps9,
        isSealed: data.isSealed ?? isSealed,
        streakDays: data.streakDays ?? streakDays,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('usc_369_ritual_data', JSON.stringify(current));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  };

  // Sound Synthesizer Functions
  const toggleFrequency = () => {
    if (isPlayingFreq) {
      stopAudio();
    } else {
      startAudio(frequency);
    }
  };

  const startAudio = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Smooth envelope
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
      setIsPlayingFreq(true);
    } catch (err) {
      console.error('Audio synthesis error:', err);
    }
  };

  const stopAudio = () => {
    if (oscillatorRef.current && gainNodeRef.current && audioCtxRef.current) {
      try {
        const ctx = audioCtxRef.current;
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        setTimeout(() => {
          oscillatorRef.current?.stop();
          oscillatorRef.current?.disconnect();
          oscillatorRef.current = null;
        }, 300);
      } catch (e) {
        console.warn('Stop audio err', e);
      }
    }
    setIsPlayingFreq(false);
  };

  const changeFrequency = (newFreq: 369 | 639 | 963) => {
    setFrequency(newFreq);
    if (isPlayingFreq) {
      startAudio(newFreq);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Handlers for reps
  const incrementReps = (tier: 3 | 6 | 9) => {
    if (tier === 3) {
      const next = Math.min(3, reps3 + 1);
      setReps3(next);
      saveToStorage({ reps3: next });
    } else if (tier === 6) {
      const next = Math.min(6, reps6 + 1);
      setReps6(next);
      saveToStorage({ reps6: next });
    } else if (tier === 9) {
      const next = Math.min(9, reps9 + 1);
      setReps9(next);
      saveToStorage({ reps9: next });
    }
  };

  const resetTodayReps = () => {
    setReps3(0);
    setReps6(0);
    setReps9(0);
    saveToStorage({ reps3: 0, reps6: 0, reps9: 0 });
  };

  const applyPreset = (preset: RitualPreset) => {
    setGoal3(preset.goal3);
    setAction6(preset.action6);
    setOutcome9(preset.outcome9);
    saveToStorage({
      goal3: preset.goal3,
      action6: preset.action6,
      outcome9: preset.outcome9
    });
  };

  const sealRitual = () => {
    setIsSealed(true);
    setStreakDays((prev) => prev + 1);
    saveToStorage({ isSealed: true, streakDays: streakDays + 1 });
  };

  const copyManifesto = () => {
    const text = `/// UNDERGROUND STREET COLLECTIVE ///
⚡ 369 RITUÁL ZÁMERU (GARÁŽOVÝ KÓD 369)
----------------------------------------
[3X RÁNO - ZÁMER]: ${goal3}
[6X POOBEDIE - AKCIA]: ${action6}
[9X VEČER - VÝSLEDOK]: ${outcome9}
----------------------------------------
STAV: ZAPEČATENÉ DO MATRICE 369
FREKVENCIA: ${frequency}Hz // auru.space`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const calculateCompletion = () => {
    const total = 3 + 6 + 9; // 18
    const current = reps3 + reps6 + reps9;
    return Math.round((current / total) * 100);
  };

  const completionPercent = calculateCompletion();

  return (
    <div id="ritual-369-container" className="w-full bg-black text-white border-4 border-black street-shadow-amber relative overflow-hidden font-sans">
      
      {/* Top Banner / Frequency Tape */}
      <div className="bg-amber-500 text-black px-4 py-2 border-b-2 border-black flex flex-wrap justify-between items-center gap-2 font-mono text-xs font-black uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-black animate-pulse" />
          <span>GARÁŽOVÁ METÓDA // NIKOLA TESLA X STREET HUSTLE 3-6-9</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-black text-amber-400 px-2 py-0.5 border border-black">
            DENNÝ STREAK: {streakDays} DNÍ 🔥
          </span>
          <span className="text-[11px] hidden sm:inline">FREKVENCIA: {frequency} Hz</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="p-6 md:p-8">
        
        {/* Header with Title and Mode Switcher */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b-2 border-zinc-800 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 text-amber-400 px-3 py-1 font-mono text-xs font-black uppercase mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>PODVEDOMÁ MATRICA 369</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
              369 <span className="text-amber-500 spray-tag">Ritual</span> Hub
            </h2>
            <p className="text-zinc-400 text-sm md:text-base font-bold uppercase tracking-wide mt-1">
              Zapíš svoj zámer. 3x ráno. 6x poobedie. 9x večer. Prepíš svoje podvedomie na víťazstvo.
            </p>
          </div>

          {/* Audio Synthesizer Controls */}
          <div className="bg-zinc-900 border-2 border-zinc-700 p-3 street-shadow flex flex-wrap items-center gap-3 font-mono">
            <div className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Solfeggio Vlna:</span>
            </div>

            <div className="flex gap-1.5">
              {([369, 639, 963] as const).map((hz) => (
                <button
                  key={hz}
                  onClick={() => changeFrequency(hz)}
                  className={`px-2.5 py-1 text-xs font-black border uppercase transition-all ${
                    frequency === hz 
                      ? 'bg-amber-500 text-black border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' 
                      : 'bg-black text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  {hz}Hz
                </button>
              ))}
            </div>

            <button
              onClick={toggleFrequency}
              className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 border-2 transition-all ${
                isPlayingFreq 
                  ? 'bg-red-600 text-white border-black animate-pulse' 
                  : 'bg-emerald-500 text-black border-black hover:bg-emerald-400'
              }`}
            >
              {isPlayingFreq ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isPlayingFreq ? 'Zastaviť Zvuk' : 'Aktivovať Tón'}</span>
            </button>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="mb-8">
          <div className="text-xs font-mono font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            <span>Rýchle predlohy pre tvoj street biznis & cieľ:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="text-left bg-zinc-900/90 border-2 border-zinc-800 hover:border-amber-500 p-3.5 transition-all hover:-translate-y-0.5 street-shadow group"
              >
                <div className="text-[10px] font-mono font-bold text-amber-400 mb-1">
                  {preset.tag}
                </div>
                <div className="text-sm font-black text-white group-hover:text-amber-400 uppercase">
                  {preset.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ritual Steps Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* STEP 3: RÁNO / ZÁMER */}
          <div className="bg-zinc-900 border-4 border-black p-6 street-shadow relative flex flex-col justify-between group hover:border-amber-500 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="bg-black border-2 border-amber-500 text-amber-400 font-mono text-xs font-black px-2.5 py-1">
                  FAZA 1 // RÁNO
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black text-amber-500 font-mono">3x</span>
                  <div className="text-[10px] font-mono text-zinc-500 font-bold uppercase">ZÁMER</div>
                </div>
              </div>

              <h3 className="text-xl font-black text-white uppercase mb-2">
                1. Čo chceš dosiahnuť?
              </h3>
              <p className="text-zinc-400 text-xs font-medium mb-4">
                Ráno hneď po zobudení zapíš svoju čistú intenciu. Krátko, jasne, v prítomnom čase.
              </p>

              <textarea
                value={goal3}
                onChange={(e) => {
                  setGoal3(e.target.value);
                  saveToStorage({ goal3: e.target.value });
                }}
                placeholder="Napr.: Mám uzavretú nemeckú zákazku na montáže za 30 €/hod a čistú hlavu..."
                rows={3}
                className="w-full bg-black border-2 border-zinc-700 focus:border-amber-500 p-3 text-sm text-white font-medium outline-none resize-none mb-4"
              />
            </div>

            {/* Rep Counter */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center mb-2 font-mono text-xs">
                <span className="text-zinc-400 font-bold">Ranné opakovanie:</span>
                <span className="text-amber-400 font-black">{reps3} / 3</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`h-2 flex-1 border border-black ${
                      num <= reps3 ? 'bg-amber-500' : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => incrementReps(3)}
                disabled={reps3 >= 3}
                className={`w-full mt-3 py-2 text-xs font-mono font-black uppercase border-2 transition-all ${
                  reps3 >= 3
                    ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-400 text-black border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                }`}
              >
                {reps3 >= 3 ? '✓ Ranný zámer potvrdený' : '+ Potvrdiť zámer (Ráno)'}
              </button>
            </div>
          </div>

          {/* STEP 6: POOBEDIE / AKCIA */}
          <div className="bg-zinc-900 border-4 border-black p-6 street-shadow relative flex flex-col justify-between group hover:border-red-600 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="bg-black border-2 border-red-600 text-red-500 font-mono text-xs font-black px-2.5 py-1">
                  FAZA 2 // POOBEDIE
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black text-red-600 font-mono">6x</span>
                  <div className="text-[10px] font-mono text-zinc-500 font-bold uppercase">AKCIA</div>
                </div>
              </div>

              <h3 className="text-xl font-black text-white uppercase mb-2">
                2. Aký hard hustle vykonávaš?
              </h3>
              <p className="text-zinc-400 text-xs font-medium mb-4">
                Cez deň uprostred práce pripomeň svojej hlave, aké konkrétne kroky a pot do toho dávaš.
              </p>

              <textarea
                value={action6}
                onChange={(e) => {
                  setAction6(e.target.value);
                  saveToStorage({ action6: e.target.value });
                }}
                placeholder="Napr.: Pracujem 10 hodín bez výhovoriek, volám 5 stavbám, držím čistú dodávku..."
                rows={3}
                className="w-full bg-black border-2 border-zinc-700 focus:border-red-600 p-3 text-sm text-white font-medium outline-none resize-none mb-4"
              />
            </div>

            {/* Rep Counter */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center mb-2 font-mono text-xs">
                <span className="text-zinc-400 font-bold">Poobedná akcia:</span>
                <span className="text-red-500 font-black">{reps6} / 6</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div
                    key={num}
                    className={`h-2 flex-1 border border-black ${
                      num <= reps6 ? 'bg-red-600' : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => incrementReps(6)}
                disabled={reps6 >= 6}
                className={`w-full mt-3 py-2 text-xs font-mono font-black uppercase border-2 transition-all ${
                  reps6 >= 6
                    ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-default'
                    : 'bg-red-600 hover:bg-red-500 text-white border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                }`}
              >
                {reps6 >= 6 ? '✓ Poobedný hustle splnený' : '+ Potvrdiť akciu (Poobedie)'}
              </button>
            </div>
          </div>

          {/* STEP 9: VEČER / VÝSLEDOK */}
          <div className="bg-zinc-900 border-4 border-black p-6 street-shadow relative flex flex-col justify-between group hover:border-emerald-500 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="bg-black border-2 border-emerald-500 text-emerald-400 font-mono text-xs font-black px-2.5 py-1">
                  FAZA 3 // VEČER
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black text-emerald-400 font-mono">9x</span>
                  <div className="text-[10px] font-mono text-zinc-500 font-bold uppercase">MANIFESTÁCIA</div>
                </div>
              </div>

              <h3 className="text-xl font-black text-white uppercase mb-2">
                3. Aký je pocit hotového víťazstva?
              </h3>
              <p className="text-zinc-400 text-xs font-medium mb-4">
                Pred spaním precíť pocit, že výsledok už je reálny. Vďačnosť, sloboda, rešpekt a cash.
              </p>

              <textarea
                value={outcome9}
                onChange={(e) => {
                  setOutcome9(e.target.value);
                  saveToStorage({ outcome9: e.target.value });
                }}
                placeholder="Napr.: Som hrdý na partiu, peniaze sú na účte, impérium rastie každý deň..."
                rows={3}
                className="w-full bg-black border-2 border-zinc-700 focus:border-emerald-500 p-3 text-sm text-white font-medium outline-none resize-none mb-4"
              />
            </div>

            {/* Rep Counter */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center mb-2 font-mono text-xs">
                <span className="text-zinc-400 font-bold">Večerné zapečatenie:</span>
                <span className="text-emerald-400 font-black">{reps9} / 9</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <div
                    key={num}
                    className={`h-2 flex-1 border border-black ${
                      num <= reps9 ? 'bg-emerald-500' : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => incrementReps(9)}
                disabled={reps9 >= 9}
                className={`w-full mt-3 py-2 text-xs font-mono font-black uppercase border-2 transition-all ${
                  reps9 >= 9
                    ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-default'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                }`}
              >
                {reps9 >= 9 ? '✓ Večerná manifestácia hotová' : '+ Potvrdiť víťazstvo (Večer)'}
              </button>
            </div>
          </div>

        </div>

        {/* Visual Matrix Frequency Wheel & Progress Bar */}
        <div className="bg-zinc-950 border-4 border-black p-6 street-shadow mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
            <div>
              <div className="text-xs font-mono font-bold text-amber-500 uppercase">
                // GEOMETRIA FREKVENCIE 3-6-9
              </div>
              <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                Denný Cyklus Plnenia: <span className="text-amber-400 font-mono">{completionPercent}%</span>
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={resetTodayReps}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 text-xs font-mono uppercase flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resetovať Dnešné Počítadlo</span>
              </button>

              <button
                onClick={sealRitual}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Zapečatiť do Matrice</span>
              </button>
            </div>
          </div>

          {/* Big Progress Bar */}
          <div className="w-full bg-black border-2 border-zinc-800 h-6 mb-6 p-1 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-amber-500 via-red-600 to-emerald-500"
            />
          </div>

          {/* Sacred Tesla 369 Geometric Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Visual SVG Wheel */}
            <div className="flex justify-center p-4 bg-black border-2 border-zinc-800 relative">
              <svg className="w-48 h-48" viewBox="0 0 200 200">
                {/* Outer Circle */}
                <circle cx="100" cy="100" r="85" fill="none" stroke="#27272a" strokeWidth="3" />
                
                {/* 3-6-9 Connecting Triangle */}
                <polygon 
                  points="100,25 175,145 25,145" 
                  fill="rgba(245, 158, 11, 0.1)" 
                  stroke={isPlayingFreq ? '#f59e0b' : '#52525b'} 
                  strokeWidth="2.5" 
                  strokeDasharray={isPlayingFreq ? '4,4' : 'none'}
                />

                {/* Center Core */}
                <circle cx="100" cy="100" r="14" fill="#000000" stroke="#f59e0b" strokeWidth="3" />
                <text x="100" y="104" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">369</text>

                {/* Node 3 (Top) */}
                <circle cx="100" cy="25" r="16" fill="#000000" stroke="#f59e0b" strokeWidth="3" />
                <text x="100" y="30" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="900" fontFamily="monospace">3</text>

                {/* Node 6 (Bottom Right) */}
                <circle cx="175" cy="145" r="16" fill="#000000" stroke="#dc2626" strokeWidth="3" />
                <text x="175" y="150" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="900" fontFamily="monospace">6</text>

                {/* Node 9 (Bottom Left) */}
                <circle cx="25" cy="145" r="16" fill="#000000" stroke="#10b981" strokeWidth="3" />
                <text x="25" y="150" textAnchor="middle" fill="#10b981" fontSize="14" fontWeight="900" fontFamily="monospace">9</text>
              </svg>

              {isPlayingFreq && (
                <div className="absolute inset-0 border-2 border-amber-500 pointer-events-none animate-ping opacity-25"></div>
              )}
            </div>

            {/* Tesla Philosophy Explanation */}
            <div className="md:col-span-2 space-y-3 font-mono text-xs">
              <div className="bg-black p-4 border border-zinc-800">
                <div className="text-amber-400 font-bold uppercase mb-1">
                  ⚡ Prečo Nikola Tesla a Ulica?
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  "Ak by ste poznali veľkoleposť čísel 3, 6 a 9, mali by ste kľúč k celému vesmíru."
                  V Underground Street Collective sme túto frekvenciu pretavili do tvrdej disciplíny. 
                  Myseľ (3), Telo & Práca (6) a Realizácia (9).
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={copyManifesto}
                  className="px-4 py-2.5 bg-black hover:bg-zinc-900 text-white font-mono font-bold text-xs uppercase border-2 border-zinc-700 hover:border-amber-400 flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                  <span>{copied ? 'Skopírované do schránky' : 'Skopírovať 369 Talizman'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Sealed Manifesto Card (If Sealed) */}
        {isSealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black border-4 border-amber-500 p-6 street-shadow relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="inline-block bg-amber-500 text-black px-3 py-1 font-mono text-xs font-black uppercase">
                OFICIÁLNY TALIZMAN PODVEDOMIA 369 // ZAPEČATENÉ
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">● MATRICA AKTÍVNA</span>
            </div>

            <div className="space-y-3 font-mono text-sm border-l-4 border-amber-500 pl-4 py-1">
              <div>
                <span className="text-amber-500 font-black">[3x ZÁMER]: </span>
                <span className="text-white font-bold">{goal3 || 'Nenastavené'}</span>
              </div>
              <div>
                <span className="text-red-500 font-black">[6x AKCIA]: </span>
                <span className="text-white font-bold">{action6 || 'Nenastavené'}</span>
              </div>
              <div>
                <span className="text-emerald-400 font-black">[9x VÝSLEDOK]: </span>
                <span className="text-white font-bold">{outcome9 || 'Nenastavené'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-500">
              <span>PODVEDOMIE 369 // UNDERGROUND STREET COLLECTIVE</span>
              <span>DOKÁŽEME PREDAŤ AJ ZÁKAZNÍKA SAMÉMU SEBE</span>
            </div>
          </motion.div>
        )}

      </div>

    </div>
  );
}
