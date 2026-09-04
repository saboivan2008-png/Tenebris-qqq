import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    type: 'osobné',
    status: 'available'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicles(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'vehicles');
    });

    return () => unsubscribe();
  }, []);

  const handleAddVehicle = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let imageUrl = '';

      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await res.json();
        imageUrl = data.url;
      }

      await addDoc(collection(db, 'vehicles'), {
        ...newVehicle,
        image: imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewVehicle({ name: '', type: 'osobné', status: 'available' });
      setSelectedFile(null);
    } catch (error: any) {
      alert(`Chyba pri nahrávaní: ${error.message}`);
      handleFirestoreError(error, OperationType.CREATE, 'vehicles');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'vehicles', id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `vehicles/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Naozaj vymazať?')) return;
    try {
      await deleteDoc(doc(db, 'vehicles', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `vehicles/${id}`);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-black uppercase text-zinc-100">CMS: Vozový Park</h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest">Správa Rent a Wheel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Vehicle Form */}
        <div className="bg-zinc-900 border-4 border-black p-6 h-fit">
          <h2 className="text-xl font-black uppercase mb-4">Pridať Vozidlo</h2>
          <form onSubmit={handleAddVehicle} className="flex flex-col gap-4">
            <input required type="text" placeholder="Názov (napr. BMW M4)" value={newVehicle.name} onChange={e => setNewVehicle({...newVehicle, name: e.target.value})} className="bg-zinc-950 border-2 border-zinc-800 p-3 text-white focus:border-zinc-500 outline-none" />
            <select value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})} className="bg-zinc-950 border-2 border-zinc-800 p-3 text-white focus:border-zinc-500 outline-none">
              <option value="osobné">Osobné</option>
              <option value="dodávka">Dodávka</option>
              <option value="špeciál">Špeciál / Supercar</option>
            </select>
            <input 
              type="file" 
              accept="image/*"
              onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} 
              className="bg-zinc-950 border-2 border-zinc-800 p-3 text-white focus:border-zinc-500 outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-black file:bg-zinc-100 file:text-black hover:file:bg-zinc-300" 
            />
            <button disabled={isUploading} type="submit" className="flex items-center justify-center gap-2 bg-zinc-100 text-black py-3 font-black uppercase hover:bg-zinc-300 mt-2 transition-colors disabled:opacity-50">
              <Plus className="w-5 h-5" /> {isUploading ? 'Nahrávam na R2...' : 'Pridať'}
            </button>
          </form>
        </div>

        {/* Vehicle List */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border-4 border-black overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-4 border-black bg-black text-zinc-400 font-black uppercase text-sm">
                  <th className="p-4">Vozidlo</th>
                  <th className="p-4">Typ</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Akcia</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="p-4 font-bold">{v.name}</td>
                    <td className="p-4 text-zinc-500 uppercase">{v.type}</td>
                    <td className="p-4">
                      <select 
                        value={v.status}
                        onChange={(e) => handleUpdateStatus(v.id, e.target.value)}
                        className={`bg-zinc-950 border-2 outline-none p-1 font-bold text-xs uppercase ${v.status === 'rented' ? 'border-red-600 text-red-500' : v.status === 'maintenance' ? 'border-amber-500 text-amber-500' : 'border-green-600 text-green-500'}`}
                      >
                        <option value="available">Dostupné</option>
                        <option value="rented">Zapožičané</option>
                        <option value="maintenance">V Servise</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(v.id)} className="text-zinc-500 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-500 font-bold uppercase border-4 border-dashed border-zinc-800 m-4">
                      Zatiaľ žiadne vozidlá
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
