import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';

export default function AdminPartners() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPartner, setNewPartner] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'partners'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPartners(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'partners');
    });

    return () => unsubscribe();
  }, []);

  const handleAddPartner = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'partners'), {
        ...newPartner,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewPartner({ name: '', description: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'partners');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Naozaj vymazať partnera?')) return;
    try {
      await deleteDoc(doc(db, 'partners', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `partners/${id}`);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-black uppercase text-blue-500">CMS: Partneri & Firmy</h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest">Správa U.S.C Work</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Form */}
        <div className="bg-zinc-900 border-4 border-black p-6 h-fit">
          <h2 className="text-xl font-black uppercase mb-4">Pridať Partnera</h2>
          <form onSubmit={handleAddPartner} className="flex flex-col gap-4">
            <input required type="text" placeholder="Názov Firmy" value={newPartner.name} onChange={e => setNewPartner({...newPartner, name: e.target.value})} className="bg-zinc-950 border-2 border-zinc-800 p-3 text-white focus:border-blue-500 outline-none" />
            <textarea required placeholder="Krátky popis firmy / spolupráce" value={newPartner.description} onChange={e => setNewPartner({...newPartner, description: e.target.value})} className="bg-zinc-950 border-2 border-zinc-800 p-3 text-white focus:border-blue-500 outline-none min-h-[120px]" />
            <button type="submit" className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 font-black uppercase hover:bg-blue-600 mt-2 transition-colors">
              <Plus className="w-5 h-5" /> Pridať
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border-4 border-black overflow-hidden">
            {partners.map((p) => (
              <div key={p.id} className="p-6 border-b-4 border-black last:border-b-0 hover:bg-zinc-800/50 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white mb-2">{p.name}</h3>
                  <p className="text-zinc-400 font-bold uppercase tracking-wide text-sm">{p.description}</p>
                </div>
                <button onClick={() => handleDelete(p.id)} className="text-zinc-600 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            ))}
            
            {partners.length === 0 && !loading && (
              <div className="p-8 text-center text-zinc-500 font-bold uppercase border-4 border-dashed border-zinc-800 m-4">
                Zatiaľ žiadni partneri
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
