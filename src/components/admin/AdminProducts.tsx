import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { imageMap, uswProducts as initialProducts } from '../../data';
import { Plus, Trash2, Database } from 'lucide-react';
import type { FormEvent } from 'react';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'mikiny',
    price: '€0',
    color: '',
    status: 'available'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return () => unsubscribe();
  }, []);

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let imageUrl = '';

      // Ak bol vybraný súbor, najskôr ho nahráme na náš nový Express backend (ktorý to pošle na R2)
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
        imageUrl = data.url; // Toto bude verejná URL adresa na R2 proxy (napr. /api/images/xxx)
      } else {
        alert('Prosím, vyber obrázok.');
        setIsUploading(false);
        return;
      }

      await addDoc(collection(db, 'products'), {
        ...newProduct,
        image: imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewProduct({ name: '', category: 'mikiny', price: '€0', color: '', status: 'available' });
      setSelectedFile(null);
    } catch (error: any) {
      alert(`Chyba pri nahrávaní: ${error.message}`);
      handleFirestoreError(error, OperationType.CREATE, 'products');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Naozaj vymazať?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const migrateHardcodedData = async () => {
    if (!window.confirm('Toto nahrá všetky pevné produkty z data.tsx do databázy. Pokračovať?')) return;
    try {
      const batch = writeBatch(db);
      for (const prod of initialProducts) {
        // Reverse lookup image filename from imageMap
        let imageName = '';
        for (const [key, value] of Object.entries(imageMap)) {
          if (value === prod.image) {
            imageName = key;
            break;
          }
        }
        
        const docRef = doc(collection(db, 'products'));
        batch.set(docRef, {
          name: prod.name,
          category: prod.cat,
          price: prod.price,
          color: prod.color,
          image: imageName, // store the key
          status: 'available',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      await batch.commit();
      alert('Dáta úspešne migrované!');
    } catch (error) {
      console.error(error);
      alert('Chyba pri migrácii.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-black uppercase text-amber-500">CMS: Produkty</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest">Správa U.S.W obchodu</p>
        </div>
        {products.length === 0 && !loading && (
          <button 
            onClick={migrateHardcodedData}
            className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 font-black uppercase hover:bg-amber-400 transition-colors"
          >
            <Database className="w-5 h-5" /> Import Dát z Kódu
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Product Form */}
        <div className="bg-zinc-900 border-4 border-black p-6 h-fit">
          <h2 className="text-xl font-black uppercase mb-4">Pridať Produkt</h2>
          <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
            <input required type="text" placeholder="Názov (napr. U.S.W Hoodie)" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="bg-zinc-950 border-2 border-zinc-800 p-3 text-white focus:border-amber-500 outline-none" />
            <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="bg-zinc-950 border-2 border-zinc-800 p-3 text-white focus:border-amber-500 outline-none">
              <option value="mikiny">Mikiny</option>
              <option value="tepláky">Tepláky</option>
              <option value="tričká">Tričká</option>
              <option value="tenisky">Tenisky</option>
              <option value="bundy">Bundy</option>
              <option value="pomôcky">Pomôcky</option>
            </select>
            <input required type="text" placeholder="Cena (napr. €89)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="bg-zinc-950 border-2 border-zinc-800 p-3 text-white focus:border-amber-500 outline-none" />
            <input required type="text" placeholder="Farba (napr. Black)" value={newProduct.color} onChange={e => setNewProduct({...newProduct, color: e.target.value})} className="bg-zinc-950 border-2 border-zinc-800 p-3 text-white focus:border-amber-500 outline-none" />
            <input 
              required 
              type="file" 
              accept="image/*"
              onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} 
              className="bg-zinc-950 border-2 border-zinc-800 p-3 text-white focus:border-amber-500 outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-black file:bg-amber-500 file:text-black hover:file:bg-amber-400" 
            />
            <button disabled={isUploading} type="submit" className="flex items-center justify-center gap-2 bg-amber-500 text-black py-3 font-black uppercase hover:bg-amber-400 mt-2 disabled:opacity-50">
              <Plus className="w-5 h-5" /> {isUploading ? 'Nahrávam na R2...' : 'Pridať'}
            </button>
          </form>
        </div>

        {/* Product List */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border-4 border-black overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-4 border-black bg-black text-zinc-400 font-black uppercase text-sm">
                  <th className="p-4">Názov</th>
                  <th className="p-4">Kategória</th>
                  <th className="p-4">Cena</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Akcia</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="p-4 font-bold">{p.name}</td>
                    <td className="p-4 text-zinc-500 uppercase">{p.category}</td>
                    <td className="p-4">{p.price}</td>
                    <td className="p-4">
                      <select 
                        value={p.status}
                        onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                        className={`bg-zinc-950 border-2 outline-none p-1 font-bold text-xs uppercase ${p.status === 'sold_out' ? 'border-red-600 text-red-500' : p.status === 'hidden' ? 'border-zinc-600 text-zinc-500' : 'border-green-600 text-green-500'}`}
                      >
                        <option value="available">Dostupné</option>
                        <option value="sold_out">Vypredané</option>
                        <option value="hidden">Skryté</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(p.id)} className="text-zinc-500 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
