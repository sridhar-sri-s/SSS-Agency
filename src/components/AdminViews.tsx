import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Users, Truck, CheckCircle2, AlertCircle, Clock, 
  Search, ShieldAlert, ArrowUpRight, Check, X, RefreshCw, MessageSquare, MapPin, 
  Coffee, Calendar, DollarSign, Package, Compass
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

  // --- STATE FOR ACCOUNTS MODAL/REMARKS REMEDIAL ACTIONS ---
  const [activeAuditItem, setActiveAuditItem] = useState<{
    id: string;
    type: 'sales_rep' | 'damage_rep' | 'collection_rep' | 'return_rep' | 'mileage_rep' | 'market_coll';
    remarks: string;
  } | null>(null);

  // --- IMAGE VIEWING STATE ---
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // --- MOCK RECENT GENERAL ACTIVITY LEDGER ---
  const activities = [
    { text: "John Doe uploaded a new sales report", time: "2 mins ago", sub: "Downtown Metro | ₹4,520.00" },
    { text: "Marcus T. recorded lunch break completion", time: "15 mins ago", sub: "Station 1 | 30 minutes duration" },
    { text: "Rajesh Kumar logged a product return", time: "45 mins ago", sub: "SH-0921 Corner Mart | Coffee damaged" },
    { text: "Suresh Singh checked in IMPS receipt #IMPS867114A", time: "1 hr ago", sub: "Amount: ₹34,800.50" },
    { text: "Priya Patel verified Sarah Jenkins Eastside Report", time: "2 hrs ago", sub: "Audit checked and verified green" },
    { text: "Alex Wong reported damaged acoustic headset", time: "3 hrs ago", sub: "Shop SH-093 | Pending verification" }
  ];

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
    const totalSalesSum = salesReports.reduce((s, r) => s + r.totalSales, 0);
    const activePackers = packingLogs.filter(p => p.status === 'Packing').length;
    const pendingAudits = salesReports.filter(r => r.status === 'Pending').length + 
                          damageReports.filter(r => r.status === 'Pending').length + 
                          returnReports.filter(r => r.status === 'Pending').length;
    
    // Average efficiency
    const packingEff = Math.round(packingLogs.reduce((s, l) => s + l.efficiency, 0) / (packingLogs.length || 1));

    return (
      <div id="overview-view" className="space-y-6">
        {/* Prime Banner Greeting */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-xs text-amber-300 font-bold tracking-wider uppercase">Live Operations Room</span>
            <h1 className="text-2xl font-bold tracking-tight">Company Management Monitor</h1>
            <p className="text-xs text-neutral-300 max-w-xl">
              Facilitating interactive coordination across {salesReports.length}-record sales beats, {packingLogs.length} packing stations, and active delivery routes.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_right,_rgba(251,191,36,0.15),_transparent)] pointer-events-none" />
        </div>

        {/* Dynamic Bento Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs text-neutral-500 font-medium font-sans">Total Sales volume</span>
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={16} /></div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-neutral-900 tracking-tight font-mono-sm">
                ${totalSalesSum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-medium">
                <ArrowUpRight size={12} />
                <span>+14.5% versus yesterday</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
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
                <span>Active packaging benches running</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
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

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
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
          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
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
                      <td className="py-3 text-right font-mono-sm font-semibold">${r.totalSales.toLocaleString()}</td>
                      <td className="py-3 text-center">{getStatusBadge(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Ledger Flow */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-bold text-neutral-800 text-sm">Real-time Team Activities</h3>
                <p className="text-[11px] text-neutral-400">Chronological telemetry of logged submissions</p>
              </div>
              <Clock size={16} className="text-neutral-400 rotate-18 degrees" />
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {activities.map((act, index) => (
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
          <div className="bg-white p-5 rounded-xl border border-neutral-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Gross Sales total</p>
              <h3 className="text-2xl font-extrabold text-neutral-900 tracking-tight font-mono-sm mt-1">
                ${totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </h3>
            </div>
            <TrendingUp className="text-blue-500 shrink-0 bg-blue-50 p-2 rounded-lg" size={40} />
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Payments Collected</p>
              <h3 className="text-2xl font-extrabold text-neutral-900 tracking-tight font-mono-sm mt-1">
                ${totalCollected.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </h3>
            </div>
            <DollarSign className="text-emerald-500 shrink-0 bg-emerald-50 p-2 rounded-lg" size={40} />
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 flex items-center justify-between">
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
          
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-neutral-800">Total Sales Trend Graph</h4>
              <p className="text-[11px] text-neutral-400">Weekly cumulative distributions monitor</p>
            </div>
            
            {/* Custom SVG line chart matching Google's vector styling */}
            <div className="h-48 w-full border border-neutral-100 rounded-xl bg-neutral-50/50 p-2 flex flex-col justify-between relative overflow-hidden">
              <svg className="w-full h-32 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sales-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00"/>
                  </linearGradient>
                </defs>
                {/* Gridlines */}
                <line x1="0" y1="5" x2="100" y2="5" stroke="#E5E5E5" strokeWidth="0.1" />
                <line x1="0" y1="15" x2="100" y2="15" stroke="#E5E5E5" strokeWidth="0.1" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="#E5E5E5" strokeWidth="0.1" />
                
                {/* SVG Area */}
                <path d="M 0,28 L 5,22 Q 15,12 25,18 T 45,8 T 65,15 T 85,6 T 100,10 L 100,30 L 0,30 Z" fill="url(#sales-gradient)" />
                {/* SVG Line */}
                <path d="M 0,28 Q 10,20 20,15 T 40,10 T 60,18 T 80,4 T 100,10" fill="none" stroke="#2563eb" strokeWidth="0.8" strokeLinecap="round" />
                
                {/* Interactivity indicators */}
                <circle cx="40" cy="10" r="1.5" fill="#2563eb" className="animate-pulse" />
                <circle cx="80" cy="4" r="1.5" fill="#10B981" />
              </svg>

              {/* Chart labels */}
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono-sm px-2 pt-1 border-t border-neutral-100">
                <span>Oct 21</span>
                <span>Oct 22</span>
                <span>Oct 23</span>
                <span>Oct 24</span>
                <span>Oct 25</span>
                <span>Oct 26</span>
                <span>Oct 27 (Today)</span>
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
              {[
                { name: 'John Doe', amount: totalSales * 0.28, count: 6 },
                { name: 'Jane Smith', amount: totalSales * 0.18, count: 4 },
                { name: 'Michael Brown', amount: totalSales * 0.22, count: 5 },
                { name: 'David Chen', amount: totalSales * 0.15, count: 3 },
                { name: 'Sarah Jenkins', amount: totalSales * 0.10, count: 2 },
                { name: 'Alex Wong', amount: totalSales * 0.05, count: 1 },
                { name: 'Emily Davis', amount: totalSales * 0.02, count: 1 }
              ].map((man, i) => {
                const maxVal = totalSales * 0.3;
                const ratio = Math.min(100, (man.amount / maxVal) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-neutral-700">
                      <span className="font-medium text-neutral-800">{man.name}</span>
                      <div className="flex gap-2 font-mono-sm">
                        <span className="text-neutral-400">({man.count} orders)</span>
                        <span className="font-bold text-neutral-900">${Math.round(man.amount).toLocaleString()}</span>
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
                    <td className="py-3 text-right font-mono-sm font-semibold text-neutral-900">${report.totalSales.toFixed(2)}</td>
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
    // Math
    const totalPacked = packingLogs.reduce((s, p) => s + p.productsPacked, 0);
    const targetVal = 10000;
    const completionPercent = Math.min(100, Math.round((totalPacked / targetVal) * 100));

    const filteredLogs = packingLogs.filter(log => {
      return log.memberName.toLowerCase().includes(packingSearch.toLowerCase());
    });

    return (
      <div id="packing-view" className="space-y-6">
        
        {/* Packing line productivity bar */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Corporate Fulfillment Target</span>
              <h2 className="text-xl font-bold text-neutral-900 mt-1">Daily Company Target</h2>
            </div>
            <p className="text-sm font-bold text-indigo-600 font-mono-sm">
              {totalPacked.toLocaleString()} / {targetVal.toLocaleString()} units ({completionPercent}% completed)
            </p>
          </div>

          <div className="w-full bg-neutral-100 h-4 rounded-full overflow-hidden border border-neutral-200">
            <div 
              className="bg-indigo-600 h-4 rounded-full transition-all duration-700 animate-pulse" 
              style={{ width: `${completionPercent}%` }} 
            />
          </div>
        </div>

        {/* Team Metrics Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-800 text-sm">Station Level Efficiency Metrics (7 benches)</h3>
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
            {filteredLogs.map((log) => {
              const isOnBreak = log.status === 'On Break';
              const isCheckedOut = log.status === 'Checked Out';
              return (
                <div key={log.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Station {log.station}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isOnBreak ? 'bg-amber-100 text-amber-800' : 
                      isCheckedOut ? 'bg-neutral-100 text-neutral-500' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">{log.memberName}</h4>
                    <p className="text-xl font-extrabold text-neutral-900 tracking-tight font-mono-sm mt-1">
                      {log.productsPacked.toLocaleString()}{' '}
                      <span className="text-xs text-neutral-400 font-medium font-sans">units</span>
                    </p>
                  </div>

                  <div className="border-t border-neutral-100 pt-2 flex items-center justify-between text-[11px] text-neutral-500 font-mono-sm">
                    <span>Performance Coefficient:</span>
                    <span className="font-bold text-indigo-600">{log.efficiency}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lunch Break Log & Checkout Times */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="font-bold text-neutral-800 text-sm">Lunch Break Logs & Shift checkout ledger</h3>
            <p className="text-[11px] text-neutral-500">Continuous monitoring of staff shift times & checkout compliance</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700 border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                  <th className="py-2.5">Packer Name</th>
                  <th className="py-2.5">Station Slot</th>
                  <th className="py-2.5">Lunch Start</th>
                  <th className="py-2.5">Lunch End</th>
                  <th className="py-2.5">Duration Log</th>
                  <th className="py-2.5">Checkout Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {packingLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 font-semibold text-neutral-950">{log.memberName}</td>
                    <td className="py-3 text-neutral-500">Bench Station {log.station}</td>
                    <td className="py-3 font-mono-sm text-amber-700 font-semibold">{log.lunchStart}</td>
                    <td className="py-3 font-mono-sm text-emerald-800 font-semibold">{log.lunchEnd}</td>
                    <td className="py-3 text-neutral-600 font-medium">
                      {log.lunchEnd === 'In Progress' ? 'In Break' : '30 min'}
                    </td>
                    <td className="py-3">
                      {log.checkoutTime === 'Pending' ? (
                        <span className="text-amber-600 font-semibold text-[10px] bg-amber-50 px-2 py-1 rounded-full border border-amber-200">Pending Checkout</span>
                      ) : (
                        <span className="text-slate-800 font-mono-sm font-semibold">{log.checkoutTime}</span>
                      )}
                    </td>
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
  // TAB 4: DELIVERY & RETURNS PORTAL (Screenshot 4)
  // ==========================================
  const renderDelivery = () => {
    // Calculations
    const totalMileage = mileageReports.reduce((s, r) => s + (r.endOdo - r.startOdo), 0);
    const totalCash = marketCollections.filter(c => c.type === 'Cash').reduce((s, c) => s + c.amount, 0);
    const totalIMPS = marketCollections.filter(c => c.type === 'IMPS').reduce((s, c) => s + c.amount, 0);
    const totalCheque = marketCollections.filter(c => c.type === 'Cheque').reduce((s, c) => s + c.amount, 0);

    const filteredReturns = returnReports.filter(r => {
      const q = returnsSearch.toLowerCase();
      return r.shopName.toLowerCase().includes(q) || r.productName.toLowerCase().includes(q);
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
                <span className="font-bold text-neutral-800 font-mono-sm">${totalCash.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              </div>
              <div className="p-1 rounded bg-indigo-50 border border-indigo-200">
                <p className="text-[9px] text-neutral-400 font-bold uppercase">total IMPS</p>
                <span className="font-bold text-indigo-700 font-mono-sm">${totalIMPS.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              </div>
              <div className="p-1 rounded bg-emerald-50 border border-emerald-200">
                <p className="text-[9px] text-neutral-400 font-bold uppercase">TOTAL Cheque</p>
                <span className="font-bold text-emerald-700 font-mono-sm">${totalCheque.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Returns Monitor catalog list */}
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
                  <th className="py-2.5">Returned Product Name</th>
                  <th className="py-2.5 text-center">MRP</th>
                  <th className="py-2.5 text-center">Quantity</th>
                  <th className="py-2.5 text-right">Value Amount</th>
                  <th className="py-2.5 text-center">Reason Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3">
                      <p className="font-bold text-neutral-900">{ret.shopName}</p>
                      <span className="text-[10px] text-neutral-400 font-mono-sm">{ret.shopNo}</span>
                    </td>
                    <td className="py-3 items-center gap-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                        <Coffee size={12} className="text-amber-600" />
                        <span>{ret.productName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center font-mono-sm text-neutral-600">${ret.mrp.toFixed(2)}</td>
                    <td className="py-3 text-center font-bold text-neutral-800 bg-neutral-50/50">{ret.quantity} units</td>
                    <td className="py-3 text-right font-mono-sm font-bold text-neutral-900">
                      ${(ret.mrp * ret.quantity).toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      <span className="inline-block px-2.5 py-1 text-[10px] bg-rose-50 text-rose-800 font-bold rounded-lg border border-rose-100">
                        {ret.remarks || 'Damaged packaging'}
                      </span>
                    </td>
                  </tr>
                ))}
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
              Total Market Capital: ${(totalCash + totalIMPS + totalCheque).toLocaleString(undefined, {minimumFractionDigits:2})}
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
                      ${col.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
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

          </div>
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
