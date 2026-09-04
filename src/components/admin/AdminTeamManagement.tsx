import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ShieldCheck, UserPlus, Trash2, Key, Award, CheckCircle, AlertTriangle } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'dispatcher' | 'recruiter';
  status: 'active' | 'suspended';
  assignedPilier: string;
  createdAt?: any;
}

export default function AdminTeamManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'super_admin' | 'admin' | 'dispatcher' | 'recruiter'>('admin');
  const [assignedPilier, setAssignedPilier] = useState('all');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'authorized_admins'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AdminUser));
      setAdmins(list);
    }, (err) => {
      console.error(err);
    });
    return () => unsub();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setStatusMsg('Zadajte meno a autorizovaný e-mail administrátora.');
      return;
    }

    try {
      await addDoc(collection(db, 'authorized_admins'), {
        name,
        email: email.trim().toLowerCase(),
        role,
        assignedPilier,
        status: 'active',
        createdAt: serverTimestamp()
      });
      setName('');
      setEmail('');
      setStatusMsg('Nový administrátor bol úspešne pridaný do systému.');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
      setStatusMsg('Chyba pri ukladaní administrátora: ' + err.message);
    }
  };

  const handleToggleStatus = async (item: AdminUser) => {
    try {
      const nextStatus = item.status === 'active' ? 'suspended' : 'active';
      await updateDoc(doc(db, 'authorized_admins', item.id), {
        status: nextStatus
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (window.confirm('Naozaj chcete odobrať prístup tomuto administrátorovi?')) {
      try {
        await deleteDoc(doc(db, 'authorized_admins', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-8 h-8 text-amber-400" />
          <h1 className="text-4xl font-black uppercase">Centrála & Správa Admin Tímu</h1>
        </div>
        <p className="text-zinc-500 font-bold uppercase tracking-widest">
          Super Admin rozhranie pre prideľovanie rolí, prístupov k pilierom a spravovanie interného tímu U.S.C.
        </p>
      </div>

      {statusMsg && (
        <div className={`p-4 font-mono font-bold uppercase text-xs border-2 ${
          statusMsg.includes('Chyba') ? 'bg-red-950/50 border-red-600 text-red-400' : 'bg-emerald-950/50 border-emerald-500 text-emerald-400'
        }`}>
          {statusMsg}
        </div>
      )}

      {/* Pridanie noveho admina */}
      <div className="bg-zinc-900 border-4 border-black p-6">
        <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 text-white">
          <UserPlus className="w-5 h-5 text-amber-400" /> Pridať Nového Administrátora / Dispečera
        </h2>

        <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1">Meno & Priezvisko</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="napr. Alex V."
              className="w-full bg-black border-2 border-zinc-800 p-3 text-white font-mono text-sm uppercase focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1">E-mail (Login účet)</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@auru.space"
              className="w-full bg-black border-2 border-zinc-800 p-3 text-white font-mono text-sm focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1">Rola (Oprávnenie)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-black border-2 border-zinc-800 p-3 text-white font-mono text-sm uppercase focus:border-amber-400 outline-none"
            >
              <option value="admin">Admin (Plný prístup)</option>
              <option value="super_admin">Super Admin (Hlavný Mozog)</option>
              <option value="dispatcher">Dispečer (Rent & Logistika)</option>
              <option value="recruiter">Náborár (U.S.C. Work & HR)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1">Poverený Pilier</label>
            <select
              value={assignedPilier}
              onChange={(e) => setAssignedPilier(e.target.value)}
              className="w-full bg-black border-2 border-zinc-800 p-3 text-white font-mono text-sm uppercase focus:border-amber-400 outline-none"
            >
              <option value="all">Všetky Piliere (Global)</option>
              <option value="work">Pilier 4: U.S.C. Work</option>
              <option value="rent">Pilier 3: Rent a Wheel & Kuriér</option>
              <option value="trade">Pilier 5: Trade Zakasajee</option>
              <option value="auru">Pilier 1: Auru Trinity Matrix</option>
              <option value="usw">Pilier 2: U.S.W. Streetwear</option>
              <option value="solidarity">Pilier 6: Solidarity</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs border-2 border-black transition-all"
            >
              + Autorizovať
            </button>
          </div>
        </form>
      </div>

      {/* Zoznam existujucich adminov */}
      <div className="bg-zinc-900 border-4 border-black overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b-4 border-black bg-black text-zinc-400 font-bold uppercase">
              <th className="p-4">Meno</th>
              <th className="p-4">E-mail</th>
              <th className="p-4">Rola</th>
              <th className="p-4">Pilier</th>
              <th className="p-4">Stav</th>
              <th className="p-4 text-right">Akcie</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((adm) => (
              <tr key={adm.id} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                <td className="p-4 font-bold text-white uppercase flex items-center gap-2">
                  {adm.role === 'super_admin' ? <Award className="w-4 h-4 text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-zinc-400" />}
                  {adm.name}
                </td>
                <td className="p-4 text-zinc-300">{adm.email}</td>
                <td className="p-4 font-bold uppercase">
                  <span className={`px-2 py-1 border text-[10px] ${
                    adm.role === 'super_admin' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                    adm.role === 'admin' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                    adm.role === 'dispatcher' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                    'bg-purple-500/20 text-purple-400 border-purple-500/40'
                  }`}>
                    {adm.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-zinc-400 uppercase">{adm.assignedPilier}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleStatus(adm)}
                    className={`px-2 py-1 text-[10px] font-bold uppercase border flex items-center gap-1 ${
                      adm.status === 'active' ? 'bg-emerald-950 text-emerald-400 border-emerald-700' : 'bg-red-950 text-red-400 border-red-700'
                    }`}
                  >
                    {adm.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {adm.status === 'active' ? 'Aktívny' : 'Pozastavený'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDeleteAdmin(adm.id)}
                    className="p-2 bg-black border border-zinc-700 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                    title="Odstrániť administrátora"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500 uppercase font-bold">
                  Žiadni dodatoční administrátori. Využívate hlavný Super Admin účet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
