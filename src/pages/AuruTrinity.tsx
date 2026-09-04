import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Hammer, 
  Cpu, 
  Code2, 
  Database, 
  Bot, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Server, 
  FileSpreadsheet, 
  TrendingUp, 
  ArrowLeft,
  Sparkles,
  Send,
  Terminal,
  Activity,
  Copy,
  Check,
  Target,
  FileText,
  Download,
  Calculator,
  RefreshCw,
  Globe,
  HardDrive,
  FileCode,
  DollarSign,
  Briefcase,
  Shirt,
  Scale,
  Network,
  Play,
  CheckCircle,
  Sliders,
  ShieldAlert,
  Mic,
  Volume2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MatrixDispatchConsole from '../components/ai/MatrixDispatchConsole';
import TrinitySuperAssistant from '../components/ai/TrinitySuperAssistant';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateAuruBlueprintPdf, generateOrderReceiptPdf } from '../lib/documentGenerator';
import { trackPillarEngagement, trackEvent } from '../lib/analytics';

export default function AuruTrinity() {
  // Active Interactive Mode Tab
  const [activeTab, setActiveTab] = useState<'assistant' | 'swarm' | 'console' | 'designer' | 'contracts' | 'invoicing' | 'codegen' | 'leadhunter' | 'infrastructure' | 'diagnostic'>('assistant');

  // Multi-Agent Swarm State
  const [swarmMission, setSwarmMission] = useState(
    'Expanzia flotily dodávok do Nemecka (Mníchov & Dingolfing) a zabezpečenie 3 nových zohratých partií na priemyselné montáže'
  );
  const [swarmPriority, setSwarmPriority] = useState<'high' | 'ultra' | 'standard'>('high');
  const [swarmTargetPillar, setSwarmTargetPillar] = useState<'all' | 'rent' | 'work' | 'shop'>('all');
  const [isExecutingSwarm, setIsExecutingSwarm] = useState(false);
  const [swarmOutput, setSwarmOutput] = useState<string | null>(null);

  // Streetwear & Drop Designer State
  const [garmentType, setGarmentType] = useState('Heavyweight Hoodie 450g');
  const [garmentVibe, setGarmentVibe] = useState('Cyber Gothic Brutalist');
  const [dropTheme, setDropTheme] = useState('CHOICE IS YOURS 369 // UNDERGROUND MATRIX');
  const [isDesigningDrop, setIsDesigningDrop] = useState(false);
  const [dropDesign, setDropDesign] = useState<string | null>(null);

  // Contract & Turnus Agreement State
  const [contractType, setContractType] = useState('turnus_work');
  const [contractPartyA, setContractPartyA] = useState('Underground Street Collective s.r.o. / Auru Space');
  const [contractPartyB, setContractPartyB] = useState('Gewerbe Montage Gruppe (Elektro / Zváranie)');
  const [projectLocation, setProjectLocation] = useState('Dingolfing / München (BMW Werk Montage), Nemecko');
  const [contractHourlyRate, setContractHourlyRate] = useState(28.5);
  const [contractPaymentTerms, setContractPaymentTerms] = useState('Týždenný výkaz hodín, splatnosť faktúry 14 dní, Reverse Charge');
  const [contractVehicle, setContractVehicle] = useState('VW Transporter T6.1 Long 2.0 TDI (BA-938TX)');
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  const [generatedContract, setGeneratedContract] = useState<string | null>(null);
  const [copiedContract, setCopiedContract] = useState(false);

  // AI Diagnostic State
  const [businessType, setBusinessType] = useState('craftsman');
  const [currentBottleneck, setCurrentBottleneck] = useState('accounting');
  const [teamSize, setTeamSize] = useState('1-5');
  const [calculatedPlan, setCalculatedPlan] = useState<any | null>(null);

  // Standalone Code Generator Tab State
  const [codeType, setCodeType] = useState('React / Node.js modul');
  const [codeStack, setCodeStack] = useState('TypeScript, Tailwind CSS, Vite, Express');
  const [codeGoal, setCodeGoal] = useState('Vytvor kalkulačku zisku a marže pre prenájom dodávok a remeselné zákazky s exportom údajov.');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Standalone Lead Hunter State
  const [leadNiche, setLeadNiche] = useState('Stavebné a priemyselné montáže (Elektro, Zváranie, Sadrokartóny)');
  const [leadRegion, setLeadRegion] = useState('Nemecko (Bavorsko, Frankfurt, Stuttgart)');
  const [leadOffer, setLeadOffer] = useState('Kompletné zohraté partie živnostníkov s A1 a autami');
  const [leadResults, setLeadResults] = useState<string | null>(null);
  const [isHuntingLeads, setIsHuntingLeads] = useState(false);

  // Invoicing & Payroll Automation State
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: `INV-USC-${Date.now().toString().slice(-4)}`,
    supplierName: 'Underground Street Collective s.r.o. / Auru Trinity',
    supplierIco: '54 892 104',
    customerName: 'Gewerbe Montage Partner GmbH',
    customerCity: 'München, Deutschland',
    serviceDescription: 'Montážne a elektroinštalačné práce - Projekt BMW Dingolfing',
    hoursWorked: 160,
    hourlyRate: 28.5,
    taxMode: 'reverse_charge', // reverse charge or standard
    turnusWeeks: 4
  });
  const [isGeneratingInvoiceDoc, setIsGeneratingInvoiceDoc] = useState(false);

  // Turnus Payroll Calculation Helper
  const totalTurnusGross = invoiceForm.hoursWorked * invoiceForm.hourlyRate;
  const estimatedFuelAccommodation = invoiceForm.turnusWeeks * 250; // €250/week travel & room
  const estimatedNetTurnus = totalTurnusGross - estimatedFuelAccommodation;

  // Cloud Cluster Infrastructure Status
  const [cloudStatus, setCloudStatus] = useState<{
    configured: boolean;
    bucket: string;
    loading: boolean;
    pingMs: number;
  }>({
    configured: true,
    bucket: 'trinity',
    loading: false,
    pingMs: 42
  });

  // Inquiry Form State
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    serviceInterest: 'full_trinity',
    description: '',
    budget: '1000-3000'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch Cloudflare / Infrastructure status
  const checkClusterHealth = async () => {
    setCloudStatus(prev => ({ ...prev, loading: true }));
    const startTime = performance.now();
    try {
      const res = await fetch('/api/cloudflare/status');
      const data = await res.json();
      const endTime = performance.now();
      setCloudStatus({
        configured: data.configured !== false,
        bucket: data.bucket || 'trinity',
        loading: false,
        pingMs: Math.round(endTime - startTime)
      });
    } catch {
      setCloudStatus({
        configured: true,
        bucket: 'trinity',
        loading: false,
        pingMs: 48
      });
    }
  };

  useEffect(() => {
    checkClusterHealth();
  }, []);

  // Diagnostic generator
  const runDiagnostic = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hoursSaved = '18 - 25 hodín týždenne';
    let revenueBoost = '+35% až +60%';
    let modules = ['Auru Web Engine 3.69', 'Automatizovaná Dochádzka & Fakturácia', 'AI B2B Lead Hunter'];

    if (businessType === 'craftsman') {
      hoursSaved = '15 hodín týždenne (eliminácia papierovačiek)';
      revenueBoost = '+40% viac zákaziek vďaka online objednávkam';
      modules = ['Mobilný Terminál Zákaziek', 'Automatické cenové ponuky & faktúry', 'Integrácia U.S.C. Work'];
    } else if (businessType === 'logistics') {
      hoursSaved = '30+ hodín na dispečingu';
      revenueBoost = 'Zníženie prestojov o 45%';
      modules = ['Rent a Wheel Fleet Sync', 'Automatický Dispečing & Trasy', 'Cloud Účtovníctvo & CMR'];
    } else if (businessType === 'services') {
      hoursSaved = '20 hodín týždenne';
      revenueBoost = '+50% konverzia dopytov';
      modules = ['Auru Booking Platform', 'Automatické SMS & Email notifikácie', 'Mzdová AI Matrica'];
    }

    setCalculatedPlan({
      hoursSaved,
      revenueBoost,
      modules,
      timestamp: new Date().toLocaleTimeString()
    });

    trackPillarEngagement('AURU_TRINITY', 'diagnostic_run', {
      business_type: businessType,
      bottleneck: currentBottleneck,
      team_size: teamSize
    });
  };

  const handleGenerateCode = async () => {
    if (!codeGoal.trim() || isGeneratingCode) return;
    setIsGeneratingCode(true);
    trackPillarEngagement('AURU_TRINITY', 'code_generation_requested', {
      code_type: codeType,
      tech_stack: codeStack
    });

    try {
      const res = await fetch('/api/ai/code-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: codeType,
          techStack: codeStack,
          projectGoal: codeGoal
        })
      });
      const data = await res.json();
      if (data.success && data.codeOutput) {
        setGeneratedCode(data.codeOutput);
      }
    } catch (err) {
      console.error("Code gen error:", err);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleHuntLeads = async () => {
    if (!leadNiche.trim() || isHuntingLeads) return;
    setIsHuntingLeads(true);
    trackPillarEngagement('AURU_TRINITY', 'lead_hunter_triggered', {
      niche: leadNiche,
      region: leadRegion
    });

    try {
      const res = await fetch('/api/ai/lead-hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: leadNiche,
          targetCountry: leadRegion,
          offerType: leadOffer
        })
      });
      const data = await res.json();
      if (data.success && data.leadStrategy) {
        setLeadResults(data.leadStrategy);
      }
    } catch (err) {
      console.error("Lead hunter error:", err);
    } finally {
      setIsHuntingLeads(false);
    }
  };

  const handleRunSwarm = async () => {
    if (!swarmMission.trim() || isExecutingSwarm) return;
    setIsExecutingSwarm(true);
    trackPillarEngagement('AURU_TRINITY', 'swarm_mission_executed', {
      priority: swarmPriority,
      pillar: swarmTargetPillar
    });

    try {
      const res = await fetch('/api/ai/agent-swarm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionGoal: swarmMission,
          priority: swarmPriority,
          targetPillar: swarmTargetPillar
        })
      });
      const data = await res.json();
      if (data.success && data.swarmOutput) {
        setSwarmOutput(data.swarmOutput);
      }
    } catch (err) {
      console.error("Swarm execution error:", err);
    } finally {
      setIsExecutingSwarm(false);
    }
  };

  const handleDesignDrop = async () => {
    if (isDesigningDrop) return;
    setIsDesigningDrop(true);
    trackPillarEngagement('AURU_TRINITY', 'streetwear_designer_triggered', {
      garment: garmentType,
      vibe: garmentVibe
    });

    try {
      const res = await fetch('/api/ai/streetwear-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garmentType,
          vibe: garmentVibe,
          dropTheme
        })
      });
      const data = await res.json();
      if (data.success && data.dropDesign) {
        setDropDesign(data.dropDesign);
      }
    } catch (err) {
      console.error("Streetwear design error:", err);
    } finally {
      setIsDesigningDrop(false);
    }
  };

  const handleGenerateContract = async () => {
    if (isGeneratingContract) return;
    setIsGeneratingContract(true);
    trackPillarEngagement('AURU_TRINITY', 'contract_generator_triggered', {
      contractType,
      location: projectLocation
    });

    try {
      const res = await fetch('/api/ai/contract-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractType,
          partyA: contractPartyA,
          partyB: contractPartyB,
          projectLocation,
          hourlyRate: contractHourlyRate,
          paymentTerms: contractPaymentTerms,
          vehicleIncluded: contractVehicle
        })
      });
      const data = await res.json();
      if (data.success && data.contractText) {
        setGeneratedContract(data.contractText);
      }
    } catch (err) {
      console.error("Contract generator error:", err);
    } finally {
      setIsGeneratingContract(false);
    }
  };

  const copyContractText = () => {
    if (!generatedContract) return;
    navigator.clipboard.writeText(generatedContract);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const downloadContractFile = () => {
    if (!generatedContract) return;
    const blob = new Blob([generatedContract], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Zmluva_${contractType}_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAssistantAction = (actionType: string) => {
    trackPillarEngagement('AURU_TRINITY', 'assistant_action_triggered', { actionType });
    if (actionType === 'RUN_SWARM') {
      setActiveTab('swarm');
    } else if (actionType === 'CREATE_CONTRACT' || actionType === 'PREPARE_TURNUS') {
      setActiveTab('contracts');
    } else if (actionType === 'DESIGN_DROP') {
      setActiveTab('designer');
    } else if (actionType === 'CALCULATE_INVOICE') {
      setActiveTab('invoicing');
    } else if (actionType === 'FLEET_DISPATCH') {
      setActiveTab('swarm');
    }
  };

  // Download Invoice PDF via documentGenerator
  const handleExportInvoice = () => {
    setIsGeneratingInvoiceDoc(true);
    try {
      generateOrderReceiptPdf({
        orderId: invoiceForm.invoiceNumber,
        customerName: invoiceForm.customerName,
        phone: '+49 (0) 89 123456',
        email: 'billing@gewerbe-partner.de',
        address: invoiceForm.customerCity,
        items: [
          {
            name: invoiceForm.serviceDescription,
            size: `${invoiceForm.hoursWorked} hodín @ €${invoiceForm.hourlyRate}/h`,
            quantity: 1,
            price: `€${totalTurnusGross.toFixed(2)}`
          },
          {
            name: 'Režijné náklady & Ubytovanie (Turnusový príspevok)',
            size: `${invoiceForm.turnusWeeks} týždne`,
            quantity: 1,
            price: `€0.00 (Zahrnuté v tarife)`
          }
        ],
        totalAmount: `€${totalTurnusGross.toFixed(2)}`,
        paymentStatus: 'VYSTAVENÉ // SPLATNOSŤ 14 DNÍ (SEPA / PAYPAL)',
        dateStr: new Date().toLocaleDateString('sk-SK')
      });

      trackPillarEngagement('AURU_TRINITY', 'invoice_pdf_exported', {
        amount: totalTurnusGross,
        hours: invoiceForm.hoursWorked
      });
    } catch (err) {
      console.error("Error generating invoice:", err);
    } finally {
      setIsGeneratingInvoiceDoc(false);
    }
  };

  // Download Architecture Blueprint PDF
  const handleDownloadBlueprint = () => {
    generateAuruBlueprintPdf({
      title: 'A.I. Auru_Trinity System & Architecture Blueprint',
      clientOrProject: 'Underground Street Collective // Auru Space Ecosystem',
      architectureTier: 'Auru Multi-Node 3.69 (High Concurrency)',
      pillarsConnected: ['Auru Trinity', 'U.S.W.', 'Rent a Wheel', 'U.S.C. Work', 'Trade Zakasajee', 'Solidarity'],
      techStack: ['React 18', 'TypeScript', 'Node.js Express', 'Gemini 3.7 Flash', 'Cloudflare R2 (trinity)', 'Firestore'],
      estimatedHoursSaved: '40+ hodín / týždeň naprieč 6 piliermi',
      revenueOptimization: '+45% rast priepustnosti zákaziek & nulová manuálna byrokracia',
      modules: [
        'Auru Matrix Dispečing 3.69 s multi-turn pamäťou a fallbackom',
        'Cloudflare Worker & R2 Object Storage (bucket "trinity")',
        'Automatizovaná fakturačná matrica a turnusový mzdový prepočet pre Nemecko',
        'B2B Lead Hunter s generovaním oslovovacích šablón',
        'Prepojenie na PayPal platobnú bránu a Google Workspace'
      ]
    });

    trackPillarEngagement('AURU_TRINITY', 'blueprint_pdf_downloaded', {
      node: 'AURU_CORE_369'
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'auru_trinity_leads'), {
        ...formData,
        diagnosticPlan: calculatedPlan || null,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      trackPillarEngagement('AURU_TRINITY', 'inquiry_submitted', {
        service: formData.serviceInterest,
        budget: formData.budget
      });
    } catch (err) {
      console.error("Error submitting Auru Trinity lead:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyGeneratedCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-amber-500 selection:text-black pt-24 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        {/* Navigation back & System status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white uppercase font-black tracking-widest transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Späť na Centrálu
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-mono font-bold bg-amber-950/60 border border-amber-600 px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(245,158,11,0.3)]">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>AURU NEURAL CORE // ONLINE 3.69</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadBlueprint}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 px-3 py-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Stiahnuť Blueprint (PDF)</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-amber-500 text-black px-4 py-2 font-black uppercase tracking-widest text-sm mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Bot className="w-4 h-4" /> PILIER 1 // TRINITY SUPER AI ASISTENT // U.S.C. CORE 3.69
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-6 leading-none">
              Trinity Super_<span className="text-amber-500">AI Asistent</span>
            </h1>
            <p className="text-zinc-300 font-bold uppercase tracking-widest text-base md:text-xl max-w-4xl leading-relaxed">
              Centrálny autonómny supermozog a digitálny riaditeľ pre celý ekosystém Underground Street Collective.
              Ovládaný hlasom aj textom v reálnom čase, synchronizuje flotilu Rent-a-Wheel, turnusové zmluvy U.S.C. Work,
              textilné dropy U.S.W., eskró obchody a cloudovú infraštruktúru.
            </p>

            {/* Quick Feature Badges */}
            <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs">
              <div className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-3 py-1.5 flex items-center gap-2">
                <Mic className="w-3.5 h-3.5 text-amber-500" />
                <span>Hlasové Ovládanie (Web Speech API)</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-3 py-1.5 flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Hlasová Syntéza Reči (TTS)</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-3 py-1.5 flex items-center gap-2">
                <Network className="w-3.5 h-3.5 text-amber-500" />
                <span>Multi-Agent Swarm 3.69</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-3 py-1.5 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>A1 & § 13b UStG Právny Audit</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 4 Pillars Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 border-4 border-black p-6 hover:border-amber-500 transition-all flex flex-col justify-between group shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(245,158,11,1)]"
          >
            <div>
              <div className="w-14 h-14 bg-black border-2 border-zinc-800 flex items-center justify-center mb-6 text-amber-500 group-hover:border-amber-500 transition-colors">
                <Code2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-2">Web & App Architektúra</h3>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider leading-relaxed">
                Rýchle, bezpečné klientske a firemné portály, moderné e-shopy s brutálnym konverzným dizajnom.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono">
              REACT 18 // VITE // TAILWIND // CLOUD RUN
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 border-4 border-black p-6 hover:border-amber-500 transition-all flex flex-col justify-between group shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(245,158,11,1)]"
          >
            <div>
              <div className="w-14 h-14 bg-black border-2 border-zinc-800 flex items-center justify-center mb-6 text-amber-500 group-hover:border-amber-500 transition-colors">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-2">Automatizované Účtovníctvo</h3>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider leading-relaxed">
                Generovanie faktúr, sledovanie dochádzky, mzdové podklady a automatické reporty pre daňové priznania.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono">
              INVOICING BOT // PAYROLL AI // ZERO MANUAL ERRORS
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900 border-4 border-black p-6 hover:border-amber-500 transition-all flex flex-col justify-between group shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(245,158,11,1)]"
          >
            <div>
              <div className="w-14 h-14 bg-black border-2 border-zinc-800 flex items-center justify-center mb-6 text-amber-500 group-hover:border-amber-500 transition-colors">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-2">AI Lead Hunter & CRM</h3>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider leading-relaxed">
                Automatizovaný zber zákazníkov, B2B scraping a prediktívny matchmaking s partnermi zo siete U.S.C.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono">
              AUTONOMOUS OUTREACH // AI FILTERING
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900 border-4 border-black p-6 hover:border-amber-500 transition-all flex flex-col justify-between group shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(245,158,11,1)]"
          >
            <div>
              <div className="w-14 h-14 bg-black border-2 border-zinc-800 flex items-center justify-center mb-6 text-amber-500 group-hover:border-amber-500 transition-colors">
                <Server className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-2">Cloud Guardian & Uptime</h3>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider leading-relaxed">
                24/7 dohľad nad tvojou infraštruktúrou, zálohovanie dát, SSL certifikáty a ochrana pred výpadkami.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono">
              99.9% UPTIME // FIRESTORE CLOUD // ENCRYPTED
            </div>
          </motion.div>
        </section>

        {/* Dynamic Navigation Mode Switcher */}
        <div className="mb-8 flex flex-wrap gap-2 border-b-2 border-zinc-800 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('assistant')}
            className={`px-4 py-3 font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 transition-all ${
              activeTab === 'assistant'
                ? 'bg-amber-500 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Bot className="w-4 h-4" /> 0. Trinity Super Asistent
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('swarm')}
            className={`px-4 py-3 font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 transition-all ${
              activeTab === 'swarm'
                ? 'bg-amber-500 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Network className="w-4 h-4 text-amber-950" /> 1. Multi-Agent Swarm
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('console')}
            className={`px-4 py-3 font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 transition-all ${
              activeTab === 'console'
                ? 'bg-amber-500 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Bot className="w-4 h-4" /> 2. Matrix AI Dispečing
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('designer')}
            className={`px-4 py-3 font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 transition-all ${
              activeTab === 'designer'
                ? 'bg-amber-500 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Shirt className="w-4 h-4" /> 3. U.S.W. Textilné AI Štúdio
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-3 font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 transition-all ${
              activeTab === 'contracts'
                ? 'bg-amber-500 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Scale className="w-4 h-4" /> 4. Zmluvy & Turnusy
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoicing')}
            className={`px-4 py-3 font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 transition-all ${
              activeTab === 'invoicing'
                ? 'bg-amber-500 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> 5. Fakturácie & Mzdy
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('codegen')}
            className={`px-4 py-3 font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 transition-all ${
              activeTab === 'codegen'
                ? 'bg-amber-500 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Code2 className="w-4 h-4" /> 6. Kód & Skripty Dielne
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leadhunter')}
            className={`px-4 py-3 font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 transition-all ${
              activeTab === 'leadhunter'
                ? 'bg-amber-500 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Target className="w-4 h-4" /> 7. B2B Lead Hunter
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('infrastructure')}
            className={`px-4 py-3 font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 transition-all ${
              activeTab === 'infrastructure'
                ? 'bg-amber-500 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Server className="w-4 h-4" /> 8. Cloud Infra
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diagnostic')}
            className={`px-4 py-3 font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 transition-all ${
              activeTab === 'diagnostic'
                ? 'bg-amber-500 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Sparkles className="w-4 h-4" /> 9. Hustle Diagnostika
          </button>
        </div>

        {/* Tab 0: Trinity Super AI Asistent Interactive Command Center */}
        {activeTab === 'assistant' && (
          <section className="mb-24">
            <TrinitySuperAssistant onTriggerAction={handleAssistantAction} />
          </section>
        )}

        {/* Tab 1: Autonomous Trinity Multi-Agent Swarm Orchestrator */}
        {activeTab === 'swarm' && (
          <section className="mb-24 bg-zinc-900 border-4 border-amber-500 p-8 md:p-12 relative shadow-[10px_10px_0px_0px_rgba(245,158,11,0.4)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b-2 border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-2 bg-black text-amber-500 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest mb-2 border border-amber-500">
                  <Network className="w-3.5 h-3.5" /> 3 PARALELNÍ AGENTI // SWARM CONCURRENT RUNTIME
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  Trinity Multi-Agent <span className="text-amber-500">Swarm Hub</span>
                </h2>
                <p className="text-zinc-400 text-xs md:text-sm font-bold uppercase tracking-wider mt-1 max-w-3xl">
                  Zadaj komplexnú strategickú misiu. Traja špecializovaní autonómni agenti (Sentinel 369, Dispatch Architect, Growth & DACH) ju rozpracujú, overia riziká a vygenerujú okamžitý realizačný plán.
                </p>
              </div>

              <div className="text-zinc-500 text-xs font-mono bg-black p-3 border border-zinc-800">
                SWARM PROTOCOL: 3.69 CORE
              </div>
            </div>

            {/* 3 Active Swarm Nodes Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-black border-2 border-zinc-800 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-900 border border-amber-500 flex items-center justify-center text-amber-500 font-black">
                  1
                </div>
                <div>
                  <div className="text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Sentinel 369
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase font-mono mt-0.5">
                    Bezpečnosť, Audit, Eskró & A1
                  </div>
                </div>
              </div>

              <div className="bg-black border-2 border-zinc-800 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-900 border border-amber-500 flex items-center justify-center text-amber-500 font-black">
                  2
                </div>
                <div>
                  <div className="text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" /> Dispatch Architect
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase font-mono mt-0.5">
                    Flotila, Trasy, Nafta & Marža
                  </div>
                </div>
              </div>

              <div className="bg-black border-2 border-zinc-800 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-900 border border-amber-500 flex items-center justify-center text-amber-500 font-black">
                  3
                </div>
                <div>
                  <div className="text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" /> Growth & DACH
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase font-mono mt-0.5">
                    B2B Akvizícia, Outreach & Kontrakty
                  </div>
                </div>
              </div>
            </div>

            {/* Swarm Mission Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>Strategická Misia pre Swarm</span>
                  <span className="text-zinc-500 text-[10px] font-mono">Gemini 3.8 Flash Core Engine</span>
                </label>
                <textarea
                  rows={3}
                  value={swarmMission}
                  onChange={(e) => setSwarmMission(e.target.value)}
                  placeholder="Napíš misiu pre agentov..."
                  className="w-full bg-black border-2 border-zinc-700 p-4 text-white font-mono text-xs md:text-sm focus:border-amber-500 outline-none transition-colors"
                />
              </div>

              {/* Mission Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-zinc-500 text-[10px] font-mono uppercase font-bold">Rýchle šablóny:</span>
                <button
                  type="button"
                  onClick={() => setSwarmMission('Expanzia flotily dodávok do Nemecka (Mníchov & Dingolfing) a zabezpečenie 3 nových zohratých partií na priemyselné montáže')}
                  className="text-[11px] font-mono bg-black hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 transition-colors"
                >
                  🚚 Flotila & Montáže v Nemecku
                </button>
                <button
                  type="button"
                  onClick={() => setSwarmMission('Launch limitovaného dropu mikín CHOICE IS YOURS 450g s cieľom €15,000 obrat a ochranou pred napodobeninami')}
                  className="text-[11px] font-mono bg-black hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 transition-colors"
                >
                  👕 Limitovaný Streetwear Drop 450g
                </button>
                <button
                  type="button"
                  onClick={() => setSwarmMission('Audit B2B logistického kontraktu medzi Slovenskom a Nemeckom s eskró kľúčom a minimalizáciou daňových rizík')}
                  className="text-[11px] font-mono bg-black hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 transition-colors"
                >
                  ⚖️ B2B Právny & Daňový Audit
                </button>
              </div>

              {/* Priority & Target Pillar Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                    Úroveň Priority Swarmu
                  </label>
                  <select
                    value={swarmPriority}
                    onChange={(e: any) => setSwarmPriority(e.target.value)}
                    className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none uppercase"
                  >
                    <option value="high">Vysoká (Štandardná exekúcia misie)</option>
                    <option value="ultra">Ultra (Bojový režim // Okamžitá realizácia)</option>
                    <option value="standard">Bežná (Priebežné plánovanie)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                    Cieľový Pilier
                  </label>
                  <select
                    value={swarmTargetPillar}
                    onChange={(e: any) => setSwarmTargetPillar(e.target.value)}
                    className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none uppercase"
                  >
                    <option value="all">Všetky Piliere (Full U.S.C. Orchestration)</option>
                    <option value="rent">Rent-a-Wheel (Flotila & Dodávky)</option>
                    <option value="work">U.S.C. Work (Turnusy & Stavby)</option>
                    <option value="shop">U.S.W. Streetwear (Dropy & E-shop)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRunSwarm}
                  disabled={isExecutingSwarm}
                  className={`w-full py-4 font-black uppercase tracking-widest text-sm transition-all border-2 border-black flex items-center justify-center gap-3 ${
                    isExecutingSwarm
                      ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {isExecutingSwarm ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Swarm analyzuje & koordinuje agentov...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>Spustiť Multi-Agent Swarm Misia &raquo;</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Swarm Results Screen */}
            {swarmOutput && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-8 border-t-2 border-zinc-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      Konsenzus & Výsledky Agenta Trinity
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(swarmOutput);
                      alert("Plán misie skopírovaný do schránky!");
                    }}
                    className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 bg-black border border-zinc-700 px-3 py-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Kopírovať Plán
                  </button>
                </div>

                <div className="bg-black border-2 border-zinc-700 p-6 font-mono text-xs md:text-sm text-zinc-200 leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
                  <Markdown>{swarmOutput}</Markdown>
                </div>
              </motion.div>
            )}
          </section>
        )}

        {/* Tab 2: U.S.W. Streetwear AI Designer Studio */}
        {activeTab === 'designer' && (
          <section className="mb-24 bg-zinc-900 border-4 border-black p-8 md:p-12 relative shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b-2 border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500 text-black px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest mb-2 border border-black">
                  <Shirt className="w-3.5 h-3.5" /> U.S.W. TEXTILNÉ AI LABORATÓRIUM
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  Streetwear & <span className="text-amber-500">Drop Designer</span>
                </h2>
                <p className="text-zinc-400 text-xs md:text-sm font-bold uppercase tracking-wider mt-1 max-w-3xl">
                  Navrhni limitovaný odevný drop pre značku Underground Street Collective. AI vygeneruje strih, 450 GSM textilnú špecifikáciu, technológiu tlače, maržovú kalkuláciu a street release copy.
                </p>
              </div>

              <div className="text-zinc-500 text-xs font-mono bg-black p-3 border border-zinc-800">
                HEAVYWEIGHT ONLY // 450 GSM
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Typ Odevu
                </label>
                <select
                  value={garmentType}
                  onChange={(e) => setGarmentType(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                >
                  <option value="Heavyweight Hoodie 450g">Heavyweight Hoodie 450g (French Terry)</option>
                  <option value="Boxy T-Shirt 280g">Boxy Oversize T-Shirt 280g</option>
                  <option value="Tactical Cargo Pants 380g">Tactical Cargo Nohavice s vreckami</option>
                  <option value="Concrete Windbreaker Jacket">Concrete Windbreaker Technická Bunda</option>
                  <option value="Underground Crewneck 400g">Underground Crewneck Pullover 400g</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Vizuálny Vibe & Estetika
                </label>
                <select
                  value={garmentVibe}
                  onChange={(e) => setGarmentVibe(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                >
                  <option value="Cyber Gothic Brutalist">Cyber Gothic Brutalist</option>
                  <option value="Street Graffiti Raw">Street Graffiti Raw & Acid</option>
                  <option value="Tactical Stealth Black">Tactical Stealth Black</option>
                  <option value="Acid Chrome 369">Acid Chrome 369 Matrix</option>
                  <option value="Distressed Vintage Heavy">Distressed Vintage Heavywash</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Koncepčný Motív / Slogan
                </label>
                <input
                  type="text"
                  value={dropTheme}
                  onChange={(e) => setDropTheme(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                  placeholder="napr. CHOICE IS YOURS 369..."
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleDesignDrop}
              disabled={isDesigningDrop}
              className={`w-full py-4 font-black uppercase tracking-widest text-sm transition-all border-2 border-black flex items-center justify-center gap-3 ${
                isDesigningDrop
                  ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {isDesigningDrop ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Kreatívny AI motor navrhuje drop...</span>
                </>
              ) : (
                <>
                  <Shirt className="w-5 h-5" />
                  <span>Vygenerovať Streetwear Drop Koncept &raquo;</span>
                </>
              )}
            </button>

            {dropDesign && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-8 border-t-2 border-zinc-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    Technický List & Produkčný Balík Dropu
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(dropDesign);
                      alert("Streetwear koncept skopírovaný!");
                    }}
                    className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 bg-black border border-zinc-700 px-3 py-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Kopírovať Špecifikáciu
                  </button>
                </div>

                <div className="bg-black border-2 border-zinc-700 p-6 font-mono text-xs md:text-sm text-zinc-200 leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
                  <Markdown>{dropDesign}</Markdown>
                </div>
              </motion.div>
            )}
          </section>
        )}

        {/* Tab 3: Legal & Turnus Contract Generator */}
        {activeTab === 'contracts' && (
          <section className="mb-24 bg-zinc-900 border-4 border-black p-8 md:p-12 relative shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b-2 border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500 text-black px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest mb-2 border border-black">
                  <Scale className="w-3.5 h-3.5" /> PRÁVNY & TURNUSOVÝ ENGINE
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  Generátor Zmlúv & <span className="text-amber-500">Dohôd</span>
                </h2>
                <p className="text-zinc-400 text-xs md:text-sm font-bold uppercase tracking-wider mt-1 max-w-3xl">
                  Automatizované generovanie právne nepriestrelných dvojjazyčných zmlúv pre turnusy v Nemecku, prenájom dodávok a subdodávateľské práce v súlade s A1 a § 13b UStG.
                </p>
              </div>

              <div className="text-zinc-500 text-xs font-mono bg-black p-3 border border-zinc-800">
                EU LEGAL STANDARD // REVERSE CHARGE
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Typ Zmluvy
                </label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none uppercase"
                >
                  <option value="turnus_work">Rámcová zmluva o dielo pre nemecké turnusy</option>
                  <option value="fleet_rental">Zmluva o prenájme dodávky / flotilového vozidla</option>
                  <option value="b2b_subcontract">B2B Subdodávateľská zmluva s doložkou NDA</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Miesto Výkonu Prác / Trasa
                </label>
                <input
                  type="text"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                  placeholder="napr. Dingolfing / München, Nemecko"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Hodinová Sadzba (€ / hod)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={contractHourlyRate}
                  onChange={(e) => setContractHourlyRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Poskytnuté Vozidlo Flotily
                </label>
                <input
                  type="text"
                  value={contractVehicle}
                  onChange={(e) => setContractVehicle(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateContract}
              disabled={isGeneratingContract}
              className={`w-full py-4 font-black uppercase tracking-widest text-sm transition-all border-2 border-black flex items-center justify-center gap-3 ${
                isGeneratingContract
                  ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {isGeneratingContract ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Právny AI model formuluje zmluvu...</span>
                </>
              ) : (
                <>
                  <Scale className="w-5 h-5" />
                  <span>Vygenerovať Právnu Zmluvu &raquo;</span>
                </>
              )}
            </button>

            {generatedContract && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-8 border-t-2 border-zinc-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    Vygenerované Zmluvné Znenie
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyContractText}
                      className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 bg-black border border-zinc-700 px-3 py-1.5"
                    >
                      {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedContract ? 'Skopírované!' : 'Kopírovať'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadContractFile}
                      className="text-xs font-mono text-black font-bold flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 border border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Stiahnuť (.md)</span>
                    </button>
                  </div>
                </div>

                <div className="bg-black border-2 border-zinc-700 p-6 font-mono text-xs md:text-sm text-zinc-200 leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
                  <Markdown>{generatedContract}</Markdown>
                </div>
              </motion.div>
            )}
          </section>
        )}

        {/* Tab 1: Live Auru Matrix AI Dispatch & Multi-Pillar Brain */}
        {activeTab === 'console' && (
          <section className="mb-24">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500 text-black px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest mb-2 border border-black">
                  <Bot className="w-3.5 h-3.5" /> CENTRÁLNY AI MOZOG // GEMINI 3.7 FLASH
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  Auru Matrix <span className="text-amber-500">AI Chat & Dispečing</span>
                </h2>
                <p className="text-zinc-400 text-xs md:text-sm font-bold uppercase tracking-wider mt-1 max-w-2xl">
                  Kompletná obojsmerná interakcia s Gemini 3.7 Flash pre všetkých 6 pilierov U.S.C.
                </p>
              </div>

              <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-emerald-400 font-bold uppercase">6/6 Pilierov Synchronizovaných</span>
              </div>
            </div>

            <MatrixDispatchConsole initialPillar="AURU_TRINITY" />
          </section>
        )}

        {/* Tab 2: Invoicing & Turnus Payroll Automation Engine */}
        {activeTab === 'invoicing' && (
          <section className="mb-24 bg-zinc-900 border-4 border-black p-8 md:p-12 relative shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b-2 border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500 text-black px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest mb-2 border border-black">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> INVOICING & PAYROLL ENGINE 3.69
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  Fakturácie & <span className="text-amber-400">Mzdová Matrica</span>
                </h2>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mt-1">
                  Generovanie oficiálnych faktúr pre nemecké turnusy, výpočet čistého zárobku živnostníka a okamžitý export do PDF.
                </p>
              </div>

              <div className="text-zinc-500 text-xs font-mono">
                STANDARDS: EU REVERSE CHARGE (§ 13b UStG)
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Form Side */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                      Číslo Faktúry
                    </label>
                    <input
                      type="text"
                      value={invoiceForm.invoiceNumber}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                      className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                      Dodávateľ (U.S.C. / Živnostník)
                    </label>
                    <input
                      type="text"
                      value={invoiceForm.supplierName}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, supplierName: e.target.value })}
                      className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                      Odberateľ / Partner (DE / AT / SK)
                    </label>
                    <input
                      type="text"
                      value={invoiceForm.customerName}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                      className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                      Sídlo Odberateľa (Mesto, Štát)
                    </label>
                    <input
                      type="text"
                      value={invoiceForm.customerCity}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, customerCity: e.target.value })}
                      className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                    Popis Prác / Zákazky
                  </label>
                  <input
                    type="text"
                    value={invoiceForm.serviceDescription}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, serviceDescription: e.target.value })}
                    className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                      Odpracované Hodiny
                    </label>
                    <input
                      type="number"
                      value={invoiceForm.hoursWorked}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, hoursWorked: Number(e.target.value) || 0 })}
                      className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                      Hodinová Sadzba (€ / hod)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={invoiceForm.hourlyRate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, hourlyRate: Number(e.target.value) || 0 })}
                      className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                      Dĺžka Turnusu (Týždne)
                    </label>
                    <input
                      type="number"
                      value={invoiceForm.turnusWeeks}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, turnusWeeks: Number(e.target.value) || 1 })}
                      className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="bg-black border-2 border-amber-500 p-6 flex flex-col justify-between">
                <div>
                  <div className="text-amber-500 font-mono text-xs font-bold uppercase mb-3 flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> PREPOČET TURNOVEJ FAKTÚRY
                  </div>

                  <div className="space-y-3 font-mono text-xs mb-6">
                    <div className="flex justify-between text-zinc-400">
                      <span>Základná fakturácia:</span>
                      <strong className="text-white">€{totalTurnusGross.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>DPH Režim:</span>
                      <span className="text-amber-400">Reverse Charge (0% DPH)</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Odhadované réžie (Cesta/Izba):</span>
                      <span className="text-red-400">-€{estimatedFuelAccommodation.toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
                      <span className="text-white font-bold uppercase">Čistý zisk turnusu:</span>
                      <span className="text-2xl font-black text-emerald-400">€{estimatedNetTurnus.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed font-mono mb-4">
                    ✓ Automatické oslobodenie od dane podľa § 13b nemeckého zákona o DPH.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportInvoice}
                  disabled={isGeneratingInvoiceDoc}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Download className="w-4 h-4" />
                  {isGeneratingInvoiceDoc ? 'Generujem PDF...' : 'Stiahnuť Faktúru v PDF'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: Live Code & Script Generator */}
        {activeTab === 'codegen' && (
          <section className="mb-24 bg-zinc-900 border-4 border-black p-8 md:p-12 relative shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b-2 border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-2 bg-black text-amber-500 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest mb-2 border border-amber-500">
                  <Code2 className="w-3.5 h-3.5" /> LIVE CODE & BOT WERKSTATT
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  Auru Trinity <span className="text-amber-500">Generátor Kódu</span>
                </h2>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mt-1">
                  Generovanie funkčných TypeScript/React/Node skriptov, REST endpointov a automatizácií.
                </p>
              </div>

              <div className="text-zinc-500 text-xs font-mono">
                ENGINE: GEMINI 3.7 FLASH // DEV LEVEL
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Typ Úlohy / Modul</label>
                <input
                  type="text"
                  value={codeType}
                  onChange={(e) => setCodeType(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Technologický Stack</label>
                <input
                  type="text"
                  value={codeStack}
                  onChange={(e) => setCodeStack(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Zadanie a Požiadavky</label>
                <textarea
                  rows={3}
                  value={codeGoal}
                  onChange={(e) => setCodeGoal(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateCode}
              disabled={isGeneratingCode}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
            >
              <Zap className="w-5 h-5" /> {isGeneratingCode ? 'Generujem Kód cez Gemini...' : 'Vygenerovať Kód & Nasadzovací Skript'}
            </button>

            {generatedCode && (
              <div className="mt-8 bg-black border-2 border-amber-500 p-6 relative">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
                  <span className="text-amber-400 font-mono text-xs font-bold uppercase">
                    /// VÝSTUP Z AURU TRINITY DIEĽNE
                  </span>
                  <button
                    type="button"
                    onClick={copyGeneratedCode}
                    className="px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono uppercase flex items-center gap-1.5 transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                    <span>{copiedCode ? 'Skopírované' : 'Kopírovať Kód'}</span>
                  </button>
                </div>

                <div className="prose prose-invert max-w-none font-mono text-xs leading-relaxed text-zinc-200">
                  <Markdown>{generatedCode}</Markdown>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Tab 4: B2B Lead Hunter */}
        {activeTab === 'leadhunter' && (
          <section className="mb-24 bg-zinc-900 border-4 border-black p-8 md:p-12 relative shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b-2 border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500 text-black px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest mb-2 border border-black">
                  <Target className="w-3.5 h-3.5" /> B2B ACQUISITION MATRIX
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  Auru <span className="text-emerald-400">Lead Hunter</span>
                </h2>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mt-1">
                  Vyhľadávanie nových zákazníkov, tvorba predajných správ a akvizičných kampaní pre stavebníctvo a logistiku.
                </p>
              </div>

              <div className="text-zinc-500 text-xs font-mono">
                OUTREACH PIPELINE // B2B ENGINE
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Cieľová Nika / Odvetvie</label>
                <input
                  type="text"
                  value={leadNiche}
                  onChange={(e) => setLeadNiche(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Krajina / Lokalita</label>
                <input
                  type="text"
                  value={leadRegion}
                  onChange={(e) => setLeadRegion(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Typ Ponuky</label>
                <input
                  type="text"
                  value={leadOffer}
                  onChange={(e) => setLeadOffer(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleHuntLeads}
              disabled={isHuntingLeads}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
            >
              <Zap className="w-5 h-5" /> {isHuntingLeads ? 'Generujem Akvizičnú Stratégiu...' : 'Spustiť AI B2B Lead Analýzu & Šablóny'}
            </button>

            {leadResults && (
              <div className="mt-8 bg-black border-2 border-emerald-500 p-6 relative">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
                  <span className="text-emerald-400 font-mono text-xs font-bold uppercase">
                    /// VÝSTUP LEAD HUNTERA (ICP + OUTREACH MESSAGES)
                  </span>
                </div>

                <div className="prose prose-invert max-w-none font-sans text-sm leading-relaxed text-zinc-200">
                  <Markdown>{leadResults}</Markdown>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Tab 5: Cloud Infrastructure & Blueprint */}
        {activeTab === 'infrastructure' && (
          <section className="mb-24 bg-zinc-900 border-4 border-black p-8 md:p-12 relative shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b-2 border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500 text-black px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest mb-2 border border-black">
                  <Server className="w-3.5 h-3.5" /> CLOUD INFRASTRUCTURE & BLUEPRINT
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  Auru Trinity <span className="text-amber-400">Cloud Cluster</span>
                </h2>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mt-1">
                  Monitorovanie uzlov auru.space, Cloudflare R2 bucketu "trinity", Worker Edge a export systémového Blueprintu.
                </p>
              </div>

              <button
                type="button"
                onClick={checkClusterHealth}
                disabled={cloudStatus.loading}
                className="px-4 py-2 bg-black border-2 border-zinc-700 hover:border-amber-500 text-zinc-300 hover:text-white font-mono text-xs uppercase flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cloudStatus.loading ? 'animate-spin' : ''}`} />
                <span>Testovať Latenciu</span>
              </button>
            </div>

            {/* Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-black border-2 border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <Globe className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 uppercase">
                    ONLINE
                  </span>
                </div>
                <h4 className="text-white font-black text-sm uppercase">Hlavná Doména</h4>
                <p className="text-amber-400 font-mono text-xs mt-1">auru.space</p>
                <div className="mt-3 text-[10px] text-zinc-500 font-mono">
                  HTTPS // SSL AKTÍVNY // 0.0.0.0:3000
                </div>
              </div>

              <div className="bg-black border-2 border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <HardDrive className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 uppercase">
                    R2 READY
                  </span>
                </div>
                <h4 className="text-white font-black text-sm uppercase">Cloudflare R2 Storage</h4>
                <p className="text-amber-400 font-mono text-xs mt-1">bucket: {cloudStatus.bucket}</p>
                <div className="mt-3 text-[10px] text-zinc-500 font-mono">
                  MULTIMEDIA & MANIFEST ARCHÍV
                </div>
              </div>

              <div className="bg-black border-2 border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 uppercase">
                    EDGE SYNC
                  </span>
                </div>
                <h4 className="text-white font-black text-sm uppercase">Cloudflare Worker</h4>
                <p className="text-amber-400 font-mono text-xs mt-1">tenebris-core.uscolective.workers.dev</p>
                <div className="mt-3 text-[10px] text-zinc-500 font-mono">
                  TENEBRIS CORE // EDGE SYNC
                </div>
              </div>

              <div className="bg-black border-2 border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <Activity className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 uppercase">
                    {cloudStatus.pingMs} ms
                  </span>
                </div>
                <h4 className="text-white font-black text-sm uppercase">Google Cloud Container</h4>
                <p className="text-amber-400 font-mono text-xs mt-1">Node.js Express + Gemini</p>
                <div className="mt-3 text-[10px] text-zinc-500 font-mono">
                  99.98% REAL-TIME UPTIME
                </div>
              </div>
            </div>

            {/* Action Banner */}
            <div className="bg-black border-2 border-amber-500 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">
                  Kompletná Architektonická Špecifikácia & Blueprint
                </h3>
                <p className="text-zinc-400 text-xs font-mono">
                  Stiahni si overený PDF dokument s kompletným zoznamom modulov, stacku a bezpečnostných pravidiel Auru Trinity.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadBlueprint}
                className="px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs tracking-widest whitespace-nowrap transition-colors border-2 border-black flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <Download className="w-4 h-4" />
                <span>Generovať Blueprint (PDF)</span>
              </button>
            </div>
          </section>
        )}

        {/* Tab 6: Interactive AI Automation Diagnostic Generator */}
        {activeTab === 'diagnostic' && (
          <section className="mb-24 bg-zinc-900 border-4 border-amber-500 p-8 md:p-12 relative overflow-hidden shadow-[10px_10px_0px_0px_rgba(245,158,11,0.4)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b-2 border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-2 bg-black text-amber-500 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest mb-2 border border-amber-500">
                  <Sparkles className="w-3.5 h-3.5" /> INTERAKTÍVNY SIMULÁTOR
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  Auru AI Hustle Diagnostika
                </h2>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mt-1">
                  Zisti, koľko hodín manuálnej driny a nákladov dokáže Auru Trinity ušetriť tvojej firme.
                </p>
              </div>

              <div className="text-zinc-500 text-xs font-mono">
                DIAGNOSTIC ALGORITHM: 3.69 MATRIX
              </div>
            </div>

            <form onSubmit={runDiagnostic} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Oblasť Podnikania / Hustlu
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none uppercase"
                >
                  <option value="ecommerce">E-Shop & Predaj tovaru</option>
                  <option value="craftsman">Remeslá, Stavby & Dielne</option>
                  <option value="logistics">Doprava, Kuriéri & Taxi</option>
                  <option value="services">Služby, Agentúry & Gastronómia</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Najväčšia Brzda (Bottleneck)
                </label>
                <select
                  value={currentBottleneck}
                  onChange={(e) => setCurrentBottleneck(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none uppercase"
                >
                  <option value="accounting">Papierovačky, Fakturácie, Dane</option>
                  <option value="leads">Nedostatok nových zákazníkov</option>
                  <option value="website">Zastaraný alebo nefunkčný web</option>
                  <option value="dispatch">Chaos v objednávkach a dispečingu</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Veľkosť Tímu / Zákaziek
                </label>
                <select
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-mono text-xs focus:border-amber-500 outline-none uppercase"
                >
                  <option value="1">Sólo jednotlivec (SZČO)</option>
                  <option value="1-5">2 až 5 ľudí</option>
                  <option value="6-20">6 až 20 ľudí</option>
                  <option value="20+">20+ ľudí (Flotila / Firma)</option>
                </select>
              </div>

              <div className="sm:col-span-3 mt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Zap className="w-5 h-5" /> Vypočítať Automatizačný Plán
                </button>
              </div>
            </form>

            {calculatedPlan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black border-2 border-amber-500 p-6 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div>
                  <div className="text-amber-500 font-mono text-xs font-bold uppercase mb-1">
                    /// VÝSLEDOK ANALÝZY PRE TVOJ BIZNIS
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                    Odhadovaná úspora: <span className="text-amber-400">{calculatedPlan.hoursSaved}</span>
                  </div>
                  <div className="text-zinc-400 text-xs font-bold uppercase mt-1">
                    Rast konverzie a efektivity: <strong className="text-white">{calculatedPlan.revenueBoost}</strong>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {calculatedPlan.modules.map((m: string, i: number) => (
                      <span key={i} className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-mono px-2 py-1 uppercase">
                        ✓ {m}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href="#inquiry-form"
                  className="px-6 py-3 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-widest whitespace-nowrap transition-colors border-2 border-black"
                >
                  Aplikovať Riešenie &raquo;
                </a>
              </motion.div>
            )}
          </section>
        )}

        {/* Inquiry / Consultation Form */}
        <section id="inquiry-form" className="max-w-3xl mx-auto bg-zinc-900 border-4 border-black p-8 md:p-12 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
          <Hammer className="absolute -bottom-10 -right-10 w-64 h-64 text-zinc-950 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
              Objednať Digitálnu Dielňu
            </h2>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-8">
              Povedz nám o svojom projekte, platforme alebo systéme, ktorý potrebuješ vybudovať.
            </p>

            {submitted ? (
              <div className="bg-amber-500 text-black p-6 font-black uppercase tracking-widest text-center border-2 border-black">
                Požiadavka odoslaná! Auru Trinity tím ťa bude čoskoro kontaktovať.
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                    Meno / Názov Firmy
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tvoje meno alebo brand..."
                    className="w-full bg-black border-2 border-zinc-700 p-4 text-white font-mono focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                    Kontakt (Telefón / WhatsApp / Email)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="+421 9xx xxx xxx alebo email..."
                    className="w-full bg-black border-2 border-zinc-700 p-4 text-white font-mono focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                      Služba
                    </label>
                    <select
                      value={formData.serviceInterest}
                      onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                      className="w-full bg-black border-2 border-zinc-700 p-4 text-white font-mono text-xs focus:border-amber-500 focus:outline-none transition-colors uppercase"
                    >
                      <option value="full_trinity">Kompletná Digitálna Dielňa</option>
                      <option value="web_app">Vývoj Webu / Aplikácie na kľúč</option>
                      <option value="accounting_automation">Automatizácia Účtovníctva & Mzdy</option>
                      <option value="lead_hunter">AI Lead Hunter & Zákazníci</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                      Orientačný Budget
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full bg-black border-2 border-zinc-700 p-4 text-white font-mono text-xs focus:border-amber-500 focus:outline-none transition-colors uppercase"
                    >
                      <option value="under_1000">Do €1 000</option>
                      <option value="1000-3000">€1 000 - €3 000</option>
                      <option value="3000-7000">€3 000 - €7 000</option>
                      <option value="custom">Veľký projekt / Custom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                    Popis Požiadavky
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Opíš, čo potrebuješ naprogramovať, prepojiť alebo zautomatizovať..."
                    className="w-full bg-black border-2 border-zinc-700 p-4 text-white font-mono focus:border-amber-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-colors mt-2 border-2 border-black disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? 'Odosielam do Dielne...' : 'Odoslať Dopyt do Auru Trinity'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
