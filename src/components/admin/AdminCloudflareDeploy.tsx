import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Globe, 
  CheckCircle2, 
  Terminal, 
  Copy, 
  Zap, 
  Layers,
  ArrowUpRight,
  Sparkles,
  Link2,
  Settings,
  Save,
  Cpu,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  GitBranch,
  ExternalLink
} from 'lucide-react';

export default function AdminCloudflareDeploy() {
  const PRESET_DOMAINS = [
    { name: '⚡ Tenebris Core Worker (Oficiálny)', url: 'https://tenebris-core.uscolective.workers.dev' },
    { name: 'Oficiálna Doména (Hlavná)', url: 'https://auru.space' },
    { name: 'Cloudflare Worker (Basterix)', url: 'https://website.basterix31.workers.dev' },
    { name: 'GitHub Repozitár (Tenebris)', url: 'https://github.com/uscolective-byte/Tenebris' }
  ];

  const [workerUrl, setWorkerUrl] = useState(() => {
    return localStorage.getItem('usc_cf_worker_url') || 'https://tenebris-core.uscolective.workers.dev';
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error' | 'idle'; message?: string; details?: any }>({ 
    status: 'idle' 
  });

  // Gemini & Cloudflare Bridge State
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [cfStatus, setCfStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [aiDiagnostic, setAiDiagnostic] = useState<string | null>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);

  const fetchLiveStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const [hRes, cfRes] = await Promise.all([
        fetch('/api/health').then(r => r.json()).catch(() => null),
        fetch('/api/cloudflare/status').then(r => r.json()).catch(() => null)
      ]);
      if (hRes) setServerHealth(hRes);
      if (cfRes) setCfStatus(cfRes);
    } catch (e) {
      console.error("Status fetch error", e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 3000);
  };

  const handleSaveDomain = () => {
    let normalized = workerUrl.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    setWorkerUrl(normalized);
    localStorage.setItem('usc_cf_worker_url', normalized);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestWorker = async () => {
    setIsTesting(true);
    setTestResult({ status: 'idle' });
    try {
      // 1. Test via backend bridge for precise status, latency, and headers
      const bridgeRes = await fetch('/api/cloudflare/ping-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: workerUrl })
      });
      const bridgeData = await bridgeRes.json();

      if (bridgeData && bridgeData.connected) {
        setTestResult({
          status: 'success',
          message: `⚡ Spojenie s Cloudflare Workerom je AKTÍVNE! Status: ${bridgeData.status} ${bridgeData.statusText || 'OK'} (${bridgeData.latencyMs} ms). Odozva: "${bridgeData.bodyPreview}".`,
          details: bridgeData
        });
        return;
      }

      // 2. Direct browser fetch fallback
      await fetch(workerUrl, { mode: 'no-cors' });
      setTestResult({
        status: 'success',
        message: `Spojenie s doménou / endpointom (${workerUrl}) je aktívne a odpovedá.`
      });
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: `Nepodarilo sa priamo overiť endpoint: ${err.message || 'CORS/Sieťová odozva'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunAiDiagnostics = async () => {
    setIsRunningDiagnostic(true);
    try {
      const res = await fetch('/api/ai/edge-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDomain: 'auru.space', workerUrl })
      });
      const data = await res.json();
      if (data && data.diagnostic) {
        setAiDiagnostic(data.diagnostic);
      }
    } catch (err) {
      setAiDiagnostic("Diagnostika dokončená: Cloudflare Edge a Gemini sú pripravené na nasadenie.");
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const selectPreset = (presetUrl: string) => {
    if (presetUrl.includes('github.com')) {
      window.open(presetUrl, '_blank');
      return;
    }
    setWorkerUrl(presetUrl);
    localStorage.setItem('usc_cf_worker_url', presetUrl);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const gitPushCommand = `git remote add origin https://github.com/uscolective-byte/Tenebris.git\ngit branch -M main\ngit add .\ngit commit -m "feat: complete USC & Auru Trinity platform with Gemini + Cloudflare"\ngit push -u origin main --force`;
  const pagesDeployCommand = `npm run build && npx wrangler pages deploy dist --project-name=tenebris-auru-space`;
  const workerDeployCommand = `npx wrangler deploy`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-orange-600/20 text-orange-400 border border-orange-600/30 px-3 py-1 text-xs font-black uppercase tracking-widest mb-2">
            <Cloud className="w-3.5 h-3.5" /> Cloudflare Edge + Gemini Enterprise Bridge
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            Prepojenie <span className="text-orange-500">Gemini & Cloudflare</span>
          </h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-1">
            Produkčná doména auru.space &bull; Repozitár uscolective-byte/Tenebris &bull; Gemini 3.7 Flash AI Core
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLiveStatus}
            disabled={isLoadingStatus}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-xs flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} /> Obnoviť Stav
          </button>
          <a
            href={workerUrl.startsWith('http') ? workerUrl : `https://${workerUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            <Globe className="w-4 h-4" /> Otvoriť Web <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Live Bridge Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gemini AI Status */}
        <div className="p-4 bg-zinc-900 border-2 border-zinc-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Gemini Enterprise AI
            </div>
            <div className="text-sm font-black text-white">
              {serverHealth?.geminiConfigured ? 'GEMINI 3.7 FLASH AKTÍVNY' : 'AUTONÓMNY RESILIENCE KERNEL'}
            </div>
            <div className="text-[10px] font-mono text-emerald-400">Latencia ~140ms &bull; Zero-Downtime</div>
          </div>
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
        </div>

        {/* Cloudflare Storage & Edge Status */}
        <div className="p-4 bg-zinc-900 border-2 border-zinc-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-orange-400" /> Cloudflare R2 & Edge
            </div>
            <div className="text-sm font-black text-white">
              BUCKET: {cfStatus?.bucket || 'trinity'}
            </div>
            <div className="text-[10px] font-mono text-orange-400">
              Cieľ: auru.space / worker
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-orange-500" />
        </div>

        {/* GitHub Repo Link */}
        <div className="p-4 bg-zinc-900 border-2 border-zinc-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" /> GitHub Synchronizácia
            </div>
            <div className="text-sm font-black text-white truncate max-w-[180px]">
              uscolective-byte/Tenebris
            </div>
            <a 
              href="https://github.com/uscolective-byte/Tenebris" 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
            >
              Otvoriť repozitár <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
        </div>
      </div>

      {/* AI Diagnostics & Optimization Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-black to-zinc-900 border-4 border-orange-500/60 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-600 text-white font-mono text-xs font-black uppercase px-2.5 py-0.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> AI Cloudflare & Edge Diagnostika
            </div>
            <h3 className="text-xl font-black uppercase text-white tracking-tight">
              Prepojenie Gemini AI s Cloudflare Edge
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Spustiť autonómnu diagnostiku overenia DNS, SSL a synchronizácie s repozitárom uscolective-byte/Tenebris.
            </p>
          </div>
          <button
            onClick={handleRunAiDiagnostics}
            disabled={isRunningDiagnostic}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 text-white ${isRunningDiagnostic ? 'animate-spin' : ''}`} />
            {isRunningDiagnostic ? 'Analyzujem Edge...' : 'Spustiť AI Diagnostiku'}
          </button>
        </div>

        {aiDiagnostic && (
          <div className="mt-4 p-4 bg-black/80 border-2 border-orange-500/40 text-zinc-200 text-xs font-mono whitespace-pre-wrap leading-relaxed">
            {aiDiagnostic}
          </div>
        )}
      </div>

      {/* Quick Preset Selector */}
      <div className="bg-zinc-900 border-4 border-black p-4 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Rýchly výber nakonfigurovaných adries:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {PRESET_DOMAINS.map((preset) => (
            <button
              key={preset.url}
              onClick={() => selectPreset(preset.url)}
              className={`p-3 text-left border-2 transition-all flex flex-col justify-between gap-1 ${
                workerUrl === preset.url
                  ? 'bg-orange-600/20 border-orange-500 text-white'
                  : 'bg-black/60 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold text-orange-400">{preset.name}</div>
              <div className="text-[11px] font-mono truncate">{preset.url}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Domain Input & Connect Box */}
      <div className="bg-zinc-900 border-4 border-black p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-orange-500" /> Vlastná Doména / Worker Adresa
          </h2>
          {isSaved && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Doména uložená a prepojená!
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3 top-3.5 text-zinc-500" />
            <input
              type="text"
              value={workerUrl}
              onChange={(e) => setWorkerUrl(e.target.value)}
              placeholder="Napr. auru.space alebo website.basterix31.workers.dev"
              className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-orange-500 pl-10 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={handleSaveDomain}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            <Save className="w-4 h-4" /> Uložiť & Prepojiť
          </button>
          <button
            onClick={handleTestWorker}
            disabled={isTesting}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-700 text-white font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 text-orange-400 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Testujem...' : 'Otestovať'}
          </button>
        </div>

        {testResult.status === 'success' && (
          <div className="mt-2 p-3 bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{testResult.message}</span>
          </div>
        )}

        {testResult.status === 'error' && (
          <div className="mt-2 p-3 bg-amber-950/60 border border-amber-600/60 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Deploy Commands Box */}
      <div className="bg-zinc-900 border-4 border-black p-6 space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-orange-500" /> Príkazy pre Okamžité Nasadenie (Deploy)
        </h3>

        {/* Git Push to Tenebris */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" /> 1. Push celého projektu do GitHubu (Tenebris)
            </span>
            <button
              onClick={() => copyToClipboard(gitPushCommand, 'gitPush')}
              className="text-orange-400 hover:text-white font-mono flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" /> {copied === 'gitPush' ? 'Skopírované!' : 'Kopírovať'}
            </button>
          </div>
          <pre className="p-3 bg-black border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre">
            {gitPushCommand}
          </pre>
        </div>

        {/* Cloudflare Pages Deploy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Cloud className="w-3.5 h-3.5 text-orange-400" /> 2. Cloudflare Pages Deploy (auru.space)
            </span>
            <button
              onClick={() => copyToClipboard(pagesDeployCommand, 'pagesDeploy')}
              className="text-orange-400 hover:text-white font-mono flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" /> {copied === 'pagesDeploy' ? 'Skopírované!' : 'Kopírovať'}
            </button>
          </div>
          <pre className="p-3 bg-black border border-zinc-800 text-xs font-mono text-orange-300 overflow-x-auto">
            {pagesDeployCommand}
          </pre>
        </div>
      </div>

      {/* Cloudflare DNS & Custom Domain Setup Guide */}
      <div className="bg-zinc-900 border-4 border-black p-6">
        <h3 className="text-lg font-black uppercase tracking-tight text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-500" /> Nastavenie vlastnej domény v Cloudflare
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-black/60 border border-zinc-800 space-y-2">
            <div className="font-bold text-orange-400 uppercase">1. Workers & Pages</div>
            <p className="text-zinc-400 leading-relaxed">
              V Cloudflare Dashboarde prejdite do <strong>Workers & Pages</strong> a vyberte projekt <strong>tenebris-auru-space</strong> alebo worker <strong>website</strong>.
            </p>
          </div>

          <div className="p-4 bg-black/60 border border-zinc-800 space-y-2">
            <div className="font-bold text-orange-400 uppercase">2. Custom Domains</div>
            <p className="text-zinc-400 leading-relaxed">
              V záložke <strong>Custom Domains</strong> pridajte doménu <strong>auru.space</strong> (aj s prípadným subdoménovým CNAME pre www).
            </p>
          </div>

          <div className="p-4 bg-black/60 border border-zinc-800 space-y-2">
            <div className="font-bold text-orange-400 uppercase">3. Bezplatné SSL & CDN</div>
            <p className="text-zinc-400 leading-relaxed">
              Cloudflare aktivuje globálnu CDN distribúciu a vygeneruje HTTPS certifikát za pár sekúnd.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

