import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  HeartHandshake, 
  Shield, 
  HandCoins, 
  ArrowRight, 
  Car, 
  ArrowLeft, 
  CheckCircle2, 
  Send, 
  AlertCircle, 
  PackageCheck, 
  Users, 
  Building, 
  Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { trackPillarEngagement } from '../lib/analytics';
import solidarityImg from '../assets/images/usc_solidarity_brutalist_1787064778469.jpg';

export default function USCSolidarity() {
  const [activeFormTab, setActiveFormTab] = useState<'requestHelp' | 'volunteer'>('requestHelp');

  // Form 1: Request Help
  const [helpForm, setHelpForm] = useState({
    beneficiaryName: '',
    contact: '',
    city: '',
    helpType: 'food_clothing',
    urgency: 'high',
    story: ''
  });
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);
  const [helpSuccess, setHelpSuccess] = useState(false);

  // Form 2: Volunteer / Donate
  const [volunteerForm, setVolunteerForm] = useState({
    name: '',
    contact: '',
    city: '',
    contributionType: 'material',
    availability: 'weekends',
    note: ''
  });
  const [isSubmittingVol, setIsSubmittingVol] = useState(false);
  const [volSuccess, setVolSuccess] = useState(false);

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpForm.contact || !helpForm.story) return;

    setIsSubmittingHelp(true);
    try {
      await addDoc(collection(db, 'solidarity_cases'), {
        ...helpForm,
        status: 'pending_review',
        createdAt: serverTimestamp()
      });
      trackPillarEngagement('USC_SOLIDARITY', 'help_case_submitted', {
        help_type: helpForm.helpType,
        urgency: helpForm.urgency,
        city: helpForm.city
      });
      setHelpSuccess(true);
      setHelpForm({
        beneficiaryName: '',
        contact: '',
        city: '',
        helpType: 'food_clothing',
        urgency: 'high',
        story: ''
      });
    } catch (err) {
      console.error("Solidarity help error:", err);
    } finally {
      setIsSubmittingHelp(false);
    }
  };

  const handleVolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerForm.name || !volunteerForm.contact) return;

    setIsSubmittingVol(true);
    try {
      await addDoc(collection(db, 'solidarity_volunteers'), {
        ...volunteerForm,
        createdAt: serverTimestamp()
      });
      setVolSuccess(true);
      setVolunteerForm({
        name: '',
        contact: '',
        city: '',
        contributionType: 'material',
        availability: 'weekends',
        note: ''
      });
    } catch (err) {
      console.error("Solidarity volunteer error:", err);
    } finally {
      setIsSubmittingVol(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-red-600 selection:text-white pt-24 flex flex-col">
      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
        {/* Navigation & Status Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white uppercase font-black tracking-widest text-xs transition-colors">
            <ArrowLeft className="w-4 h-4" /> Späť na Centrálu
          </Link>
          <div className="flex items-center gap-2 bg-red-950 border border-red-600 text-red-400 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5 text-red-500" /> STREET SUPPORT // PILIER 6
          </div>
        </div>

        {/* Hero Section */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-block bg-red-600 text-white font-black uppercase tracking-widest text-xs px-4 py-2 mb-6 border-2 border-black">
                /// U.S.C. SOLIDARITY & STREET SUPPORT
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase leading-none">
                Kód ulice. <br/>
                <span className="text-zinc-500">Nezabúdame.</span>
              </h1>
              <p className="text-lg text-zinc-400 font-medium mb-8 leading-relaxed max-w-lg border-l-4 border-red-600 pl-4">
                Silnejší ťahá slabšieho. U.S.C. nevzniklo v korporátnej zasadačke, ale na ulici. Náš zisk nekončí len v systéme – vraciame ho späť do betónu, odkiaľ sme vzišli.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a 
                  href="#solidarity-action"
                  className="bg-white text-black font-black uppercase tracking-widest text-xs px-6 py-4 flex items-center gap-3 hover:bg-zinc-200 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
                >
                  Požiadať o Pomoc <ArrowRight className="w-4 h-4" />
                </a>

                <a 
                  href="#solidarity-action"
                  onClick={() => setActiveFormTab('volunteer')}
                  className="bg-zinc-900 text-white font-black uppercase tracking-widest text-xs px-6 py-4 flex items-center gap-3 hover:bg-red-600 transition-colors border-2 border-zinc-700"
                >
                  Chcem Pomôcť / Darovať
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/3] bg-zinc-900 border-4 border-black relative overflow-hidden shadow-[10px_10px_0px_0px_rgba(220,38,38,0.3)]">
                <img 
                  src={solidarityImg} 
                  alt="USC Solidarity" 
                  className="w-full h-full object-cover grayscale contrast-125 opacity-80 hover:opacity-100 hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-red-600/10 mix-blend-overlay pointer-events-none"></div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-red-600 text-white font-black text-2xl p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono">
                /// SOLIDARITY 369
              </div>
            </motion.div>
          </div>
        </section>

        {/* Live Impact Counters */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          <div className="bg-zinc-900 border-2 border-zinc-800 p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <HandCoins className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <div className="text-3xl md:text-4xl font-black text-white font-mono">€14 850+</div>
            <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
              Vygenerované z predaja U.S.W.
            </div>
          </div>

          <div className="bg-zinc-900 border-2 border-zinc-800 p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Truck className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <div className="text-3xl md:text-4xl font-black text-white font-mono">380+</div>
            <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
              Rozvezených balíkov (Rent a Wheel)
            </div>
          </div>

          <div className="bg-zinc-900 border-2 border-zinc-800 p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-3xl md:text-4xl font-black text-white font-mono">46</div>
            <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
              Podporených rodín & jednotlivcov
            </div>
          </div>

          <div className="bg-zinc-900 border-2 border-zinc-800 p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl md:text-4xl font-black text-white font-mono">28</div>
            <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
              Pracovných reštartov (U.S.C. Work)
            </div>
          </div>
        </section>

        {/* Mechanism / 3 Ways */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white mb-2">Ako to funguje v praxi</h2>
            <p className="text-zinc-400 font-bold tracking-widest uppercase text-xs">Žiadne reči. Iba činy a priame financovanie.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 border-4 border-black p-8 group hover:border-red-600 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]">
              <div className="w-14 h-14 bg-black border-2 border-red-600 flex items-center justify-center mb-6 text-red-500">
                <HandCoins className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black uppercase text-white mb-3">Drop pre blok</h3>
              <p className="text-zinc-400 text-xs uppercase font-bold leading-relaxed">
                Z každého predaného kusu oblečenia U.S.W. ide priamo určená čiastka do fondu Solidarity. Nekupuješ len mikinu, kupuješ jedlo a oblečenie pre tých, čo padli na dno.
              </p>
            </div>

            <div className="bg-zinc-900 border-4 border-black p-8 group hover:border-amber-500 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(245,158,11,1)]">
              <div className="w-14 h-14 bg-black border-2 border-amber-500 flex items-center justify-center mb-6 text-amber-500">
                <Car className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black uppercase text-white mb-3">Transport pomoci</h3>
              <p className="text-zinc-400 text-xs uppercase font-bold leading-relaxed">
                Naše vozidlá z divízie "Rent a wheel" nestoja, keď nemajú kšeft. Využívame ich na bezplatný rozvoz potravín, oblečenia alebo presťahovanie rodín v núdzi.
              </p>
            </div>

            <div className="bg-zinc-900 border-4 border-black p-8 group hover:border-white transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <div className="w-14 h-14 bg-black border-2 border-white flex items-center justify-center mb-6 text-white">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black uppercase text-white mb-3">Práca & Druhá Šanca</h3>
              <p className="text-zinc-400 text-xs uppercase font-bold leading-relaxed">
                Cez U.S.C. Work neberieme len čistých. Dávame šancu ľuďom po výkone trestu alebo z ulice reštartovať život. Pomáhame so živnosťou, byrokratickými vecami a hľadaním fleku.
              </p>
            </div>
          </div>
        </section>

        {/* INTERACTIVE ACTION CENTER (REQUEST HELP / VOLUNTEER) */}
        <section id="solidarity-action" className="max-w-4xl mx-auto mb-24 scroll-mt-24">
          <div className="bg-zinc-900 border-4 border-red-600 p-8 md:p-12 shadow-[10px_10px_0px_0px_rgba(220,38,38,0.3)]">
            <div className="flex flex-wrap gap-4 border-b-2 border-zinc-800 pb-6 mb-8">
              <button
                onClick={() => setActiveFormTab('requestHelp')}
                className={`px-6 py-3 font-black uppercase tracking-widest text-xs border-2 transition-all ${
                  activeFormTab === 'requestHelp'
                    ? 'bg-red-600 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Nahlásiť Núdzu / Žiadosť o Pomoc
              </button>

              <button
                onClick={() => setActiveFormTab('volunteer')}
                className={`px-6 py-3 font-black uppercase tracking-widest text-xs border-2 transition-all ${
                  activeFormTab === 'volunteer'
                    ? 'bg-white border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Zapojiť Sa / Ponúknuť Pomoc
              </button>
            </div>

            {/* FORM 1: REQUEST HELP */}
            {activeFormTab === 'requestHelp' && (
              <div>
                <h3 className="text-2xl md:text-3xl font-black uppercase text-white mb-2">
                  Formulár Žiadosti o Pomoc
                </h3>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-6">
                  Všetky informácie zostávajú prísne diskrétne. Ozveme sa priamo kontaktnej osobe.
                </p>

                {helpSuccess ? (
                  <div className="bg-black border-2 border-red-600 p-6 text-center">
                    <CheckCircle2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h4 className="text-2xl font-black uppercase text-white mb-2">Prípad bol Zaznamenaný</h4>
                    <p className="text-zinc-400 text-xs mb-6 max-w-md mx-auto">
                      Tím U.S.C. Solidarity preverí situáciu a do 24 hodín kontaktuje uvedenú osobu s návrhom konkrétnej materiálnej alebo logistickej pomoci.
                    </p>
                    <button
                      onClick={() => setHelpSuccess(false)}
                      className="px-6 py-3 bg-red-600 text-white font-black uppercase text-xs tracking-widest hover:bg-red-700"
                    >
                      Nahlásiť Ďalší Prípad
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleHelpSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Meno Žiadateľa / Rodiny</label>
                        <input
                          type="text"
                          value={helpForm.beneficiaryName}
                          onChange={(e) => setHelpForm({ ...helpForm, beneficiaryName: e.target.value })}
                          placeholder="Meno (alebo iniciály/anonym)"
                          className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Kontakt (Telefón / Email) *</label>
                        <input
                          type="text"
                          required
                          value={helpForm.contact}
                          onChange={(e) => setHelpForm({ ...helpForm, contact: e.target.value })}
                          placeholder="+421 9xx xxx xxx"
                          className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Mesto / Lokalita</label>
                        <input
                          type="text"
                          required
                          value={helpForm.city}
                          onChange={(e) => setHelpForm({ ...helpForm, city: e.target.value })}
                          placeholder="Napr. Bratislava, Košice, Prievidza..."
                          className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Forma Potrebnej Pomoci</label>
                        <select
                          value={helpForm.helpType}
                          onChange={(e) => setHelpForm({ ...helpForm, helpType: e.target.value })}
                          className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-red-500 uppercase"
                        >
                          <option value="food_clothing">Základné potraviny & Oblečenie</option>
                          <option value="transport_moving">Preprava, sťahovanie (Rent a Wheel)</option>
                          <option value="job_restart">Práca, živnosť & druhá šanca (U.S.C. Work)</option>
                          <option value="crisis_housing">Krízová asistencia</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Popis Situácie (Stručný príbeh) *</label>
                      <textarea
                        rows={4}
                        required
                        value={helpForm.story}
                        onChange={(e) => setHelpForm({ ...helpForm, story: e.target.value })}
                        placeholder="Opíš, v akej situácii sa rodina/človek nachádza a čo by mu najviac pomohlo..."
                        className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-red-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingHelp}
                      className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-2 border-black transition-colors disabled:opacity-50 mt-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmittingHelp ? 'Odosielam do systému...' : 'Odoslať Žiadosť o Pomoc'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* FORM 2: VOLUNTEER / DONOR */}
            {activeFormTab === 'volunteer' && (
              <div>
                <h3 className="text-2xl md:text-3xl font-black uppercase text-white mb-2">
                  Zapojiť Sa do Solidarity
                </h3>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-6">
                  Máš dodávku, vieš poskytnúť oblečenie, potraviny, prácu alebo materiálnu pomoc? Pridaj sa do siete.
                </p>

                {volSuccess ? (
                  <div className="bg-black border-2 border-white p-6 text-center">
                    <CheckCircle2 className="w-12 h-12 text-white mx-auto mb-4" />
                    <h4 className="text-2xl font-black uppercase text-white mb-2">Ďakujeme za Zapojenie!</h4>
                    <p className="text-zinc-400 text-xs mb-6 max-w-md mx-auto">
                      Evidujeme tvoje kontaktné údaje v databáze solidarity. Koordinátor ťa bude kontaktovať pri najbližšej výzve v tvojom regióne.
                    </p>
                    <button
                      onClick={() => setVolSuccess(false)}
                      className="px-6 py-3 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-zinc-200"
                    >
                      Zavrieť
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVolSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Tvoje Meno / Firma</label>
                        <input
                          type="text"
                          required
                          value={volunteerForm.name}
                          onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                          placeholder="Meno alebo subjekt"
                          className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Telefónne Číslo *</label>
                        <input
                          type="tel"
                          required
                          value={volunteerForm.contact}
                          onChange={(e) => setVolunteerForm({ ...volunteerForm, contact: e.target.value })}
                          placeholder="+421 9xx xxx xxx"
                          className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Tvoje Mesto / Región</label>
                        <input
                          type="text"
                          required
                          value={volunteerForm.city}
                          onChange={(e) => setVolunteerForm({ ...volunteerForm, city: e.target.value })}
                          placeholder="Bratislava a okolie..."
                          className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Ako vieš pomôcť?</label>
                        <select
                          value={volunteerForm.contributionType}
                          onChange={(e) => setVolunteerForm({ ...volunteerForm, contributionType: e.target.value })}
                          className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-white uppercase"
                        >
                          <option value="material">Materiálna pomoc (potraviny, drogéria, šatstvo)</option>
                          <option value="driver">Vodič / Transport s vlastným autom</option>
                          <option value="job_offer">Ponuka práce / pracovného miesta</option>
                          <option value="legal">Právna alebo účtovná pomoc</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Podrobnosti a možnosti</label>
                      <textarea
                        rows={3}
                        value={volunteerForm.note}
                        onChange={(e) => setVolunteerForm({ ...volunteerForm, note: e.target.value })}
                        placeholder="Napr. mám dodávku, môžem cez víkendy vyzdvihovať balíky..."
                        className="w-full bg-black border border-zinc-700 p-3 text-xs text-white outline-none focus:border-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingVol}
                      className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-2 border-black transition-colors disabled:opacity-50 mt-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmittingVol ? 'Registrujem...' : 'Potvrdiť Zapojenie do Solidarity'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
