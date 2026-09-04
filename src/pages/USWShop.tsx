import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  X, 
  Check, 
  Truck, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  CheckCircle2,
  Lock,
  CreditCard,
  QrCode,
  Download,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { uswProducts } from '../data';
import { generateOrderReceiptPdf } from '../lib/documentGenerator';
import { trackShopAction, trackPillarEngagement } from '../lib/analytics';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function USWShop() {
  const [activeCategory, setActiveCategory] = useState('mikiny');
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Order Modal
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedSize, setSelectedSize] = useState('L');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'cod'>('card');
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    note: ''
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<any | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'products'), where('status', '!=', 'hidden'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbProducts(data);
      setLoading(false);
    }, (error) => {
      console.warn("Firestore products fetch fallback:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Combine DB products with static uswProducts
  const allProducts = dbProducts.length > 0 ? dbProducts : uswProducts.map(p => ({
    ...p,
    category: p.cat,
    status: 'available'
  }));

  const displayProducts = allProducts.filter(p => (p.category || p.cat) === activeCategory);
  const categories = ['mikiny', 'tepláky', 'tričká', 'tenisky', 'bundy', 'pomôcky'];

  const handleOpenProduct = (product: any) => {
    if (product.status === 'sold_out') return;
    setSelectedProduct(product);
    setSelectedSize(product.category === 'tenisky' ? '43 EU' : 'L');
    setQuantity(1);
    setOrderComplete(null);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.customerName || !orderForm.phone || !selectedProduct) return;

    setIsSubmittingOrder(true);
    try {
      const priceNum = parseFloat(selectedProduct.price.replace('€', '').trim()) || 0;
      const totalAmount = priceNum * quantity;
      const paymentMethodNames: Record<string, string> = {
        card: 'Platba Kartou / Apple Pay (Okamžitá)',
        crypto: 'Kryptomena (USDT / BTC)',
        cod: 'Dobierka (Hotovosť / Kuriér)'
      };

      const orderPayload = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productPrice: selectedProduct.price,
        size: selectedSize,
        quantity,
        totalAmount: `€${totalAmount}`,
        paymentMethod,
        paymentMethodName: paymentMethodNames[paymentMethod],
        customerName: orderForm.customerName,
        phone: orderForm.phone,
        email: orderForm.email || '',
        address: `${orderForm.address}, ${orderForm.city}`,
        note: orderForm.note || '',
        status: paymentMethod === 'card' ? 'paid_online' : 'pending',
        createdAt: serverTimestamp()
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderPayload);

      // Google Analytics 4: Track U.S.W Purchase & Pillar engagement
      trackShopAction('purchase', {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: totalAmount,
        category: activeCategory
      });
      trackPillarEngagement('USW_STREETWEAR', 'order_placed', {
        payment_method: paymentMethod,
        total_amount: totalAmount,
        quantity
      });

      setLastCompletedOrder({
        id: orderRef.id,
        ...orderPayload,
        product: selectedProduct
      });
      setOrderComplete(orderRef.id);

      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe ignore
      }

      setOrderForm({
        customerName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        note: ''
      });
    } catch (err) {
      console.error("Order error:", err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!lastCompletedOrder) return;
    generateOrderReceiptPdf({
      orderId: lastCompletedOrder.id,
      customerName: lastCompletedOrder.customerName,
      phone: lastCompletedOrder.phone,
      email: lastCompletedOrder.email,
      address: lastCompletedOrder.address,
      items: [
        {
          name: lastCompletedOrder.productName,
          size: lastCompletedOrder.size,
          quantity: lastCompletedOrder.quantity,
          price: lastCompletedOrder.totalAmount
        }
      ],
      totalAmount: lastCompletedOrder.totalAmount,
      paymentStatus: lastCompletedOrder.paymentMethodName || 'Záväzná objednávka'
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white pt-24 flex flex-col selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Header */}
      <header className="pt-8 pb-12 px-6 max-w-7xl w-full mx-auto border-b border-zinc-800">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white uppercase font-black tracking-widest text-xs transition-colors">
            <ArrowLeft className="w-4 h-4" /> Späť na Centrálu
          </Link>
          <div className="flex items-center gap-2 bg-red-950 border border-red-600 text-red-400 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-red-500" /> DROP 2026 // CHOICE IS YOURS
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div>
            <div className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-2">
              UNDERGROUND-STREET-WEAR // PILIER 2
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              U.S.W. <span className="text-red-600">Store</span>
            </h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm max-w-xl mt-3">
              Hip hop, hustle, street, hooligans. Žiadna masovka, čistá ulica a surový dizajn pre tých, čo vedia.
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 md:justify-end">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-2 transition-all ${
                  activeCategory === cat 
                    ? 'bg-red-600 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>
      </header>

      {/* Solidary Bar Reminder */}
      <div className="bg-red-950/40 border-b border-red-900/50 py-2.5 px-6 text-center text-xs font-mono text-zinc-400">
        <span className="text-red-400 font-bold">SOLIDARITY IMPACT:</span> Časť z každého nákupu oblečenia U.S.W. ide priamo do fondu pomoci pre ľudí a rodiny v núdzi.
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl w-full mx-auto px-6 py-16 flex-1">
        {loading ? (
          <div className="text-zinc-600 font-black uppercase text-sm tracking-widest animate-pulse py-20 text-center">
            Načítavam kolekciu...
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map((product, index) => {
              const isSoldOut = product.status === 'sold_out';

              return (
                <motion.div
                  key={product.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleOpenProduct(product)}
                  className={`group flex flex-col bg-zinc-900 border-4 border-black p-4 transition-all duration-300 hover:border-red-600 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] ${
                    isSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] bg-black overflow-hidden mb-4 border-2 border-zinc-800">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ${isSoldOut ? 'grayscale' : 'group-hover:scale-105'}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800 font-black text-4xl">
                        U.S.W
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    {isSoldOut && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                        <span className="bg-red-600 text-white px-3 py-1 font-black text-xs uppercase tracking-[0.3em] border border-black">
                          Sold Out
                        </span>
                      </div>
                    )}

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white p-2 border border-zinc-700">
                      <ShoppingBag className="w-4 h-4 text-red-500" />
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="flex justify-between items-start mt-auto">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-white group-hover:text-red-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px]">
                        {product.color}
                      </p>
                    </div>
                    <div className="text-lg font-black tracking-tighter text-white">
                      {product.price}
                    </div>
                  </div>

                  <button className="w-full mt-4 py-2.5 bg-black hover:bg-red-600 text-zinc-300 hover:text-white font-black uppercase text-xs tracking-widest border border-zinc-700 transition-colors flex items-center justify-center gap-2">
                    <span>{isSoldOut ? 'Vypredané' : 'Rýchla Objednávka'}</span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-zinc-600 font-black uppercase text-sm tracking-widest py-20 text-center">
            V tejto kategórii zatiaľ nič nie je.
          </div>
        )}
      </main>

      {/* QUICK ORDER MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border-4 border-red-600 max-w-2xl w-full p-6 md:p-8 relative shadow-[12px_12px_0px_0px_rgba(220,38,38,0.4)] my-8"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white p-2"
              >
                <X className="w-6 h-6" />
              </button>

              {orderComplete ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-600 text-white rounded-none border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
                    Objednávka Zaznamenaná!
                  </h3>
                  <p className="text-zinc-400 text-sm font-mono mb-4">
                    KÓD OBJEDNÁVKY: <strong className="text-red-400">{orderComplete.slice(0, 8).toUpperCase()}</strong>
                  </p>
                  <p className="text-zinc-400 text-xs max-w-md leading-relaxed mb-6">
                    Tvoju objednávku sme bezpečne uložili. Doklad o nákupe si môžeš ihneď stiahnuť vo formáte PDF.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <button
                      onClick={handleDownloadReceipt}
                      className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-xs border-2 border-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all"
                    >
                      <Download className="w-4 h-4" /> Stiahnuť PDF Doklad
                    </button>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="flex-1 py-3.5 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs border-2 border-zinc-700 hover:bg-zinc-800 transition-all"
                    >
                      Pokračovať v Nákupe
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Product Header */}
                  <div className="flex gap-4 items-center border-b border-zinc-800 pb-4">
                    {selectedProduct.image && (
                      <img 
                        src={selectedProduct.image} 
                        alt={selectedProduct.name} 
                        className="w-20 h-24 object-cover border-2 border-zinc-700 bg-black"
                      />
                    )}
                    <div>
                      <div className="text-red-500 font-mono text-[10px] uppercase font-bold tracking-widest">
                        U.S.W ORIGINAL DROP
                      </div>
                      <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                        {selectedProduct.name}
                      </h2>
                      <div className="text-xl font-black text-white mt-1">
                        {selectedProduct.price} <span className="text-xs text-zinc-500 font-normal">({selectedProduct.color})</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleOrderSubmit} className="flex flex-col gap-4">
                    {/* Size Selector */}
                    {selectedProduct.category !== 'pomôcky' && (
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                          Vyber Veľkosť
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(selectedProduct.category === 'tenisky'
                            ? ['40 EU', '41 EU', '42 EU', '43 EU', '44 EU', '45 EU']
                            : ['S', 'M', 'L', 'XL', 'XXL']
                          ).map(size => (
                            <button
                              type="button"
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`px-4 py-2 font-mono text-xs font-black border-2 transition-colors ${
                                selectedSize === size
                                  ? 'bg-red-600 border-black text-white'
                                  : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-600'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment Method Selector */}
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                        Spôsob Platby
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`p-2.5 border-2 text-left flex items-center gap-2 transition-all ${
                            paymentMethod === 'card'
                              ? 'bg-red-600 border-black text-white'
                              : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <CreditCard className="w-4 h-4 text-amber-400" />
                          <div>
                            <div className="text-[11px] font-black uppercase">Karta / Apple Pay</div>
                            <div className="text-[9px] opacity-70">Okamžitá platba</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('crypto')}
                          className={`p-2.5 border-2 text-left flex items-center gap-2 transition-all ${
                            paymentMethod === 'crypto'
                              ? 'bg-red-600 border-black text-white'
                              : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <QrCode className="w-4 h-4 text-emerald-400" />
                          <div>
                            <div className="text-[11px] font-black uppercase">Krypto (USDT)</div>
                            <div className="text-[9px] opacity-70">Decentralizované</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-2.5 border-2 text-left flex items-center gap-2 transition-all ${
                            paymentMethod === 'cod'
                              ? 'bg-red-600 border-black text-white'
                              : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <Truck className="w-4 h-4 text-blue-400" />
                          <div>
                            <div className="text-[11px] font-black uppercase">Dobierka</div>
                            <div className="text-[9px] opacity-70">Platba pri prevzatí</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Customer Info Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Meno a Priezvisko</label>
                        <input
                          type="text"
                          required
                          value={orderForm.customerName}
                          onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                          placeholder="Ján Novák"
                          className="w-full bg-black border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Telefón (pre kuriéra)</label>
                        <input
                          type="tel"
                          required
                          value={orderForm.phone}
                          onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                          placeholder="+421 9xx xxx xxx"
                          className="w-full bg-black border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Ulica a číslo / Zásielkovňa</label>
                        <input
                          type="text"
                          required
                          value={orderForm.address}
                          onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                          placeholder="Hlavná 12 alebo Kód Boxu"
                          className="w-full bg-black border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Mesto a PSČ</label>
                        <input
                          type="text"
                          required
                          value={orderForm.city}
                          onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                          placeholder="Bratislava 811 01"
                          className="w-full bg-black border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Poznámka k doručeniu</label>
                      <input
                        type="text"
                        value={orderForm.note}
                        onChange={(e) => setOrderForm({ ...orderForm, note: e.target.value })}
                        placeholder="Napr. volať pred doručením..."
                        className="w-full bg-black border border-zinc-700 p-2.5 text-xs text-white outline-none focus:border-red-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="w-full mt-2 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 border-2 border-black disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Truck className="w-4 h-4" />
                      {isSubmittingOrder ? 'Zapisujem objednávku...' : `Záväzne Objednať (${selectedProduct.price})`}
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
