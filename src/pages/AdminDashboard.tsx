import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { signOut, updatePassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { 
  LogOut, 
  LayoutDashboard, 
  Crown, 
  Car, 
  Briefcase, 
  Mail, 
  Settings, 
  Key, 
  CheckSquare, 
  ShieldAlert, 
  Cpu, 
  Users, 
  FileText, 
  Bot,
  DollarSign,
  Video,
  Cloud,
  HardDrive,
  Flame,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminProducts from '../components/admin/AdminProducts';
import AdminVehicles from '../components/admin/AdminVehicles';
import AdminPartners from '../components/admin/AdminPartners';
import AdminTasks from '../components/admin/AdminTasks';
import AdminSecretDeals from '../components/admin/AdminSecretDeals';
import AdminAuruLeads from '../components/admin/AdminAuruLeads';
import AdminTeamManagement from '../components/admin/AdminTeamManagement';
import AdminLegalContracts from '../components/admin/AdminLegalContracts';
import AdminGmailIntegration from '../components/admin/AdminGmailIntegration';
import AdminCloudflareDeploy from '../components/admin/AdminCloudflareDeploy';
import AdminAIAcquisitionEngine from '../components/admin/AdminAIAcquisitionEngine';
import AdminSocialCashEngine from '../components/admin/AdminSocialCashEngine';
import AdminGoogleDrivePicker from '../components/admin/AdminGoogleDrivePicker';
import AdminAutonomousSelfFundingEngine from '../components/admin/AdminAutonomousSelfFundingEngine';
import EarningsOverviewWidget from '../components/admin/EarningsOverviewWidget';
import Auru369MonitorWidget from '../components/admin/Auru369MonitorWidget';
import RealtimeInventoryFleetWidget from '../components/admin/RealtimeInventoryFleetWidget';
import AdminGlitchNotificationBar from '../components/admin/AdminGlitchNotificationBar';
import MatrixDispatchConsole from '../components/ai/MatrixDispatchConsole';
import Ritual369 from '../components/Ritual369';
import Matrix369Visualizer from '../components/Matrix369Visualizer';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    'earningsOverview' | 'inventoryMonitor' | 'auru369Monitor' | 'ritual369' | 'selfFunding' | 'drivePicker' | 'socialCash' | 'revenueEngine' | 'aiDispatch' | 'gmail' | 'cloudflare' | 'shop' | 'rent' | 'work' | 'tasks' | 'trade' | 'leads' | 'team' | 'contracts' | 'earlyAccess' | 'settings'
  >('earningsOverview');
  const [auruStatus, setAuruStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'>('CONNECTED');
  const [leads, setLeads] = useState<any[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus('Heslo musí mať aspoň 6 znakov.');
      return;
    }
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setPasswordStatus('Heslo bolo úspešne zmenené!');
        setNewPassword('');
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        setPasswordStatus('Z bezpečnostných dôvodov je nutné sa znova prihlásiť pred zmenou hesla.');
      } else {
        setPasswordStatus('Chyba pri zmene hesla.');
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'earlyAccess') {
      const fetchLeads = async () => {
        try {
          const q = query(collection(db, 'earlyAccess'), orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setLeads(data);
        } catch (error) {
          console.error("Error fetching leads:", error);
        }
      };
      fetchLeads();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-zinc-900 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col">
        <div className="p-6 border-b-4 border-black bg-black">
          <div className="inline-block bg-red-600 text-white px-2 py-1 font-black uppercase text-xs mb-2 tracking-widest border border-white">
            /// U.S.C ADMIN
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Centrála</h2>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 py-1">
            AI Samofinancovanie & Charita
          </div>

          <button 
            onClick={() => setActiveTab('earningsOverview')}
            className={`flex items-center gap-3 w-full text-left p-3 font-black uppercase tracking-widest border-2 transition-all ${activeTab === 'earningsOverview' ? 'bg-emerald-500 border-black text-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]' : 'border-transparent text-emerald-400 hover:text-white hover:border-emerald-500'}`}
          >
            <DollarSign className="w-5 h-5 animate-pulse" /> 📈 Prehľad Zárobkov (Promo)
          </button>

          <button 
            onClick={() => setActiveTab('inventoryMonitor')}
            className={`flex items-center gap-3 w-full text-left p-3 font-black uppercase tracking-widest border-2 transition-all ${activeTab === 'inventoryMonitor' ? 'bg-amber-400 border-black text-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]' : 'border-transparent text-amber-400 hover:text-white hover:border-amber-400'}`}
          >
            <BarChart3 className="w-5 h-5 animate-pulse" /> 📊 Sklad & Flotila (Live Chart)
          </button>

          <button 
            onClick={() => setActiveTab('selfFunding')}
            className={`flex items-center gap-3 w-full text-left p-3 font-black uppercase tracking-widest border-2 transition-all ${activeTab === 'selfFunding' ? 'bg-amber-500 border-black text-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]' : 'border-transparent text-amber-400 hover:text-white hover:border-amber-500'}`}
          >
            <DollarSign className="w-5 h-5" /> 💸 AI Zarábanie & Charita
          </button>

          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 py-1 mt-2">
            Google Workspace & Cloud
          </div>

          <button 
            onClick={() => setActiveTab('drivePicker')}
            className={`flex items-center gap-3 w-full text-left p-3 font-black uppercase tracking-widest border-2 transition-all ${activeTab === 'drivePicker' ? 'bg-blue-600 border-black text-white shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]' : 'border-transparent text-blue-400 hover:text-white hover:border-blue-500'}`}
          >
            <HardDrive className="w-5 h-5" /> 📁 Google Drive Picker
          </button>

          <button 
            onClick={() => setActiveTab('gmail')}
            className={`flex items-center gap-3 w-full text-left p-3 font-black uppercase tracking-widest border-2 transition-all ${activeTab === 'gmail' ? 'bg-red-600 border-black text-white shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]' : 'border-transparent text-red-400 hover:text-white hover:border-red-500'}`}
          >
            <Mail className="w-5 h-5" /> ✉️ Gmail Komunikácia
          </button>

          <button 
            onClick={() => setActiveTab('cloudflare')}
            className={`flex items-center gap-3 w-full text-left p-3 font-black uppercase tracking-widest border-2 transition-all ${activeTab === 'cloudflare' ? 'bg-orange-600 border-black text-white shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]' : 'border-transparent text-orange-400 hover:text-white hover:border-orange-500'}`}
          >
            <Cloud className="w-5 h-5" /> ☁️ Cloudflare Edge
          </button>

          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 py-1 mt-2">
            AI & Monetizácia
          </div>

          <button 
            onClick={() => setActiveTab('socialCash')}
            className={`flex items-center gap-3 w-full text-left p-3 font-black uppercase tracking-widest border-2 transition-all ${activeTab === 'socialCash' ? 'bg-pink-600 border-black text-white shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]' : 'border-transparent text-pink-400 hover:text-white hover:border-pink-500'}`}
          >
            <Video className="w-5 h-5" /> 📱 TikTok & Reels Cash
          </button>

          <button 
            onClick={() => setActiveTab('revenueEngine')}
            className={`flex items-center gap-3 w-full text-left p-3 font-black uppercase tracking-widest border-2 transition-all ${activeTab === 'revenueEngine' ? 'bg-emerald-600 border-black text-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]' : 'border-transparent text-emerald-400 hover:text-white hover:border-emerald-500'}`}
          >
            <DollarSign className="w-5 h-5" /> 💰 B2B Lead Hunter
          </button>

          <button 
            onClick={() => setActiveTab('aiDispatch')}
            className={`flex items-center gap-3 w-full text-left p-3 font-black uppercase tracking-widest border-2 transition-all ${activeTab === 'aiDispatch' ? 'bg-amber-500 border-black text-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]' : 'border-transparent text-amber-400 hover:text-white hover:border-amber-500'}`}
          >
            <Bot className="w-5 h-5 animate-pulse" /> 🧠 AI Matrix Dispečing
          </button>

          <button 
            onClick={() => setActiveTab('auru369Monitor')}
            className={`flex items-center justify-between w-full text-left p-3 font-black uppercase tracking-widest border-2 transition-all ${
              activeTab === 'auru369Monitor' 
                ? 'bg-red-600 border-black text-white shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]' 
                : auruStatus === 'DISCONNECTED'
                  ? 'bg-red-950/80 border-red-500 text-red-300 glitch-box'
                  : 'border-transparent text-red-400 hover:text-white hover:border-red-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <Cpu className={`w-5 h-5 ${auruStatus === 'DISCONNECTED' ? 'animate-bounce text-red-400' : ''}`} /> 
              <span>⚡ 369 Trinity Monitor</span>
            </div>
            {auruStatus === 'DISCONNECTED' && (
              <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 border border-white glitch-text">
                GLITCH
              </span>
            )}
          </button>

          <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 px-3 py-1 mt-2">
            🔮 Majiteľ & Garáž 369 (Privátne)
          </div>

          <button 
            onClick={() => setActiveTab('ritual369')}
            className={`flex items-center gap-3 w-full text-left p-3 font-black uppercase tracking-widest border-2 transition-all ${activeTab === 'ritual369' ? 'bg-amber-500 border-black text-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]' : 'border-transparent text-amber-400 hover:text-white hover:border-amber-500'}`}
          >
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" /> 🔥 369 Secret Vault
          </button>

          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 py-1 mt-2">
            Piliere U.S.C.
          </div>

          <button 
            onClick={() => setActiveTab('earlyAccess')}
            className={`flex items-center gap-3 w-full text-left p-3 font-bold uppercase tracking-widest border-2 transition-all ${activeTab === 'earlyAccess' ? 'bg-red-600 border-black text-white' : 'border-transparent text-zinc-500 hover:text-white hover:border-zinc-700'}`}
          >
            <Mail className="w-5 h-5" /> Zoznam Čakateľov
          </button>
          
          <button 
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-3 w-full text-left p-3 font-bold uppercase tracking-widest border-2 transition-all ${activeTab === 'shop' ? 'bg-amber-500 border-black text-black' : 'border-transparent text-zinc-500 hover:text-white hover:border-zinc-700'}`}
          >
            <Crown className="w-5 h-5" /> Produkty (U.S.W)
          </button>

          <button 
            onClick={() => setActiveTab('rent')}
            className={`flex items-center gap-3 w-full text-left p-3 font-bold uppercase tracking-widest border-2 transition-all ${activeTab === 'rent' ? 'bg-zinc-100 border-black text-black' : 'border-transparent text-zinc-500 hover:text-white hover:border-zinc-700'}`}
          >
            <Car className="w-5 h-5" /> Vozidlá (Rent)
          </button>

          <button 
            onClick={() => setActiveTab('work')}
            className={`flex items-center gap-3 w-full text-left p-3 font-bold uppercase tracking-widest border-2 transition-all ${activeTab === 'work' ? 'bg-blue-500 border-black text-white' : 'border-transparent text-zinc-500 hover:text-white hover:border-zinc-700'}`}
          >
            <Briefcase className="w-5 h-5" /> Partneri (Work)
          </button>

          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-3 w-full text-left p-3 font-bold uppercase tracking-widest border-2 transition-all ${activeTab === 'tasks' ? 'bg-white border-black text-black' : 'border-transparent text-zinc-500 hover:text-white hover:border-zinc-700'}`}
          >
            <CheckSquare className="w-5 h-5" /> Úlohy (Tasks)
          </button>

          <button 
            onClick={() => setActiveTab('trade')}
            className={`flex items-center gap-3 w-full text-left p-3 font-bold uppercase tracking-widest border-2 transition-all ${activeTab === 'trade' ? 'bg-red-600 border-black text-white' : 'border-transparent text-zinc-500 hover:text-white hover:border-zinc-700'}`}
          >
            <ShieldAlert className="w-5 h-5" /> Trade (Tajné Zákazky)
          </button>

          <button 
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-3 w-full text-left p-3 font-bold uppercase tracking-widest border-2 transition-all ${activeTab === 'leads' ? 'bg-amber-500 border-black text-black' : 'border-transparent text-zinc-500 hover:text-white hover:border-zinc-700'}`}
          >
            <Cpu className="w-5 h-5" /> Ecosystem Dopyty
          </button>

          <button 
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-3 w-full text-left p-3 font-bold uppercase tracking-widest border-2 transition-all ${activeTab === 'team' ? 'bg-emerald-500 border-black text-black' : 'border-transparent text-zinc-500 hover:text-white hover:border-zinc-700'}`}
          >
            <Users className="w-5 h-5" /> Správa Admin Tímu
          </button>

          <button 
            onClick={() => setActiveTab('contracts')}
            className={`flex items-center gap-3 w-full text-left p-3 font-bold uppercase tracking-widest border-2 transition-all ${activeTab === 'contracts' ? 'bg-amber-400 border-black text-black' : 'border-transparent text-zinc-500 hover:text-white hover:border-zinc-700'}`}
          >
            <FileText className="w-5 h-5" /> Zmluvy & GDPR
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 w-full text-left p-3 font-bold uppercase tracking-widest border-2 transition-all mt-4 ${activeTab === 'settings' ? 'bg-zinc-700 border-black text-white' : 'border-transparent text-zinc-500 hover:text-white hover:border-zinc-700'}`}
          >
            <Settings className="w-5 h-5" /> Účet
          </button>
        </nav>

        <div className="p-4 border-t-4 border-black bg-zinc-950">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-zinc-900 border-2 border-zinc-700 text-zinc-400 hover:text-white hover:border-red-600 font-bold uppercase tracking-widest transition-colors"
          >
            <LogOut className="w-5 h-5" /> Odhlásiť sa
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Real-time Auru_Trinity Glitch Notification & Top Navigation Bar */}
        <AdminGlitchNotificationBar 
          onStatusChange={setAuruStatus} 
          onNavigateToMonitor={() => setActiveTab('auru369Monitor')} 
        />

        {/* Scrollable Tab Views */}
        <div className="flex-1 p-6 md:p-12 overflow-y-auto">
          
          {activeTab === 'earningsOverview' && (
            <div className="space-y-8">
              <Auru369MonitorWidget />
              <RealtimeInventoryFleetWidget 
                onNavigateToShop={() => setActiveTab('shop')} 
                onNavigateToRent={() => setActiveTab('rent')} 
              />
              <EarningsOverviewWidget />
            </div>
          )}

          {activeTab === 'inventoryMonitor' && (
            <div className="space-y-6">
              <RealtimeInventoryFleetWidget 
                onNavigateToShop={() => setActiveTab('shop')} 
                onNavigateToRent={() => setActiveTab('rent')} 
              />
            </div>
          )}

        {activeTab === 'auru369Monitor' && (
          <div className="space-y-6">
            <Auru369MonitorWidget />
          </div>
        )}

        {activeTab === 'ritual369' && (
          <div className="space-y-8">
            {/* Private Header */}
            <div className="border-b-4 border-black pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-black to-zinc-900 p-6 border-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 font-mono text-xs font-black uppercase tracking-widest -rotate-1 border border-white mb-2">
                  <Flame className="w-3.5 h-3.5" /> PRIVÁTNY KÓD MAJITEĽA // GARÁŽ 369
                </div>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
                  369 Secret <span className="text-amber-500">Vault & Ritual</span>
                </h1>
                <p className="text-zinc-400 font-bold uppercase tracking-wider text-xs mt-1">
                  Exkluzívna manifestačná matrica a mentálny kompas vyhradený výhradne pre tvoje impérium a osobný rast.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-black border-2 border-amber-500/60 px-4 py-2 font-mono text-xs text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>FREKVENCIA 369/639/963 HZ AKTÍVNA</span>
              </div>
            </div>

            {/* Matrix 369 Visualizer */}
            <Matrix369Visualizer />

            {/* Full 369 Ritual Matrix Engine */}
            <div className="mt-8">
              <Ritual369 />
            </div>
          </div>
        )}

        {activeTab === 'selfFunding' && (
          <div className="space-y-8">
            <EarningsOverviewWidget compact />
            <AdminAutonomousSelfFundingEngine />
          </div>
        )}

        {activeTab === 'drivePicker' && (
          <AdminGoogleDrivePicker />
        )}

        {activeTab === 'socialCash' && (
          <AdminSocialCashEngine />
        )}

        {activeTab === 'revenueEngine' && (
          <AdminAIAcquisitionEngine />
        )}

        {activeTab === 'gmail' && (
          <AdminGmailIntegration />
        )}

        {activeTab === 'cloudflare' && (
          <AdminCloudflareDeploy />
        )}

        {activeTab === 'aiDispatch' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                  <Bot className="w-8 h-8 text-amber-500" /> AURU Matrix <span className="text-amber-500">Centrálny AI Dispečing</span>
                </h1>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-1">
                  Operačný mozog prepojený na 6 pilierov U.S.C. • Poháňaný Google Gemini 3.7 Flash
                </p>
              </div>

              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 font-mono text-xs text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>NEURAL BUS ONLINE // 3.69</span>
              </div>
            </div>

            <MatrixDispatchConsole initialPillar="ALL_PILLARS" />
          </div>
        )}

        {activeTab === 'earlyAccess' && (
          <div>
            <h1 className="text-4xl font-black uppercase mb-2">Early Access Leads</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest mb-8">Zoznam ľudí, ktorí čakajú na spustenie</p>
            
            <div className="bg-zinc-900 border-4 border-black overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-4 border-black bg-black text-zinc-400 font-black uppercase text-sm">
                    <th className="p-4">Email</th>
                    <th className="p-4">Zdroj</th>
                    <th className="p-4">Čas registrácie</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="p-4 font-medium">{lead.email}</td>
                      <td className="p-4 text-zinc-500 uppercase">{lead.source}</td>
                      <td className="p-4 text-zinc-500">
                        {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-zinc-500 font-bold uppercase">
                        Zatiaľ žiadne kontakty
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'shop' && <AdminProducts />}
        {activeTab === 'rent' && <AdminVehicles />}
        {activeTab === 'work' && <AdminPartners />}
        {activeTab === 'tasks' && <AdminTasks />}
        {activeTab === 'trade' && <AdminSecretDeals />}
        {activeTab === 'leads' && <AdminAuruLeads />}
        {activeTab === 'team' && <AdminTeamManagement />}
        {activeTab === 'contracts' && <AdminLegalContracts />}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-4xl font-black uppercase mb-2 text-zinc-300">Nastavenia Účtu</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest mb-8">Zmena hesla k administrátorskému účtu</p>
            
            <div className="bg-zinc-900 border-4 border-black p-8 max-w-md">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                <Key className="w-6 h-6 text-zinc-400" /> Zmeniť heslo
              </h2>
              
              {passwordStatus && (
                <div className={`p-4 mb-6 font-bold uppercase tracking-widest text-sm border-2 ${passwordStatus.includes('Z bezpečnostných') || passwordStatus.includes('Chyba') || passwordStatus.includes('musí mať') ? 'bg-black border-red-600 text-red-500' : 'bg-black border-green-600 text-green-500'}`}>
                  {passwordStatus}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nové heslo"
                  className="bg-zinc-950 border-2 border-zinc-800 p-4 text-white font-bold uppercase placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
                />
                <button 
                  type="submit"
                  className="w-full py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-zinc-300 transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Uložiť zmenu
                </button>
              </form>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
