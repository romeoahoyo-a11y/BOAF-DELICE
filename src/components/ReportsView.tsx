import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  Coins,
  Package,
  Clock,
  UserCheck,
  Check,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Order, Actor, Zone, Commission, AttendanceLog } from '../types';

interface ReportsViewProps {
  orders: Order[];
  actors: Actor[];
  zones: Zone[];
  commissions: Commission[];
  attendanceLogs: AttendanceLog[];
  onUpdateCommissionStatus?: (commissionIds: string[], newStatus: 'pending' | 'validated' | 'paid' | 'rejected') => void;
  currentRole?: string;
}

export default function ReportsView({
  orders,
  actors,
  zones,
  commissions,
  attendanceLogs,
  onUpdateCommissionStatus,
  currentRole = 'admin'
}: ReportsViewProps) {
  
  // Tab State
  const [activeReportTab, setActiveReportTab] = useState<'daily' | 'agents' | 'codes' | 'commissions' | 'presence'>('daily');

  // --- STATS CALCULATIONS ---

  // 1. Group sales by Jour
  const dailySalesMap: Record<string, number> = {};
  orders.forEach(o => {
    if (o.order_status === 'valid') {
      const day = o.created_at.split('T')[0];
      dailySalesMap[day] = (dailySalesMap[day] || 0) + o.total_net;
    }
  });
  const dailySalesData = Object.keys(dailySalesMap).map(day => ({
    name: day.substring(5), // Keep only MD for legible label (e.g. 06-03 instead of 2026-06-03)
    total: dailySalesMap[day],
    rawName: day
  })).sort((a, b) => a.rawName.localeCompare(b.rawName));

  // 2. Group sales by Agent
  const agentSalesData = actors
    .filter(a => a.type_actor === 'agent')
    .map(agent => {
      const volume = orders
        .filter(o => o.order_status === 'valid' && o.code_promo_text?.toUpperCase() === agent.main_code?.toUpperCase())
        .reduce((sum, o) => sum + o.total_net, 0);
      const ticketCount = orders
        .filter(o => o.order_status === 'valid' && o.code_promo_text?.toUpperCase() === agent.main_code?.toUpperCase()).length;

      return {
        name: agent.full_name,
        total: volume,
        tickets: ticketCount
      };
    })
    .sort((a, b) => b.total - a.total);

  // 3. Group sales by Code Promo
  const codePromoSalesMap: Record<string, { total: number; count: number }> = {};
  orders.forEach(o => {
    if (o.order_status === 'valid' && o.code_promo_text) {
      const code = o.code_promo_text.toUpperCase();
      if (!codePromoSalesMap[code]) {
        codePromoSalesMap[code] = { total: 0, count: 0 };
      }
      codePromoSalesMap[code].total += o.total_net;
      codePromoSalesMap[code].count += 1;
    }
  });
  const codePromoSalesData = Object.keys(codePromoSalesMap).map(code => ({
    name: code,
    total: codePromoSalesMap[code].total,
    tickets: codePromoSalesMap[code].count
  })).sort((a, b) => b.total - a.total);

  // 4. Group Commissions status
  const paidComsSum = commissions.filter(c => c.statut === 'paid').reduce((sum, c) => sum + c.montant_commission, 0);
  const pendingComsSum = commissions.filter(c => c.statut === 'pending').reduce((sum, c) => sum + c.montant_commission, 0);
  const validatedComsSum = commissions.filter(c => c.statut === 'validated').reduce((sum, c) => sum + c.montant_commission, 0);

  const commissionSummaryData = [
    { name: 'Payées', total: paidComsSum },
    { name: 'Attente Validation', total: pendingComsSum },
    { name: 'Validées à Payer', total: validatedComsSum }
  ];

  // 5. Group Presence statistics
  const presenceReportData = actors
    .filter(a => a.type_actor === 'agent')
    .map(ag => {
      const logs = attendanceLogs.filter(l => l.agent_id === ag.id);
      const totalMissions = logs.length;
      const completedMissions = logs.filter(l => l.status === 'completed').length;
      const onPlaceMissions = logs.filter(l => l.status === 'arrived' || l.status === 'in_progress').length;

      return {
        name: ag.full_name,
        planned: totalMissions,
        completed: completedMissions,
        active: onPlaceMissions
      };
    });

  // Action to mark commission paid / validated easily inline as an advanced detail tool
  const handleUpdateCommission = (comId: string, nextStat: 'validated' | 'paid' | 'rejected') => {
    if (onUpdateCommissionStatus) {
      onUpdateCommissionStatus([comId], nextStat);
      alert(`Commission mise à jour : ${nextStat === 'paid' ? 'Payée' : 'Validée'}`);
    } else {
      alert("La mutation de base de données necessite l'authentification de l'administrateur.");
    }
  };

  // UI trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:bg-white print:p-6 text-left">
      
      {/* Informative Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs print:hidden">
        <div>
          <h2 className="text-xl font-display font-black text-[#0B5D2A] flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            Statistiques & Rapports Simplifiés
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-normal">
            Visualisez instantanément l'activité de vente, les codes promo actifs et l'état des commissions prêtes au versement.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-3 bg-[#0B5D2A] hover:bg-[#12823c] text-white font-extrabold text-xs uppercase tracking-wide rounded-xl flex items-center gap-2 shadow-xs cursor-pointer border-none"
        >
          <Printer className="w-4 h-4 text-white" />
          Imprimer ce Rapport
        </button>
      </div>

      {/* 5 REPORT TOPICS SELECTOR TABS */}
      <div className="flex flex-wrap gap-2 print:hidden bg-slate-150 p-1 rounded-2xl w-max">
        {[
          { id: 'daily', label: '🗓️ Ventes par Jour' },
          { id: 'agents', label: '👥 Ventes par Agent' },
          { id: 'codes', label: '🎟️ Ventes par Code Promo' },
          { id: 'commissions', label: '💰 Commissions' },
          { id: 'presence', label: '📍 Présence Terrain' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeReportTab === tab.id
                ? 'bg-[#0B5D2A] text-white shadow-xs'
                : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* CENTRAL REPORT LAYOUT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart View column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-150 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50 text-left">
            <h4 className="font-display font-bold text-gray-950 text-sm capitalize">
              📊 Visualisation Graphique : {activeReportTab === 'daily' ? 'Chiffre d’affaires journalier F' : getCategoryLabel(activeReportTab)}
            </h4>
          </div>

          {/* Simple Recharts Graph */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  activeReportTab === 'daily' ? dailySalesData :
                  activeReportTab === 'agents' ? agentSalesData.slice(0, 10) :
                  activeReportTab === 'codes' ? codePromoSalesData.slice(0, 10) :
                  activeReportTab === 'commissions' ? commissionSummaryData :
                  presenceReportData.map(p => ({ name: p.name, total: p.completed }))
                }
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '11px', textAlign: 'left' }}
                />
                <Bar
                  dataKey="total"
                  fill={activeReportTab === 'commissions' ? '#F97316' : '#0B5D2A'}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10px] text-gray-400 italic text-center font-mono">
            Source consolidée BOAF FUTURE HOLDINGS. Données arrêtées en date du {new Date().toLocaleDateString('fr-FR')}.
          </p>
        </div>


        {/* Summary Table column */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-150 shadow-2xs space-y-4 text-left">
          <h4 className="font-display font-extrabold text-[#0B5D2A] text-xs uppercase tracking-wide">
            📋 Tableau Récapitulatif
          </h4>

          {/* Dynamic lists for the active reporting subtopic */}
          <div className="space-y-3 overflow-y-auto max-h-[300px] text-xs">
            {activeReportTab === 'daily' && (
              <div className="divide-y divide-gray-100">
                {dailySalesData.map(row => (
                  <div key={row.name} className="py-2.5 flex justify-between items-center">
                    <span className="font-mono text-gray-500 font-bold">{row.rawName}</span>
                    <span className="font-mono font-black text-gray-950">{row.total.toLocaleString()} F</span>
                  </div>
                ))}
              </div>
            )}

            {activeReportTab === 'agents' && (
              <div className="divide-y divide-gray-100">
                {agentSalesData.map(row => (
                  <div key={row.name} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{row.name}</p>
                      <span className="text-[10px] text-gray-400">{row.tickets} ventes</span>
                    </div>
                    <span className="font-mono font-black text-slate-800">{row.total.toLocaleString()} F</span>
                  </div>
                ))}
              </div>
            )}

            {activeReportTab === 'codes' && (
              <div className="divide-y divide-gray-100">
                {codePromoSalesData.map(row => (
                  <div key={row.name} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-mono font-bold text-purple-750">{row.name}</p>
                      <span className="text-[10px] text-gray-400">{row.tickets} utilisations</span>
                    </div>
                    <span className="font-mono font-black text-[#0B5D2A]">{row.total.toLocaleString()} F</span>
                  </div>
                ))}
              </div>
            )}

            {activeReportTab === 'commissions' && (
              <div className="divide-y divide-gray-100 space-y-1">
                {commissionSummaryData.map(row => (
                  <div key={row.name} className="py-2.5 flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                    <span className="font-bold text-gray-700">{row.name}</span>
                    <span className="font-mono font-black text-orange-655">{row.total.toLocaleString()} F</span>
                  </div>
                ))}
              </div>
            )}

            {activeReportTab === 'presence' && (
              <div className="divide-y divide-gray-100">
                {presenceReportData.map(row => (
                  <div key={row.name} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{row.name}</p>
                      <span className="text-[10px] text-gray-400">Total planifié : {row.planned || 0}</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-800 border-emerald-150 border px-2 py-0.5 rounded font-bold text-[10px]">
                      {row.completed} terminés
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>


      {/* COMMISSIONS ACCRUED LISTING SECTION - EMBEDDED UNDER PARAMETERS/ADVANCED FOR REPORTS */}
      <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-gray-50 pb-2 text-left">
          <div>
            <h4 className="font-display font-extrabold text-[#0B5D2A] text-sm uppercase tracking-wide">
              💸 Validation & Paiement des Commissions
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Validez les commissions dues aux agents et changez leur état vers "Payé" après MoMo.</p>
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-gray-450 uppercase font-mono tracking-wider text-[10px]">
                <th className="py-2.5 px-4">Bénéficiaire d'Affiliation</th>
                <th className="py-2.5 px-4 text-center font-bold">Réf Vente / Ticket</th>
                <th className="py-2.5 px-4 text-right">Commission Due</th>
                <th className="py-2.5 px-4 text-center">État / Statut</th>
                <th className="py-2.5 px-4 text-center">Actions rapides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {commissions.length > 0 ? (
                commissions.slice(0, 10).map(c => {
                  const owner = actors.find(a => a.id === c.actor_id);
                  const relatedOrder = orders.find(o => o.id === c.order_id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-55/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900 font-sans">
                        {owner?.full_name || 'Bénéficiaire'}
                        {owner?.phone && <span className="block text-[9.5px] text-gray-400 font-mono font-normal">Momo: {owner.phone}</span>}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {relatedOrder ? relatedOrder.ticket_number : 'Saisie Directe'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-orange-650 font-mono text-xs">
                        {c.montant_commission.toLocaleString()} F
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[9.5px] font-bold uppercase border ${
                          c.statut === 'paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          c.statut === 'validated' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          'bg-amber-50 text-amber-800 border-amber-250'
                        }`}>
                          {c.statut === 'paid' ? 'Payé' : c.statut === 'validated' ? 'Validé' : 'Attente'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center space-x-1">
                        {c.statut === 'pending' && (
                          <button
                            onClick={() => handleUpdateCommission(c.id, 'validated')}
                            className="bg-indigo-600 border-none text-white hover:bg-indigo-700 font-bold px-2 py-1 rounded text-[10px] cursor-pointer"
                          >
                            Valider la com
                          </button>
                        )}
                        {c.statut === 'validated' && (
                          <button
                            onClick={() => handleUpdateCommission(c.id, 'paid')}
                            className="bg-[#0B5D2A] border-none text-white hover:bg-[#12823c] font-black px-2 py-1 rounded text-[10px] cursor-pointer"
                          >
                            ✓ Payer par MoMo
                          </button>
                        )}
                        {c.statut === 'paid' && (
                          <span className="text-gray-400 font-medium italic text-[10.5px]">Encaissé</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-450 italic">Aucune commission enregistrée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function getCategoryLabel(tab: string) {
  switch (tab) {
    case 'agents': return 'Ventes par Agent mobile F';
    case 'codes': return 'Rendement par Code Promotionnel F';
    case 'presence': return 'Missions accomplies par moto-vendeur';
    default: return 'Général';
  }
}
