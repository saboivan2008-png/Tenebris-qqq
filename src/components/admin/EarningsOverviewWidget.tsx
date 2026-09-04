import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Heart, 
  Link2, 
  Copy, 
  Check, 
  MousePointerClick, 
  Target, 
  ArrowUpRight, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Gift, 
  Zap, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { trackPromoClick, trackEvent } from '../../lib/analytics';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface PromoLinkItem {
  id: string;
  name: string;
  campaign: string;
  pillar: string;
  url: string;
  clicks: number;
  epc: number; // estimated earning per click in EUR
  active: boolean;
  category: 'streetwear' | 'logistics' | 'recruitment' | 'solidarity' | 'affiliate';
}

interface EarningsOverviewWidgetProps {
  onGoToSolidarity?: () => void;
  compact?: boolean;
}

const DEFAULT_PROMO_LINKS: PromoLinkItem[] = [
  {
    id: 'promo-usw-drop',
    name: 'USW Streetwear Limitovaný Drop',
    campaign: 'Instagram & TikTok Bio',
    pillar: 'U.S.W.',
    url: 'https://auru.space/usw?ref=promo_bio',
    clicks: 142,
    epc: 0.35,
    active: true,
    category: 'streetwear'
  },
  {
    id: 'promo-rent-wheel',
    name: 'Rent a Wheel – Dodávky & Kuriéri',
    campaign: 'B2B Logistická Kampaň',
    pillar: 'Rent a Wheel',
    url: 'https://auru.space/rent-a-wheel?ref=partner_fleet',
    clicks: 89,
    epc: 0.50,
    active: true,
    category: 'logistics'
  },
  {
    id: 'promo-german-turnus',
    name: 'U.S.C. Work – Nemecké Turnusy',
    campaign: 'Montážne Fóra & FB Skupiny',
    pillar: 'U.S.C. Work',
    url: 'https://auru.space/usc-work?ref=de_turnus_recruitment',
    clicks: 118,
    epc: 0.45,
    active: true,
    category: 'recruitment'
  },
  {
    id: 'promo-solidarity-fund',
    name: 'Solidárny Fond Pomoci & Komunita',
    campaign: 'Komunitná Výzva 2026',
    pillar: 'Solidarita',
    url: 'https://auru.space/usc-solidarity?ref=charity_goal_2026',
    clicks: 215,
    epc: 0.60,
    active: true,
    category: 'solidarity'
  },
  {
    id: 'promo-auru-trinity',
    name: 'Auru Trinity AI Dielňa & Fakturácie',
    campaign: 'B2B Automatizácie',
    pillar: 'Auru Trinity',
    url: 'https://auru.space/auru-trinity?ref=ai_automation_partner',
    clicks: 64,
    epc: 0.75,
    active: true,
    category: 'affiliate'
  }
];

export default function EarningsOverviewWidget({ compact = false }: EarningsOverviewWidgetProps) {
  // State for promo links and metrics
  const [links, setLinks] = useState<PromoLinkItem[]>(() => {
    const cached = localStorage.getItem('usc_promo_links_data');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return DEFAULT_PROMO_LINKS;
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [justClickedId, setJustClickedId] = useState<string | null>(null);

  // Charity Goal Target State
  const [charityGoal, setCharityGoal] = useState<number>(() => {
    return Number(localStorage.getItem('usc_charity_funding_goal')) || 250.00;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoalInput, setTempGoalInput] = useState(charityGoal.toString());

  // New Link Modal / Inline Creator
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkPillar, setNewLinkPillar] = useState('U.S.W.');
  const [newLinkEpc, setNewLinkEpc] = useState('0.35');

  // Payout / Goal Allocation notice
  const [allocatedSuccess, setAllocatedSuccess] = useState<string | null>(null);

  // Real-time calculations
  const totalClicks = links.reduce((acc, item) => acc + (item.active ? item.clicks : 0), 0);
  const totalEarnings = links.reduce((acc, item) => acc + (item.active ? item.clicks * item.epc : 0), 0);
  const progressPercentage = Math.min(100, Math.round((totalEarnings / charityGoal) * 100));
  const remainingForGoal = Math.max(0, charityGoal - totalEarnings);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('usc_promo_links_data', JSON.stringify(links));
  }, [links]);

  // Sync with Firestore (real-time cross-client syncing if configured)
  useEffect(() => {
    const docRef = doc(db, 'system_stats', 'promo_earnings_matrix');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.links)) {
          setLinks(data.links);
        }
        if (data && typeof data.charityGoal === 'number') {
          setCharityGoal(data.charityGoal);
        }
      }
    }, (error) => {
      console.warn("Firestore promo sync offline or local fallback:", error);
    });

    return () => unsubscribe();
  }, []);

  const saveToFirestore = async (updatedLinks: PromoLinkItem[], updatedGoal?: number) => {
    try {
      const docRef = doc(db, 'system_stats', 'promo_earnings_matrix');
      await setDoc(docRef, {
        links: updatedLinks,
        charityGoal: updatedGoal || charityGoal,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      // Local fallback active
    }
  };

  // Handle clicking a promo link (Live tracking)
  const handleLinkClick = (link: PromoLinkItem) => {
    setJustClickedId(link.id);
    setTimeout(() => setJustClickedId(null), 1200);

    const updated = links.map(l => {
      if (l.id === link.id) {
        return { ...l, clicks: l.clicks + 1 };
      }
      return l;
    });

    setLinks(updated);
    saveToFirestore(updated);

    // Trigger GA4 custom event telemetry
    trackPromoClick(link.id, link.name, link.url, link.epc);
    trackEvent('promo_earnings_updated', {
      link_id: link.id,
      new_clicks: link.clicks + 1,
      estimated_total_eur: totalEarnings + link.epc,
      goal_progress_percent: Math.round(((totalEarnings + link.epc) / charityGoal) * 100)
    });
  };

  // Copy URL with clipboard feedback
  const handleCopy = (link: PromoLinkItem) => {
    navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle active state of link
  const handleToggleActive = (id: string) => {
    const updated = links.map(l => l.id === id ? { ...l, active: !l.active } : l);
    setLinks(updated);
    saveToFirestore(updated);
  };

  // Save new goal
  const handleSaveGoal = () => {
    const num = parseFloat(tempGoalInput);
    if (!isNaN(num) && num > 0) {
      setCharityGoal(num);
      localStorage.setItem('usc_charity_funding_goal', num.toString());
      saveToFirestore(links, num);
      setIsEditingGoal(false);
    }
  };

  // Add new promo link
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;

    const newItem: PromoLinkItem = {
      id: `promo-custom-${Date.now()}`,
      name: newLinkName.trim(),
      campaign: 'Vlastná Kampaň',
      pillar: newLinkPillar,
      url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
      clicks: 0,
      epc: parseFloat(newLinkEpc) || 0.35,
      active: true,
      category: 'affiliate'
    };

    const updated = [newItem, ...links];
    setLinks(updated);
    saveToFirestore(updated);

    setNewLinkName('');
    setNewLinkUrl('');
    setShowAddForm(false);
  };

  // Allocate earnings to charity / solidarity
  const handleAllocateToCharity = () => {
    setAllocatedSuccess(`Úspešne alokovaných €${totalEarnings.toFixed(2)} do Fondu Solidarity U.S.C.`);
    trackEvent('charity_earnings_allocated', {
      allocated_amount: totalEarnings,
      timestamp: new Date().toISOString()
    });
    setTimeout(() => setAllocatedSuccess(null), 4000);
  };

  return (
    <div className="bg-zinc-900 border-4 border-black p-6 md:p-8 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-500 text-black px-3 py-1 font-mono text-xs font-black uppercase tracking-widest mb-2 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <TrendingUp className="w-3.5 h-3.5" /> LIVE EARNINGS & PROMO CLICKS MATRIX
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            Prehľad <span className="text-emerald-400">Zárobkov & Klikov</span>
          </h2>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mt-1">
            Sledovanie kliknutí na promo odkazy a reálny progres financovania komunitných & charitatívnych cieľov.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-2 bg-black hover:bg-zinc-800 text-amber-400 border-2 border-amber-500 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors shadow-[2px_2px_0px_0px_rgba(245,158,11,0.5)]"
          >
            <Plus className="w-4 h-4" />
            <span>Pridať Promo Odkaz</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Clicks */}
        <div className="bg-black border-2 border-zinc-800 p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase mb-2">
            <span className="flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4 text-emerald-400" /> Celkovo Klikov
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {totalClicks.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Naprieč 5 aktívnymi kampaňami</span>
          </div>
        </div>

        {/* Card 2: Generated Revenue */}
        <div className="bg-black border-2 border-emerald-500/80 p-5 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)]">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-mono font-bold uppercase mb-2">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Odhadovaný Zisk
            </span>
            <span className="bg-emerald-950 text-emerald-400 text-[10px] px-1.5 py-0.5 border border-emerald-800">
              EPC LIVE
            </span>
          </div>
          <div className="text-3xl md:text-4xl font-black text-emerald-400 tracking-tight">
            €{totalEarnings.toFixed(2)}
          </div>
          <div className="text-[10px] text-zinc-400 font-mono mt-2 flex items-center justify-between">
            <span>Priemer EPC: €{(totalEarnings / (totalClicks || 1)).toFixed(2)}</span>
            <span className="text-emerald-400 font-bold">100% pre komunitu</span>
          </div>
        </div>

        {/* Card 3: Charity & Funding Goal Progress */}
        <div className="bg-black border-2 border-amber-500/80 p-5 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(245,158,11,0.2)]">
          <div className="flex items-center justify-between text-amber-400 text-xs font-mono font-bold uppercase mb-2">
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-500" /> Cieľ Solidárneho Fondu
            </span>
            <button
              type="button"
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              className="text-[10px] text-zinc-400 hover:text-white underline font-mono"
            >
              {isEditingGoal ? 'Zrušiť' : 'Upraviť cieľ'}
            </button>
          </div>

          {isEditingGoal ? (
            <div className="flex items-center gap-2 my-1">
              <input
                type="number"
                value={tempGoalInput}
                onChange={(e) => setTempGoalInput(e.target.value)}
                className="w-24 bg-zinc-900 border border-amber-500 text-white font-mono text-xs px-2 py-1 outline-none"
              />
              <button
                type="button"
                onClick={handleSaveGoal}
                className="px-2 py-1 bg-amber-500 text-black text-xs font-bold font-mono uppercase"
              >
                Uložiť
              </button>
            </div>
          ) : (
            <div className="flex items-baseline justify-between">
              <div className="text-3xl md:text-4xl font-black text-amber-400 tracking-tight">
                {progressPercentage}%
              </div>
              <span className="text-xs font-mono text-zinc-400">
                z €{charityGoal.toFixed(2)} cieľa
              </span>
            </div>
          )}

          <div className="text-[10px] text-zinc-500 font-mono mt-2">
            {remainingForGoal <= 0 ? (
              <span className="text-emerald-400 font-bold">✓ CIEĽ NAPLNENÝ!</span>
            ) : (
              <span>Chýba ešte €{remainingForGoal.toFixed(2)} do cieľa</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar Toward Charity Goal */}
      <div className="bg-black border-2 border-zinc-800 p-5 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-red-400" />
            <span className="text-white font-bold uppercase">
              Progres Financovania Fondu Pomoci & Serverov:
            </span>
            <span className="text-emerald-400 font-black">€{totalEarnings.toFixed(2)} / €{charityGoal.toFixed(2)}</span>
          </div>

          <div className="text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vygenerované autonómnymi promo linkami</span>
          </div>
        </div>

        {/* Visual Progress Track */}
        <div className="w-full bg-zinc-900 border border-zinc-700 h-6 relative overflow-hidden flex items-center">
          <div 
            className="bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-400 h-full transition-all duration-500 ease-out flex items-center justify-end pr-2 font-mono text-[10px] font-black text-black"
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage >= 15 && `${progressPercentage}%`}
          </div>
          {progressPercentage < 15 && (
            <span className="ml-2 font-mono text-[10px] text-zinc-400 font-bold">
              {progressPercentage}%
            </span>
          )}
        </div>

        {/* Quick Goal Presets & Allocation Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Cieľové Balíky:</span>
            {[
              { label: 'Servery €50', val: 50 },
              { label: 'Pomoc Komunite €250', val: 250 },
              { label: 'Veľký Workshop €500', val: 500 }
            ].map(preset => (
              <button
                key={preset.val}
                type="button"
                onClick={() => {
                  setCharityGoal(preset.val);
                  setTempGoalInput(preset.val.toString());
                  localStorage.setItem('usc_charity_funding_goal', preset.val.toString());
                  saveToFirestore(links, preset.val);
                }}
                className={`px-2 py-1 text-[10px] font-mono uppercase font-bold border transition-colors ${
                  charityGoal === preset.val 
                    ? 'bg-amber-500 text-black border-black font-black' 
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAllocateToCharity}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Alokovať do Fondu Solidarity</span>
          </button>
        </div>

        {allocatedSuccess && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{allocatedSuccess}</span>
          </div>
        )}
      </div>

      {/* Add New Link Form (Collapsible) */}
      {showAddForm && (
        <form onSubmit={handleAddLink} className="bg-black border-2 border-amber-500 p-5 flex flex-col gap-4 animate-fadeIn">
          <div className="text-amber-400 font-mono text-xs font-black uppercase flex items-center justify-between">
            <span>+ Nový Merateľný Promo / Affiliate Odkaz</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-zinc-500 hover:text-white text-xs"
            >
              ✕ Zavrieť
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-zinc-400 text-[10px] font-mono font-bold uppercase mb-1">
                Názov Odkazu
              </label>
              <input
                type="text"
                required
                placeholder="napr. TikTok Drop Odkaz"
                value={newLinkName}
                onChange={(e) => setNewLinkName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white font-mono text-xs focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] font-mono font-bold uppercase mb-1">
                Cieľová URL / Trasa
              </label>
              <input
                type="text"
                required
                placeholder="https://auru.space/usw?ref=..."
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white font-mono text-xs focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] font-mono font-bold uppercase mb-1">
                Pilier
              </label>
              <select
                value={newLinkPillar}
                onChange={(e) => setNewLinkPillar(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white font-mono text-xs focus:border-amber-500 outline-none"
              >
                <option value="U.S.W.">U.S.W. Streetwear</option>
                <option value="Rent a Wheel">Rent a Wheel</option>
                <option value="U.S.C. Work">U.S.C. Work</option>
                <option value="Solidarita">Solidárny Fond</option>
                <option value="Auru Trinity">Auru Trinity</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] font-mono font-bold uppercase mb-1">
                Odhadovaný Výnos (€ / klik)
              </label>
              <input
                type="number"
                step="0.05"
                value={newLinkEpc}
                onChange={(e) => setNewLinkEpc(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white font-mono text-xs focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase font-mono text-xs transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              Uložiť & Začať Meranie
            </button>
          </div>
        </form>
      )}

      {/* List of Promotional Links with Live Click Tester */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-400 uppercase">
          <span>Aktívne Merateľné Promo Odkazy ({links.length})</span>
          <span className="text-zinc-500 text-[10px]">Klikni na "Testovať Klik" pre okamžitú simuláciu</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-zinc-800 text-left font-mono text-xs">
            <thead>
              <tr className="bg-black text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                <th className="p-3">Kampaň / Názov</th>
                <th className="p-3">Pilier</th>
                <th className="p-3 text-right">Kliknutia</th>
                <th className="p-3 text-right">EPC (€)</th>
                <th className="p-3 text-right">Celkový Zisk</th>
                <th className="p-3 text-center">Akcie & Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {links.map((link) => {
                const isJustClicked = justClickedId === link.id;
                const isCopied = copiedId === link.id;
                const linkEarnings = link.clicks * link.epc;

                return (
                  <tr 
                    key={link.id} 
                    className={`hover:bg-zinc-900/80 transition-colors ${!link.active ? 'opacity-50' : ''}`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${link.active ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                        <div>
                          <div className="font-bold text-white uppercase">{link.name}</div>
                          <div className="text-[10px] text-zinc-500 truncate max-w-xs">{link.url}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase">
                        {link.pillar}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <span className={`font-black text-sm transition-all ${isJustClicked ? 'text-amber-400 scale-110 font-bold' : 'text-white'}`}>
                        {link.clicks}
                      </span>
                    </td>

                    <td className="p-3 text-right text-zinc-400">
                      €{link.epc.toFixed(2)}
                    </td>

                    <td className="p-3 text-right">
                      <span className="font-bold text-emerald-400">
                        €{linkEarnings.toFixed(2)}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* Copy Link */}
                        <button
                          type="button"
                          onClick={() => handleCopy(link)}
                          title="Kopírovať odkaz"
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Test Click Tracker */}
                        <button
                          type="button"
                          onClick={() => handleLinkClick(link)}
                          title="Simulovať / Zaznamenať reálny klik"
                          className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500 hover:text-black text-emerald-300 border border-emerald-500/60 font-bold text-[10px] uppercase flex items-center gap-1 transition-all"
                        >
                          <MousePointerClick className="w-3 h-3" />
                          <span>+1 Klik</span>
                        </button>

                        {/* Toggle active */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(link.id)}
                          title={link.active ? 'Pozastaviť' : 'Aktivovať'}
                          className="px-1.5 py-1 text-[10px] text-zinc-500 hover:text-zinc-300"
                        >
                          {link.active ? 'Pauza' : 'Spustiť'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
