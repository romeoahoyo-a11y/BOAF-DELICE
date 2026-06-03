import React from 'react';
import {
  Bell,
  Calendar,
  Shield,
  Search,
  User,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface HeaderProps {
  currentRole: string;
  setCurrentRole: (role: string) => void;
  currentUser: string;
  setCurrentUser: (user: string) => void;
}

export const ROLES_MAPPING = [
  { id: 'admin', label: 'Administrateur / Direction', icon: Shield, color: 'text-red-600 bg-red-100' },
  { id: 'superviseur', label: 'Superviseur Commercial', icon: Shield, color: 'text-indigo-600 bg-indigo-100' },
  { id: 'whatsapp', label: 'Responsable WhatsApp / Vente', icon: Shield, color: 'text-green-600 bg-green-100' },
  { id: 'agent', label: 'Agent Terrain', icon: Shield, color: 'text-amber-600 bg-amber-100' },
  { id: 'lecteur', label: 'Auditeur / Lecteur', icon: Shield, color: 'text-gray-600 bg-gray-100' }
];

export default function Header({ currentRole, setCurrentRole, currentUser, setCurrentUser }: HeaderProps) {
  // Sync the username based on chosen role for realistic demonstration
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrentRole(val);
    if (val === 'admin') setCurrentUser('Jean Doussou');
    else if (val === 'superviseur') setCurrentUser('Diana Biokou');
    else if (val === 'whatsapp') setCurrentUser('Sylvie Kode');
    else if (val === 'agent') setCurrentUser('Eric Adjovi');
    else setCurrentUser('Auditeur Anonyme');
  };

  const todayStr = '03 Juin 2026'; // Match user context datetime exactly

  return (
    <header className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      {/* Search Bar / Context Identifier */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher acteurs, codes, tickets..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs w-64 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-sans"
          />
        </div>
        
        {/* Connection status tag */}
        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-[10px] uppercase tracking-wider font-bold rounded-full font-sans border border-green-100 hidden md:flex">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
          Serveur connecté
        </span>
      </div>

      {/* Control Tools - Live Switch role */}
      <div className="flex items-center gap-6">
        {/* Simulation Role Selector */}
        <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1.5 rounded-xl">
          <Shield className="w-4 h-4 text-orange-500" />
          <div className="flex flex-col text-[10px] leading-none">
            <span className="text-gray-400 font-mono uppercase tracking-wider">Rôle Simulé</span>
            <select
              value={currentRole}
              onChange={handleRoleChange}
              className="font-bold text-gray-800 bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-xs min-w-32 font-sans cursor-pointer hover:text-orange-600 transition-colors"
            >
              {ROLES_MAPPING.map(r => (
                <option key={r.id} value={r.id} className="text-gray-800">
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Context */}
        <div className="flex items-center gap-2 text-gray-600 text-xs font-medium border-r border-[#E5E7EB] pr-6 hidden md:flex">
          <Calendar className="w-4 h-4 text-[#0B5D2A]" />
          <span className="font-sans font-semibold text-[#0B5D2A]">{todayStr}</span>
        </div>

        {/* Notifications and Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications button */}
          <button className="relative w-10 h-10 rounded-xl hover:bg-gray-50 flex items-center justify-center transition-colors border border-gray-100 cursor-pointer">
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Profile display */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold font-sans text-gray-900 block leading-tight">
                {currentUser}
              </span>
              <span className="text-[10px] text-gray-400 font-mono tracking-wide uppercase">
                {currentRole === 'admin' ? 'Administrateur' : currentRole === 'superviseur' ? 'Superviseur' : currentRole === 'whatsapp' ? 'Agent WhatsApp' : currentRole === 'agent' ? 'Agent Terrain' : 'Lecteur'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
