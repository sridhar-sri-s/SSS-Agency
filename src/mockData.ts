import { 
  TeamMember, 
  SalesReport, 
  DamageReport, 
  CollectionReport, 
  PackingLog, 
  ReturnReport, 
  MileageReport, 
  MarketCollection 
} from './types';

export const EXAMINERS: TeamMember[] = [];
export const SALESMEN: TeamMember[] = [];
export const PACKERS: TeamMember[] = [];
export const DRIVERS: TeamMember[] = [];

export const SYSTEM_ADMIN: TeamMember = {
  id: 'admin',
  name: 'Global Administrator',
  role: 'System Admin',
  detail: 'Primary Admin Owner',
  avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
  userId: 'admin',
  password: 'password123'
};

export const DEFAULT_USERS: TeamMember[] = [
  SYSTEM_ADMIN
];

export const SEED_SALES_REPORTS: SalesReport[] = [];
export const SEED_DAMAGE_REPORTS: DamageReport[] = [];
export const SEED_COLLECTION_REPORTS: CollectionReport[] = [];
export const SEED_PACKING_LOGS: PackingLog[] = [];
export const SEED_RETURNS: ReturnReport[] = [];
export const SEED_MILEAGE: MileageReport[] = [];
export const SEED_DRIVER_COLLECTIONS: MarketCollection[] = [];

