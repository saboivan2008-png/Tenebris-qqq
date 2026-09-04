import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { uswProducts } from '../data';

/**
 * Typy a rozhrania pre skladové hospodárstvo U.S.W. a Rent-a-Wheel flotilu
 */

export type ProductStatus = 'available' | 'sold_out' | 'hidden';
export type VehicleStatus = 'available' | 'rented' | 'maintenance';

export interface UswProductInventory {
  id: string;
  name: string;
  category: string;
  price: string;
  color?: string;
  image?: string;
  status: ProductStatus;
  stockQuantity?: number;
  sizes?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleAvailability {
  id: string;
  name: string;
  type: string;
  category?: 'taxi' | 'cargo' | 'vip' | string;
  priceDay?: string;
  priceWeek?: string;
  fuel?: string;
  gear?: string;
  image?: string;
  status: VehicleStatus;
  licensePlate?: string;
  seats?: number;
  location?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UswInventorySummary {
  totalCount: number;
  availableCount: number;
  soldOutCount: number;
  categories: Record<string, { total: number; available: number }>;
}

export interface FleetAvailabilitySummary {
  totalFleet: number;
  availableCount: number;
  rentedCount: number;
  maintenanceCount: number;
  availabilityRatePercentage: number;
  byCategory: {
    taxi: { total: number; available: number };
    cargo: { total: number; available: number };
    vip: { total: number; available: number };
    other: { total: number; available: number };
  };
}

// Záložná flotila vozidiel pre prípad prázdnej databázy
export const fallbackFleet: VehicleAvailability[] = [
  {
    id: 'car-1',
    name: 'Škoda Octavia Combi IV 2.0 TDI',
    type: 'Taxi / Bolt / Wolt Ready',
    category: 'taxi',
    priceDay: '€35 / deň',
    priceWeek: '€190 / týždeň',
    fuel: 'Diesel (4.2l/100km)',
    gear: 'Automat DSG',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'car-2',
    name: 'Toyota Corolla Touring Sports Hybrid',
    type: 'Bolt / Uber Gold Certifikát',
    category: 'taxi',
    priceDay: '€38 / deň',
    priceWeek: '€210 / týždeň',
    fuel: 'Hybrid (3.8l/100km)',
    gear: 'Automat e-CVT',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'van-1',
    name: 'VW Transporter T6.1 Long 2.0 TDI',
    type: 'Úžitková Dodávka / Sťahovanie',
    category: 'cargo',
    priceDay: '€65 / deň',
    priceWeek: '€350 / týždeň',
    fuel: 'Diesel',
    gear: 'Manuál 6-st.',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'van-2',
    name: 'Mercedes-Benz Sprinter Maxi 316',
    type: 'Veľkoobjemový Nákladný Transport',
    category: 'cargo',
    priceDay: '€85 / deň',
    priceWeek: '€450 / týždeň',
    fuel: 'Diesel',
    gear: 'Manuál',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1586191582056-a609d9426f8d?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'vip-1',
    name: 'BMW 330d xDrive M-Sport Touring',
    type: 'VIP / Reprezentatívny Odvoz',
    category: 'vip',
    priceDay: '€95 / deň',
    priceWeek: '€520 / týždeň',
    fuel: 'Diesel 195kW',
    gear: 'Automat 8-st.',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000'
  }
];

// Mapovanie statických produktov ako fallback
export const fallbackUswProducts: UswProductInventory[] = uswProducts.map(p => ({
  id: p.id,
  name: p.name,
  category: p.cat,
  price: p.price,
  color: p.color,
  image: p.image,
  status: 'available' as ProductStatus
}));

// ============================================================================
// 1. ČÍTANIE STAVU SKLADU U.S.W. PRODUKTOV Z FIRESTORE
// ============================================================================

/**
 * Načíta všetky produkty z kolekcie `products` vo Firestore.
 * @param includeHidden Ak je true, načíta aj skryté položky (vyžaduje admin práva podľa firestore.rules)
 * @returns Zoznam U.S.W. produktov so stavom skladu
 */
export async function getUswProductsInventory(includeHidden = false): Promise<UswProductInventory[]> {
  try {
    const productsRef = collection(db, 'products');
    const productsQuery = includeHidden 
      ? query(productsRef)
      : query(productsRef, where('status', '!=', 'hidden'));

    const snapshot = await getDocs(productsQuery);
    
    if (snapshot.empty) {
      // Ak je Firestore zatiaľ bez produktov, vrátime predvolené produkty
      return fallbackUswProducts;
    }

    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || 'Neznámy produkt',
        category: data.category || 'ostatné',
        price: data.price || '€0',
        color: data.color,
        image: data.image,
        status: (data.status as ProductStatus) || 'available',
        stockQuantity: typeof data.stockQuantity === 'number' ? data.stockQuantity : undefined,
        sizes: Array.isArray(data.sizes) ? data.sizes : undefined,
        description: data.description,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });
  } catch (error) {
    console.error('[InventoryService] Chyba pri načítaní produktov z Firestore:', error);
    handleFirestoreError(error, OperationType.LIST, 'products');
    return fallbackUswProducts;
  }
}

/**
 * Načíta jeden konkrétny U.S.W. produkt podľa ID z Firestore.
 * @param productId ID dokumentu produktu
 */
export async function getUswProductById(productId: string): Promise<UswProductInventory | null> {
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        category: data.category,
        price: data.price,
        color: data.color,
        image: data.image,
        status: (data.status as ProductStatus) || 'available',
        stockQuantity: data.stockQuantity,
        sizes: data.sizes,
        description: data.description,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    }

    // Skontrolujeme aj fallback
    const fallbackItem = fallbackUswProducts.find(p => p.id === productId);
    return fallbackItem || null;
  } catch (error) {
    console.error(`[InventoryService] Chyba pri načítaní produktu ${productId}:`, error);
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Prihlási sa na real-time odber zmien skladu produktov cez Firestore onSnapshot.
 * @param onUpdate Callback vyvolaný pri zmene dát v kolekcii products
 * @param onError Callback pre prípadné chyby oprávnení alebo siete
 * @returns Odhlasovacia funkcia (Unsubscribe)
 */
export function subscribeToUswProductsInventory(
  onUpdate: (products: UswProductInventory[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const q = query(collection(db, 'products'), where('status', '!=', 'hidden'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(fallbackUswProducts);
        return;
      }

      const products: UswProductInventory[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || '',
          category: data.category || '',
          price: data.price || '',
          color: data.color,
          image: data.image,
          status: (data.status as ProductStatus) || 'available',
          stockQuantity: data.stockQuantity,
          sizes: data.sizes,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      });

      onUpdate(products);
    },
    (error) => {
      console.warn('[InventoryService] onSnapshot fallback pre produkty:', error);
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
      onUpdate(fallbackUswProducts);
    }
  );
}

/**
 * Overí okamžitú skladovú dostupnosť produktu podľa ID.
 * @param productId ID produktu
 */
export async function checkProductStock(productId: string): Promise<{
  inStock: boolean;
  product: UswProductInventory | null;
  status: ProductStatus | 'not_found';
}> {
  const product = await getUswProductById(productId);
  if (!product) {
    return { inStock: false, product: null, status: 'not_found' };
  }

  const inStock = product.status === 'available' && (product.stockQuantity === undefined || product.stockQuantity > 0);
  return {
    inStock,
    product,
    status: product.status
  };
}

/**
 * Vypočíta štatistiky skladu produktov U.S.W. (celkový počet, dostupné, vypredané, podľa kategórií)
 */
export async function getUswInventorySummary(): Promise<UswInventorySummary> {
  const products = await getUswProductsInventory();

  const summary: UswInventorySummary = {
    totalCount: products.length,
    availableCount: 0,
    soldOutCount: 0,
    categories: {}
  };

  for (const item of products) {
    const isAvail = item.status === 'available';
    if (isAvail) {
      summary.availableCount++;
    } else {
      summary.soldOutCount++;
    }

    const cat = item.category || 'ostatné';
    if (!summary.categories[cat]) {
      summary.categories[cat] = { total: 0, available: 0 };
    }
    summary.categories[cat].total++;
    if (isAvail) {
      summary.categories[cat].available++;
    }
  }

  return summary;
}

// ============================================================================
// 2. ČÍTANIE DOSTUPNOSTI VOZIDIEL V RENT-A-WHEEL Z FIRESTORE
// ============================================================================

/**
 * Načíta všetky vozidlá a ich aktuálny stav dostupnosti z kolekcie `vehicles` vo Firestore.
 * @returns Zoznam vozidiel flotily s údajmi o dostupnosti
 */
export async function getFleetVehiclesAvailability(): Promise<VehicleAvailability[]> {
  try {
    const vehiclesRef = collection(db, 'vehicles');
    const snapshot = await getDocs(vehiclesRef);

    if (snapshot.empty) {
      // Ak vo Firestore ešte nie sú uložené vozidlá, použijeme predvolenú flotilu
      return fallbackFleet;
    }

    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || 'Vozidlo bez názvu',
        type: data.type || '',
        category: data.category,
        priceDay: data.priceDay,
        priceWeek: data.priceWeek,
        fuel: data.fuel,
        gear: data.gear,
        image: data.image,
        status: (data.status as VehicleStatus) || 'available',
        licensePlate: data.licensePlate,
        seats: typeof data.seats === 'number' ? data.seats : undefined,
        location: data.location,
        notes: data.notes,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });
  } catch (error) {
    console.error('[InventoryService] Chyba pri načítaní vozidiel z Firestore:', error);
    handleFirestoreError(error, OperationType.LIST, 'vehicles');
    return fallbackFleet;
  }
}

/**
 * Načíta detail a dostupnosť jedného vozidla podľa ID z Firestore.
 * @param vehicleId ID dokumentu vozidla
 */
export async function getVehicleAvailabilityById(vehicleId: string): Promise<VehicleAvailability | null> {
  const path = `vehicles/${vehicleId}`;
  try {
    const docRef = doc(db, 'vehicles', vehicleId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        type: data.type,
        category: data.category,
        priceDay: data.priceDay,
        priceWeek: data.priceWeek,
        fuel: data.fuel,
        gear: data.gear,
        image: data.image,
        status: (data.status as VehicleStatus) || 'available',
        licensePlate: data.licensePlate,
        seats: data.seats,
        location: data.location,
        notes: data.notes,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    }

    const fallbackVehicle = fallbackFleet.find(v => v.id === vehicleId);
    return fallbackVehicle || null;
  } catch (error) {
    console.error(`[InventoryService] Chyba pri načítaní vozidla ${vehicleId}:`, error);
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Prihlási sa na real-time odber zmien dostupnosti vozidiel cez Firestore onSnapshot.
 * @param onUpdate Callback vyvolaný pri zmene dát v kolekcii vehicles
 * @param onError Callback pre prípadné chyby
 * @returns Odhlasovacia funkcia (Unsubscribe)
 */
export function subscribeToFleetAvailability(
  onUpdate: (vehicles: VehicleAvailability[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const q = collection(db, 'vehicles');

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(fallbackFleet);
        return;
      }

      const vehicles: VehicleAvailability[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || '',
          type: data.type || '',
          category: data.category,
          priceDay: data.priceDay,
          priceWeek: data.priceWeek,
          fuel: data.fuel,
          gear: data.gear,
          image: data.image,
          status: (data.status as VehicleStatus) || 'available',
          licensePlate: data.licensePlate,
          seats: data.seats,
          location: data.location,
          notes: data.notes,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      });

      onUpdate(vehicles);
    },
    (error) => {
      console.warn('[InventoryService] onSnapshot fallback pre vozidlá:', error);
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'vehicles');
      }
      onUpdate(fallbackFleet);
    }
  );
}

/**
 * Overí, či je vozidlo k dispozícii na okamžitý prenájom (status === 'available').
 * @param vehicleId ID vozidla
 */
export async function checkVehicleAvailable(vehicleId: string): Promise<{
  isAvailable: boolean;
  vehicle: VehicleAvailability | null;
  status: VehicleStatus | 'not_found';
}> {
  const vehicle = await getVehicleAvailabilityById(vehicleId);
  if (!vehicle) {
    return { isAvailable: false, vehicle: null, status: 'not_found' };
  }

  return {
    isAvailable: vehicle.status === 'available',
    vehicle,
    status: vehicle.status
  };
}

/**
 * Vypočíta globálne štatistiky dostupnosti flotily vozidiel (Rent-a-Wheel)
 */
export async function getFleetAvailabilitySummary(): Promise<FleetAvailabilitySummary> {
  const fleet = await getFleetVehiclesAvailability();

  const summary: FleetAvailabilitySummary = {
    totalFleet: fleet.length,
    availableCount: 0,
    rentedCount: 0,
    maintenanceCount: 0,
    availabilityRatePercentage: 0,
    byCategory: {
      taxi: { total: 0, available: 0 },
      cargo: { total: 0, available: 0 },
      vip: { total: 0, available: 0 },
      other: { total: 0, available: 0 }
    }
  };

  for (const car of fleet) {
    if (car.status === 'available') {
      summary.availableCount++;
    } else if (car.status === 'rented') {
      summary.rentedCount++;
    } else if (car.status === 'maintenance') {
      summary.maintenanceCount++;
    }

    const catKey = (car.category === 'taxi' || car.category === 'cargo' || car.category === 'vip')
      ? car.category
      : 'other';

    summary.byCategory[catKey].total++;
    if (car.status === 'available') {
      summary.byCategory[catKey].available++;
    }
  }

  if (summary.totalFleet > 0) {
    summary.availabilityRatePercentage = Math.round((summary.availableCount / summary.totalFleet) * 100);
  }

  return summary;
}
