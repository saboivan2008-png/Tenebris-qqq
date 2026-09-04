import React, { useState, useEffect } from 'react';
import { 
  FolderSearch, 
  FileText, 
  ExternalLink, 
  Trash2, 
  CheckCircle2, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  FileCheck, 
  HardDrive, 
  Key, 
  Tag, 
  Copy,
  Info,
  Clock,
  Layers
} from 'lucide-react';
import { openGoogleDrivePicker, SelectedDriveFile, getDriveAccessToken } from '../../lib/googlePicker';
import firebaseConfig from '../../../firebase-applet-config.json';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

interface DriveAttachment extends SelectedDriveFile {
  firestoreId?: string;
  category?: string;
  addedAt?: any;
}

export default function AdminGoogleDrivePicker() {
  const [attachedFiles, setAttachedFiles] = useState<DriveAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [fileCategory, setFileCategory] = useState<string>('Zmluvy a A1');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedFiles();
  }, []);

  const loadSavedFiles = async () => {
    try {
      const q = query(collection(db, 'driveAttachments'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: DriveAttachment[] = snap.docs.map(d => ({
        ...(d.data() as SelectedDriveFile),
        firestoreId: d.id,
        category: d.data().category || 'Všeobecné',
        addedAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()
      }));
      setAttachedFiles(list);
    } catch (e: any) {
      // If offline or rule restricts, fallback to local storage
      const local = localStorage.getItem('usc_drive_files');
      if (local) {
        setAttachedFiles(JSON.parse(local));
      }
    }
  };

  const handleOpenPicker = async () => {
    setLoading(true);
    setStatusMessage({ text: 'Pripájam k Google Drive a načítavam Picker...', type: 'info' });
    try {
      let mimeFilter: string | undefined = undefined;
      if (filterType === 'pdf') mimeFilter = 'application/pdf';
      if (filterType === 'sheets') mimeFilter = 'application/vnd.google-apps.spreadsheet,text/csv';
      if (filterType === 'docs') mimeFilter = 'application/vnd.google-apps.document,application/pdf';
      if (filterType === 'images') mimeFilter = 'image/png,image/jpeg,image/webp';

      await openGoogleDrivePicker({
        allowedMimeTypes: mimeFilter,
        multiSelect: true,
        onSelect: async (files: SelectedDriveFile[]) => {
          setLoading(false);
          setStatusMessage({ 
            text: `Úspešne vybraných ${files.length} súborov z Google Drive.`, 
            type: 'success' 
          });

          // Save to Firestore
          for (const f of files) {
            try {
              await addDoc(collection(db, 'driveAttachments'), {
                ...f,
                category: fileCategory,
                createdAt: serverTimestamp(),
                addedBy: auth.currentUser?.email || 'Admin'
              });
            } catch (err) {
              console.warn('Firestore sync optional fallback: ', err);
            }
          }

          // Reload
          await loadSavedFiles();
        },
        onCancel: () => {
          setLoading(false);
          setStatusMessage(null);
        }
      });
    } catch (err: any) {
      setLoading(false);
      setStatusMessage({ 
        text: `Chyba pri otvorení Google Pickera: ${err.message || 'Overte OAuth súhlas'}`, 
        type: 'error' 
      });
    }
  };

  const handleDeleteFile = async (firestoreId?: string, localIndex?: number) => {
    if (firestoreId) {
      try {
        await deleteDoc(doc(db, 'driveAttachments', firestoreId));
        setAttachedFiles(prev => prev.filter(f => f.firestoreId !== firestoreId));
      } catch (err) {
        console.error(err);
      }
    } else if (localIndex !== undefined) {
      setAttachedFiles(prev => {
        const next = [...prev];
        next.splice(localIndex, 1);
        localStorage.setItem('usc_drive_files', JSON.stringify(next));
        return next;
      });
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1 text-xs font-black uppercase tracking-widest mb-2">
            <HardDrive className="w-3.5 h-3.5" /> Google Workspace Integration
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            Google <span className="text-blue-500">Drive Picker</span>
          </h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-1">
            Prepojenie s firemným úložiskom Google Drive na správu zmlúv, A1 certifikátov, fotiek vozidiel a faktúr
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-zinc-900 border-2 border-blue-500/60 text-blue-400 font-mono text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            OAuth 2.0: <span className="text-white font-black">{firebaseConfig.projectId}</span>
          </div>
        </div>
      </div>

      {/* Main Action Banner */}
      <div className="bg-zinc-900 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
              <FolderSearch className="w-5 h-5 text-blue-500" /> Vybrať alebo nahrať súbor z Google Drive
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Otvorte bezpečný Google Drive Picker a priraďte dôležité zmluvy (DE/AT zákazky), technické preukazy vozidiel flotily alebo firemné tabuľky priamo do portálu U.S.C.
            </p>
          </div>

          <button
            onClick={handleOpenPicker}
            disabled={loading}
            className="w-full lg:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            <FolderSearch className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Pripájam Drive...' : 'Otvoriť Google Drive Picker'}
          </button>
        </div>

        {/* Filters and Category Tagging */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800 text-xs">
          <div>
            <label className="block text-zinc-300 font-bold uppercase mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-400" /> Kategória ukladaného dokumentu:
            </label>
            <select
              value={fileCategory}
              onChange={(e) => setFileCategory(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white font-mono focus:border-blue-500 focus:outline-none"
            >
              <option value="Zmluvy a A1">Zmluvy a A1 formuláre (DE / AT Montáže)</option>
              <option value="Flotila & Autá">Vozidlá a Technické Preukazy (Rent a Wheel)</option>
              <option value="Faktúry & Účtovníctvo">Faktúry, Doklady & Finančné Výkazy</option>
              <option value="Marketing & Siete">Fotky, Videá a Virálne Materiály</option>
              <option value="Všeobecné">Iné interné dokumenty</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-300 font-bold uppercase mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Filter formátov v Pickeri:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-2 border font-bold uppercase text-[11px] flex-1 ${
                  filterType === 'all' ? 'bg-blue-600/30 border-blue-500 text-white' : 'bg-black/60 border-zinc-800 text-zinc-400'
                }`}
              >
                Všetky
              </button>
              <button
                onClick={() => setFilterType('pdf')}
                className={`px-3 py-2 border font-bold uppercase text-[11px] flex-1 ${
                  filterType === 'pdf' ? 'bg-blue-600/30 border-blue-500 text-white' : 'bg-black/60 border-zinc-800 text-zinc-400'
                }`}
              >
                PDF
              </button>
              <button
                onClick={() => setFilterType('sheets')}
                className={`px-3 py-2 border font-bold uppercase text-[11px] flex-1 ${
                  filterType === 'sheets' ? 'bg-blue-600/30 border-blue-500 text-white' : 'bg-black/60 border-zinc-800 text-zinc-400'
                }`}
              >
                Tabuľky
              </button>
              <button
                onClick={() => setFilterType('images')}
                className={`px-3 py-2 border font-bold uppercase text-[11px] flex-1 ${
                  filterType === 'images' ? 'bg-blue-600/30 border-blue-500 text-white' : 'bg-black/60 border-zinc-800 text-zinc-400'
                }`}
              >
                Fotky
              </button>
            </div>
          </div>
        </div>

        {/* Status Message Display */}
        {statusMessage && (
          <div className={`p-4 text-xs font-bold flex items-center gap-2 border ${
            statusMessage.type === 'success' ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' :
            statusMessage.type === 'error' ? 'bg-red-950/60 border-red-500/60 text-red-300' :
            'bg-blue-950/60 border-blue-500/60 text-blue-300'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Info className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Selected & Attached Files List */}
      <div className="bg-zinc-900 border-4 border-black p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-lg font-black uppercase text-white tracking-tight flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-500" /> Priradené Súbory z Google Drive ({attachedFiles.length})
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Dokumenty a materiály synchronizované z Google Drive účtu
            </p>
          </div>

          <button
            onClick={loadSavedFiles}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Obnoviť zoznam
          </button>
        </div>

        {attachedFiles.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 space-y-3">
            <FolderSearch className="w-12 h-12 mx-auto text-zinc-700 animate-pulse" />
            <div className="text-xs font-bold uppercase tracking-wider">
              Zatiaľ nie sú vybrané žiadne súbory
            </div>
            <p className="text-[11px] max-w-sm mx-auto text-zinc-500">
              Kliknite na tlačidlo vyššie a vyberte zmluvy alebo technické podklady priamo z vášho Google Drive.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachedFiles.map((file, idx) => (
              <div 
                key={file.firestoreId || file.id || idx}
                className="bg-black/60 border-2 border-zinc-800 hover:border-blue-500/60 p-4 transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {file.iconUrl ? (
                        <img src={file.iconUrl} alt="icon" className="w-5 h-5 shrink-0" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                      )}
                      <span className="text-xs font-black uppercase text-white tracking-tight line-clamp-1">
                        {file.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-950 border border-blue-800 text-blue-300 shrink-0">
                      {file.category || 'Všeobecné'}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-zinc-500 truncate">
                    MIME: {file.mimeType}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Otvoriť na Drive
                    </a>
                    <button
                      onClick={() => copyUrl(file.url, file.id || String(idx))}
                      className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3 text-blue-400" />
                      {copiedId === (file.id || String(idx)) ? 'Skopírované!' : 'Link'}
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteFile(file.firestoreId, idx)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Odstrániť priradenie"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
