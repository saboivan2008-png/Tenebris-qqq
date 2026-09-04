import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Radio, 
  Sparkles, 
  Flame, 
  Zap, 
  Activity,
  Compass,
  Sliders,
  Shield
} from 'lucide-react';

interface MatrixStreamColumn {
  id: number;
  chars: string[];
  x: number;
  duration: number;
  delay: number;
  fontSize: number;
  opacity: number;
  colorType: 'amber' | 'emerald' | 'gold' | 'white';
}

const FREQUENCY_INFO = {
  369: {
    title: '369 Hz // Solfeggio Kód Tesla',
    desc: 'Frekvencia manifestácie, oslobodenia mysle od blokov a ranného nastavenia zámeru.',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
    tag: 'ZÁMER & MYSEĽ'
  },
  639: {
    title: '639 Hz // Harmonizácia Vzťahov & Tímu',
    desc: 'Frekvencia pevnej partie, spoľahlivosti v teréne, rešpektu a čistého obchodu.',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.4)',
    borderColor: 'border-red-500',
    textColor: 'text-red-400',
    tag: 'AKCIA & PARTIA'
  },
  963: {
    title: '963 Hz // Korunná Frekvencia Úspechu',
    desc: 'Frekvencia dosiahnutého cieľa, čistého cashflowu, slobody a nezávislosti.',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    tag: 'IMPÉRIUM & VÝSLEDOK'
  }
};

const CHAR_SET = ['3', '6', '9', '369', '639', '963', '3', '6', '9', '⚡', '∆', '369', '3', '6', '9', 'U.S.C.', '3', '6', '9'];

export default function Matrix369Visualizer() {
  const [isActive, setIsActive] = useState(false);
  const [activeFreq, setActiveFreq] = useState<369 | 639 | 963>(369);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [columns, setColumns] = useState<MatrixStreamColumn[]>([]);
  const [pulseCount, setPulseCount] = useState(0);
  const [intensity, setIntensity] = useState<'normal' | 'overdrive'>('normal');

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Generate Matrix Stream Columns
  useEffect(() => {
    const colCount = 28;
    const newCols: MatrixStreamColumn[] = [];
    const colors: ('amber' | 'emerald' | 'gold' | 'white')[] = ['amber', 'emerald', 'gold', 'white'];

    for (let i = 0; i < colCount; i++) {
      const length = Math.floor(Math.random() * 8) + 6;
      const chars: string[] = [];
      for (let j = 0; j < length; j++) {
        chars.push(CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)]);
      }

      newCols.push({
        id: i,
        chars,
        x: (i / colCount) * 100,
        duration: Math.random() * 2.5 + 1.8,
        delay: Math.random() * 2,
        fontSize: Math.floor(Math.random() * 6) + 12,
        opacity: Math.random() * 0.5 + 0.5,
        colorType: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    setColumns(newCols);
  }, []);

  // Web Audio Synth
  const startFrequency = (freq: number) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {
      console.warn('Audio start error', e);
    }
  };

  const stopFrequency = () => {
    if (oscRef.current && gainRef.current && audioCtxRef.current) {
      try {
        const ctx = audioCtxRef.current;
        gainRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
        setTimeout(() => {
          oscRef.current?.stop();
          oscRef.current?.disconnect();
          oscRef.current = null;
        }, 200);
      } catch (e) {
        console.warn('Stop audio err', e);
      }
    }
  };

  const toggleVisualizer = () => {
    if (isActive) {
      setIsActive(false);
      stopFrequency();
    } else {
      setIsActive(true);
      setPulseCount(prev => prev + 1);
      startFrequency(activeFreq);
    }
  };

  const switchFrequency = (freq: 369 | 639 | 963) => {
    setActiveFreq(freq);
    if (isActive) {
      startFrequency(freq);
    }
  };

  useEffect(() => {
    return () => {
      stopFrequency();
    };
  }, []);

  const currentInfo = FREQUENCY_INFO[activeFreq];

  return (
    <div className="w-full bg-zinc-950 border-4 border-black street-shadow-amber relative overflow-hidden font-sans my-8">
      
      {/* Top Banner Control Strip */}
      <div className="bg-black border-b-2 border-zinc-800 px-4 py-3 flex flex-wrap justify-between items-center gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></div>
          <span className="text-white font-black uppercase tracking-widest">
            369 MATRIX WAVE VISUALIZER // TESLA ENGINE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500 uppercase">STAV:</span>
          <span className={`px-2 py-0.5 font-bold uppercase border ${
            isActive 
              ? 'bg-amber-500 text-black border-black animate-pulse' 
              : 'bg-zinc-900 text-zinc-400 border-zinc-700'
          }`}>
            {isActive ? `● AKTÍVNA MATRICA (${activeFreq} Hz)` : '○ PRIPRAVENÉ NA ŠTART'}
          </span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative min-h-[380px] md:min-h-[440px] bg-black p-6 md:p-8 flex flex-col justify-between overflow-hidden">
        
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(245, 158, 11, 0.25) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* MATRIX-STYLE FALLING NUMBERS RAIN ANIMATION (FRAMER MOTION) */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 pointer-events-none overflow-hidden z-10"
            >
              {columns.map((col) => (
                <motion.div
                  key={`${col.id}-${pulseCount}`}
                  initial={{ y: '-100%', opacity: 0 }}
                  animate={{ 
                    y: ['0%', '200%'],
                    opacity: [0, col.opacity, col.opacity, 0]
                  }}
                  transition={{
                    duration: col.duration,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: col.delay
                  }}
                  style={{
                    left: `${col.x}%`,
                    fontSize: `${col.fontSize}px`,
                  }}
                  className="absolute top-0 flex flex-col items-center font-mono font-black select-none tracking-widest leading-none space-y-1"
                >
                  {col.chars.map((char, charIdx) => {
                    const isLead = charIdx === 0;
                    const isAmber = col.colorType === 'amber' || char === '369';
                    const isEmerald = col.colorType === 'emerald';

                    return (
                      <motion.span
                        key={charIdx}
                        animate={{
                          opacity: isLead ? [1, 0.7, 1] : [0.3, 0.9, 0.4],
                          scale: isLead ? [1, 1.15, 1] : 1
                        }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        style={{
                          color: isLead 
                            ? '#ffffff' 
                            : activeFreq === 369 
                              ? (isAmber ? '#fbbf24' : '#f59e0b') 
                              : activeFreq === 639 
                                ? '#ef4444' 
                                : '#10b981',
                          textShadow: isLead 
                            ? `0 0 10px #ffffff, 0 0 20px ${currentInfo.glow}` 
                            : `0 0 8px ${currentInfo.glow}`
                        }}
                      >
                        {char}
                      </motion.span>
                    );
                  })}
                </motion.div>
              ))}

              {/* Pulsing Concentric Energy Rings when Active */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.3, 1.8],
                  opacity: [0.6, 0.25, 0]
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border-2 border-amber-500/40 pointer-events-none"
              />

              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: [0.5, 1.1, 1.5],
                  opacity: [0.8, 0.3, 0]
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 0.8
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-red-500/30 pointer-events-none"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Stage & Tesla Sacred Geometry HUD */}
        <div className="relative z-20 flex flex-col md:flex-row items-center justify-between gap-8 my-auto py-4">
          
          {/* Left Info Column */}
          <div className="max-w-md space-y-3 text-center md:text-left">
            <motion.div 
              layout
              className="inline-flex items-center gap-2 bg-zinc-900/90 border border-zinc-700 px-3 py-1 font-mono text-xs font-black uppercase backdrop-blur-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span className={currentInfo.textColor}>{currentInfo.tag}</span>
            </motion.div>

            <motion.h3 
              layout
              className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white"
            >
              {currentInfo.title}
            </motion.h3>

            <p className="text-zinc-300 text-xs md:text-sm font-medium leading-relaxed">
              {currentInfo.desc}
            </p>

            {/* Audio Spectrum Visualizer Bars (Framer Motion) */}
            <div className="pt-2">
              <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-amber-500" />
                <span>Oscilačné spektrum frekvencie:</span>
              </div>

              <div className="flex items-end gap-1.5 h-8">
                {[12, 28, 45, 68, 92, 54, 78, 38, 85, 60, 30, 48, 90, 65, 35, 75, 40, 20].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: isActive ? [`${Math.max(10, h * 0.3)}%`, `${h}%`, `${Math.max(15, h * 0.6)}%`] : '15%',
                      backgroundColor: isActive 
                        ? (i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#ef4444' : '#10b981')
                        : '#3f3f46'
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      delay: i * 0.04
                    }}
                    className="w-2 rounded-t-sm"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Central Animated Tesla Triangle HUD */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{
                rotate: isActive ? 360 : 0
              }}
              transition={{
                duration: isActive ? 30 : 0,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="w-52 h-52 md:w-60 md:h-60 relative flex items-center justify-center"
            >
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {/* Outer Ring with Segments */}
                <circle cx="100" cy="100" r="90" fill="none" stroke="#27272a" strokeWidth="2" strokeDasharray="6,4" />
                <circle cx="100" cy="100" r="75" fill="none" stroke={isActive ? currentInfo.color : '#3f3f46'} strokeWidth="1.5" />

                {/* Tesla 3-6-9 Triangle */}
                <polygon 
                  points="100,25 175,145 25,145" 
                  fill={isActive ? 'rgba(245, 158, 11, 0.08)' : 'none'} 
                  stroke={isActive ? currentInfo.color : '#52525b'} 
                  strokeWidth="2.5" 
                />

                {/* Inner Connecting Lines */}
                <line x1="100" y1="100" x2="100" y2="25" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="100" y1="100" x2="175" y2="145" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="100" y1="100" x2="25" y2="145" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3,3" />
              </svg>
            </motion.div>

            {/* Static Interactive Center Node / Start Button Trigger */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleVisualizer}
                className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-mono font-black uppercase transition-all shadow-[0_0_25px_rgba(0,0,0,0.8)] ${
                  isActive 
                    ? 'bg-red-600 border-white text-white animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.6)]' 
                    : 'bg-amber-500 hover:bg-amber-400 border-black text-black shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                }`}
              >
                {isActive ? (
                  <>
                    <Square className="w-6 h-6 mb-1" />
                    <span className="text-[10px]">STOP</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mb-1 fill-black ml-0.5" />
                    <span className="text-[10px]">ŠTART 369</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Number Pins 3, 6, 9 around Circle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black border-2 border-amber-500 text-amber-400 font-mono font-black text-xs w-7 h-7 rounded-full flex items-center justify-center">
              3
            </div>
            <div className="absolute bottom-2 right-2 bg-black border-2 border-red-600 text-red-500 font-mono font-black text-xs w-7 h-7 rounded-full flex items-center justify-center">
              6
            </div>
            <div className="absolute bottom-2 left-2 bg-black border-2 border-emerald-500 text-emerald-400 font-mono font-black text-xs w-7 h-7 rounded-full flex items-center justify-center">
              9
            </div>

          </div>

        </div>

        {/* Bottom Control Bar */}
        <div className="relative z-20 pt-6 border-t-2 border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Frequency Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="text-xs font-bold text-zinc-400 uppercase mr-1">
              Frekvencia:
            </span>

            {([369, 639, 963] as const).map((hz) => (
              <button
                key={hz}
                onClick={() => switchFrequency(hz)}
                className={`px-3.5 py-1.5 text-xs font-black uppercase border-2 transition-all ${
                  activeFreq === hz 
                    ? 'bg-amber-500 text-black border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' 
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700'
                }`}
              >
                {hz} Hz
              </button>
            ))}
          </div>

          {/* Sound Toggle and Intensity */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 border flex items-center gap-1.5 uppercase font-bold transition-all ${
                soundEnabled 
                  ? 'bg-zinc-900 text-emerald-400 border-zinc-700' 
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'Zvuk Zapnutý' : 'Zvuk Stíšený'}</span>
            </button>

            <button
              onClick={toggleVisualizer}
              className={`px-5 py-2 font-mono font-black uppercase text-xs border-2 transition-all ${
                isActive 
                  ? 'bg-red-600 hover:bg-red-700 text-white border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]' 
                  : 'bg-amber-500 hover:bg-amber-400 text-black border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]'
              }`}
            >
              {isActive ? 'Zastaviť Matrix Dážď' : '⚡ Spustiť Matrix 369 Vykresľovanie'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
