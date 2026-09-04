import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Bot, 
  Sparkles, 
  Zap, 
  Send, 
  Building2, 
  Globe2, 
  CheckCircle2, 
  ArrowUpRight, 
  Copy, 
  FileSpreadsheet, 
  Briefcase, 
  Target, 
  Cpu, 
  ShieldCheck, 
  BarChart3,
  Flame,
  Truck,
  Wrench,
  Key
} from 'lucide-react';

interface RevenueChannel {
  id: string;
  name: string;
  category: string;
  marginAvg: string;
  dealSizeAvg: string;
  status: 'ACTIVE' | 'HOT' | 'SCALING';
  pitchTemplate: string;
  leadTarget: string;
}

export default function AdminAIAcquisitionEngine() {
  const [selectedChannel, setSelectedChannel] = useState<string>('work-de');
  const [targetCompany, setTargetCompany] = useState('');
  const [targetContact, setTargetContact] = useState('');
  const [targetCountry, setTargetCountry] = useState('Nemecko (DE)');
  const [customGoal, setCustomGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOffer, setGeneratedOffer] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [calculatedCommission, setCalculatedCommission] = useState<{ hours: number; rateDiff: number; total: number }>({
    hours: 160,
    rateDiff: 4.5,
    total: 720
  });

  const REVENUE_CHANNELS: RevenueChannel[] = [
    {
      id: 'work-de',
      name: 'B2B Montážne Zákazky (DE / AT)',
      category: 'U.S.C. Work Arbitráž',
      marginAvg: '€3.50 – €7.00 / hod. na pracovníka',
      dealSizeAvg: '€2,500 – €8,000 / mesiac / partia',
      status: 'HOT',
      leadTarget: 'Stavebné a priemyselné inštalačné firmy v Nemecku a Rakúsku',
      pitchTemplate: 'Ponuka certifikovaných montážnych tímov (Elektrikári, Zvárači TIG) s A1 formulárom a Freistellungom bez nákladov na nábor.'
    },
    {
      id: 'fleet-rent',
      name: 'Flotilový B2B Prenájom Dodávok',
      category: 'Rent a Wheel',
      marginAvg: '€650 – €1,200 / mesiac / vozidlo',
      dealSizeAvg: '€1,800 – €2,400 / vozidlo / mesiac',
      status: 'ACTIVE',
      leadTarget: 'Kuriérske firmy, stavebné partie cestujúce na turnusy',
      pitchTemplate: 'Dlhodobý prenájom Renault Master / Jumper Maxi s diaľničnými známkami, asistenčnou službou 24/7 a poistením celej EÚ.'
    },
    {
      id: 'ai-software',
      name: 'Auru Trinity Web & Automatizácia',
      category: 'IT & AI Dispečing',
      marginAvg: '70% – 85% marža',
      dealSizeAvg: '€1,200 – €4,500 za implementáciu',
      status: 'SCALING',
      leadTarget: 'Malé a stredné logistické / remeselné firmy bez online dispečingu',
      pitchTemplate: 'Automatizovaný portál na mieru s Cloudflare Edge rýchlosťou, Firebase backendom a AI dispečingom objednávok.'
    },
    {
      id: 'escrow-trade',
      name: 'Zakasajee Escrow & Overovanie',
      category: 'Trade Zakasajee',
      marginAvg: '2% – 5% z tranzitu',
      dealSizeAvg: '€200 – €1,000 / transakcia',
      status: 'ACTIVE',
      leadTarget: 'B2B nákup materiálu a cezhraničné dodávky',
      pitchTemplate: 'Zabezpečený escrow tranzit peňazí a tovaru s garanciou uvoľnenia platby až po fyzickom prevzatí.'
    }
  ];

  const currentChannelData = REVENUE_CHANNELS.find(c => c.id === selectedChannel) || REVENUE_CHANNELS[0];

  const handleGeneratePitch = async () => {
    setIsGenerating(true);
    setGeneratedOffer(null);
    try {
      const res = await fetch('/api/ai/b2b-lead-hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector: currentChannelData.name,
          targetCountry: targetCountry,
          profession: targetCompany ? `${targetCompany} (${targetContact || 'Vedenie firmy'})` : currentChannelData.leadTarget,
          customGoal: customGoal || currentChannelData.pitchTemplate
        })
      });

      const data = await res.json();
      if (data.strategy) {
        setGeneratedOffer(data.strategy);
      } else {
        setGeneratedOffer(`### 💼 Automatická Cenová Ponuka & B2B Oslovenie\n\n**Príjemca:** ${targetCompany || 'Potenciálny B2B Partner'}\n**Sektor:** ${currentChannelData.name}\n\n**Predmet:** Návrh subdodávateľskej spolupráce – Underground Street Collective\n\nSehr geehrte Damen und Herren,\n\nwir bieten qualifizierte und zertifizierte Kapazitäten im Bereich **${currentChannelData.name}** für den Markt in **${targetCountry}** an.\n\n- Okamžitá dostupnosť s kompletnou dokumentáciou (A1 / certifikácie).\n- Fixná hodinová sadzba bez skrytých poplatkov.\n- Skúšobná doba a garancia kvality.\n\nGerne senden wir Ihnen ein unverbindliches Angebot oder vereinbaren ein kurzes Telefonat.\n\nMit freundlichen Grüßen,\n**U.S.C. B2B Dispečing & Auru Trinity**`);
      }
    } catch (e) {
      setGeneratedOffer(`B2B ponuka pripravená na odoslanie pre ${targetCompany || 'Klienta'}.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPitch = () => {
    if (!generatedOffer) return;
    navigator.clipboard.writeText(generatedOffer);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 px-3 py-1 text-xs font-black uppercase tracking-widest mb-2">
            <DollarSign className="w-3.5 h-3.5" /> Exkluzívny Pilier // Monetizačný Stroj
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            Auru <span className="text-emerald-500">Revenue & Lead Hunter</span>
          </h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-1">
            Privátny AI motor na generovanie ziskových zákaziek, provízií z montáží a B2B uzatváranie obchodov
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-zinc-900 border-2 border-emerald-600 text-emerald-400 font-mono text-xs font-bold flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-500 animate-pulse" />
            ROI Engine: <span className="text-white font-black">ONLINE</span>
          </div>
        </div>
      </div>

      {/* 4 Monetization Pillars Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {REVENUE_CHANNELS.map((ch) => (
          <div
            key={ch.id}
            onClick={() => setSelectedChannel(ch.id)}
            className={`p-5 cursor-pointer transition-all border-4 flex flex-col justify-between ${
              selectedChannel === ch.id
                ? 'bg-zinc-900 border-emerald-500 shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] -translate-y-1'
                : 'bg-zinc-950 border-black hover:border-zinc-700 hover:bg-zinc-900/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-black border border-zinc-800 text-zinc-400">
                  {ch.category}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 uppercase ${
                  ch.status === 'HOT' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {ch.status}
                </span>
              </div>
              <h3 className="text-base font-black uppercase text-white tracking-tight mb-2">
                {ch.name}
              </h3>
              <p className="text-xs text-zinc-400 font-medium line-clamp-2 mb-4">
                {ch.leadTarget}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800 space-y-1">
              <div className="text-[11px] text-zinc-500 font-mono">Čistý zisk:</div>
              <div className="text-xs font-mono font-black text-emerald-400">{ch.marginAvg}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Calculator & Live Pitch Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive Commission Calculator (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900 border-4 border-black p-6 space-y-6">
          <div className="border-b-2 border-zinc-800 pb-4">
            <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Provízna & Arbitrážna Kalkulačka
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Vypočítaj si mesačný zisk z sprostredkovania montážnikov alebo prenájmu flotily.
            </p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-zinc-300 font-bold mb-1.5 uppercase">
                Počet odpracovaných hodín za mesiac:
              </label>
              <input
                type="number"
                value={calculatedCommission.hours}
                onChange={(e) => {
                  const h = Number(e.target.value) || 0;
                  setCalculatedCommission(prev => ({ ...prev, hours: h, total: h * prev.rateDiff }));
                }}
                className="w-full bg-zinc-950 border-2 border-zinc-800 p-2.5 text-white font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1.5 uppercase">
                Tvoja marža na hodinu (€ / hod.):
              </label>
              <input
                type="number"
                step="0.5"
                value={calculatedCommission.rateDiff}
                onChange={(e) => {
                  const r = Number(e.target.value) || 0;
                  setCalculatedCommission(prev => ({ ...prev, rateDiff: r, total: prev.hours * r }));
                }}
                className="w-full bg-zinc-950 border-2 border-zinc-800 p-2.5 text-white font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Total Display */}
            <div className="bg-black/80 border-2 border-emerald-600/60 p-5 space-y-2">
              <div className="text-zinc-400 text-xs font-sans uppercase font-bold">
                Tvoj čistý pasívny zisk z 1 montážnika / partiu:
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                €{calculatedCommission.total.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">/ mesiac</span>
              </div>
              <div className="text-[11px] text-zinc-400 font-sans">
                Pri partii 4 ľudí (napr. elektrikári v DE) = <strong className="text-white">€{(calculatedCommission.total * 4).toLocaleString()} / mesiac</strong>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 space-y-2">
            <div className="font-bold uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Ako systém chráni tvoje peniaze:
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-300">
              U.S.C. zmluvy (sekcia Zmluvy) obsahujú doložku o zákaze obchádzania (Non-Circumvention) a garanciu vyplácania provízie priamo cez bankový účet alebo escrow.
            </p>
          </div>
        </div>

        {/* AI B2B Lead Generator (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900 border-4 border-black p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b-2 border-zinc-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-emerald-500" /> AI B2B Oslovovač & Ponukový Automat
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Generuj profesionálne cenové ponuky a akvizičné správy pripravené na odoslanie cez Gmail.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/40">
                {currentChannelData.category}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Názov cielovej firmy / partnera:
                </label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="Napr. Müller Elektro GmbH"
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Cieľový trh:
                </label>
                <select
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="Nemecko (DE)">Nemecko (DE) - Najvyššie sadzby (€26-€34/h)</option>
                  <option value="Rakúsko (AT)">Rakúsko (AT) - Stabilné montáže (€24-€30/h)</option>
                  <option value="Holandsko / Belgicko">Holandsko / Belgicko (€27-€35/h)</option>
                  <option value="Slovensko / Česko">Slovensko / Česko (B2B Fleet & IT)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Špecifické požiadavky na ponuku:
              </label>
              <textarea
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="Napr. Ponúkni 2 partiu zváračov s vlastným autom a náradím na 3 mesiace s nástupom od pondelka..."
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleGeneratePitch}
              disabled={isGenerating}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'AI Generuje B2B Ponuku...' : 'Vygenerovať Ziskovú Cenovú Ponuku'}
            </button>
          </div>

          {/* Generated Result Box */}
          {generatedOffer && (
            <div className="mt-4 bg-black/80 border-2 border-emerald-500 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Ponuka pripravená na odoslanie
                </span>
                <button
                  onClick={copyPitch}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  {copied ? 'Skopírované!' : 'Kopírovať text'}
                </button>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-sans whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                {generatedOffer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
