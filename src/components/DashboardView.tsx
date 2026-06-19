import React from 'react';
import {
  TrendingUp,
  Coins,
  Receipt,
  UserCheck,
  ChevronRight,
  Sparkles,
  Smartphone,
  PlusCircle,
  HelpCircle,
  User,
  ArrowRight,
  Gift,
  AlertCircle
} from 'lucide-react';
import { Order, Actor, Commission, AttendanceLog } from '../types';

interface DashboardViewProps {
  orders: Order[];
  actors: Actor[];
  commissions: Commission[];
  attendanceLogs: AttendanceLog[];
  activityLogs: any[];
  onNavigate: (tab: string) => void;
  currentRole?: string;
  currentUser?: string;
}

export default function DashboardView({
  orders,
  actors,
  commissions,
  attendanceLogs,
  onNavigate,
  currentRole = 'admin',
  currentUser = 'Visiteur'
}: DashboardViewProps) {

  // Current Day Context
  const todayDateStr = '2026-06-03';

  // --- ADMINISTRATOR / SUPERVISOR CALCULATIONS ---
  // 1. Ventes du jour (Today's net sales sum)
  const todaySales = orders
    .filter(o => o.order_status === 'valid' && o.created_at.startsWith(todayDateStr))
    .reduce((sum, o) => sum + o.total_net, 0);

  // 2. Commissions à payer (Pending status)
  const pendingCommissionsSum = commissions
    .filter(c => c.statut === 'pending')
    .reduce((sum, c) => sum + c.montant_commission, 0);

  // 3. Présences du jour (Any presence log for today that isn't empty or absent)
  const todayAttendanceCount = attendanceLogs.filter(log => 
    log.date === todayDateStr && 
    ['arrived', 'in_progress', 'completed', 'present', 'late'].includes(log.status)
  ).length;

  // 4. Commandes / Tickets du jour
  const todayOrdersCount = orders.filter(o => 
    o.order_status === 'valid' && 
    o.created_at.startsWith(todayDateStr)
  ).length;

  // Top 5 Latest Sales (Valid)
  const latestSales = [...orders]
    .filter(o => o.order_status === 'valid')
    .slice(0, 5);

  // Top 5 agents or partners (performance by total sales net generated)
  // Get unique code lists per active actor
  const topPerformers = actors
    .filter(act => ['agent', 'partner', 'ambassador', 'collaborator'].includes(act.type_actor))
    .map(actor => {
      // Find orders matching actor's main code or separate promo codes linked to this person
      const actorOrders = orders.filter(o => 
        o.order_status === 'valid' && 
        (
          o.code_promo_text?.toUpperCase() === actor.main_code?.toUpperCase() ||
          commissions.some(c => c.actor_id === actor.id && c.order_id === o.id)
        )
      );
      const salesSum = actorOrders.reduce((sum, o) => sum + o.total_net, 0);
      const salesCount = actorOrders.length;
      return {
        id: actor.id,
        name: actor.full_name,
        type: actor.type_actor,
        salesSum,
        salesCount,
        phone: actor.phone
      };
    })
    .sort((a, b) => b.salesSum - a.salesSum)
    .slice(0, 5);


  // --- AGENT DE TERRAIN TAILORED VIEW CALCULATIONS ---
  // Find current actor profile if the user's name matches roughly
  const matchingActor = actors.find(a => a.full_name.toLowerCase().includes(currentUser.toLowerCase()) || a.type_actor === 'agent');
  
  // Agent's linked sales
  const agentSales = orders.filter(o => 
    o.order_status === 'valid' && 
    (o.code_promo_text?.toUpperCase() === matchingActor?.main_code?.toUpperCase())
  );
  const agentSalesCount = agentSales.length;
  const agentSalesSum = agentSales.reduce((sum, o) => sum + o.total_net, 0);

  // Agent's commissions generated
  const agentCommissions = commissions.filter(c => c.actor_id === matchingActor?.id);
  const agentCommissionsSum = agentCommissions
    .filter(c => c.statut === 'pending' || c.statut === 'validated')
    .reduce((sum, c) => sum + c.montant_commission, 0);

  // Agent's mission context for today
  const agentTodayMission = attendanceLogs.find(log => 
    log.agent_id === matchingActor?.id && 
    log.date === todayDateStr
  );


  // --- PARTNER / AMBASSADOR TAILORED VIEW CALCULATIONS ---
  const activePartner = actors.find(a => 
    (a.type_actor === 'partner' || a.type_actor === 'ambassador') && 
    (a.full_name.toLowerCase().includes(currentUser.toLowerCase()) || true)
  );
  
  const partnerSales = orders.filter(o => 
    o.order_status === 'valid' && 
    (o.code_promo_text?.toUpperCase() === activePartner?.main_code?.toUpperCase())
  );
  const partnerSalesCount = partnerSales.length;
  const partnerSalesSum = partnerSales.reduce((sum, o) => sum + o.total_net, 0);

  const partnerCommissions = commissions.filter(c => c.actor_id === activePartner?.id);
  const partnerEarnedCommissions = partnerCommissions
    .filter(c => c.statut === 'paid')
    .reduce((sum, c) => sum + c.montant_commission, 0);
  const partnerPendingCommissions = partnerCommissions
    .filter(c => c.statut === 'pending' || c.statut === 'validated')
    .reduce((sum, c) => sum + c.montant_commission, 0);


  // -------------------------------------------------------------
  // RENDERING SCENARIO 1: AGENT TERRAIN
  // -------------------------------------------------------------
  if (currentRole === 'agent') {
    return (
      <div className="space-y-6 text-left max-w-lg mx-auto">
        
        {/* Welcome Block */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8 blur-lg" />
          <p className="text-white/80 text-xs font-mono uppercase tracking-wider">Espace Agent • Lokossa</p>
          <h2 className="text-2xl font-display font-black mt-1">Salut, {matchingActor?.full_name || currentUser} !</h2>
          <p className="text-xs text-orange-100 mt-2">
            Heureux de vous revoir. Voici vos statistiques personnelles et vos raccourcis indispensables.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
            <div>
              <span className="text-[10px] text-orange-100 uppercase font-mono">Mes Ventes Validées</span>
              <p className="text-lg font-black font-mono mt-0.5">{agentSalesSum.toLocaleString('fr-FR')} F</p>
              <span className="text-[10px] opacity-75 block">{agentSalesCount} commande(s)</span>
            </div>
            <div>
              <span className="text-[10px] text-orange-100 uppercase font-mono">Mes Commissions</span>
              <p className="text-lg font-black font-mono mt-0.5">{agentCommissionsSum.toLocaleString('fr-FR')} F</p>
              <span className="text-[10px] opacity-75 block">Taux de gain : {matchingActor?.commission_rate || 5}%</span>
            </div>
          </div>
        </div>

        {/* Dynamic Status Section */}
        <div className="bg-white dark:bg-[#121c33] p-5 rounded-3xl border border-gray-150 dark:border-slate-800/80 shadow-xs">
          <span className="text-[10px] uppercase font-mono font-bold text-[#0B5D2A] dark:text-green-400 tracking-wider block mb-3">📍 Ma Mission d'aujourd'hui</span>
          {agentTodayMission ? (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-slate-100">{agentTodayMission.lieu_precis || 'Zone centre'}</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">📅 Prévu : {agentTodayMission.start_time_prevu || '08:00'} - {agentTodayMission.end_time_prevu || '16:00'}</p>
                </div>
                <span className="bg-orange-100 dark:bg-orange-950/40 text-orange-850 dark:text-orange-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-900/40">
                  {agentTodayMission.status.toUpperCase()}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs text-gray-600 dark:text-slate-300">
                <span className="font-semibold block text-gray-700 dark:text-slate-200 mb-1">🎯 Objectif :</span>
                {agentTodayMission.objectif || 'Distribution et vente directe'}
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="w-full py-3 bg-[#0B5D2A] hover:bg-[#12823c] text-white text-xs font-bold rounded-xl shadow-xs transition-transform hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
              >
                📱 Pointer / Mettre à jour mon activité
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              <p className="text-xs italic">Aucune mission planifiée aujourd'hui.</p>
              <button 
                onClick={() => onNavigate('attendance')}
                className="mt-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-250 dark:border-slate-700 cursor-pointer"
              >
                Créer une mission libre
              </button>
            </div>
          )}
        </div>

        {/* Quick Operations Mobile Shortcuts */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-mono font-bold text-gray-400 dark:text-slate-500 tracking-wider block">⚡ Raccourcis prioritaires</span>
          
          <button
            onClick={() => onNavigate('sales')}
            className="w-full p-4 bg-white dark:bg-[#121c33] hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-gray-150 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-2xs group cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-450 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-slate-100 text-sm">Nouvelle vente terrain</p>
                <p className="text-[10.5px] text-gray-500 dark:text-slate-400">Enregistrer une commande et générer le ticket BOAF</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('attendance')}
            className="w-full p-4 bg-white dark:bg-[#121c33] hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-gray-150 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-2xs group cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-450 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-slate-100 text-sm font-sans">Présence du jour</p>
                <p className="text-[10.5px] text-gray-500 dark:text-slate-400">Déclarer votre arrivée sur le lieu de l'affectation</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDERING SCENARIO 2: PARTNER / AMBASSADOR
  // -------------------------------------------------------------
  if (currentRole === 'partner' || currentRole === 'ambassador' || currentRole === 'collaborator') {
    return (
      <div className="space-y-6 text-left max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-[#0B5D2A] to-[#12823c] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8 blur-lg" />
          <span className="text-green-200 text-xs font-mono uppercase tracking-wider">Espace Partenaire Externe</span>
          <h2 className="text-2xl font-display font-black mt-1">{activePartner?.full_name || currentUser}</h2>
          <p className="text-xs text-green-100 mt-2">
            Rapprochement de votre performance et encours de commissions sur les ventes BOAF Délices liées à votre code.
          </p>

          <div className="bg-white/10 p-3 rounded-xl border border-white/10 mt-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-green-200 uppercase font-mono block">Mon code promo exclusif</span>
              <span className="text-sm font-black font-mono tracking-wider">{activePartner?.main_code || 'BOAF-CODE'}</span>
            </div>
            <span className="bg-orange-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-md">
              Com: {activePartner?.commission_rate || 5}%
            </span>
          </div>
        </div>

        {/* Partner KPI Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#121c33] p-4 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-2xs text-center space-y-1">
            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase block font-mono">Volume de Ventes</span>
            <span className="text-lg font-black font-mono text-[#0B5D2A] dark:text-green-400">{partnerSalesSum.toLocaleString('fr-FR')} F</span>
            <span className="text-[10px] text-gray-500 dark:text-slate-400 block">{partnerSalesCount} commandes passées</span>
          </div>

          <div className="bg-white dark:bg-[#121c33] p-4 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-2xs text-center space-y-1">
            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase block font-mono">Commissions Cumulées</span>
            <span className="text-lg font-black font-mono text-orange-600 dark:text-orange-400 block">{(partnerEarnedCommissions + partnerPendingCommissions).toLocaleString('fr-FR')} F</span>
            <span className="text-[9.5px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full inline-block font-sans font-bold">
              Payé: {partnerEarnedCommissions.toLocaleString()} F
            </span>
          </div>
        </div>

        {/* Detailed transaction list */}
        <div className="bg-white dark:bg-[#121c33] p-5 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-xs space-y-3">
          <h4 className="font-display font-bold text-gray-900 dark:text-slate-100 text-sm">📜 Ventes récentes avec votre Code</h4>
          
          <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
            {partnerSales.length > 0 ? (
              partnerSales.map(order => (
                <div key={order.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-slate-200">Ticket {order.ticket_number}</p>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">{order.created_at.split('T')[0]}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-[#0B5D2A] dark:text-green-400">{order.total_net.toLocaleString()} F</p>
                    <span className="text-[9px] text-orange-600 dark:text-orange-400 font-mono">Com. +{Math.round(order.total_net * (activePartner?.commission_rate || 5) / 100).toLocaleString()} F</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic py-6 text-center">Aucune vente enregistrée avec votre code pour l'instant.</p>
            )}
          </div>
        </div>

      </div>
    );
  }


  // -------------------------------------------------------------
  // RENDERING SCENARIO 3: ADMIN / SUPERVISOR (STANDARD SIMPLE HOME)
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 text-left">
      
      {/* Dynamic greeting banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121c33] p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h2 className="text-xl font-display font-black text-[#0B5D2A] dark:text-green-400 tracking-tight">
            Bonjour, {currentUser} ! 👋
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-normal">
            Bienvenue sur le portail simplifié de <strong>BOAF Délices</strong>. Notre objectif est de garder un suivi clair, léger et rapide de l'activité.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onNavigate('sales')}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-605 font-bold text-white text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Nouvelle Vente
          </button>
        </div>
      </div>

      {/* 4 SIMPLIFIED MAIN KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Ventes du Jour */}
        <div className="bg-white dark:bg-[#121c33] p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs space-y-2 relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 dark:text-slate-550 font-mono uppercase tracking-wider block">Ventes du jour</span>
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-500 dark:text-orange-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg lg:text-xl font-black font-mono text-gray-950 dark:text-white">
            {todaySales.toLocaleString('fr-FR')} F
          </p>
          <span className="text-[9.5px] text-gray-400 dark:text-slate-400 block font-sans">Pour le {todayDateStr}</span>
        </div>

        {/* Card 2: Commissions à payer */}
        <div className="bg-white dark:bg-[#121c33] p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs space-y-2 relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 dark:text-slate-550 font-mono uppercase tracking-wider block">Commissions à payer</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-[#0B5D2A] dark:text-emerald-450">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg lg:text-xl font-black font-mono text-[#0B5D2A] dark:text-green-400">
            {pendingCommissionsSum.toLocaleString('fr-FR')} F
          </p>
          <span className="text-[9.5px] text-emerald-600 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md inline-block">
            Attente validation
          </span>
        </div>

        {/* Card 3: Présences du Jour */}
        <div className="bg-white dark:bg-[#121c33] p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs space-y-2 relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 dark:text-slate-550 font-mono uppercase tracking-wider block">Présences Terrain</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-[#023E8A] dark:text-indigo-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg lg:text-xl font-black font-mono text-gray-950 dark:text-white">
            {todayAttendanceCount} Agents
          </p>
          <span className="text-[9.5px] text-indigo-705 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded-md inline-block font-sans">
            En mission active ce jour
          </span>
        </div>

        {/* Card 4: Tickets du Jour */}
        <div className="bg-white dark:bg-[#121c33] p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs space-y-2 relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 font-mono uppercase tracking-wider block">Tickets émis</span>
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg lg:text-xl font-black font-mono text-gray-900 dark:text-slate-100">
            {todayOrdersCount} Commandes
          </p>
          <span className="text-[9.5px] text-[#0B5D2A] dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded-md inline-block">
            Imprimables
          </span>
        </div>

      </div>

      {/* LOWER SEGMENT: 5 LATEST SALES & 5 TOP AGENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel 1: 5 Dernières ventes */}
        <div className="bg-white dark:bg-[#121c33] p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex justify-between items-center pb-2 border-b border-gray-55 dark:border-slate-800">
            <h4 className="font-display font-extrabold text-[#0B5D2A] dark:text-green-400 text-sm uppercase tracking-wide">
              🛍️ Les 5 dernières ventes
            </h4>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center cursor-pointer"
            >
              Gérer les ventes →
            </button>
          </div>

          <div className="space-y-4">
            {latestSales.length > 0 ? (
              latestSales.map(order => (
                <div key={order.id} className="flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-900 dark:text-slate-100">Ticket n°{order.ticket_number}</p>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium font-sans">
                      Client : <span className="text-gray-700 dark:text-slate-300 font-semibold">{order.customer_name}</span> • {order.created_at.split('T')[1].substring(0, 5)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-black text-[#0B5D2A] dark:text-green-450">
                      {order.total_net.toLocaleString('fr-FR')} F
                    </p>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-semibold">
                      {order.code_promo_text ? `🎟️ ${order.code_promo_text}` : 'Pas de code'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-450 italic py-10 text-center">Aucune vente enregistrée pour le moment.</p>
            )}
          </div>
        </div>

        {/* Panel 2: 5 Meilleurs Agents / Partenaires */}
        <div className="bg-white dark:bg-[#121c33] p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex justify-between items-center pb-2 border-b border-gray-55 dark:border-slate-800">
            <h4 className="font-display font-extrabold text-[#0B5D2A] dark:text-green-400 text-sm uppercase tracking-wide">
              ⭐ 5 Meilleurs Agents & Partenaires
            </h4>
            <button
              onClick={() => onNavigate('actors')}
              className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center cursor-pointer"
            >
              Tous les profils →
            </button>
          </div>

          <div className="space-y-4">
            {topPerformers.length > 0 ? (
              topPerformers.map((performer, idx) => (
                <div key={performer.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#0B5D2A] dark:text-green-450 text-[10px] font-black flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-slate-100">{performer.name}</p>
                      <span className="text-[9.5px] text-gray-450 dark:text-slate-400 capitalize bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-0.5 px-1.5 rounded">
                        {performer.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-mono font-black text-orange-650 dark:text-orange-400">
                      {performer.salesSum.toLocaleString('fr-FR')} F
                    </p>
                    <span className="text-[9.5px] text-gray-450 dark:text-slate-400">
                      {performer.salesCount} commandes
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-450 italic py-10 text-center">Aucune performance d'acteur relevée.</p>
            )}
          </div>
        </div>

      </div>

      {/* NAVIGATION OUTLET REDIRECT */}
      <div className="bg-[#FFF9F6] dark:bg-orange-950/10 p-5 rounded-3xl border border-orange-100 dark:border-orange-950/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div className="text-left">
          <h5 className="font-bold text-orange-850 dark:text-orange-350 text-xs uppercase tracking-wide flex items-center gap-1.5 font-mono">
            <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
            Analyses & Rapports avancés
          </h5>
          <p className="text-[11px] text-gray-600 dark:text-slate-350 mt-1">
            Visualisez les performances par code promo, commissions dues, et diagrammes simplifiés de rentabilité commerciale.
          </p>
        </div>
        <button
          onClick={() => onNavigate('reports')}
          className="px-5 py-2.5 bg-[#0B5D2A] hover:bg-[#12823c] font-black text-white text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          Voir les rapports
        </button>
      </div>

    </div>
  );
}
