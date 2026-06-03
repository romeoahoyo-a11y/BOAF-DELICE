import React, { useState } from 'react';
import {
  TrendingUp,
  Coins,
  Smile,
  Receipt,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  MapPin,
  ChevronRight,
  Filter,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { Order, Actor, Commission, AttendanceLog, ActivityLog } from '../types';

interface DashboardViewProps {
  orders: Order[];
  actors: Actor[];
  commissions: Commission[];
  attendanceLogs: AttendanceLog[];
  activityLogs: ActivityLog[];
  onNavigate: (tab: string) => void;
}

export default function DashboardView({
  orders,
  actors,
  commissions,
  attendanceLogs,
  activityLogs,
  onNavigate
}: DashboardViewProps) {
  const [mapFilter, setMapFilter] = useState<'all' | 'present' | 'on_mission' | 'absent'>('all');

  // Compute live statistics
  const totalSalesNet = orders
    .filter(o => o.order_status === 'valid' && o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total_net, 0);

  // Today is defined as 2026-06-03 in mock
  const todayDateStr = '2026-06-03';
  const todaySales = orders
    .filter(o => o.order_status === 'valid' && o.created_at.startsWith(todayDateStr))
    .reduce((sum, o) => sum + o.total_net, 0);

  const pendingCommissions = commissions
    .filter(c => c.statut === 'pending' || c.statut === 'validated')
    .reduce((sum, c) => sum + c.montant_commission, 0);

  const totalAgents = actors.filter(a => a.type_actor === 'agent').length;
  // Count active agents logged in attendance on 2026-06-01 to 2026-06-03
  const activeAgentsCount = attendanceLogs.filter(log => log.date === '2026-06-02' || log.date === '2026-06-03').length;

  const totalProspects = 128; // Benchmark display constant matching mock screen
  const totalTicketsCount = orders.filter(o => o.order_status === 'valid').length;

  // Evolution analysis - Group sales by date over late May / early June 2026
  const salesHistoryRaw = [
    { name: '28 Mai', total: 680000 },
    { name: '29 Mai', total: 720000 },
    { name: '30 Mai', total: 950000 },
    { name: '31 Mai', total: 820000 },
    { name: '01 Juin', total: 1100000 },
    { name: '02 Juin', total: 1245800 },
    { name: '03 Juin', total: todaySales || 1190000 }
  ];

  // Distribution chart of Sales by Channels
  const channelDistribution = [
    { name: 'Vente directe', value: Math.round(totalSalesNet * 0.35), color: '#0B5D2A' },
    { name: 'Agents terrain', value: Math.round(totalSalesNet * 0.28), color: '#F97316' },
    { name: 'Ambassadeurs', value: Math.round(totalSalesNet * 0.15), color: '#3B82F6' },
    { name: 'Partenaires', value: Math.round(totalSalesNet * 0.12), color: '#8B5CF6' },
    { name: 'Codes promo', value: Math.round(totalSalesNet * 0.10), color: '#10B981' }
  ];

  // Top Agents Performance (limit 5)
  const topAgents = actors
    .filter(a => a.type_actor === 'agent' || a.type_actor === 'partner' || a.type_actor === 'ambassador')
    .map(act => {
      const actOrders = orders.filter(o => o.code_promo_id === `code-${act.id}` && o.order_status === 'valid');
      const salesCount = actOrders.length;
      const salesVolume = actOrders.reduce((sum, o) => sum + o.total_net, 0);
      const commissionGenerated = commissions
        .filter(c => c.actor_id === act.id && c.statut !== 'rejected')
        .reduce((sum, c) => sum + c.montant_commission, 0);

      return {
        id: act.id,
        name: act.full_name,
        code: act.main_code,
        type: act.type_actor,
        salesCount,
        salesVolume,
        commissionGenerated
      };
    })
    .sort((a, b) => b.salesVolume - a.salesVolume)
    .slice(0, 5);

  // Interactive GPS Radar Map definition: coordinates mapping
  const regionPins = [
    { id: 'pin-1', name: 'Eric Adjovi', role: 'Agent Terrain', status: 'present', lat: 140, lng: 180, zone: 'Lokossa Centre', phone: '+229 97 45 45 01', lastTime: '07h45' },
    { id: 'pin-2', name: 'Grace Houngbédji', role: 'Agent Terrain', status: 'present', lat: 80, lng: 280, zone: 'Agamé', phone: '+229 96 32 32 02', lastTime: '08h15' },
    { id: 'pin-3', name: 'Felicien Gbaguidi', role: 'Agent Terrain', status: 'on_mission', lat: 220, lng: 320, zone: 'Houinvié', phone: '+229 91 12 12 03', lastTime: '09h12' },
    { id: 'pin-4', name: 'Juliette Keke', role: 'Agent Terrain', status: 'on_mission', lat: 290, lng: 120, zone: 'Ouèdèmè', phone: '+229 92 23 23 04', lastTime: '07h55' },
    { id: 'pin-5', name: 'Christian Lokossou', role: 'Agent Terrain', status: 'present', lat: 310, lng: 420, zone: 'Athiémé Centre', phone: '+229 93 34 34 05', lastTime: '08h00' },
    { id: 'pin-6', name: 'Gisèle Agbo', role: 'Agent Terrain', status: 'present', lat: 110, lng: 160, zone: 'Lokossa Centre', phone: '+229 94 45 45 06', lastTime: '07h45' },
    { id: 'pin-7', name: 'Hubert Tossou', role: 'Agent Terrain', status: 'absent', lat: 400, lng: 550, zone: 'Agamé', phone: '+229 95 56 56 07', lastTime: 'Absent' },
    { id: 'pin-8', name: 'Isabelle Dagba', role: 'Agent Terrain', status: 'absent', lat: 380, lng: 280, zone: 'Houinvié', phone: '+229 98 67 67 08', lastTime: 'Absent' }
  ];

  const filteredPins = regionPins.filter(pin => {
    if (mapFilter === 'all') return true;
    return pin.status === mapFilter;
  });

  const [selectedMapPin, setSelectedMapPin] = useState<any>(regionPins[0]);

  return (
    <div className="space-y-8 pb-10">
      {/* Upper Grid: Key KPI Indicators with custom curves */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* KPI 1 : Cumulative Sales */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 font-sans tracking-wide uppercase">Ventes Globales</span>
            <div className="bg-orange-50 p-2.5 rounded-xl">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight leading-none mb-1">
              {totalSalesNet.toLocaleString('fr-FR')} FCFA
            </h3>
            <p className="text-xs font-semibold text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+18.6% vs hier</span>
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <TrendingUp className="w-24 h-24 text-orange-500 translate-x-4 translate-y-4" />
          </div>
        </div>

        {/* KPI 2 : Commissions of current month */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 font-sans tracking-wide uppercase">Commissions à Payer</span>
            <div className="bg-green-50 p-2.5 rounded-xl">
              <Coins className="w-5 h-5 text-green-700" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight leading-none mb-1">
              {pendingCommissions.toLocaleString('fr-FR')} FCFA
            </h3>
            <p className="text-xs font-semibold text-amber-600 flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" />
              <span>-12.4% vs hier</span>
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <Coins className="w-24 h-24 text-[#0B5D2A] translate-x-4 translate-y-4" />
          </div>
        </div>

        {/* KPI 3 : Active agents in field */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 font-sans tracking-wide uppercase">Agents Terrain</span>
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight leading-none mb-1">
              {activeAgentsCount} <span className="text-xs font-normal text-gray-400">/ {totalAgents}</span>
            </h3>
            <p className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Sur le terrain ce jour</span>
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <UserCheck className="w-24 h-24 text-blue-500 translate-x-4 translate-y-4" />
          </div>
        </div>

        {/* KPI 4 : Total registered prospects */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 font-sans tracking-wide uppercase">Prospects Suivis</span>
            <div className="bg-purple-50 p-2.5 rounded-xl">
              <Smile className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight leading-none mb-1">
              {totalProspects}
            </h3>
            <p className="text-xs font-semibold text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+15 Nouveaux</span>
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <Smile className="w-24 h-24 text-purple-500 translate-x-4 translate-y-4" />
          </div>
        </div>

        {/* KPI 5 : Valid tickets / orders sales */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 font-sans tracking-wide uppercase">Commandes</span>
            <div className="bg-teal-50 p-2.5 rounded-xl">
              <Receipt className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight leading-none mb-1">
              {totalTicketsCount}
            </h3>
            <p className="text-xs font-semibold text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+22.8% vs hier</span>
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <Receipt className="w-24 h-24 text-teal-500 translate-x-4 translate-y-4" />
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Sales trends */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-display font-extrabold text-[#0B5D2A] text-base tracking-tight">
                Évolution des ventes
              </h4>
              <p className="text-xs text-gray-400 mt-0.5 font-sans">
                Chiffre d'affaires net quotidien (FCFA) sur les 7 derniers jours
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#F8FAFC] border border-[#E5E7EB] text-gray-600 px-3 py-1 rounded-lg">
              Hebdomadaire
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesHistoryRaw} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toLocaleString('fr-FR')}k`}
                />
                <Tooltip
                  formatter={(v: any) => [`${v.toLocaleString('fr-FR')} FCFA`, 'Ventes nettes']}
                  contentStyle={{ background: '#FFFFFF', borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top sales channels */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-display font-extrabold text-[#0B5D2A] text-base tracking-tight">
                Top canaux de vente
              </h4>
              <p className="text-xs text-gray-400 mt-0.5 font-sans">
                Répartition par type d'apporteur d'affaires
              </p>
            </div>
          </div>

          <div className="h-68 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelDistribution} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: any) => [`${v.toLocaleString('fr-FR')} FCFA`, 'Chiffre d\'Affaires']}
                  contentStyle={{ background: '#FFFFFF', borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '11px' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={12}>
                  {channelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Geolocation Map Segment of Lokossa & Environment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Tactical Map */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs lg:col-span-2 relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h4 className="font-display font-extrabold text-[#0B5D2A] text-base tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500 animate-bounce" />
                Localisation en temps réel (Lokossa)
              </h4>
              <p className="text-xs text-gray-400 mt-0.5 font-sans">
                Zones de couverture et positions synchronisées GPS au check-in
              </p>
            </div>

            {/* Map Filtering toggles */}
            <div className="flex gap-1.5 bg-[#F8FAFC] border border-[#E5E7EB] p-1 rounded-xl text-xs">
              {(['all', 'present', 'on_mission', 'absent'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setMapFilter(f)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                    mapFilter === f
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {f === 'all' ? 'Tous' : f === 'present' ? 'Actifs' : f === 'on_mission' ? 'En mission' : 'Absents'}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Vector Tactical Map representing South-West Benin */}
          <div className="flex-1 min-h-[340px] bg-sky-50 rounded-2xl relative border border-slate-200 overflow-hidden shadow-inner flex">
            {/* Grid overlay for radar look */}
            <div className="absolute inset-0 bg-grid-[#0B5D2A]/[0.05] pointer-events-none" />

            {/* Blue animated lake (Lake Toho simulated) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M -50 200 Q 150 120 280 250 T 600 320 T 900 240 L 900 400 L -50 400 Z"
                fill="#E0F2FE"
                stroke="#BAE6FD"
                strokeWidth="2"
                opacity="0.8"
              />
              <text x="350" y="360" fill="#0EA5E9" className="text-[10px] font-mono tracking-widest opacity-60 uppercase font-bold text-center">
                Zone Lagune / Fleuve Mono
              </text>

              {/* Main boundaries */}
              <circle cx="150" cy="150" r="100" fill="none" stroke="#22C55E" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
              <text x="110" y="70" fill="#0B5D2A" className="text-[9px] font-mono opacity-80">Serré Lokossa Centre (Rayon 1500m)</text>

              <circle cx="280" cy="100" r="120" fill="none" stroke="#22C55E" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
              <text x="240" y="40" fill="#0B5D2A" className="text-[9px] font-mono opacity-80">Agamé Route (Rayon 2500m)</text>
            </svg>

            {/* Main roads */}
            <div className="absolute top-1/3 left-0 w-full h-1 bg-amber-200/60 rotate-12 origin-left pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-1 h-full bg-amber-200/60 -rotate-12 pointer-events-none" />

            {/* Floating Zone Labels */}
            <div className="absolute top-36 left-28 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-xs border border-gray-200 text-[10px] font-black text-[#0B5D2A] z-10 uppercase tracking-wider">
              📍 Lokossa Centre
            </div>
            <div className="absolute top-16 left-60 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-xs border border-gray-200 text-[10px] font-black text-[#0B5D2A] z-10 uppercase tracking-wider">
              🌾 Agamé
            </div>
            <div className="absolute top-52 left-72 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-xs border border-gray-200 text-[10px] font-black text-[#0B5D2A] z-10 uppercase tracking-wider">
              🏫 Houinvié
            </div>
            <div className="absolute top-64 left-16 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-xs border border-gray-200 text-[10px] font-black text-[#0B5D2A] z-10 uppercase tracking-wider">
              🌿 Ouèdèmè
            </div>

            {/* Render Agent Pins */}
            {filteredPins.map(pin => {
              const markerColor =
                pin.status === 'present'
                  ? 'bg-green-500 border-white text-green-100'
                  : pin.status === 'on_mission'
                  ? 'bg-orange-500 border-white text-orange-100'
                  : 'bg-gray-400 border-white text-gray-200';

              const isSelected = selectedMapPin?.id === pin.id;

              return (
                <button
                  key={pin.id}
                  onClick={() => setSelectedMapPin(pin)}
                  className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 hover:scale-125 z-20"
                  style={{ top: `${pin.lat}px`, left: `${pin.lng}px` }}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing ring for active present/mission agents */}
                    {pin.status !== 'absent' && (
                      <span className={`absolute inline-flex h-8 w-8 rounded-full animate-ping opacity-25 ${
                        pin.status === 'present' ? 'bg-green-400' : 'bg-orange-400'
                      }`} />
                    )}

                    <div className={`p-1.5 rounded-full border-2 shadow-md ${markerColor} ${
                      isSelected ? 'ring-4 ring-orange-500/40 scale-110' : ''
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>

                    <div className="absolute bottom-full mb-1.5 bg-gray-900 text-white text-[9px] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none max-w-xs font-sans">
                      {pin.name} ({pin.lastTime})
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Pin Details Display (Right Panel) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="border-b border-[#E5E7EB] pb-4 mb-4">
              <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded-md uppercase tracking-wider font-mono">
                Détail Position GPS
              </span>
              <h4 className="font-display font-extrabold text-[#0B5D2A] text-lg mt-2 tracking-tight">
                {selectedMapPin?.name || 'Aucun agent sélectionné'}
              </h4>
              <p className="text-xs text-gray-400 font-sans">
                Rôle : {selectedMapPin?.role}
              </p>
            </div>

            {selectedMapPin ? (
              <div className="space-y-4 font-sans text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Statut de présence</span>
                  <span className={`font-bold uppercase ${
                    selectedMapPin.status === 'present'
                      ? 'text-green-600'
                      : selectedMapPin.status === 'on_mission'
                      ? 'text-orange-600'
                      : 'text-gray-500'
                  }`}>
                    {selectedMapPin.status === 'present' ? '● Présent & Actif' : selectedMapPin.status === 'on_mission' ? '● En Mission' : '● Inactif / Absent'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Zone affectée</span>
                  <span className="font-semibold text-gray-800">{selectedMapPin.zone}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Téléphone</span>
                  <span className="font-mono text-gray-800">{selectedMapPin.phone}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Heure de Check-In</span>
                  <span className="font-semibold text-gray-800">{selectedMapPin.lastTime}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Précision Coordonnées</span>
                  <span className="font-mono text-green-600">± 8.5 mètres</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-500 italic text-[11px] leading-relaxed">
                  "L'agent est géolocalisé grâce au navigateur Web responsive lors du check-in d'entrée de service. Aucun tracking passif n'est appliqué."
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Cliquez sur un marqueur de la carte pour inspecter.</p>
            )}
          </div>

          <button
            onClick={() => onNavigate('attendance')}
            className="w-full mt-6 bg-[#0B5D2A] text-white hover:bg-[#0B5D2A]/90 py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-green-900/10 transition-all font-sans"
          >
            Déclarer présence / Suivre la liste complète
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Under Grid: Top promo code leaders and living activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard Table / Promo codes */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-display font-extrabold text-[#0B5D2A] text-base tracking-tight">
                Top Agents & Codes Performance
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">Le top 5 par volume de ventes validées rattachées au code</p>
            </div>
            <button
              onClick={() => onNavigate('actors')}
              className="text-xs text-orange-600 font-bold hover:underline flex items-center gap-1 cursor-pointer font-sans"
            >
              Tous les acteurs <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-mono uppercase tracking-wider py-2">
                  <th className="pb-3 text-left">Acteur/Bénéficiaire</th>
                  <th className="pb-3 text-center">Code Principal</th>
                  <th className="pb-3 text-center">Commandes</th>
                  <th className="pb-3 text-right">Ventes Générées</th>
                  <th className="pb-3 text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topAgents.map((ag, i) => (
                  <tr key={ag.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-500 font-extrabold text-[10px] flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <p>{ag.name}</p>
                          <span className="text-[10px] text-gray-400 capitalize">{ag.type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold">
                        {ag.code}
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold text-gray-700">{ag.salesCount}</td>
                    <td className="py-3 text-right font-bold text-[#0B5D2A]">
                      {ag.salesVolume.toLocaleString('fr-FR')} F
                    </td>
                    <td className="py-3 text-right font-semibold text-orange-500">
                      {ag.commissionGenerated.toLocaleString('fr-FR')} F
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Living Activity Feed */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-display font-extrabold text-[#0B5D2A] text-base tracking-tight mb-4">
              Activités et transactions récentes
            </h4>
            <div className="space-y-4">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex gap-3 hover:bg-gray-50/60 p-2 rounded-xl transition-all">
                  <div className="w-8 h-8 rounded-full bg-[#0B5D2A]/10 flex items-center justify-center text-[#0B5D2A] shrink-0 mt-0.5">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="text-gray-800 leading-normal">
                      <span className="font-bold text-gray-900">{log.user_name}</span> ({log.user_role}) :{' '}
                      <span className="text-slate-600 font-semibold">{log.action}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-mono">
                      <span>{new Date(log.created_at).toLocaleTimeString('fr-FR')}</span>
                      <span>•</span>
                      <span className="uppercase font-bold text-[#0B5D2A]">{log.entity_type}</span>
                      {log.new_value && (
                        <>
                          <span>•</span>
                          <span className="text-orange-500 font-bold bg-orange-50 px-1 py-0.5 rounded-sm">
                            {log.old_value || 'none'} ➔ {log.new_value}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('reports')}
            className="w-full text-center text-xs text-[#0B5D2A] hover:text-[#0B5D2A]/80 font-bold underline cursor-pointer mt-4 py-2 font-display block"
          >
            Consulter le journal d'audit complet des opérations →
          </button>
        </div>
      </div>
    </div>
  );
}
