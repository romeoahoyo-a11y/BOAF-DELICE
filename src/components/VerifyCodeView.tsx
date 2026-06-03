import React, { useState } from 'react';
import {
  Search,
  User,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Receipt,
  Coins,
  Target,
  Clock,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { Actor, PromoCode, Order, Commission, Zone } from '../types';

interface VerifyCodeViewProps {
  actors: Actor[];
  promoCodes: PromoCode[];
  orders: Order[];
  commissions: Commission[];
  zones: Zone[];
}

export default function VerifyCodeView({
  actors,
  promoCodes,
  orders,
  commissions,
  zones
}: VerifyCodeViewProps) {
  // Input fields for search
  const [promoInput, setPromoInput] = useState('BOAF-AGT-0234');
  const [phoneOrNameInput, setPhoneOrNameInput] = useState('+229 97 45 45 01');

  // Search execution status
  const [searchResult, setSearchResult] = useState<Actor | null>(actors.find(a => a.main_code === 'BOAF-AGT-0234') || null);
  const [searched, setSearched] = useState(true);
  const [errorSearch, setErrorSearch] = useState('');

  // Reusable search logic
  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorSearch('');
    setSearchResult(null);
    setSearched(true);

    if (!promoInput || !phoneOrNameInput) {
      setErrorSearch('Veuillez renseigner le Code Promo ET le numéro de téléphone ou nom.');
      return;
    }

    const cleanedPromo = promoInput.trim().toUpperCase();
    const cleanedInput = phoneOrNameInput.trim().toLowerCase();

    // 1. Find Promo Code matching code input
    const foundCode = promoCodes.find(c => c.code.toUpperCase() === cleanedPromo);

    if (!foundCode) {
      setErrorSearch('Ce code promotionnel n\'existe pas dans le registre général de BOAF Délices.');
      return;
    }

    // 2. Find actor belonging to code
    const actor = actors.find(a => a.id === foundCode.actor_id);
    if (!actor) {
      setErrorSearch('Ce code promo est expiré ou n\'appartient plus à un membre actif du réseau.');
      return;
    }

    // 3. Match against the second mandatory verification factor: phone or name
    const matchesPhone = actor.phone.replace(/[\s\-\+]/g, '').includes(cleanedInput.replace(/[\s\-\+]/g, ''));
    const matchesName = actor.full_name.toLowerCase().includes(cleanedInput);

    if (!matchesPhone && !matchesName) {
      setErrorSearch('Combinaison incorrecte. Le code promo et le téléphone / nom ne correspondent pas.');
      return;
    }

    setSearchResult(actor);
  };

  // Helper trigger to pre-fill test examples
  const loadTestValue = (code: string, contact: string) => {
    setPromoInput(code);
    setPhoneOrNameInput(contact);
    setTimeout(() => {
      // Trigger search
      const foundCode = promoCodes.find(c => c.code.toUpperCase() === code.toUpperCase());
      const actor = actors.find(a => a.id === foundCode?.actor_id);
      if (actor) {
        setSearchResult(actor);
        setSearched(true);
        setErrorSearch('');
      }
    }, 100);
  };

  // Aggregates for searched actor
  const getSearchedActorStats = (actorId: string) => {
    const actPromoCodes = promoCodes.filter(c => c.actor_id === actorId).map(c => c.code);
    
    // orders
    const actOrders = orders.filter(
      o => o.order_status === 'valid' && o.code_promo_text && actPromoCodes.includes(o.code_promo_text)
    );

    const salesVolume = actOrders.reduce((sum, o) => sum + o.total_net, 0);
    const orderCount = actOrders.length;

    const commissionsTotal = commissions
      .filter(c => c.actor_id === actorId)
      .reduce((sum, c) => sum + c.montant_commission, 0);

    const validatedCommissions = commissions
      .filter(c => c.actor_id === actorId && (c.statut === 'validated' || c.statut === 'paid'))
      .reduce((sum, c) => sum + c.montant_commission, 0);

    return {
      salesVolume,
      orderCount,
      commissionsTotal,
      validatedCommissions,
      tickets: actOrders
    };
  };

  const actorStats = searchResult ? getSearchedActorStats(searchResult.id) : null;

  // Monthly breakdown evolution for the individual performance chart
  const monthlyPerfMock = [
    { name: 'Jan 2026', total: Math.round((actorStats?.salesVolume || 500000) * 0.45) },
    { name: 'Fév 2026', total: Math.round((actorStats?.salesVolume || 500000) * 0.60) },
    { name: 'Mar 2026', total: Math.round((actorStats?.salesVolume || 500000) * 0.55) },
    { name: 'Avr 2026', total: Math.round((actorStats?.salesVolume || 500000) * 0.82) },
    { name: 'Mai 2026', total: Math.round((actorStats?.salesVolume || 500000) * 0.95) },
    { name: 'Juin 2026', total: actorStats?.salesVolume || 235000 }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* Upper informational banner & Search Input block */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
        <div className="text-left border-b border-gray-100 pb-3">
          <h2 className="font-display font-extrabold text-[#0B5D2A] text-xl tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500 animate-pulse" />
            Vérifier un code promo & Performances
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Module autonome sécurisé pour consulter instantanément les ventes cumulées, commissions, statut et rang d'un code promo
          </p>
        </div>

        {/* Demo Prefills examples trigger */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-gray-150 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-sans font-bold text-gray-500 text-[10px] uppercase tracking-wide">Exemples de démo test :</span>
          <button
            onClick={() => loadTestValue('BOAF-AGT-0234', '+229 97 45 45 01')}
            className="px-2.5 py-1.5 bg-white hover:bg-orange-50 hover:border-orange-200 border border-gray-200 text-gray-700 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
          >
            Eric Adjovi (Agent Term) ➔ BOAF-AGT-0234
          </button>
          <button
            onClick={() => loadTestValue('BOAF-PART-0142', '+229 95 11 22 33')}
            className="px-2.5 py-1.5 bg-white hover:bg-orange-50 hover:border-orange-200 border border-gray-200 text-gray-700 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
          >
            Sébastien Houndjo (Partenaire) ➔ BOAF-PART-0142
          </button>
          <button
            onClick={() => loadTestValue('BOAF-AMB-0024', '+229 97 88 77 11')}
            className="px-2.5 py-1.5 bg-white hover:bg-orange-50 hover:border-orange-200 border border-gray-200 text-gray-700 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
          >
            Emilienne Lawson (Ambassadeur) ➔ BOAF-AMB-0024
          </button>
        </div>

        {/* Grand verify Search Form */}
        <form onSubmit={handleVerify} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs text-left">
          <div className="space-y-1">
            <label className="font-semibold text-gray-700 block">Saisir le Code Promo Obligatoire</label>
            <input
              type="text"
              placeholder="ex: BOAF-AGT-0234"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              className="w-full p-2.5 border border-gray-200 bg-slate-50 focus:bg-white focus:outline-none rounded-xl font-mono text-xs font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700 block">Saisir Téléphone ou Nom Correspondant</label>
            <input
              type="text"
              placeholder="ex: +229 97 45 45 01"
              value={phoneOrNameInput}
              onChange={(e) => setPhoneOrNameInput(e.target.value)}
              className="w-full p-2.5 border border-gray-200 bg-slate-50 focus:bg-white focus:outline-none rounded-xl font-sans text-xs font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-[#0B5D2A] text-white hover:bg-[#0B5D2A]/90 font-bold rounded-xl transition-all h-10 flex items-center justify-center gap-2 cursor-pointer font-sans shadow-md"
          >
            <Search className="w-4 h-4 text-white" />
            Lancer la Vérification
          </button>
        </form>

        {errorSearch && (
          <div className="p-3.5 bg-red-50 text-red-700 border border-red-150 rounded-2xl flex items-center gap-2.5 font-sans font-bold text-left">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <p>{errorSearch}</p>
          </div>
        )}
      </div>

      {/* Verification Hasil Panel Display */}
      {searched && searchResult && actorStats && (
        <div className="space-y-6">
          
          {/* Section 1: Profile Dashboard Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Avatar & Identials */}
            <div className="md:col-span-1 flex items-center gap-4 text-left">
              <div className="w-16 h-16 rounded-2xl bg-[#0B5D2A]/10 text-[#0B5D2A] font-extrabold text-2xl flex items-center justify-center font-display shrink-0 border border-slate-200 uppercase">
                {searchResult.full_name.slice(0, 2)}
              </div>
              <div className="space-y-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  searchResult.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  Code {searchResult.status === 'active' ? 'Actif' : 'Suspendu'}
                </span>
                <h3 className="font-display font-extrabold text-[#0B5D2A] text-lg leading-tight">
                  {searchResult.full_name}
                </h3>
                <p className="text-xs text-gray-400 capitalize">Role : {searchResult.type_actor}</p>
              </div>
            </div>

            {/* Geographical details */}
            <div className="md:col-span-1 space-y-2 text-xs text-left text-gray-600 border-t md:border-t-0 md:border-l md:border-r border-gray-100 py-4 md:py-0 md:px-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Zone d'Opérations : <strong className="text-gray-950">{zones.find(z => z.id === searchResult.zone_id)?.nom}</strong></span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
                <span>Intégration : {searchResult.date_integration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Objectif : <strong className="text-gray-900">{searchResult.objective_mois?.toLocaleString()} FCFA</strong></span>
              </div>
            </div>

            {/* General Rank badge */}
            <div className="md:col-span-1 text-center bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
              <span className="text-[10px] text-orange-700 font-bold block uppercase tracking-widest font-mono">Rang Force de Vente</span>
              <span className="text-3xl font-black font-display text-orange-500 tracking-tight block my-0.5">#2</span>
              <span className="text-[10px] text-gray-400 block font-semibold">sur 45 acteurs BOAF</span>
            </div>

          </div>

          {/* Section 2: Personal KPI grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* KPI 1 : Sales total net */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 font-mono block uppercase">Ventes du Mois (Nouveau)</span>
              <div>
                <h4 className="text-xl font-bold font-display text-gray-900 mt-2">
                  {Math.round(actorStats.salesVolume * 0.3).toLocaleString('fr-FR')} F
                </h4>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2.5">
                  <div className="h-full bg-orange-500" style={{ width: '65%' }} />
                </div>
              </div>
            </div>

            {/* KPI 2 : Cumulative volume */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 font-mono block uppercase">Ventes Cumulées</span>
              <div>
                <h4 className="text-xl font-bold font-display text-[#0B5D2A] mt-2">
                  {actorStats.salesVolume.toLocaleString('fr-FR')} F
                </h4>
                <span className="text-[10px] text-gray-400 block font-mono mt-1">
                  Déclenchées par {actorStats.orderCount} commandes client
                </span>
              </div>
            </div>

            {/* KPI 3 : Cumulative Commissions paid */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 font-mono block uppercase">Commissions payées</span>
              <div>
                <h4 className="text-xl font-bold font-display text-green-700 mt-2">
                  {actorStats.validatedCommissions.toLocaleString('fr-FR')} F
                </h4>
                <p className="text-[10px] text-gray-400 font-mono mt-1">Taux contractuel : {searchResult.commission_rate}%</p>
              </div>
            </div>

            {/* KPI 4 : Active Goal success rate */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 font-mono block uppercase">Taux Réussite Objectif</span>
              <div>
                <h4 className="text-xl font-bold font-display text-orange-500 mt-2">
                  {Math.round((actorStats.salesVolume / (searchResult.objective_mois || 500000)) * 100)}%
                </h4>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2.5">
                  <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, (actorStats.salesVolume / (searchResult.objective_mois || 500000)) * 100)}%` }} />
                </div>
              </div>
            </div>

          </div>

          {/* Section 3: Performance evolution area & Ticket grids */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 12 months performance chart */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs lg:col-span-2">
              <h4 className="font-display font-extrabold text-[#0B5D2A] text-base mb-4 text-left">
                Évolution des ventes par mois (12 derniers mois)
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyPerfMock}>
                    <defs>
                      <linearGradient id="colorSalesInd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0B5D2A" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0B5D2A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <Tooltip formatter={(v: any) => [`${v.toLocaleString()} F`, 'Ventes']} />
                    <Area type="monotone" dataKey="total" stroke="#0B5D2A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSalesInd)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* List of related tickets */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <h4 className="font-display font-extrabold text-[#0B5D2A] text-base text-left">
                  Détail de ses tickets
                </h4>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {actorStats.tickets.map(ticket => (
                    <div key={ticket.id} className="p-3 border border-gray-50 bg-slate-50/50 rounded-2xl flex justify-between items-center text-xs">
                      <div className="text-left font-sans">
                        <span className="font-mono font-bold text-gray-800 text-[11px] block">{ticket.ticket_number}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <span className="font-black text-[#0B5D2A]">{ticket.total_net.toLocaleString()} F</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50/30 p-3 rounded-2xl border border-orange-100 text-[10px] text-orange-900 leading-relaxed text-left mt-4 inline-block">
                Ce membre contribue à {Math.round((actorStats.salesVolume / Math.max(1, orders.reduce((sum, o) => sum + o.total_net, 0))) * 100)}% des ventes globales du réseau.
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
