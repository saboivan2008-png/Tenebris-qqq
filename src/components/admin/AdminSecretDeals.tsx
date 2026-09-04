import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Key, 
  Eye, 
  EyeOff, 
  Terminal, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  Unlock,
  Send,
  Radio
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  addDoc, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { 
  getCurrentHourEpoch, 
  decryptSecretMessage, 
  encryptSecretMessage 
} from '../../lib/trade-crypto';

export default function AdminSecretDeals() {
  const [adminPassphrase, setAdminPassphrase] = useState('369-ZAKASAJEE');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [enclaveMessages, setEnclaveMessages] = useState<any[]>([]);
  const [publicInquiries, setPublicInquiries] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'enclave' | 'inquiries'>('enclave');
  
  // Quick reply state
  const [replyText, setReplyText] = useState('');
  const [replyChannel, setReplyChannel] = useState('DEAL-ROOM-369');
  const [isSending, setIsSending] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const epochInfo = getCurrentHourEpoch();

  // Load public trade inquiries
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const q = query(collection(db, 'trade_inquiries'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setPublicInquiries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching trade inquiries:", err);
      }
    };
    fetchInquiries();
  }, []);

  // Real-time listener for enclave messages
  useEffect(() => {
    if (!isUnlocked) return;

    const q = query(collection(db, 'trade_secret_enclave'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snap) => {
      const raw = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const decrypted = await Promise.all(
        raw.map(async (msg: any) => {
          try {
            if (!msg.payload?.ciphertext) return msg;
            const plain = await decryptSecretMessage(msg.payload, adminPassphrase);
            return { ...msg, decryptedText: plain, decryptionError: false };
          } catch (err) {
            return { ...msg, decryptionError: true };
          }
        })
      );

      setEnclaveMessages(decrypted);
    });

    return () => unsubscribe();
  }, [isUnlocked, adminPassphrase]);

  const handleDeleteEnclaveMessage = async (id: string) => {
    if (!window.confirm("Naozaj natrvalo zmazať túto šifrovanú správu?")) return;
    try {
      await deleteDoc(doc(db, 'trade_secret_enclave', id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm("Naozaj zmazať túto požiadavku?")) return;
    try {
      await deleteDoc(doc(db, 'trade_inquiries', id));
      setPublicInquiries(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !adminPassphrase.trim()) return;

    setIsSending(true);
    try {
      const payload = await encryptSecretMessage(replyText.trim(), adminPassphrase);

      await addDoc(collection(db, 'trade_secret_enclave'), {
        channel: replyChannel.trim().toUpperCase(),
        senderAlias: 'U.S.C HIGH COMMAND [ADMIN]',
        classification: 'OMEGA_369',
        payload,
        createdAt: serverTimestamp()
      });

      setReplyText('');
      setStatusNotice('Odpoveď bola zašifrovaná a odoslaná do kanála.');
      setTimeout(() => setStatusNotice(null), 3000);
    } catch (err: any) {
      setStatusNotice(`Chyba: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-black uppercase text-white mb-2 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-600" />
          Trade Zakasajee // Secret Hub
        </h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
          Správa neverejných zákaziek, VIP šifrovaných kanálov a B2B dopytov.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-4 border-b-2 border-zinc-800 pb-4">
        <button
          onClick={() => setActiveSubTab('enclave')}
          className={`px-6 py-3 font-black uppercase tracking-widest text-xs border-2 transition-all ${
            activeSubTab === 'enclave'
              ? 'bg-red-600 border-black text-white'
              : 'border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Шifrovaný Enclave ({enclaveMessages.length})
        </button>

        <button
          onClick={() => setActiveSubTab('inquiries')}
          className={`px-6 py-3 font-black uppercase tracking-widest text-xs border-2 transition-all ${
            activeSubTab === 'inquiries'
              ? 'bg-amber-500 border-black text-black'
              : 'border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Formulárové Požiadavky ({publicInquiries.length})
        </button>
      </div>

      {activeSubTab === 'enclave' && (
        <div className="flex flex-col gap-6">
          {/* Admin Clearance Decryptor Box */}
          <div className="bg-zinc-900 border-4 border-black p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-red-500" />
                Admin Master Dešifrovací Kľúč
              </h2>
              <span className="text-zinc-500 text-xs font-mono">
                AKTUÁLNA EPOCHA: <strong className="text-red-400">{epochInfo.epochId}</strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                value={adminPassphrase}
                onChange={(e) => setAdminPassphrase(e.target.value)}
                placeholder="Zadaj kľúč pre dešifrovanie..."
                className="flex-1 bg-zinc-950 border-2 border-zinc-700 p-3 text-white font-mono uppercase focus:border-red-600 outline-none"
              />
              <button
                onClick={() => setIsUnlocked(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs border-2 border-black flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                {isUnlocked ? 'Kľúč Aplikovaný' : 'Dešifrovať Reláciu'}
              </button>
            </div>
          </div>

          {/* Quick Admin Encrypted Response Form */}
          {isUnlocked && (
            <form onSubmit={handleSendAdminReply} className="bg-zinc-900 border-4 border-red-800 p-6 flex flex-col gap-4">
              <h3 className="text-lg font-black uppercase text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-red-500" />
                Odoslať Šifrovanú Odpoveď / Inštrukciu do Kanála
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-500 text-xs font-bold uppercase mb-1">Cieľový Kanál</label>
                  <input
                    type="text"
                    value={replyChannel}
                    onChange={(e) => setReplyChannel(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 p-3 text-white font-mono uppercase text-xs outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-xs font-bold uppercase mb-1">Správa (Text)</label>
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Napíš tajnú odpoveď pre klienta..."
                    className="w-full bg-zinc-950 border border-zinc-700 p-3 text-white font-sans text-xs outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {statusNotice && (
                <div className="text-xs text-green-400 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{statusNotice}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="self-end px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest flex items-center gap-2 border-2 border-black"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Odosielam...' : 'Zašifrovať a Odoslať Klientovi'}
              </button>
            </form>
          )}

          {/* Messages Table */}
          <div className="bg-zinc-900 border-4 border-black overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-4 border-black bg-black text-zinc-400 font-black uppercase text-xs">
                  <th className="p-4">Kanál</th>
                  <th className="p-4">Odosielateľ</th>
                  <th className="p-4">Klasifikácia</th>
                  <th className="p-4">Dešifrovaný Obsah</th>
                  <th className="p-4">Čas & Epocha</th>
                  <th className="p-4 text-right">Akcia</th>
                </tr>
              </thead>
              <tbody>
                {enclaveMessages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 font-bold uppercase">
                      {!isUnlocked ? 'Pre zobrazenie klikni na "Dešifrovať Reláciu"' : 'Žiadne správy v Enclave'}
                    </td>
                  </tr>
                ) : (
                  enclaveMessages.map((msg) => (
                    <tr key={msg.id} className="border-b border-zinc-800 hover:bg-zinc-800/40 text-xs">
                      <td className="p-4 font-mono font-bold text-red-400">{msg.channel}</td>
                      <td className="p-4 font-bold text-white uppercase">{msg.senderAlias}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-black border border-zinc-700 text-[10px] font-bold text-amber-400">
                          {msg.classification}
                        </span>
                      </td>
                      <td className="p-4 max-w-md">
                        {msg.decryptionError ? (
                          <span className="text-red-500 font-mono text-[11px] flex items-center gap-1">
                            <EyeOff className="w-3.5 h-3.5" />
                            [ZAŠIFROVANÉ / INÝ KĽÚČ]
                          </span>
                        ) : (
                          <p className="text-zinc-200 font-sans">{msg.decryptedText}</p>
                        )}
                      </td>
                      <td className="p-4 text-zinc-500 font-mono text-[10px]">
                        {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString() : 'Teraz'}
                        <div className="text-zinc-600">{msg.payload?.epochId}</div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteEnclaveMessage(msg.id)}
                          className="text-zinc-600 hover:text-red-500 p-1"
                          title="Zmazať"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'inquiries' && (
        <div className="bg-zinc-900 border-4 border-black overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-black bg-black text-zinc-400 font-black uppercase text-xs">
                <th className="p-4">Meno / Subjekt</th>
                <th className="p-4">Kontakt</th>
                <th className="p-4">Požiadavka</th>
                <th className="p-4">Čas prijatia</th>
                <th className="p-4 text-right">Akcia</th>
              </tr>
            </thead>
            <tbody>
              {publicInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 font-bold uppercase">
                    Zatiaľ žiadne formulárové požiadavky
                  </td>
                </tr>
              ) : (
                publicInquiries.map((inq) => (
                  <tr key={inq.id} className="border-b border-zinc-800 hover:bg-zinc-800/40 text-xs">
                    <td className="p-4 font-bold text-white uppercase">{inq.name}</td>
                    <td className="p-4 font-mono text-amber-400">{inq.contact}</td>
                    <td className="p-4 text-zinc-300 font-sans max-w-md">{inq.request}</td>
                    <td className="p-4 text-zinc-500">
                      {inq.createdAt?.toDate ? inq.createdAt.toDate().toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        className="text-zinc-600 hover:text-red-500 p-1"
                        title="Zmazať"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
