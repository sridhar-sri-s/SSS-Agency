import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Users, Truck, CheckCircle2, AlertCircle, Clock, 
  Search, ShieldAlert, ArrowUpRight, Check, X, RefreshCw, MessageSquare, MapPin, 
  Coffee, Calendar, DollarSign, Package, Compass, ChevronDown, ChevronUp, Award
} from 'lucide-react';
import { 
  SalesReport, DamageReport, CollectionReport, 
  PackingLog, ReturnReport, MileageReport, MarketCollection, TeamMember 
} from '../types';
import TeamManagement from './TeamManagement';

interface AdminViewsProps {
  currentTab: string;
  isAdmin: boolean;
  usersList: TeamMember[];
  apiAddUser: (user: TeamMember) => Promise<void>;
  apiUpdateUser: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  apiRemoveUser: (id: string) => Promise<void>;
  setUsersList: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  salesReports: SalesReport[];
  damageReports: DamageReport[];
  collectionReports: CollectionReport[];
  packingLogs: PackingLog[];
  returnReports: ReturnReport[];
  mileageReports: MileageReport[];
  marketCollections: MarketCollection[];
  onVerifySalesReport: (id: string, status: 'Verified' | 'Disputed' | 'Pending', remarks?: string) => void;
  onVerifyDamageReport: (id: string, status: 'Verified' | 'Disputed' | 'Pending', remarks?: string) => void;
  onVerifyCollectionReport: (id: string, status: 'Verified' | 'Disputed' | 'Pending', remarks?: string) => void;
  onVerifyReturnReport: (id: string, status: 'Verified' | 'Disputed' | 'Pending', remarks?: string) => void;
  onVerifyMileageReport: (id: string, status: 'Verified' | 'Disputed' | 'Pending', remarks?: string) => void;
  onVerifyMarketCollection: (id: string, status: 'Verified' | 'Disputed' | 'Pending', remarks?: string) => void;
}

// Helper to get the display-friendly month options (current + past 5)
function getMonthOptions(): { label: string; value: string }[] {
  const options: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    options.push({ label, value });
  }
  return options;
}

// Helper to get return items from a ReturnReport (handles both new multi-item and legacy single-item)
function getReturnItems(ret: ReturnReport): { productName: string; quantity: number; mrp: number; reason?: string }[] {
  if (ret.items && ret.items.length > 0) {
    return ret.items.map(item => ({
      productName: item.productName,
      quantity: item.quantity,
      mrp: item.mrp,
      reason: item.reason,
    }));
  }
  // Legacy fallback: single productName/quantity/mrp fields
  if (ret.productName) {
    return [{
      productName: ret.productName,
      quantity: ret.quantity ?? 0,
      mrp: ret.mrp ?? 0,
      reason: ret.remarks,
    }];
  }
  return [];
}

// Helper to compute total value of a return report
function getReturnTotalValue(ret: ReturnReport): number {
  const items = getReturnItems(ret);
  return items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
}

// Helper to get display product name / summary for a return
function getReturnDisplayName(ret: ReturnReport): string {
  const items = getReturnItems(ret);
  if (items.length === 0) return 'No items';
  if (items.length === 1) return items[0].productName;
  return `${items.length} items`;
}

// Helper: total quantity for a return
function getReturnTotalQuantity(ret: ReturnReport): number {
  const items = getReturnItems(ret);
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export default function AdminViews({
  currentTab,
  isAdmin,
  usersList,
  apiAddUser,
  apiUpdateUser,
  apiRemoveUser,
  setUsersList,
  salesReports,
  damageReports,
  collectionReports,
  packingLogs,
  returnReports,
  mileageReports,
  marketCollections,
  onVerifySalesReport,
  onVerifyDamageReport,
  onVerifyCollectionReport,
  onVerifyReturnReport,
  onVerifyMileageReport,
  onVerifyMarketCollection
}: AdminViewsProps) {
  
  // --- STATE FOR SEARCHES ---
  const [salesSearch, setSalesSearch] = useState('');
  const [packingSearch, setPackingSearch] = useState('');
  const [returnsSearch, setReturnsSearch] = useState('');

  // --- DASHBOARD FRESHNESS STATE ---
  const [dashboardDate, setDashboardDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // --- CONFIGURABLE TARGETS STATE ---
  const [dailyTarget, setDailyTarget] = useState<number>(() => {
    return parseInt(localStorage.getItem('distro_daily_target') || '10000', 10);
  });
  const [monthlyTarget, setMonthlyTarget] = useState<number>(() => {
    return parseInt(localStorage.getItem('distro_monthly_target') || '1000', 10);
  });

  const saveDailyTarget = (val: number) => {
    setDailyTarget(val);
    localStorage.setItem('distro_daily_target', val.toString());
  };

  const saveMonthlyTarget = (val: number) => {
    setMonthlyTarget(val);
    localStorage.setItem('distro_monthly_target', val.toString());
  };

  // --- DAILY FILTERED DATA ---
  const todaySalesReports = useMemo(() => salesReports.filter(r => r.date === dashboardDate), [salesReports, dashboardDate]);
  const todayDamageReports = useMemo(() => damageReports.filter(r => r.date === dashboardDate), [damageReports, dashboardDate]);
  const todayCollectionReports = useMemo(() => collectionReports.filter(r => r.date === dashboardDate), [collectionReports, dashboardDate]);
  const todayPackingLogs = useMemo(() => packingLogs.filter(l => l.date === dashboardDate), [packingLogs, dashboardDate]);
  const todayReturnReports = useMemo(() => returnReports.filter(r => r.date === dashboardDate), [returnReports, dashboardDate]);
  const todayMileageReports = useMemo(() => mileageReports.filter(r => r.date === dashboardDate), [mileageReports, dashboardDate]);
  const todayMarketCollections = useMemo(() => marketCollections.filter(c => c.date === dashboardDate), [marketCollections, dashboardDate]);

  // --- STATE FOR ACCOUNTS MODAL/REMARKS REMEDIAL ACTIONS ---
  const [activeAuditItem, setActiveAuditItem] = useState<{
    id: string;
    type: 'sales_rep' | 'damage_rep' | 'collection_rep' | 'return_rep' | 'mileage_rep' | 'market_coll';
    remarks: string;
  } | null>(null);

  // --- IMAGE VIEWING STATE ---
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // --- MONTHLY PACKING PROGRESS STATE ---
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);

  // --- RETURN REPORT EXPANDED ITEMS STATE ---
  const [expandedReturnIds, setExpandedReturnIds] = useState<Set<string>>(new Set());

  const toggleReturnExpand = (id: string) => {
    setExpandedReturnIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // --- DYNAMIC Telemetry Stream ---
  const dynamicActivities = useMemo(() => {
    const list: { text: string; time: string; sub: string; timestampVal: number }[] = [];
    
    salesReports.forEach(r => {
      list.push({
        text: `${r.salesmanName} uploaded a sales report`,
        time: 'Sales Report',
        sub: `${r.beatName} | ₹${r.totalSales.toLocaleString()}`,
        timestampVal: r.createdAt ? new Date(r.createdAt).getTime() : Date.now() - 60000
      });
    });
    
    damageReports.forEach(r => {
      list.push({
        text: `${r.salesmanName} logged damaged products`,
        time: 'Damage Claim',
        sub: `${r.shopName} | ${r.items?.length || 0} items`,
        timestampVal: r.createdAt ? new Date(r.createdAt).getTime() : Date.now() - 120000
      });
    });

    packingLogs.forEach(l => {
      list.push({
        text: `${l.memberName} logged packing status: ${l.status}`,
        time: 'Packing Log',
        sub: `Station ${l.station} | ${l.productsPacked} packed | ${l.efficiency}% eff`,
        timestampVal: l.createdAt ? new Date(l.createdAt).getTime() : Date.now() - 180000
      });
    });

    returnReports.forEach(r => {
      const displayName = getReturnDisplayName(r);
      const totalQty = getReturnTotalQuantity(r);
      list.push({
        text: `${r.driverName} logged returned products`,
        time: 'Delivery Return',
        sub: `${r.shopName} | ${displayName} x${totalQty}`,
        timestampVal: r.createdAt ? new Date(r.createdAt).getTime() : Date.now() - 240000
      });
    });

    marketCollections.forEach(c => {
      list.push({
        text: `${c.driverName} collected payment`,
        time: 'Payment Collection',
        sub: `${c.shopName} | ₹${c.amount.toLocaleString()} via ${c.type}`,
        timestampVal: c.createdAt ? new Date(c.createdAt).getTime() : Date.now() - 300000
      });
    });

    // Sort by timestampVal descending
    const sorted = list.sort((a, b) => b.timestampVal - a.timestampVal).slice(0, 8);
    
    return sorted.map(item => {
      const diffMs = Date.now() - item.timestampVal;
      let timeStr = 'Just now';
      if (diffMs > 60000) {
        const mins = Math.floor(diffMs / 60000);
        timeStr = mins === 1 ? '1 min ago' : `${mins} mins ago`;
        if (mins >= 60) {
          const hrs = Math.floor(mins / 60);
          timeStr = hrs === 1 ? '1 hr ago' : `${hrs} hrs ago`;
        }
      }
      return {
        text: item.text,
        time: timeStr,
        sub: item.sub
      };
    });
  }, [salesReports, damageReports, packingLogs, returnReports, marketCollections]);

  // Helper status color rendering mapping
  const getStatusBadge = (status: 'Verified' | 'Disputed' | 'Pending') => {
    switch (status) {
      case 'Verified':
        return <span className="inline-flex items-center gap-1 bg-[#E4F9EC] text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">● Verified</span>;
      case 'Disputed':
        return <span className="inline-flex items-center gap-1 bg-[#FDF2F2] text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">● Disputed</span>;
      case 'Pending':
      default:
        return <span className="inline-flex items-center gap-1 bg-[#FFF8EB] text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">● Pending</span>;
    }
  };

  // Helper function to return border and highlight color based on report verification status
  const getStatusClass = (status: 'Verified' | 'Disputed' | 'Pending') => {
    switch (status) {
      case 'Verified': return 'border-l-4 border-l-emerald-500 bg-emerald-50/20';
      case 'Disputed': return 'border-l-4 border-l-red-500 bg-red-50/20';
      case 'Pending':
      default: return 'border-l-4 border-l-amber-500 bg-amber-50/20';
    }
  };


  // ==========================================
  // TAB 1: OVERVIEW SCREEN (Screenshot 1)
  // ==========================================
  const renderOverview = () => {
    // Aggregates
    const totalSalesSum = todaySalesReports.reduce((s, r) => s + r.totalSales, 0);
    const activePackers = packingLogs.filter(p => p.status === 'Packing').length;
    const pendingAudits = salesReports.filter(r => r.status === 'Pending').length + 
                          damageReports.filter(r => r.status === 'Pending').length + 
                          returnReports.filter(r => r.status === 'Pending').length;
    
    // Average efficiency
    const packingEff = Math.round(todayPackingLogs.reduce((s, l) => s + l.efficiency, 0) / (todayPackingLogs.length || 1));

    return (
      <div id="overview-view" className="space-y-6">
        {/* Prime Banner Greeting */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-xs text-amber-300 font-bold tracking-wider uppercase">Live Operations Room</span>
            <h1 className="text-2xl font-bold tracking-tight">Company Management Monitor</h1>
            <p className="text-xs text-neutral-300 max-w-xl">
              Facilitating interactive coordination across {todaySalesReports.length}-record sales beats, {todayPackingLogs.length} packing stations, and active delivery routes.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_right,_rgba(251,191,36,0.15),_transparent)] pointer-events-none" />
        </div>

        {/* Dynamic Bento Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="apple-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs text-neutral-500 font-medium font-sans">Total Sales volume</span>
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={16} /></div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-neutral-900 tracking-tight font-mono-sm">
                ₹{totalSalesSum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-medium">
                <ArrowUpRight size={12} />
                <span>+14.5% versus yesterday</span>
              </div>
            </div>
          </div>

          <div className="apple-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs text-neutral-500 font-medium">Active Packing Staff</span>
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={16} /></div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                {activePackers} / 7 Online
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-indigo-600 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                <span>Active packing benches running</span>
              </div>
            </div>
          </div>

          <div className="apple-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs text-neutral-500 font-medium">Outstanding Audits Plan</span>
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><ShieldAlert size={16} /></div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                {pendingAudits} Pending
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-600 font-medium">
                <AlertCircle size={12} />
                <span>Requires Accounts team review</span>
              </div>
            </div>
          </div>

          <div className="apple-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs text-neutral-500 font-medium">Packing Efficiency</span>
              <div className="p-1.5 bg-neutral-950 text-neutral-100 rounded-lg"><CheckCircle2 size={16} /></div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-neutral-900 tracking-tight font-mono-sm">
                {packingEff}%
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-500 font-semibold text-neutral-600">
                <span>Overall average speed coefficient</span>
              </div>
            </div>
          </div>
        </div>

        {/* Split Section: Team Activity Ledger & Quick Overview Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Latest Reports List */}
          <div className="lg:col-span-7 apple-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-bold text-neutral-800 text-sm">Latest Reports Stream</h3>
                <p className="text-[11px] text-neutral-500">Recently filed salesmen reports pending review or finalized.</p>
              </div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase">Automated Logs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                    <th className="py-2.5">Salesman</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5 text-right">Gross Total</th>
                    <th className="py-2.5 text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {salesReports.slice(0, 5).map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50/50 transition-colors text-xs text-neutral-700">
                      <td className="py-3 font-semibold text-neutral-950">{r.salesmanName}</td>
                      <td className="py-3 text-neutral-500">{r.date}</td>
                      <td className="py-3 text-right font-mono-sm font-semibold">₹{r.totalSales.toLocaleString()}</td>
                      <td className="py-3 text-center">{getStatusBadge(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Ledger Flow */}
          <div className="lg:col-span-5 apple-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-bold text-neutral-800 text-sm">Real-time Team Activities</h3>
                <p className="text-[11px] text-neutral-400">Chronological telemetry of logged submissions</p>
              </div>
              <Clock size={16} className="text-neutral-400 rotate-18 degrees" />
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {dynamicActivities.map((act, index) => (
                <div key={index} className="flex gap-3 text-xs border-b border-neutral-50 pb-3 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-800 leading-snug">{act.text}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{act.sub}</p>
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0 font-mono-sm">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  };


  // ==========================================
  // TAB 2: SALES PORTAL (Screenshot 2)
  // ==========================================
  const renderSales = () => {
    // Dynamic Graph Logic
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(dashboardDate);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const salesByDay = last7Days.map(date => {
      return salesReports
        .filter(r => r.date === date)
        .reduce((sum, r) => sum + r.totalSales, 0);
    });

    const maxGraphSales = Math.max(...salesByDay, 1000);
    
    // SVG uses 100x30 coordinate system
    const points = salesByDay.map((sales, i) => {
      const x = (i / 6) * 100;
      const y = 28 - ((sales / maxGraphSales) * 24); // range from 4 to 28
      return { x, y, sales, date: last7Days[i] };
    });

    // Create SVG paths
    const pathD = `M 0,30 ` + points.map(p => `L ${p.x},${p.y}`).join(' ') + ` L 100,30 Z`;
    const lineD = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');

    const formatShortDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Compute stats
    const totalSales = salesReports.reduce((s, r) => s + r.totalSales, 0);
    const totalCollected = collectionReports.reduce((s, r) => s + r.collectionAmount, 0);
    const damageQty = damageReports.length;

    // Filtered list
    const filteredReports = salesReports.filter(report => {
      const q = salesSearch.toLowerCase();
      return report.salesmanName.toLowerCase().includes(q) || 
             report.beatName.toLowerCase().includes(q) ||
             report.date.includes(q);
    });

    return (
      <div id="sales-view" className="space-y-6">
        
        {/* KPI Scorecard block */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="apple-card p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Gross Sales total</p>
              <h3 className="text-2xl font-extrabold text-neutral-900 tracking-tight font-mono-sm mt-1">
                ₹{totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </h3>
            </div>
            <TrendingUp className="text-blue-500 shrink-0 bg-blue-50 p-2 rounded-lg" size={40} />
          </div>

          <div className="apple-card p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Payments Collected</p>
              <h3 className="text-2xl font-extrabold text-neutral-900 tracking-tight font-mono-sm mt-1">
                ₹{totalCollected.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </h3>
            </div>
            <DollarSign className="text-emerald-500 shrink-0 bg-emerald-50 p-2 rounded-lg" size={40} />
          </div>

          <div className="apple-card p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Log Damaged SKUs</p>
              <h3 className="text-2xl font-extrabold text-neutral-900 tracking-tight font-mono-sm mt-1">
                {damageQty} Products
              </h3>
            </div>
            <AlertCircle className="text-rose-500 shrink-0 bg-rose-50 p-2 rounded-lg" size={40} />
          </div>
        </div>

        {/* Performance Line trend charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="apple-card p-6 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-neutral-800">Total Sales Trend Graph</h4>
              <p className="text-[11px] text-neutral-400">Weekly cumulative distributions monitor</p>
            </div>
            
            {/* Dynamic SVG line chart */}
            <div className="h-48 w-full border border-neutral-100 rounded-xl bg-neutral-50/50 p-2 flex flex-col justify-between relative overflow-hidden group">
              <svg className="w-full h-32 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sales-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35"/>
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00"/>
                  </linearGradient>
                </defs>
                {/* Gridlines */}
                <line x1="0" y1="4" x2="100" y2="4" stroke="#E5E5E5" strokeWidth="0.1" />
                <line x1="0" y1="16" x2="100" y2="16" stroke="#E5E5E5" strokeWidth="0.1" />
                <line x1="0" y1="28" x2="100" y2="28" stroke="#E5E5E5" strokeWidth="0.1" />
                
                {/* SVG Area */}
                <path d={pathD} fill="url(#sales-gradient)" className="transition-all duration-500 ease-in-out" />
                {/* SVG Line */}
                <path d={lineD} fill="none" stroke="#2563eb" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500 ease-in-out" />
                
                {/* Data Points */}
                {points.map((p, i) => (
                  <circle 
                    key={i} 
                    cx={p.x} 
                    cy={p.y} 
                    r="1.2" 
                    fill={i === 6 ? '#10B981' : '#2563eb'} 
                    className="transition-all duration-500 ease-in-out hover:r-[2]"
                  >
                    <title>{formatShortDate(p.date)}: ₹{p.sales.toLocaleString()}</title>
                  </circle>
                ))}
              </svg>

              {/* Chart labels */}
              <div className="flex justify-between text-[9px] sm:text-[10px] text-neutral-400 font-mono-sm px-1 sm:px-2 pt-1 border-t border-neutral-100">
                {points.map((p, i) => (
                  <span key={i} className={i === 6 ? 'font-bold text-[#10B981]' : ''}>
                    {i === 6 ? 'Today' : formatShortDate(p.date)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-neutral-800">Salesman Performance Breakdown</h4>
              <p className="text-[11px] text-neutral-400">Total individual gross metrics logs</p>
            </div>
            
            {/* Custom SVG bar charts for 7 salesmen */}
            <div className="space-y-2 max-h-[192px] overflow-y-auto pr-1">
              {usersList.filter(u => u.role === 'Salesman').map((man) => {
                const reports = salesReports.filter(r => r.salesmanId === man.id);
                const amount = reports.reduce((sum, r) => sum + r.totalSales, 0);
                const count = reports.length;
                
                // Find maximum sales among salesmen to scale ratios
                const maxVal = Math.max(5000, ...usersList.filter(u => u.role === 'Salesman').map(u => 
                  salesReports.filter(r => r.salesmanId === u.id).reduce((sum, r) => sum + r.totalSales, 0)
                ));
                const ratio = Math.min(100, Math.max(5, (amount / (maxVal || 1)) * 100));

                return (
                  <div key={man.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-neutral-700">
                      <span className="font-medium text-neutral-800">{man.name}</span>
                      <div className="flex gap-2 font-mono-sm">
                        <span className="text-neutral-400">({count} reports)</span>
                        <span className="font-bold text-neutral-900">₹{amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${ratio}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Sales log table */}
        <div id="salesman-report-log" className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <div>
              <h3 className="font-bold text-neutral-800 text-sm">Salesman Report Log</h3>
              <p className="text-[11px] text-neutral-500">Live ledger of salesmen submissions with status and damages tracked</p>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
              <input 
                type="text" 
                placeholder="Search salesman/beat..."
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none focus:border-blue-500 w-full sm:w-56" 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700 border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Salesman Name Area</th>
                  <th className="py-2.5">Beat Name / Territory</th>
                  <th className="py-2.5 text-right">Total Sales</th>
                  <th className="py-2.5 text-center">Status</th>
                  <th className="py-2.5">Internal Remarks / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 font-semibold text-neutral-900">{report.date}</td>
                    <td className="py-3 font-bold text-neutral-950">{report.salesmanName}</td>
                    <td className="py-3 text-neutral-500">{report.beatName}</td>
                    <td className="py-3 text-right font-mono-sm font-semibold text-neutral-900">₹{report.totalSales.toFixed(2)}</td>
                    <td className="py-3 text-center">{getStatusBadge(report.status)}</td>
                    <td className="py-3 text-neutral-400 italic max-w-xs truncate">{report.remarks || 'No queries flagged'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  };


  // ==========================================
  // TAB 3: PACKING PORTAL (Screenshot 3)
  // ==========================================
  const renderPacking = () => {
    // === DAILY MATH ===
    const totalPacked = todayPackingLogs.reduce((s, p) => s + p.productsPacked, 0);
    const completionPercent = dailyTarget > 0 ? Math.min(100, Math.round((totalPacked / dailyTarget) * 100)) : 0;

    // Daily Leaderboard sorting
    const dailyPackerStats = [...usersList.filter(u => u.role === 'Packing' && u.name.toLowerCase().includes(packingSearch.toLowerCase()))].map(packer => {
      const log = todayPackingLogs.find(l => l.memberId === packer.id);
      return {
        ...packer,
        log,
        productsPacked: log ? log.productsPacked : 0,
        efficiency: log ? log.efficiency : 0,
        status: log ? log.status : 'Offline'
      };
    }).sort((a, b) => b.productsPacked - a.productsPacked);

    // === MONTHLY MATH ===
    const monthlyLogs = packingLogs.filter(log => {
      if (!log.date) return false;
      return log.date.startsWith(selectedMonth);
    });

    const memberMonthlyMap = new Map<string, { logs: any[]; name: string; station: string }>();
    monthlyLogs.forEach(log => {
      const existing = memberMonthlyMap.get(log.memberId);
      if (existing) {
        existing.logs.push(log);
      } else {
        const packer = usersList.find(u => u.id === log.memberId);
        const stationStr = packer?.detail || `Station ${log.station}`;
        memberMonthlyMap.set(log.memberId, { logs: [log], name: log.memberName, station: stationStr });
      }
    });

    // Month sorted by total Packed (Leaderboard requirement)
    const monthlyPackerStats = Array.from(memberMonthlyMap.entries()).map(([memberId, data]) => {
      const totalPacked = data.logs.reduce((s, l) => s + l.productsPacked, 0);
      const avgEfficiency = Math.round(data.logs.reduce((s, l) => s + l.efficiency, 0) / (data.logs.length || 1));
      const daysWorked = new Set(data.logs.map(l => l.date)).size;
      return {
        memberId,
        name: data.name,
        station: data.station,
        totalPacked,
        avgEfficiency,
        daysWorked,
      };
    }).sort((a, b) => b.totalPacked - a.totalPacked);

    const monthlyTeamOutput = monthlyPackerStats.reduce((s, p) => s + p.totalPacked, 0);
    const bestPerformer = monthlyPackerStats.length > 0 ? monthlyPackerStats[0] : null;
    const avgTeamEfficiency = monthlyPackerStats.length > 0
      ? Math.round(monthlyPackerStats.reduce((s, p) => s + p.avgEfficiency, 0) / monthlyPackerStats.length)
      : 0;
    const totalWorkDays = monthlyPackerStats.reduce((s, p) => s + p.daysWorked, 0);
    const selectedMonthLabel = monthOptions.find(o => o.value === selectedMonth)?.label || selectedMonth;

    return (
      <div id="packing-view" className="space-y-6">
        
        {/* Packing line productivity bar & Target Settings */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Corporate Fulfillment Target</span>
              <h2 className="text-xl font-bold text-neutral-900 mt-1">Daily Company Target</h2>
            </div>
            {isAdmin && (
              <div className="flex gap-4">
                <div className="bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block mb-0.5">Daily Goal</span>
                  <input 
                    type="number" 
                    value={dailyTarget} 
                    onChange={e => saveDailyTarget(Number(e.target.value))}
                    className="w-20 bg-transparent text-sm font-bold font-mono-sm outline-none text-indigo-700" 
                  />
                </div>
                <div className="bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block mb-0.5">Monthly per Packer Goal</span>
                  <input 
                    type="number" 
                    value={monthlyTarget} 
                    onChange={e => saveMonthlyTarget(Number(e.target.value))}
                    className="w-20 bg-transparent text-sm font-bold font-mono-sm outline-none text-indigo-700" 
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <p className="text-sm font-bold text-indigo-600 font-mono-sm">
              {totalPacked.toLocaleString()} / {dailyTarget.toLocaleString()} units ({completionPercent}% completed)
            </p>
          </div>

          <div className="w-full bg-neutral-100 h-4 rounded-full overflow-hidden border border-neutral-200">
            <div 
              className="bg-indigo-600 h-4 rounded-full transition-all duration-700 animate-pulse" 
              style={{ width: `${completionPercent}%` }} 
            />
          </div>
        </div>

        {/* Daily Leaderboard & Stations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-800 text-sm">🏆 Daily Leaderboard & Stations</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={12} />
              <input 
                type="text" 
                placeholder="Find station operator..."
                value={packingSearch}
                onChange={(e) => setPackingSearch(e.target.value)}
                className="pl-8 pr-3 py-1 border border-neutral-200 rounded-lg text-xs outline-none focus:border-indigo-500 shadow-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dailyPackerStats.map((packer, idx) => {
              const isOnBreak = packer.status === 'On Break';
              const isCheckedOut = packer.status === 'Checked Out';
              const isPacking = packer.status === 'Packing';
              const stationStr = packer.detail || `Station ${packer.id.replace(/\D/g, '')}`;

              return (
                <div key={packer.id} className={`bg-white p-4 rounded-xl border ${idx < 3 ? 'border-amber-300 shadow-md bg-gradient-to-b from-[#FFFDF0] to-white' : 'border-neutral-200 shadow-sm'} flex flex-col justify-between space-y-3 relative overflow-hidden`}>
                  {idx === 0 && <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-bl-lg">🥇 1st Place</div>}
                  {idx === 1 && <div className="absolute top-0 right-0 bg-slate-300 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-bl-lg">🥈 2nd Place</div>}
                  {idx === 2 && <div className="absolute top-0 right-0 bg-orange-300 text-orange-900 text-[10px] font-black px-2 py-0.5 rounded-bl-lg">🥉 3rd Place</div>}

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">{stationStr}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isOnBreak ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                      isCheckedOut ? 'bg-neutral-100 text-neutral-500 border border-neutral-200' : 
                      isPacking ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                      'bg-red-50 text-red-700 border border-red-150'
                    }`}>
                      {packer.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">{packer.name}</h4>
                    <p className="text-xl font-extrabold text-neutral-900 tracking-tight font-mono-sm mt-1">
                      {packer.productsPacked.toLocaleString()}{' '}
                      <span className="text-xs text-neutral-400 font-medium font-sans">products</span>
                    </p>
                  </div>

                  <div className="border-t border-neutral-100 pt-2 flex items-center justify-between text-[11px] text-neutral-500 font-mono-sm">
                    <span>Performance Coefficient:</span>
                    <span className={`font-bold ${packer.efficiency >= 90 ? 'text-emerald-600' : packer.efficiency >= 80 ? 'text-indigo-600' : 'text-neutral-500'}`}>
                      {packer.efficiency}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================ */}
        {/* MONTHLY PACKING PROGRESS & LEADERBOARD       */}
        {/* ============================================ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-neutral-800 text-base">🏆 Monthly Packer Leaderboard</h3>
              <p className="text-[11px] text-neutral-500">Ranked by total volume processed</p>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0071E3]" size={14} />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-8 pr-8 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 appearance-none outline-none focus:border-[#0071E3] shadow-sm cursor-pointer"
              >
                {monthOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-150">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Total Output</span>
              <p className="text-xl font-black font-mono-sm text-neutral-900 mt-1">{monthlyTeamOutput.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-150">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Monthly MVP</span>
              <p className="text-xl font-black text-[#0071E3] mt-1 flex items-center gap-2">
                {bestPerformer ? bestPerformer.name : 'N/A'} {bestPerformer && '👑'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-150">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Average Efficiency</span>
              <p className="text-xl font-black font-mono-sm text-neutral-900 mt-1">{avgTeamEfficiency}%</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-150">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Total Shifts Logged</span>
              <p className="text-xl font-black font-mono-sm text-neutral-900 mt-1">{totalWorkDays}</p>
            </div>
          </div>

          {monthlyPackerStats.length === 0 ? (
            <div className="bg-neutral-50 border border-neutral-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <Package size={32} className="text-neutral-300 mb-3" />
              <p className="font-semibold text-neutral-600">No packing data for {selectedMonthLabel}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {monthlyPackerStats.map((packer, idx) => {
                const progressPercent = monthlyTarget > 0 ? Math.min(100, Math.round((packer.totalPacked / monthlyTarget) * 100)) : 0;
                
                // Color coding based on progress to target
                let barColor = 'bg-neutral-400';
                let effBg = 'bg-neutral-100';
                let effColor = 'text-neutral-600';
                let dotColor = 'bg-neutral-300';

                if (progressPercent >= 100) {
                  barColor = 'bg-emerald-500';
                  effBg = 'bg-emerald-50';
                  effColor = 'text-emerald-700';
                  dotColor = 'bg-emerald-500';
                } else if (progressPercent >= 75) {
                  barColor = 'bg-[#0071E3]';
                  effBg = 'bg-blue-50';
                  effColor = 'text-[#0071E3]';
                  dotColor = 'bg-[#0071E3]';
                } else if (progressPercent >= 50) {
                  barColor = 'bg-amber-500';
                  effBg = 'bg-amber-50';
                  effColor = 'text-amber-700';
                  dotColor = 'bg-amber-500';
                } else {
                  barColor = 'bg-rose-500';
                  effBg = 'bg-rose-50';
                  effColor = 'text-rose-700';
                  dotColor = 'bg-rose-500';
                }

                return (
                  <div key={packer.memberId} className={`bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-3 ${idx < 3 ? 'border-[#0071E3]/30' : 'border-neutral-200'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-amber-400 text-white shadow-md' : idx === 1 ? 'bg-slate-300 text-white shadow-md' : idx === 2 ? 'bg-orange-300 text-white shadow-md' : 'bg-neutral-100 text-neutral-500'}`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                            {packer.name} 
                            {idx === 0 && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Top Packer</span>}
                          </h4>
                          <span className="text-[10px] text-neutral-400 uppercase font-bold">{packer.station}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-0.5">Average Eff.</span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${effBg} ${effColor}`}>
                          {packer.avgEfficiency}%
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-0.5">Monthly Total</span>
                        <p className={`text-lg font-extrabold font-mono-sm ${effColor}`}>{packer.totalPacked.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-neutral-500 font-mono-sm">
                          {progressPercent}% of target
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`${barColor} h-2 rounded-full transition-all duration-700`}
                        style={{ width: `${progressPercent}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // TAB 4: DELIVERY & RETURNS PORTAL (Screenshot 4)
  // ==========================================
  const renderDelivery = () => {
    // Calculations
    const totalMileage = todayMileageReports.reduce((s, r) => s + (r.endOdo - r.startOdo), 0);
    const totalCash = marketCollections.filter(c => c.type === 'Cash').reduce((s, c) => s + c.amount, 0);
    const totalIMPS = marketCollections.filter(c => c.type === 'IMPS').reduce((s, c) => s + c.amount, 0);
    const totalCheque = marketCollections.filter(c => c.type === 'Cheque').reduce((s, c) => s + c.amount, 0);

    
    const unifiedReturns = [
      ...todayReturnReports.map(r => ({ ...r, _sourceType: 'Driver', _name: r.driverName })),
      ...todayDamageReports.map(r => ({ ...r, _sourceType: 'Salesman', _name: r.salesmanName }))
    ];

    const filteredReturns = unifiedReturns.filter(r => {
      const q = returnsSearch.toLowerCase();
      // Use existing getReturnDisplayName for both, since both have items[] or productName
      const displayName = getReturnDisplayName(r as any);
      return r.shopName.toLowerCase().includes(q) || displayName.toLowerCase().includes(q);
    });


    return (
      <div id="delivery-view" className="space-y-6">
        
        {/* Top bar metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active Map route overlay */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <div>
              <h4 className="text-sm font-bold text-neutral-800">Active Market Collections Routing Map</h4>
              <p className="text-[11px] text-neutral-400">Driver distribution routes and live map tracking</p>
            </div>

            {/* Simulated interactive Route Map graphic */}
            <div className="border border-neutral-200 rounded-xl p-4 bg-slate-900 text-white min-h-[180px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                {/* SVG Route lines representing spatial grid map nodes */}
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 0,20 Q 50,150 150,110 T 300,50" fill="none" stroke="#FFF" strokeWidth="2" strokeDasharray="5" />
                  <path d="M 40,80 Q 120,40 240,180" fill="none" stroke="#FFF" strokeWidth="1" />
                  <circle cx="150" cy="110" r="8" fill="#FFF" />
                  <circle cx="240" cy="180" r="12" fill="#FFF" />
                </svg>
              </div>

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm p-1.5 px-3 rounded-lg border border-white/10">
                  <MapPin size={12} className="text-amber-400 animate-bounce" />
                  <span className="text-[10px] font-mono-sm font-semibold">Beat: Downtown Alpha Sector 4</span>
                </div>
                <span className="text-[9px] bg-emerald-500 font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider">Active</span>
              </div>

              <div id="route-details-panel" className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-md p-3 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-neutral-400">Active Duty Representative:</p>
                  <p className="text-xs font-bold text-white mt-0.5">Rajesh Kumar (Route Alpha-04 - Van)</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Status:</p>
                  <p className="text-xs text-amber-300 font-bold">12/15 Completed (80%)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Odometer and vehicle fleet analytics */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <div>
              <h4 className="text-sm font-bold text-neutral-800">Mileage Summary Fleet Metrics</h4>
              <p className="text-[11px] text-neutral-400">Odometer logistics tracking by fleet category</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-neutral-50 p-3 rounded-xl text-center border border-neutral-150">
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Overall Mileage</p>
                <p className="text-lg font-extrabold text-neutral-800 font-mono-sm mt-1">{totalMileage || 482.5} km</p>
                <span className="text-[9px] text-emerald-600 block mt-0.5">+4.2% versus yesterday</span>
              </div>
              <div className="bg-neutral-50 p-3 rounded-xl text-center border border-neutral-150">
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Van Fleet</p>
                <p className="text-lg font-extrabold text-neutral-800 font-mono-sm mt-1">310.0 km</p>
                <span className="text-[9px] text-neutral-400 block mt-0.5">Route Alpha/West</span>
              </div>
              <div className="bg-neutral-50 p-3 rounded-xl text-center border border-neutral-150">
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Bike Fleet Delivery</p>
                <p className="text-lg font-extrabold text-neutral-800 font-mono-sm mt-1 font-semibold">172.5 km</p>
                <span className="text-[9px] text-neutral-400 block mt-0.5">North Zone A</span>
              </div>
            </div>

            {/* Visual indicators for different payment types */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs border-t border-neutral-100">
              <div className="p-1 rounded bg-amber-50 border border-amber-200">
                <p className="text-[9px] text-neutral-400 font-bold uppercase">Total Cash</p>
                <span className="font-bold text-neutral-800 font-mono-sm">₹{totalCash.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              </div>
              <div className="p-1 rounded bg-indigo-50 border border-indigo-200">
                <p className="text-[9px] text-neutral-400 font-bold uppercase">total IMPS</p>
                <span className="font-bold text-indigo-700 font-mono-sm">₹{totalIMPS.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              </div>
              <div className="p-1 rounded bg-emerald-50 border border-emerald-200">
                <p className="text-[9px] text-neutral-400 font-bold uppercase">TOTAL Cheque</p>
                <span className="font-bold text-emerald-700 font-mono-sm">₹{totalCheque.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Returns Monitor catalog list — updated for multi-item ReturnReport */}
        <div id="returns-monitor" className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <div>
              <h3 className="font-bold text-neutral-800 text-sm">Returns Monitor (Customer Service & Damages)</h3>
              <p className="text-[11px] text-neutral-500">Live returned product invoices with reasons, quantities, and MRP audit checks</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={12} />
              <input 
                type="text" 
                placeholder="Filter shop or product..."
                value={returnsSearch}
                onChange={(e) => setReturnsSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none focus:border-blue-500 w-full sm:w-52" 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                  <th className="py-2.5">Shop ID / Name</th>
                  <th className="py-2.5">Returned Items</th>
                  <th className="py-2.5 text-center">Total Qty</th>
                  <th className="py-2.5 text-right">Total Value</th>
                  <th className="py-2.5 text-center">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredReturns.map((ret) => {
                  const items = getReturnItems(ret);
                  const totalValue = getReturnTotalValue(ret);
                  const totalQty = getReturnTotalQuantity(ret);
                  const isMulti = items.length > 1;
                  const isExpanded = expandedReturnIds.has(ret.id);

                  return (
                    <React.Fragment key={ret.id}>
                      <tr className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-neutral-900">{ret.shopName}</p>
                            {(ret as any)._sourceType === 'Salesman' ? (
                              <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Sales Damage</span>
                            ) : (
                              <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Driver Return</span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono-sm">{ret.shopNo}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <Coffee size={12} className="text-amber-600 shrink-0" />
                            {isMulti ? (
                              <button
                                onClick={() => toggleReturnExpand(ret.id)}
                                className="flex items-center gap-1 text-[#0071E3] font-semibold hover:underline"
                              >
                                <span>{items.length} items</span>
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>
                            ) : (
                              <span className="font-semibold text-neutral-800">{items[0]?.productName || '—'}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-center font-bold text-neutral-800 bg-neutral-50/50">{totalQty} units</td>
                        <td className="py-3 text-right font-mono-sm font-bold text-neutral-900">
                          ₹{totalValue.toFixed(2)}
                        </td>
                        <td className="py-3 text-center">
                          {isMulti ? (
                            <span className="inline-block px-2.5 py-1 text-[10px] bg-indigo-50 text-indigo-800 font-bold rounded-lg border border-indigo-100">
                              Multiple reasons
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 text-[10px] bg-rose-50 text-rose-800 font-bold rounded-lg border border-rose-100">
                              {items[0]?.reason || ret.remarks || 'Damaged packaging'}
                            </span>
                          )}
                        </td>
                      </tr>
                      {/* Expanded item details row */}
                      {isMulti && isExpanded && (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <div className="bg-[#F5F5F7] border-t border-neutral-200 px-6 py-3">
                              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Item Breakdown</p>
                              <div className="space-y-2">
                                {items.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs bg-white rounded-lg border border-neutral-200 px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-neutral-400 font-mono-sm w-5 text-center">{idx + 1}.</span>
                                      <span className="font-semibold text-neutral-800">{item.productName}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="text-neutral-500">x{item.quantity}</span>
                                      <span className="font-mono-sm text-neutral-600">MRP: ₹{item.mrp.toFixed(2)}</span>
                                      <span className="font-mono-sm font-bold text-neutral-900">₹{(item.mrp * item.quantity).toFixed(2)}</span>
                                      {item.reason && (
                                        <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-100 font-medium">
                                          {item.reason}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Collection logs view matching bottom of Screenshot 4 */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-3">
          <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-neutral-800 text-sm">Collections Ledger Logs</h3>
              <p className="text-[11px] text-neutral-500">Traceable bank draft collection records (Cash, Checks, and automated IMPS)</p>
            </div>
            <span className="text-xs bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full text-indigo-700 font-bold font-mono-sm">
              Total Market Capital: ₹{(totalCash + totalIMPS + totalCheque).toLocaleString(undefined, {minimumFractionDigits:2})}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                  <th className="py-2.5">Shop Customer Name</th>
                  <th className="py-2.5">Payment Method</th>
                  <th className="py-2.5">Reference draft No</th>
                  <th className="py-2.5 text-right">Draft Value</th>
                  <th className="py-2.5 text-center">Audit Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {marketCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3">
                      <p className="font-bold text-neutral-950">{col.shopName}</p>
                      <span className="text-[10px] text-neutral-400 font-mono-sm">{col.shopNo}</span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        col.type === 'Cash' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        col.type === 'IMPS' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {col.type} Draft
                      </span>
                    </td>
                    <td className="py-3 font-mono-sm font-semibold text-neutral-600">
                      {col.referenceNo || '- No draft needed -'}
                    </td>
                    <td className="py-3 text-right font-mono-sm font-black text-neutral-900">
                      ₹{col.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="py-3 text-center">{getStatusBadge(col.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  };


  // ==========================================
  // TAB 5: ACCOUNTS VERIFICATION HUB (Screenshot 6)
  // ==========================================
  const renderAccounts = () => {
    
    // Quick calculations for the Auditor Dashboard
    const totalSalesReportsCount = salesReports.length;
    const verifiedSalesPercent = Math.round((salesReports.filter(r => r.status === 'Verified').length / (totalSalesReportsCount || 1)) * 100);

    return (
      <div id="accounts-view" className="space-y-6 animate-in fade-in duration-200">
        
        {/* Top auditing status stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#E4F9EC] p-5 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">Reports Verified</p>
              <h3 className="text-2xl font-black text-emerald-950 font-mono-sm mt-1">{verifiedSalesPercent}% Green</h3>
              <p className="text-[10px] text-emerald-800 mt-1">Compliant ledger logs validated</p>
            </div>
            <div className="p-3 bg-white text-emerald-600 rounded-full shadow-sm"><Check size={20} /></div>
          </div>

          <div className="bg-[#FFF8EB] p-5 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-widest">Awaiting verification</p>
              <h3 className="text-2xl font-black text-amber-950 font-mono-sm mt-1">
                {salesReports.filter(r => r.status === 'Pending').length + marketCollections.filter(r => r.status === 'Pending').length} Pending
              </h3>
              <p className="text-[10px] text-amber-800 mt-1">Orange logs queued for review</p>
            </div>
            <div className="p-3 bg-white text-amber-600 rounded-full shadow-sm"><Clock size={20} /></div>
          </div>

          <div className="bg-[#FDF2F2] p-5 rounded-2xl border border-rose-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-rose-800 uppercase tracking-widest">Active Disputed Queries</p>
              <h3 className="text-2xl font-black text-rose-950 font-mono-sm mt-1">
                {salesReports.filter(r => r.status === 'Disputed').length + damageReports.filter(r => r.status === 'Disputed').length} Flagged
              </h3>
              <p className="text-[10px] text-rose-800 mt-1">Red items marked as incorrect</p>
            </div>
            <div className="p-3 bg-white text-rose-600 rounded-full shadow-sm"><ShieldAlert size={20} /></div>
          </div>
        </div>

        {/* Verification Hub Queue tasks list */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-neutral-800 text-sm">Accounts Verification Hub Task Queue</h2>
              <p className="text-[11px] text-neutral-500">
                Logged reports from Salesmen and Delivery personnel. Audit and either <strong>Verify Green</strong>, <strong>Dispute Red</strong>, or add remarks.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase text-neutral-400 bg-neutral-200/60 px-3 py-1 rounded-full">Auditor Task Desk</span>
          </div>

          {/* Verification Actions Table */}
          <div className="p-6 space-y-6">
            
  {/* 1. SALESMEN REPORTS QUEUE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Package size={14} />
                <span>Sales Reports Validation Queue</span>
              </h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAF9F6]">
                    <tr className="border-b border-neutral-200 text-[10px] text-neutral-500 font-bold uppercase">
                      <th className="p-3">Salesman User ID</th>
                      <th className="p-3">Beat Location</th>
                      <th className="p-3 text-right">Logged Sales</th>
                      {isAdmin && <th className="p-3 text-center">Images</th>}
                      <th className="p-3 text-center">Status Color</th>
                      <th className="p-3">Auditor Action Panel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {salesReports.map((report) => (
                      <tr key={report.id} className={`hover:bg-neutral-50/45 transition-all ${getStatusClass(report.status)}`}>
                        <td className="p-3">
                          <p className="font-bold text-neutral-950">{report.salesmanName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono-sm">ID: {report.salesmanId}</span>
                        </td>
                        <td className="p-3 text-neutral-600 font-medium">{report.beatName}</td>
                        <td className="p-3 text-right font-mono-sm font-black text-neutral-900">₹{report.totalSales.toFixed(2)}</td>
                        {isAdmin && (
                          <td className="p-3 text-center">
                            {report.images && report.images.length > 0 ? (
                              <button onClick={() => setViewingImage(report.images?.[0] || null)} className="text-blue-600 underline font-semibold text-xs">View Image</button>
                            ) : <span className="text-xs text-neutral-400">-</span>}
                          </td>
                        )}
                        <td className="p-3 text-center">{getStatusBadge(report.status)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onVerifySalesReport(report.id, 'Verified')}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                              title="Verify Green"
                            >
                              <Check size={10} /> Verify
                            </button>
                            <button 
                              onClick={() => {
                                setActiveAuditItem({ id: report.id, type: 'sales_rep', remarks: report.remarks || '' });
                              }}
                              className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                              title="Dispute Red / Dispute Remarks"
                            >
                              <X size={10} /> Query
                            </button>
                          </div>
                          {report.remarks && (
                            <p className="text-[10px] text-rose-700 font-medium italic mt-1 flex items-center gap-1">
                              <MessageSquare size={10} /> Remarks: {report.remarks}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 1.5 DAMAGE REPORTS QUEUE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>Damage Reports Validation Queue</span>
              </h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAF9F6]">
                    <tr className="border-b border-neutral-200 text-[10px] text-neutral-500 font-bold uppercase">
                      <th className="p-3">Salesman User ID</th>
                      <th className="p-3">Shop details</th>
                      <th className="p-3 text-right">Items & Total</th>
                      {isAdmin && <th className="p-3 text-center">Images</th>}
                      <th className="p-3 text-center">Status Color</th>
                      <th className="p-3">Auditor Action Panel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {damageReports.map((report) => {
                      const totalMRP = report.items?.reduce((acc, curr) => acc + (curr.mrp * curr.quantity), 0) || 0;
                      return (
                      <tr key={report.id} className={`hover:bg-neutral-50/45 transition-all ${getStatusClass(report.status)}`}>
                        <td className="p-3">
                          <p className="font-bold text-neutral-950">{report.salesmanName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono-sm">ID: {report.salesmanId}</span>
                        </td>
                        <td className="p-3">
                          <p className="text-neutral-800 font-bold leading-tight">{report.shopName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono-sm uppercase">{report.shopNo}</span>
                        </td>
                        <td className="p-3 text-right">
                          <p className="font-semibold text-neutral-800">{report.items?.length || 0} Products</p>
                          <span className="text-[10px] font-mono-sm font-black text-rose-700">₹{totalMRP.toFixed(2)}</span>
                        </td>
                        {isAdmin && (
                          <td className="p-3 text-center">
                            {report.images && report.images.length > 0 ? (
                              <button onClick={() => setViewingImage(report.images?.[0] || null)} className="text-blue-600 underline font-semibold text-xs">View Image</button>
                            ) : <span className="text-xs text-neutral-400">-</span>}
                          </td>
                        )}
                        <td className="p-3 text-center">{getStatusBadge(report.status)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onVerifyDamageReport(report.id, 'Verified')}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <Check size={10} /> Verify
                            </button>
                            <button 
                              onClick={() => {
                                setActiveAuditItem({ id: report.id, type: 'damage_rep', remarks: report.remarks || '' });
                              }}
                              className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <X size={10} /> Query
                            </button>
                          </div>
                          {report.remarks && (
                            <p className="text-[10px] text-rose-700 font-medium italic mt-1 flex items-center gap-1">
                              <MessageSquare size={10} /> Remarks: {report.remarks}
                            </p>
                          )}
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

  {/* Driver Collections Queue... */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign size={14} />
                <span>Driver Market Collections Auditing Queue</span>
              </h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAF9F6]">
                    <tr className="border-b border-neutral-200 text-[10px] text-neutral-500 font-bold uppercase">
                      <th className="p-3">Driver Name</th>
                      <th className="p-3">Shop / Customer</th>
                      <th className="p-3">Draft Draft Details</th>
                      <th className="p-3 text-right">Draft Value</th>
                      {isAdmin && <th className="p-3 text-center">Images</th>}
                      <th className="p-3 text-center">Audit Code</th>
                      <th className="p-3">Auditor actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {marketCollections.map((col) => (
                      <tr key={col.id} className={`hover:bg-neutral-50/45 transition-all ${getStatusClass(col.status)}`}>
                        <td className="p-3 font-bold text-neutral-900">{col.driverName}</td>
                        <td className="p-3">
                          <p className="font-semibold text-neutral-800">{col.shopName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono-sm">{col.shopNo}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] bg-indigo-50 border border-indigo-150 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                            {col.type} Draft
                          </span>
                          {col.referenceNo && <p className="text-[10px] font-mono-sm text-neutral-500 mt-1">Ref: {col.referenceNo}</p>}
                        </td>
                        <td className="p-3 text-right font-mono-sm font-black text-neutral-900">₹{col.amount.toFixed(2)}</td>
                        {isAdmin && (
                          <td className="p-3 text-center">
                            {col.images && col.images.length > 0 ? (
                              <button onClick={() => setViewingImage(col.images?.[0] || null)} className="text-blue-600 underline font-semibold text-xs">View Image</button>
                            ) : <span className="text-xs text-neutral-400">-</span>}
                          </td>
                        )}
                        <td className="p-3 text-center">{getStatusBadge(col.status)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onVerifyMarketCollection(col.id, 'Verified')}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <Check size={10} /> Verify
                            </button>
                            <button 
                              onClick={() => {
                                setActiveAuditItem({ id: col.id, type: 'market_coll', remarks: col.remarks || '' });
                              }}
                              className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <X size={10} /> Query
                            </button>
                          </div>
                          {col.remarks && (
                            <p className="text-[10px] text-rose-700 font-semibold italic mt-1 flex items-center gap-1">
                              <MessageSquare size={10} /> Remarks: {col.remarks}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>



            {/* 2. COLLECTION REPORTS QUEUE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign size={14} />
                <span>Salesman Collection Reports Validation Queue</span>
              </h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAF9F6]">
                    <tr className="border-b border-neutral-200 text-[10px] text-neutral-500 font-bold uppercase">
                      <th className="p-3">Salesman User ID</th>
                      <th className="p-3">Beat Location</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-right"></th>
                      {isAdmin && <th className="p-3 text-center">Images</th>}
                      <th className="p-3 text-center">Status Color</th>
                      <th className="p-3">Auditor Action Panel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {collectionReports.map((report) => (
                      <tr key={report.id} className={`hover:bg-neutral-50/45 transition-all ${getStatusClass(report.status)}`}>
                        <td className="p-3">
                          <p className="font-bold text-neutral-950">{report.salesmanName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono-sm">ID: {report.salesmanId}</span>
                        </td>
                        <td className="p-3 text-neutral-600 font-medium">{report.beatName}</td>
                        <td className="p-3 text-right font-mono-sm font-black text-neutral-900">₹{report.collectionAmount?.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono-sm font-semibold text-neutral-700"></td>
                        {isAdmin && (
                          <td className="p-3 text-center">
                            {report.images && report.images.length > 0 ? (
                              <button onClick={() => setViewingImage(report.images?.[0] || null)} className="text-blue-600 underline font-semibold text-xs">View Image</button>
                            ) : <span className="text-xs text-neutral-400">-</span>}
                          </td>
                        )}
                        <td className="p-3 text-center">{getStatusBadge(report.status)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onVerifyCollectionReport(report.id, 'Verified')}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <Check size={10} /> Verify
                            </button>
                            <button 
                              onClick={() => setActiveAuditItem({ id: report.id, type: 'collection_rep', remarks: report.remarks || '' })}
                              className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <X size={10} /> Query
                            </button>
                          </div>
                          {report.remarks && (
                            <p className="text-[10px] text-rose-700 font-medium italic mt-1 flex items-center gap-1">
                              <MessageSquare size={10} /> Remarks: {report.remarks}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. RETURN REPORTS QUEUE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw size={14} />
                <span>Return Reports Validation Queue</span>
              </h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAF9F6]">
                    <tr className="border-b border-neutral-200 text-[10px] text-neutral-500 font-bold uppercase">
                      <th className="p-3">Driver User ID</th>
                      <th className="p-3">Shop details</th>
                      <th className="p-3 text-right">Items & Total</th>
                      {isAdmin && <th className="p-3 text-center">Images</th>}
                      <th className="p-3 text-center">Status Color</th>
                      <th className="p-3">Auditor Action Panel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {returnReports.map((report) => {
                      const totalMRP = getReturnTotalValue(report);
                      const itemsCount = getReturnItems(report).length;
                      return (
                      <tr key={report.id} className={`hover:bg-neutral-50/45 transition-all ${getStatusClass(report.status)}`}>
                        <td className="p-3">
                          <p className="font-bold text-neutral-950">{report.driverName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono-sm">ID: {report.driverId}</span>
                        </td>
                        <td className="p-3">
                          <p className="text-neutral-800 font-bold leading-tight">{report.shopName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono-sm uppercase">{report.shopNo}</span>
                        </td>
                        <td className="p-3 text-right">
                          <p className="font-semibold text-neutral-800">{itemsCount} Products</p>
                          <span className="text-[10px] font-mono-sm font-black text-rose-700">₹{totalMRP.toFixed(2)}</span>
                        </td>
                        {isAdmin && (
                          <td className="p-3 text-center">
                            {report.images && report.images.length > 0 ? (
                              <button onClick={() => setViewingImage(report.images?.[0] || null)} className="text-blue-600 underline font-semibold text-xs">View Image</button>
                            ) : <span className="text-xs text-neutral-400">-</span>}
                          </td>
                        )}
                        <td className="p-3 text-center">{getStatusBadge(report.status)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onVerifyReturnReport(report.id, 'Verified')}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <Check size={10} /> Verify
                            </button>
                            <button 
                              onClick={() => setActiveAuditItem({ id: report.id, type: 'return_rep', remarks: report.remarks || '' })}
                              className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <X size={10} /> Query
                            </button>
                          </div>
                          {report.remarks && (
                            <p className="text-[10px] text-rose-700 font-medium italic mt-1 flex items-center gap-1">
                              <MessageSquare size={10} /> Remarks: {report.remarks}
                            </p>
                          )}
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. MILEAGE REPORTS QUEUE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} />
                <span>Mileage Reports Validation Queue</span>
              </h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAF9F6]">
                    <tr className="border-b border-neutral-200 text-[10px] text-neutral-500 font-bold uppercase">
                      <th className="p-3">Driver User ID</th>
                      <th className="p-3">Route Zone</th>
                      <th className="p-3">Odometer Readings</th>
                      <th className="p-3 text-right">Total Distance</th>
                      {isAdmin && <th className="p-3 text-center">Images</th>}
                      <th className="p-3 text-center">Status Color</th>
                      <th className="p-3">Auditor Action Panel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {mileageReports.map((report) => (
                      <tr key={report.id} className={`hover:bg-neutral-50/45 transition-all ${getStatusClass(report.status)}`}>
                        <td className="p-3">
                          <p className="font-bold text-neutral-950">{report.driverName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono-sm">ID: {report.driverId}</span>
                        </td>
                        <td className="p-3 text-neutral-600 font-medium">{report.routeId}</td>
                        <td className="p-3 font-mono-sm text-neutral-500">
                          {report.startOdo} → {report.endOdo}
                        </td>
                        <td className="p-3 text-right font-mono-sm font-black text-neutral-900">
                          {(report.endOdo - report.startOdo).toFixed(1)} km
                        </td>
                        {isAdmin && (
                          <td className="p-3 text-center">
                            {report.images && report.images.length > 0 ? (
                              <button onClick={() => setViewingImage(report.images?.[0] || null)} className="text-blue-600 underline font-semibold text-xs">View Image</button>
                            ) : <span className="text-xs text-neutral-400">-</span>}
                          </td>
                        )}
                        <td className="p-3 text-center">{getStatusBadge(report.status)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onVerifyMileageReport(report.id, 'Verified')}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <Check size={10} /> Verify
                            </button>
                            <button 
                              onClick={() => setActiveAuditItem({ id: report.id, type: 'mileage_rep', remarks: report.remarks || '' })}
                              className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <X size={10} /> Query
                            </button>
                          </div>
                          {report.remarks && (
                            <p className="text-[10px] text-rose-700 font-medium italic mt-1 flex items-center gap-1">
                              <MessageSquare size={10} /> Remarks: {report.remarks}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
\n          </div>
        </div>

        {viewingImage && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full h-full flex flex-col items-center justify-center">
              <button 
                onClick={() => setViewingImage(null)}
                className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors p-2 bg-neutral-900/50 rounded-full"
              >
                <X size={32} />
              </button>
              <img src={viewingImage} alt="Evidence" className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl object-contain border border-neutral-700" />
            </div>
          </div>
        )}

        {/* Remarks editor popup modal overlay */}
        {activeAuditItem && (
          <div id="remedy-audit-modal" className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-100 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-neutral-800 text-sm">Dispute / Flag Query</h3>
                  <p className="text-[11px] text-neutral-400">Add operational verification remarks to notify personnel</p>
                </div>
                <button 
                  onClick={() => setActiveAuditItem(null)}
                  className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100"
                >
                  <X size={14} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-2 font-mono-sm">Audit Error Remarks / notes</label>
                <textarea 
                  rows={3}
                  value={activeAuditItem.remarks}
                  onChange={(e) => setActiveAuditItem({ ...activeAuditItem, remarks: e.target.value })}
                  placeholder="e.g. Check amount mismatch. Requesting salesman double check physical receipt copy."
                  className="w-full p-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:border-rose-500 bg-white font-sans text-neutral-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setActiveAuditItem(null)}
                  className="px-4 py-2 border border-neutral-150 text-neutral-600 hover:bg-neutral-50 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const { id, type, remarks } = activeAuditItem;
                    if (type === 'sales_rep') onVerifySalesReport(id, 'Disputed', remarks);
                    else if (type === 'damage_rep') onVerifyDamageReport(id, 'Disputed', remarks);
                    else if (type === 'collection_rep') onVerifyCollectionReport(id, 'Disputed', remarks);
                    else if (type === 'return_rep') onVerifyReturnReport(id, 'Disputed', remarks);
                    else if (type === 'mileage_rep') onVerifyMileageReport(id, 'Disputed', remarks);
                    else if (type === 'market_coll') onVerifyMarketCollection(id, 'Disputed', remarks);
                    setActiveAuditItem(null);
                  }}
                  className="px-4 py-2 text-white bg-rose-600 hover:bg-rose-700 rounded-lg text-xs font-bold"
                >
                  Dispute & Flag Red
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  // Switch tabs
  switch (currentTab) {
    case 'overview':
      return renderOverview();
    case 'team':
      return <TeamManagement usersList={usersList} apiAddUser={apiAddUser} apiUpdateUser={apiUpdateUser} apiRemoveUser={apiRemoveUser} setUsersList={setUsersList} />;
    case 'sales':
      return renderSales();
    case 'packing':
      return renderPacking();
    case 'delivery':
      return renderDelivery();
    case 'accounts':
      return renderAccounts();
    default:
      return renderOverview();
  }
}
