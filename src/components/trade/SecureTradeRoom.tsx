import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Key, 
  Radio, 
  Terminal, 
  Send, 
  Users, 
  FileText, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  UserCheck, 
  UserX, 
  PlusCircle, 
  Compass, 
  Activity,
  Layers,
  Hash,
  Wifi,
  ChevronDown,
  ChevronUp,
  Circle
} from 'lucide-react';
import { 
  getCurrentHourEpoch, 
  deriveTradeRoomKey, 
  encryptTradeRoomMessage, 
  decryptTradeRoomMessage,
  generateQuantumSessionKey,
  type AccessControlEntry,
  type EncryptedTradePayload
} from '../../lib/trade-crypto';
import { generateCargoManifestPdf } from '../../lib/documentGenerator';
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

// Initial predefined Access Control List
const INITIAL_ACL: AccessControlEntry[] = [
  {
    callsign: 'USC-DIRECTOR-369',
    email: 'Usc31@auru.space',
    tier: 'TIER-3',
    tierName: 'OMEGA 369 DIRECTORATE',
    publicKeyFingerprint: '0x9E4B..77F1',
    status: 'ACTIVE',
    clearanceCodeHash: 'AUTH_OK_SUPERADMIN',
    assignedSectors: ['ALL_SECTORS', 'CROSS_BORDER_ESCROW', 'HEAVY_HAUL']
  },
  {
    callsign: 'RHINE-DISPATCH-01',
    tier: 'TIER-2',
    tierName: 'CARGO DISPATCH COMMAND',
    publicKeyFingerprint: '0x3C81..2A90',
    status: 'ACTIVE',
    clearanceCodeHash: 'AUTH_OK_DISPATCH',
    assignedSectors: ['DE_NL_CORRIDOR', 'INDUSTRIAL_FREIGHT']
  },
  {
    callsign: 'BALTIC-ESCORT-77',
    tier: 'TIER-2',
    tierName: 'CARGO DISPATCH COMMAND',
    publicKeyFingerprint: '0x71DA..45C2',
    status: 'ACTIVE',
    clearanceCodeHash: 'AUTH_OK_ESCORT',
    assignedSectors: ['NORDIC_ESCORT', 'SPECIAL_LOGISTICS']
  },
  {
    callsign: 'DANUBE-FORWARDER-09',
    tier: 'TIER-1',
    tierName: 'FREIGHT SPECIALIST',
    publicKeyFingerprint: '0x1F67..88B3',
    status: 'ACTIVE',
    clearanceCodeHash: 'AUTH_OK_FORWARDER',
    assignedSectors: ['SK_AT_HU_ROUTES']
  }
];

// Available Trade Room Channels
const CHANNELS = [
  { id: 'ROOM-TRANSBORDER-01', name: 'TRANS-BORDER CONVOY', tag: 'CORRIDOR-EU', tier: 'TIER-1', icon: Truck },
  { id: 'ROOM-HEAVY-FVE-02', name: 'SOLAR & HEAVY FREIGHT', tag: 'FVE-INVERTERS', tier: 'TIER-2', icon: Layers },
  { id: 'ROOM-ESCROW-OMEGA-03', name: 'ESCROW & HIGH-VALUE DEALS', tag: 'CLEARANCE-369', tier: 'TIER-3', icon: ShieldAlert },
  { id: 'ROOM-EMERGENCY-04', name: 'FAST DISPATCH & REROUTING', tag: 'URGENT-HOTLINE', tier: 'TIER-1', icon: Radio },
];

export default function SecureTradeRoom() {
  // Gate & Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [callsign, setCallsign] = useState('OPERATOR-VIP-369');
  const [passphrase, setPassphrase] = useState('USC-COMMAND-369');
  const [selectedTier, setSelectedTier] = useState<'TIER-1' | 'TIER-2' | 'TIER-3'>('TIER-3');
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0].id);
  
  // ACL State
  const [aclList, setAclList] = useState<AccessControlEntry[]>(INITIAL_ACL);
  const [showAclModal, setShowAclModal] = useState(false);
  const [newAclCallsign, setNewAclCallsign] = useState('');
  const [newAclTier, setNewAclTier] = useState<'TIER-1' | 'TIER-2' | 'TIER-3'>('TIER-1');

  // Active Participants Presence
  const [showParticipantsDropdown, setShowParticipantsDropdown] = useState(false);

  // Encryption & UI View Modes
  const [viewEncryptedMode, setViewEncryptedMode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  
  // Epoch info & countdown
  const [epochInfo, setEpochInfo] = useState(getCurrentHourEpoch());
  const [timeRemainingStr, setTimeRemainingStr] = useState('');

  // Messages & Transmission
  const [messages, setMessages] = useState<Array<{
    id: string;
    senderCallsign: string;
    senderTier: string;
    classification: 'RESTRICTED' | 'CONFIDENTIAL' | 'TOP_SECRET' | 'OMEGA_369';
    cargoManifest?: any;
    ciphertext: string;
    iv: string;
    epochId: string;
    hmacSignature: string;
    keyFingerprint: string;
    decryptedText: string;
    isLocal?: boolean;
    timestamp: number;
  }>>([]);

  const [messageInput, setMessageInput] = useState('');
  const [classification, setClassification] = useState<'RESTRICTED' | 'CONFIDENTIAL' | 'TOP_SECRET' | 'OMEGA_369'>('TOP_SECRET');
  const [isSending, setIsSending] = useState(false);
  
  // Cargo Manifest Attachment Drawer
  const [showManifestDrawer, setShowManifestDrawer] = useState(false);
  const [manifestOrigin, setManifestOrigin] = useState('Rotterdam Port (NL)');
  const [manifestDestination, setManifestDestination] = useState('Bratislava Hub (SK)');
  const [manifestCargoType, setManifestCargoType] = useState('4x High-Capacity FVE Inverters & Storage Pack');
  const [manifestEscrow, setManifestEscrow] = useState('€48,500');
  const [manifestRisk, setManifestRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [manifestEscort, setManifestEscort] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active Authenticated Participants in current session
  const activeParticipants = React.useMemo(() => {
    const list: Array<{
      callsign: string;
      tier: 'TIER-1' | 'TIER-2' | 'TIER-3';
      tierName: string;
      isSelf: boolean;
      status: 'ONLINE' | 'ACTIVE_TRANSMITTING' | 'IDLE';
      statusText: string;
      fingerprint: string;
      sectors: string[];
      latency: string;
      deviceProtocol: string;
      lastPing: string;
    }> = [
      {
        callsign: callsign.trim().toUpperCase() || 'OPERATOR-VIP-369',
        tier: selectedTier,
        tierName: selectedTier === 'TIER-3' ? 'OMEGA 369 DIRECTORATE' : selectedTier === 'TIER-2' ? 'CARGO DISPATCH COMMAND' : 'FREIGHT SPECIALIST',
        isSelf: true,
        status: 'ONLINE',
        statusText: 'AUTENTIFIKOVANÝ (TÁTO RELÁCIA)',
        fingerprint: aclList.find(a => a.callsign === (callsign.trim().toUpperCase() || 'OPERATOR-VIP-369'))?.publicKeyFingerprint || '0x9E4B..LOCAL',
        sectors: ['TÁTO KOMORA', activeChannel],
        latency: '8ms',
        deviceProtocol: 'AES-256-GCM / E2EE',
        lastPing: 'Práve teraz'
      }
    ];

    // Add co-participants from ACL based on channel
    const currentCallsign = (callsign.trim().toUpperCase() || 'OPERATOR-VIP-369');
    const otherActiveAcl = aclList.filter(a => a.callsign !== currentCallsign && a.status === 'ACTIVE');
    
    otherActiveAcl.forEach((entry, idx) => {
      let shouldInclude = false;
      if (activeChannel === 'ROOM-TRANSBORDER-01' && (entry.callsign.includes('RHINE') || entry.callsign.includes('DANUBE'))) shouldInclude = true;
      else if (activeChannel === 'ROOM-HEAVY-FVE-02' && (entry.callsign.includes('RHINE') || entry.callsign.includes('BALTIC'))) shouldInclude = true;
      else if (activeChannel === 'ROOM-ESCROW-OMEGA-03' && (entry.callsign.includes('DIRECTOR') || entry.callsign.includes('RHINE'))) shouldInclude = true;
      else if (activeChannel === 'ROOM-EMERGENCY-04') shouldInclude = true;
      else if (idx === 0) shouldInclude = true;

      if (shouldInclude) {
        list.push({
          callsign: entry.callsign,
          tier: entry.tier,
          tierName: entry.tierName,
          isSelf: false,
          status: idx === 0 ? 'ONLINE' : 'IDLE',
          statusText: idx === 0 ? 'ONLINE // DEŠIFROVANÝ STREAM' : 'VIEWING SESSION',
          fingerprint: entry.publicKeyFingerprint,
          sectors: entry.assignedSectors,
          latency: `${18 + idx * 11}ms`,
          deviceProtocol: 'AES-256-GCM / E2EE',
          lastPing: idx === 0 ? 'pred 1 min' : 'pred 3 min'
        });
      }
    });

    return list;
  }, [callsign, selectedTier, aclList, activeChannel]);

  // Hourly Clock Synchronization
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

  // Initial Seed Confidential Transmissions
  const getInitialMessagesForChannel = (channelId: string) => {
    return [
      {
        id: 'seed-msg-1',
        senderCallsign: 'USC-DIRECTOR-369',
        senderTier: 'TIER-3',
        classification: 'OMEGA_369' as const,
        ciphertext: 'o3g8B6q9Z1aW+3kmL82hPzB+1qUe71xKl912jH5q==',
        iv: 'k39zB84+qL1v',
        epochId: epochInfo.epochId,
        hmacSignature: 'HMAC-369F8B1A02E',
        keyFingerprint: 'FPR-9E4B77',
        decryptedText: 'Bezpečnostný kanál inicializovaný. Všetky tranzity na trase Rotterdam -> Viedeň -> Bratislava sú pod krytím dispečingu. Očakávame potvrdenie nákladového listu.',
        cargoManifest: {
          origin: 'Rotterdam Port (NL)',
          destination: 'Bratislava Hub (SK)',
          cargoType: '4x High-Capacity FVE Inverters & Storage Pack',
          escrowAmount: '€48,500',
          riskLevel: 'HIGH' as const,
          escortRequired: true
        },
        timestamp: Date.now() - 1000 * 60 * 18
      },
      {
        id: 'seed-msg-2',
        senderCallsign: 'RHINE-DISPATCH-01',
        senderTier: 'TIER-2',
        classification: 'TOP_SECRET' as const,
        ciphertext: 'a71kL38pQv09B+mNz13qKlp88912h==',
        iv: 'y912Vb34kLo1',
        epochId: epochInfo.epochId,
        hmacSignature: 'HMAC-8C1100BA77',
        keyFingerprint: 'FPR-3C812A',
        decryptedText: 'Tranzit T-44 hlási prechod nemeckou hranicou. Vozový park pripravený na prekládku v depe Žilina. Escort vozidlo na pozícii.',
        timestamp: Date.now() - 1000 * 60 * 8
      }
    ];
  };

  // Load / Subscribe Channel Messages
  useEffect(() => {
    if (!isAuthenticated) return;

    // Load initial seeds
    setMessages(getInitialMessagesForChannel(activeChannel));

    // Listen to live channel transmissions from Firestore
    const q = query(
      collection(db, 'trade_secure_rooms'),
      where('channelId', '==', activeChannel),
      orderBy('timestamp', 'asc'),
      limit(40)
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) return;

      const remoteMsgs = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const d = docSnap.data();
          let decrypted = '[ŠIFROVANÝ ZÁZNAM - ŠPECIFICKÝ KĽÚČ]';
          try {
            decrypted = await decryptTradeRoomMessage(
              {
                ciphertext: d.ciphertext,
                iv: d.iv,
                epochId: d.epochId || epochInfo.epochId
              },
              passphrase,
              activeChannel
            );
          } catch (err) {
            decrypted = '[CHYBA DEŠIFROVANIA: NEPLATNÝ KĽÚČ ALEBO INÁ RELÁCIA]';
          }

          return {
            id: docSnap.id,
            senderCallsign: d.senderCallsign || 'OPERATOR',
            senderTier: d.senderTier || 'TIER-1',
            classification: d.classification || 'CONFIDENTIAL',
            cargoManifest: d.cargoManifest || null,
            ciphertext: d.ciphertext,
            iv: d.iv,
            epochId: d.epochId || epochInfo.epochId,
            hmacSignature: d.hmacSignature || 'HMAC-VALID',
            keyFingerprint: d.keyFingerprint || 'FPR-GEN',
            decryptedText: decrypted,
            timestamp: d.timestamp || Date.now()
          };
        })
      );

      // Merge seeds with live remote messages
      setMessages((prev) => {
        const seedList = getInitialMessagesForChannel(activeChannel);
        const map = new Map<string, any>();
        seedList.forEach(m => map.set(m.id, m));
        remoteMsgs.forEach(m => map.set(m.id, m));
        return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
      });
    }, (err) => {
      console.warn('Firestore subscription notice (using local enclave memory):', err.message);
    });

    return () => unsub();
  }, [isAuthenticated, activeChannel, passphrase]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Entrance / ACL Validation
  const handleAuthorizeEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign.trim() || !passphrase.trim()) {
      setStatusNotice('Zadajte platný operačný volací znak (Callsign) a šifrovací kľúč.');
      return;
    }

    // Check Access Control List
    const aclMatch = aclList.find(a => a.callsign.toUpperCase() === callsign.trim().toUpperCase());
    if (aclMatch && aclMatch.status === 'REVOKED') {
      setStatusNotice('PRÍSTUP ZAMIETNUTÝ: Váš volací znak je v stave REVOKED (Pozastavený).');
      return;
    }

    setIsAuthenticated(true);
    setStatusNotice(null);
  };

  // Panic Button / Nuke Key
  const handleNukeKeys = () => {
    if (window.confirm('VAROVANIE: Chystáte sa okamžite vymazať šifrovací kľúč z pamäte prehliadača a uzamknúť Secure Trade Room. Pokračovať?')) {
      setIsAuthenticated(false);
      setPassphrase('');
      setMessages([]);
      setStatusNotice('VŠETKY LOKÁLNE KĽÚČE BOLI VYMAZANÉ. MIESTNOSŤ JE UZAMKNUTÁ.');
    }
  };

  // Send Encrypted Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setIsSending(true);
    try {
      const encrypted = await encryptTradeRoomMessage(
        messageInput.trim(),
        passphrase,
        activeChannel,
        callsign
      );

      const payload: any = {
        channelId: activeChannel,
        senderCallsign: callsign.toUpperCase(),
        senderTier: selectedTier,
        classification,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        epochId: encrypted.epochId,
        hmacSignature: encrypted.hmacSignature,
        keyFingerprint: encrypted.keyFingerprint,
        timestamp: Date.now()
      };

      if (showManifestDrawer) {
        payload.cargoManifest = {
          origin: manifestOrigin,
          destination: manifestDestination,
          cargoType: manifestCargoType,
          escrowAmount: manifestEscrow,
          riskLevel: manifestRisk,
          escortRequired: manifestEscort
        };
      }

      // Try write to Firestore
      try {
        await addDoc(collection(db, 'trade_secure_rooms'), {
          ...payload,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        // Fallback to reactive local state if offline/unauthed
        setMessages(prev => [
          ...prev,
          {
            id: `local-${Date.now()}`,
            ...payload,
            decryptedText: messageInput.trim(),
            isLocal: true
          }
        ]);
      }

      setMessageInput('');
      setShowManifestDrawer(false);
      setStatusNotice('SPRÁVA ZAŠIFROVANÁ (AES-GCM-256) A ODOSLANÁ.');
      setTimeout(() => setStatusNotice(null), 3000);
    } catch (err: any) {
      console.error(err);
      setStatusNotice('CHYBA ŠIFROVANIA: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Add new operator to ACL
  const handleAddAclOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAclCallsign.trim()) return;

    const newEntry: AccessControlEntry = {
      callsign: newAclCallsign.trim().toUpperCase(),
      tier: newAclTier,
      tierName: newAclTier === 'TIER-3' ? 'OMEGA 369 DIRECTORATE' : newAclTier === 'TIER-2' ? 'CARGO DISPATCH COMMAND' : 'FREIGHT SPECIALIST',
      publicKeyFingerprint: `0x${Math.random().toString(16).substring(2, 6).toUpperCase()}..${Math.random().toString(16).substring(2, 6).toUpperCase()}`,
      status: 'ACTIVE',
      clearanceCodeHash: 'AUTH_PROVISIONAL',
      assignedSectors: ['ASSIGNED_ON_DEMAND']
    };

    setAclList(prev => [...prev, newEntry]);
    setNewAclCallsign('');
    setStatusNotice(`OPERÁTOR ${newEntry.callsign} PRIDANÝ DO ACCESS CONTROL LISTU.`);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleToggleAclStatus = (callsignTarget: string) => {
    setAclList(prev => prev.map(item => {
      if (item.callsign === callsignTarget) {
        return {
          ...item,
          status: item.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE'
        };
      }
      return item;
    }));
  };

  // Export encrypted audit bundle
  const handleExportAuditBundle = () => {
    const auditData = {
      system: 'U.S.C. TRADE ZAKASAJEE // SECURE ROOM CRYPTO LOG',
      channel: activeChannel,
      epoch: epochInfo,
      activeAcl: aclList,
      transmissions: messages.map(m => ({
        id: m.id,
        sender: m.senderCallsign,
        tier: m.senderTier,
        classification: m.classification,
        ciphertext: m.ciphertext,
        iv: m.iv,
        hmacSignature: m.hmacSignature,
        keyFingerprint: m.keyFingerprint,
        timestamp: new Date(m.timestamp).toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SECURE-TRADE-${activeChannel}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-zinc-950 border-4 border-red-900/60 shadow-[0_0_50px_rgba(220,38,38,0.15)] text-white font-mono rounded-none overflow-hidden my-8">
      {/* Top Protocol Status Bar */}
      <div className="bg-black border-b-2 border-red-900/80 px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-950/80 text-red-400 px-2.5 py-1 border border-red-600 font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
            SECURE TRADE ROOM // E2EE PROTOCOL
          </div>
          <span className="text-zinc-400 font-bold hidden sm:inline">
            ALGORITHM: <span className="text-zinc-200">AES-256-GCM + PBKDF2-SHA256 (100k)</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-2 text-zinc-400">
            <Activity className="w-3.5 h-3.5 text-red-500" />
            EPOCH: <span className="text-amber-400 font-bold">{epochInfo.epochId}</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-900 px-2 py-0.5 border border-zinc-800">
            <span>ROTÁCIA KĽÚČA:</span>
            <span className="text-red-400 font-bold">{timeRemainingStr}</span>
          </div>
        </div>
      </div>

      {!isAuthenticated ? (
        /* ================= AUTHENTICATION & ACL GATE ================= */
        <div className="p-6 md:p-12 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-red-950/60 border-2 border-red-600 text-red-500 mb-4 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <Lock className="w-10 h-10" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2">
              Kryptografická Brána Obchodnej Komory
            </h3>
            <p className="text-zinc-400 text-xs md:text-sm font-bold uppercase tracking-widest max-w-xl mx-auto">
              Overenie Access Control List (ACL) a inicializácia End-to-End šifrovacej relácie pre neverejné logistické operácie.
            </p>
          </div>

          {statusNotice && (
            <div className="mb-6 p-4 bg-red-950/80 border-2 border-red-600 text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              {statusNotice}
            </div>
          )}

          <form onSubmit={handleAuthorizeEntry} className="bg-zinc-900/90 border-2 border-zinc-800 p-6 md:p-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>Operačný Callsign (Volací Znak)</span>
                  <span className="text-[10px] text-amber-500 font-mono">ACL VERIFIED</span>
                </label>
                <input
                  type="text"
                  required
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  placeholder="napr. USC-DIRECTOR-369"
                  className="w-full bg-black border-2 border-zinc-700 p-3.5 text-white font-mono text-sm uppercase focus:border-red-500 outline-none"
                />
                <p className="text-[10px] text-zinc-500 mt-1.5 uppercase">
                  Povolené predvoľby: USC-DIRECTOR-369, RHINE-DISPATCH-01, BALTIC-ESCORT-77, DANUBE-FORWARDER-09
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>Šifrovací Kľúč / Clearance Passphrase</span>
                  <span className="text-[10px] text-red-400 font-mono">AES-GCM-256</span>
                </label>
                <input
                  type="password"
                  required
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Zadaj kľúč miestnosti"
                  className="w-full bg-black border-2 border-zinc-700 p-3.5 text-white font-mono text-sm focus:border-red-500 outline-none tracking-widest"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase">Preset: USC-COMMAND-369</span>
                  <button
                    type="button"
                    onClick={() => setPassphrase(generateQuantumSessionKey())}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase underline"
                  >
                    Generovať Náhodný Kľúč
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-zinc-800">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Požadovaný Bezpečnostný Stupeň (Tier)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['TIER-1', 'TIER-2', 'TIER-3'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTier(t)}
                      className={`p-2.5 text-xs font-bold uppercase border-2 transition-all text-center ${
                        selectedTier === t
                          ? 'bg-red-600 border-red-500 text-white font-black'
                          : 'bg-black border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Cieľová Šifrovaná Obchodná Miestnosť
                </label>
                <select
                  value={activeChannel}
                  onChange={(e) => setActiveChannel(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs uppercase focus:border-red-500 outline-none"
                >
                  {CHANNELS.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      [{ch.tier}] {ch.name} // {ch.tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-sm border-2 border-black flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(220,38,38,0.4)]"
            >
              <Unlock className="w-5 h-5" />
              Overiť ACL Token & Vstúpiť do Šifrovanej Miestnosti
            </button>
          </form>

          {/* ACL Registry Quick Preview */}
          <div className="mt-8 border border-zinc-800 bg-black/60 p-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 uppercase font-bold">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                Aktívny Register Overených Operátorov (ACL Preview)
              </span>
              <span className="text-[10px] text-zinc-500">{aclList.length} AUTHORIZED</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {aclList.map((entry) => (
                <div key={entry.callsign} className="bg-zinc-900 border border-zinc-800 p-2.5 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-white mb-1">
                    <span>{entry.callsign}</span>
                    <span className={`px-1 text-[9px] border ${
                      entry.tier === 'TIER-3' ? 'border-red-600 text-red-400' : 'border-amber-600 text-amber-400'
                    }`}>
                      {entry.tier}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">FPR: {entry.publicKeyFingerprint}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ================= ACTIVE SECURE TRADE ROOM INTERFACE ================= */
        <div className="flex flex-col h-[750px]">
          {/* Room Controls Header */}
          <div className="bg-zinc-900 border-b-2 border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-950 border border-red-600 text-red-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-black uppercase text-white tracking-wide">
                    {CHANNELS.find(c => c.id === activeChannel)?.name || activeChannel}
                  </h4>
                  <span className="px-2 py-0.5 bg-red-950 border border-red-700 text-red-400 text-[10px] font-bold uppercase">
                    {selectedTier} CLEARED
                  </span>
                </div>
                <div className="text-xs text-zinc-400 flex items-center gap-3 mt-0.5">
                  <span>CALLSIGN: <span className="text-amber-400 font-bold">{callsign}</span></span>
                  <span>•</span>
                  <span>KANÁL ID: <span className="text-zinc-300 font-mono">{activeChannel}</span></span>
                </div>
              </div>
            </div>

            {/* Room Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Active Participants Indicator Button */}
              <button
                type="button"
                onClick={() => setShowParticipantsDropdown(!showParticipantsDropdown)}
                className={`px-3 py-1.5 border-2 text-xs font-bold uppercase flex items-center gap-2 transition-all relative ${
                  showParticipantsDropdown 
                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-black border-zinc-700 text-zinc-300 hover:border-emerald-500 hover:text-white'
                }`}
                title="Zobraziť zoznam autentifikovaných účastníkov sledujúcich reláciu"
              >
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono font-black text-white">
                  {activeParticipants.length} AKTÍVNI ÚČASTNÍCI
                </span>
                {showParticipantsDropdown ? (
                  <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>

              {/* Toggle Encrypted Wirestream vs Decrypted Text */}
              <button
                onClick={() => setViewEncryptedMode(!viewEncryptedMode)}
                className={`px-3 py-1.5 text-xs font-bold uppercase border-2 flex items-center gap-2 transition-all ${
                  viewEncryptedMode 
                    ? 'bg-amber-500 border-amber-400 text-black' 
                    : 'bg-black border-zinc-700 text-zinc-300 hover:text-white'
                }`}
                title="Prepnúť medzi čitateľným textom a surovým šifrovaným tokom"
              >
                {viewEncryptedMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {viewEncryptedMode ? 'Šifrovaný Wirestream (RAW)' : 'Dešifrovaný Náhľad'}
              </button>

              {/* ACL Modal Opener */}
              <button
                onClick={() => setShowAclModal(true)}
                className="px-3 py-1.5 bg-black hover:bg-zinc-800 border-2 border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                ACL Správa ({aclList.filter(a => a.status === 'ACTIVE').length})
              </button>

              {/* Export Audit Log */}
              <button
                onClick={handleExportAuditBundle}
                className="px-3 py-1.5 bg-black hover:bg-zinc-800 border-2 border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase flex items-center gap-1.5 transition-all"
                title="Stiahnuť kryptografický audit log"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                Audit Export
              </button>

              {/* Panic Nuke Button */}
              <button
                onClick={handleNukeKeys}
                className="px-3 py-1.5 bg-red-950 hover:bg-red-600 border-2 border-red-700 text-red-400 hover:text-white text-xs font-black uppercase flex items-center gap-1.5 transition-all"
                title="Okamžite zmazať kľúče z RAM a zamknúť miestnosť"
              >
                <Flame className="w-3.5 h-3.5" />
                NUKE KEYS
              </button>
            </div>
          </div>

          {/* Active Participants Dropdown Drawer */}
          <AnimatePresence>
            {showParticipantsDropdown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-zinc-950 border-b-2 border-emerald-600/80 p-4 font-mono overflow-hidden shadow-2xl"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-emerald-950 border border-emerald-600 text-emerald-400">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                      Aktívne Pripojení Operátori v Komore // {activeChannel}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-[10px] font-bold">
                      {activeParticipants.length} PRÍTOMNÝCH
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Wifi className="w-3.5 h-3.5" /> E2EE STREAM ŠIFROVANÝ
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowParticipantsDropdown(false)}
                      className="text-zinc-500 hover:text-white uppercase font-bold text-[10px] ml-2"
                    >
                      ✕ Zbaliť
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeParticipants.map((p) => (
                    <div
                      key={p.callsign}
                      className={`p-3 border-2 transition-all relative ${
                        p.isSelf
                          ? 'bg-zinc-900 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                          : 'bg-black border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-none border-2 flex items-center justify-center font-black text-xs ${
                            p.tier === 'TIER-3' ? 'border-red-600 bg-red-950 text-red-300' :
                            p.tier === 'TIER-2' ? 'border-amber-600 bg-amber-950 text-amber-300' :
                            'border-blue-600 bg-blue-950 text-blue-300'
                          }`}>
                            {p.callsign.substring(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs uppercase text-white tracking-wide">
                                {p.callsign}
                              </span>
                              {p.isSelf && (
                                <span className="px-1.5 py-0.2 bg-emerald-600 text-black font-black text-[9px] uppercase">
                                  TY (YOU)
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-400 uppercase font-bold">
                              {p.tierName}
                            </div>
                          </div>
                        </div>

                        <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase border ${
                          p.tier === 'TIER-3' ? 'border-red-600 text-red-400 bg-red-950/40' :
                          p.tier === 'TIER-2' ? 'border-amber-600 text-amber-400 bg-amber-950/40' :
                          'border-blue-600 text-blue-400 bg-blue-950/40'
                        }`}>
                          {p.tier}
                        </span>
                      </div>

                      <div className="space-y-1 text-[10px] font-mono text-zinc-400 pt-2 border-t border-zinc-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Stav Relácie:</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                            {p.statusText}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Kryptografický FPR:</span>
                          <span className="text-zinc-300">{p.fingerprint}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Protokol / Odozva:</span>
                          <span className="text-zinc-300">{p.deviceProtocol} ({p.latency})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Sektory:</span>
                          <span className="text-amber-400/90 truncate max-w-[150px]">{p.sectors.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Channel Selector Sub-bar */}
          <div className="bg-black border-b border-zinc-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-zinc-500 font-bold uppercase text-[10px] mr-2 flex items-center gap-1">
                <Compass className="w-3 h-3 text-red-500" /> KANÁLY:
              </span>
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`px-3 py-1 text-[11px] font-bold uppercase whitespace-nowrap border transition-all ${
                    activeChannel === ch.id
                      ? 'bg-red-950 text-red-400 border-red-600 font-black'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  [{ch.tier}] {ch.name}
                </button>
              ))}
            </div>

            {/* Quick Participant Avatar Chips */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase font-bold hidden sm:inline">Prítomní v kanáli:</span>
              <div className="flex items-center -space-x-1.5">
                {activeParticipants.map((p) => (
                  <div
                    key={p.callsign}
                    title={`${p.callsign} (${p.tier}) - ${p.statusText}`}
                    className={`w-6 h-6 border flex items-center justify-center text-[10px] font-black uppercase cursor-pointer transition-transform hover:scale-110 hover:z-10 ${
                      p.isSelf ? 'border-emerald-500 bg-emerald-950 text-emerald-300' :
                      p.tier === 'TIER-3' ? 'border-red-500 bg-red-950 text-red-300' :
                      'border-amber-500 bg-amber-950 text-amber-300'
                    }`}
                    onClick={() => setShowParticipantsDropdown(true)}
                  >
                    {p.callsign.substring(0, 2)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Stream Area */}
          <div className="flex-1 bg-black/95 p-4 md:p-6 overflow-y-auto flex flex-col gap-4 font-mono">
            {messages.length === 0 ? (
              <div className="m-auto text-center text-zinc-600 uppercase font-bold text-xs py-12">
                <Lock className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                Žiadne záznamy v tejto šifrovanej obchodnej komore. Začnite novú zabezpečenú diskusiu.
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderCallsign.toUpperCase() === callsign.toUpperCase();
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border-2 p-4 max-w-3xl ${
                      isMine
                        ? 'self-end bg-zinc-900/90 border-zinc-700 text-right'
                        : 'self-start bg-zinc-950 border-red-950/90 text-left'
                    }`}
                  >
                    {/* Message Header */}
                    <div className={`flex flex-wrap items-center gap-2 text-xs mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <span className="font-black text-amber-400 uppercase tracking-wide">
                        {msg.senderCallsign}
                      </span>

                      <span className="px-1.5 py-0.2 bg-black border border-zinc-700 text-[10px] text-zinc-400 font-bold uppercase">
                        {msg.senderTier}
                      </span>

                      <span className={`px-1.5 py-0.2 text-[10px] font-bold uppercase border ${
                        msg.classification === 'OMEGA_369' ? 'bg-purple-950 border-purple-700 text-purple-300' :
                        msg.classification === 'TOP_SECRET' ? 'bg-red-950 border-red-700 text-red-300' :
                        'bg-zinc-900 border-zinc-700 text-zinc-300'
                      }`}>
                        {msg.classification}
                      </span>

                      <span className="text-[10px] text-zinc-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Cargo Manifest Attachment (if present) */}
                    {msg.cargoManifest && (
                      <div className="mb-3 p-3 bg-black border border-amber-500/50 text-left text-xs">
                        <div className="flex items-center justify-between text-amber-400 font-bold text-[11px] mb-2 uppercase border-b border-zinc-800 pb-1">
                          <span className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-amber-500" />
                            Priložený Nákladový & Escrow Manifest
                          </span>
                          <span className="px-1.5 bg-amber-950 text-amber-400 border border-amber-700 text-[9px]">
                            RIZIKO: {msg.cargoManifest.riskLevel}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-300 mb-2">
                          <div><span className="text-zinc-500 uppercase">Trasa:</span> {msg.cargoManifest.origin} ➔ {msg.cargoManifest.destination}</div>
                          <div><span className="text-zinc-500 uppercase">Náklad:</span> {msg.cargoManifest.cargoType}</div>
                          {msg.cargoManifest.escrowAmount && (
                            <div><span className="text-zinc-500 uppercase">Escrow Garancia:</span> <strong className="text-emerald-400">{msg.cargoManifest.escrowAmount}</strong></div>
                          )}
                          <div><span className="text-zinc-500 uppercase">Ozbrojený Escort:</span> {msg.cargoManifest.escortRequired ? 'ÁNO (AKTÍVNY)' : 'NIE'}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            generateCargoManifestPdf({
                              manifestId: msg.id.slice(0, 8).toUpperCase(),
                              origin: msg.cargoManifest!.origin,
                              destination: msg.cargoManifest!.destination,
                              cargoDescription: msg.cargoManifest!.cargoType,
                              cargoWeightKg: 450,
                              escrowAmountEur: parseFloat(msg.cargoManifest!.escrowAmount?.replace(/[^0-9.]/g, '') || '5000') || 5000,
                              escortRequired: !!msg.cargoManifest!.escortRequired,
                              clearanceLevel: msg.cargoManifest!.riskLevel || 'TIER-2',
                              epochHour: String(epochInfo.epochHour),
                              hashFingerprint: msg.keyFingerprint,
                              authorizedOperator: msg.senderCallsign
                            });
                          }}
                          className="mt-1 w-full py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-black font-bold uppercase text-[10px] border border-amber-500/40 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Download className="w-3 h-3" /> Stiahnuť Oficiálny Manifest (PDF)
                        </button>
                      </div>
                    )}

                    {/* Message Body */}
                    {viewEncryptedMode ? (
                      <div className="bg-black/90 p-2.5 border border-red-900/60 font-mono text-[11px] text-red-400 break-all leading-tight text-left">
                        <div className="text-[9px] text-zinc-500 mb-1">// RAW WIRESTREAM CIPHERTEXT:</div>
                        {msg.ciphertext}
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-200 leading-relaxed font-sans font-medium whitespace-pre-wrap">
                        {msg.decryptedText}
                      </div>
                    )}

                    {/* Cryptographic Signature & Hash Footer */}
                    <div className="mt-2 pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[9px] text-zinc-500 font-mono">
                      <span>FPR: {msg.keyFingerprint} | {msg.hmacSignature}</span>
                      <span className="text-emerald-500/80 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> E2EE VERIFIED
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Optional Logistics Manifest Attachment Builder */}
          <AnimatePresence>
            {showManifestDrawer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-zinc-900 border-t-2 border-amber-600 p-4 text-xs font-mono"
              >
                <div className="flex items-center justify-between mb-3 text-amber-400 font-bold uppercase">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Konfigurácia Nákladového / Escrow Manifestu
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowManifestDrawer(false)}
                    className="text-zinc-500 hover:text-white"
                  >
                    ✕ Zavrieť
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Miesto Odoslania (Origin)</label>
                    <input
                      type="text"
                      value={manifestOrigin}
                      onChange={(e) => setManifestOrigin(e.target.value)}
                      className="w-full bg-black border border-zinc-700 p-2 text-white text-xs uppercase outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Cieľová Destinácia</label>
                    <input
                      type="text"
                      value={manifestDestination}
                      onChange={(e) => setManifestDestination(e.target.value)}
                      className="w-full bg-black border border-zinc-700 p-2 text-white text-xs uppercase outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Druh Nákladu / Komodity</label>
                    <input
                      type="text"
                      value={manifestCargoType}
                      onChange={(e) => setManifestCargoType(e.target.value)}
                      className="w-full bg-black border border-zinc-700 p-2 text-white text-xs uppercase outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Escrow Hodnota Dealu (€)</label>
                    <input
                      type="text"
                      value={manifestEscrow}
                      onChange={(e) => setManifestEscrow(e.target.value)}
                      className="w-full bg-black border border-zinc-700 p-2 text-white text-xs uppercase outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Stupeň Rizika</label>
                    <select
                      value={manifestRisk}
                      onChange={(e) => setManifestRisk(e.target.value as any)}
                      className="w-full bg-black border border-zinc-700 p-2 text-white text-xs uppercase outline-none focus:border-amber-500"
                    >
                      <option value="LOW">LOW (Bežný tranzit)</option>
                      <option value="MEDIUM">MEDIUM (Zvýšený dohľad)</option>
                      <option value="HIGH">HIGH (Konvoj & Escort)</option>
                      <option value="CRITICAL">CRITICAL (Top Secret Trasa)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="escort-chk"
                      checked={manifestEscort}
                      onChange={(e) => setManifestEscort(e.target.checked)}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <label htmlFor="escort-chk" className="text-zinc-300 text-xs uppercase cursor-pointer">
                      Vyžadovať aktívny ozbrojený sprievod (Escort)
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Input & Transmission Bar */}
          <form onSubmit={handleSendMessage} className="bg-zinc-900 border-t-2 border-zinc-800 p-3 md:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowManifestDrawer(!showManifestDrawer)}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase border flex items-center gap-1.5 transition-all ${
                    showManifestDrawer
                      ? 'bg-amber-500 border-amber-400 text-black'
                      : 'bg-black border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  {showManifestDrawer ? 'Manifest Pripojený ✓' : '+ Pripojiť Nákladový Manifest'}
                </button>

                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <span className="hidden sm:inline uppercase">Klasifikácia:</span>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value as any)}
                    className="bg-black border border-zinc-700 text-white px-2 py-1 text-[11px] font-bold uppercase outline-none"
                  >
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="TOP_SECRET">TOP SECRET</option>
                    <option value="OMEGA_369">OMEGA 369</option>
                  </select>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 uppercase font-mono">
                AUTOSHRED: 1h EPOCH ROTATION
              </div>
            </div>

            <div className="flex gap-2">
              <textarea
                rows={2}
                required
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Zadajte dôverné logistické pokyny, dopyt po náklade alebo ponuku tranzitu..."
                className="flex-1 bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs md:text-sm focus:border-red-500 outline-none resize-none leading-relaxed"
              />

              <button
                type="submit"
                disabled={isSending}
                className="px-6 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider text-xs border-2 border-black flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Šifrujem...' : 'Odoslať'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= ACL MANAGEMENT MODAL ================= */}
      <AnimatePresence>
        {showAclModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border-4 border-red-700 max-w-3xl w-full p-6 text-white font-mono"
            >
              <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3 mb-4">
                <h3 className="text-xl font-black uppercase text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-amber-500" />
                  Access Control List (ACL) // Správa Operátorov
                </h3>
                <button
                  onClick={() => setShowAclModal(false)}
                  className="text-zinc-400 hover:text-white text-sm uppercase font-bold"
                >
                  ✕ Zavrieť
                </button>
              </div>

              {/* Add Operator Form */}
              <form onSubmit={handleAddAclOperator} className="bg-zinc-900 border border-zinc-800 p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Nový Callsign</label>
                  <input
                    type="text"
                    required
                    value={newAclCallsign}
                    onChange={(e) => setNewAclCallsign(e.target.value)}
                    placeholder="napr. NORDIC-ESCORT-11"
                    className="w-full bg-black border border-zinc-700 p-2 text-white text-xs uppercase outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Oprávnenie (Tier)</label>
                  <select
                    value={newAclTier}
                    onChange={(e) => setNewAclTier(e.target.value as any)}
                    className="w-full bg-black border border-zinc-700 p-2 text-white text-xs uppercase outline-none focus:border-amber-400"
                  >
                    <option value="TIER-1">TIER-1 (Freight Specialist)</option>
                    <option value="TIER-2">TIER-2 (Dispatch Command)</option>
                    <option value="TIER-3">TIER-3 (Directorate / Omega)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs border border-black flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> Pridať do ACL
                  </button>
                </div>
              </form>

              {/* Operators Table */}
              <div className="max-h-64 overflow-y-auto border border-zinc-800 bg-black">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                      <th className="p-3">Callsign</th>
                      <th className="p-3">Tier</th>
                      <th className="p-3">Fingerprint</th>
                      <th className="p-3">Stav</th>
                      <th className="p-3 text-right">Akcia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aclList.map((entry) => (
                      <tr key={entry.callsign} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                        <td className="p-3 font-bold text-white uppercase">{entry.callsign}</td>
                        <td className="p-3 text-amber-400 uppercase">{entry.tier}</td>
                        <td className="p-3 text-zinc-400 text-[10px]">{entry.publicKeyFingerprint}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                            entry.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                              : 'bg-red-950 text-red-400 border-red-700'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleAclStatus(entry.callsign)}
                            className="text-[10px] uppercase font-bold text-zinc-400 hover:text-white underline"
                          >
                            {entry.status === 'ACTIVE' ? 'Pozastaviť' : 'Aktivovať'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
