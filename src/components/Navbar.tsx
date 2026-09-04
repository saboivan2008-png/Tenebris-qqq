import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import logoImg from '../assets/images/logo_graffiti_red_recreate_1787059992037.jpg';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-zinc-950/95 backdrop-blur-sm border-b-4 border-amber-500 py-3' : 'bg-zinc-950/80 py-6'}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.img 
            whileHover={{ scale: 1.1, filter: 'contrast(120%) hue-rotate(15deg)' }}
            src={logoImg} 
            alt="U.S.C Logo" 
            className="w-12 h-12 object-cover rounded-full border-2 border-red-600 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] transition-shadow" 
          />
          <motion.span 
            className="font-black tracking-tighter text-white text-2xl uppercase group-hover:text-red-600 transition-colors"
          >
            U.S.C
          </motion.span>
        </Link>
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.1 }
            }
          }}
          className="hidden lg:flex items-center gap-6 text-xs font-black uppercase tracking-widest text-zinc-300 font-mono"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}>
            <Link to="/" className="hover:text-amber-400 transition-colors">
              HQ Centrála
            </Link>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}>
            <Link to="/auru-trinity" className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>🤖 Trinity Super AI</span>
            </Link>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}>
            <Link to="/usw" className="text-red-500 hover:text-red-400 transition-colors">
              👑 U.S.W Shop
            </Link>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}>
            <Link to="/rent-a-wheel" className="hover:text-white transition-colors">
              🚗 Rent a Wheel
            </Link>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}>
            <Link to="/usc-work" className="text-amber-400 hover:text-amber-300 transition-colors">
              🔨 U.S.C. Work
            </Link>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}>
            <Link to="/usc-solidarity" className="hover:text-white transition-colors">
              🤝 Solidarita
            </Link>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}>
            <Link to="/trade" className="text-zinc-400 hover:text-red-400 transition-colors">
              🛡️ Trade
            </Link>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}>
            <Link to="/admin" className="px-3 py-1 bg-amber-500 text-black font-black uppercase text-[10px] border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:bg-amber-400 transition-all">
              ADMIN
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
