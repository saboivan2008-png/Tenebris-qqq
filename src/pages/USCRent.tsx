import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Car, 
  Truck, 
  Clock, 
  MapPin, 
  Calendar, 
  Shield, 
  CheckCircle2, 
  Send, 
  X, 
  Phone,
  Fuel,
  Settings2,
  Navigation,
  Download,
  CreditCard,
  QrCode,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateOrderReceiptPdf } from '../lib/documentGenerator';
import { trackLogisticsCalc, trackPillarEngagement } from '../lib/analytics';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Default garage fleet if Firestore is initializing
const fallbackVehicles = [
  {
    id: 'car-1',
    name: 'Škoda Octavia Combi IV 2.0 TDI',
    type: 'Taxi / Bolt / Wolt Ready',
    category: 'taxi',
    priceDay: '€35 / deň',
    priceWeek: '€190 / týždeň',
    fuel: 'Diesel (4.2l/100km)',
    gear: 'Automat DSG',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'car-2',
    name: 'Toyota Corolla Touring Sports Hybrid',
    type: 'Bolt / Uber Gold Certifikát',
    category: 'taxi',
    priceDay: '€38 / deň',
    priceWeek: '€210 / týždeň',
    fuel: 'Hybrid (3.8l/100km)',
    gear: 'Automat e-CVT',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'van-1',
    name: 'VW Transporter T6.1 Long 2.0 TDI',
    type: 'Úžitková Dodávka / Sťahovanie',
    category: 'cargo',
    priceDay: '€65 / deň',
    priceWeek: '€350 / týždeň',
    fuel: 'Diesel',
    gear: 'Manuál 6-st.',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'van-2',
    name: 'Mercedes-Benz Sprinter Maxi 316',
    type: 'Veľkoobjemový Nákladný Transport',
    category: 'cargo',
    priceDay: '€85 / deň',
    priceWeek: '€450 / týždeň',
    fuel: 'Diesel',
    gear: 'Manuál',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1586191582056-a609d9426f8d?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'vip-1',
    name: 'BMW 330d xDrive M-Sport Touring',
    type: 'VIP / Reprezentatívny Odvoz',
    category: 'vip',
    priceDay: '€95 / deň',
    priceWeek: '€520 / týždeň',
    fuel: 'Diesel 195kW',
    gear: 'Automat 8-st.',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'moto-1',
    name: 'Honda PCX 125ccm City Cruiser',
    type: 'Mestský Kuriér / Wolt Express',
    category: 'courier',
    priceDay: '€20 / deň',
    priceWeek: '€90 / týždeň',
    fuel: 'Benzín (2.1l/100km)',
    gear: 'Automat',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000'
  }
];

export default function USCRent() {
  const [activeTab, setActiveTab] = useState<'garage' | 'courier'>('garage');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Vehicle Reservation Modal
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<'card' | 'crypto' | 'cash'>('card');
  const [reservationForm, setReservationForm] = useState({
    name: '',
    phone: '',
    email: '',
    startDate: '',
    durationDays: '7',
    purpose: 'bolt_wolt',
    note: ''
  });
  const [isSubmittingRes, setIsSubmittingRes] = useState(false);
  const [resSuccessId, setResSuccessId] = useState<string | null>(null);
  const [lastBookingData, setLastBookingData] = useState<any | null>(null);

  // On-Demand Courier Form
  const [courierForm, setCourierForm] = useState({
    name: '',
    phone: '',
    pickupAddress: '',
    deliveryAddress: '',
    packageType: 'standard',
    urgency: 'asap',
    instructions: ''
  });
  const [isSubmittingCourier, setIsSubmittingCourier] = useState(false);
  const [courierSuccess, setCourierSuccess] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'vehicles'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicles(data);
      setLoading(false);
    }, (error) => {
      console.warn("Vehicles fetch error fallback:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fleet = vehicles.length > 0 ? vehicles : fallbackVehicles;

  const handleVehicleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationForm.name || !reservationForm.phone || !selectedVehicle) return;

    setIsSubmittingRes(true);
    try {
      const depositAmount = '100 € (Vratná kaucia)';
      const bookingPayload = {
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        priceWeek: selectedVehicle.priceWeek || selectedVehicle.priceDay,
        depositPaymentMethod,
        depositAmount,
        ...reservationForm,
        status: depositPaymentMethod === 'card' ? 'deposit_secured' : 'pending',
        createdAt: serverTimestamp()
      };

      const resDoc = await addDoc(collection(db, 'rental_bookings'), bookingPayload);

      // Google Analytics 4: Track Rental Reservation & Pillar Activity
      trackLogisticsCalc('Bratislava Garáž', 'Vozidlo: ' + selectedVehicle.name, selectedVehicle.type);
      trackPillarEngagement('RENT_A_WHEEL', 'vehicle_reservation_created', {
        vehicle_id: selectedVehicle.id,
        vehicle_name: selectedVehicle.name,
        duration_days: reservationForm.durationDays,
        purpose: reservationForm.purpose,
        payment_method: depositPaymentMethod
      });

      setLastBookingData({
        id: resDoc.id,
        ...bookingPayload,
        vehicle: selectedVehicle
      });
      setResSuccessId(resDoc.id);

      // Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe ignore
      }

      setReservationForm({
        name: '',
        phone: '',
        email: '',
        startDate: '',
        durationDays: '7',
        purpose: 'bolt_wolt',
        note: ''
      });
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsSubmittingRes(false);
    }
  };

  const handleDownloadRentalVoucher = () => {
    if (!lastBookingData) return;
    generateOrderReceiptPdf({
      orderId: lastBookingData.id,
      customerName: lastBookingData.name,
      phone: lastBookingData.phone,
      email: lastBookingData.email,
      address: `Odber: Garáž U.S.C. Bratislava / Nástup: ${lastBookingData.startDate}`,
      items: [
        {
          name: `Nájom: ${lastBookingData.vehicleName} (${lastBookingData.durationDays} dní)`,
          size: lastBookingData.purpose,
          quantity: 1,
          price: lastBookingData.priceWeek
        },
        {
          name: `Rezervačná kaucia (${lastBookingData.depositPaymentMethod.toUpperCase()})`,
          size: 'KAUCIÁRNIK',
          quantity: 1,
          price: '100 €'
        }
      ],
      totalAmount: `${lastBookingData.priceWeek} + 100€ Kaucia`,
      paymentStatus: 'REZERVÁCIA ZABEZPEČENÁ'
    });
  };

  const handleCourierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierForm.name || !courierForm.phone || !courierForm.pickupAddress || !courierForm.deliveryAddress) return;

    setIsSubmittingCourier(true);
    try {
      const cDoc = await addDoc(collection(db, 'courier_requests'), {
        ...courierForm,
        status: 'dispatched',
        createdAt: serverTimestamp()
      });

      setCourierSuccess(cDoc.id);
      setCourierForm({
        name: '',
        phone: '',
        pickupAddress: '',
        deliveryAddress: '',
        packageType: 'standard',
        urgency: 'asap',
        instructions: ''
      });
    } catch (err) {
      console.error("Courier error:", err);
    } finally {
      setIsSubmittingCourier(false);
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans text-white pt-24 flex flex-col selection:bg-zinc-100 selection:text-black">
      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
        {/* Navigation & Status Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white uppercase font-black tracking-widest text-xs transition-colors">
            <ArrowLeft className="w-4 h-4" /> Späť na Centrálu
          </Link>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 text-zinc-300 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider">
            <Navigation className="w-3.5 h-3.5 text-zinc-100" /> GARÁŽ & DISPEČING U.S.C
          </div>
        </div>

        {/* Hero Banner */}
        <header className="pb-12 border-b border-zinc-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-2">
              GARAGE & COURIER LOGISTICS // PILIER 3
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              Rent A <span className="text-zinc-400">Wheel</span>
            </h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm max-w-2xl mt-4 leading-relaxed">
              Vozový park pre osobné aj pracovné účely (Bolt, Wolt, Taxi, Sťahovanie). 
              Kuriérska služba na zavolanie — vybavíme od taxíka až po expresné zásielky po celom regióne.
            </p>
          </motion.div>

          {/* Sub Navigation Tabs */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setActiveTab('garage')}
              className={`px-6 py-3 font-black uppercase tracking-widest text-xs border-2 transition-all flex items-center gap-2 ${
                activeTab === 'garage'
                  ? 'bg-white border-white text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4" /> Vozový Park ({fleet.length})
            </button>

            <button
              onClick={() => setActiveTab('courier')}
              className={`px-6 py-3 font-black uppercase tracking-widest text-xs border-2 transition-all flex items-center gap-2 ${
                activeTab === 'courier'
                  ? 'bg-zinc-100 border-white text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" /> Kuriér na Zavolanie (Expres)
            </button>
          </div>
        </header>

        {/* TAB 1: FLEET GRID */}
        {activeTab === 'garage' && (
          <section className="py-12">
            {loading ? (
              <div className="text-zinc-600 font-black uppercase text-sm tracking-widest animate-pulse py-20 text-center">
                Načítavam garáž...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {fleet.map((v, idx) => (
                  <motion.div
                    key={v.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="bg-zinc-950 border-4 border-zinc-800 p-6 flex flex-col justify-between group hover:border-zinc-100 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]"
                  >
                    <div>
                      {/* Vehicle Image */}
                      <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden mb-6 border-2 border-zinc-800">
                        <img 
                          src={v.image} 
                          alt={v.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2 bg-black/80 text-white font-mono text-[10px] px-2 py-1 font-bold uppercase border border-zinc-700">
                          {v.type}
                        </div>
                      </div>

                      <h3 className="text-2xl font-black uppercase text-white tracking-tight mb-2">
                        {v.name}
                      </h3>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400 py-3 border-y border-zinc-900 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Fuel className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{v.fuel || 'Diesel'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Settings2 className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{v.gear || 'Automat'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between mb-4">
                        <div className="text-xs text-zinc-500 font-bold uppercase">Nájomné:</div>
                        <div className="text-xl font-black text-white font-mono">{v.priceWeek || v.priceDay}</div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedVehicle(v);
                          setResSuccessId(null);
                        }}
                        className="w-full py-3.5 bg-white text-black font-black uppercase tracking-widest text-xs border-2 border-black hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Rezervovať Vozidlo
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: ON-DEMAND STREET COURIER */}
        {activeTab === 'courier' && (
          <section className="py-12 max-w-3xl mx-auto">
            <div className="bg-zinc-950 border-4 border-white p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-black">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase text-white tracking-tight">
                    Expresný Kuriér na Zavolanie
                  </h2>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                    Vybavíme rýchly prevoz tovaru, materiálu, balíkov aj špeciálnych zásielok v rámci SR a EÚ.
                  </p>
                </div>
              </div>

              {courierSuccess ? (
                <div className="bg-zinc-900 border-2 border-zinc-100 p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-2xl font-black uppercase text-white mb-2">
                    Kuriérska Požiadavka Prijatá!
                  </h3>
                  <p className="text-zinc-400 text-xs font-mono mb-4">
                    DISPATCH ID: <strong className="text-white">{courierSuccess.slice(0, 8).toUpperCase()}</strong>
                  </p>
                  <p className="text-zinc-300 text-sm mb-6">
                    Dispečing priradzuje najbližšie voľné vozidlo. Budeme ťa ihneď kontaktovať pre potvrdenie trasy a času naloženia.
                  </p>
                  <button
                    onClick={() => setCourierSuccess(null)}
                    className="px-6 py-3 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-zinc-200"
                  >
                    Odoslať Ďalšiu Zásielku
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCourierSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Meno / Objednávateľ</label>
                      <input
                        type="text"
                        required
                        value={courierForm.name}
                        onChange={(e) => setCourierForm({ ...courierForm, name: e.target.value })}
                        placeholder="Meno alebo firma"
                        className="w-full bg-zinc-900 border border-zinc-700 p-3 text-xs text-white outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Telefónne Číslo</label>
                      <input
                        type="tel"
                        required
                        value={courierForm.phone}
                        onChange={(e) => setCourierForm({ ...courierForm, phone: e.target.value })}
                        placeholder="+421 9xx xxx xxx"
                        className="w-full bg-zinc-900 border border-zinc-700 p-3 text-xs text-white outline-none focus:border-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Adresa Vyzdvihnutia (Odkiaľ)
                      </label>
                      <input
                        type="text"
                        required
                        value={courierForm.pickupAddress}
                        onChange={(e) => setCourierForm({ ...courierForm, pickupAddress: e.target.value })}
                        placeholder="Ulica, Mesto, PSČ"
                        className="w-full bg-zinc-900 border border-zinc-700 p-3 text-xs text-white outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-zinc-400" /> Adresa Doručenia (Kam)
                      </label>
                      <input
                        type="text"
                        required
                        value={courierForm.deliveryAddress}
                        onChange={(e) => setCourierForm({ ...courierForm, deliveryAddress: e.target.value })}
                        placeholder="Ulica, Mesto, PSČ"
                        className="w-full bg-zinc-900 border border-zinc-700 p-3 text-xs text-white outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Typ Zásielky / Nákladu</label>
                      <select
                        value={courierForm.packageType}
                        onChange={(e) => setCourierForm({ ...courierForm, packageType: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 p-3 text-xs text-white outline-none focus:border-white uppercase"
                      >
                        <option value="standard">Bežný Balík / Dokumenty (do 10 kg)</option>
                        <option value="heavy">Ťažký Náklad / Boxy (do 500 kg)</option>
                        <option value="pallet">Paletový Tovar / Dodávka</option>
                        <option value="special">Špeciálna / Neverejná preprava</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Urgencia Doručenia</label>
                      <select
                        value={courierForm.urgency}
                        onChange={(e) => setCourierForm({ ...courierForm, urgency: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 p-3 text-xs text-white outline-none focus:border-white uppercase"
                      >
                        <option value="asap">EXPRES (Hneď / do 90 minút)</option>
                        <option value="today">V priebehu dnešného dňa</option>
                        <option value="scheduled">Plánovaný termín na konkrétny čas</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Poznámka / Inštrukcie pre vodiča</label>
                    <textarea
                      rows={3}
                      value={courierForm.instructions}
                      onChange={(e) => setCourierForm({ ...courierForm, instructions: e.target.value })}
                      placeholder="Špecifikácia tovaru, kontaktná osoba na vykládke..."
                      className="w-full bg-zinc-900 border border-zinc-700 p-3 text-xs text-white outline-none focus:border-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingCourier}
                    className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-2 border-black transition-colors disabled:opacity-50 mt-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmittingCourier ? 'Zadávam na dispečing...' : 'Objednať Kuriéra / Rozvoz'}
                  </button>
                </form>
              )}
            </div>
          </section>
        )}
      </main>

      {/* VEHICLE RESERVATION MODAL */}
      <AnimatePresence>
        {selectedVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border-4 border-white max-w-xl w-full p-6 md:p-8 relative shadow-[12px_12px_0px_0px_rgba(255,255,255,0.3)] my-8"
            >
              <button
                onClick={() => setSelectedVehicle(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white p-2"
              >
                <X className="w-6 h-6" />
              </button>

              {resSuccessId ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                  <h3 className="text-3xl font-black uppercase text-white mb-2">
                    Rezervácia Prijatá!
                  </h3>
                  <p className="text-zinc-400 text-xs font-mono mb-4">
                    RESERVATION CODE: <strong className="text-amber-400">{resSuccessId.slice(0, 8).toUpperCase()}</strong>
                  </p>
                  <p className="text-zinc-300 text-xs max-w-md leading-relaxed mb-6">
                    Vozidlo <strong className="text-white">{selectedVehicle.name}</strong> je predbežne zarezervované v dispečingu. Môžeš si ihneď stiahnuť oficiálny rezervačný voucher / potvrdenie.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <button
                      onClick={handleDownloadRentalVoucher}
                      className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-xs border-2 border-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all"
                    >
                      <Download className="w-4 h-4" /> Stiahnuť Voucher (PDF)
                    </button>
                    <button
                      onClick={() => setSelectedVehicle(null)}
                      className="flex-1 py-3.5 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs border-2 border-zinc-700 hover:bg-zinc-800 transition-all"
                    >
                      Späť do Garáže
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-zinc-500 font-mono text-xs uppercase font-bold">REZERVÁCIA VOZIDLA // FLOTILA</span>
                    <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                      {selectedVehicle.name}
                    </h2>
                    <div className="text-sm font-mono text-zinc-300 mt-1">
                      Sadzba: <strong className="text-white">{selectedVehicle.priceWeek || selectedVehicle.priceDay}</strong> | Kaucia: <strong className="text-amber-400">100 €</strong>
                    </div>
                  </div>

                  <form onSubmit={handleVehicleReservation} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Meno a Priezvisko</label>
                        <input
                          type="text"
                          required
                          value={reservationForm.name}
                          onChange={(e) => setReservationForm({ ...reservationForm, name: e.target.value })}
                          placeholder="Ján Novák"
                          className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Telefón (Mobil)</label>
                        <input
                          type="tel"
                          required
                          value={reservationForm.phone}
                          onChange={(e) => setReservationForm({ ...reservationForm, phone: e.target.value })}
                          placeholder="+421 9xx xxx xxx"
                          className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Dátum Nástupu</label>
                        <input
                          type="date"
                          required
                          value={reservationForm.startDate}
                          onChange={(e) => setReservationForm({ ...reservationForm, startDate: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Dĺžka Nájmu</label>
                        <select
                          value={reservationForm.durationDays}
                          onChange={(e) => setReservationForm({ ...reservationForm, durationDays: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-white uppercase"
                        >
                          <option value="1">1 Deň</option>
                          <option value="3">3 Dni</option>
                          <option value="7">1 Týždeň (Zvýhodnené)</option>
                          <option value="14">2 Týždne</option>
                          <option value="30">1 Mesiac (Dlhodobo)</option>
                        </select>
                      </div>
                    </div>

                    {/* Deposit payment method */}
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                        Zabezpečenie Kaucie (100 €)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setDepositPaymentMethod('card')}
                          className={`p-2 border-2 text-left flex items-center gap-2 transition-all ${
                            depositPaymentMethod === 'card'
                              ? 'bg-white border-white text-black font-black'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <div>
                            <div className="text-[11px] uppercase">Karta / Záloha</div>
                            <div className="text-[9px] opacity-70">Okamžité blokovanie</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDepositPaymentMethod('crypto')}
                          className={`p-2 border-2 text-left flex items-center gap-2 transition-all ${
                            depositPaymentMethod === 'crypto'
                              ? 'bg-white border-white text-black font-black'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <QrCode className="w-4 h-4" />
                          <div>
                            <div className="text-[11px] uppercase">Krypto (USDT)</div>
                            <div className="text-[9px] opacity-70">Escrow peňaženka</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDepositPaymentMethod('cash')}
                          className={`p-2 border-2 text-left flex items-center gap-2 transition-all ${
                            depositPaymentMethod === 'cash'
                              ? 'bg-white border-white text-black font-black'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <DollarSign className="w-4 h-4" />
                          <div>
                            <div className="text-[11px] uppercase">V Hotovosti</div>
                            <div className="text-[9px] opacity-70">Pri prevzatí kľúčov</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Účel Nájmu</label>
                      <select
                        value={reservationForm.purpose}
                        onChange={(e) => setReservationForm({ ...reservationForm, purpose: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-white uppercase"
                      >
                        <option value="bolt_wolt">Práca: Bolt / Wolt / Taxi Fleet</option>
                        <option value="personal">Osobné účely / Výlet</option>
                        <option value="commercial">Firemná preprava / Sťahovanie</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Poznámka / Špeciálne požiadavky</label>
                      <input
                        type="text"
                        value={reservationForm.note}
                        onChange={(e) => setReservationForm({ ...reservationForm, note: e.target.value })}
                        placeholder="Napr. potrebujem detskú sedačku, poistenie..."
                        className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingRes}
                      className="w-full mt-2 py-4 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-2 border-black disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                    >
                      <Calendar className="w-4 h-4" />
                      {isSubmittingRes ? 'Overujem a odosielam...' : 'Potvrdiť Záväznú Rezerváciu'}
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
