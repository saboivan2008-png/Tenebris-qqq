import { motion } from 'motion/react';
import { Instagram, Share2, Mail, ArrowRight } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/images/logo_graffiti_red_recreate_1787059992037.jpg';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function PromoDrop() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    setErrorMessage('');
    
    try {
      await addDoc(collection(db, 'earlyAccess'), {
        email: email,
        source: 'promo_drop',
        createdAt: serverTimestamp()
      });
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage('Nastala chyba. Skús to znova.');
      try {
        handleFirestoreError(error, OperationType.CREATE, 'earlyAccess');
      } catch (err) {
        // Handled silently for the user, logged to console by helper
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'U.S.C // UNDERGROUND STREET COLLECTIVE',
          text: 'Garážové dvere sa čoskoro otvárajú. Pridaj sa do podzemia.',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Odkaz skopírovaný do schránky!');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center relative overflow-hidden font-sans selection:bg-red-600 selection:text-white p-6">
      
      {/* Background Texture & Grain */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      {/* Caution Tape Marquee (Top & Bottom) */}
      <div className="absolute top-0 left-0 w-full overflow-hidden bg-amber-500 text-black py-2 z-40 transform -rotate-2 scale-110 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="animate-marquee whitespace-nowrap flex gap-4 text-sm font-black uppercase tracking-widest">
          <span>/// CAUTION /// DROPPING SOON /// U.S.C /// CAUTION /// DROPPING SOON /// U.S.C ///</span>
          <span>/// CAUTION /// DROPPING SOON /// U.S.C /// CAUTION /// DROPPING SOON /// U.S.C ///</span>
        </div>
      </div>
      <div className="absolute bottom-10 left-0 w-full overflow-hidden bg-red-600 text-white py-2 z-40 transform rotate-2 scale-110 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="animate-marquee-reverse whitespace-nowrap flex gap-4 text-sm font-black uppercase tracking-widest">
          <span>/// STREET SYNDICATE /// NO EXCUSES /// GARAGE RULES /// STREET SYNDICATE ///</span>
          <span>/// STREET SYNDICATE /// NO EXCUSES /// GARAGE RULES /// STREET SYNDICATE ///</span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl bg-black border-[12px] border-zinc-900 p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(220,38,38,1)] flex flex-col items-center text-center"
      >
        {/* Brutalist Logo */}
        <motion.div 
          animate={{ rotate: [0, -2, 2, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="mb-8"
        >
          <img 
            src={logoImg} 
            alt="USC Logo" 
            className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-full border-4 border-red-600 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]"
          />
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-4">
          <span className="text-red-600 block mb-2">Čoskoro</span>
          Otvárame
        </h1>
        
        <p className="text-zinc-400 font-bold uppercase tracking-widest mb-8 text-lg md:text-xl max-w-md">
          Podzemie sa prebúdza. U.S.C. impérium je vo výstavbe. Buď pri tom, keď otvoríme garážové dvere.
        </p>

        {/* Action Form */}
        <div className="w-full max-w-md mb-8">
          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border-4 border-green-500 p-4 text-green-500 font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(34,197,94,1)]"
            >
              Vstupenka do podzemia zaistená. Ozveme sa.
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-6 h-6" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ZADAJ E-MAIL PRE EARLY ACCESS"
                  required
                  disabled={status === 'submitting'}
                  className="w-full bg-zinc-950 border-4 border-zinc-800 py-4 pl-14 pr-4 text-white font-black uppercase tracking-widest placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
              
              {status === 'error' && (
                <div className="text-red-500 text-sm font-bold uppercase tracking-widest text-left">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest transition-all border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50"
              >
                {status === 'submitting' ? 'ZAPISUJEM...' : 'CHCEM VEDIEŤ PRVÝ'}
              </button>
            </form>
          )}
        </div>

        {/* Socials & Share */}
        <div className="flex gap-4 w-full justify-center">
          <button 
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-amber-500 hover:text-black text-white py-3 border-4 border-black font-black uppercase tracking-widest transition-colors"
          >
            <Share2 className="w-5 h-5" /> Zdieľať
          </button>
          <a 
            href="https://instagram.com" target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-amber-500 hover:text-black text-white py-3 border-4 border-black font-black uppercase tracking-widest transition-colors"
          >
            <Instagram className="w-5 h-5" /> Sleduj Nás
          </a>
        </div>
      </motion.div>

      {/* Secret Dev Bypass */}
      <Link to="/" className="absolute bottom-2 text-zinc-800 text-xs font-black uppercase hover:text-zinc-600 transition-colors z-50">
        [ DEV BYPASS: VSTÚPIŤ DO CENTRÁLY ]
      </Link>
    </div>
  );
}
