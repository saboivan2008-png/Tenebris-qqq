import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  Play, 
  Flame, 
  Terminal, 
  ShieldCheck, 
  Layers, 
  TrendingUp, 
  Cpu, 
  Wifi, 
  WifiOff,
  Radio,
  Sliders,
  Check,
  RotateCcw
} from 'lucide-react';

export interface Script369Execution {
  id: string;
  name: string;
  pillar: 'WORK' | 'RENT' | 'USW' | 'SOLIDARITY' | 'TRINITY' | 'MINDSET_369';
  tier: 3 | 6 | 9;
  status: 'SUCCESS' | 'RUNNING' | 'OPTIMIZED' | 'QUEUED' | 'ERROR';
  latencyMs: number;
  accuracy: number;
  timestamp: string;
  details: string;
}

const INITIAL_SCRIPTS: Script369Execution[] = [
  {
    id: 'scr-301',
    name: '3x Ranný Manifestačný Kernel (Zámer)',
    pillar: 'MINDSET_369',
    tier: 3,
    status: 'SUCCESS',
    latencyMs: 142,
    accuracy: 99.8,
    timestamp: 'Pred 4 min',
    details: 'Zosúladenie frekvencie 369 Hz a zápis cieľov montáží'
  },
  {
    id: 'scr-602',
    name: '6x Autonómne Overenie § 13b UStG (Nemecko)',
    pillar: 'WORK',
    tier: 6,
    status: 'SUCCESS',
    latencyMs: 235,
    accuracy: 100.0,
    timestamp: 'Pred 8 min',
    details: 'Reverse charge validácia pre 12 montážnych faktúr'
  },
  {
    id: 'scr-903',
    name: '9x Večerné Finančné Zapečatenie (Cashflow Matrix)',
    pillar: 'TRINITY',
    tier: 9,
    status: 'OPTIMIZED',
    latencyMs: 310,
    accuracy: 99.4,
    timestamp: 'Pred 12 min',
    details: 'Audit tržieb U.S.W. & Rent a Wheel, zisk +4 890 €'
  },
  {
    id: 'scr-304',
    name: '3x Fleet Routing & Toll Sync (Dodávky L3H2)',
    pillar: 'RENT',
    tier: 3,
    status: 'SUCCESS',
    latencyMs: 188,
    accuracy: 98.9,
    timestamp: 'Pred 18 min',
    details: 'Optimalizácia trasy Bratislava -> Mníchov (-12% nafta)'
  },
  {
    id: 'scr-605',
    name: '6x B2B Lead Acquisition Dispatcher (DE Industrie)',
    pillar: 'WORK',
    tier: 6,
    status: 'SUCCESS',
    latencyMs: 270,
    accuracy: 99.1,
    timestamp: 'Pred 24 min',
    details: 'Odoslané 4 dopyty na priemyselné elektroinštalácie'
  },
  {
    id: 'scr-906',
    name: '9x Komunitný Fond Solidarita Multiplier',
    pillar: 'SOLIDARITY',
    tier: 9,
    status: 'SUCCESS',
    latencyMs: 165,
    accuracy: 100.0,
    timestamp: 'Pred 35 min',
    details: 'Alokácia 10% výťažku z U.S.W. dropu do transparentného fondu'
  }
];

export default function Auru369MonitorWidget() {
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'SYNCING' | 'OFFLINE'>('CONNECTED');
  const [latency, setLatency] = useState(148);
  const [scripts, setScripts] = useState<Script369Execution[]>(INITIAL_SCRIPTS);
  const [isSimulating, setIsSimulating] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'all' | 3 | 6 | 9>('all');
  const [isExecutingManual, setIsExecutingManual] = useState(false);
  const [manualResult, setManualResult] = useState<string | null>(null);

  // Listen to Global Auru Trinity Status Events from Notification Bar
  useEffect(() => {
    const handleStatusEvent = (e: any) => {
      const newStatus = e.detail?.status;
      if (newStatus === 'DISCONNECTED') {
        setConnectionStatus('OFFLINE');
        setLatency(0);
        // Prepend an alert script
        setScripts(prev => [
          {
            id: `err-${Date.now().toString().slice(-4)}`,
            name: '⚠️ VÝPADOK: AURU_TRINITY NEURAL LINK DISCONNECTED',
            pillar: 'TRINITY',
            tier: 9,
            status: 'ERROR',
            latencyMs: 0,
            accuracy: 0.0,
            timestamp: 'Práve teraz',
            details: 'Spojenie so serverom zlyhalo. Vyžaduje sa reštart linky.'
          },
          ...prev.slice(0, 10)
        ]);
      } else if (newStatus === 'RECONNECTING') {
        setConnectionStatus('SYNCING');
      } else if (newStatus === 'CONNECTED') {
        setConnectionStatus('CONNECTED');
        setLatency(142);
      }
    };

    window.addEventListener('auru-trinity-status', handleStatusEvent);
    return () => window.removeEventListener('auru-trinity-status', handleStatusEvent);
  }, []);

  // Live Metric Calculation
  const totalExecutions = scripts.length;
  const successExecutions = scripts.filter(s => s.status === 'SUCCESS' || s.status === 'OPTIMIZED').length;
  const overallSuccessRate = totalExecutions > 0 ? ((successExecutions / totalExecutions) * 100).toFixed(1) : '100.0';
  const averageLatency = Math.round(scripts.reduce((acc, s) => acc + s.latencyMs, 0) / (totalExecutions || 1));
  const avgAccuracy = (scripts.reduce((acc, s) => acc + s.accuracy, 0) / (totalExecutions || 1)).toFixed(1);

  // Real-time Pulse Interval
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Small jitter to latency
      setLatency(prev => Math.max(95, Math.min(260, prev + Math.floor(Math.random() * 25) - 12)));
      setLastCheckTime(new Date());

      // Occasionally add or update a script simulation
      if (Math.random() > 0.65) {
        const tiers: (3 | 6 | 9)[] = [3, 6, 9];
        const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
        const names = [
          '3x Solfeggio 369 Hz Telemetria mysle',
          '6x Zmluva o Dielo Automatická Generácia',
          '9x Denný Streak & Zapečatenie Matrice',
          '3x Kontrola Platnosti A1 Formulárov',
          '6x Dynamic Price Engine (U.S.W. Dropy)',
          '9x Live Dispatcher AI Task Allocator'
        ];
        const randomName = names[Math.floor(Math.random() * names.length)];

        const newScript: Script369Execution = {
          id: `scr-${Date.now().toString().slice(-4)}`,
          name: randomName,
          pillar: randomTier === 3 ? 'MINDSET_369' : randomTier === 6 ? 'WORK' : 'TRINITY',
          tier: randomTier,
          status: 'SUCCESS',
          latencyMs: Math.floor(Math.random() * 140) + 110,
          accuracy: Number((98.8 + Math.random() * 1.2).toFixed(1)),
          timestamp: 'Práve teraz',
          details: 'Autonómne vykonané cez AURU Trinity Neural Core'
        };

        setScripts(prev => [newScript, ...prev.slice(0, 11)]);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Manual Trigger for 3-6-9 Full Diagnostic
  const handleExecuteFullDiagnostic = async () => {
    setIsExecutingManual(true);
    setManualResult(null);
    setConnectionStatus('SYNCING');

    try {
      // Simulate live ping and AI check
      await new Promise(r => setTimeout(r, 1200));

      const diagScript: Script369Execution = {
        id: `scr-diag-${Date.now().toString().slice(-4)}`,
        name: '🔥 MANUÁLNY 369 FULL-SPECTRUM DIAGNOSTICKÝ SKRIPT',
        pillar: 'TRINITY',
        tier: 9,
        status: 'OPTIMIZED',
        latencyMs: 118,
        accuracy: 100.0,
        timestamp: 'Pred sekundou',
        details: 'Všetky 3 piliere (3x Zámer, 6x Hustle, 9x Výsledok) validované bez chýb'
      };

      setScripts(prev => [diagScript, ...prev.slice(0, 11)]);
      setConnectionStatus('CONNECTED');
      setManualResult('✓ 369 Diagnostický cyklus dokončený s úspešnosťou 100.0% (Latency: 118ms)');
    } catch (e) {
      setConnectionStatus('OFFLINE');
    } finally {
      setIsExecutingManual(false);
    }
  };

  const filteredScripts = activeTab === 'all' 
    ? scripts 
    : scripts.filter(s => s.tier === activeTab);

  return (
    <div className="bg-zinc-950 border-4 border-black street-shadow-amber p-6 md:p-8 font-sans space-y-6">
      
      {/* Top Header & Live Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-500 text-black px-2 py-0.5 font-mono text-[11px] font-black uppercase">
              REAL-TIME AI CORE
            </span>
            <span className="text-zinc-400 font-mono text-xs">
              AURU_TRINITY // 369 MONITOR
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Bot className="w-7 h-7 text-amber-500" />
            AI Auru_Trinity & 369 Script Monitor
          </h2>
        </div>

        {/* Live Status Pill & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 bg-zinc-900 border-2 border-zinc-700 px-3.5 py-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${
              connectionStatus === 'CONNECTED' 
                ? 'bg-emerald-500 animate-ping' 
                : connectionStatus === 'SYNCING'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-red-600'
            }`} />
            <span className="font-bold text-white uppercase">
              {connectionStatus === 'CONNECTED' ? 'ONLINE (GEMINI 3.7)' : connectionStatus === 'SYNCING' ? 'SYNCHRONIZÁCIA...' : 'OFFLINE'}
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-amber-400 font-black">{latency} ms</span>
          </div>

          <button
            onClick={handleExecuteFullDiagnostic}
            disabled={isExecutingManual}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black uppercase border-2 border-black flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isExecutingManual ? 'animate-spin' : ''}`} />
            <span>{isExecutingManual ? 'Vykonávam 369 Test...' : 'Spustiť 369 Diagnostiku'}</span>
          </button>
        </div>
      </div>

      {/* Real-time KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        
        {/* Metric 1: 369 Script Success Rate */}
        <div className="bg-zinc-900 border-2 border-black p-4 street-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-black uppercase text-zinc-400">Úspešnosť 369 Skriptov</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mb-1">
            {overallSuccessRate}%
          </div>
          <div className="text-[10px] text-zinc-400">
            {successExecutions} z {totalExecutions} skriptov bez jedinej chyby
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="w-full bg-zinc-950 h-1.5 mt-3 border border-zinc-800 overflow-hidden">
            <motion.div 
              className="bg-emerald-500 h-full"
              style={{ width: `${overallSuccessRate}%` }}
              animate={{ width: `${overallSuccessRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2: AI Neural Latency */}
        <div className="bg-zinc-900 border-2 border-black p-4 street-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-black uppercase text-zinc-400">Priemerná Odozva (Latency)</span>
            <Activity className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-400 mb-1">
            {averageLatency} <span className="text-base font-normal text-zinc-400">ms</span>
          </div>
          <div className="text-[10px] text-zinc-400 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">● Vynikajúca odozva</span> (Google Cloud Run)
          </div>
          <div className="w-full bg-zinc-950 h-1.5 mt-3 border border-zinc-800 overflow-hidden">
            <div className="bg-amber-500 h-full" style={{ width: '88%' }} />
          </div>
        </div>

        {/* Metric 3: AI Inference Accuracy */}
        <div className="bg-zinc-900 border-2 border-black p-4 street-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-black uppercase text-zinc-400">Presnosť Modelu (Accuracy)</span>
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {avgAccuracy}%
          </div>
          <div className="text-[10px] text-zinc-400">
            Kalkulácie § 13b, trasy dodávok, skripty
          </div>
          <div className="w-full bg-zinc-950 h-1.5 mt-3 border border-zinc-800 overflow-hidden">
            <div className="bg-yellow-400 h-full" style={{ width: `${avgAccuracy}%` }} />
          </div>
        </div>

        {/* Metric 4: 3-6-9 Pillars Sync Status */}
        <div className="bg-zinc-900 border-2 border-black p-4 street-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-black uppercase text-zinc-400">3-6-9 Matrica Synchro</span>
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-red-500 mb-1 flex items-center gap-1.5">
            <span>3</span>
            <span className="text-zinc-600 text-sm">/</span>
            <span>6</span>
            <span className="text-zinc-600 text-sm">/</span>
            <span>9</span>
            <span className="text-xs text-emerald-400 ml-1">HOT</span>
          </div>
          <div className="text-[10px] text-zinc-400">
            Frekvencia 369 Hz aktívna v pozadí
          </div>
          <div className="w-full bg-zinc-950 h-1.5 mt-3 border border-zinc-800 overflow-hidden">
            <div className="bg-red-500 h-full" style={{ width: '100%' }} />
          </div>
        </div>

      </div>

      {/* Manual Action Success Notification */}
      <AnimatePresence>
        {manualResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-300 font-mono text-xs flex justify-between items-center"
          >
            <span>{manualResult}</span>
            <button onClick={() => setManualResult(null)} className="text-emerald-400 hover:text-white font-black">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Script Execution Console & Log Table */}
      <div className="bg-black border-2 border-zinc-800 p-5 space-y-4">
        
        {/* Table Filter Tabs */}
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-zinc-800 pb-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-500" />
            <span className="text-white font-black uppercase tracking-wider">
              Živý Denník Vykonávania 369 Skriptov
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 font-bold uppercase transition-all ${
                activeTab === 'all' 
                  ? 'bg-amber-500 text-black font-black' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Všetky ({scripts.length})
            </button>
            <button
              onClick={() => setActiveTab(3)}
              className={`px-3 py-1 font-bold uppercase transition-all ${
                activeTab === 3 
                  ? 'bg-amber-500 text-black font-black' 
                  : 'bg-zinc-900 text-amber-400 hover:text-white'
              }`}
            >
              3x Ráno
            </button>
            <button
              onClick={() => setActiveTab(6)}
              className={`px-3 py-1 font-bold uppercase transition-all ${
                activeTab === 6 
                  ? 'bg-red-600 text-white font-black' 
                  : 'bg-zinc-900 text-red-500 hover:text-white'
              }`}
            >
              6x Poobedie
            </button>
            <button
              onClick={() => setActiveTab(9)}
              className={`px-3 py-1 font-bold uppercase transition-all ${
                activeTab === 9 
                  ? 'bg-emerald-500 text-black font-black' 
                  : 'bg-zinc-900 text-emerald-400 hover:text-white'
              }`}
            >
              9x Večer
            </button>
          </div>
        </div>

        {/* Live Execution Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-800 text-zinc-500 uppercase text-[10px]">
                <th className="py-2 px-3">Skript / Úloha</th>
                <th className="py-2 px-3">Fáza (3-6-9)</th>
                <th className="py-2 px-3">Pilier</th>
                <th className="py-2 px-3">Stav</th>
                <th className="py-2 px-3">Latency</th>
                <th className="py-2 px-3">Presnosť</th>
                <th className="py-2 px-3 text-right">Čas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredScripts.map((scr) => (
                <tr key={scr.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{scr.name}</div>
                    <div className="text-[10px] text-zinc-500">{scr.details}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 font-black text-[10px] border ${
                      scr.tier === 3 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                        : scr.tier === 6 
                          ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {scr.tier}x
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-zinc-400 font-bold uppercase">{scr.pillar}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>{scr.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-400">
                    {scr.latencyMs} ms
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-400">
                    {scr.accuracy}%
                  </td>
                  <td className="py-3 px-3 text-right text-zinc-500">
                    {scr.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live Terminal Telemetry Footer */}
        <div className="pt-2 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono text-[10px] text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AURU_TRINITY STREAM SOCKET: WSS://MATRIX-DISPATCH.AURU.SPACE/V3</span>
          </div>
          <div>
            Posledná telemetrická kontrola: {lastCheckTime.toLocaleTimeString()}
          </div>
        </div>

      </div>

    </div>
  );
}
