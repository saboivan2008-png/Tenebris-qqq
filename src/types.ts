export type MatrixPillar = 
  | 'ALL_PILLARS'
  | 'AURU_TRINITY'
  | 'USW_STREETWEAR'
  | 'RENT_A_WHEEL'
  | 'USC_WORK'
  | 'TRADE_ZAKASAJEE'
  | 'USC_SOLIDARITY';

export interface DispatchMessage {
  id: string;
  role: 'user' | 'matrix';
  text: string;
  timestamp: string;
  pillar?: MatrixPillar;
  status?: 'sending' | 'complete' | 'error';
  metadata?: {
    calculationType?: string;
    metrics?: Record<string, string | number>;
    tags?: string[];
  };
}

export interface MultitaskThread {
  id: string;
  title: string;
  pillar: MatrixPillar;
  messages: DispatchMessage[];
  status: 'idle' | 'running' | 'completed' | 'error';
  lastActive: number;
  inputDraft: string;
}

export interface RouteCalcParams {
  origin: string;
  destination: string;
  vehicleType: string;
  cargoWeightKg: number;
  fuelPricePerLiter: number;
  tollsIncluded: boolean;
}

export interface WorkerMatchParams {
  profession: string;
  experienceYears: number;
  languageLevel: string;
  certifications: string;
  locationPreference: string;
  availableFrom: string;
}
