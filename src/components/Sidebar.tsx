import React from 'react';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Search,
  MapPin,
  Coins,
  FileSpreadsheet,
  Settings,
  Flame,
  CheckSquare
} from 'lucide-react';
import { Order } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  orders: Order[];
}

export default function Sidebar({ activeTab, setActiveTab, orders }: SidebarProps) {
  // Compute live sales sum for current progress towards the 10,000,000 FCFA goal
  const totalSalesNet = orders
    .filter(o => o.order_status === 'valid' && o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total_net, 0);

  const goalTarget = 10000000; // 10 Million FCFA
  const percentage = Math.min(100, Math.round((totalSalesNet / goalTarget) * 100));

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'actors', label: 'Gestion des acteurs', icon: Users },
    { id: 'sales', label: 'Vente, Code & Ticket', icon: Receipt },
    { id: 'verify', label: 'Vérifier un code', icon: Search },
    { id: 'attendance', label: 'Présence & Localisation', icon: MapPin },
    { id: 'commissions', label: 'Commissions', icon: Coins },
    { id: 'reports', label: 'Rapports & Exports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <aside className="w-68 bg-white border-r border-[#E5E7EB] flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#E5E7EB] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-md">
          <span className="text-white font-bold font-display text-xl">B</span>
        </div>
        <div>
          <h1 className="font-display font-extrabold text-[#0B5D2A] text-lg leading-tight uppercase tracking-wide">
            BOAF Délices
          </h1>
          <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">
            Future Holdings
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
              <span className="font-sans font-semibold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Dynamic Objective Gauge Widget */}
      <div className="p-4 m-4 bg-[#0B5D2A] rounded-2xl text-white shadow-lg space-y-4 relative overflow-hidden">
        {/* Subtle decorative background light */}
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-green-700/40 rounded-full blur-2xl" />

        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <Flame className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-green-200 font-mono tracking-wider block uppercase">
              Objectif Mensuel
            </span>
            <span className="text-lg font-bold font-display tracking-tight text-white">
              {percentage}% Atteint
            </span>
          </div>
        </div>

        <div className="space-y-1.5 relative z-10">
          <div className="flex justify-between text-[11px] font-mono text-green-100">
            <span>{totalSalesNet.toLocaleString('fr-FR')} FCFA</span>
            <span>10M FCFA</span>
          </div>
          {/* Custom styled progress bars: forest green with custom orange loader bar */}
          <div className="w-full h-2.5 bg-green-900/60 rounded-full overflow-hidden border border-green-800">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-[10px] text-green-200 block text-center italic mt-1 bg-green-900/40 py-1 px-2 rounded-lg leading-relaxed">
            Obj. Mensuel: 10 000 000 FCFA
          </span>
        </div>
      </div>
    </aside>
  );
}
