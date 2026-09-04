import { FormEvent, useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setNewsletterStatus('submitting');
    setTimeout(() => {
      setNewsletterStatus('success');
      setEmail('');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <>
      {/* Newsletter Section */}
      <section className="py-24 px-6 border-t-8 border-black bg-amber-500">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black border-4 border-black p-8 md:p-12 relative shadow-[12px_12px_0px_0px_rgba(220,38,38,1)] group hover:shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
            <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-sm px-4 py-2 border-b-4 border-l-4 border-black">
              // JOIN THE SYNDICATE
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 mt-4">
              Street <span className="text-red-600">Updates</span>
            </h2>
            <p className="text-zinc-400 font-bold uppercase tracking-widest mb-8 text-lg">
              Žiadny spam. Len čistý hustle a biznis priamo do tvojho inboxu.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="TVOJ E-MAIL"
                required
                disabled={newsletterStatus !== 'idle'}
                className="flex-1 bg-zinc-950 border-4 border-zinc-800 p-4 text-white font-black uppercase placeholder:text-zinc-600 focus:outline-none focus:border-red-600 disabled:opacity-50 transition-colors text-xl"
              />
              <button
                type="submit"
                disabled={newsletterStatus !== 'idle'}
                className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest transition-all border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] min-w-[200px] text-xl"
              >
                {newsletterStatus === 'submitting' ? 'Odosielam...' : newsletterStatus === 'success' ? 'V systéme' : 'Odoberať'}
              </button>
            </form>
            {newsletterStatus === 'success' && (
              <div className="mt-6 p-4 bg-zinc-900 border-l-8 border-green-500 text-green-500 font-black uppercase tracking-widest text-sm inline-block shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]">
                Vitaj v podzemí. Spojenie nadviazané.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t-8 border-black bg-zinc-950 text-center font-black uppercase tracking-widest relative group">
        <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-mono text-zinc-400 mb-6">
          <a href="/#services" className="hover:text-amber-400 transition-colors">6 Pilierov</a>
          <a href="/ritual-369" className="text-amber-500 hover:text-amber-300 transition-colors">🔥 369 Rituál</a>
          <a href="/auru-trinity" className="text-emerald-400 hover:text-emerald-300 transition-colors">Auru Trinity AI</a>
          <a href="/usw" className="hover:text-red-500 transition-colors">U.S.W Shop</a>
          <a href="/rent-a-wheel" className="hover:text-white transition-colors">Rent a Wheel</a>
          <a href="/usc-work" className="hover:text-amber-400 transition-colors">U.S.C. Work</a>
        </div>

        <p className="text-zinc-400 mb-2">© {new Date().getFullYear()} U.S.C S.R.O. // STREET CERTIFIED.</p>
        <p className="text-zinc-600 text-xs">Garaged in Bratislava // 369 Mindset.</p>
        
        {/* Secret Login Trigger */}
        <a 
          href="/login" 
          className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-transparent hover:bg-zinc-800 transition-colors"
          title="U.S.C Control"
        />
      </footer>
    </>
  );
}
