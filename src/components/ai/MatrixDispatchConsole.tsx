import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
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
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Maximize2,
  Copy,
  Check,
  Download,
  Code2,
  Target,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import type { MatrixPillar, DispatchMessage } from '../../types';

interface MatrixDispatchConsoleProps {
  initialPillar?: MatrixPillar;
  embeddedMode?: boolean;
}

const PRESET_PROMPTS: Record<MatrixPillar, Array<{ label: string; prompt: string; icon: string }>> = {
  ALL_PILLARS: [
    { label: '📊 Prehľad Synergie Ekosystému', prompt: 'Poskytni celkový prehľad ako 6 pilierov U.S.C. spolupracuje pri realizácii veľkej B2B zákazky.', icon: '⚡' },
    { label: '🚀 Stratégia Expanzie 2026', prompt: 'Navrhni plán optimalizácie nákladov a maximalizácie ziskov pre flotilu a stavebné turnusy na tento mesiac.', icon: '🎯' },
    { label: '🛡️ Audit Bezpečnosti & Compliance', prompt: 'Aké sú kľúčové právne a daňové náležitosti pri prepojení agentúry U.S.C. Work a logistiky Rent a Wheel?', icon: '🔒' }
  ],
  AURU_TRINITY: [
    { label: '💻 Architektúra Nového Modulu', prompt: 'Navrhni optimálnu architektúru pre automatické generovanie faktúr a prepojenie s bankovými API.', icon: '🤖' },
    { label: '📈 Automatizácia Lead Huntera', prompt: 'Ako nastaviť AI zber B2B dopytov pre montážne práce v Nemecku a stavebné firmy?', icon: '🎯' },
    { label: '⚡ Skript na Dochádzku & Mzdy', prompt: 'Vygeneruj TypeScript funkciu pre výpočet nemeckých diét a turnusových odpracovaných hodín pre živnostníka.', icon: '📜' }
  ],
  USW_STREETWEAR: [
    { label: '👑 Kalkulácia Nákladov na Drop', prompt: 'Vypočítaj maržu a odporúčanú predajnú cenu pre limitovanú edíciu 100 ks Heavyweight mikín s 3D potlačou.', icon: '👕' },
    { label: '🔥 Stratégia Promo Kódov', prompt: 'Priprav návrh VIP predpredajnej kampane pre držiteľov early-access prístupov.', icon: '⚡' }
  ],
  RENT_A_WHEEL: [
    { label: '🚚 Kalkulácia Trasy Bratislava - Mníchov', prompt: 'Vypočítaj náklady na trasu Bratislava - Mníchov dodávkou L3H2 pri náklade 800kg a cene nafty 1.62€/l.', icon: '📍' },
    { label: '🚕 Rentabilita Taxi Flotily (Bolt/Wolt)', prompt: 'Analyzuj týždennú rentabilitu prenájmu Škoda Octavia Combi pre kuriéra s nájazdom 1500 km.', icon: '⛽' }
  ],
  USC_WORK: [
    { label: '⚡ Preverenie Elektrikára pre DE', prompt: 'Analyzuj profil elektrikára s §22, 4 roky praxe a nemčinou B1 na turnus do Frankfurtu. Aká je férová sadzba?', icon: '👷' },
    { label: '📑 A1 & Freistellung Kontrolný Zoznam', prompt: 'Uveď presný postup a zoznam povinných dokumentov pred vycestovaním živnostníka na stavebný projekt do Rakúska.', icon: '📋' }
  ],
  TRADE_ZAKASAJEE: [
    { label: '🛡️ Eskró Protokol & Bezpečný Tranzit', prompt: 'Navrhni bezpečnostné a kryptografické zabezpečenie pre VIP nákladový manifest cez Viedenský koridor.', icon: '📦' },
    { label: '🌍 Colná & Tranzitná Stratégia', prompt: 'Aké sú colné požiadavky a optimálna trasa pre expresný tranzit priemyselných komponentov do Švajčiarska?', icon: '🌐' }
  ],
  USC_SOLIDARITY: [
    { label: '🤝 Transparentný Fond Podpory', prompt: 'Ako transparentne evidovať a overovať žiadosti o pomoc pre rodiny a remeselníkov v núdzi?', icon: '❤️' },
    { label: '🎯 Komunitný Príspevok z Predajov', prompt: 'Navrhni model prerozdelenia 5% zo zisku každého predaného U.S.W. kusu do fondu Solidarity.', icon: '🤝' }
  ]
};

export default function MatrixDispatchConsole({ initialPillar = 'ALL_PILLARS', embeddedMode = false }: MatrixDispatchConsoleProps) {
  const [selectedPillar, setSelectedPillar] = useState<MatrixPillar>(initialPillar);
  const [messages, setMessages] = useState<DispatchMessage[]>([
    {
      id: 'init-1',
      role: 'matrix',
      text: 'Vítam ťa v **U.S.C. Matrix AI Dispečingu & Auru Trinity Core** (Gemini 3.7 Flash).\n\nSom centrálny operačný mozog prepájajúci všetkých 6 pilierov: **Auru Trinity (Kód & Lead Hunter), U.S.W., Rent a Wheel, U.S.C. Work, Trade Zakasajee a Solidarity**.\n\nMôžeš zadať priamu otázku, spustiť generovanie kódu, vypočítať trasu alebo analyzovať remeselný profil.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pillar: 'ALL_PILLARS'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Specialized Route Calculator Tool
  const [showRouteCalc, setShowRouteCalc] = useState(false);
  const [routeOrigin, setRouteOrigin] = useState('Bratislava');
  const [routeDestination, setRouteDestination] = useState('Mníchov');
  const [routeVehicle, setRouteVehicle] = useState('Dodávka L3H2 (Maxi)');
  const [routeWeight, setRouteWeight] = useState(750);
  const [routeFuelPrice, setRouteFuelPrice] = useState(1.62);

  // Specialized Worker Matcher Tool
  const [showWorkerMatch, setShowWorkerMatch] = useState(false);
  const [workerProfession, setWorkerProfession] = useState('Elektromontér / Priemyselný elektrikár');
  const [workerExp, setWorkerExp] = useState(5);
  const [workerLang, setWorkerLang] = useState('B1 - Dohovorí sa na stavbe');
  const [workerCerts, setWorkerCerts] = useState('§22, SCC certifikát, Vodičský preukaz B');

  // Specialized Code Generator Tool (Auru Trinity)
  const [showCodeGen, setShowCodeGen] = useState(false);
  const [codeTaskType, setCodeTaskType] = useState('Automatizačný Invoicing Skript');
  const [codeTechStack, setCodeTechStack] = useState('TypeScript / Node.js / Express');
  const [codeGoal, setCodeGoal] = useState('Generovanie PDF faktúr s QR kódom PayBySquare pre živnostníkov');

  // Specialized Lead Hunter Tool
  const [showLeadHunter, setShowLeadHunter] = useState(false);
  const [leadNiche, setLeadNiche] = useState('Stavebné firmy a priemyselné montáže');
  const [leadCountry, setLeadCountry] = useState('Nemecko (Bavorsko a Bádensko-Württembersko)');
  const [leadOffer, setLeadOffer] = useState('Partie certifikovaných elektrikárov a zváračov s vlastnými dodávkami');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: DispatchMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pillar: selectedPillar
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/ai/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mode: selectedPillar,
          context: {
            activePillar: selectedPillar,
            operatorRank: 'SUPER_ADMIN_369',
            platform: 'U.S.C. Matrix Core'
          },
          conversationHistory: historyPayload
        })
      });

      const data = await res.json();

      if (data.success && data.reply) {
        const matrixMessage: DispatchMessage = {
          id: `mat-${Date.now()}`,
          role: 'matrix',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pillar: selectedPillar
        };
        setMessages(prev => [...prev, matrixMessage]);
      } else {
        throw new Error(data.error || 'Neočakávaná odpoveď od AI servera');
      }
    } catch (err: any) {
      console.error('Dispatch error:', err);
      const errorMessage: DispatchMessage = {
        id: `err-${Date.now()}`,
        role: 'matrix',
        text: `⚠️ **Chyba spojenia s Auru Neural Core:** ${err.message || 'Server je momentálne nedostupný.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pillar: selectedPillar
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunRouteCalculation = async () => {
    setIsLoading(true);
    setShowRouteCalc(false);

    const userPrompt = `🚚 **Kalkulácia Logistickej Trasy (Rent a Wheel / Trade Zakasajee)**:
- Štart: **${routeOrigin}**
- Cieľ: **${routeDestination}**
- Vozidlo: **${routeVehicle}**
- Váha nákladu: **${routeWeight} kg**
- Cena paliva: **€${routeFuelPrice} / liter**`;

    const userMessage: DispatchMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pillar: 'RENT_A_WHEEL'
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch('/api/ai/calculate-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: routeOrigin,
          destination: routeDestination,
          vehicleType: routeVehicle,
          cargoWeightKg: routeWeight,
          fuelPricePerLiter: routeFuelPrice,
          tollsIncluded: true
        })
      });

      const data = await res.json();
      if (data.success && data.calculation) {
        const matrixMessage: DispatchMessage = {
          id: `mat-${Date.now()}`,
          role: 'matrix',
          text: data.calculation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pillar: 'RENT_A_WHEEL'
        };
        setMessages(prev => [...prev, matrixMessage]);
      } else {
        throw new Error(data.error || 'Chyba pri kalkulácii trasy');
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'matrix',
          text: `⚠️ **Chyba výpočtu trasy:** ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pillar: 'RENT_A_WHEEL'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunWorkerMatch = async () => {
    setIsLoading(true);
    setShowWorkerMatch(false);

    const userPrompt = `👷 **Analýza Profilu Uchádzača (U.S.C. Work Agency)**:
- Profesia: **${workerProfession}**
- Dĺžka praxe: **${workerExp} rokov**
- Jazyková úroveň: **${workerLang}**
- Certifikáty a oprávnenia: **${workerCerts}**`;

    const userMessage: DispatchMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pillar: 'USC_WORK'
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch('/api/ai/match-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profession: workerProfession,
          experienceYears: workerExp,
          languageLevel: workerLang,
          certifications: workerCerts,
          locationPreference: 'Nemecko (Bavorsko / Hesensko)',
          availableFrom: 'Ihneď'
        })
      });

      const data = await res.json();
      if (data.success && data.matchingReport) {
        const matrixMessage: DispatchMessage = {
          id: `mat-${Date.now()}`,
          role: 'matrix',
          text: data.matchingReport,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pillar: 'USC_WORK'
        };
        setMessages(prev => [...prev, matrixMessage]);
      } else {
        throw new Error(data.error || 'Chyba pri analýze uchádzača');
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'matrix',
          text: `⚠️ **Chyba vyhodnotenia uchádzača:** ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pillar: 'USC_WORK'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCodeGen = async () => {
    setIsLoading(true);
    setShowCodeGen(false);

    const userPrompt = `💻 **Generovanie Kódu v Dielni (Auru Trinity)**:
- Úloha: **${codeTaskType}**
- Stack: **${codeTechStack}**
- Cieľ: **${codeGoal}**`;

    const userMessage: DispatchMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pillar: 'AURU_TRINITY'
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch('/api/ai/code-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: codeTaskType,
          techStack: codeTechStack,
          projectGoal: codeGoal
        })
      });

      const data = await res.json();
      if (data.success && data.codeOutput) {
        const matrixMessage: DispatchMessage = {
          id: `mat-${Date.now()}`,
          role: 'matrix',
          text: data.codeOutput,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pillar: 'AURU_TRINITY'
        };
        setMessages(prev => [...prev, matrixMessage]);
      } else {
        throw new Error(data.error || 'Chyba pri generovaní kódu');
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'matrix',
          text: `⚠️ **Chyba generovania kódu:** ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pillar: 'AURU_TRINITY'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunLeadHunter = async () => {
    setIsLoading(true);
    setShowLeadHunter(false);

    const userPrompt = `🎯 **B2B Lead Hunter Analýza (Auru Trinity)**:
- Nika: **${leadNiche}**
- Trh: **${leadCountry}**
- Ponuka: **${leadOffer}**`;

    const userMessage: DispatchMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pillar: 'AURU_TRINITY'
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch('/api/ai/lead-hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: leadNiche,
          targetCountry: leadCountry,
          offerType: leadOffer
        })
      });

      const data = await res.json();
      if (data.success && data.leadStrategy) {
        const matrixMessage: DispatchMessage = {
          id: `mat-${Date.now()}`,
          role: 'matrix',
          text: data.leadStrategy,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pillar: 'AURU_TRINITY'
        };
        setMessages(prev => [...prev, matrixMessage]);
      } else {
        throw new Error(data.error || 'Chyba pri generovaní lead stratégie');
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'matrix',
          text: `⚠️ **Chyba Lead Huntera:** ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pillar: 'AURU_TRINITY'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportChatToPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header styling
    doc.setFillColor(15, 15, 18);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(245, 158, 11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('UNDERGROUND STREET COLLECTIVE // AURU MATRIX AI', 14, 18);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`OFICIÁLNY AI VÝSTUP & AUDIT | DÁTUM: ${new Date().toLocaleDateString('sk-SK')}`, 14, 28);
    doc.text(`PILIER: ${selectedPillar} | MODEL: GEMINI 3.7 FLASH`, 14, 34);

    let currentY = 50;

    messages.forEach((msg, idx) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      const isUser = msg.role === 'user';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(isUser ? 200 : 245, isUser ? 100 : 158, isUser ? 0 : 11);
      doc.text(`[${msg.timestamp}] ${isUser ? 'OPERÁTOR' : 'AURU MATRIX CORE'}:`, 14, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);

      // Clean markdown tags for pdf readability
      const cleanText = msg.text.replace(/[*#`_]/g, '');
      const lines = doc.splitTextToSize(cleanText, pageWidth - 28);
      doc.text(lines, 14, currentY);
      currentY += (lines.length * 4.5) + 6;
    });

    doc.save(`Auru_Matrix_AI_Report_${Date.now()}.pdf`);
  };

  return (
    <div className={`bg-zinc-950 border-4 border-black font-sans text-white flex flex-col ${embeddedMode ? 'h-full min-h-[650px]' : 'min-h-[750px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'}`}>
      
      {/* Console Top Header */}
      <div className="bg-black border-b-4 border-black p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-red-600 text-white font-mono text-[10px] font-black px-2 py-0.5 uppercase border border-white">
                LIVE AI COPILOT // 3.69
              </span>
              <span className="bg-blue-950/80 text-blue-300 border border-blue-500/40 font-mono text-[10px] px-2 py-0.5">
                🌐 auru.space
              </span>
              <span className="bg-purple-950/80 text-purple-300 border border-purple-500/40 font-mono text-[10px] px-2 py-0.5 hidden sm:inline">
                ⚡ tenebris-core.uscolective.workers.dev
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2 mt-1">
              U.S.C. Matrix <span className="text-amber-500">AI Multitasking Dispečing</span>
            </h2>
          </div>
        </div>

        {/* Action quick triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setShowCodeGen(!showCodeGen);
              setShowRouteCalc(false);
              setShowWorkerMatch(false);
              setShowLeadHunter(false);
            }}
            className={`px-3 py-1.5 border-2 text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
              showCodeGen 
                ? 'bg-amber-500 border-black text-black' 
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-amber-500 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Kód & Skripty</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowLeadHunter(!showLeadHunter);
              setShowCodeGen(false);
              setShowRouteCalc(false);
              setShowWorkerMatch(false);
            }}
            className={`px-3 py-1.5 border-2 text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
              showLeadHunter 
                ? 'bg-emerald-500 border-black text-black' 
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-emerald-500 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lead Hunter</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowRouteCalc(!showRouteCalc);
              setShowCodeGen(false);
              setShowWorkerMatch(false);
              setShowLeadHunter(false);
            }}
            className={`px-3 py-1.5 border-2 text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
              showRouteCalc 
                ? 'bg-zinc-100 border-white text-black' 
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-amber-500 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Kalkulátor Trasy</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowWorkerMatch(!showWorkerMatch);
              setShowCodeGen(false);
              setShowRouteCalc(false);
              setShowLeadHunter(false);
            }}
            className={`px-3 py-1.5 border-2 text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
              showWorkerMatch 
                ? 'bg-blue-600 border-white text-white' 
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-blue-500 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Match Remeselníka</span>
          </button>

          <button
            type="button"
            onClick={exportChatToPdf}
            title="Stiahnuť PDF report"
            className="p-1.5 bg-zinc-900 border-2 border-zinc-700 text-zinc-300 hover:text-amber-400 hover:border-amber-500 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setMessages([messages[0]])}
            title="Resetovať konverzáciu"
            className="p-1.5 bg-zinc-900 border-2 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pillar Switcher Navigation Bar */}
      <div className="bg-zinc-900 border-b-2 border-black px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
        <span className="text-zinc-500 font-bold uppercase text-[10px] mr-1 flex items-center gap-1">
          <Terminal className="w-3 h-3 text-amber-500" /> REŽIM:
        </span>

        {[
          { id: 'ALL_PILLARS', label: 'VŠETKY PILIERE (CORE)', color: 'border-amber-500 text-amber-400' },
          { id: 'AURU_TRINITY', label: '1. AURU TRINITY', color: 'border-amber-400 text-amber-300' },
          { id: 'USW_STREETWEAR', label: '2. U.S.W. MERCH', color: 'border-red-500 text-red-400' },
          { id: 'RENT_A_WHEEL', label: '3. RENT A WHEEL', color: 'border-zinc-300 text-zinc-200' },
          { id: 'USC_WORK', label: '4. U.S.C. WORK', color: 'border-blue-500 text-blue-400' },
          { id: 'TRADE_ZAKASAJEE', label: '5. TRADE LOGISTICS', color: 'border-red-600 text-red-500' },
          { id: 'USC_SOLIDARITY', label: '6. SOLIDARITA', color: 'border-emerald-500 text-emerald-400' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPillar(p.id as MatrixPillar)}
            className={`px-2.5 py-1 text-[11px] font-bold uppercase whitespace-nowrap border transition-all ${
              selectedPillar === p.id 
                ? `bg-black ${p.color} border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]` 
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Drawer: Code Generator Tool (Auru Trinity) */}
      <AnimatePresence>
        {showCodeGen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-zinc-900 border-b-4 border-amber-500 p-4 font-mono overflow-hidden shadow-xl"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-amber-500" />
                  <span className="font-black text-xs uppercase text-amber-400">
                    Auru Trinity // Kód & Automatizačné Skripty Generator
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCodeGen(false)}
                  className="text-zinc-500 hover:text-white uppercase font-bold text-[10px]"
                >
                  ✕ Zatvoriť
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-xs">
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Typ Úlohy / Modul</label>
                  <select
                    value={codeTaskType}
                    onChange={(e) => setCodeTaskType(e.target.value)}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono uppercase text-xs"
                  >
                    <option value="Automatizačný Invoicing Skript">Automatizácia Fakturácie & QR Pay</option>
                    <option value="React & Tailwind Dashboard Komponent">React & Tailwind Dashboard Komponent</option>
                    <option value="Node.js API Endpoint & Auth">Express / Node.js API Endpoint</option>
                    <option value="Dochádzkový Kalkulátor Turnusov">Dochádzkový & Mzdový Engine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Technologický Stack</label>
                  <input
                    type="text"
                    value={codeTechStack}
                    onChange={(e) => setCodeTechStack(e.target.value)}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Cieľ / Popis Funkcie</label>
                  <input
                    type="text"
                    value={codeGoal}
                    onChange={(e) => setCodeGoal(e.target.value)}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunCodeGen}
                disabled={isLoading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 border-2 border-black transition-colors"
              >
                <Zap className="w-4 h-4" /> Vygenerovať Produkčný Kód cez Gemini 3.7
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer: Lead Hunter Tool */}
      <AnimatePresence>
        {showLeadHunter && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-zinc-900 border-b-4 border-emerald-500 p-4 font-mono overflow-hidden shadow-xl"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="font-black text-xs uppercase text-emerald-300">
                    Auru Trinity // B2B Lead Hunter & Akvizičná Stratégia
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLeadHunter(false)}
                  className="text-zinc-500 hover:text-white uppercase font-bold text-[10px]"
                >
                  ✕ Zatvoriť
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-xs">
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Cieľový Sektor / Nika</label>
                  <input
                    type="text"
                    value={leadNiche}
                    onChange={(e) => setLeadNiche(e.target.value)}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Cieľová Krajina / Región</label>
                  <input
                    type="text"
                    value={leadCountry}
                    onChange={(e) => setLeadCountry(e.target.value)}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Ponuka & Služba</label>
                  <input
                    type="text"
                    value={leadOffer}
                    onChange={(e) => setLeadOffer(e.target.value)}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunLeadHunter}
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 border-2 border-black transition-colors"
              >
                <Zap className="w-4 h-4" /> Vygenerovať Akvizičný Plán & Pitch Správy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer: Route Calculator Tool */}
      <AnimatePresence>
        {showRouteCalc && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-zinc-900 border-b-4 border-amber-500 p-4 font-mono overflow-hidden shadow-xl"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-500" />
                  <span className="font-black text-xs uppercase text-amber-400">
                    Rýchly Flotilový Kalkulátor Nákladov (Rent a Wheel & Trade)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRouteCalc(false)}
                  className="text-zinc-500 hover:text-white uppercase font-bold text-[10px]"
                >
                  ✕ Zatvoriť
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-3 text-xs">
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Miesto Odchodu</label>
                  <input
                    type="text"
                    value={routeOrigin}
                    onChange={(e) => setRouteOrigin(e.target.value)}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Cieľová Destinácia</label>
                  <input
                    type="text"
                    value={routeDestination}
                    onChange={(e) => setRouteDestination(e.target.value)}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Typ Vozidla</label>
                  <select
                    value={routeVehicle}
                    onChange={(e) => setRouteVehicle(e.target.value)}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono uppercase text-xs"
                  >
                    <option value="Dodávka L3H2 (Maxi)">Dodávka L3H2 (Maxi)</option>
                    <option value="Osobné Combi (Kuriér/Bolt)">Osobné Combi (Kuriér/Bolt)</option>
                    <option value="Plachtová Dodávka 8-paleta">Plachtová Dodávka 8-paleta</option>
                    <option value="Nákladné 12t Solo">Nákladné 12t Solo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Váha Nákladu (kg)</label>
                  <input
                    type="number"
                    value={routeWeight}
                    onChange={(e) => setRouteWeight(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Cena Nafty (€/l)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={routeFuelPrice}
                    onChange={(e) => setRouteFuelPrice(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunRouteCalculation}
                disabled={isLoading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 border-2 border-black transition-colors"
              >
                <Zap className="w-4 h-4" /> Spustiť AI Výpočet Trasy & Marže
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer: Worker Matcher Tool */}
      <AnimatePresence>
        {showWorkerMatch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-zinc-900 border-b-4 border-blue-500 p-4 font-mono overflow-hidden shadow-xl"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span className="font-black text-xs uppercase text-blue-300">
                    Overenie Profilu Uchádzača & Sadzieb (U.S.C. Work)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWorkerMatch(false)}
                  className="text-zinc-500 hover:text-white uppercase font-bold text-[10px]"
                >
                  ✕ Zatvoriť
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Pozícia / Remeslo</label>
                  <select
                    value={workerProfession}
                    onChange={(e) => setWorkerProfession(e.target.value)}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono uppercase text-xs"
                  >
                    <option value="Elektromontér / Priemyselný elektrikár">Elektrikár (§21, §22, §23)</option>
                    <option value="Zvárač TIG / MAG (Stavebné konštrukcie)">Zvárač TIG / MAG</option>
                    <option value="Sadrokartonista / Montér interiérov">Sadrokartonista / Maliar</option>
                    <option value="Vodič Dodávky / Kuriér EÚ">Vodič Dodávky / Kuriér</option>
                    <option value="Pomocný stavebný pracovník">Pomocný stavebník</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Roky Praxe</label>
                  <input
                    type="number"
                    value={workerExp}
                    onChange={(e) => setWorkerExp(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Nemecký / Anglický Jazyk</label>
                  <select
                    value={workerLang}
                    onChange={(e) => setWorkerLang(e.target.value)}
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono uppercase text-xs"
                  >
                    <option value="A1 - Základy (Rozumie pokynom)">A1 - Základy</option>
                    <option value="B1 - Dohovorí sa na stavbe">B1 - Komunikatívna nemčina</option>
                    <option value="B2/C1 - Plynulá technická nemčina">B2/C1 - Plynulá nemčina</option>
                    <option value="Bez jazykových znalostí">Bez jazyka (potrebuje partiu)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Certifikáty & Doklad</label>
                  <input
                    type="text"
                    value={workerCerts}
                    onChange={(e) => setWorkerCerts(e.target.value)}
                    placeholder="Vyhláška, SCC, BOZP..."
                    className="w-full bg-black border border-zinc-700 p-2 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunWorkerMatch}
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 border-2 border-black transition-colors"
              >
                <Zap className="w-4 h-4" /> Spustiť Náborovú Analýzu & Odporúčané Sadzby
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Message Stream Container */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-zinc-950/80 space-y-4 max-h-[580px]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-zinc-500">
              {m.role === 'user' ? (
                <>
                  <span>OPERÁTOR U.S.C.</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </>
              ) : (
                <>
                  <span className="text-amber-500 font-bold flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> AURU MATRIX CORE
                  </span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                  {m.pillar && (
                    <span className="px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 uppercase">
                      {m.pillar}
                    </span>
                  )}
                </>
              )}
            </div>

            <div
              className={`p-4 max-w-3xl border-2 transition-all relative group ${
                m.role === 'user'
                  ? 'bg-amber-500 text-black border-black font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:border-zinc-700'
              }`}
            >
              {/* Copy Button */}
              <button
                type="button"
                onClick={() => copyToClipboard(m.text, m.id)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 text-zinc-300 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Kopírovať text"
              >
                {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <div className="leading-relaxed text-sm md:text-base font-sans prose prose-invert max-w-none prose-p:my-1 prose-headings:text-amber-400 prose-code:text-amber-300 prose-code:bg-black/50 prose-code:px-1 prose-code:py-0.5 prose-pre:bg-black prose-pre:border prose-pre:border-zinc-800">
                <Markdown>{m.text}</Markdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-amber-500">
              <Cpu className="w-3 h-3 animate-spin" /> AURU NEURAL PROCESSING...
            </div>
            <div className="p-4 bg-zinc-900 border-2 border-amber-500 text-amber-400 font-mono text-xs flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              Auru Matrix Core (Gemini 3.7 Flash) spracováva požiadavku v reálnom čase...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="bg-zinc-900/90 border-t border-zinc-800 p-2.5 px-4 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase text-zinc-500 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> RÝCHLE PRÍKAZY:
        </span>
        {PRESET_PROMPTS[selectedPillar]?.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(preset.prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 bg-black hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-[11px] font-mono whitespace-nowrap transition-colors flex items-center gap-1.5"
          >
            <span>{preset.icon}</span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      {/* Console Input Bar */}
      <div className="p-4 bg-black border-t-4 border-black">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Zadaj požiadavku alebo otázku pre Auru Matrix [${selectedPillar}]...`}
              disabled={isLoading}
              className="w-full bg-zinc-950 border-2 border-zinc-700 p-4 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Vyslať</span>
          </button>
        </form>
      </div>

    </div>
  );
}
