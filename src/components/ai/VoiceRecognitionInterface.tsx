import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  RotateCcw,
  Sparkles,
  Zap,
  Radio,
  Command,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Globe,
  Truck,
  Layers,
  Briefcase,
  ShieldCheck,
  Crown,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  Square,
  Compass
} from 'lucide-react';
import type { MatrixPillar } from '../../types';

export interface VoiceRecognitionInterfaceProps {
  onSendCommand: (spokenText: string) => void;
  onClearThread: () => void;
  onNewThread: (pillar?: MatrixPillar) => void;
  onSwitchPillar: (pillar: MatrixPillar) => void;
  onNavigate: (path: string) => void;
  onReadLastResponse: () => void;
  onStopSpeech: () => void;
  onDraftChange: (text: string) => void;
  currentDraft: string;
  isAiProcessing?: boolean;
  lastMatrixResponse?: string;
  activePillar?: MatrixPillar;
  className?: string;
}

export type SupportedLanguage = 'sk-SK' | 'cs-CZ' | 'en-US';

interface VoiceCommandMatch {
  type: 'send' | 'clear' | 'new_thread' | 'navigate' | 'pillar' | 'read' | 'stop' | 'query';
  label: string;
  actionDesc: string;
  payload?: any;
}

export default function VoiceRecognitionInterface({
  onSendCommand,
  onClearThread,
  onNewThread,
  onSwitchPillar,
  onNavigate,
  onReadLastResponse,
  onStopSpeech,
  onDraftChange,
  currentDraft,
  isAiProcessing = false,
  lastMatrixResponse,
  activePillar = 'ALL_PILLARS',
  className = ''
}: VoiceRecognitionInterfaceProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimText, setInterimText] = useState<string>('');
  const [detectedCommand, setDetectedCommand] = useState<VoiceCommandMatch | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>('sk-SK');
  const [handsFreeAutoSend, setHandsFreeAutoSend] = useState<boolean>(() => {
    return localStorage.getItem('usc_voice_hands_free') === 'true';
  });
  const [autoReadReply, setAutoReadReply] = useState<boolean>(() => {
    return localStorage.getItem('usc_voice_auto_read') === 'true';
  });
  const [continuousMode, setContinuousMode] = useState<boolean>(true);
  const [showCommandsHelp, setShowCommandsHelp] = useState<boolean>(false);
  const [autoSendCountdown, setAutoSendCountdown] = useState<number | null>(null);
  const [browserSupported, setBrowserSupported] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioAnimationRef = useRef<number | null>(null);
  const activeListeningStateRef = useRef<boolean>(false);

  // Check browser support for Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupported(false);
    }
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('usc_voice_hands_free', handsFreeAutoSend ? 'true' : 'false');
  }, [handsFreeAutoSend]);

  useEffect(() => {
    localStorage.setItem('usc_voice_auto_read', autoReadReply ? 'true' : 'false');
  }, [autoReadReply]);

  // When AI completes processing and autoReadReply is on, read aloud
  useEffect(() => {
    if (!isAiProcessing && lastMatrixResponse && autoReadReply) {
      // Small timeout to allow state to settle
      const timer = setTimeout(() => {
        onReadLastResponse();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isAiProcessing, lastMatrixResponse, autoReadReply, onReadLastResponse]);

  // Audio wave simulation while listening
  useEffect(() => {
    if (isListening) {
      const updateWave = () => {
        // Generate pseudo-random organic frequency levels between 20% and 95%
        const base = Math.sin(Date.now() / 150) * 0.3 + 0.5;
        const jitter = Math.random() * 0.4;
        setAudioLevel(Math.min(1, Math.max(0.1, base + jitter)));
        audioAnimationRef.current = requestAnimationFrame(updateWave);
      };
      audioAnimationRef.current = requestAnimationFrame(updateWave);
    } else {
      setAudioLevel(0);
      if (audioAnimationRef.current) {
        cancelAnimationFrame(audioAnimationRef.current);
      }
    }
    return () => {
      if (audioAnimationRef.current) cancelAnimationFrame(audioAnimationRef.current);
    };
  }, [isListening]);

  // Clear countdown timer
  const cancelAutoSendTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setAutoSendCountdown(null);
  }, []);

  // Command parser for spoken triggers
  const parseVoiceCommand = useCallback((transcript: string): VoiceCommandMatch | null => {
    const text = transcript.toLowerCase().trim();

    // 1. Send / Submit commands
    if (
      text === 'odoslať' ||
      text === 'odošli' ||
      text === 'pošli' ||
      text === 'pošli to' ||
      text === 'vykonaj' ||
      text === 'odošli správu' ||
      text === 'send' ||
      text === 'submit' ||
      text.endsWith('odošli') ||
      text.endsWith('pošli')
    ) {
      return {
        type: 'send',
        label: 'Odoslať správu',
        actionDesc: 'Spustenie dispečingu a odoslanie textu'
      };
    }

    // 2. Clear / Reset commands
    if (
      text === 'vymaž' ||
      text === 'zmaž' ||
      text === 'vymazať' ||
      text === 'zmazať' ||
      text === 'reset' ||
      text === 'vyčisti' ||
      text === 'clear' ||
      text === 'vymaž konverzáciu' ||
      text === 'nový rozhovor'
    ) {
      return {
        type: 'clear',
        label: 'Vymazať konverzáciu',
        actionDesc: 'Resetovanie vlákna a vyčistenie správ'
      };
    }

    // 3. New thread
    if (
      text === 'nové vlákno' ||
      text === 'nová úloha' ||
      text === 'nový chat' ||
      text === 'new thread' ||
      text === 'otvor novú úlohu'
    ) {
      return {
        type: 'new_thread',
        label: 'Nové vlákno',
        actionDesc: 'Vytvorenie novej paralelnej úlohy'
      };
    }

    // 4. TTS Read commands
    if (
      text === 'prečítaj' ||
      text === 'prečítaj odpoveď' ||
      text === 'hlas' ||
      text === 'prečítaj mi to' ||
      text === 'hovor' ||
      text === 'read' ||
      text === 'read aloud'
    ) {
      return {
        type: 'read',
        label: 'Prečítať odpoveď',
        actionDesc: 'Prečítanie poslednej správy syntézou reči'
      };
    }

    // 5. Stop commands
    if (
      text === 'zastav' ||
      text === 'stop' ||
      text === 'ticho' ||
      text === 'stíšiť' ||
      text === 'prestaň' ||
      text === 'stop speech'
    ) {
      return {
        type: 'stop',
        label: 'Zastaviť',
        actionDesc: 'Zastavenie hlasového výstupu'
      };
    }

    // 6. Navigation commands
    if (text.includes('obchod') || text.includes('e-shop') || text.includes('eshop') || text.includes('shop') || text.includes('oblečenie')) {
      if (text.startsWith('otvor') || text.startsWith('choď') || text.startsWith('prejdi') || text.startsWith('go to') || text.startsWith('open')) {
        return {
          type: 'navigate',
          label: 'Prejsť do E-Shopu',
          actionDesc: 'Presmerovanie na /shop',
          payload: '/shop'
        };
      }
    }

    if (text.includes('autá') || text.includes('flotil') || text.includes('prenájom') || text.includes('rent') || text.includes('vozid')) {
      if (text.startsWith('otvor') || text.startsWith('choď') || text.startsWith('prejdi') || text.startsWith('open')) {
        return {
          type: 'navigate',
          label: 'Prejsť na Rent-a-Wheel',
          actionDesc: 'Presmerovanie na /rent',
          payload: '/rent'
        };
      }
    }

    if (text.includes('prác') || text.includes('turnus') || text.includes('zákazk') || text.includes('work')) {
      if (text.startsWith('otvor') || text.startsWith('choď') || text.startsWith('prejdi') || text.startsWith('open')) {
        return {
          type: 'navigate',
          label: 'Prejsť na U.S.C. Work',
          actionDesc: 'Presmerovanie na /work',
          payload: '/work'
        };
      }
    }

    if (text.includes('burz') || text.includes('trade') || text.includes('barter') || text.includes('zakasajee')) {
      if (text.startsWith('otvor') || text.startsWith('choď') || text.startsWith('prejdi') || text.startsWith('open')) {
        return {
          type: 'navigate',
          label: 'Prejsť na Burzu Trade',
          actionDesc: 'Presmerovanie na /trade',
          payload: '/trade'
        };
      }
    }

    if (text.includes('rituál') || text.includes('369') || text.includes('trezor') || text.includes('manifest')) {
      if (text.startsWith('otvor') || text.startsWith('choď') || text.startsWith('prejdi') || text.startsWith('open')) {
        return {
          type: 'navigate',
          label: 'Prejsť do Rituálu 369',
          actionDesc: 'Presmerovanie na /ritual369',
          payload: '/ritual369'
        };
      }
    }

    if (text.includes('admin') || text.includes('dispečing') || text.includes('správ')) {
      if (text.startsWith('otvor') || text.startsWith('choď') || text.startsWith('prejdi') || text.startsWith('open')) {
        return {
          type: 'navigate',
          label: 'Prejsť do Admin Panelu',
          actionDesc: 'Presmerovanie na /admin',
          payload: '/admin'
        };
      }
    }

    // 7. Pillar switching
    if (text.includes('prepni na autá') || text.includes('režim flotila') || text.includes('flotila mód')) {
      return {
        type: 'pillar',
        label: 'Režim: Rent-a-Wheel',
        actionDesc: 'Prepnutie dispečingu na flotilu',
        payload: 'RENT_A_WHEEL'
      };
    }
    if (text.includes('prepni na obchod') || text.includes('režim streetwear') || text.includes('mód eshop')) {
      return {
        type: 'pillar',
        label: 'Režim: U.S.W. Streetwear',
        actionDesc: 'Prepnutie dispečingu na e-shop',
        payload: 'USW_STREETWEAR'
      };
    }
    if (text.includes('prepni na prácu') || text.includes('režim turnusy') || text.includes('mód práca')) {
      return {
        type: 'pillar',
        label: 'Režim: U.S.C. Work',
        actionDesc: 'Prepnutie dispečingu na zákazky',
        payload: 'USC_WORK'
      };
    }
    if (text.includes('prepni na matrix') || text.includes('všetky piliere') || text.includes('hlavný dispečing')) {
      return {
        type: 'pillar',
        label: 'Režim: Globálny Dispečing',
        actionDesc: 'Prepnutie na všetky piliere',
        payload: 'ALL_PILLARS'
      };
    }

    return null;
  }, []);

  // Execute recognized action
  const executeCommand = useCallback((cmd: VoiceCommandMatch, spokenText: string) => {
    switch (cmd.type) {
      case 'send':
        if (currentDraft.trim()) {
          onSendCommand(currentDraft.trim());
        } else if (spokenText) {
          // If clean query without keyword
          const clean = spokenText.replace(/odošli|pošli|send|submit/gi, '').trim();
          if (clean) onSendCommand(clean);
        }
        break;

      case 'clear':
        onClearThread();
        onDraftChange('');
        break;

      case 'new_thread':
        onNewThread();
        onDraftChange('');
        break;

      case 'read':
        onReadLastResponse();
        break;

      case 'stop':
        onStopSpeech();
        break;

      case 'navigate':
        if (cmd.payload) onNavigate(cmd.payload);
        break;

      case 'pillar':
        if (cmd.payload) onSwitchPillar(cmd.payload as MatrixPillar);
        break;

      default:
        break;
    }
  }, [currentDraft, onSendCommand, onClearThread, onNewThread, onReadLastResponse, onStopSpeech, onNavigate, onSwitchPillar, onDraftChange]);

  // Start Speech Recognition
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Hlasové rozpoznávanie Web Speech API nie je v tomto prehliadači dostupné. Odporúčame Google Chrome alebo Edge.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = continuousMode;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        activeListeningStateRef.current = true;
        setIsExpanded(true);
      };

      recognition.onresult = (event: any) => {
        cancelAutoSendTimer();

        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk;
          } else {
            currentInterim += transcriptChunk;
          }
        }

        const activeText = (finalTranscript || currentInterim).trim();
        setInterimText(currentInterim);

        if (activeText) {
          // Check for high-priority voice command
          const detected = parseVoiceCommand(activeText);
          if (detected) {
            setDetectedCommand(detected);
            // Execute the system voice command immediately!
            executeCommand(detected, activeText);
            setInterimText('');
            return;
          } else {
            setDetectedCommand(null);
          }
        }

        // If it's final speech (sentence concluded)
        if (finalTranscript) {
          const updatedDraft = currentDraft 
            ? `${currentDraft.trim()} ${finalTranscript.trim()}`
            : finalTranscript.trim();

          onDraftChange(updatedDraft);
          setInterimText('');

          // If Hands-Free Auto Send is active, start countdown to send!
          if (handsFreeAutoSend && updatedDraft.trim()) {
            setAutoSendCountdown(2);
            let count = 2;

            countdownIntervalRef.current = setInterval(() => {
              count -= 1;
              if (count > 0) {
                setAutoSendCountdown(count);
              } else {
                cancelAutoSendTimer();
                onSendCommand(updatedDraft.trim());
              }
            }, 1000);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[Web Speech API] Chyba rozpoznávania reči:', event.error);
        if (event.error === 'not-allowed') {
          alert("Prístup k mikrofónu bol zamietnutý. Povoľte mikrofón v nastaveniach prehliadača.");
          setIsListening(false);
          activeListeningStateRef.current = false;
        } else if (event.error !== 'no-speech') {
          setIsListening(false);
          activeListeningStateRef.current = false;
        }
      };

      recognition.onend = () => {
        // If continuous mode is on and user didn't explicitly hit stop, restart listening
        if (activeListeningStateRef.current && continuousMode) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
            activeListeningStateRef.current = false;
          }
        } else {
          setIsListening(false);
          activeListeningStateRef.current = false;
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (e) {
      console.error('[Web Speech API] Zlyhanie štartu:', e);
      setIsListening(false);
      activeListeningStateRef.current = false;
    }
  }, [
    language,
    continuousMode,
    handsFreeAutoSend,
    currentDraft,
    onDraftChange,
    onSendCommand,
    parseVoiceCommand,
    executeCommand,
    cancelAutoSendTimer
  ]);

  // Stop Speech Recognition
  const stopListening = useCallback(() => {
    activeListeningStateRef.current = false;
    cancelAutoSendTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setInterimText('');
    setDetectedCommand(null);
  }, [cancelAutoSendTimer]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Sound chimes indicator
  const playTriggerSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {}
  };

  const handleManualSendNow = () => {
    cancelAutoSendTimer();
    if (currentDraft.trim()) {
      onSendCommand(currentDraft.trim());
    }
  };

  if (!browserSupported) {
    return (
      <div className={`bg-red-950/40 border border-red-800 p-2 text-red-300 text-xs font-mono flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>Web Speech API nie je v tomto prehliadači plne podporované (odporúčame Google Chrome).</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-950 border-2 ${isListening ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.35)]' : 'border-zinc-800'} transition-all ${className}`}>
      
      {/* Hlavný Kompaktný / HUD Panel */}
      <div className="p-2.5 sm:p-3 flex items-center justify-between gap-3 bg-zinc-900/90 flex-wrap">
        
        {/* Ľavá strana: Mikrofón prepínač & Pulzujúci stav */}
        <div className="flex items-center gap-2.5">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playTriggerSound();
              toggleListening();
            }}
            className={`p-2 sm:px-3 sm:py-2 border-2 font-black uppercase text-xs flex items-center gap-2 transition-all ${
              isListening
                ? 'bg-red-600 hover:bg-red-500 text-white border-white shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse'
                : 'bg-zinc-950 hover:bg-zinc-800 text-emerald-400 hover:text-white border-emerald-500/80 shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]'
            }`}
            title={isListening ? "Ukončiť počúvanie hlasu" : "Spustiť hlasové ovládanie (Web Speech API)"}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 text-white" />
                <span className="font-mono text-[11px] hidden sm:inline">POČÚVAM (LIVE)</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-[11px] hidden sm:inline">HLASOVÉ OVLÁDANIE</span>
              </>
            )}
          </motion.button>

          {/* Audio Wave Visualizer Bars */}
          {isListening && (
            <div className="flex items-center gap-0.5 px-2 py-1 bg-black border border-emerald-500/50">
              {[0.4, 0.8, 1.0, 0.7, 0.9, 0.5, 0.85, 0.6].map((mult, idx) => {
                const heightPercent = Math.max(15, Math.min(100, audioLevel * mult * 100));
                return (
                  <motion.div
                    key={idx}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.08 }}
                    className="w-1 bg-emerald-400"
                    style={{ height: `${heightPercent}%`, minHeight: '4px', maxHeight: '18px' }}
                  />
                );
              })}
            </div>
          )}

          {/* Hands-free odoslanie countdown bubble */}
          {autoSendCountdown !== null && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500 text-black font-mono text-[10px] font-black uppercase border border-black animate-bounce">
              <Zap className="w-3 h-3" />
              <span>Odosielam za {autoSendCountdown}s...</span>
              <button 
                onClick={cancelAutoSendTimer} 
                className="underline hover:text-white ml-1 text-[9px]"
              >
                Zrušiť
              </button>
            </div>
          )}
        </div>

        {/* Stred/Pravá strana: Rýchle prepínače Hands-Free & Hlasová odpoveď & Jazyk */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          
          {/* Hands-Free Auto-Send Toggle */}
          <button
            onClick={() => setHandsFreeAutoSend(prev => !prev)}
            className={`px-2 py-1 border text-[10px] uppercase font-bold flex items-center gap-1 transition-colors ${
              handsFreeAutoSend 
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title="Po dopovedaní automaticky odošle správu do Trinity Core"
          >
            <Zap className={`w-3 h-3 ${handsFreeAutoSend ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <span>Hands-Free</span>
            <span className={`px-1 text-[9px] ${handsFreeAutoSend ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
              {handsFreeAutoSend ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Auto Read Reply (Text-to-Speech) Toggle */}
          <button
            onClick={() => setAutoReadReply(prev => !prev)}
            className={`px-2 py-1 border text-[10px] uppercase font-bold flex items-center gap-1 transition-colors ${
              autoReadReply 
                ? 'bg-blue-950 text-blue-300 border-blue-500' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title="Automaticky prečítať odpoveď umelej inteligencie nahlas"
          >
            {autoReadReply ? <Volume2 className="w-3 h-3 text-blue-400" /> : <VolumeX className="w-3 h-3 text-zinc-500" />}
            <span>Hlasová Odozva</span>
          </button>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-black border border-zinc-700 text-zinc-300 text-[10px] px-1.5 py-1 focus:outline-none focus:border-emerald-500 font-mono"
            title="Jazyk hlasového rozpoznávania"
          >
            <option value="sk-SK">🇸🇰 Slovenčina</option>
            <option value="cs-CZ">🇨🇿 Čeština</option>
            <option value="en-US">🇺🇸 English</option>
          </select>

          {/* Commands Help Cheat-Sheet Toggle */}
          <button
            onClick={() => setShowCommandsHelp(prev => !prev)}
            className={`p-1 border text-zinc-400 hover:text-white transition-colors ${showCommandsHelp ? 'bg-zinc-800 border-zinc-600 text-amber-400' : 'bg-black border-zinc-800'}`}
            title="Zoznam hlasových príkazov"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Expand/Collapse HUD Details */}
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-1 text-zinc-400 hover:text-white bg-black border border-zinc-800"
            title={isExpanded ? "Zbaliť hlasový HUD" : "Rozbaliť hlasový HUD"}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Rozbalená Sekcia: Živý prepis reči (Interim Speech Display) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-800 bg-zinc-950 p-3 overflow-hidden text-xs font-mono space-y-2.5"
          >
            
            {/* Live Recognized Speech Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-black mb-1">
                  <Radio className={`w-3 h-3 ${isListening ? 'text-emerald-400 animate-pulse' : 'text-zinc-600'}`} />
                  <span>Živý Prepis Hlasu (Web Speech API):</span>
                  {isListening && <span className="text-emerald-400 font-bold">• Nahrávam</span>}
                </div>

                <div className="min-h-[38px] p-2 bg-black border border-zinc-800 text-zinc-200">
                  {interimText ? (
                    <span className="text-emerald-300 italic font-semibold">
                      "{interimText}" <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse ml-0.5" />
                    </span>
                  ) : currentDraft ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white font-medium">{currentDraft}</span>
                      <span className="text-[10px] text-zinc-500 whitespace-nowrap">(Pripravené na odoslanie)</span>
                    </div>
                  ) : (
                    <span className="text-zinc-600">
                      {isListening 
                        ? "Hovorte do mikrofónu... (napr. 'Odošli', 'Aké autá sú voľné?', 'Otvor e-shop', 'Prečítaj odpoveď')" 
                        : "Kliknite na 'HLASOVÉ OVLÁDANIE' a vyslovte príkaz."}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons for current transcript */}
              {currentDraft && (
                <div className="flex flex-col gap-1 shrink-0 pt-4">
                  <button
                    onClick={handleManualSendNow}
                    disabled={isAiProcessing}
                    className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[10px] flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" /> Odoslať
                  </button>
                  <button
                    onClick={() => {
                      cancelAutoSendTimer();
                      onDraftChange('');
                    }}
                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-[10px] uppercase font-bold"
                  >
                    Vyčistiť
                  </button>
                </div>
              )}
            </div>

            {/* Detected Command Notification Banner */}
            {detectedCommand && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2 bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-emerald-500 text-black font-black text-[9px] uppercase">
                    ⚡ PRÍKAZ DETEGOVANÝ
                  </span>
                  <span className="font-bold text-white">{detectedCommand.label}</span>
                  <span className="text-zinc-400 text-[10px]">({detectedCommand.actionDesc})</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </motion.div>
            )}

            {/* Quick Command Pills for Instant Triggering without speaking */}
            <div className="pt-2 border-t border-zinc-900 flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-[10px]">
              <span className="text-zinc-500 uppercase font-black text-[9px] shrink-0">Hlasové skratky:</span>
              <button
                onClick={() => onSendCommand("Aké autá sú dnes voľné na prenájom v Rent-a-Wheel?")}
                className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 shrink-0"
              >
                🚗 "Aké autá sú voľné?"
              </button>
              <button
                onClick={() => onSendCommand("Aké streetwear mikiny a drops máme skladom v U.S.W.?")}
                className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-pink-400 border border-zinc-800 shrink-0"
              >
                👕 "Aké mikiny sú skladom?"
              </button>
              <button
                onClick={() => onSendCommand("Vypočítaj trasu Bratislava - Mníchov pre dodávku vrátane nafty a marže")}
                className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-blue-400 border border-zinc-800 shrink-0"
              >
                🚚 "Vypočítaj trasu do Mníchova"
              </button>
              <button
                onClick={() => onReadLastResponse()}
                className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 shrink-0 flex items-center gap-1"
              >
                <Volume2 className="w-2.5 h-2.5" /> "Prečítaj odpoveď"
              </button>
              <button
                onClick={() => onClearThread()}
                className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-800 shrink-0"
              >
                🔄 "Vymazať konverzáciu"
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Pomocník hlasových príkazov (Cheat-Sheet Modal) */}
      <AnimatePresence>
        {showCommandsHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t-2 border-amber-500 bg-zinc-950 p-4 text-xs font-mono"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Command className="w-4 h-4 text-amber-400" />
                <span className="font-black uppercase text-white tracking-wide">
                  Slovník Hlasových Príkazov Web Speech API
                </span>
              </div>
              <button
                onClick={() => setShowCommandsHelp(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px]">
              
              {/* Sekcia 1: Ovládanie chatu */}
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 space-y-1.5">
                <div className="text-amber-400 font-bold uppercase flex items-center gap-1 text-[10px]">
                  <Send className="w-3 h-3" /> Odosielanie & Správa
                </div>
                <ul className="space-y-1 text-zinc-300">
                  <li><strong className="text-white">"Odošli" / "Pošli"</strong> — Okamžite odošle zadanú požiadavku</li>
                  <li><strong className="text-white">"Vymaž" / "Reset"</strong> — Resetuje a vymaže vlákno správ</li>
                  <li><strong className="text-white">"Nové vlákno"</strong> — Otvorí novú paralelnú úlohu</li>
                </ul>
              </div>

              {/* Sekcia 2: Audio & Hlasový výstup */}
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 space-y-1.5">
                <div className="text-blue-400 font-bold uppercase flex items-center gap-1 text-[10px]">
                  <Volume2 className="w-3 h-3" /> Hlasový Výstup (TTS)
                </div>
                <ul className="space-y-1 text-zinc-300">
                  <li><strong className="text-white">"Prečítaj" / "Hlas"</strong> — Prečíta poslednú odpoveď Trinity nahlas</li>
                  <li><strong className="text-white">"Zastav" / "Ticho"</strong> — Zastaví hlasové čítanie odpovede</li>
                  <li><strong className="text-white">"Hands-free"</strong> — Automatické odoslanie po dopovedaní</li>
                </ul>
              </div>

              {/* Sekcia 3: Navigácia v portáli */}
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 space-y-1.5">
                <div className="text-emerald-400 font-bold uppercase flex items-center gap-1 text-[10px]">
                  <Compass className="w-3 h-3" /> Hlasová Navigácia
                </div>
                <ul className="space-y-1 text-zinc-300">
                  <li><strong className="text-white">"Otvor e-shop"</strong> — Presmeruje na obchod /shop</li>
                  <li><strong className="text-white">"Otvor autá" / "Rent"</strong> — Presmeruje na autopožičovňu</li>
                  <li><strong className="text-white">"Otvor prácu"</strong> — Presmeruje na U.S.C. Work /work</li>
                  <li><strong className="text-white">"Otvor burzu"</strong> — Presmeruje na Trade /trade</li>
                  <li><strong className="text-white">"Otvor administráciu"</strong> — Presmeruje do Admina</li>
                </ul>
              </div>

            </div>

            <div className="mt-3 pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 flex items-center justify-between">
              <span>💡 Ak poviete bežnú vetu (napr. "Aké sú podmienky na prenájom dodávky?"), systém ju automaticky zapíše do zadania.</span>
              <span className="text-emerald-400 font-bold">Hands-Free: Podpora Web Speech API 24/7</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
