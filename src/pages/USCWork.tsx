import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Euro, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Globe2, 
  UserCheck, 
  Send, 
  X, 
  Building2, 
  HardHat, 
  Truck,
  Flame,
  Link as LinkIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { trackWorkerMatching, trackPillarEngagement } from '../lib/analytics';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Seed job offers
const defaultJobs = [
  {
    id: 'job-de-1',
    title: 'Elektromontér / Inštalatér FVE',
    location: 'Nemecko (Mníchov & Stuttgart)',
    type: 'Turnusy (3+1 týždne)',
    wage: '€24 - €32 / hodina',
    contract: 'Živnosť / SZČO',
    accommodation: 'Ubytovanie Hradené',
    description: 'Montáž fotovoltických systémov na priemyselné haly a rodinné domy. Znalosť NJ výhodou (aspoň 1 v partii).',
    category: 'foreign'
  },
  {
    id: 'job-nl-1',
    title: 'Zvárač TIG 141 / Potrubár',
    location: 'Holandsko (Rotterdam)',
    type: 'Dlhodobý projekt',
    wage: '€28 - €36 / hodina',
    contract: 'Živnosť / A1',
    accommodation: 'Ubytovanie Zabezpečené',
    description: 'Zváranie nerezových a uhlíkových potrubí v rafinériách a potravinárskych závodoch. Platné certifikáty nutné.',
    category: 'foreign'
  },
  {
    id: 'job-at-1',
    title: 'Sádrokartonár & Maliar',
    location: 'Rakúsko (Viedeň a okolie)',
    type: 'Týždenné turnusy',
    wage: '€22 - €26 / hodina',
    contract: 'Živnosť / SZČO',
    accommodation: 'Príspevok na ubytovanie',
    description: 'Montáže sádrokartónových priečok a stropov, stierkovanie, maľovanie novostavieb.',
    category: 'foreign'
  },
  {
    id: 'job-sk-1',
    title: 'Vodič Bolt / Wolt / Taxi Flotila U.S.C',
    location: 'Bratislava & Trnava',
    type: 'Flexibilný pracovný čas',
    wage: '€1 800 - €2 800 / mesiac',
    contract: 'Dohoda / Živnosť',
    accommodation: 'Vozidlo s koncesiou k dispozícii',
    description: 'Jazdi v našom vozovom parku (Rent a Wheel). Garantované platby každý týždeň na ruku alebo účet.',
    category: 'slovakia'
  },
  {
    id: 'job-sk-2',
    title: 'Skladník & Dispečer Logistiky',
    location: 'Senec / Logistický Park',
    type: 'Plný úväzok (TPP / Živnosť)',
    wage: '€1 600 - €2 100 / mesiac',
    contract: 'TPP / Živnosť',
    accommodation: 'Denné dochádzanie',
    description: 'Príjem a výdaj tovaru, obsluha VZV (platný preukaz zabezpečíme), evidencia v digitálnom systéme Auru Trinity.',
    category: 'slovakia'
  }
];

const fallbackPartners = [
  { id: 'p1', name: 'BauGruppe Deutschland', description: 'Generálny dodávateľ pre veľké infraštruktúrne a rezidenčné stavby v Bavorsku.' },
  { id: 'p2', name: 'Rotterdam Port Logistics', description: 'Medzinárodný námorný a priemyselný hub pre špecializované montáže a zváračské práce.' },
  { id: 'p3', name: 'AustroMontage Wien', description: 'Partner pre suchú výstavbu, elektroinštalácie a interiérové dokončovacie práce.' },
  { id: 'p4', name: 'U.S.C Fleet Logistics', description: 'Interná divízia zabezpečujúca vozový park, dispečing a transport pracovníkov.' }
];

export default function USCWork() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'services' | 'partners'>('jobs');
  const [jobCategoryFilter, setJobCategoryFilter] = useState<'all' | 'foreign' | 'slovakia'>('all');
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Job Application Modal
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applyForm, setApplyForm] = useState({
    name: '',
    phone: '',
    email: '',
    experience: '',
    hasTradeLicense: 'yes',
    hasGermanLanguage: 'basic',
    note: ''
  });
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);
  const [applySuccessId, setApplySuccessId] = useState<string | null>(null);

  // Trade/Business Setup Form
  const [tradeForm, setTradeForm] = useState({
    name: '',
    phone: '',
    serviceType: 'new_trade',
    currentStatus: 'employed',
    note: ''
  });
  const [isSubmittingTrade, setIsSubmittingTrade] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'partners'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPartners(data);
      setLoading(false);
    }, (error) => {
      console.warn("Partners fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const displayPartners = partners.length > 0 ? partners : fallbackPartners;

  const filteredJobs = defaultJobs.filter(j => {
    if (jobCategoryFilter === 'all') return true;
    return j.category === jobCategoryFilter;
  });

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.name || !applyForm.phone || !selectedJob) return;

    setIsSubmittingApply(true);
    try {
      const docRef = await addDoc(collection(db, 'work_applications'), {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        jobLocation: selectedJob.location,
        ...applyForm,
        status: 'new',
        createdAt: serverTimestamp()
      });

      // Google Analytics 4: Track Worker application & Pillar engagement
      trackWorkerMatching(selectedJob.title, selectedJob.location);
      trackPillarEngagement('USC_WORK', 'job_application_submitted', {
        job_id: selectedJob.id,
        job_title: selectedJob.title,
        experience: applyForm.experience,
        german_level: applyForm.hasGermanLanguage
      });

      setApplySuccessId(docRef.id);
      setApplyForm({
        name: '',
        phone: '',
        email: '',
        experience: '',
        hasTradeLicense: 'yes',
        hasGermanLanguage: 'basic',
        note: ''
      });
    } catch (err) {
      console.error("Apply error:", err);
    } finally {
      setIsSubmittingApply(false);
    }
  };

  const handleTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeForm.name || !tradeForm.phone) return;

    setIsSubmittingTrade(true);
    try {
      await addDoc(collection(db, 'trade_license_requests'), {
        ...tradeForm,
        createdAt: serverTimestamp()
      });
      setTradeSuccess(true);
    } catch (err) {
      console.error("Trade license request error:", err);
    } finally {
      setIsSubmittingTrade(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white pt-24 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
        {/* Navigation & Status Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white uppercase font-black tracking-widest text-xs transition-colors">
            <ArrowLeft className="w-4 h-4" /> Späť na Centrálu
          </Link>
          <div className="flex items-center gap-2 bg-blue-950 border border-blue-600 text-blue-400 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" /> U.S.C. WORK & AGENCY // PILIER 4
          </div>
        </div>

        {/* Hero Section */}
        <header className="pb-12 border-b border-zinc-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-2">
              UNDERGROUND-STREET-COLLECTIVE WORK & B2B
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              U. S. C. <span className="text-amber-500">Work</span>
            </h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm max-w-2xl mt-4 leading-relaxed">
              Personálna agentúra a pracovný servis. Vybavovanie živností, s.r.o., hľadanie zákaziek a turnusov v zahraničí (DE, AT, NL, CH). 
              Úplná starostlivosť od daňových priznaní, certifikátov až po vyslanie a ubytovanie.
            </p>
          </motion.div>

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-6 py-3 font-black uppercase tracking-widest text-xs border-2 transition-all flex items-center gap-2 ${
                activeTab === 'jobs'
                  ? 'bg-amber-500 border-black text-black shadow-[4px_4px_0px_0px_rgba(245,158,11,1)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <HardHat className="w-4 h-4" /> Aktuálne Ponuky & Turnusy ({defaultJobs.length})
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-3 font-black uppercase tracking-widest text-xs border-2 transition-all flex items-center gap-2 ${
                activeTab === 'services'
                  ? 'bg-amber-500 border-black text-black shadow-[4px_4px_0px_0px_rgba(245,158,11,1)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" /> Založenie Živnosti / S.R.O. na Kľúč
            </button>

            <button
              onClick={() => setActiveTab('partners')}
              className={`px-6 py-3 font-black uppercase tracking-widest text-xs border-2 transition-all flex items-center gap-2 ${
                activeTab === 'partners'
                  ? 'bg-amber-500 border-black text-black shadow-[4px_4px_0px_0px_rgba(245,158,11,1)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" /> Sieť Partnerov ({displayPartners.length})
            </button>
          </div>
        </header>

        {/* TAB 1: JOB BOARD */}
        {activeTab === 'jobs' && (
          <section className="py-12">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex gap-2">
                <button
                  onClick={() => setJobCategoryFilter('all')}
                  className={`px-4 py-2 text-xs font-mono font-bold uppercase border ${
                    jobCategoryFilter === 'all' ? 'bg-white text-black border-white' : 'bg-black text-zinc-400 border-zinc-800'
                  }`}
                >
                  Všetky Ponuky
                </button>
                <button
                  onClick={() => setJobCategoryFilter('foreign')}
                  className={`px-4 py-2 text-xs font-mono font-bold uppercase border ${
                    jobCategoryFilter === 'foreign' ? 'bg-amber-500 text-black border-amber-500' : 'bg-black text-zinc-400 border-zinc-800'
                  }`}
                >
                  Zahraničie (DE / NL / AT)
                </button>
                <button
                  onClick={() => setJobCategoryFilter('slovakia')}
                  className={`px-4 py-2 text-xs font-mono font-bold uppercase border ${
                    jobCategoryFilter === 'slovakia' ? 'bg-blue-600 text-white border-blue-600' : 'bg-black text-zinc-400 border-zinc-800'
                  }`}
                >
                  Slovensko & Vodiči
                </button>
              </div>

              <span className="text-zinc-500 text-xs font-mono">
                ZOBRAZENÝCH: <strong>{filteredJobs.length}</strong> POZÍCIÍ
              </span>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredJobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-zinc-900 border-4 border-black p-6 md:p-8 flex flex-col justify-between hover:border-amber-500 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(245,158,11,1)] group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className="inline-block bg-black text-amber-400 font-mono text-[10px] px-2.5 py-1 uppercase font-bold border border-zinc-800 mb-2">
                          {job.contract}
                        </span>
                        <h3 className="text-2xl font-black uppercase text-white tracking-tight group-hover:text-amber-400 transition-colors">
                          {job.title}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="text-lg md:text-xl font-black text-amber-400 font-mono">
                          {job.wage}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono uppercase">
                          {job.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-zinc-400 font-mono mb-4 py-2 border-y border-zinc-800">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                        <span>{job.accommodation}</span>
                      </div>
                    </div>

                    <p className="text-zinc-400 text-xs uppercase font-bold leading-relaxed mb-6">
                      {job.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setApplySuccessId(null);
                    }}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-xs border-2 border-black transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <UserCheck className="w-4 h-4" />
                    Mám Záujem o Túto Pozíciu
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 2: TRADE & S.R.O. SERVICES */}
        {activeTab === 'services' && (
          <section className="py-12 max-w-4xl mx-auto">
            <div className="bg-zinc-900 border-4 border-amber-500 p-8 md:p-12 shadow-[10px_10px_0px_0px_rgba(245,158,11,0.3)] mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-500 text-black flex items-center justify-center font-black">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase text-white tracking-tight">
                    Vybavenie Živnosti & S.R.O. Na Kľúč
                  </h2>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                    Zbav sa byrokracie. Pripravíme ti všetky doklady, A1 formuláre, sídlo a účtovné podklady.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-xs">
                <div className="bg-black border border-zinc-800 p-4">
                  <span className="text-amber-500 font-mono text-lg font-black block mb-1">01 // Založenie</span>
                  <p className="text-zinc-300 font-bold uppercase">
                    Ohlásenie živnosti alebo založenie s.r.o. bez behania po úradoch do 48 hodín.
                  </p>
                </div>
                <div className="bg-black border border-zinc-800 p-4">
                  <span className="text-amber-500 font-mono text-lg font-black block mb-1">02 // A1 & Turnusy</span>
                  <p className="text-zinc-300 font-bold uppercase">
                    Vybavenie formulára A1 pre legálnu prácu a vyslanie do krajín EÚ.
                  </p>
                </div>
                <div className="bg-black border border-zinc-800 p-4">
                  <span className="text-amber-500 font-mono text-lg font-black block mb-1">03 // Dane & Mzdy</span>
                  <p className="text-zinc-300 font-bold uppercase">
                    Pravidelné spracovanie faktúr, odvodov a ročných daňových priznaní bez stresu.
                  </p>
                </div>
              </div>

              {tradeSuccess ? (
                <div className="bg-black border-2 border-amber-500 p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-black uppercase text-white mb-2">Požiadavka Zaznamenaná!</h3>
                  <p className="text-zinc-400 text-xs mb-6">
                    Náš špecialista na zakladanie a byrokraciu ťa bude kontaktovať do 24 hodín s presným zoznamom podkladov.
                  </p>
                  <button
                    onClick={() => setTradeSuccess(false)}
                    className="px-6 py-3 bg-amber-500 text-black font-black uppercase text-xs tracking-widest"
                  >
                    Odoslať Ďalšiu Žiadosť
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTradeSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Meno a Priezvisko</label>
                      <input
                        type="text"
                        required
                        value={tradeForm.name}
                        onChange={(e) => setTradeForm({ ...tradeForm, name: e.target.value })}
                        placeholder="Jozef Kováč"
                        className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Telefónne Číslo</label>
                      <input
                        type="tel"
                        required
                        value={tradeForm.phone}
                        onChange={(e) => setTradeForm({ ...tradeForm, phone: e.target.value })}
                        placeholder="+421 9xx xxx xxx"
                        className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Požadovaná Služba</label>
                      <select
                        value={tradeForm.serviceType}
                        onChange={(e) => setTradeForm({ ...tradeForm, serviceType: e.target.value })}
                        className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-amber-500 uppercase"
                      >
                        <option value="new_trade">Založenie novej živnosti (SZČO)</option>
                        <option value="new_sro">Založenie s.r.o. na kľúč</option>
                        <option value="a1_certificate">Vybavenie A1 formulára do zahraničia</option>
                        <option value="tax_accounting">Daňové priznanie & Účtovníctvo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Aktuálny Status</label>
                      <select
                        value={tradeForm.currentStatus}
                        onChange={(e) => setTradeForm({ ...tradeForm, currentStatus: e.target.value })}
                        className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-amber-500 uppercase"
                      >
                        <option value="employed">Zamestnanec (chcem prejsť na živnosť)</option>
                        <option value="unemployed">Nezamestnaný / Úrad práce</option>
                        <option value="active_szco">Mám už živnosť, potrebujem zákazky a servis</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Doplňujúce info / Odbor</label>
                    <input
                      type="text"
                      value={tradeForm.note}
                      onChange={(e) => setTradeForm({ ...tradeForm, note: e.target.value })}
                      placeholder="Napr. montér, elektrikár, autodoprava..."
                      className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingTrade}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-2 border-black transition-colors disabled:opacity-50 mt-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmittingTrade ? 'Odosielam...' : 'Požiadať o Vybavenie Živnosti / Servisu'}
                  </button>
                </form>
              )}
            </div>
          </section>
        )}

        {/* TAB 3: PARTNERS NETWORK */}
        {activeTab === 'partners' && (
          <section className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayPartners.map((p, idx) => (
                <motion.div
                  key={p.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-zinc-900 border-4 border-black p-8 hover:border-amber-500 transition-colors group shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-black border-2 border-zinc-800 flex items-center justify-center group-hover:border-amber-500 transition-colors">
                      <Briefcase className="w-8 h-8 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase">{p.name}</h3>
                      <span className="text-[10px] text-green-400 font-mono font-bold uppercase">
                        ✓ VERIFIED U.S.C PARTNER
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-zinc-400 font-bold uppercase tracking-widest leading-relaxed mb-6 text-xs">
                    {p.description}
                  </p>

                  <div className="text-amber-500 font-black uppercase tracking-widest text-xs flex items-center gap-2 border-t border-zinc-800 pt-4">
                    <Globe2 className="w-4 h-4" /> Stabilné turnusy & Garantovaná likvidita
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* JOB APPLICATION MODAL */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border-4 border-amber-500 max-w-xl w-full p-6 md:p-8 relative shadow-[12px_12px_0px_0px_rgba(245,158,11,0.3)] my-8"
            >
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white p-2"
              >
                <X className="w-6 h-6" />
              </button>

              {applySuccessId ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <CheckCircle2 className="w-16 h-16 text-amber-500 mb-4" />
                  <h3 className="text-3xl font-black uppercase text-white mb-2">
                    Žiadosť Bola Zaregistrovaná!
                  </h3>
                  <p className="text-zinc-400 text-xs font-mono mb-4">
                    APPLICANT ID: <strong className="text-amber-400">{applySuccessId.slice(0, 8).toUpperCase()}</strong>
                  </p>
                  <p className="text-zinc-300 text-sm max-w-md leading-relaxed mb-6">
                    Tvoja žiadosť na pozíciu <strong className="text-white">{selectedJob.title}</strong> bola zaradená do systému. Náš personálny koordinátor ťa bude kontaktovať do 24 hodín.
                  </p>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-8 py-3 bg-amber-500 text-black font-black uppercase tracking-widest text-xs hover:bg-amber-400"
                  >
                    Späť na Ponuky
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-amber-500 font-mono text-xs uppercase font-bold">RÝCHLA ŽIADOSŤ O POZÍCIU</span>
                    <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                      {selectedJob.title}
                    </h2>
                    <div className="text-sm font-mono text-zinc-300 mt-1">
                      Lokalita: <strong className="text-white">{selectedJob.location}</strong> | Plat: <strong className="text-amber-400">{selectedJob.wage}</strong>
                    </div>
                  </div>

                  <form onSubmit={handleApplySubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Meno a Priezvisko</label>
                        <input
                          type="text"
                          required
                          value={applyForm.name}
                          onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                          placeholder="Peter Novák"
                          className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Telefón (Mobil)</label>
                        <input
                          type="tel"
                          required
                          value={applyForm.phone}
                          onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                          placeholder="+421 9xx xxx xxx"
                          className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Máš Aktívnu Živnosť (SZČO)?</label>
                        <select
                          value={applyForm.hasTradeLicense}
                          onChange={(e) => setApplyForm({ ...applyForm, hasTradeLicense: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-amber-500 uppercase"
                        >
                          <option value="yes">Áno, mám živnosť</option>
                          <option value="need_help">Nemám, potrebujem založiť cez U.S.C.</option>
                          <option value="sro">Mám s.r.o.</option>
                          <option value="tpp">Hľadám prácu na TPP / Dohodu</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Jazykové Znalosti (Nemecký / Anglický)</label>
                        <select
                          value={applyForm.hasGermanLanguage}
                          onChange={(e) => setApplyForm({ ...applyForm, hasGermanLanguage: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-amber-500 uppercase"
                        >
                          <option value="basic">Základy na stavbe</option>
                          <option value="communicative">Plynulá komunikácia</option>
                          <option value="none">Bez jazyka (pracujem v partii)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Skúsenosti a Prax (v rokoch / opis)</label>
                      <textarea
                        rows={3}
                        required
                        value={applyForm.experience}
                        onChange={(e) => setApplyForm({ ...applyForm, experience: e.target.value })}
                        placeholder="Napr. 5 rokov praxe ako elektrikár, vyhláška §22, vlastné náradie a auto..."
                        className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    <div className="flex items-start gap-3 bg-zinc-900 p-3 border border-zinc-800">
                      <input
                        type="checkbox"
                        id="gdpr-agree"
                        required
                        defaultChecked
                        className="mt-0.5 w-4 h-4 accent-amber-500 cursor-pointer"
                      />
                      <label htmlFor="gdpr-agree" className="text-[11px] text-zinc-400 leading-snug cursor-pointer select-none">
                        Súhlasím so spracovaním osobných údajov (GDPR) za účelom zaradenia do databázy uchádzačov, vyhodnotenia profilu a sprostredkovania pracovných ponúk a zákaziek.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingApply}
                      className="w-full mt-2 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-2 border-black disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <UserCheck className="w-4 h-4" />
                      {isSubmittingApply ? 'Zaznamenávam žiadosť...' : 'Odoslať Rýchlu Žiadosť'}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
