import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, ClipboardCheck, Truck,
  Building, Database, Menu, X, LogIn, LogOut
} from 'lucide-react';

import { 
  TeamMember, SalesReport, DamageReport, CollectionReport, 
  PackingLog, ReturnReport, MileageReport, MarketCollection 
} from './types';

import SubmitReportForms from './components/SubmitReportForms';
import AdminViews from './components/AdminViews';
import LoginView from './components/LoginView';
import { useAppwrite } from './useAppwrite';
import { COLLECTIONS } from './lib/appwrite';

export default function App() {
  
  // --- STATE FOR AUTHORIZED ACCESS ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('distro_is_logged_in') === 'true';
  });

  const { data: usersList, add: apiAddUser, update: apiUpdateUser, remove: apiRemoveUser } = useAppwrite<TeamMember>(COLLECTIONS.TEAM_MEMBERS);

  // Wrapper for setUsersList inside components that expect a dispatcher or simple array methods
  const setUsersList = (action: React.SetStateAction<TeamMember[]>) => {
    // No-op: AdminViews handles add/edit/delete via apiAddUser/apiUpdateUser/apiRemoveUser directly.
  };

  // --- STATE FOR CURRENT USER ACTIVE SIMULATION ---
  const [currentRole, setCurrentRole] = useState<TeamMember>(() => {
    const saved = localStorage.getItem('distro_current_role');
    if (saved && saved !== 'null' && saved !== 'undefined') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch (e) {
        console.error('Failed to parse currentRole from localStorage', e);
      }
    }
    return {
      id: 'admin',
      name: 'Global Administrator',
      role: 'System Admin',
      detail: 'Primary Admin Owner',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
    };
  });

  const [currentTab, setCurrentTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- REMOTE DATA STATES ---
  const { data: salesReports, add: addSalesReport, update: updateSalesReport } = useAppwrite<SalesReport>(COLLECTIONS.SALES_REPORTS);
  const { data: damageReports, add: addDamageReport, update: updateDamageReport } = useAppwrite<DamageReport>(COLLECTIONS.DAMAGE_REPORTS);
  const { data: collectionReports, add: addCollectionReport, update: updateCollectionReport } = useAppwrite<CollectionReport>(COLLECTIONS.COLLECTION_REPORTS);
  const { data: packingLogs, add: addPackingLogBase, update: updatePackingLogBase } = useAppwrite<PackingLog>(COLLECTIONS.PACKING_LOGS);
  const { data: returnReports, add: addReturnReport, update: updateReturnReport } = useAppwrite<ReturnReport>(COLLECTIONS.RETURN_REPORTS);
  const { data: mileageReports, add: addMileageReport, update: updateMileageReport } = useAppwrite<MileageReport>(COLLECTIONS.MILEAGE_REPORTS);
  const { data: marketCollections, add: addMarketCollection, update: updateMarketCollection } = useAppwrite<MarketCollection>(COLLECTIONS.MARKET_COLLECTIONS);

  useEffect(() => {
    localStorage.setItem('distro_current_role', JSON.stringify(currentRole));
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('distro_is_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('distro_is_logged_in');
  };

  // Packing log needs special handling to update today's log if it exists
  const handleAddPackingLog = (log: PackingLog) => {
    const exists = packingLogs.find(l => l.memberId === log.memberId);
    if (exists) {
      updatePackingLogBase(exists.id, log);
    } else {
      addPackingLogBase(log);
    }
  };

  const isManagementPersona = currentRole.id === 'admin' || currentRole.role === 'Accounts' || currentRole.role === 'System Admin';
  const isAdmin = currentRole.id === 'admin' || currentRole.role === 'System Admin';

  const menuItems = [
    { id: 'overview', name: 'Overview Home', icon: Building, desc: 'Operational KPI dashboard' },
    ...(isAdmin ? [{ id: 'team', name: 'User Management', icon: Users, desc: 'Add/Edit Staff Access' }] : []),
    { id: 'sales', name: 'Sales Hub', icon: BarChart3, desc: 'Salesmen metrics & logs' },
    ...(isAdmin ? [{ id: 'packing', name: 'Packing Line', icon: Database, desc: 'Line efficiency & lunch breaks' }] : []),
    { id: 'delivery', name: 'Delivery / Returns', icon: Truck, desc: 'Mileage & returns processing' },
    { id: 'accounts', name: 'Verification Hub', icon: ClipboardCheck, desc: 'Accounts auditing Desk' },
  ];

  if (!isLoggedIn) {
    return (
      <LoginView 
        usersPool={usersList}
        onLogin={(user) => { 
          setCurrentRole(user); 
          setIsLoggedIn(true); 
          if (user.id === 'admin' || user.role === 'Accounts') {
            setCurrentTab('overview'); 
          }
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] text-[#1D1D1F]">
      
      <header className="glass-panel sticky top-0 z-40 px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs tracking-tighter shadow-sm">
              SSS
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1D1D1F] tracking-tight flex items-center gap-2">
                <span>SSS Enterprises</span>
                <span className="text-[10px] font-bold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full inline-block uppercase">
                  v3.0.0
                </span>
              </h2>
              <p className="text-[10px] text-[#86868B] font-medium font-sans">Distributed Logistical Dispatch & Audit Verification Hub</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider">Gateway Status:</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 justify-end mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span>SYSTEM STABLE (UTC LIVE)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 border-l border-[#D2D2D7] pl-3">
              <img src={currentRole.avatar} alt={currentRole.name} className="w-7 h-7 rounded-full object-cover border border-[#D2D2D7]" />
              <div className="text-left select-none">
                <p className="text-[11px] font-bold text-[#1D1D1F] leading-none">{currentRole.name}</p>
                <p className="text-[9px] text-[#86868B] leading-none mt-0.5">{currentRole.role}</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              title="End Secure Session"
              className="text-[11px] font-bold bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors flex items-center gap-1.5 shadow-sm-light cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#424245] hover:bg-[#F5F5F7]"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row relative">
        
        {isManagementPersona ? (
          <aside className={`w-full md:w-64 bg-white border-r border-[#D2D2D7] p-5 md:sticky md:top-16 space-y-6 shrink-0 transition-transform ${
            mobileMenuOpen ? 'block' : 'hidden md:block'
          }`}>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider pl-2 block">Manager Control Room</span>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group ${
                        isActive 
                          ? 'bg-[#F5F5F7] text-[#0071E3] font-semibold' 
                          : 'text-[#424245] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'
                      }`}
                    >
                      <Icon size={16} className={`mt-0.5 shrink-0 ${isActive ? 'text-[#0071E3]' : 'text-[#86868B] group-hover:text-[#424245]'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-none">{item.name}</p>
                        <p className={`text-[10px] mt-1 transition-colors ${isActive ? 'text-[#6E6E73]' : 'text-[#86868B] group-hover:text-[#6E6E73]'}`}>
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-[#D2D2D7] pt-4 px-2 space-y-2">
              <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block">Auditor Accounts (Quick View)</span>
              <div className="bg-[#F5F5F7] border border-[#D2D2D7] p-3 rounded-xl flex items-center gap-3 shadow-sm-light">
                <img 
                  src={currentRole.avatar} 
                  alt={currentRole.name} 
                  className="w-8 h-8 rounded-full object-cover border border-[#D2D2D7]" 
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1D1D1F] leading-none truncate">{currentRole.name}</p>
                  <span className="text-[9px] text-[#0071E3] bg-[#0071E3]/5 border border-[#0071E3]/20 px-1.5 py-0.5 rounded font-bold inline-block mt-1">
                    {currentRole.role} Role
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 mt-2 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-colors border border-red-200 cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out Account</span>
              </button>
            </div>
          </aside>
        ) : (
          <aside className="w-full md:w-64 bg-white border-r border-[#D2D2D7] p-5 shrink-0 space-y-4">
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <LogIn size={14} />
                <span>Shift Portal Active</span>
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                As a logged-in <strong>{currentRole.name} ({currentRole.role})</strong>, fill in the report panels on the right. Your logged submissions are sent directly to the cloud backend!
              </p>
            </div>

            <div className="border-t border-[#D2D2D7] pt-4 px-1">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-colors border border-red-200 cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out Account</span>
              </button>
            </div>
          </aside>
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full">
          {isManagementPersona ? (
            <AdminViews 
              currentTab={currentTab}
              isAdmin={isAdmin}
              usersList={usersList}
              apiAddUser={apiAddUser}
              apiUpdateUser={apiUpdateUser}
              apiRemoveUser={apiRemoveUser}
              setUsersList={() => {}}
              salesReports={salesReports}
              damageReports={damageReports}
              collectionReports={collectionReports}
              packingLogs={packingLogs}
              returnReports={returnReports}
              mileageReports={mileageReports}
              marketCollections={marketCollections}
              onVerifySalesReport={(id, s, r) => updateSalesReport(id, { status: s, remarks: r })}
              onVerifyDamageReport={(id, s, r) => updateDamageReport(id, { status: s, remarks: r })}
              onVerifyCollectionReport={(id, s, r) => updateCollectionReport(id, { status: s, remarks: r })}
              onVerifyReturnReport={(id, s, r) => updateReturnReport(id, { status: s, remarks: r })}
              onVerifyMileageReport={(id, s, r) => updateMileageReport(id, { status: s, remarks: r })}
              onVerifyMarketCollection={(id, s, r) => updateMarketCollection(id, { status: s, remarks: r })}
            />
          ) : (
            <SubmitReportForms 
              currentRole={currentRole}
              usersList={usersList}
              onAddSalesReport={addSalesReport}
              onAddDamageReport={addDamageReport}
              onAddCollectionReport={addCollectionReport}
              onAddPackingLog={handleAddPackingLog}
              onAddReturnReport={addReturnReport}
              onAddMileageReport={addMileageReport}
              onAddMarketCollection={addMarketCollection}
            />
          )}
        </main>

      </div>
    </div>
  );
}
