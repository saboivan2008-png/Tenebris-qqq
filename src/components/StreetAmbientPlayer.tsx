import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Radio, 
  Sliders, 
  Flame, 
  Activity, 
  X, 
  Sparkles,
  Zap,
  Disc
} from 'lucide-react';

export type AmbientMode = 'garage369' | 'highway' | 'industrial';

interface AmbientProfile {
  id: AmbientMode;
  name: string;
  tagline: string;
  subFreq: number;
  harmonicFreq: number;
  lfoRate: number;
  crackleLevel: number;
  pulseBpm: number;
  color: string;
  accentClass: string;
}

const PROFILES: Record<AmbientMode, AmbientProfile> = {
  garage369: {
    id: 'garage369',
    name: 'Garáž 369 // Deep Sub-Bass',
    tagline: 'Tmavá podzemná rezonancia, 369 Hz harmonická vlna a teplo analógovej pásky',
    subFreq: 55, // A1
    harmonicFreq: 369, // Tesla Solfeggio
    lfoRate: 0.18,
    crackleLevel: 0.08,
    pulseBpm: 60,
    color: '#f59e0b',
    accentClass: 'border-amber-500 text-amber-400'
  },
  highway: {
    id: 'highway',
    name: 'Nočná Linka // Highway L3H2',
    tagline: 'Hlboký asfaltový hukot, diaľnica SK-DE a nočný flow state za volantom',
    subFreq: 43.65, // F0
    harmonicFreq: 174,
    lfoRate: 0.28,
    crackleLevel: 0.12,
    pulseBpm: 72,
    color: '#ef4444',
    accentClass: 'border-red-500 text-red-400'
  },
  industrial: {
    id: 'industrial',
    name: 'Industriál // Montážny Fokus',
    tagline: 'Kovový dozvuk hál, sub-rezonancia 639 Hz a nekompromisná koncentrácia',
    subFreq: 65.4, // C2
    harmonicFreq: 639,
    lfoRate: 0.12,
    crackleLevel: 0.05,
    pulseBpm: 50,
    color: '#10b981',
    accentClass: 'border-emerald-500 text-emerald-400'
  }
};

export default function StreetAmbientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMode, setActiveMode] = useState<AmbientMode>('garage369');
  const [volume, setVolume] = useState(0.5);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showPromptBanner, setShowPromptBanner] = useState(true);

  // Web Audio Context & Nodes Refs
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const subOscRef = useRef<OscillatorNode | null>(null);
  const harmOscRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const pulseIntervalRef = useRef<number | null>(null);

  // Generate pink noise / tape crackle buffer
  const createNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
      // Random subtle tape click
      if (Math.random() < 0.001) {
        output[i] += (Math.random() - 0.5) * 0.2;
      }
    }
    return buffer;
  };

  const startAudioEngine = (modeId = activeMode, targetVol = volume) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!ctxRef.current) {
        ctxRef.current = new AudioCtx();
      }

      if (ctxRef.current.state === 'suspended') {
        ctxRef.current.resume();
      }

      // Stop previous nodes if running
      stopAudioEngine(false);

      const ctx = ctxRef.current;
      const profile = PROFILES[modeId];

      // 1. Master Output Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, targetVol * 0.35), ctx.currentTime + 1.2);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // 2. Low-Pass Resonant Filter (Underground Garage Acoustic)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, ctx.currentTime);
      filter.Q.setValueAtTime(4.5, ctx.currentTime);
      filter.connect(masterGain);
      filterRef.current = filter;

      // 3. LFO Sweeper for the Filter (Atmospheric movement)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(profile.lfoRate, ctx.currentTime);
      lfoGain.gain.setValueAtTime(120, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      lfoRef.current = lfo;

      // 4. Sub-Bass Drone Oscillator
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(profile.subFreq, ctx.currentTime);
      subGain.gain.setValueAtTime(0.45, ctx.currentTime);
      subOsc.connect(subGain);
      subGain.connect(filter);
      subOsc.start();
      subOscRef.current = subOsc;

      // 5. Solfeggio / Harmonic Undertone Oscillator
      const harmOsc = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harmOsc.type = 'sine';
      harmOsc.frequency.setValueAtTime(profile.harmonicFreq, ctx.currentTime);
      harmGain.gain.setValueAtTime(0.12, ctx.currentTime);
      harmOsc.connect(harmGain);
      harmGain.connect(filter);
      harmOsc.start();
      harmOscRef.current = harmOsc;

      // 6. Vinyl & Tape Noise Stream
      const noiseBuffer = createNoiseBuffer(ctx);
      const noiseSource = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      const noiseFilter = ctx.createBiquadFilter();

      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1200, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1.2, ctx.currentTime);

      noiseGain.gain.setValueAtTime(profile.crackleLevel * 0.4, ctx.currentTime);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start();

      noiseNodeRef.current = noiseSource;
      noiseGainRef.current = noiseGain;

      // 7. Rhythmic Ambient Pulse (Heartbeat / Sub Kicker)
      const beatIntervalMs = (60 / profile.pulseBpm) * 1000;
      pulseIntervalRef.current = window.setInterval(() => {
        if (!ctxRef.current || ctxRef.current.state !== 'running') return;
        try {
          const kickTime = ctxRef.current.currentTime;
          const kickOsc = ctxRef.current.createOscillator();
          const kickGain = ctxRef.current.createGain();

          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(75, kickTime);
          kickOsc.frequency.exponentialRampToValueAtTime(28, kickTime + 0.35);

          kickGain.gain.setValueAtTime(0.35 * targetVol, kickTime);
          kickGain.gain.exponentialRampToValueAtTime(0.0001, kickTime + 0.4);

          kickOsc.connect(kickGain);
          kickGain.connect(masterGain);

          kickOsc.start(kickTime);
          kickOsc.stop(kickTime + 0.42);
        } catch (err) {}
      }, beatIntervalMs);

      setIsPlaying(true);
      setHasInteracted(true);
      setShowPromptBanner(false);
    } catch (e) {
      console.warn('Audio Engine Start Error:', e);
    }
  };

  const stopAudioEngine = (updateState = true) => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }

    if (masterGainRef.current && ctxRef.current) {
      try {
        const now = ctxRef.current.currentTime;
        masterGainRef.current.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      } catch (e) {}
    }

    setTimeout(() => {
      try {
        subOscRef.current?.stop();
        subOscRef.current?.disconnect();
        subOscRef.current = null;

        harmOscRef.current?.stop();
        harmOscRef.current?.disconnect();
        harmOscRef.current = null;

        lfoRef.current?.stop();
        lfoRef.current?.disconnect();
        lfoRef.current = null;

        noiseNodeRef.current?.stop();
        noiseNodeRef.current?.disconnect();
        noiseNodeRef.current = null;
      } catch (e) {}
    }, 450);

    if (updateState) {
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopAudioEngine(true);
    } else {
      startAudioEngine(activeMode, volume);
    }
  };

  const changeMode = (newMode: AmbientMode) => {
    setActiveMode(newMode);
    if (isPlaying) {
      startAudioEngine(newMode, volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (masterGainRef.current && ctxRef.current) {
      try {
        masterGainRef.current.gain.setValueAtTime(Math.max(0.0001, newVol * 0.35), ctxRef.current.currentTime);
      } catch (e) {}
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioEngine(false);
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const currentProfile = PROFILES[activeMode];

  return (
    <>
      {/* 1. INITIAL USER INTERACTION PROMPT BAR (Fixed Sub-Banner on Hero) */}
      <AnimatePresence>
        {!hasInteracted && showPromptBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40"
          >
            <div className="bg-zinc-950/95 border-3 border-black street-shadow-amber p-4 backdrop-blur-md font-mono text-xs flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-white font-black uppercase tracking-wider">
                    UNDERGROUND AMBIENT ENGINE
                  </span>
                </div>
                <button
                  onClick={() => setShowPromptBanner(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-zinc-300 text-[11px] leading-relaxed">
                Spustiť autentický podzemný zvukový podklad (369 Hz rezonancia, analog sub-bass, garážová atmosféra) pre hlboký street fokus?
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => startAudioEngine('garage369', 0.5)}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs border border-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Zapnúť Ambient (369 Hz)</span>
                </button>
                <button
                  onClick={() => setShowPromptBanner(false)}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold border border-zinc-700"
                >
                  Neskôr
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FLOATING AMBIENT DOCK CONTROLLER (Always accessible) */}
      <div className="fixed bottom-6 right-6 z-40 font-mono text-xs">
        <AnimatePresence>
          {isExpanded ? (
            /* EXPANDED CONTROL PANEL */
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-zinc-950 border-3 border-black street-shadow-amber w-[320px] sm:w-[360px] p-4 backdrop-blur-md mb-3"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Radio className={`w-4 h-4 ${isPlaying ? 'text-amber-400 animate-spin' : 'text-zinc-500'}`} />
                  <span className="font-black uppercase text-white tracking-wider text-[11px]">
                    STREET AMBIENT ENGINE
                  </span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-zinc-500 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Active Sound Profile Info */}
              <div className="bg-black border border-zinc-800 p-3 mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-zinc-500 uppercase">AKTUÁLNA SCÉNA:</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 text-amber-400 uppercase">
                    {isPlaying ? '● LIVE STREAM' : '○ PAUZA'}
                  </span>
                </div>
                <div className="font-black text-sm text-white uppercase">{currentProfile.name}</div>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">{currentProfile.tagline}</p>
              </div>

              {/* Mode Selectors */}
              <div className="space-y-1.5 mb-3">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Vybrať Atmosféru:</div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  {(Object.keys(PROFILES) as AmbientMode[]).map((modeKey) => {
                    const prof = PROFILES[modeKey];
                    const isSelected = activeMode === modeKey;
                    return (
                      <button
                        key={modeKey}
                        onClick={() => changeMode(modeKey)}
                        className={`p-2 font-bold uppercase border text-center transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-black border-black font-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        {modeKey === 'garage369' ? 'Garáž 369' : modeKey === 'highway' ? 'Diaľnica' : 'Industriál'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Volume Slider & Playback Control */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Hlasitosť atmosféry:</span>
                  <span className="text-amber-400 font-bold">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 accent-amber-500 rounded-lg cursor-pointer"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={togglePlayback}
                    className={`flex-1 py-2 font-black uppercase text-xs border border-black flex items-center justify-center gap-2 transition-all ${
                      isPlaying
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>Zastaviť Zvuk</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Spustiť Atmosféru</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* COMPACT FLOATING PILL BUTTON */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center"
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-3 py-2 border-2 border-black font-mono text-xs font-black uppercase transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
              isPlaying
                ? 'bg-amber-500 text-black animate-pulse'
                : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border-zinc-800'
            }`}
          >
            {isPlaying ? (
              <>
                <Disc className="w-4 h-4 text-black animate-spin" />
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-1 bg-black h-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 bg-black h-2/3 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 bg-black h-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>AMBIENT 369 LIVE</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-500" />
                <span>STREET AMBIENT</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </>
  );
}
