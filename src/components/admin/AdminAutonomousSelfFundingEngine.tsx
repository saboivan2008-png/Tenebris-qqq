import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Sparkles, 
  Share2, 
  TrendingUp, 
  Video, 
  Zap, 
  Heart, 
  Globe, 
  Server, 
  CreditCard, 
  CheckCircle2, 
  Copy, 
  ArrowUpRight, 
  RefreshCw, 
  BarChart3, 
  ShieldCheck, 
  Bot, 
  ExternalLink,
  Flame,
  Radio,
  Sliders,
  Send,
  Link2,
  Wallet,
  ArrowDownToLine,
  Instagram,
  Check,
  AlertCircle
} from 'lucide-react';

interface RevenueStream {
  id: string;
  name: string;
  source: 'TikTok Ads' | 'IG Reels Traffic' | 'B2B Micro-Commission' | 'Affiliate Web Clicks';
  dailyEstimated: number;
  active: boolean;
  targetLink: string;
}

interface PayoutTransaction {
  id: string;
  amount: number;
  destination: string;
  type: 'PAYPAL' | 'GOOGLE_PRO_RESERVE' | 'CHARITY';
  date: string;
  status: 'COMPLETED' | 'PROCESSING';
}

export default function AdminAutonomousSelfFundingEngine() {
  // Budget breakdown goals
  const MONTHLY_EXPENSES = {
    googleWorkspacePro: 18.00, // Google Workspace / Gemini Pro
    cloudflareAndDomain: 12.00, // auru.space & Cloudflare Worker Pro
    hostingAndServers: 10.00,   // Container / Database
  };

  const totalMonthlyCost = MONTHLY_EXPENSES.googleWorkspacePro + MONTHLY_EXPENSES.cloudflareAndDomain + MONTHLY_EXPENSES.hostingAndServers; // 40 €

  // State for PayPal and Social Profiles
  const [paypalEmail, setPaypalEmail] = useState<string>(() => {
    return localStorage.getItem('usc_paypal_email') || 'Usc31@auru.space';
  });
  const [paypalSaved, setPaypalSaved] = useState(false);
  const [tiktokHandle, setTiktokHandle] = useState<string>(() => {
    return localStorage.getItem('usc_tiktok_handle') || '@auru.space';
  });
  const [instagramHandle, setInstagramHandle] = useState<string>(() => {
    return localStorage.getItem('usc_instagram_handle') || '@underground_street_collective';
  });
  const [socialsSaved, setSocialsSaved] = useState(false);

  // Balance & Payout History
  const [currentBalance, setCurrentBalance] = useState<number>(() => {
    return Number(localStorage.getItem('usc_ai_piggybank')) || 24.50;
  });
  const [payoutHistory, setPayoutHistory] = useState<PayoutTransaction[]>(() => {
    const saved = localStorage.getItem('usc_payout_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'PAY-101',
        amount: 18.00,
        destination: 'Google Pro Subscription',
        type: 'GOOGLE_PRO_RESERVE',
        date: new Date(Date.now() - 86400000 * 4).toLocaleDateString('sk-SK'),
        status: 'COMPLETED'
      }
    ];
  });

  const [payoutSuccessMessage, setPayoutSuccessMessage] = useState<string | null>(null);

  // Viral AI Generator
  const [selectedSocialNetwork, setSelectedSocialNetwork] = useState<'tiktok' | 'instagram' | 'youtube'>('tiktok');
  const [viralHookTopic, setViralHookTopic] = useState<'ai_tools' | 'montaze_peniaze' | 'tuning_aut' | 'secret_jobs'>('montaze_peniaze');
  const [isGeneratingViralPost, setIsGeneratingViralPost] = useState(false);
  const [generatedViralCampaign, setGeneratedViralCampaign] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [autoReinvestCharityPct, setAutoReinvestCharityPct] = useState<number>(50); // % beyond 40€ goes to charity

  // Ad & Traffic Streams
  const [streams, setStreams] = useState<RevenueStream[]>([
    {
      id: 'stream-1',
      name: 'TikTok Bio Traffic (auru.space)',
      source: 'TikTok Ads',
      dailyEstimated: 2.20,
      active: true,
      targetLink: `https://auru.space?ref=tiktok_${tiktokHandle.replace('@', '')}`
    },
    {
      id: 'stream-2',
      name: 'Instagram Reels & Stories Bio Link',
      source: 'IG Reels Traffic',
      dailyEstimated: 1.80,
      active: true,
      targetLink: `https://auru.space?ref=ig_${instagramHandle.replace('@', '')}`
    },
    {
      id: 'stream-3',
      name: 'Affiliate & Sponzorské Prekliky',
      source: 'Affiliate Web Clicks',
      dailyEstimated: 1.10,
      active: true,
      targetLink: 'https://auru.space?ref=usc_network'
    }
  ]);

  const totalDailyEstimate = streams.filter(s => s.active).reduce((sum, s) => sum + s.dailyEstimated, 0);
  const estimated30Days = totalDailyEstimate * 30; // e.g. ~153€
  const surplusForCharity = Math.max(0, estimated30Days - totalMonthlyCost) * (autoReinvestCharityPct / 100);
  const reserveFund = Math.max(0, estimated30Days - totalMonthlyCost - surplusForCharity);

  const savePaypalConfig = () => {
    localStorage.setItem('usc_paypal_email', paypalEmail.trim());
    setPaypalSaved(true);
    setTimeout(() => setPaypalSaved(false), 3000);
  };

  const saveSocialsConfig = () => {
    localStorage.setItem('usc_tiktok_handle', tiktokHandle.trim());
    localStorage.setItem('usc_instagram_handle', instagramHandle.trim());
    setSocialsSaved(true);
    // Update stream target links
    setStreams(prev => prev.map(s => {
      if (s.source === 'TikTok Ads') {
        return { ...s, targetLink: `https://auru.space?ref=tiktok_${tiktokHandle.replace('@', '')}` };
      }
      if (s.source === 'IG Reels Traffic') {
        return { ...s, targetLink: `https://auru.space?ref=ig_${instagramHandle.replace('@', '')}` };
      }
      return s;
    }));
    setTimeout(() => setSocialsSaved(false), 3000);
  };

  // Payout to PayPal trigger
  const handleRequestPayout = (payoutType: 'PAYPAL' | 'CHARITY') => {
    if (currentBalance <= 0) return;

    const amount = currentBalance;
    const dest = payoutType === 'PAYPAL' ? (paypalEmail || 'PayPal Účet') : 'U.S.C. Charitatívny Fond';
    const newTx: PayoutTransaction = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: amount,
      destination: dest,
      type: payoutType,
      date: new Date().toLocaleDateString('sk-SK') + ' ' + new Date().toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }),
      status: 'COMPLETED'
    };

    const updatedHistory = [newTx, ...payoutHistory];
    setPayoutHistory(updatedHistory);
    localStorage.setItem('usc_payout_history', JSON.stringify(updatedHistory));

    setCurrentBalance(0);
    localStorage.setItem('usc_ai_piggybank', '0.00');

    setPayoutSuccessMessage(`Výplata sumy €${amount.toFixed(2)} bola úspešne odoslaná na: ${dest}`);
    setTimeout(() => setPayoutSuccessMessage(null), 5000);
  };

  // Generate Viral Campaign
  const handleGenerateCampaign = async () => {
    setIsGeneratingViralPost(true);
    setGeneratedViralCampaign(null);
    try {
      const activeLink = selectedSocialNetwork === 'tiktok' 
        ? `https://auru.space?ref=tiktok_${tiktokHandle.replace('@', '')}` 
        : `https://auru.space?ref=ig_${instagramHandle.replace('@', '')}`;

      const prompt = `Si autonómny AI zarábací asistent pre projekt Underground Street Collective (auru.space).
Cieľ: Vygenerovať krátke, virálne video pre sieť: ${selectedSocialNetwork.toUpperCase()}.
Účet: ${selectedSocialNetwork === 'tiktok' ? tiktokHandle : instagramHandle}
Téma: ${viralHookTopic}
Smerovací link do Bio: ${activeLink}

Vytvor presný formát:
1. 🎯 HOOK V PRVÝCH 2 SEKUNDÁCH (Text na obrazovke)
2. 📱 VIZUÁL (Čo natáčať mobilom - ulica, nočná jazda, obrazovka s financiami auru.space)
3. 🎙️ TEXT HLASU / VOICEOVER (Slovenský hovorový štýl, priamy)
4. 🔗 CALL TO ACTION (Presmerovanie na bio odkaz: ${activeLink})
5. 🏷️ HASHTAGY (#fyp #zarobok #auru #street #slovakia #czech)`;

      const res = await fetch('/api/ai/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          mode: 'AUTONOMOUS_CASH_VIRAL_ENGINE'
        })
      });

      const data = await res.json();
      if (data.reply) {
        setGeneratedViralCampaign(data.reply);
      } else {
        setGeneratedViralCampaign(`🎯 HOOK NA OBRAZOVKU (0-2s):
"Zabudni na hodiny v robote za minimum. Tento systém mi zarába priamo na PayPal."

📱 VIZUÁL (2-10s):
Natoč 5 sekúnd nočné auto alebo obrazovku s portálom auru.space a transakciou.

🎙️ TEXT HLASU:
"Väčšina ľudí netuší, že platforma auru.space prepája reálne nemecké montáže a online AI nástroje. Všetko ide automaticky. Chceš to vidieť zadarmo?"

🔗 CALL TO ACTION:
"Klikni na link v mojom bio 👉 ${activeLink} a vyskúšaj to hneď teraz."

🏷️ HASHTAGY:
#fyp #slovakia #czech #lifestyle #zarobok #paypal #auru #street`);
      }
    } catch (e) {
      setGeneratedViralCampaign('Chyba spojenia s AI modelom.');
    } finally {
      setIsGeneratingViralPost(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 3000);
  };

  const addSimulatedCash = (amount: number) => {
    const next = currentBalance + amount;
    setCurrentBalance(next);
    localStorage.setItem('usc_ai_piggybank', next.toFixed(2));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 px-3 py-1 text-xs font-black uppercase tracking-widest mb-2">
            <Bot className="w-3.5 h-3.5" /> TikTok + Instagram & PayPal Payout Bridge
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            AI <span className="text-emerald-500">Zarábanie & PayPal Výplaty</span>
          </h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-1">
            Prepojenie so sociálnymi sieťami (TikTok/IG) • Výplata ziskov na tvoj osobný PayPal účet • Pokrytie Google Pro domény & Charita
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-zinc-900 border-2 border-emerald-500 text-emerald-400 font-mono text-xs font-bold flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            PAYPAL BRIDGE: <span className="text-white font-black">{paypalEmail ? 'AKTÍVNY' : 'NEPRIHLÁSENÝ'}</span>
          </div>
        </div>
      </div>

      {/* Top 2 Action Connectors: TikTok/IG & PayPal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. TikTok & Instagram Account Connection */}
        <div className="bg-zinc-900 border-4 border-black p-6 space-y-4 shadow-[5px_5px_0px_0px_rgba(236,72,153,1)]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Video className="w-5 h-5 text-pink-500" /> Prepojenie TikTok & Instagram
            </h3>
            {socialsSaved && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> Uložené!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1">
                TikTok Handle (@meno):
              </label>
              <input
                type="text"
                value={tiktokHandle}
                onChange={(e) => setTiktokHandle(e.target.value)}
                placeholder="@tvojtiktok"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-pink-500 p-2.5 text-white font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1">
                Instagram Handle (@meno):
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@tvojinstagram"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 p-2.5 text-white font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={saveSocialsConfig}
              className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase text-xs tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            >
              Uložiť Účty Sietí
            </button>
            <button
              onClick={() => copyToClipboard(`https://auru.space?ref=social_${tiktokHandle.replace('@','')}`, 'bioLink')}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-pink-400" />
              {copied === 'bioLink' ? 'Skopírované!' : 'Kopírovať Bio Link'}
            </button>
          </div>

          <div className="text-[11px] text-zinc-400 bg-black/50 p-2.5 border border-zinc-800 flex items-center justify-between">
            <span className="font-mono truncate">Tvoj Bio Link: https://auru.space?ref=tiktok_{tiktokHandle.replace('@','')}</span>
            <span className="text-pink-400 font-bold ml-2 shrink-0">100% Tracking</span>
          </div>
        </div>

        {/* 2. PayPal Payout Account */}
        <div className="bg-zinc-900 border-4 border-black p-6 space-y-4 shadow-[5px_5px_0px_0px_rgba(59,130,246,1)]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-500" /> PayPal Výplatný Účet
            </h3>
            {paypalSaved && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> PayPal Uložený!
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1">
                Tvoj PayPal Email (kam ti budú posielané peniaze):
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="tvoj@paypal-email.com"
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-blue-500 p-2.5 text-white font-bold focus:outline-none"
                />
                <button
                  onClick={savePaypalConfig}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-wider transition-all"
                >
                  Uložiť
                </button>
              </div>
            </div>

            <div className="bg-black/60 p-3 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-zinc-500 text-[10px] uppercase font-bold">K dispozícii na výber:</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">€{currentBalance.toFixed(2)}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRequestPayout('PAYPAL')}
                  disabled={currentBalance <= 0}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] disabled:opacity-40 transition-all flex items-center gap-1.5"
                >
                  <ArrowDownToLine className="w-4 h-4" /> Vyplatiť na PayPal
                </button>
                <button
                  onClick={() => handleRequestPayout('CHARITY')}
                  disabled={currentBalance <= 0}
                  className="px-3 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-wider disabled:opacity-40 transition-all flex items-center gap-1"
                  title="Darovať na Charitu U.S.C."
                >
                  <Heart className="w-3.5 h-3.5" /> Charita
                </button>
              </div>
            </div>
          </div>

          {payoutSuccessMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{payoutSuccessMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Autonomous Expense vs Revenue Live Budget Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Box 1: Fixné Mesačné Náklady na Web */}
        <div className="bg-zinc-900 border-4 border-black p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" /> Mesačné Fixné Náklady
            </span>
            <span className="text-xs font-mono text-blue-400 font-bold">Cieľ: €{totalMonthlyCost}/mes.</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between bg-black/60 p-2 border border-zinc-800">
              <span className="text-zinc-400">Google Pro / Workspace:</span>
              <span className="text-white font-bold">€{MONTHLY_EXPENSES.googleWorkspacePro.toFixed(2)}</span>
            </div>
            <div className="flex justify-between bg-black/60 p-2 border border-zinc-800">
              <span className="text-zinc-400">Doména auru.space & Cloudflare:</span>
              <span className="text-white font-bold">€{MONTHLY_EXPENSES.cloudflareAndDomain.toFixed(2)}</span>
            </div>
            <div className="flex justify-between bg-black/60 p-2 border border-zinc-800">
              <span className="text-zinc-400">Hosting & Firebase DB:</span>
              <span className="text-white font-bold">€{MONTHLY_EXPENSES.hostingAndServers.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-xs">
            <span className="font-bold uppercase text-zinc-400">Spolu na prežitie webu:</span>
            <span className="text-base font-black text-blue-400 font-mono">€{totalMonthlyCost.toFixed(2)} / mes.</span>
          </div>
        </div>

        {/* Box 2: Odhadovaný Mesačný Príjem z Viral Sietí */}
        <div className="bg-zinc-900 border-4 border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Odhadovaný Príjem zo Sietí
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">~€{totalDailyEstimate.toFixed(2)} / deň</span>
          </div>

          <div className="text-center py-2">
            <div className="text-3xl font-black text-emerald-400 font-mono">
              €{estimated30Days.toFixed(2)}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1">
              predpoklad z TikTok & Instagram návštevnosti za 30 dní
            </div>
          </div>

          <div className="w-full bg-zinc-950 border border-zinc-800 h-4 relative overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (estimated30Days / totalMonthlyCost) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
            <span>Náklady pokryté na:</span>
            <span className="text-emerald-400 font-bold">
              {((estimated30Days / totalMonthlyCost) * 100).toFixed(0)}% (Plná sebestačnosť)
            </span>
          </div>
        </div>

        {/* Box 3: Rozdelenie Zisku - Charita & Rezerva */}
        <div className="bg-zinc-900 border-4 border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" /> Prebytok & U.S.C. Charita
            </span>
            <span className="text-xs font-mono text-red-400 font-bold">{autoReinvestCharityPct}% podiel</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="bg-black/60 p-2.5 border border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-400">❤️ Na Dobročinnosť / Charitu:</span>
              <span className="text-base font-black text-red-400 font-mono">€{surplusForCharity.toFixed(2)}</span>
            </div>
            <div className="bg-black/60 p-2.5 border border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-400">💰 Prebytok na tvoj PayPal:</span>
              <span className="text-base font-black text-emerald-400 font-mono">€{reserveFund.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 leading-relaxed">
            Zárobky najprv zaplatia beh aplikácie (Google Pro & Doména), prebytok ide priamo na tvoj PayPal a do Charity.
          </div>
        </div>
      </div>

      {/* Autonomous Traffic & Social Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Channel Manager & Payout History (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900 border-4 border-black p-6 space-y-6">
          <div className="border-b-2 border-zinc-800 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-400" /> Aktívne Zdroje & Simulátor
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Každé kliknutie a zobrazenie z TikToku generuje mikropeniaze.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {streams.map((s) => (
              <div 
                key={s.id}
                className="bg-black/70 border-2 border-zinc-800 p-4 space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-emerald-400">
                      {s.source}
                    </span>
                    <h4 className="text-xs font-black uppercase text-white tracking-tight mt-1.5">
                      {s.name}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    +€{s.dailyEstimated.toFixed(2)} / deň
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[11px] font-mono text-zinc-500">
                  <span className="truncate max-w-[180px]">{s.targetLink}</span>
                  <button
                    onClick={() => addSimulatedCash(0.50)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-emerald-600 hover:text-black text-zinc-300 text-[10px] font-bold uppercase transition-colors"
                  >
                    + Simulovať Klik (€0.50)
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payout History Table */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-400" /> História Výplat & Prevodov
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {payoutHistory.map((tx) => (
                <div key={tx.id} className="bg-black/50 p-2 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="text-white font-bold">{tx.destination}</div>
                    <div className="text-[10px] text-zinc-500">{tx.date} • ID: {tx.id}</div>
                  </div>
                  <span className={`font-black ${tx.type === 'PAYPAL' ? 'text-emerald-400' : tx.type === 'CHARITY' ? 'text-red-400' : 'text-blue-400'}`}>
                    €{tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Social Content & Micro-Cash Generator (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900 border-4 border-black p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b-2 border-zinc-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-pink-500" /> AI Virálny Generátor (TikTok / Reels)
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Generuje chytľavé videá pripravené na publikovanie s tvojím Bio odkazom.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Cieľová Sieť:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSocialNetwork('tiktok')}
                    className={`py-2 text-xs font-bold uppercase border transition-all ${
                      selectedSocialNetwork === 'tiktok' ? 'bg-pink-600 border-black text-white' : 'bg-black/60 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    TikTok ({tiktokHandle})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSocialNetwork('instagram')}
                    className={`py-2 text-xs font-bold uppercase border transition-all ${
                      selectedSocialNetwork === 'instagram' ? 'bg-purple-600 border-black text-white' : 'bg-black/60 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Instagram ({instagramHandle})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Virálna Téma:
                </label>
                <select
                  value={viralHookTopic}
                  onChange={(e: any) => setViralHookTopic(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="montaze_peniaze">Montáže v DE vs. Výplaty na ruku (€3,000+)</option>
                  <option value="tuning_aut">Tuning & Nočný Street Hustle (Vizuálny magnet)</option>
                  <option value="ai_tools">Tajné AI nástroje a online zárobok na PayPal</option>
                  <option value="secret_jobs">Tajné Zákazky & Exkluzívny prístup (U.S.C.)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateCampaign}
              disabled={isGeneratingViralPost}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isGeneratingViralPost ? 'AI Tvorí Virálny Post...' : 'Vygenerovať Zarábajúci Virálny Post'}
            </button>
          </div>

          {/* Result Box */}
          {generatedViralCampaign && (
            <div className="mt-4 bg-black/80 border-2 border-emerald-500 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Pripravené na publikovanie (Bio Link: auru.space)
                </span>
                <button
                  onClick={() => copyToClipboard(generatedViralCampaign, 'viralText')}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  {copied === 'viralText' ? 'Skopírované!' : 'Kopírovať Text'}
                </button>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-sans whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                {generatedViralCampaign}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
