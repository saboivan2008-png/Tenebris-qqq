import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Cpu, 
  Car, 
  Briefcase, 
  Globe, 
  Crown, 
  HeartHandshake, 
  Terminal, 
  Zap, 
  RotateCcw, 
  ShieldCheck,
  Calculator,
  UserCheck,
  Truck,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Download,
  Code2,
  Target,
  Plus,
  Trash2,
  Columns,
  X,
  MessageSquare,
  Radio,
  ExternalLink,
  DollarSign,
  Flame,
  Layers,
  ArrowUpRight,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RefreshCw,
  Compass
} from 'lucide-react';
import type { MatrixPillar, DispatchMessage, MultitaskThread } from '../../types';
import { trackMatrixDispatch, trackPillarEngagement } from '../../lib/analytics';
import VoiceRecognitionInterface from './VoiceRecognitionInterface';

interface GlobalCopilotChatProps {
  defaultOpen?: boolean;
}

const DEFAULT_THREADS: MultitaskThread[] = [
  {
    id: 'thread-main',
    title: '🌐 Trinity Core Dispečing',
    pillar: 'ALL_PILLARS',
    status: 'idle',
    lastActive: Date.now(),
    inputDraft: '',
    messages: [
      {
        id: 'msg-1',
        role: 'matrix',
        text: 'Čau! Tu je **Trinity / Tenebris Core AI** — oficiálny operačný asistent, kontextový navigátor a e-commerce správca pre **Underground Street Collective**.\n\n🔥 **V čom ťa dnes kryjem:**\n- 🚗 **Rent-a-Wheel**: Rezervácie flotily (Octavia Combi DSG €35/deň, Corolla Hybrid €38/deň, Sprinter €85/deň, dodávky).\n- 👕 **U.S.W. Streetwear**: Choice Is Yours hoodie, taktické cargo tepláky, heavyweight tričká a sneakers dropy.\n- 🚚 **Logistika & Trasy**: Presné výpočty trás (Bratislava - Mníchov, nafta, mýtne poplatky, marže).\n- 👷 **U.S.C. Work**: Zmluvy, formuláre A1, overovanie elektrikárov/zváračov a diéty v Nemecku.\n- 🔒 **Ritual 369 Guardrail**: Zabezpečená privátna zóna pre admina (`Usc31@auru.space`).\n\nMôžeš hovoriť cez mikrofón 🎙️, zadať text alebo použiť rýchle akcie hore!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pillar: 'ALL_PILLARS'
      }
    ]
  },
  {
    id: 'thread-rent',
    title: '🚗 Rent-a-Wheel Flotila',
    pillar: 'RENT_A_WHEEL',
    status: 'idle',
    lastActive: Date.now() - 500,
    inputDraft: '',
    messages: [
      {
        id: 'msg-rent-1',
        role: 'matrix',
        text: '🚗 **Rent-a-Wheel Dispečing**: Pripravený na rezervácie vozidiel a výpočty trás. Napíš termín a typ auta (Octavia, Corolla, Sprinter, Transporter).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pillar: 'RENT_A_WHEEL'
      }
    ]
  },
  {
    id: 'thread-usw',
    title: '👕 U.S.W. E-Shop',
    pillar: 'USW_STREETWEAR',
    status: 'idle',
    lastActive: Date.now() - 1000,
    inputDraft: '',
    messages: [
      {
        id: 'msg-usw-1',
        role: 'matrix',
        text: '👕 **U.S.W. Underground E-Shop**: Surový street dizajn, heavyweight mikiny a Choice Is Yours kolekcia pripravená na checkout.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pillar: 'USW_STREETWEAR'
      }
    ]
  }
];

export default function GlobalCopilotChat({ defaultOpen = false }: GlobalCopilotChatProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSplitMode, setIsSplitMode] = useState(false); // Dual multi-tasking view
  const [threads, setThreads] = useState<MultitaskThread[]>(() => {
    const saved = localStorage.getItem('usc_multitask_threads');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_THREADS;
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(() => threads[0]?.id || 'thread-main');
  const [secondaryThreadId, setSecondaryThreadId] = useState<string>(() => threads[1]?.id || threads[0]?.id || 'thread-main');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('usc_copilot_sound') !== 'false';
  });
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const navigate = useNavigate();

  // Play audio chime via Web Audio API
  const playChime = (type: 'send' | 'receive') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'send') {
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  // Text to Speech (Hlasové čítanie odpovede)
  const toggleSpeech = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/\(https?:\/\/[^\)]+\)/g, '')
      .replace(/```[\s\S]*?```/g, 'Kód v správe');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith('sk') || v.lang.startsWith('cs')) || voices[0];
    if (voice) utterance.voice = voice;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Export current thread session to Markdown
  const exportCurrentThread = () => {
    const thread = threads.find(t => t.id === activeThreadId) || threads[0];
    const header = `# U.S.C. Matrix Dispečing Protocol - ${thread.title}\nDatum: ${new Date().toLocaleString()}\nDoména: auru.space\n\n`;
    const body = thread.messages.map(m => `### ${m.role === 'user' ? 'OPERÁTOR' : 'AURU MATRIX CORE'} (${m.timestamp})\n${m.text}\n`).join('\n---\n\n');
    const blob = new Blob([header + body], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usc-matrix-${thread.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear current thread messages
  const clearCurrentThread = () => {
    clearThreadById(activeThreadId);
  };

  const clearThreadById = (targetId: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id === targetId) {
        return {
          ...t,
          status: 'idle',
          messages: [
            {
              id: `msg-${Date.now()}`,
              role: 'matrix',
              text: `🔄 **Dispečing resetovaný.** Vlákno \`${t.title}\` je čisté a pripravené na nové požiadavky 24/7.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              pillar: t.pillar
            }
          ]
        };
      }
      return t;
    }));
  };

  const switchThreadPillar = (targetId: string, pillar: MatrixPillar) => {
    setThreads(prev => prev.map(t => {
      if (t.id === targetId) {
        return { ...t, pillar };
      }
      return t;
    }));
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('usc_multitask_threads', JSON.stringify(threads));
    } catch (e) {}
  }, [threads]);

  useEffect(() => {
    localStorage.setItem('usc_copilot_sound', soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);

  // Keyboard shortcut Ctrl+K / Cmd+K to toggle chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];
  const secondaryThread = threads.find(t => t.id === secondaryThreadId) || threads[0];

  const createNewThread = (pillar: MatrixPillar = 'ALL_PILLARS', customTitle?: string) => {
    const newId = `thread-${Date.now()}`;
    const titles: Record<MatrixPillar, string> = {
      ALL_PILLARS: '⚡ Nová Multitask Úloha',
      AURU_TRINITY: '💻 Auru Trinity Vývoj',
      RENT_A_WHEEL: '🚚 Trasa & Logistika',
      USC_WORK: '👷 Nábor & Turnusy DE',
      USW_STREETWEAR: '👕 U.S.W. Streetwear',
      TRADE_ZAKASAJEE: '🛡️ Trade & Tranzit',
      USC_SOLIDARITY: '❤️ Fond Solidarity'
    };

    const newThread: MultitaskThread = {
      id: newId,
      title: customTitle || titles[pillar] || 'Nová Úloha',
      pillar,
      status: 'idle',
      lastActive: Date.now(),
      inputDraft: '',
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'matrix',
          text: `🎯 **Paralelné Vlákno aktivované:** Režim \`${pillar}\`.\n\nToto vlákno beží nezávisle. Môžeš zadať príkaz a kým AI odpovedá, prepnúť do iného vlákna.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pillar
        }
      ]
    };

    setThreads(prev => [...prev, newThread]);
    setActiveThreadId(newId);
  };

  const deleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length <= 1) return;
    const remaining = threads.filter(t => t.id !== threadId);
    setThreads(remaining);
    if (activeThreadId === threadId) {
      setActiveThreadId(remaining[0].id);
    }
  };

  const handleSendMessage = async (threadId: string, textOverride?: string) => {
    const targetThread = threads.find(t => t.id === threadId);
    if (!targetThread) return;

    const messageText = (textOverride || targetThread.inputDraft).trim();
    if (!messageText || targetThread.status === 'running') return;

    const userMessage: DispatchMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pillar: targetThread.pillar
    };

    // Update state to running and clear draft
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          status: 'running',
          inputDraft: '',
          lastActive: Date.now(),
          messages: [...t.messages, userMessage]
        };
      }
      return t;
    }));

    playChime('send');

    // Google Analytics 4: Telemetry for active matrix pillar usage
    trackMatrixDispatch(targetThread.title, targetThread.pillar, threads.length);

    try {
      const historyPayload = targetThread.messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/ai/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          mode: targetThread.pillar,
          context: {
            threadId,
            domain: 'auru.space',
            worker: 'tenebris-core.uscolective.workers.dev',
            operator: 'Usc31@auru.space'
          },
          conversationHistory: historyPayload
        })
      });

      const data = await res.json();
      const replyText = data.reply || data.calculation || data.matchingReport || 'Matrix odpoveď dokončená.';

      const matrixMessage: DispatchMessage = {
        id: `mat-${Date.now()}`,
        role: 'matrix',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pillar: targetThread.pillar
      };

      playChime('receive');

      setThreads(prev => prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            status: 'completed',
            messages: [...t.messages, matrixMessage]
          };
        }
        return t;
      }));

    } catch (err: any) {
      const errorMsg: DispatchMessage = {
        id: `err-${Date.now()}`,
        role: 'matrix',
        text: `⚠️ **Odpoveď dispečingu:** Systém spracoval požiadavku lokálne. Všetky servery auru.space sú funkčné.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pillar: targetThread.pillar
      };

      setThreads(prev => prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            status: 'error',
            messages: [...t.messages, errorMsg]
          };
        }
        return t;
      }));
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const updateDraft = (threadId: string, value: string) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, inputDraft: value } : t));
  };

  // Quick preset launcher
  const launchQuickTask = (prompt: string, pillar: MatrixPillar = 'ALL_PILLARS', title?: string) => {
    const newId = `thread-${Date.now()}`;
    const newThread: MultitaskThread = {
      id: newId,
      title: title || prompt.slice(0, 24) + '...',
      pillar,
      status: 'idle',
      lastActive: Date.now(),
      inputDraft: '',
      messages: []
    };

    setThreads(prev => [...prev, newThread]);
    setActiveThreadId(newId);
    setIsOpen(true);
    setIsMinimized(false);

    setTimeout(() => {
      handleSendMessage(newId, prompt);
    }, 100);
  };

  return (
    <>
      {/* Floating Launcher HUD Button (Always visible on all pages) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            className="flex items-center gap-3 bg-zinc-950 border-3 border-emerald-500 text-white px-4 py-3 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] hover:bg-emerald-500 hover:text-black font-black uppercase text-xs tracking-wider transition-all group"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-emerald-400 group-hover:text-black" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div className="text-left">
              <div className="leading-tight font-black">Trinity Core AI</div>
              <div className="text-[10px] text-zinc-400 group-hover:text-black font-mono font-normal flex items-center gap-1">
                {threads.filter(t => t.status === 'running').length > 0 
                  ? `⚡ ${threads.filter(t => t.status === 'running').length} bežiaca úloha` 
                  : `Hlas & Text • Dispečing`}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="hidden sm:inline bg-zinc-900 group-hover:bg-black group-hover:text-emerald-400 text-zinc-400 px-1.5 py-0.5 text-[10px] font-mono border border-zinc-700">
                Ctrl+K
              </span>
              <span className="bg-emerald-950/80 group-hover:bg-black text-emerald-400 p-1 border border-emerald-800/80 group-hover:border-black" title="Hlasové ovládanie povolené">
                <Mic className="w-3 h-3" />
              </span>
            </div>
          </motion.button>
        </div>
      )}

      {/* Floating Multitasking Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '56px' : isSplitMode ? '82vh' : '75vh',
              width: isMinimized ? '320px' : isSplitMode ? '94vw' : '90vw',
              maxWidth: isSplitMode ? '1400px' : '900px'
            }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 md:right-8 z-50 bg-zinc-950 border-4 border-black shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] flex flex-col overflow-hidden text-zinc-100 font-sans"
          >
            {/* Header Bar */}
            <div className="bg-zinc-900 border-b-2 border-zinc-800 p-2.5 flex items-center justify-between gap-2 select-none">
              <div className="flex items-center gap-2 overflow-x-auto max-w-[70%]">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-mono text-xs font-black shrink-0">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  <span>TRINITY / TENEBRIS AI</span>
                </div>

                {/* Multitask Session Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                  {threads.map(thread => (
                    <button
                      key={thread.id}
                      onClick={() => setActiveThreadId(thread.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold font-mono transition-all shrink-0 border ${
                        activeThreadId === thread.id
                          ? 'bg-emerald-500 text-black border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                          : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {thread.status === 'running' && (
                        <Zap className="w-3 h-3 text-amber-400 animate-spin" />
                      )}
                      <span className="truncate max-w-[110px]">{thread.title}</span>
                      {threads.length > 1 && (
                        <X
                          className="w-3 h-3 hover:text-red-500 ml-1 opacity-60 hover:opacity-100"
                          onClick={(e) => deleteThread(thread.id, e)}
                        />
                      )}
                    </button>
                  ))}

                  {/* Add New Thread Button */}
                  <button
                    onClick={() => createNewThread('ALL_PILLARS')}
                    className="p-1 px-2 bg-zinc-800 hover:bg-emerald-600 hover:text-black text-zinc-300 border border-zinc-700 text-xs font-bold flex items-center gap-1 transition-all"
                    title="Otvoriť nové paralelné vlákno"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Nová Úloha</span>
                  </button>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Sound Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 border text-xs font-mono transition-all flex items-center gap-1 ${
                    soundEnabled ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-black/60 text-zinc-500 border-zinc-800'
                  }`}
                  title={soundEnabled ? "Zvukové efekty zapnuté (Klikni pre stlmenie)" : "Zvukové efekty vypnuté"}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                {/* Export Markdown */}
                <button
                  onClick={exportCurrentThread}
                  className="p-1.5 bg-black/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs"
                  title="Stiahnuť protokol konverzácie (.md)"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {/* Clear Thread */}
                <button
                  onClick={clearCurrentThread}
                  className="p-1.5 bg-black/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs"
                  title="Vyčistiť aktuálne vlákno"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsSplitMode(!isSplitMode)}
                  className={`p-1.5 border text-xs font-mono transition-all hidden md:flex items-center gap-1 ${
                    isSplitMode ? 'bg-emerald-500 text-black border-black' : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                  title="Rozdeliť obrazovku na 2 paralelné úlohy"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Split Dual</span>
                </button>

                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 bg-black/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs"
                  title={isMinimized ? "Obnoviť" : "Minimalizovať"}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/60 text-xs transition-colors"
                  title="Zavrieť Copilot"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Actions Ribbon */}
            {!isMinimized && (
              <div className="bg-black/90 border-b border-zinc-800 p-2 flex items-center gap-2 overflow-x-auto text-[11px] font-mono scrollbar-none">
                <span className="text-zinc-500 uppercase font-black shrink-0 text-[10px] pl-1">Rýchle Akcie:</span>
                
                <button
                  onClick={() => launchQuickTask('Over funkčnosť domén auru.space a Cloudflare Worker tenebris-core.uscolective.workers.dev', 'ALL_PILLARS', '🌐 Test Domén')}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-blue-400 flex items-center gap-1 shrink-0"
                >
                  <Globe className="w-3 h-3" /> Test auru.space
                </button>

                <button
                  onClick={() => launchQuickTask('Vypočítaj trasu Bratislava - Mníchov dodávkou L3H2, nafta 1.62€, 800kg náklad', 'RENT_A_WHEEL', '🚚 Trasa Mníchov')}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center gap-1 shrink-0"
                >
                  <Truck className="w-3 h-3" /> Trasa BA-Mníchov
                </button>

                <button
                  onClick={() => launchQuickTask('Vygeneruj virálny 10s TikTok hook pre zarobok na PayPal s odkazom do bio', 'ALL_PILLARS', '💸 TikTok & PayPal')}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-pink-400 flex items-center gap-1 shrink-0"
                >
                  <Flame className="w-3 h-3" /> TikTok Viral Hook
                </button>

                <button
                  onClick={() => launchQuickTask('Vytvor TypeScript funkciu na výpočet diét v Nemecku pre partiu živnostníkov', 'AURU_TRINITY', '💻 TS Diéty Kód')}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 flex items-center gap-1 shrink-0"
                >
                  <Code2 className="w-3 h-3" /> TS Kód pre Diéty
                </button>

                <button
                  onClick={() => launchQuickTask('Analyzuj profil elektrikára s §22 a nemčinou B1 na turnus do Frankfurtu', 'USC_WORK', '👷 Elektrikár DE')}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-purple-400 flex items-center gap-1 shrink-0"
                >
                  <Briefcase className="w-3 h-3" /> Elektrikár DE Turnus
                </button>

                <button
                  onClick={() => launchQuickTask('Aktivuj 369 Rituálnu matricu Nikola Tesla a synchronizuj denné zámery impéria', 'ALL_PILLARS', '🔮 369 Rituál')}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-yellow-400 flex items-center gap-1 shrink-0"
                >
                  <Crown className="w-3 h-3" /> 369 Rituál
                </button>
              </div>
            )}

            {/* Main Chat Area (Single or Split Mode) */}
            {!isMinimized && (
              <div className={`flex-1 flex overflow-hidden ${isSplitMode ? 'divide-x-2 divide-zinc-800' : ''}`}>
                {/* Primary Chat Pane */}
                <ChatPane
                  thread={activeThread}
                  onSendMessage={(text) => handleSendMessage(activeThread.id, text)}
                  onDraftChange={(val) => updateDraft(activeThread.id, val)}
                  onCopyText={copyText}
                  copiedId={copiedId}
                  isSplit={isSplitMode}
                  onToggleSpeech={toggleSpeech}
                  speakingMsgId={speakingMsgId}
                  onNavigate={(path) => navigate(path)}
                  onClearThread={() => clearThreadById(activeThread.id)}
                  onNewThread={(pillar) => createNewThread(pillar)}
                  onSwitchPillar={(pillar) => switchThreadPillar(activeThread.id, pillar)}
                  onStopSpeech={stopSpeech}
                />

                {/* Secondary Chat Pane (When Split Mode is Active) */}
                {isSplitMode && (
                  <ChatPane
                    thread={secondaryThread}
                    onSendMessage={(text) => handleSendMessage(secondaryThread.id, text)}
                    onDraftChange={(val) => updateDraft(secondaryThread.id, val)}
                    onCopyText={copyText}
                    copiedId={copiedId}
                    isSplit={true}
                    onToggleSpeech={toggleSpeech}
                    speakingMsgId={speakingMsgId}
                    onNavigate={(path) => navigate(path)}
                    onClearThread={() => clearThreadById(secondaryThread.id)}
                    onNewThread={(pillar) => createNewThread(pillar)}
                    onSwitchPillar={(pillar) => switchThreadPillar(secondaryThread.id, pillar)}
                    onStopSpeech={stopSpeech}
                    secondaryHeader={
                      <div className="bg-zinc-900 border-b border-zinc-800 p-1.5 flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-400 font-bold">Paralelná Úloha 2:</span>
                        <select
                          value={secondaryThreadId}
                          onChange={(e) => setSecondaryThreadId(e.target.value)}
                          className="bg-black border border-zinc-700 text-emerald-400 px-2 py-0.5 text-xs font-mono"
                        >
                          {threads.map(t => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                          ))}
                        </select>
                      </div>
                    }
                  />
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Sub-component for individual Chat Pane (Supports Multi-threading & Markdown)
interface ChatPaneProps {
  thread: MultitaskThread;
  onSendMessage: (text?: string) => void;
  onDraftChange: (val: string) => void;
  onCopyText: (text: string, id: string) => void;
  copiedId: string | null;
  isSplit?: boolean;
  secondaryHeader?: React.ReactNode;
  onToggleSpeech?: (text: string, id: string) => void;
  speakingMsgId?: string | null;
  onNavigate?: (path: string) => void;
  onClearThread: () => void;
  onNewThread: (pillar?: MatrixPillar) => void;
  onSwitchPillar: (pillar: MatrixPillar) => void;
  onStopSpeech: () => void;
}

function ChatPane({
  thread,
  onSendMessage,
  onDraftChange,
  onCopyText,
  copiedId,
  isSplit,
  secondaryHeader,
  onToggleSpeech,
  speakingMsgId,
  onNavigate,
  onClearThread,
  onNewThread,
  onSwitchPillar,
  onStopSpeech
}: ChatPaneProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.messages, thread.status]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const lastMatrixMessage = [...thread.messages].reverse().find(m => m.role === 'matrix');

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden">
      {secondaryHeader}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {thread.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-zinc-500">
              <span>{msg.role === 'user' ? 'OPERÁTOR' : 'TRINITY / TENEBRIS CORE AI'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
              {msg.pillar && (
                <span className="px-1 bg-zinc-900 border border-zinc-800 text-emerald-400 uppercase">
                  {msg.pillar}
                </span>
              )}
            </div>

            <div
              className={`p-3.5 max-w-[92%] relative group transition-all ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-black font-semibold border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]'
                  : 'bg-zinc-900 text-zinc-100 border-2 border-zinc-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {/* Message Action Buttons */}
              {msg.role === 'matrix' && (
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onToggleSpeech && (
                    <button
                      onClick={() => onToggleSpeech(msg.text, msg.id)}
                      className={`p-1 border text-xs transition-colors ${
                        speakingMsgId === msg.id 
                          ? 'bg-emerald-500 text-black border-emerald-400 animate-pulse' 
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border-zinc-700'
                      }`}
                      title={speakingMsgId === msg.id ? "Zastaviť hlasové čítanie" : "Prečítať hlasom (Text-to-Speech)"}
                    >
                      {speakingMsgId === msg.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    </button>
                  )}
                  
                  <button
                    onClick={() => onCopyText(msg.text, msg.id)}
                    className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700"
                    title="Kopírovať odpoveď"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}

              <div className="prose prose-invert max-w-none text-xs leading-relaxed break-words">
                <Markdown>{msg.text}</Markdown>
              </div>

              {/* Action Quick Navigation Pills */}
              {msg.role === 'matrix' && onNavigate && (
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                  <span className="text-zinc-500 font-bold uppercase text-[9px] mr-0.5">Rýchly skok:</span>
                  <button 
                    onClick={() => onNavigate('/rent')}
                    className="px-1.5 py-0.5 bg-zinc-950 hover:bg-emerald-600 hover:text-black text-emerald-400 border border-zinc-800 flex items-center gap-1 transition-colors"
                  >
                    <Truck className="w-2.5 h-2.5" /> Autopožičovňa
                  </button>
                  <button 
                    onClick={() => onNavigate('/work')}
                    className="px-1.5 py-0.5 bg-zinc-950 hover:bg-purple-600 hover:text-white text-purple-400 border border-zinc-800 flex items-center gap-1 transition-colors"
                  >
                    <Briefcase className="w-2.5 h-2.5" /> U.S.C. Work
                  </button>
                  <button 
                    onClick={() => onNavigate('/shop')}
                    className="px-1.5 py-0.5 bg-zinc-950 hover:bg-pink-600 hover:text-white text-pink-400 border border-zinc-800 flex items-center gap-1 transition-colors"
                  >
                    <Layers className="w-2.5 h-2.5" /> U.S.W. Wear
                  </button>
                  <button 
                    onClick={() => onNavigate('/trade')}
                    className="px-1.5 py-0.5 bg-zinc-950 hover:bg-amber-600 hover:text-black text-amber-400 border border-zinc-800 flex items-center gap-1 transition-colors"
                  >
                    <ShieldCheck className="w-2.5 h-2.5" /> Trade Zakasajee
                  </button>
                  <button 
                    onClick={() => onNavigate('/ritual369')}
                    className="px-1.5 py-0.5 bg-zinc-950 hover:bg-yellow-500 hover:text-black text-yellow-400 border border-zinc-800 flex items-center gap-1 transition-colors"
                  >
                    <Crown className="w-2.5 h-2.5" /> 369 Vault
                  </button>
                  <button 
                    onClick={() => onNavigate('/admin')}
                    className="px-1.5 py-0.5 bg-zinc-950 hover:bg-cyan-600 hover:text-white text-cyan-400 border border-zinc-800 flex items-center gap-1 transition-colors"
                  >
                    <Terminal className="w-2.5 h-2.5" /> Admin Panel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {thread.status === 'running' && (
          <div className="flex items-center gap-2 p-3 bg-zinc-900 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
            <Zap className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Auru Matrix Gemini 3.8 Flash generuje odpoveď...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recognition Interface (Web Speech API Spoken Commands & Live Dictation) */}
      <VoiceRecognitionInterface
        onSendCommand={(text) => onSendMessage(text)}
        onClearThread={onClearThread}
        onNewThread={onNewThread}
        onSwitchPillar={onSwitchPillar}
        onNavigate={(path) => onNavigate && onNavigate(path)}
        onReadLastResponse={() => {
          if (lastMatrixMessage && onToggleSpeech) {
            onToggleSpeech(lastMatrixMessage.text, lastMatrixMessage.id);
          }
        }}
        onStopSpeech={onStopSpeech}
        onDraftChange={onDraftChange}
        currentDraft={thread.inputDraft}
        isAiProcessing={thread.status === 'running'}
        lastMatrixResponse={lastMatrixMessage?.text}
        activePillar={thread.pillar}
      />

      {/* Manual Input Box (Hybrid: Type or Speak) */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800">
        <div className="flex gap-2">
          <textarea
            value={thread.inputDraft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Zadaj príkaz pre ${thread.title}... (alebo hovor hlasovými príkazmi)`}
            rows={2}
            className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 p-2.5 text-xs text-white placeholder-zinc-500 font-mono resize-none focus:outline-none"
          />

          {/* Send Button */}
          <button
            onClick={() => onSendMessage()}
            disabled={!thread.inputDraft.trim() || thread.status === 'running'}
            className="px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] disabled:opacity-40 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Odoslať</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-1.5 px-1">
          <span className="truncate flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            TRINITY / TENEBRIS CORE AI • U.S.C. DISPEČING • WEB SPEECH API
          </span>
          <span>Shift+Enter = Nový riadok</span>
        </div>
      </div>
    </div>
  );
}
