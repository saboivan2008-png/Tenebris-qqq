import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  Terminal, 
  RotateCcw, 
  Check, 
  Copy, 
  Cpu, 
  ShieldAlert, 
  Truck, 
  Shirt, 
  Hammer, 
  Scale, 
  Key, 
  Radio, 
  ChevronRight,
  Sliders,
  Flame,
  ArrowRight
} from 'lucide-react';
import Markdown from 'react-markdown';
import { trackPillarEngagement } from '../../lib/analytics';

export type SuperMode = 'omni' | 'fleet' | 'work' | 'streetwear' | 'escrow' | 'code' | 'ritual369';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thoughtProcess?: string[];
  speechText?: string;
  suggestedActions?: Array<{
    label: string;
    actionType: string;
    description?: string;
  }>;
  pillar?: string;
  timestamp: string;
}

interface TrinitySuperAssistantProps {
  onTriggerAction?: (actionType: string, payload?: any) => void;
}

export default function TrinitySuperAssistant({ onTriggerAction }: TrinitySuperAssistantProps) {
  const [mode, setMode] = useState<SuperMode>('omni');
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `### 🤖 TRINITY SUPER AI ASISTENT V3.69 ONLINE

Vitaj v centrálnom riadiacom centre. Som **Trinity Super AI Asistent** — autonómny supermozog ekosystému **Underground Street Collective (U.S.C.)**.

Riadiaci protokol:
- 🚗 **Flotilový Dispečing**: Okamžitá alokácia dodávok, kalkulácia nafty a trasy na nemecké turnusy.
- 🔨 **Montáže & Turnusy**: Zmluvy o dielo, overenie formulárov A1 a nemecké sadzby (§ 13b UStG).
- 👑 **Streetwear Dielňa**: 450g bavlna, strihy, kalkulácie marží a limitované dropy pre U.S.W.
- 🛡️ **Trade Zakasajee**: Eskró ochrana, konvoje a overovacie transakčné kľúče.
- 🔮 **369 Nikola Tesla Core**: Autonómne rozhodovanie a synchronizácia všetkých 6 pilierov.

*Zadaj príkaz textom alebo použi mikrofón dole.*`,
      speechText: "Trinity Super AI Asistent je plne online. Všetkých šesť pilierov je pripravených na tvoj príkaz.",
      thoughtProcess: [
        "Inicializácia neutrónového jadra Trinity 3.69",
        "Overenie spojenia s Google Cloud Core a Cloudflare Edge",
        "Pripravený dispečerský režim pre celú U.S.C. sieť"
      ],
      suggestedActions: [
        { label: "🚚 Pripraviť turnus do Nemecka", actionType: "PREPARE_TURNUS", description: "Transporter + 4 montéri" },
        { label: "👕 Navrhnúť 450g Hoodie Drop", actionType: "DESIGN_DROP", description: "Heavyweight bavlna & kalkulácia" },
        { label: "⚖️ Vygenerovať A1 zmluvu", actionType: "CREATE_CONTRACT", description: "B2B Subunternehmer" }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'sk-SK';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto scroll on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Speech synthesis speaker
  const speakText = (text: string) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // stop previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'sk-SK';
    utterance.rate = 1.05;
    utterance.pitch = 0.95; // slightly lower pitch for a high-tech assistant tone
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert("Hlasové rozpoznávanie nie je podporované v tomto prehliadači (skús Chrome / Edge).");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isThinking) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsThinking(true);

    trackPillarEngagement('AURU_TRINITY', 'super_assistant_query', {
      mode,
      queryLength: query.length
    });

    try {
      const res = await fetch('/api/ai/super-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          mode,
          history: messages.slice(-4)
        })
      });

      const responseData = await res.json();

      if (responseData.success && responseData.data) {
        const assistantReply: Message = {
          id: `reply-${Date.now()}`,
          role: 'assistant',
          content: responseData.data.reply,
          speechText: responseData.data.speechText,
          thoughtProcess: responseData.data.thoughtProcess,
          suggestedActions: responseData.data.suggestedActions,
          pillar: responseData.data.pillar,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantReply]);

        if (responseData.data.speechText) {
          speakText(responseData.data.speechText);
        }
      } else {
        throw new Error(responseData.error || "Chyba servera");
      }
    } catch {
      const fallbackReply: Message = {
        id: `reply-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **ASISTENČNÝ PROTOKOL TRINITY:**\n\nPríkaz **"${query}"** bol zaznamenaný a vyhodnotený v núdzovom bezpečnostnom režime.\n- Skontroluj nastavenie parametrov v sekcii Nemecké turnusy a Flotila.\n- Pre okamžitú exekúciu použi priame akcie nižšie.`,
        speechText: "Príkaz bol prijatý v núdzovom offline režime Trinity.",
        thoughtProcess: [
          "Núdzové smerovanie požiadavky",
          "Lokálna analýza ekosystému U.S.C."
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsThinking(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleActionClick = (action: { label: string; actionType: string; description?: string }) => {
    if (onTriggerAction) {
      onTriggerAction(action.actionType);
    }
    // Also feed it into assistant
    handleSendMessage(`Aktivuj akciu: ${action.label}`);
  };

  return (
    <div className="bg-zinc-950 border-4 border-black relative shadow-[10px_10px_0px_0px_rgba(245,158,11,0.5)] overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-black border-b-2 border-zinc-800 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500 text-black flex items-center justify-center font-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">
                Trinity Super AI <span className="text-amber-500">Asistent</span>
              </h2>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 uppercase font-bold">
                V3.69 OMNI
              </span>
            </div>
            <p className="text-zinc-400 text-xs font-mono">
              Autonómny supermozog celého ekosystému Underground Street Collective
            </p>
          </div>
        </div>

        {/* Voice Output & Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={`px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
              isVoiceEnabled 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500' 
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
            title={isVoiceEnabled ? 'Hlasový výstup zapnutý' : 'Hlasový výstup vypnutý'}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isVoiceEnabled ? 'HLAS ZAP' : 'HLAS VYP'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              setMessages([messages[0]]);
            }}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            title="Resetovať konverzáciu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Selector Ribbon */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 p-2 sm:px-6 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold whitespace-nowrap mr-1">
          Špecializácia:
        </span>

        {[
          { id: 'omni', label: '🧠 Omni Mozog', desc: 'Všetky piliere' },
          { id: 'fleet', label: '🚗 Flotila & Trasy', desc: 'Rent-a-Wheel' },
          { id: 'work', label: '🔨 Turnusy & A1', desc: 'U.S.C. Work' },
          { id: 'streetwear', label: '👑 Streetwear 450g', desc: 'U.S.W. Dielňa' },
          { id: 'escrow', label: '🛡️ Trade & Eskró', desc: 'Zakasajee Kľúče' },
          { id: 'code', label: '⚡ Kód & Cloudflare', desc: 'Cloud Infra' },
          { id: 'ritual369', label: '🔮 369 Matrix', desc: 'Nikola Tesla Core' },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id as SuperMode)}
            className={`px-3 py-1.5 text-xs font-mono font-bold whitespace-nowrap transition-all border ${
              mode === item.id
                ? 'bg-amber-500 text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Conversation Stream */}
      <div className="h-[460px] overflow-y-auto p-4 sm:p-6 space-y-6 bg-zinc-950 font-mono custom-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1.5 text-[11px] text-zinc-500">
              <span className="font-bold uppercase text-zinc-400">
                {msg.role === 'user' ? '👤 Operátor' : '🤖 Trinity Super AI'}
              </span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div 
              className={`max-w-3xl border-2 p-4 sm:p-5 relative ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-zinc-900 text-zinc-100 border-zinc-700 shadow-[4px_4px_0px_0px_rgba(245,158,11,0.2)]'
              }`}
            >
              {/* Chain of Thought Visualization if present */}
              {msg.thoughtProcess && msg.thoughtProcess.length > 0 && (
                <div className="mb-4 bg-black border border-zinc-800 p-3 text-[11px] text-amber-400/90 font-mono">
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold mb-2 uppercase text-[10px] tracking-wider">
                    <Cpu className="w-3.5 h-3.5 animate-pulse" />
                    <span>Myšlienkový Postup Super Asistenta:</span>
                  </div>
                  <ul className="space-y-1">
                    {msg.thoughtProcess.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <span className="text-zinc-600">›</span>
                        <span className="text-zinc-300">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Message Markdown Body */}
              <div className={`prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed ${msg.role === 'user' ? 'text-black prose-p:text-black font-sans font-medium' : ''}`}>
                <Markdown>{msg.content}</Markdown>
              </div>

              {/* Action Buttons generated by AI */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Odporúčaná akcia:
                  </span>
                  {msg.suggestedActions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      type="button"
                      onClick={() => handleActionClick(act)}
                      className="text-xs bg-black hover:bg-zinc-800 text-white border border-amber-500/60 px-2.5 py-1 flex items-center gap-1.5 transition-colors font-bold"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-3 h-3 text-amber-500" />
                    </button>
                  ))}
                </div>
              )}

              {/* Copy message button */}
              {msg.role === 'assistant' && (
                <button
                  type="button"
                  onClick={() => copyMessage(msg.id, msg.content)}
                  className="absolute top-2 right-2 p-1.5 text-zinc-500 hover:text-white bg-black/50 border border-zinc-800 transition-colors"
                  title="Kopírovať odpoveď"
                >
                  {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-500 text-black flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-zinc-900 border-2 border-amber-500/60 p-4 text-xs font-mono text-amber-400 flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
              <span>Trinity Super AI uvažuje, preveruje flotilu, zmluvy a generuje riešenie...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="bg-zinc-900 border-t border-zinc-800 p-2 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold whitespace-nowrap">
          ⚡ 1-Click Príkazy:
        </span>
        {[
          'Zorganizuj nemecký turnus pre 4 chlapov do Dingolfingu s dodávkou',
          'Navrhni nový 450g streetwear drop mikiny CHOICE IS YOURS 369',
          'Vygeneruj nemeckú zmluvu pre živnostníka so sadzbou 28.5€/hod',
          'Vypočítaj maržu a náklady nafty pre trasu Bratislava - Mníchov',
          'Vygeneruj eskró bezpečnostný kľúč pre obchod Zakasajee'
        ].map((promptText, pIdx) => (
          <button
            key={pIdx}
            type="button"
            onClick={() => handleSendMessage(promptText)}
            className="text-[11px] font-mono bg-black hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 whitespace-nowrap transition-colors"
          >
            {promptText.slice(0, 36)}...
          </button>
        ))}
      </div>

      {/* Interactive Input Bar */}
      <div className="bg-black border-t-2 border-zinc-800 p-4 sm:p-6">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 sm:gap-3"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoiceListening}
            className={`p-3 sm:p-4 border-2 transition-all flex items-center justify-center ${
              isListening
                ? 'bg-red-600 text-white border-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.8)]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-700 hover:border-amber-500'
            }`}
            title={isListening ? 'Nahráva sa tvoj hlas... (klikni pre stop)' : 'Klikni a hovor hlasom'}
          >
            {isListening ? <Mic className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={isListening ? 'Počúvam tvoj hlas... hovor teraz.' : 'Zadaj príkaz pre Trinity Super Asistenta (napr. zorganizuj turnus, navrhni mikinu)...'}
              disabled={isThinking}
              className="w-full bg-zinc-900 border-2 border-zinc-700 p-3 sm:p-4 text-white font-mono text-xs sm:text-sm focus:border-amber-500 outline-none transition-colors"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isThinking}
            className={`p-3 sm:p-4 font-black uppercase tracking-widest text-xs sm:text-sm transition-all border-2 border-black flex items-center gap-2 ${
              !inputQuery.trim() || isThinking
                ? 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Exekúcia</span>
          </button>
        </form>
      </div>
    </div>
  );
}
