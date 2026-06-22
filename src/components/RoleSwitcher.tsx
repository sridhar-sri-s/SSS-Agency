import React from 'react';
import { Sparkles, Users, RefreshCw } from 'lucide-react';
import { TeamMember } from '../types';

interface RoleSwitcherProps {
  currentRole: TeamMember;
  usersList: TeamMember[];
  onChangeRole: (member: TeamMember) => void;
}

export default function RoleSwitcher({ currentRole, usersList, onChangeRole }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Group users by roles
  const accountsUsers = usersList.filter(u => u.role === 'Accounts' && u.id !== 'admin');
  const salesmanUsers = usersList.filter(u => u.role === 'Salesman');
  const packingUsers = usersList.filter(u => u.role === 'Packing');
  const deliveryUsers = usersList.filter(u => u.role === 'Delivery');
  
  // Find admin if it exists, otherwise use a fallback
  const adminUser = usersList.find(u => u.id === 'admin') || { 
    id: 'admin', name: 'Global Administrator', role: 'Accounts', detail: 'Primary Admin Owner', 
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200' 
  };

  const rolesList = [
    { name: 'Admin (System Owner)', category: 'Manager', list: [adminUser] },
    { name: `Accounts Auditors (${accountsUsers.length} Members)`, category: 'Accounts', list: accountsUsers },
    { name: `Salesmen (${salesmanUsers.length} Members)`, category: 'Salesman', list: salesmanUsers },
    { name: `Packing Team (${packingUsers.length} Members)`, category: 'Packing', list: packingUsers },
    { name: `Delivery Drivers (${deliveryUsers.length} Members)`, category: 'Delivery', list: deliveryUsers }
  ];

  return (
    <div id="role-switcher-container" className="fixed bottom-6 right-6 z-50">
      <button
        id="toggle-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#0071E3] hover:bg-[#0066CC] text-white font-semibold shadow-lg px-5 py-3 rounded-full transition-colors active:scale-95 border border-[#005DC2]"
      >
        <Sparkles size={16} className="text-amber-300 animate-pulse" />
        <span className="text-sm">Simulate User: <span className="font-semibold text-amber-200">{currentRole.name}</span></span>
        <RefreshCw size={12} className="ml-1 opacity-80 animate-spin-slow" />
      </button>

      {isOpen && (
        <div id="role-menu" className="absolute bottom-16 right-0 w-80 bg-white border border-[#D2D2D7] rounded-2xl shadow-xl p-4 overflow-y-auto max-h-[480px] animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between border-b border-[#D2D2D7] pb-2 mb-3">
            <div className="flex items-center gap-1.5 text-[#1D1D1F] font-semibold text-sm">
              <Users size={16} className="text-[#0071E3]" />
              <span>Company Persona Switcher</span>
            </div>
            <span className="text-[10px] text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full font-bold">Interactive Demo</span>
          </div>
          <p className="text-xs text-amber-900 mb-4 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 leading-relaxed">
            Submit a report as a team member, then switch back to <strong>Admin</strong> or <strong>Accounts</strong> to monitor or verify it!
          </p>

          <div className="space-y-4">
            {rolesList.map((group) => (
              <div key={group.name} className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block">{group.name}</span>
                <div className="grid grid-cols-1 gap-1">
                  {group.list.map((member) => {
                    const isSelected = member.id === currentRole.id;
                    return (
                      <button
                        key={member.id}
                        onClick={() => {
                          onChangeRole(member as TeamMember);
                          setIsOpen(false);
                        }}
                        className={`flex items-center gap-3 w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isSelected 
                            ? 'bg-[#0071E3] text-white font-semibold shadow-sm' 
                            : 'hover:bg-[#F5F5F7] text-[#424245]'
                        }`}
                      >
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-7 h-7 rounded-full object-cover border border-[#D2D2D7]" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-semibold">{member.name}</p>
                          <p className={`truncate text-[10px] ${isSelected ? 'text-blue-100' : 'text-[#86868B]'}`}>
                            {member.detail || member.role}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
