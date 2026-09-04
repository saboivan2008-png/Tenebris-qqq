import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import {
  Package,
  Car,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Filter,
  BarChart3,
  Activity,
  ShieldCheck,
  Clock
} from 'lucide-react';
import {
  subscribeToUswProductsInventory,
  subscribeToFleetAvailability,
  UswProductInventory,
  VehicleAvailability,
  ProductStatus,
  VehicleStatus
} from '../../lib/inventoryService';

interface RealtimeInventoryFleetWidgetProps {
  onNavigateToShop?: () => void;
  onNavigateToRent?: () => void;
  compact?: boolean;
}

type ViewMode = 'all' | 'products' | 'fleet';

interface ProductChartItem {
  category: string;
  categoryLabel: string;
  available: number;
  soldOut: number;
  total: number;
  estimatedUnits: number;
}

interface FleetChartItem {
  category: string;
  categoryLabel: string;
  available: number;
  rented: number;
  maintenance: number;
  total: number;
}

interface CombinedChartItem {
  name: string;
  sector: 'Sklad U.S.W.' | 'Flotila Rent';
  available: number;
  unavailable: number;
  total: number;
  availabilityRate: number;
}

export default function RealtimeInventoryFleetWidget({
  onNavigateToShop,
  onNavigateToRent,
  compact = false
}: RealtimeInventoryFleetWidgetProps) {
  const [products, setProducts] = useState<UswProductInventory[]>([]);
  const [vehicles, setVehicles] = useState<VehicleAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Real-time Firestore subscriptions
  useEffect(() => {
    setLoading(true);

    const unsubProducts = subscribeToUswProductsInventory(
      (items) => {
        setProducts(items);
        setLastSyncTime(new Date().toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setLoading(false);
      },
      (err) => {
        console.warn('[RealtimeInventoryFleetWidget] Chyba pri odberu produktov:', err);
        setLoading(false);
      }
    );

    const unsubVehicles = subscribeToFleetAvailability(
      (items) => {
        setVehicles(items);
        setLastSyncTime(new Date().toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setLoading(false);
      },
      (err) => {
        console.warn('[RealtimeInventoryFleetWidget] Chyba pri odberu flotily:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubProducts();
      unsubVehicles();
    };
  }, []);

  // Manuálny refresh indikátor
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastSyncTime(new Date().toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsRefreshing(false);
    }, 600);
  };

  // 1. Štatistiky produktov
  const productStats = useMemo(() => {
    const total = products.length;
    const available = products.filter(p => p.status === 'available').length;
    const soldOut = products.filter(p => p.status === 'sold_out').length;
    const availabilityRate = total > 0 ? Math.round((available / total) * 100) : 0;

    // Celkový počet kusov (berieme do úvahy stockQuantity alebo default odhad 12 ks na dostupný model)
    const totalUnits = products.reduce((acc, p) => {
      if (p.status === 'sold_out') return acc;
      return acc + (typeof p.stockQuantity === 'number' ? p.stockQuantity : 12);
    }, 0);

    return { total, available, soldOut, availabilityRate, totalUnits };
  }, [products]);

  // 2. Štatistiky flotily vozidiel
  const fleetStats = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter(v => v.status === 'available').length;
    const rented = vehicles.filter(v => v.status === 'rented').length;
    const maintenance = vehicles.filter(v => v.status === 'maintenance').length;
    const occupancyRate = total > 0 ? Math.round((rented / total) * 100) : 0;
    const availabilityRate = total > 0 ? Math.round((available / total) * 100) : 0;

    return { total, available, rented, maintenance, occupancyRate, availabilityRate };
  }, [vehicles]);

  // 3. Dáta pre graf produktov podľa kategórií
  const productChartData: ProductChartItem[] = useMemo(() => {
    const categoriesMap: Record<string, { available: number; soldOut: number; estimatedUnits: number }> = {
      mikiny: { available: 0, soldOut: 0, estimatedUnits: 0 },
      tricka: { available: 0, soldOut: 0, estimatedUnits: 0 },
      nohavice: { available: 0, soldOut: 0, estimatedUnits: 0 },
      doplnky: { available: 0, soldOut: 0, estimatedUnits: 0 },
      ostatne: { available: 0, soldOut: 0, estimatedUnits: 0 }
    };

    const categoryLabels: Record<string, string> = {
      mikiny: 'Mikiny & Hoodies',
      tricka: 'T-Shirts & Tops',
      nohavice: 'Cargo & Nohavice',
      doplnky: 'Doplnky & Caps',
      ostatne: 'Ostatné Drops'
    };

    products.forEach(p => {
      const rawCat = (p.category || 'ostatne').toLowerCase().trim();
      const normalizedCat = rawCat.includes('mikin') || rawCat.includes('hoodie')
        ? 'mikiny'
        : rawCat.includes('tri') || rawCat.includes('shirt')
        ? 'tricka'
        : rawCat.includes('nohavic') || rawCat.includes('cargo') || rawCat.includes('pants')
        ? 'nohavice'
        : rawCat.includes('doplnk') || rawCat.includes('cap') || rawCat.includes('tašk')
        ? 'doplnky'
        : 'ostatne';

      if (p.status === 'available') {
        categoriesMap[normalizedCat].available += 1;
        categoriesMap[normalizedCat].estimatedUnits += (p.stockQuantity ?? 12);
      } else {
        categoriesMap[normalizedCat].soldOut += 1;
      }
    });

    return Object.entries(categoriesMap)
      .map(([key, data]) => ({
        category: key,
        categoryLabel: categoryLabels[key] || key,
        available: data.available,
        soldOut: data.soldOut,
        total: data.available + data.soldOut,
        estimatedUnits: data.estimatedUnits
      }))
      .filter(item => filterCategory === 'all' || filterCategory === item.category);
  }, [products, filterCategory]);

  // 4. Dáta pre graf flotily podľa typu
  const fleetChartData: FleetChartItem[] = useMemo(() => {
    const fleetMap: Record<string, { available: number; rented: number; maintenance: number }> = {
      taxi: { available: 0, rented: 0, maintenance: 0 },
      cargo: { available: 0, rented: 0, maintenance: 0 },
      vip: { available: 0, rented: 0, maintenance: 0 }
    };

    const fleetLabels: Record<string, string> = {
      taxi: 'Taxi & Bolt Ready',
      cargo: 'Úžitkové & Dodávky',
      vip: 'VIP & Touring'
    };

    vehicles.forEach(v => {
      let cat = (v.category || '').toLowerCase();
      if (!cat) {
        const typeStr = (v.type || '').toLowerCase();
        const nameStr = (v.name || '').toLowerCase();
        if (typeStr.includes('taxi') || typeStr.includes('bolt') || nameStr.includes('octavia') || nameStr.includes('corolla')) {
          cat = 'taxi';
        } else if (typeStr.includes('dodávk') || typeStr.includes('cargo') || nameStr.includes('transporter') || nameStr.includes('sprinter')) {
          cat = 'cargo';
        } else {
          cat = 'vip';
        }
      }

      const safeCat = cat in fleetMap ? cat : 'vip';
      if (v.status === 'available') {
        fleetMap[safeCat].available += 1;
      } else if (v.status === 'rented') {
        fleetMap[safeCat].rented += 1;
      } else if (v.status === 'maintenance') {
        fleetMap[safeCat].maintenance += 1;
      }
    });

    return Object.entries(fleetMap).map(([key, data]) => ({
      category: key,
      categoryLabel: fleetLabels[key] || key,
      available: data.available,
      rented: data.rented,
      maintenance: data.maintenance,
      total: data.available + data.rented + data.maintenance
    }));
  }, [vehicles]);

  // 5. Kombinované dáta pre globálny Bar Chart
  const combinedChartData: CombinedChartItem[] = useMemo(() => {
    return [
      {
        name: 'Mikiny U.S.W.',
        sector: 'Sklad U.S.W.',
        available: productChartData.find(d => d.category === 'mikiny')?.available || 0,
        unavailable: productChartData.find(d => d.category === 'mikiny')?.soldOut || 0,
        total: productChartData.find(d => d.category === 'mikiny')?.total || 0,
        availabilityRate: Math.round(
          ((productChartData.find(d => d.category === 'mikiny')?.available || 0) /
            Math.max(1, productChartData.find(d => d.category === 'mikiny')?.total || 1)) * 100
        )
      },
      {
        name: 'Tričká U.S.W.',
        sector: 'Sklad U.S.W.',
        available: productChartData.find(d => d.category === 'tricka')?.available || 0,
        unavailable: productChartData.find(d => d.category === 'tricka')?.soldOut || 0,
        total: productChartData.find(d => d.category === 'tricka')?.total || 0,
        availabilityRate: Math.round(
          ((productChartData.find(d => d.category === 'tricka')?.available || 0) /
            Math.max(1, productChartData.find(d => d.category === 'tricka')?.total || 1)) * 100
        )
      },
      {
        name: 'Nohavice / Cargo',
        sector: 'Sklad U.S.W.',
        available: productChartData.find(d => d.category === 'nohavice')?.available || 0,
        unavailable: productChartData.find(d => d.category === 'nohavice')?.soldOut || 0,
        total: productChartData.find(d => d.category === 'nohavice')?.total || 0,
        availabilityRate: Math.round(
          ((productChartData.find(d => d.category === 'nohavice')?.available || 0) /
            Math.max(1, productChartData.find(d => d.category === 'nohavice')?.total || 1)) * 100
        )
      },
      {
        name: 'Doplnky / Caps',
        sector: 'Sklad U.S.W.',
        available: productChartData.find(d => d.category === 'doplnky')?.available || 0,
        unavailable: productChartData.find(d => d.category === 'doplnky')?.soldOut || 0,
        total: productChartData.find(d => d.category === 'doplnky')?.total || 0,
        availabilityRate: Math.round(
          ((productChartData.find(d => d.category === 'doplnky')?.available || 0) /
            Math.max(1, productChartData.find(d => d.category === 'doplnky')?.total || 1)) * 100
        )
      },
      {
        name: 'Flotila: Taxi / Bolt',
        sector: 'Flotila Rent',
        available: fleetChartData.find(d => d.category === 'taxi')?.available || 0,
        unavailable: (fleetChartData.find(d => d.category === 'taxi')?.rented || 0) + (fleetChartData.find(d => d.category === 'taxi')?.maintenance || 0),
        total: fleetChartData.find(d => d.category === 'taxi')?.total || 0,
        availabilityRate: Math.round(
          ((fleetChartData.find(d => d.category === 'taxi')?.available || 0) /
            Math.max(1, fleetChartData.find(d => d.category === 'taxi')?.total || 1)) * 100
        )
      },
      {
        name: 'Flotila: Dodávky',
        sector: 'Flotila Rent',
        available: fleetChartData.find(d => d.category === 'cargo')?.available || 0,
        unavailable: (fleetChartData.find(d => d.category === 'cargo')?.rented || 0) + (fleetChartData.find(d => d.category === 'cargo')?.maintenance || 0),
        total: fleetChartData.find(d => d.category === 'cargo')?.total || 0,
        availabilityRate: Math.round(
          ((fleetChartData.find(d => d.category === 'cargo')?.available || 0) /
            Math.max(1, fleetChartData.find(d => d.category === 'cargo')?.total || 1)) * 100
        )
      },
      {
        name: 'Flotila: VIP Vozidlá',
        sector: 'Flotila Rent',
        available: fleetChartData.find(d => d.category === 'vip')?.available || 0,
        unavailable: (fleetChartData.find(d => d.category === 'vip')?.rented || 0) + (fleetChartData.find(d => d.category === 'vip')?.maintenance || 0),
        total: fleetChartData.find(d => d.category === 'vip')?.total || 0,
        availabilityRate: Math.round(
          ((fleetChartData.find(d => d.category === 'vip')?.available || 0) /
            Math.max(1, fleetChartData.find(d => d.category === 'vip')?.total || 1)) * 100
        )
      }
    ];
  }, [productChartData, fleetChartData]);

  // Custom Recharts Tooltip s dark brutalist estetikou
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border-2 border-zinc-700 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs font-mono">
          <p className="text-white font-bold text-sm mb-1 uppercase tracking-tight">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2 h-2 inline-block rounded-none" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">{entry.value} ks</span>
              </div>
            ))}
          </div>
          {payload[0]?.payload?.availabilityRate !== undefined && (
            <div className="mt-2 pt-1.5 border-t border-zinc-800 text-[11px] text-zinc-400 flex justify-between">
              <span>Miera dostupnosti:</span>
              <span className="text-emerald-400 font-bold">{payload[0].payload.availabilityRate}%</span>
            </div>
          )}
          {payload[0]?.payload?.estimatedUnits !== undefined && (
            <div className="mt-1 text-[11px] text-zinc-400 flex justify-between">
              <span>Odhad zásob:</span>
              <span className="text-amber-400 font-bold">~{payload[0].payload.estimatedUnits} ks</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="realtime-inventory-widget" className="bg-zinc-900 border-4 border-black p-5 md:p-7 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      
      {/* Horná hlavička s live statusom */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b-2 border-zinc-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border border-white">
              <Activity className="w-3 h-3 animate-pulse" /> LIVE FIRESTORE SYNC
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              RECHARTS VISUALIZER
            </span>
            {lastSyncTime && (
              <span className="text-zinc-500 font-mono text-[10px] flex items-center gap-1">
                <Clock className="w-3 h-3" /> Synced: {lastSyncTime}
              </span>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mt-1.5 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-amber-400" />
            Skladové Zásoby & Dostupnosť Flotily
          </h2>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mt-0.5">
            Real-time monitor stavu streetwear produktov U.S.W. a prenájmu vozidiel Rent-a-Wheel
          </p>
        </div>

        {/* Prepínače zobrazenia a ovládacie prvky */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex bg-black border-2 border-zinc-800 p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 font-bold uppercase transition-all ${
                viewMode === 'all'
                  ? 'bg-amber-400 text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Všetko
            </button>
            <button
              onClick={() => setViewMode('products')}
              className={`px-3 py-1.5 font-bold uppercase transition-all ${
                viewMode === 'products'
                  ? 'bg-amber-400 text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              U.S.W. Produkty
            </button>
            <button
              onClick={() => setViewMode('fleet')}
              className={`px-3 py-1.5 font-bold uppercase transition-all ${
                viewMode === 'fleet'
                  ? 'bg-amber-400 text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Flotila Rent
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            title="Obnoviť dáta"
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-2 border-black transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Karty s kľúčovými metrikami */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        
        {/* Karta 1: U.S.W. Produkty skladom */}
        <div className="bg-black border-2 border-zinc-800 p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono uppercase mb-1">
            <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-amber-400" /> Sklad U.S.W.</span>
            <span className="text-emerald-400 font-bold">{productStats.availabilityRate}% Ready</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {productStats.available} <span className="text-xs text-zinc-500 font-normal">/ {productStats.total} modelov</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1 flex items-center justify-between">
            <span>Fyzické zásoby:</span>
            <span className="text-amber-400 font-bold font-mono">~{productStats.totalUnits} ks</span>
          </div>
          <div className="w-full bg-zinc-800 h-1 mt-2">
            <div 
              className="bg-amber-400 h-1 transition-all duration-500" 
              style={{ width: `${productStats.availabilityRate}%` }}
            />
          </div>
        </div>

        {/* Karta 2: Vypredané / Sold Out položky */}
        <div className="bg-black border-2 border-zinc-800 p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono uppercase mb-1">
            <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Vypredané Drops</span>
            <span className="text-red-400 font-bold">{productStats.soldOut} ks</span>
          </div>
          <div className="text-2xl font-black text-red-400 font-mono">
            {productStats.soldOut === 0 ? '0' : `${productStats.soldOut}`}
            <span className="text-xs text-zinc-500 font-normal"> chýba na sklade</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            {productStats.soldOut > 0 ? 'Vyžaduje doskladnenie alebo archív' : 'Všetky modely sú aktívne na predaj'}
          </div>
          <div className="w-full bg-zinc-800 h-1 mt-2">
            <div 
              className="bg-red-500 h-1 transition-all duration-500" 
              style={{ width: `${productStats.total > 0 ? (productStats.soldOut / productStats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Karta 3: Flotila - Voľné na okamžitý prenájom */}
        <div className="bg-black border-2 border-zinc-800 p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono uppercase mb-1">
            <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5 text-emerald-400" /> Rent Flotila</span>
            <span className="text-emerald-400 font-bold">{fleetStats.availabilityRate}% Voľné</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {fleetStats.available} <span className="text-xs text-zinc-500 font-normal">/ {fleetStats.total} áut</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1 flex items-center justify-between">
            <span>Vozidlá na výdaj:</span>
            <span className="text-emerald-400 font-bold font-mono">Ihneď k odberu</span>
          </div>
          <div className="w-full bg-zinc-800 h-1 mt-2">
            <div 
              className="bg-emerald-500 h-1 transition-all duration-500" 
              style={{ width: `${fleetStats.availabilityRate}%` }}
            />
          </div>
        </div>

        {/* Karta 4: Vyťaženosť flotily (V teréne / Servis) */}
        <div className="bg-black border-2 border-zinc-800 p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono uppercase mb-1">
            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Prenajaté / V teréne</span>
            <span className="text-blue-400 font-bold">{fleetStats.occupancyRate}% Obsadené</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {fleetStats.rented} <span className="text-xs text-zinc-500 font-normal">v prenájme</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1 flex items-center justify-between">
            <span>V servise / údržba:</span>
            <span className="text-indigo-400 font-bold font-mono">{fleetStats.maintenance} ks</span>
          </div>
          <div className="w-full bg-zinc-800 h-1 mt-2">
            <div 
              className="bg-blue-500 h-1 transition-all duration-500" 
              style={{ width: `${fleetStats.occupancyRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* HLAVNÁ GRAFICKÁ SEKCIA S RECHARTS */}
      <div className="bg-black border-2 border-zinc-800 p-4 md:p-6 mt-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-400"></span>
            <h3 className="text-sm md:text-base font-black uppercase tracking-tight text-white">
              {viewMode === 'all' && 'Kombinovaný Recharts Stĺpcový Graf (Sklad & Flotila)'}
              {viewMode === 'products' && 'Skladové Zásoby U.S.W. Podľa Kategórií'}
              {viewMode === 'fleet' && 'Stav a Dostupnosť Vozidiel Rent-a-Wheel'}
            </h3>
          </div>

          <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 inline-block"></span> Dostupné / Skladom
            </span>
            {viewMode === 'fleet' ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-500 inline-block"></span> V prenájme
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-indigo-500 inline-block"></span> V servise
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-500 inline-block"></span> Vypredané / Nedostupné
              </span>
            )}
          </div>
        </div>

        {/* Samotný graf Recharts */}
        <div className="w-full h-72 sm:h-80 md:h-96">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 font-mono text-xs gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              <span>Načítavam real-time dáta z Firestore...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'all' ? (
                /* Kombinovaný graf */
                <BarChart data={combinedChartData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                    angle={-15} 
                    textAnchor="end"
                    interval={0}
                    height={45}
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    formatter={(val) => <span className="text-zinc-300 font-mono text-xs">{val}</span>}
                  />
                  <Bar dataKey="available" name="Dostupné (Skladom / Voľné)" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="unavailable" name="Obsadené / Vypredané" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={45} />
                </BarChart>
              ) : viewMode === 'products' ? (
                /* Graf U.S.W. produktov */
                <BarChart data={productChartData} margin={{ top: 20, right: 20, left: -10, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="categoryLabel" 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    formatter={(val) => <span className="text-zinc-300 font-mono text-xs">{val}</span>}
                  />
                  <Bar dataKey="available" name="Skladom (Aktívne položky)" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="soldOut" name="Vypredané (Sold Out)" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={50} />
                </BarChart>
              ) : (
                /* Graf flotily Rent-a-Wheel */
                <BarChart data={fleetChartData} margin={{ top: 20, right: 20, left: -10, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="categoryLabel" 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    formatter={(val) => <span className="text-zinc-300 font-mono text-xs">{val}</span>}
                  />
                  <Bar dataKey="available" name="Voľné k odberu" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="rented" name="V teréne / Prenajaté" fill="#f59e0b" radius={[2, 2, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="maintenance" name="V servise / Údržba" fill="#6366f1" radius={[2, 2, 0, 0]} maxBarSize={45} />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {/* Spodná navigačná lišta na správu produktov a flotily */}
        <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="text-zinc-400">
            Priama väzba na Firestore kolekcie <span className="text-amber-400 font-bold">products</span> a <span className="text-amber-400 font-bold">vehicles</span>.
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToShop && (
              <button
                onClick={onNavigateToShop}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 font-black uppercase text-[11px] flex items-center gap-1.5 transition-all"
              >
                <Package className="w-3.5 h-3.5" /> Spravovať Produkty
              </button>
            )}

            {onNavigateToRent && (
              <button
                onClick={onNavigateToRent}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-black uppercase text-[11px] flex items-center gap-1.5 transition-all"
              >
                <Car className="w-3.5 h-3.5" /> Spravovať Flotilu
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
