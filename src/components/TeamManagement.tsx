import React, { useState } from 'react';
import { 
  Users, KeyRound, User, Plus, Edit3, Trash2, X, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { TeamMember } from '../types';

interface TeamManagementProps {
  usersList: TeamMember[];
  apiAddUser: (user: TeamMember) => Promise<void>;
  apiUpdateUser: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  apiRemoveUser: (id: string) => Promise<void>;
  setUsersList: React.Dispatch<React.SetStateAction<TeamMember[]>>;
}

export default function TeamManagement({ usersList, apiAddUser, apiUpdateUser, apiRemoveUser, setUsersList }: TeamManagementProps) {
  const [isEditing, setIsEditing] = useState<TeamMember | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    role: 'Salesman',
    detail: '',
    userId: '',
    password: '',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  });

  const handleCreateNew = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({
      name: '',
      role: 'Salesman',
      detail: '',
      userId: '',
      password: '',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    });
  };

  const handleEdit = (user: TeamMember) => {
    setIsEditing(user);
    setIsAdding(false);
    setFormData({ ...user });
  };

  const handleDelete = async (id: string) => {
    if (id === 'admin') {
      alert("Cannot delete the Global Administrator.");
      return;
    }
    if (confirm("Are you sure you want to delete this user?")) {
      await apiRemoveUser(id);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.userId || !formData.password) {
      alert("Please fill in Name, User ID, and Password.");
      return;
    }

    if (isAdding) {
      const newUser: TeamMember = {
        ...formData,
        id: `u-${Date.now()}`,
      } as TeamMember;
      await apiAddUser(newUser);
      setIsAdding(false);
    } else if (isEditing) {
      await apiUpdateUser(isEditing.id, formData);
      setIsEditing(null);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Users size={20} className="text-[#0071E3]" />
            User Access Management
          </h2>
          <p className="text-xs text-neutral-500 mt-1">Add or modify team members and manage their authentication credentials.</p>
        </div>
        {!isAdding && !isEditing && (
          <button 
            onClick={handleCreateNew}
            className="bg-[#0071E3] hover:bg-[#0066CC] text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
          <h3 className="font-bold text-neutral-800 text-sm border-b border-neutral-100 pb-2">
            {isAdding ? "Create New Team Member" : `Edit Details: ${isEditing?.name}`}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Full Name</label>
              <input 
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full text-sm py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0071E3]"
                placeholder="e.g. Emily Davis"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Role / Category</label>
              <select
                value={formData.role || 'Salesman'}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="w-full text-sm py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0071E3] bg-white"
              >
                <option value="System Admin">System Admin</option>
                <option value="Accounts">Accounts & Verifications</option>
                <option value="Salesman">Sales Representative</option>
                <option value="Packing">Packing Operations</option>
                <option value="Delivery">Delivery Logistics</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Details / Territory / Zone</label>
              <input 
                type="text"
                value={formData.detail || ''}
                onChange={(e) => setFormData({...formData, detail: e.target.value})}
                className="w-full text-sm py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0071E3]"
                placeholder="e.g. Route Alpha, Region D"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Avatar URL (Optional)</label>
              <input 
                type="text"
                value={formData.avatar || ''}
                onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                className="w-full text-sm py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0071E3]"
                placeholder="https://..."
              />
            </div>
            
            <div className="col-span-1 sm:col-span-2 pt-4 border-t border-neutral-100 flex items-center gap-2 mb-2">
              <KeyRound size={14} className="text-[#0071E3]" />
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest">Authentication Credentials</h4>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Login User ID</label>
              <input 
                type="text"
                value={formData.userId || ''}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
                className="w-full text-sm py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-emerald-50/20"
                placeholder="Unique Login ID (e.g. emily_04)"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Secure Password</label>
              <input 
                type="text"
                value={formData.password || ''}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full text-sm py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-red-500 bg-red-50/20"
                placeholder="Account password"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-neutral-100">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold text-xs rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-[#0071E3] hover:bg-[#0066CC] text-white font-bold text-xs rounded-lg transition"
            >
              Save Credentials Log
            </button>
          </div>
        </div>
      )}

      {/* Roster View */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-[10px] text-neutral-500 uppercase tracking-wider font-bold bg-neutral-50/50">
                <th className="py-3 px-4">Member Persona</th>
                <th className="py-3 px-4">Role Department</th>
                <th className="py-3 px-4">Login User ID</th>
                <th className="py-3 px-4">Current Password</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {usersList.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50/50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-neutral-200 object-cover" />
                      <div>
                        <p className="font-bold text-neutral-900 text-sm">{user.name}</p>
                        <p className="text-[10px] text-neutral-500">{user.detail || 'General Staff'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full border border-neutral-200 bg-white font-semibold text-[10px]">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono-sm text-[#0071E3] font-bold">
                    {user.userId}
                  </td>
                  <td className="py-3 px-4 font-mono-sm text-neutral-500">
                    {user.password ? '••••' + user.password.slice(-2) : 'No Auth Set'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        title="Edit Details"
                        className="p-1.5 text-neutral-400 hover:text-[#0071E3] hover:bg-[#F5F5F7] rounded"
                      >
                        <Edit3 size={16} />
                      </button>
                      {user.id !== 'admin' && (
                         <button 
                         onClick={() => handleDelete(user.id)}
                         title="Revoke User"
                         className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"
                       >
                         <Trash2 size={16} />
                       </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
