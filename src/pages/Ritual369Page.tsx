import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Ritual369 from '../components/Ritual369';
import Matrix369Visualizer from '../components/Matrix369Visualizer';
import { motion } from 'motion/react';
import { Flame, Sparkles, Shield, Compass, ArrowLeft, Zap, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Ritual369Page() {
  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex items-center justify-between"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 hover:text-amber-400 uppercase transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Späť na Centrálu</span>
          </Link>

          <div className="flex items-center gap-2 font-mono text-xs text-amber-500 bg-black border border-zinc-800 px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>RITUÁLNY CYKLUS AKTÍVNY</span>
          </div>
        </motion.div>

        {/* Page Hero Header with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center max-w-3xl mx-auto"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-block bg-red-600 text-white px-4 py-1.5 font-mono text-xs font-black uppercase tracking-widest -rotate-1 border-2 border-black street-shadow mb-4"
          >
            🔥 MINDSET // METÓDA 3-6-9
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white leading-tight">
            Podvedomie <span className="text-amber-500 spray-tag">369</span> Ritual
          </h1>
          <p className="text-zinc-400 text-base md:text-lg font-bold uppercase tracking-wide mt-3">
            Surový garážový rituál manifestácie pre tvoje montáže, brand a každodenný street hustle.
          </p>
        </motion.div>

        {/* Dedicated Framer Motion Matrix 369 Visualizer Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Matrix369Visualizer />
        </motion.div>

        {/* The 369 Ritual Component with Goals & Daily Reps */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <Ritual369 />
        </motion.div>

        {/* Street Philosophy Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-zinc-900 border-4 border-black p-6 street-shadow hover:border-amber-500 transition-colors"
          >
            <div className="text-4xl font-black text-amber-500 font-mono mb-2">3</div>
            <h3 className="text-xl font-black text-white uppercase mb-2">Myseľ a Zámer</h3>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Čo nie je v hlave, nebude v peňaženke ani na ulici. 3x ráno definuj presný smer bez pochybností.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-zinc-900 border-4 border-black p-6 street-shadow hover:border-red-600 transition-colors"
          >
            <div className="text-4xl font-black text-red-600 font-mono mb-2">6</div>
            <h3 className="text-xl font-black text-white uppercase mb-2">Hustle a Pot</h3>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Zámer bez akcie je len fantázia. 6x cez deň potvrdzuj tvrdú prácu, montáže a nekompromisný ťah na bránu.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-zinc-900 border-4 border-black p-6 street-shadow hover:border-emerald-500 transition-colors"
          >
            <div className="text-4xl font-black text-emerald-400 font-mono mb-2">9</div>
            <h3 className="text-xl font-black text-white uppercase mb-2">Impérium a Výsledok</h3>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              9x večer zapečať pocit víťazstva. Zákazky sú uzavreté, partia je zabezpečená a sloboda je tvoja.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
