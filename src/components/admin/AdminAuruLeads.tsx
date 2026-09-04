import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Cpu, HeartHandshake, FileText, Activity } from 'lucide-react';

export default function AdminAuruLeads() {
  const [activeSubTab, setActiveSubTab] = useState<'auru' | 'solidarity' | 'work_apps'>('auru');
  const [auruLeads, setAuruLeads] = useState<any[]>([]);
  const [solidarityCases, setSolidarityCases] = useState<any[]>([]);
  const [workApps, setWorkApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuru = onSnapshot(query(collection(db, 'auru_trinity_leads'), orderBy('createdAt', 'desc')), (snap) => {
      setAuruLeads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, () => setLoading(false));

    const unsubSolidarity = onSnapshot(query(collection(db, 'solidarity_cases'), orderBy('createdAt', 'desc')), (snap) => {
      setSolidarityCases(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, () => {});

    const unsubWork = onSnapshot(query(collection(db, 'work_applications'), orderBy('createdAt', 'desc')), (snap) => {
      setWorkApps(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, () => {});

    return () => {
      unsubAuru();
      unsubSolidarity();
      unsubWork();
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-black uppercase mb-2">Ecosystem Dopyty & Žiadosti</h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest">
          Centrálny prehľad žiadostí z Auru Trinity, Solidarity a U.S.C. Work
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
        <button
          onClick={() => setActiveSubTab('auru')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'auru' ? 'bg-amber-500 text-black border-black' : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" /> Auru Trinity ({auruLeads.length})
        </button>

        <button
          onClick={() => setActiveSubTab('solidarity')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'solidarity' ? 'bg-red-600 text-white border-black' : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          <HeartHandshake className="w-4 h-4" /> Solidarity Núdza ({solidarityCases.length})
        </button>

        <button
          onClick={() => setActiveSubTab('work_apps')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'work_apps' ? 'bg-blue-600 text-white border-black' : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Uchádzači o Prácu ({workApps.length})
        </button>
      </div>

      {activeSubTab === 'auru' && (
        <div className="bg-zinc-900 border-4 border-black overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b-4 border-black bg-black text-zinc-400 font-bold uppercase">
                <th className="p-4">Klient / Firma</th>
                <th className="p-4">Kontakt</th>
                <th className="p-4">Služba</th>
                <th className="p-4">Budget</th>
                <th className="p-4">Popis požiadavky</th>
                <th className="p-4">Dátum</th>
              </tr>
            </thead>
            <tbody>
              {auruLeads.map((item) => (
                <tr key={item.id} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                  <td className="p-4 font-bold text-white uppercase">{item.name}</td>
                  <td className="p-4 text-amber-400">{item.contact}</td>
                  <td className="p-4 uppercase">{item.serviceInterest}</td>
                  <td className="p-4 font-bold">{item.budget}</td>
                  <td className="p-4 text-zinc-300 max-w-xs">{item.description || 'Bez popisu'}</td>
                  <td className="p-4 text-zinc-500">
                    {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {auruLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 uppercase font-bold">
                    Žiadne dopyty pre Auru Trinity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'solidarity' && (
        <div className="bg-zinc-900 border-4 border-black overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b-4 border-black bg-black text-zinc-400 font-bold uppercase">
                <th className="p-4">Žiadateľ</th>
                <th className="p-4">Kontakt</th>
                <th className="p-4">Mesto</th>
                <th className="p-4">Typ Pomoci</th>
                <th className="p-4">Príbeh / Núdza</th>
                <th className="p-4">Dátum</th>
              </tr>
            </thead>
            <tbody>
              {solidarityCases.map((item) => (
                <tr key={item.id} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                  <td className="p-4 font-bold text-white uppercase">{item.beneficiaryName || 'Anonym'}</td>
                  <td className="p-4 text-red-400">{item.contact}</td>
                  <td className="p-4 uppercase">{item.city}</td>
                  <td className="p-4 text-zinc-300 uppercase">{item.helpType}</td>
                  <td className="p-4 text-zinc-300 max-w-sm">{item.story}</td>
                  <td className="p-4 text-zinc-500">
                    {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {solidarityCases.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 uppercase font-bold">
                    Žiadne nahlásené prípady núdze
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'work_apps' && (
        <div className="bg-zinc-900 border-4 border-black overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b-4 border-black bg-black text-zinc-400 font-bold uppercase">
                <th className="p-4">Uchádzač</th>
                <th className="p-4">Kontakt</th>
                <th className="p-4">Pozícia</th>
                <th className="p-4">Živnosť</th>
                <th className="p-4">Jazyk</th>
                <th className="p-4">Prax</th>
                <th className="p-4">Dátum</th>
              </tr>
            </thead>
            <tbody>
              {workApps.map((item) => (
                <tr key={item.id} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                  <td className="p-4 font-bold text-white uppercase">{item.name}</td>
                  <td className="p-4 text-blue-400">{item.phone}</td>
                  <td className="p-4 font-bold text-amber-400">{item.jobTitle} ({item.jobLocation})</td>
                  <td className="p-4 uppercase">{item.hasTradeLicense}</td>
                  <td className="p-4 uppercase">{item.hasGermanLanguage}</td>
                  <td className="p-4 text-zinc-300 max-w-xs">{item.experience}</td>
                  <td className="p-4 text-zinc-500">
                    {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {workApps.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500 uppercase font-bold">
                    Žiadne žiadosti o prácu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
