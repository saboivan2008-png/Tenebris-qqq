import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  WifiOff, 
  Wifi, 
  Volume2, 
  VolumeX, 
  Zap, 
  Terminal, 
  Check, 
  Flame,
  Radio,
  Sliders
} from 'lucide-react';

interface Props {
  onStatusChange?: (status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING') => void;
  onNavigateToMonitor?: () => void;
}

export default function AdminGlitchNotificationBar({ onStatusChange, onNavigateToMonitor }: Props) {
  const [status, setStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'>('CONNECTED');
  const [glitchIntensity, setGlitchIntensity] = useState<'mild' | 'severe'>('severe');
  const [audioAlertEnabled, setAudioAlertEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [autoRecoveryTimer, setAutoRecoveryTimer] = useState<number | null>(null);
  const [packetLoss, setPacketLoss] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play subtle cyberpunk alarm glitch beep
  const triggerAlarmBeep = () => {
    if (!audioAlertEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('Glitch beep error', e);
    }
  };

  const simulateOutage = () => {
    setStatus('DISCONNECTED');
    setDismissed(false);
    setPacketLoss(100);
    onStatusChange?.('DISCONNECTED');
    triggerAlarmBeep();

    // Set auto reconnect countdown
    if (autoRecoveryTimer) clearInterval(autoRecoveryTimer);
  };

  const handleReconnect = () => {
    setStatus('RECONNECTING');
    onStatusChange?.('RECONNECTING');

    setTimeout(() => {
      setStatus('CONNECTED');
      setPacketLoss(0);
      onStatusChange?.('CONNECTED');
    }, 1800);
  };

  // Broadcast custom window event for other widgets
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('auru-trinity-status', { detail: { status } }));
  }, [status]);

  return (
    <div className="w-full relative z-30 font-mono">
      
      {/* 1. SEVERE GLITCH ALERT BANNER WHEN DISCONNECTED */}
      <AnimatePresence>
        {status === 'DISCONNECTED' && !dismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-red-950 border-b-4 border-black text-white relative glitch-box scanline-overlay">
              
              {/* Caution diagonal bar on top */}
              <div className="h-1.5 w-full caution-stripes-red" />

              <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                
                {/* Glitch Headline & Icon */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none bg-red-600 border-2 border-white flex items-center justify-center animate-bounce">
                    <WifiOff className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-black text-red-500 px-2 py-0.5 font-black text-[10px] uppercase border border-red-500">
                        CRITICAL ALERT
                      </span>
                      <span className="glitch-text font-black text-sm tracking-wider uppercase text-red-200">
                        VÝPADOK SPOJENIA: AURU_TRINITY CORE DISCONNECTED
                      </span>
                    </div>
                    <p className="text-[11px] text-red-300 font-medium mt-0.5">
                      369 Telemetria zastavená • Paketová strata: 100% • Socket socket://matrix-dispatch.auru.space odpojený
                    </p>
                  </div>
                </div>

                {/* Quick Action Controls */}
                <div className="flex items-center gap-2">
                  {onNavigateToMonitor && (
                    <button
                      onClick={onNavigateToMonitor}
                      className="px-3 py-1.5 bg-black hover:bg-zinc-900 text-amber-400 font-black uppercase text-[11px] border border-amber-500 transition-colors"
                    >
                      Otvoriť 369 Monitor
                    </button>
                  )}

                  <button
                    onClick={handleReconnect}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>NÚDZOVO REŠTARTOVAŤ LINKU</span>
                  </button>

                  <button
                    onClick={() => setDismissed(true)}
                    className="px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[10px] font-bold border border-zinc-700"
                    title="Skryť banner"
                  >
                    ✕
                  </button>
                </div>

              </div>

              <div className="h-1.5 w-full caution-stripes-red" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. RECONNECTING INTERMEDIATE STATE BANNER */}
      <AnimatePresence>
        {status === 'RECONNECTING' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-950 border-b-2 border-amber-500 px-4 py-2 text-amber-300 text-xs flex items-center justify-between font-mono"
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="font-black uppercase tracking-wider">
                PREBIEHA OBNOVOVANIE SPOJENIA S AURU_TRINITY NEURAL CORE...
              </span>
            </div>
            <span className="text-[10px] text-amber-400 bg-black px-2 py-0.5 border border-amber-600">
              SOCKET HANDSHAKE // 369 FREQ SYNC
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. COMPACT TOP STATUS STRIP IN ADMIN DASHBOARD */}
      <div className="bg-zinc-900 border-b-2 border-black px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400">
        
        {/* Left Status Feed */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${
              status === 'CONNECTED' 
                ? 'bg-emerald-500 animate-ping' 
                : status === 'RECONNECTING'
                  ? 'bg-amber-500 animate-spin'
                  : 'bg-red-600 animate-pulse'
            }`} />
            <span className="font-bold text-white uppercase">
              AURU_TRINITY LINK:
            </span>
            <span className={`font-black uppercase px-1.5 py-0.5 border ${
              status === 'CONNECTED'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : status === 'RECONNECTING'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-red-600 text-white border-black glitch-text'
            }`}>
              {status === 'CONNECTED' ? '● ONLINE (369 SYNC)' : status === 'RECONNECTING' ? '◌ REKONEKCIA' : '✕ VÝPADOK'}
            </span>
          </div>

          {status === 'CONNECTED' && (
            <span className="hidden md:inline-block text-zinc-500">
              | Latencia: <span className="text-amber-400 font-bold">142 ms</span> • Paketová strata: <span className="text-emerald-400 font-bold">0.0%</span>
            </span>
          )}
        </div>

        {/* Right Simulation & Alarm Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Alarm Toggle */}
          <button
            onClick={() => setAudioAlertEnabled(!audioAlertEnabled)}
            className={`px-2 py-1 border flex items-center gap-1 uppercase transition-colors text-[10px] ${
              audioAlertEnabled 
                ? 'bg-amber-500 text-black border-black font-bold' 
                : 'bg-zinc-950 text-zinc-500 border-zinc-800'
            }`}
            title="Zvukový poplach pri výpadku"
          >
            {audioAlertEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            <span className="hidden sm:inline">{audioAlertEnabled ? 'Alarm Zapnutý' : 'Alarm Vypnutý'}</span>
          </button>

          {/* Simulate Outage / Reconnect Test Trigger */}
          {status === 'CONNECTED' ? (
            <button
              onClick={simulateOutage}
              className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-400 hover:text-red-200 border border-red-800 text-[10px] font-black uppercase transition-colors flex items-center gap-1"
              title="Otestovať glitch notifikáciu pri výpadku spojenia"
            >
              <Flame className="w-3 h-3" />
              <span>Simulovať Výpadok</span>
            </button>
          ) : (
            <button
              onClick={handleReconnect}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-black border border-black text-[10px] font-black uppercase transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Obnoviť Spojenie</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
