import { motion } from 'motion/react';
import { Flame, Wrench, Phone, Mail, MapPin, Zap, ShieldAlert, Skull, ArrowUpRight, Crosshair, Users, Shield, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { services } from '../data';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StreetAmbientPlayer from '../components/StreetAmbientPlayer';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      <Navbar />

      {/* Street Caution Tape Top Bar */}
      <div className="fixed top-0 left-0 w-full overflow-hidden caution-stripes text-black py-1.5 z-40 border-b-2 border-black">
        <div className="animate-marquee whitespace-nowrap flex gap-6 text-xs font-black uppercase tracking-widest bg-amber-500/90 text-black px-2 py-0.5">
          <span>/// STREET RULES /// NO EXCUSES /// UNDERGROUND STREET COLLECTIVE /// GARÁŽ 369 /// HUSTLE HARD ///</span>
          <span>/// 100% RAW BUSINESS /// BRAŤ VŠETKO /// BRATISLAVA TO WORLDWIDE /// REÁLNY HUSTLE ///</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-28 pb-16 px-6">
        
        {/* Background Street Watermarks & Spray Tags */}
        <div className="absolute left-6 top-36 opacity-15 pointer-events-none select-none hidden lg:block font-mono text-8xl font-black text-amber-500 -rotate-12">
          #JEBE TI
        </div>
        <div className="absolute right-12 top-40 opacity-10 pointer-events-none select-none hidden lg:block text-9xl font-black text-red-600 rotate-6">
          369
        </div>
        <div className="absolute left-1/4 bottom-16 opacity-10 pointer-events-none select-none text-8xl font-black text-zinc-700">
          U.S.C.
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8"
          >
            {/* Street Stickers & Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="inline-block bg-red-600 text-white px-4 py-1.5 font-black uppercase tracking-widest text-xs sm:text-sm -rotate-2 border-2 border-black street-shadow">
                ⚠️ Parental Advisory: Raw Business
              </div>
              <div className="inline-flex items-center gap-1.5 bg-black border-2 border-amber-500 text-amber-400 px-3 py-1 font-mono text-xs font-black uppercase tracking-widest rotate-1">
                <Skull className="w-3.5 h-3.5 text-amber-500" /> GARÁŽOVÝ KÓD 369
              </div>
              <div className="inline-flex items-center gap-1.5 bg-zinc-900 border-2 border-zinc-700 text-emerald-400 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest">
                <Crosshair className="w-3.5 h-3.5" /> 6 PILIEROV ONLINE
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white leading-[0.82] relative">
              <span className="block mb-2 text-zinc-100 hover:text-amber-400 transition-colors">Underground</span>
              <span className="block text-amber-500 spray-tag">Street</span>
              <span className="block text-zinc-400 tracking-tight">Collective</span>
            </h1>
            
            {/* Concrete Raw Tagline Box */}
            <div className="mt-8 max-w-2xl bg-black/80 border-l-8 border-amber-500 border-y-2 border-r-2 border-zinc-800 p-6 street-shadow">
              <p className="text-xl md:text-2xl text-zinc-200 font-black uppercase tracking-wide leading-tight">
                Garáž. Ulica. Hip-Hop. Hustle.
                <br />
                <span className="text-amber-400 font-mono text-lg">Pravidlá sa menia tu dolu. Od ulice po cloud.</span>
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs font-mono text-zinc-400 uppercase font-bold">
                <span>● Bratislava</span>
                <span>● Mníchov</span>
                <span>● Viedeň</span>
                <span>● Worldwide</span>
              </div>
            </div>
            
            {/* Street CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-10">
              <a 
                href="#services" 
                className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest transition-all border-4 border-black street-shadow-white hover:translate-x-1 hover:-translate-y-1 flex items-center justify-center gap-3 text-base"
              >
                <Wrench className="w-5 h-5" />
                <span>Otvoriť Garáž (6 Pilierov)</span>
              </a>

              <Link 
                to="/auru-trinity" 
                className="px-8 py-4 bg-black hover:bg-zinc-900 text-emerald-400 font-mono font-black uppercase tracking-widest transition-all border-4 border-emerald-500 street-shadow flex items-center justify-center gap-3 text-sm"
              >
                <Zap className="w-5 h-5 text-emerald-400" />
                <span>A.I. Auru_trinity ➔</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Street Marquee Divider 1 */}
      <div className="w-full overflow-hidden bg-amber-500 text-black py-3 border-y-4 border-black">
        <div className="animate-marquee whitespace-nowrap flex gap-8 text-xl md:text-2xl font-black uppercase tracking-widest items-center">
          <span>/// STREET HUSTLE</span>
          <Flame className="w-6 h-6" />
          <span>GARAGE RULES</span>
          <Flame className="w-6 h-6" />
          <span>NO EXCUSES</span>
          <Flame className="w-6 h-6" />
          <span>PODVEDOMIE 369</span>
          <Flame className="w-6 h-6" />
          <span>STREET HUSTLE</span>
          <Flame className="w-6 h-6" />
          <span>GARAGE RULES</span>
          <Flame className="w-6 h-6" />
          <span>NO EXCUSES ///</span>
        </div>
      </div>

      {/* Services Section */}
      <section id="services" className="py-28 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-zinc-800 pb-8">
            <div>
              <div className="inline-block bg-zinc-900 border border-zinc-700 text-amber-400 px-3 py-1 font-mono text-xs font-black uppercase mb-3">
                // MAPA IMPÉRIA
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-2">
                6 Pilierov Impéria
              </h2>
              <div className="w-32 h-3 bg-red-600 mb-4"></div>
              <p className="text-zinc-400 text-lg md:text-xl max-w-2xl font-bold uppercase tracking-wide">
                Surová sila ulice a precízne doručenie. Každý pilier rieši konkrétny biznis a reálnu komunitu.
              </p>
            </div>

            <div className="bg-black border-2 border-zinc-800 p-4 font-mono text-xs text-zinc-400 hidden md:block">
              <div className="text-amber-400 font-bold mb-1">DISPEČING STATUS:</div>
              <div className="text-emerald-400 font-black">● 100% OPERATIONAL</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Link to={service.path} key={service.id} className="block group">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={`p-8 h-full bg-zinc-900/90 border-4 border-black transition-all duration-200 hover:-translate-y-2 hover:translate-x-2 street-shadow flex flex-col justify-between group-hover:border-amber-500`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 bg-black border-2 ${service.accent} street-shadow`}>
                        {service.icon}
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-black text-zinc-700 group-hover:text-amber-500 transition-colors font-mono">
                          0{index + 1}
                        </span>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase font-bold">PILIER</div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-1 uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                      {service.title}
                    </h3>
                    {service.subtitle && (
                      <p className="text-xs text-amber-500 mb-4 font-mono font-bold uppercase tracking-widest">
                        {service.subtitle}
                      </p>
                    )}
                    
                    <p className="text-zinc-400 text-sm md:text-base font-medium leading-relaxed mb-6">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-between font-mono font-black uppercase tracking-widest text-amber-400 text-xs group-hover:text-white">
                    <span>Vstúpiť do modulu</span>
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Street Quote & Philosophy Section */}
      <section id="about" className="py-24 px-6 bg-amber-500 text-black border-y-8 border-black relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full caution-stripes opacity-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <div className="inline-block bg-black text-white px-3 py-1 font-mono text-xs font-black uppercase mb-4 border border-black">
              STREET PHILOSOPHY & MANIFEST
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
              Od Garáže<br/><span className="text-black bg-white px-2">Po Cloud</span>
            </h2>
            <div className="space-y-4 text-base md:text-lg font-bold tracking-wide">
              <p>
                Začínali sme v garážach a na uliciach. Sme formovaní remeslom, montážami v Nemecku a Rakúsku a snahou budovať niečo skutočné. Žiadne obkľuky ani zbytočná byrokracia.
              </p>
              <p>
                Underground Street Collective spája šesť autonómnych pilierov – od ťažkých priemyselných montáží, cez vlastnú flotilu dodávok a heavyweight streetwear, až po neurálnu automatizáciu a vzájomný fond solidarity.
              </p>
              <div className="bg-black text-white p-6 mt-6 border-4 border-white street-shadow transform -rotate-1">
                <p className="font-black text-lg md:text-xl uppercase italic tracking-tight text-amber-400">
                  "Surová sila remesla, reálne zákazky a moderné technológie."
                </p>
                <div className="text-right text-xs font-mono text-zinc-400 mt-2">— U.S.C. GARÁŽOVÉ PRAVIDLO #1</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            <div className="bg-black p-6 border-4 border-black street-shadow-white flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <Wrench className="w-8 h-8 text-amber-400" />
                <span className="text-xs text-zinc-500 font-bold">01 // BIZNIS</span>
              </div>
              <h4 className="text-white font-black text-lg uppercase tracking-tight mb-1">Montáže & Fleet</h4>
              <p className="text-zinc-400 text-xs font-sans">Nemecké a rakúske turnusy § 13b UStG a úžitková flotila L3H2.</p>
            </div>

            <div className="bg-red-600 p-6 border-4 border-black street-shadow-white flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <Skull className="w-8 h-8 text-white" />
                <span className="text-xs text-zinc-900 font-bold">02 // BRAND</span>
              </div>
              <h4 className="text-white font-black text-lg uppercase tracking-tight mb-1">U.S.W. Streetwear</h4>
              <p className="text-zinc-100 text-xs font-sans">Heavyweight 450g mikiny, pracovno-pouličná uniforma komunity.</p>
            </div>

            <div className="bg-zinc-900 p-6 border-4 border-black street-shadow-white flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 text-emerald-400" />
                <span className="text-xs text-zinc-500 font-bold">03 // AI CORE</span>
              </div>
              <h4 className="text-white font-black text-lg uppercase tracking-tight mb-1">Auru Trinity</h4>
              <p className="text-zinc-400 text-xs font-sans">Automatizovaný dispečing, mzdové matrice a B2B integrácie.</p>
            </div>

            <div className="bg-zinc-100 p-6 border-4 border-black street-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-black" />
                <span className="text-xs text-zinc-600 font-bold">04 // FOND</span>
              </div>
              <h4 className="text-black font-black text-lg uppercase tracking-tight mb-1">Solidarita</h4>
              <p className="text-zinc-700 text-xs font-sans">Transparentný komunitný fond a ochrana ľudí v teréne.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Street Contacts & HQ Section */}
      <section id="contact" className="py-28 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <div className="inline-block bg-zinc-900 border border-zinc-700 text-amber-400 px-3 py-1 font-mono text-xs font-black uppercase mb-3">
              // CENTRÁLNY DISPEČING
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-2">
              Kontakt & HQ
            </h2>
            <div className="w-24 h-3 bg-amber-500 mx-auto mb-4"></div>
            <p className="text-zinc-400 text-lg font-bold uppercase tracking-wide font-mono">
              Underground street collective s.r.o.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Phone */}
            <div className="bg-zinc-900 border-4 border-black p-8 flex flex-col items-center text-center street-shadow hover:border-amber-500 transition-colors">
              <div className="w-16 h-16 bg-black border-2 border-amber-500 flex items-center justify-center mb-6">
                <Phone className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="text-zinc-500 font-mono font-black uppercase tracking-widest text-xs mb-2">HOTLINE DISPEČING</h4>
              <p className="text-white text-2xl font-black font-mono">+421 949 521 777</p>
            </div>
            
            {/* Email */}
            <div className="bg-zinc-900 border-4 border-black p-8 flex flex-col items-center text-center street-shadow hover:border-red-600 transition-colors">
              <div className="w-16 h-16 bg-black border-2 border-red-600 flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-zinc-500 font-mono font-black uppercase tracking-widest text-xs mb-2">OFFICIAL E-MAIL</h4>
              <p className="text-white text-lg font-black font-mono break-all">Uscolective@gmail.com</p>
            </div>

            {/* Location */}
            <div className="bg-zinc-900 border-4 border-black p-8 flex flex-col items-center text-center street-shadow hover:border-zinc-100 transition-colors">
              <div className="w-16 h-16 bg-black border-2 border-zinc-100 flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-zinc-100" />
              </div>
              <h4 className="text-zinc-500 font-mono font-black uppercase tracking-widest text-xs mb-2">LOKÁCIA & KÓD</h4>
              <p className="text-white text-xl font-black uppercase">Bratislava<br/><span className="text-amber-400 font-mono text-sm">& Celý svet</span></p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Street Underground Ambient Audio Engine */}
      <StreetAmbientPlayer />
    </div>
  );
}

