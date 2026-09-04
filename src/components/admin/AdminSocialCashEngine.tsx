import React, { useState } from 'react';
import { 
  Video, 
  Share2, 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  Flame, 
  Copy, 
  CheckCircle2, 
  Zap, 
  BarChart2, 
  Eye, 
  Smartphone, 
  Globe, 
  Layers, 
  Tag, 
  Megaphone,
  Radio,
  Sliders,
  Play
} from 'lucide-react';

interface ViralNiche {
  id: string;
  name: string;
  platform: 'TikTok' | 'Instagram Reels' | 'YouTube Shorts';
  rpmRange: string;
  potentialViews: string;
  category: string;
  templateIdea: string;
}

export default function AdminSocialCashEngine() {
  const [activeNiche, setActiveNiche] = useState<string>('underground-cars');
  const [targetProductOrTopic, setTargetProductOrTopic] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'HOOK_SCRIPT' | 'CAROUSEL_POST' | 'AFFILIATE_PITCH' | 'VIRAL_CHALLENGE'>('HOOK_SCRIPT');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Monetization Sim State
  const [dailyViews, setDailyViews] = useState<number>(25000);
  const [adRpm, setAdRpm] = useState<number>(1.8);
  const [affiliateConversionRate, setAffiliateConversionRate] = useState<number>(1.2);
  const [affiliatePayout, setAffiliatePayout] = useState<number>(15);

  const VIRAL_NICHES: ViralNiche[] = [
    {
      id: 'underground-cars',
      name: 'Tuning, Autá & Street Hustle',
      platform: 'TikTok',
      rpmRange: '€1.20 – €3.50 / 1k zobrazení',
      potentialViews: '50k – 500k / video',
      category: 'Automotive & Lifestyle',
      templateIdea: 'Nočné zábery upravených áut, dodávok a zvukov výfukov s motivačným textom o tvrdej práci a nočných zmenách.'
    },
    {
      id: 'montaze-money',
      name: 'Realita Montáží v Nemecku (Hustle & Money)',
      platform: 'TikTok',
      rpmRange: '€2.50 – €6.00 / 1k zobrazení',
      potentialViews: '100k – 1M / video',
      category: 'Work & High Income',
      templateIdea: 'Porovnanie platov na stavbách, výplaty v hotovosti, čo si kúpiš za 1 týždeň na montáži v DE a odkaz na bio pre prácu.'
    },
    {
      id: 'ai-tools-tech',
      name: 'AI Nástroje & Ako zarábať cez mobil',
      platform: 'Instagram Reels',
      rpmRange: '€3.00 – €8.00 / 1k zobrazení',
      potentialViews: '20k – 200k / video',
      category: 'Side Hustles & Tech',
      templateIdea: '3 tajné AI weby, o ktorých 99% ľudí nevie. Vyzvi ich komentovať slovo "LINK" a automaticky im pošli tvoj affiliate web.'
    },
    {
      id: 'mystery-facts',
      name: 'Podsvetie, Street Príbehy & Dark Psychology',
      platform: 'YouTube Shorts',
      rpmRange: '€1.50 – €4.00 / 1k zobrazení',
      potentialViews: '100k – 2M / video',
      category: 'Viral Entertainment',
      templateIdea: 'Rýchly AI generovaný príbeh s dramatickou hudbou a vizuálom, ktorý udrží diváka až do poslednej sekundy (100% retencia).'
    }
  ];

  const currentNiche = VIRAL_NICHES.find(n => n.id === activeNiche) || VIRAL_NICHES[0];

  // Calculations
  const monthlyAdRevenue = (dailyViews * 30 / 1000) * adRpm;
  const estimatedClicks = (dailyViews * 30) * 0.025; // 2.5% click through rate to bio
  const monthlyAffiliateSales = estimatedClicks * (affiliateConversionRate / 100);
  const monthlyAffiliateRevenue = monthlyAffiliateSales * affiliatePayout;
  const totalEstimatedMonthly = monthlyAdRevenue + monthlyAffiliateRevenue;

  const handleGenerateViralContent = async () => {
    setIsGenerating(true);
    setGeneratedScript(null);
    try {
      const prompt = `Si špičkový expert na viralitu na TikToku, Instagrame a YouTube Shorts.
Vytvor virálny scenár s vysokou retenciou a okamžitou monetizáciou pre:
- Nika: ${currentNiche.name} (${currentNiche.category})
- Platforma: ${currentNiche.platform}
- Formát: ${selectedFormat}
- Téma/Produkt: ${targetProductOrTopic || currentNiche.templateIdea}
- Cieľ: Maximálna pozornosť v prvých 3 sekundách (Hook), komentáre na zvýšenie algoritmu a preklik na web auru.space / link v bio.

ŠTRUKTÚRA VÝSTUPU:
1. 💥 VIRÁLNY HOOK (Text na obrazovke + prvá veta do 3s)
2. 🎬 VIZUÁLNE INŠTRUKCIE (Čo presne natočiť na telefón za 5 minút)
3. 🎙️ HLASOVÝ TEXT / VOICEOVER (Dynamický a úderný text)
4. 💰 CALL TO ACTION & MONETIZÁCIA (Ako premeniť diváka na peniaze / klik na reklamu)
5. 🏷️ HASHTAGY (#fyp #viral ...)`;

      const res = await fetch('/api/ai/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          mode: 'VIRAL_SOCIAL_MEDIA_MONETIZER'
        })
      });

      const data = await res.json();
      if (data.reply) {
        setGeneratedScript(data.reply);
      } else {
        setGeneratedScript(`💥 VIRÁLNY HOOK (0-3s):
Text na displeji: "Preto 90% ľudí nemá peniaze na nové auto..."
Hlas: "Ak máš viac ako 18 a stále nevieš o tomto spôsobe zárobku, strácaš denne 50€."

🎬 VIZUÁL (3-15s):
Záber zvnútra auta, nočná jazda mestom, rýchly prestrih na obrazovku telefónu s webom auru.space.

🎙️ TEXT (15-30s):
"Nemusíš makať 12 hodín za pásom. Stačí využiť AI automatizáciu a prepojenie na zákazky. Celý postup nájdeš zadarmo v mojom bio."

💰 CALL TO ACTION:
"Napíš do komentára 'AUTO' a pošlem ti priamy prístup."

🏷️ HASHTAGY:
#fyp #slovakia #czech #zarabanieonline #viral #lifestyle #street`);
      }
    } catch (err) {
      setGeneratedScript('Chyba pri generovaní scenára.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyScript = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-pink-600/20 text-pink-400 border border-pink-600/30 px-3 py-1 text-xs font-black uppercase tracking-widest mb-2">
            <Video className="w-3.5 h-3.5" /> TikTok & Instagram Cash Flow Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            Social Media <span className="text-pink-500">Viral Monetizer</span>
          </h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-1">
            Automatizované generovanie virálnych videí, preklikov na reklamy a pasívnych affiliate provízií
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-zinc-900 border-2 border-pink-500 text-pink-400 font-mono text-xs font-bold flex items-center gap-2">
            <Radio className="w-4 h-4 text-pink-500 animate-ping" />
            Viral Algorithm: <span className="text-white font-black">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* 3-Step Strategy Visual Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border-4 border-black p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-pink-500 font-mono">01</span>
            <Sparkles className="w-5 h-5 text-pink-400" />
          </div>
          <h3 className="text-sm font-black uppercase text-white tracking-wide">
            1. AI Virálny Scenár
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Vygeneruješ 30-sekundový magnet na pozornosť pre TikTok / Reels s chytľavým hookom a hudbou.
          </p>
        </div>

        <div className="bg-zinc-900 border-4 border-black p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-500 font-mono">02</span>
            <Share2 className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-sm font-black uppercase text-white tracking-wide">
            2. Masívna Návštevnosť
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Diváci z videa klikajú na tvoj odkaz v profile (auru.space alebo linktree), kde bežia reklamy a ponuky.
          </p>
        </div>

        <div className="bg-zinc-900 border-4 border-black p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-500 font-mono">03</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-sm font-black uppercase text-white tracking-wide">
            3. Drobné Peniaze na Autopilote
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Zarábaš na zobrazeniach reklám (CPM), preklikoch (CPC) a drobných affiliate províziách z každého nákupu.
          </p>
        </div>
      </div>

      {/* Simulator: How much you earn */}
      <div className="bg-zinc-900 border-4 border-black p-6 space-y-6 shadow-[6px_6px_0px_0px_rgba(236,72,153,1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-black uppercase text-white tracking-tight flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-pink-500" /> Odhad Zárobku z Reklamy & Sociálnych Sietí
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Nastav si očakávanú sledovanosť na TikToku / Instagrame a zisti svoj mesačný pasívny príjem.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-zinc-400 uppercase">Odhadovaný mesačný zisk:</div>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              €{Math.round(totalEstimatedMonthly).toLocaleString()} <span className="text-xs text-zinc-500">/ mesiac</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
          <div>
            <div className="flex justify-between text-zinc-300 font-bold mb-2">
              <span>Denné zhliadnutia videí:</span>
              <span className="text-pink-400 font-black">{dailyViews.toLocaleString()} views/deň</span>
            </div>
            <input
              type="range"
              min="5000"
              max="200000"
              step="5000"
              value={dailyViews}
              onChange={(e) => setDailyViews(Number(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>5,000 (Štart)</span>
              <span>100,000 (Virál)</span>
              <span>200,000+</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-zinc-300 font-bold mb-2">
              <span>Reklamný RPM (€ / 1k zobrazení):</span>
              <span className="text-amber-400 font-black">€{adRpm.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="6.0"
              step="0.1"
              value={adRpm}
              onChange={(e) => setAdRpm(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>€0.50 (Základ)</span>
              <span>€3.00 (EU Trh)</span>
              <span>€6.00 (DE/US)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-zinc-300 font-bold mb-2">
              <span>Affiliate provízia za nákup:</span>
              <span className="text-emerald-400 font-black">€{affiliatePayout}</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={affiliatePayout}
              onChange={(e) => setAffiliatePayout(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>€5 (Drobné)</span>
              <span>€20 (Kurz/Nástroj)</span>
              <span>€50 (B2B)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-black/60 p-3 border border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Príjmy čisto z reklám a zobrazení (Ad Monetization):</span>
            <span className="text-sm font-bold text-white font-mono">€{Math.round(monthlyAdRevenue).toLocaleString()} / mes.</span>
          </div>
          <div className="bg-black/60 p-3 border border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Príjmy z preklikov v bio (Affiliate & E-shop):</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">€{Math.round(monthlyAffiliateRevenue).toLocaleString()} / mes.</span>
          </div>
        </div>
      </div>

      {/* Generator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Niche Selector (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-900 border-4 border-black p-5 space-y-4">
          <h2 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-2">
            <Flame className="w-4 h-4 text-pink-500" /> Vyber Virálnu Oblasť
          </h2>

          <div className="space-y-2.5">
            {VIRAL_NICHES.map((niche) => (
              <div
                key={niche.id}
                onClick={() => setActiveNiche(niche.id)}
                className={`p-3.5 cursor-pointer border-2 transition-all ${
                  activeNiche === niche.id
                    ? 'bg-pink-600/20 border-pink-500 text-white'
                    : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-pink-400">
                    {niche.platform}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {niche.rpmRange}
                  </span>
                </div>
                <div className="text-xs font-black uppercase tracking-tight text-white mb-1">
                  {niche.name}
                </div>
                <div className="text-[11px] text-zinc-500 line-clamp-2">
                  {niche.templateIdea}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Script & Hook AI Generator (8 cols) */}
        <div className="lg:col-span-8 bg-zinc-900 border-4 border-black p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b-2 border-zinc-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-500" /> AI TikTok & Reels Generátor
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Zadaj nápad alebo nechaj AI navrhnúť hotový virálny formát s predajným preklikom.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Typ formátu:
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e: any) => setSelectedFormat(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                >
                  <option value="HOOK_SCRIPT">Krátke 30s Video (Hook + Retencia + CTA)</option>
                  <option value="CAROUSEL_POST">Instagram / TikTok Fotokarusel (Viac záberov)</option>
                  <option value="AFFILIATE_PITCH">Priame odporúčanie produktu s linkom</option>
                  <option value="VIRAL_CHALLENGE">Virálna výzva / Zapojenie komunity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Vlastná téma / Zameranie videa (Voliteľné):
                </label>
                <input
                  type="text"
                  value={targetProductOrTopic}
                  onChange={(e) => setTargetProductOrTopic(e.target.value)}
                  placeholder="Napr. Koľko zarobí montážnik za 1 víkend v Nemecku..."
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateViralContent}
              disabled={isGenerating}
              className="w-full py-3.5 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {isGenerating ? 'AI Pripravuje Virálny Scenár...' : 'Vygenerovať Virálny TikTok / Reels Scenár'}
            </button>
          </div>

          {/* Result */}
          {generatedScript && (
            <div className="mt-4 bg-black/80 border-2 border-pink-500 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-400 uppercase font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Scenár pripravený na natáčanie & publikovanie
                </span>
                <button
                  onClick={copyScript}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-pink-400" />
                  {copied ? 'Skopírované!' : 'Kopírovať scenár'}
                </button>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-sans whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                {generatedScript}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
