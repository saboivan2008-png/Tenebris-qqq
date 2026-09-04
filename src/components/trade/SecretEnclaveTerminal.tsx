import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Terminal, 
  Send, 
  Clock, 
  RefreshCw, 
  EyeOff, 
  Key, 
  Radio, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Copy, 
  Check
} from 'lucide-react';
import { 
  getCurrentHourEpoch, 
  encryptSecretMessage, 
  decryptSecretMessage, 
  type EncryptedPayload 
} from '../../lib/trade-crypto';
import { db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

interface EnclaveMessage {
  id: string;
  channel: string;
  senderAlias: string;
  classification: 'CONFIDENTIAL' | 'TOP_SECRET' | 'OMEGA_369';
  payload: EncryptedPayload;
  decryptedText?: string;
  decryptionError?: boolean;
  createdAt?: any;
}

export default function SecretEnclaveTerminal() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [channel, setChannel] = useState('DEAL-ROOM-369');
  const [senderAlias, setSenderAlias] = useState('OPERATOR-X');
  const [classification, setClassification] = useState<'CONFIDENTIAL' | 'TOP_SECRET' | 'OMEGA_369'>('TOP_SECRET');
  
  // Dynamic epoch & rotation clock
  const [epochInfo, setEpochInfo] = useState(getCurrentHourEpoch());
  const [timeRemainingStr, setTimeRemainingStr] = useState('');

  // Live messages
  const [messages, setMessages] = useState<EnclaveMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Hourly countdown timer
  useEffect(() => {
    const updateClock = () => {
      const info = getCurrentHourEpoch();
      setEpochInfo(info);
      const mins = Math.floor(info.secondsRemaining / 60);
      const secs = info.secondsRemaining % 60;
      setTimeRemainingStr(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Unlock terminal handler
  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passphrase.trim()) {
      setStatusNotice('Zadaj autorizačný kľúč / heslo.');
      return;
    }
    setIsUnlocked(true);
    setStatusNotice(null);
  };

  // Subscribe to channel messages in Firestore
  useEffect(() => {
    if (!isUnlocked || !channel.trim()) return;

    const q = query(
      collection(db, 'trade_secret_enclave'),
      where('channel', '==', channel.trim().toUpperCase()),
      orderBy('createdAt', 'desc'),
      limit(25)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rawMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EnclaveMessage[];

      // Decrypt messages locally in browser using current user passphrase
      const processed = await Promise.all(
        rawMessages.map(async (msg) => {
          try {
            if (!msg.payload?.ciphertext) return msg;
            const decrypted = await decryptSecretMessage(msg.payload, passphrase);
            return { ...msg, decryptedText: decrypted, decryptionError: false };
          } catch (err) {
            return { ...msg, decryptionError: true, decryptedText: undefined };
          }
        })
      );

      setMessages(processed.reverse());
    }, (error) => {
      console.warn("Firestore secret enclave stream notice:", error);
    });

    return () => unsubscribe();
  }, [isUnlocked, channel, passphrase]);

  // Send encrypted message / special order
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !passphrase.trim()) return;

    setIsSending(true);
    try {
      // Encrypt with Web Crypto AES-256-GCM + Hourly Epoch Salt
      const payload = await encryptSecretMessage(newMessageText.trim(), passphrase);

      await addDoc(collection(db, 'trade_secret_enclave'), {
        channel: channel.trim().toUpperCase(),
        senderAlias: senderAlias.trim() || 'ANONYMOUS',
        classification,
        payload,
        createdAt: serverTimestamp()
      });

      setNewMessageText('');
      setStatusNotice('Správa bola zašifrovaná a odoslaná do Enclave.');
      setTimeout(() => setStatusNotice(null), 3000);
    } catch (err: any) {
      console.error('Encryption error:', err);
      setStatusNotice(`Chyba šifrovania: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Emergency Panic button
  const handleEmergencyPurge = () => {
    setIsUnlocked(false);
    setPassphrase('');
    setMessages([]);
    setNewMessageText('');
    setStatusNotice('RELÁCIA BOLA OKAMŽITE VYMAZANÁ Z PAMÄTE (LOCAL PURGE).');
  };

  const copyEpochKey = () => {
    navigator.clipboard.writeText(`${channel} | PASS: ${passphrase} | ${epochInfo.epochId}`);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="w-full bg-zinc-950 border-4 border-red-700 shadow-[8px_8px_0px_0px_rgba(220,38,38,0.3)] my-16 overflow-hidden font-mono">
      {/* Top Protocol Status Bar */}
      <div className="bg-red-950/80 border-b-2 border-red-700 p-4 px-6 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>
          <div className="flex flex-col">
            <span className="font-black text-red-400 tracking-wider">
              PROTOCOL // CIPHER-369 VIP ENCLAVE
            </span>
            <span className="text-zinc-400 text-[10px]">
              MILITARY-GRADE AES-256-GCM / 1-HOUR ROLLING EPOCH
            </span>
          </div>
        </div>

        {/* Hourly Rotation Countdown */}
        <div className="flex items-center gap-4">
          <div className="bg-black/80 border border-red-800 px-3 py-1.5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-500 animate-pulse" />
            <div>
              <span className="text-zinc-500 text-[10px] uppercase block leading-none">Rotácia kľúča o</span>
              <span className="text-red-400 font-black text-sm tracking-widest leading-tight">{timeRemainingStr}</span>
            </div>
          </div>

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-zinc-500 text-[10px]">EPOCH SIGNATURE</span>
            <span className="text-zinc-300 font-bold text-[11px]">{epochInfo.epochId} ({epochInfo.epochHash})</span>
          </div>
        </div>
      </div>

      {/* Main Terminal Body */}
      {!isUnlocked ? (
        /* LOCKED STATE */
        <div className="p-8 md:p-12 text-center max-w-xl mx-auto flex flex-col items-center">
          <div className="w-20 h-20 bg-red-950/60 border-2 border-red-600 flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(220,38,38,0.4)]">
            <Lock className="w-10 h-10 text-red-500 animate-pulse" />
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Špeciálna Šifrovaná Zóna
          </h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Vyhradené pre VIP zákazníkov, privátnych partnerov a neverejné zákazky.
            Komunikácia je šifrovaná kľúčom, ktorý rotuje každú hodinu. Žiadne logy v čitateľnom texte.
          </p>

          <form onSubmit={handleUnlock} className="w-full flex flex-col gap-4 text-left">
            <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>Vstupné Bezpečnostné Heslo / Kľúč</span>
                <span className="text-red-500 text-[10px]">VIP CLEARANCE REQUIRED</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Zadaj privátny kľúč (napr. 369-ZAKASAJEE)..."
                  className="w-full bg-black border-2 border-zinc-700 p-4 text-white font-mono focus:border-red-600 focus:outline-none transition-colors pr-12"
                />
                <Key className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                Kód Kanála / Číslo Zákazky
              </label>
              <input
                type="text"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="Napr. DEAL-ROOM-369"
                className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono uppercase focus:border-red-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] text-zinc-500 my-1">
              <span>Rýchly prístup pre hostí:</span>
              <button
                type="button"
                onClick={() => setPassphrase('369-ZAKASAJEE')}
                className="text-red-400 hover:text-white underline"
              >
                [369-ZAKASAJEE]
              </button>
              <button
                type="button"
                onClick={() => setPassphrase('VIP-DEAL-369')}
                className="text-amber-400 hover:text-white underline"
              >
                [VIP-DEAL-369]
              </button>
            </div>

            {statusNotice && (
              <div className="bg-red-950/80 border border-red-600 text-red-300 p-3 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{statusNotice}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest transition-all border-2 border-black flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:-translate-y-0.5"
            >
              <Unlock className="w-5 h-5" />
              Overiť Kľúč a Vstúpiť
            </button>
          </form>
        </div>
      ) : (
        /* UNLOCKED TERMINAL STATE */
        <div className="p-4 md:p-8 flex flex-col gap-6">
          {/* Header Controls & Channel Info */}
          <div className="bg-black border-2 border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-900/40 border border-red-600 flex items-center justify-center text-red-500">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-black uppercase tracking-wider">{channel}</span>
                  <span className="bg-red-600 text-black font-black text-[10px] px-1.5 py-0.5 uppercase">
                    ACTIVE ENCLAVE
                  </span>
                </div>
                <span className="text-zinc-500 text-xs">
                  Relácia: <strong className="text-zinc-300">{senderAlias}</strong> | Šifra: <strong className="text-green-400">AKTÍVNA</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={copyEpochKey}
                className="px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-red-500 text-xs flex items-center gap-2 transition-colors"
                title="Kopírovať údaje o kanáli"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Skopírované!' : 'Zdieľať Kľúč'}</span>
              </button>

              <button
                onClick={handleEmergencyPurge}
                className="px-4 py-2 bg-red-900/60 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <Flame className="w-4 h-4" />
                Panic Purge
              </button>
            </div>
          </div>

          {/* Cryptographic Notification banner */}
          <div className="bg-zinc-900/90 border-l-4 border-red-600 p-3 text-xs text-zinc-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>
                Správy sú zašifrované na tvojom zariadení (Client-Side). Databáza vidí iba nezlomiteľný AES-256 binárny kód.
              </span>
            </div>
            <span className="text-zinc-500 font-mono text-[10px] hidden md:block">
              SALT: USC-369-{epochInfo.epochId}
            </span>
          </div>

          {/* Live Encrypted Messages Log */}
          <div className="bg-black border-2 border-zinc-800 p-4 h-80 overflow-y-auto flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center text-xs">
                <Radio className="w-8 h-8 text-zinc-700 mb-2 animate-pulse" />
                <span>ŽIADNE ZÁZNAMY V TOMTO KANÁLI.</span>
                <span className="text-[10px] text-zinc-700 mt-1">
                  Všetky nové požiadavky budú zašifrované a doručené vedeniu U.S.C.
                </span>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`border-l-4 p-3 bg-zinc-950 text-xs flex flex-col gap-1 ${
                    msg.decryptionError 
                      ? 'border-zinc-700 opacity-60' 
                      : msg.classification === 'OMEGA_369'
                        ? 'border-purple-600 bg-purple-950/20'
                        : msg.classification === 'TOP_SECRET'
                          ? 'border-red-600 bg-red-950/20'
                          : 'border-amber-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pb-1 border-b border-zinc-900">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-zinc-300 uppercase">{msg.senderAlias}</span>
                      <span className={`px-1 font-bold ${
                        msg.classification === 'OMEGA_369' ? 'text-purple-400 bg-purple-950' :
                        msg.classification === 'TOP_SECRET' ? 'text-red-400 bg-red-950' : 'text-amber-400 bg-amber-950'
                      }`}>
                        {msg.classification}
                      </span>
                      <span className="text-zinc-600 font-mono">[{msg.payload?.fingerprint || 'HASH'}]</span>
                    </div>
                    <span>{msg.payload?.epochId}</span>
                  </div>

                  {msg.decryptionError ? (
                    <div className="text-red-500/80 font-mono text-[11px] py-1 flex items-center gap-2">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>[ZAŠIFROVANÉ / INÝ BEZPEČNOSTNÝ KĽÚČ ALEBO VYPRŠANÁ ŠIFRA]</span>
                    </div>
                  ) : (
                    <p className="text-zinc-200 text-sm font-sans pt-1 whitespace-pre-wrap leading-relaxed">
                      {msg.decryptedText}
                    </p>
                  )}

                  {/* Raw Cipher Payload Preview (Proof of real encryption) */}
                  <div className="text-[9px] text-zinc-600 font-mono truncate select-all">
                    RAW CIPHERTEXT: {msg.payload?.ciphertext?.slice(0, 48)}... (IV: {msg.payload?.iv})
                  </div>
                </div>
              ))
            )}
          </div>

          {/* New Encrypted Deal / Order Dispatch Form */}
          <form onSubmit={handleSendMessage} className="flex flex-col gap-4 bg-zinc-900/60 p-4 border border-zinc-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1">
                  Identifikátor Odosielateľa (Alias)
                </label>
                <input
                  type="text"
                  value={senderAlias}
                  onChange={(e) => setSenderAlias(e.target.value)}
                  className="w-full bg-black border border-zinc-700 p-2.5 text-xs text-white uppercase focus:border-red-500 outline-none"
                  placeholder="OPERATOR-X"
                />
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1">
                  Stupeň Utajenia (Clearance)
                </label>
                <select
                  value={classification}
                  onChange={(e: any) => setClassification(e.target.value)}
                  className="w-full bg-black border border-zinc-700 p-2.5 text-xs text-white uppercase focus:border-red-500 outline-none"
                >
                  <option value="CONFIDENTIAL">CONFIDENTIAL // Dôverné</option>
                  <option value="TOP_SECRET">TOP SECRET // Prísne tajné</option>
                  <option value="OMEGA_369">OMEGA 369 // Iba vedenie</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1">
                  Cieľový Kanál / Deal ID
                </label>
                <input
                  type="text"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full bg-black border border-zinc-700 p-2.5 text-xs text-white uppercase focus:border-red-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1">
                Text Špeciálnej Požiadavky / Neverejnej Objednávky
              </label>
              <textarea
                required
                rows={3}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Zadaj špeciálnu požiadavku, komoditu, tajnú zákazku, cenovú ponuku alebo inštrukciu..."
                className="w-full bg-black border border-zinc-700 p-3 text-white text-xs font-sans resize-none focus:border-red-500 outline-none"
              />
            </div>

            {statusNotice && (
              <div className="text-xs text-green-400 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{statusNotice}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">
                Payload bude zabezpečený kľúčom epochy <strong>{epochInfo.epochId}</strong>
              </span>

              <button
                type="submit"
                disabled={isSending || !newMessageText.trim()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all disabled:opacity-50 border-2 border-black"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Šifrujem a odosielam...' : 'Zašifrovať a Odoslať'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
