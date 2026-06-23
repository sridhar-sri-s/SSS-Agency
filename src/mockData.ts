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

export const SYSTEM_ADMIN: TeamMember = {
  id: 'admin',
  name: 'Global Administrator',
  role: 'System Admin',
  detail: 'Primary Admin Owner',
  avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
  userId: 'admin',
  password: 'password123'
};

// 7 Salesmen
export const SALESMEN: TeamMember[] = [
  {
    id: 'salesman_1',
    name: 'John Doe',
    role: 'Salesman',
    detail: 'Downtown Metro',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    userId: 'john_sales',
    password: 'password123'
  },
  {
    id: 'salesman_2',
    name: 'Jane Smith',
    role: 'Salesman',
    detail: 'West End Beat',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    userId: 'jane_sales',
    password: 'password123'
  },
  {
    id: 'salesman_3',
    name: 'Michael Brown',
    role: 'Salesman',
    detail: 'Eastside Plaza',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    userId: 'mike_sales',
    password: 'password123'
  },
  {
    id: 'salesman_4',
    name: 'David Chen',
    role: 'Salesman',
    detail: 'North Ridge Beat',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    userId: 'david_sales',
    password: 'password123'
  },
  {
    id: 'salesman_5',
    name: 'Sarah Jenkins',
    role: 'Salesman',
    detail: 'South Boulevard',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    userId: 'sarah_sales',
    password: 'password123'
  },
  {
    id: 'salesman_6',
    name: 'Alex Wong',
    role: 'Salesman',
    detail: 'Harbor Marina Beat',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    userId: 'alex_sales',
    password: 'password123'
  },
  {
    id: 'salesman_7',
    name: 'Emily Davis',
    role: 'Salesman',
    detail: 'Central Square',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    userId: 'emily_sales',
    password: 'password123'
  }
];

// 3 Delivery Staff (Drivers)
export const DRIVERS: TeamMember[] = [
  {
    id: 'delivery_1',
    name: 'Rajesh Kumar',
    role: 'Delivery',
    detail: 'Route Alpha-04',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    userId: 'rajesh_del',
    password: 'password123'
  },
  {
    id: 'delivery_2',
    name: 'Suresh Singh',
    role: 'Delivery',
    detail: 'Route Beta-02',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=200',
    userId: 'suresh_del',
    password: 'password123'
  },
  {
    id: 'delivery_3',
    name: 'Marcus T.',
    role: 'Delivery',
    detail: 'Route Gamma-01',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    userId: 'marcus_del',
    password: 'password123'
  }
];

// 7 Packing Staff
export const PACKERS: TeamMember[] = [
  {
    id: 'packer_1',
    name: 'Marcus Packer',
    role: 'Packing',
    detail: 'Station 1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    userId: 'marcus_pack',
    password: 'password123'
  },
  {
    id: 'packer_2',
    name: 'Linda Packer',
    role: 'Packing',
    detail: 'Station 2',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    userId: 'linda_pack',
    password: 'password123'
  },
  {
    id: 'packer_3',
    name: 'Thomas Packer',
    role: 'Packing',
    detail: 'Station 3',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    userId: 'thomas_pack',
    password: 'password123'
  },
  {
    id: 'packer_4',
    name: 'Tina Packer',
    role: 'Packing',
    detail: 'Station 4',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    userId: 'tina_pack',
    password: 'password123'
  },
  {
    id: 'packer_5',
    name: 'Steven Packer',
    role: 'Packing',
    detail: 'Station 5',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    userId: 'steven_pack',
    password: 'password123'
  },
  {
    id: 'packer_6',
    name: 'Olivia Packer',
    role: 'Packing',
    detail: 'Station 6',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    userId: 'olivia_pack',
    password: 'password123'
  },
  {
    id: 'packer_7',
    name: 'Robert Packer',
    role: 'Packing',
    detail: 'Station 7',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    userId: 'robert_pack',
    password: 'password123'
  }
];

// 2 Accounts Staff
export const EXAMINERS: TeamMember[] = [
  {
    id: 'accountant_1',
    name: 'Priya Patel',
    role: 'Accounts',
    detail: 'Audits Division',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    userId: 'priya_acct',
    password: 'password123'
  },
  {
    id: 'accountant_2',
    name: 'Sarah Conner',
    role: 'Accounts',
    detail: 'Reconciliation Desk',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    userId: 'sarah_acct',
    password: 'password123'
  }
];

export const DEFAULT_USERS: TeamMember[] = [
  SYSTEM_ADMIN,
  ...EXAMINERS,
  ...SALESMEN,
  ...PACKERS,
  ...DRIVERS
];

export const SEED_SALES_REPORTS: SalesReport[] = [
  {
    id: 'sr-1',
    date: new Date().toISOString().split('T')[0],
    salesmanId: 'salesman_1',
    salesmanName: 'John Doe',
    totalSales: 15250.50,
    beatName: 'Downtown Metro',
    status: 'Pending',
    timestamp: 'Today, 09:15 AM'
  },
  {
    id: 'sr-2',
    date: new Date().toISOString().split('T')[0],
    salesmanId: 'salesman_2',
    salesmanName: 'Jane Smith',
    totalSales: 18400.00,
    beatName: 'West End Beat',
    status: 'Verified',
    timestamp: 'Today, 10:30 AM'
  },
  {
    id: 'sr-3',
    date: new Date().toISOString().split('T')[0],
    salesmanId: 'salesman_3',
    salesmanName: 'Michael Brown',
    totalSales: 9450.00,
    beatName: 'Eastside Plaza',
    status: 'Disputed',
    remarks: 'Incorrect totals. Please review physical receipts.',
    timestamp: 'Today, 11:00 AM'
  },
  {
    id: 'sr-4',
    date: new Date().toISOString().split('T')[0],
    salesmanId: 'salesman_4',
    salesmanName: 'David Chen',
    totalSales: 12100.00,
    beatName: 'North Ridge Beat',
    status: 'Pending',
    timestamp: 'Today, 11:45 AM'
  },
  {
    id: 'sr-5',
    date: new Date().toISOString().split('T')[0],
    salesmanId: 'salesman_5',
    salesmanName: 'Sarah Jenkins',
    totalSales: 6300.00,
    beatName: 'South Boulevard',
    status: 'Verified',
    timestamp: 'Today, 12:15 PM'
  }
];

export const SEED_DAMAGE_REPORTS: DamageReport[] = [
  {
    id: 'dr-1',
    date: new Date().toISOString().split('T')[0],
    salesmanId: 'salesman_1',
    salesmanName: 'John Doe',
    shopNo: 'SH-102',
    shopName: 'Super Fresh Market',
    items: [
      { id: 'di-1', product: 'Premium Blend Tea 500g', quantity: 4, mrp: 180.00 },
      { id: 'di-2', product: 'Pure Cocoa Powder 250g', quantity: 2, mrp: 290.00 }
    ],
    status: 'Pending'
  },
  {
    id: 'dr-2',
    date: new Date().toISOString().split('T')[0],
    salesmanId: 'salesman_3',
    salesmanName: 'Michael Brown',
    shopNo: 'SH-244',
    shopName: 'Eastside Grocers',
    items: [
      { id: 'di-3', product: 'Instant Coffee Classic 100g', quantity: 10, mrp: 350.00 }
    ],
    status: 'Verified'
  }
];

export const SEED_COLLECTION_REPORTS: CollectionReport[] = [
  {
    id: 'cr-1',
    date: new Date().toISOString().split('T')[0],
    salesmanId: 'salesman_1',
    salesmanName: 'John Doe',
    beatName: 'Downtown Metro',
    collectionAmount: 14800.00,
    status: 'Pending'
  },
  {
    id: 'cr-2',
    date: new Date().toISOString().split('T')[0],
    salesmanId: 'salesman_2',
    salesmanName: 'Jane Smith',
    beatName: 'West End Beat',
    collectionAmount: 18400.00,
    status: 'Verified'
  }
];

export const SEED_PACKING_LOGS: PackingLog[] = [
  {
    id: 'pl-1',
    date: new Date().toISOString().split('T')[0],
    memberId: 'packer_1',
    memberName: 'Marcus Packer',
    station: 1,
    productsPacked: 850,
    lunchStart: '12:00 PM',
    lunchEnd: '12:30 PM',
    checkoutTime: '05:00 PM',
    status: 'Checked Out',
    efficiency: 94
  },
  {
    id: 'pl-2',
    date: new Date().toISOString().split('T')[0],
    memberId: 'packer_2',
    memberName: 'Linda Packer',
    station: 2,
    productsPacked: 920,
    lunchStart: '12:15 PM',
    lunchEnd: '12:45 PM',
    checkoutTime: 'Pending',
    status: 'Packing',
    efficiency: 97
  },
  {
    id: 'pl-3',
    date: new Date().toISOString().split('T')[0],
    memberId: 'packer_3',
    memberName: 'Thomas Packer',
    station: 3,
    productsPacked: 640,
    lunchStart: '12:30 PM',
    lunchEnd: 'In Progress',
    checkoutTime: 'Pending',
    status: 'On Break',
    efficiency: 85
  },
  {
    id: 'pl-4',
    date: new Date().toISOString().split('T')[0],
    memberId: 'packer_4',
    memberName: 'Tina Packer',
    station: 4,
    productsPacked: 1050,
    lunchStart: '01:00 PM',
    lunchEnd: '01:30 PM',
    checkoutTime: '05:00 PM',
    status: 'Checked Out',
    efficiency: 98
  },
  {
    id: 'pl-5',
    date: new Date().toISOString().split('T')[0],
    memberId: 'packer_5',
    memberName: 'Steven Packer',
    station: 5,
    productsPacked: 410,
    lunchStart: 'Pending',
    lunchEnd: 'Pending',
    checkoutTime: 'Pending',
    status: 'Packing',
    efficiency: 78
  }
];

export const SEED_RETURNS: ReturnReport[] = [
  {
    id: 'ret-1',
    date: new Date().toISOString().split('T')[0],
    driverId: 'delivery_1',
    driverName: 'Rajesh Kumar',
    shopNo: 'SH-0921',
    shopName: 'Corner Mart',
    productName: 'Premium Blend Coffee 500g',
    quantity: 5,
    mrp: 250.00,
    status: 'Pending',
    remarks: 'Damaged packaging'
  },
  {
    id: 'ret-2',
    date: new Date().toISOString().split('T')[0],
    driverId: 'delivery_2',
    driverName: 'Suresh Singh',
    shopNo: 'SH-1054',
    shopName: 'City Foods',
    productName: 'Expired Dairy Products',
    quantity: 4,
    mrp: 45.00,
    items: [{ id: 'ret1', productName: 'Expired Dairy Products', quantity: 4, mrp: 45.00 }],
    status: 'Verified',
    remarks: 'Expired stock'
  }
];

export const SEED_MILEAGE: MileageReport[] = [
  {
    id: 'mil-1',
    date: new Date().toISOString().split('T')[0],
    driverId: 'delivery_1',
    driverName: 'Rajesh Kumar',
    routeId: 'Route Alpha-04',
    startOdo: 124500,
    endOdo: 124610,
    fuelExpenses: 1200.00,
    status: 'Verified'
  },
  {
    id: 'mil-2',
    date: new Date().toISOString().split('T')[0],
    driverId: 'delivery_2',
    driverName: 'Suresh Singh',
    routeId: 'Route Beta-02',
    startOdo: 84210,
    endOdo: 84350,
    fuelExpenses: 1800.00,
    status: 'Pending'
  }
];

export const SEED_DRIVER_COLLECTIONS: MarketCollection[] = [
  {
    id: 'mc-1',
    date: new Date().toISOString().split('T')[0],
    driverId: 'delivery_1',
    driverName: 'Rajesh Kumar',
    type: 'Cash',
    amount: 5400.00,
    shopNo: 'SH-0921',
    shopName: 'Corner Mart',
    status: 'Pending'
  },
  {
    id: 'mc-2',
    date: new Date().toISOString().split('T')[0],
    driverId: 'delivery_2',
    driverName: 'Suresh Singh',
    type: 'IMPS',
    amount: 12500.00,
    shopNo: 'SH-0341',
    shopName: 'Metro Plaza',
    referenceNo: 'IMPS867114A',
    status: 'Verified'
  },
  {
    id: 'mc-3',
    date: new Date().toISOString().split('T')[0],
    driverId: 'delivery_1',
    driverName: 'Rajesh Kumar',
    type: 'Cheque',
    amount: 35000.00,
    shopNo: 'SH-0112',
    shopName: 'Grand Bazaar',
    referenceNo: 'CHQ-88910',
    chequeDate: new Date().toISOString().split('T')[0],
    status: 'Pending'
  }
];
