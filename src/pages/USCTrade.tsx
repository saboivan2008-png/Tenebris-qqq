import { motion } from 'motion/react';
import { ArrowLeft, Globe, ArrowRightLeft, ShieldCheck, Truck, Send, Lock, Radio, Key, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SecretEnclaveTerminal from '../components/trade/SecretEnclaveTerminal';
import SecureTradeRoom from '../components/trade/SecureTradeRoom';

export default function USCTrade() {
  const [activeSecureTab, setActiveSecureTab] = useState<'trade_room' | 'enclave'>('trade_room');
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    request: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showEnclaveDirectly, setShowEnclaveDirectly] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.request) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'trade_inquiries'), {
        ...formData,
        status: 'new',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setFormData({ name: '', contact: '', request: '' });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-red-600 selection:text-white pt-24 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white uppercase font-black tracking-widest transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Späť na Centrálu
          </Link>

          <a 
            href="#secret-enclave"
            className="px-4 py-2 bg-red-950 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            Vstúpiť do Šifrovanej Zóny
          </a>
        </div>

        {/* Header */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block bg-red-600 text-white px-4 py-2 font-black uppercase tracking-widest text-sm mb-6 border-2 border-black">
              LOGISTIKA & BIZNIS // TRADE ZAKASAJEE
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
              Trade <br className="md:hidden" />
              <span className="text-red-600">Zakasajee</span>
            </h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-lg max-w-2xl mt-8">
              Export, import, biznis, logistika. Transport všetkého a všetkých. Zákazník povie, my vybavíme, dovezieme, predáme (aj zákazníka samému sebe).
            </p>
          </motion.div>
        </section>

        {/* Services Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900 border-4 border-zinc-800 p-8 hover:border-red-600 transition-colors group"
          >
            <Globe className="w-12 h-12 text-zinc-500 group-hover:text-red-600 mb-6 transition-colors" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Export & Import</h3>
            <p className="text-zinc-400 font-medium leading-relaxed">
              Nemáš kontakt? My áno. Zastrešujeme medzinárodný pohyb tovaru a komodít. Od menších zásielok až po kamiónové objemy. Bez zbytočných otázok, čisto a v termíne.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 border-4 border-zinc-800 p-8 hover:border-amber-500 transition-colors group"
          >
            <ArrowRightLeft className="w-12 h-12 text-zinc-500 group-hover:text-amber-500 mb-6 transition-colors" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Sprostredkovanie</h3>
            <p className="text-zinc-400 font-medium leading-relaxed">
              Máš produkt, hľadáš kupca? Alebo naopak? Spájame strany, uzatvárame dealy. Tvoja požiadavka je našou prioritou. Provízia z úspechu, žiadne plané sľuby.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 border-4 border-zinc-800 p-8 hover:border-zinc-100 transition-colors group"
          >
            <ShieldCheck className="w-12 h-12 text-zinc-500 group-hover:text-zinc-100 mb-6 transition-colors" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">VIP Diskrétnosť</h3>
            <p className="text-zinc-400 font-medium leading-relaxed">
              Ochrana informácií je základom biznisu. Všetky požiadavky, identity a transakcie zostávajú v uzatvorenom kruhu. Čo sa stane v Trade, zostáva v Trade.
            </p>
          </motion.div>
        </section>

        {/* SECRET ENCLAVE & SECURE TRADE ROOM */}
        <section id="secret-enclave" className="mb-28 scroll-mt-24">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-950 border border-red-600 text-red-400 px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest mb-3">
                <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
                NEVEREJNÁ KOMUNIKAČNÁ PLATFORMA & KRYPTOGRAFICKÁ KOMORA
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                Secure Trade Room // Zakasajee
              </h2>
              <p className="text-zinc-400 text-sm max-w-xl font-bold uppercase tracking-wide mt-2">
                End-to-End šifrovaná obchodná miestnosť s prísnym Access Control Listom (ACL), hodinovou rotáciou kľúčov a správou dôverných nákladových manifestov.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveSecureTab('trade_room')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all flex items-center gap-2 ${
                  activeSecureTab === 'trade_room'
                    ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                1. Secure Trade Room (ACL & E2EE)
              </button>

              <button
                type="button"
                onClick={() => setActiveSecureTab('enclave')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all flex items-center gap-2 ${
                  activeSecureTab === 'enclave'
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                2. Secret Enclave 369 Terminal
              </button>
            </div>
          </div>

          {activeSecureTab === 'trade_room' ? (
            <SecureTradeRoom />
          ) : (
            <SecretEnclaveTerminal />
          )}
        </section>

        {/* Standard Deal Form */}
        <section className="max-w-3xl mx-auto bg-zinc-900 border-4 border-zinc-800 p-8 md:p-12 relative overflow-hidden">
          <Truck className="absolute -bottom-10 -right-10 w-64 h-64 text-zinc-950 pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Verejný Dopyt o Deal</h2>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-10">
              Pre štandardné požiadavky na prepravu, sprostredkovanie alebo nákup tovaru.
            </p>

            {submitted ? (
              <div className="bg-green-600 text-white p-6 font-black uppercase tracking-widest text-center border-2 border-black">
                Požiadavka odoslaná. My sa ozveme.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="block text-zinc-500 font-black uppercase tracking-widest text-xs mb-2">
                    Meno / Subjekt
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black border-2 border-zinc-800 p-4 text-white font-bold uppercase focus:border-red-600 outline-none transition-colors"
                    placeholder="Ako ťa máme volať?"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-black uppercase tracking-widest text-xs mb-2">
                    Kontakt (Telefón / Šifrovaná linka / Email)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full bg-black border-2 border-zinc-800 p-4 text-white font-bold uppercase focus:border-red-600 outline-none transition-colors"
                    placeholder="Kam sa ozveme?"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-black uppercase tracking-widest text-xs mb-2">
                    Predmet Biznisu / Požiadavka
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.request}
                    onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                    className="w-full bg-black border-2 border-zinc-800 p-4 text-white font-bold resize-none focus:border-red-600 outline-none transition-colors"
                    placeholder="Stručne. Jasne. Čo chceš predať, kúpiť, alebo previezť?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-zinc-100 text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-colors mt-4 border-2 border-black disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? 'Odosielam...' : 'Odoslať Štandardný Dopyt'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
