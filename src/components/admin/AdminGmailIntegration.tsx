import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  RefreshCw, 
  Inbox, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Key, 
  CornerDownRight, 
  Sparkles,
  Bot,
  User,
  Clock,
  Tag
} from 'lucide-react';
import { 
  getGoogleAccessToken, 
  fetchGmailMessages, 
  sendGmailMessage, 
  GmailMessage, 
  SendEmailPayload 
} from '../../lib/gmail';

export default function AdminGmailIntegration() {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('usc_gmail_access_token');
  });
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Compose State
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // AI draft assistant state
  const [isDraftingAI, setIsDraftingAI] = useState(false);
  const [aiDraftPrompt, setAiDraftPrompt] = useState('');

  // Connect / Authorize Gmail
  const handleConnectGmail = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = await getGoogleAccessToken(true);
      setToken(accessToken);
      await loadEmails(accessToken);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Nepodarilo sa pripojiť k službe Gmail.');
    } finally {
      setLoading(false);
    }
  };

  // Disconnect
  const handleDisconnect = () => {
    sessionStorage.removeItem('usc_gmail_access_token');
    setToken(null);
    setMessages([]);
    setSelectedMessage(null);
  };

  // Load emails
  const loadEmails = async (accessToken: string, queryStr: string = searchQuery) => {
    try {
      setLoading(true);
      setError(null);
      const fetched = await fetchGmailMessages(accessToken, queryStr);
      setMessages(fetched);
      if (fetched.length > 0 && !selectedMessage) {
        setSelectedMessage(fetched[0]);
      }
    } catch (err: any) {
      console.error('Chyba načítania Gmail správ:', err);
      if (err.message?.includes('401') || err.message?.includes('UNAUTHENTICATED')) {
        setToken(null);
        sessionStorage.removeItem('usc_gmail_access_token');
        setError('Platnosť tokenu vypršala. Prosím pripojte sa znova.');
      } else {
        setError(err.message || 'Nepodarilo sa načítať emaily.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      loadEmails(token, searchQuery);
    }
  };

  // Quick reply setup
  const handleQuickReply = (msg: GmailMessage) => {
    // Extract raw email from 'From: Name <email@domain>'
    const match = msg.from?.match(/<([^>]+)>/) || [null, msg.from];
    const replyTo = match[1] || msg.from || '';
    setComposeTo(replyTo);
    setComposeSubject(msg.subject?.startsWith('Re:') ? msg.subject : `Re: ${msg.subject || ''}`);
    setComposeBody(`\n\n--- Pôvodná správa ---\nOd: ${msg.from}\nDátum: ${msg.date}\n\n${msg.snippet || ''}`);
  };

  // AI draft generator for emails
  const handleGenerateAIDraft = async () => {
    if (!aiDraftPrompt.trim() && !selectedMessage) return;
    try {
      setIsDraftingAI(true);
      const prompt = `Si oficiálny AI asistent a manažér komunikácie pre ekosystém Underground Street Collective (U.S.C. / Auru Trinity).
Vytvor profesionálnu, priamu a sebavedomú odpoveď na email:

${selectedMessage ? `PÔVODNÝ EMAIL:\nOd: ${selectedMessage.from}\nPredmet: ${selectedMessage.subject}\nText: ${selectedMessage.snippet}` : ''}

INŠTRUKCIE PRE ODPOVEĎ OD POUŽÍVATEĽA:
${aiDraftPrompt || 'Poďakuj za kontakt, potvrď prijatie dopytu a dohodni si krátky online call alebo osobné stretnutie v centrále U.S.C.'}

Napíš hotové telo emailu v slovenskom jazyku, podpísané "Tím Underground Street Collective // Auru Trinity".`;

      const res = await fetch('/api/ai/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          mode: 'GMAIL_COMMUNICATION_MANAGER'
        })
      });
      const data = await res.json();
      if (data.reply) {
        setComposeBody(data.reply);
        setAiDraftPrompt('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDraftingAI(false);
    }
  };

  // Send Email Submit
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!composeTo || !composeSubject || !composeBody) {
      setError('Vyplňte príjemcu, predmet aj telo správy.');
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      await sendGmailMessage(token, {
        to: composeTo,
        subject: composeSubject,
        body: composeBody
      });
      setSendSuccess(true);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setTimeout(() => setSendSuccess(false), 4000);
      // Reload inbox
      loadEmails(token);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Nepodarilo sa odoslať správu cez Gmail.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadEmails(token);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-500 border border-red-600/30 px-3 py-1 text-xs font-black uppercase tracking-widest mb-2">
            <Mail className="w-3.5 h-3.5" /> Google Workspace OAuth Integration
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            U.S.C. Gmail <span className="text-red-500">Inbox & Dispatch</span>
          </h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-1">
            Prepojenie s tvojim firemným a osobným Gmail kontom cez zabezpečený OAuth 2.0
          </p>
        </div>

        <div className="flex items-center gap-3">
          {token ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadEmails(token)}
                disabled={loading}
                className="px-4 py-2 bg-zinc-900 border-2 border-zinc-700 hover:border-amber-500 text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Obnoviť
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-950/60 border-2 border-red-800 hover:bg-red-900 text-red-400 font-bold uppercase tracking-widest text-xs transition-colors"
              >
                Odpojiť Gmail
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectGmail}
              disabled={loading}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <Key className="w-4 h-4" /> Pripojiť Google Gmail Účet
            </button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-950/60 border-l-4 border-red-600 text-red-200 text-sm font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {!token ? (
        /* Not connected state */
        <div className="bg-zinc-900 border-4 border-black p-8 md:p-12 text-center max-w-2xl mx-auto shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]">
          <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-600">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
            Pripojte svoje Gmail konto k centrále U.S.C.
          </h2>
          <p className="text-zinc-400 text-sm font-medium mb-6 leading-relaxed">
            Získajte priamy prístup k čítaniu dopytov, odosielaniu cenových ponúk, odpovediam na zákazky a automatizácii s Auru Matrix AI priamo v tomto rozhraní.
          </p>
          <div className="bg-black/60 border border-zinc-800 p-4 mb-6 text-left text-xs font-mono text-zinc-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" /> OAuth 2.0 Scopes Nakonfigurované
            </div>
            <div>• Čítanie a správa správ (gmail.readonly, gmail.modify)</div>
            <div>• Odosielanie emailov (gmail.send, gmail.compose)</div>
            <div>• Projekt ID: <span className="text-amber-400">gen-lang-client-0522793792</span></div>
          </div>
          <button
            onClick={handleConnectGmail}
            disabled={loading}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <Key className="w-5 h-5" /> {loading ? 'Pripájam k Google...' : 'Autorizovať a otvoriť Gmail'}
          </button>
        </div>
      ) : (
        /* Connected state */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Messages Column (5 cols) */}
          <div className="lg:col-span-5 bg-zinc-900 border-4 border-black flex flex-col h-[750px]">
            {/* Search & Stats */}
            <div className="p-4 border-b-2 border-zinc-800 bg-black space-y-3">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Hľadať v správach..."
                    className="w-full bg-zinc-950 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider"
                >
                  Hľadať
                </button>
              </form>

              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                <span>Nájdených správ: <strong className="text-white">{messages.length}</strong></span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> OAuth Aktívny
                </span>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60 p-2 space-y-1">
              {loading && messages.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 font-mono text-xs flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                  <span>Sťahujem správy z Gmailu...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 font-mono text-xs">
                  Žiadne správy neboli nájdené.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-3 cursor-pointer transition-all border ${
                      selectedMessage?.id === msg.id
                        ? 'bg-zinc-800 border-amber-500'
                        : 'bg-zinc-950/60 border-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`text-xs font-bold truncate ${msg.isUnread ? 'text-white font-black' : 'text-zinc-300'}`}>
                        {msg.from?.replace(/<.*>/, '').trim() || msg.from}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {msg.date ? new Date(msg.date).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className={`text-xs truncate mb-1 ${msg.isUnread ? 'text-amber-400 font-bold' : 'text-zinc-200'}`}>
                      {msg.subject || '(Bez predmetu)'}
                    </div>

                    <div className="text-[11px] text-zinc-500 line-clamp-2 leading-tight">
                      {msg.snippet}
                    </div>

                    {msg.labels && msg.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {msg.labels.slice(0, 3).map((lbl) => (
                          <span key={lbl} className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase font-mono">
                            {lbl}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Detail & Compose Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col h-[750px]">
            {/* Message Detail View */}
            <div className="flex-1 bg-zinc-900 border-4 border-black p-6 overflow-y-auto flex flex-col">
              {selectedMessage ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="border-b-2 border-zinc-800 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-xl font-black uppercase text-white tracking-tight leading-snug">
                        {selectedMessage.subject || '(Bez predmetu)'}
                      </h2>
                      <button
                        onClick={() => handleQuickReply(selectedMessage)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1 shrink-0"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" /> Odpovedať
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-1 text-xs font-mono text-zinc-400">
                      <div><strong className="text-zinc-300">Od:</strong> {selectedMessage.from}</div>
                      {selectedMessage.to && <div><strong className="text-zinc-300">Komu:</strong> {selectedMessage.to}</div>}
                      {selectedMessage.date && <div><strong className="text-zinc-300">Dátum:</strong> {new Date(selectedMessage.date).toLocaleString('sk-SK')}</div>}
                    </div>
                  </div>

                  <div className="flex-1 bg-black/40 p-4 border border-zinc-800/80 font-sans text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed overflow-y-auto">
                    {selectedMessage.body || selectedMessage.snippet || '(Žiadny text správy)'}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs">
                  <Inbox className="w-12 h-12 mb-3 text-zinc-700" />
                  Vyberte správu zo zoznamu vľavo pre zobrazenie detailu
                </div>
              )}
            </div>

            {/* Quick Compose & AI Assist Box */}
            <div className="bg-zinc-900 border-4 border-black p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-red-500" /> Nová správa / Odpoveď
                </h3>
                {sendSuccess && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Email úspešne odoslaný!
                  </span>
                )}
              </div>

              {/* AI Draft Box */}
              <div className="bg-black/50 border border-zinc-800 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" /> AI Asistent Konceptu (Gemini 3.7)
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiDraftPrompt}
                    onChange={(e) => setAiDraftPrompt(e.target.value)}
                    placeholder="Napr: Navrhni termín stretnutia na štvrtok v garáži a pošli cenník fleetu..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAIDraft}
                    disabled={isDraftingAI}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider disabled:opacity-50 flex items-center gap-1"
                  >
                    <Bot className="w-3.5 h-3.5" /> {isDraftingAI ? 'Generujem...' : 'Navrhnúť odpoveď'}
                  </button>
                </div>
              </div>

              {/* Send Form */}
              <form onSubmit={handleSendEmail} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="email"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder="Príjemca (napr. info@klient.sk)"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="text"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="Predmet správy"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>

                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Napíšte text správy..."
                  rows={3}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 font-sans"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> {isSending ? 'Odosielam...' : 'Odoslať Email'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
