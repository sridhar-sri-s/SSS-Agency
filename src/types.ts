export interface DamageItem {
  id: string;
  product: string;
  quantity: number;
  mrp: number;
}

export interface ReturnItem {
  id: string;
  productName: string;
  quantity: number;
  mrp: number;
  reason?: string;
}

export interface SalesReport {
  id: string;
  date: string;
  salesmanId: string;
  salesmanName: string;
  totalSales: number;
  beatName: string;
  status: 'Pending' | 'Verified' | 'Disputed';
  remarks?: string;
  timestamp: string;
  images?: string[];
  createdAt?: string;
}

export interface DamageReport {
  id: string;
  date: string;
  salesmanId: string;
  salesmanName: string;
  shopNo: string;
  shopName: string;
  items: DamageItem[];
  status: 'Pending' | 'Verified' | 'Disputed';
  remarks?: string;
  images?: string[];
  createdAt?: string;
}

export interface CollectionReport {
  id: string;
  date: string;
  salesmanId: string;
  salesmanName: string;
  beatName: string;
  collectionAmount: number;
  status: 'Pending' | 'Verified' | 'Disputed';
  remarks?: string;
  images?: string[];
  createdAt?: string;
}

export interface PackingLog {
  id: string;
  date: string;
  memberId: string;
  memberName: string;
  station: number;
  productsPacked: number;
  lunchStart: string; // e.g. "12:00 PM"
  lunchEnd: string; // e.g. "12:30 PM"
  checkoutTime: string; // e.g. "05:00 PM"
  status: 'Packing' | 'On Break' | 'Checked Out';
  efficiency: number; // e.g. 96 (%)
  images?: string[];
  createdAt?: string;
}

export interface ReturnReport {
  id: string;
  date: string;
  driverId: string;
  driverName: string;
  shopNo: string;
  shopName: string;
  items: ReturnItem[];
  // Legacy single-item fields kept for backward compat display
  productName?: string;
  quantity?: number;
  mrp?: number;
  status: 'Pending' | 'Verified' | 'Disputed';
  remarks?: string;
  images?: string[];
  createdAt?: string;
}

export interface MileageReport {
  id: string;
  date: string;
  driverId: string;
  driverName: string;
  routeId: string;
  startOdo: number;
  endOdo: number;
  fuelExpenses: number;
  status: 'Pending' | 'Verified' | 'Disputed';
  remarks?: string;
  images?: string[];
  createdAt?: string;
}

export interface MarketCollection {
  id: string;
  date: string;
  driverId: string;
  driverName: string;
  type: 'Cash' | 'IMPS' | 'Cheque';
  amount: number;
  shopNo: string;
  shopName: string;
  referenceNo?: string; // Cheque No or IMPS No
  chequeDate?: string;
  status: 'Pending' | 'Verified' | 'Disputed';
  remarks?: string;
  images?: string[];
  createdAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Salesman' | 'Packing' | 'Delivery' | 'Accounts' | 'System Admin';
  detail?: string; // e.g. "Station 1" or "Beat 1" or "Route Alpha"
  avatar: string;
  userId?: string;
  password?: string;
}
