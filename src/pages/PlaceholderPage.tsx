import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, Construction } from 'lucide-react';
import { useEffect } from 'react';

export default function PlaceholderPage() {
  const location = useLocation();
  const pathName = location.pathname.replace('/', '').replace(/-/g, ' ').toUpperCase();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans pt-24">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white uppercase font-black tracking-widest mb-12 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Späť na Centrálu
        </Link>

        <div className="border-4 border-amber-500 p-12 bg-zinc-900 shadow-[12px_12px_0px_0px_rgba(245,158,11,1)]">
          <Construction className="w-24 h-24 text-amber-500 mx-auto mb-8 animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
            DIVÍZIA<br/>
            <span className="text-amber-500">{pathName || 'VO VÝSTAVBE'}</span>
          </h1>
          <p className="text-zinc-400 text-xl font-bold uppercase tracking-widest mb-8">
            Na tomto pilieri práve makáme. Garážové dvere sú zatiaľ zatvorené.
          </p>
          <div className="inline-block bg-black text-white px-6 py-3 font-black uppercase tracking-widest text-sm border-2 border-zinc-700">
            STAY TUNED // UNDERGROUND STREET COLLECTIVE
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
