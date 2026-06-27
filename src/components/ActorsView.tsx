import React, { useState } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  Phone,
  Tag,
  Shield,
  MapPin,
  X,
  UserCheck,
  Coins,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Actor, Zone, PromoCode, Order, Commission } from '../types';

interface ActorsViewProps {
  actors: Actor[];
  zones: Zone[];
  promoCodes: PromoCode[];
  orders: Order[];
  commissions: Commission[];
  onAddActor: (actor: Actor) => void;
  onUpdateActor: (actor: Actor) => void;
  onAddPromoCode: (code: PromoCode) => void;
  currentRole: string;
}

export default function ActorsView({
  actors,
  zones,
  promoCodes,
  orders,
  commissions,
  onAddActor,
  onUpdateActor,
  onAddPromoCode,
  currentRole
}: ActorsViewProps) {

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedActorDetails, setSelectedActorDetails] = useState<Actor | null>(null);

  // Form Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRoleType, setSelectedRoleType] = useState<Actor['type_actor']>('agent');
  const [hasPromoCode, setHasPromoCode] = useState(true);
  const [assignedCodeText, setAssignedCodeText] = useState('');
  const [commissionRate, setCommissionRate] = useState(5);
  const [zoneId, setZoneId] = useState(zones[0]?.id || 'z1');
  const [objective, setObjective] = useState(250000);

  // Auto calculate a nice prefix based on selected role type
  React.useEffect(() => {
    const randomSeq = Math.floor(100 + Math.random() * 900);
    let prefix = 'BOAF-AGT';
    if (selectedRoleType === 'partner') prefix = 'BOAF-PRT';
    if (selectedRoleType === 'ambassador') prefix = 'BOAF-AMB';
    if (selectedRoleType === 'collaborator') prefix = 'BOAF-COL';
    if (selectedRoleType === 'employee') prefix = 'BOAF-EMP';
    
    setAssignedCodeText(`${prefix}-${randomSeq}`);
  }, [selectedRoleType]);

  // Compute stats helper
  const getActorStats = (actor: Actor) => {
    // Orders generated with actor's code promo text
    const actorOrders = orders.filter(o => 
      o.order_status === 'valid' && 
      o.code_promo_text?.toUpperCase() === actor.main_code?.toUpperCase()
    );
    const totalSales = actorOrders.reduce((sum, o) => sum + o.total_net, 0);

    // Commissions earned
    const actorCommissions = commissions.filter(c => c.actor_id === actor.id && c.statut !== 'rejected');
    const totalCommissions = actorCommissions.reduce((sum, c) => sum + c.montant_commission, 0);

    return {
      totalSales,
      totalCommissions,
      salesCount: actorOrders.length
    };
  };

  // Handle Form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert('Veuillez renseigner le nom complet et le téléphone.');
      return;
    }

    const nextId = `act-${Date.now()}`;
    const codeText = hasPromoCode ? (assignedCodeText || 'BOAF-GEN') : undefined;

    const newActor: Actor = {
      id: nextId,
      full_name: fullName,
      phone: phone,
      type_actor: selectedRoleType,
      main_code: codeText,
      commission_rate: Number(commissionRate),
      status: 'active',
      zone_id: zoneId,
      date_integration: new Date().toISOString().split('T')[0],
      email: '',
      poste: selectedRoleType === 'employee' ? 'Administration' : 'Ambassadeur de zone',
      objective_mois: Number(objective) || undefined,
      type_agent: selectedRoleType === 'agent' ? 'Moto-Vendeur' : 'Relais local'
    };

    onAddActor(newActor);

    if (hasPromoCode && codeText) {
      // Create the matching promo code entry in db so it is active
      const newCode: PromoCode = {
        id: `code-${nextId}`,
        code: codeText,
        type_code: selectedRoleType === 'partner' ? 'BOAF-PRT' : 'BOAF-AGT',
        actor_id: nextId,
        status: 'active',
        starts_at: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString().split('T')[0]
      };
      onAddPromoCode(newCode);
    }

    // Reset Form
    setFullName('');
    setPhone('');
    setCommissionRate(5);
    setHasPromoCode(true);
    setShowAddModal(false);
    
    if (hasPromoCode && codeText) {
      alert(`L'acteur ${fullName} a été enregistré avec succès et son Code Promo ${codeText} est activé !`);
    } else {
      alert(`L'acteur ${fullName} a été enregistré avec succès (sans code promo).`);
    }
  };

  // Filter Actors list
  const filteredActors = actors.filter(actor => {
    // Role type filtering
    if (roleFilter !== 'all' && actor.type_actor !== roleFilter) return false;

    // Search query matching
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = actor.full_name.toLowerCase().includes(q);
      const matchCode = actor.main_code?.toLowerCase().includes(q);
      const matchPhone = actor.phone.includes(q);
      if (!matchName && !matchCode && !matchPhone) return false;
    }

    return true;
  });

  // Maps system actor type into clear readable terms
  const getRoleLabel = (type: Actor['type_actor']) => {
    switch (type) {
      case 'employee': return 'Employé';
      case 'agent': return 'Agent terrain';
      case 'partner': return 'Partenaire';
      case 'collaborator': return 'Collaborateur';
      case 'ambassador': return 'Ambassadeur';
      default: return 'Acteur';
    }
  };

  const getRoleBadgeStyle = (type: Actor['type_actor']) => {
    switch (type) {
      case 'employee': return 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/40';
      case 'agent': return 'bg-orange-50 dark:bg-orange-950/20 text-orange-750 dark:text-orange-400 border-orange-200 dark:border-orange-950/40';
      case 'partner': return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-950/45';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Page Header */}
      <div className="bg-white dark:bg-[#121c33] p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-display font-black text-[#0B5D2A] dark:text-green-400 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Gestion Unifiée des Acteurs
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-normal">
            Visualisez et gérez l'ensemble des employés, agents terrain de distribution, partenaires dépositaires, ambassadeurs et collaborateurs BOAF Délices.
          </p>
        </div>

        {currentRole !== 'lecteur' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 font-black text-white text-xs uppercase tracking-wide rounded-2xl shadow-sm flex items-center gap-2 cursor-pointer shrink-0 transition-transform hover:scale-101 border-none"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            Ajouter un acteur
          </button>
        )}
      </div>

      {/* Main List Table */}
      <div className="bg-white dark:bg-[#121c33] p-6 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
        
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Filter buttons */}
            {[
              { id: 'all', label: 'Tous les profils' },
              { id: 'employee', label: 'Employés' },
              { id: 'agent', label: 'Agents terrain' },
              { id: 'partner', label: 'Partenaires' },
              { id: 'collaborator', label: 'Collaborateurs' },
              { id: 'ambassador', label: 'Ambassadeurs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                  roleFilter === tab.id
                    ? 'bg-[#0B5D2A] text-white border-[#0B5D2A] shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-gray-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher nom, code, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl focus:outline-none focus:border-[#0B5D2A] dark:focus:border-green-450 text-gray-800 dark:text-slate-100 transition-colors"
            />
          </div>
        </div>

        {/* Responsive Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 text-gray-450 dark:text-slate-400 uppercase font-mono tracking-wider text-[10px]">
                <th className="py-3 px-4">Nom complet</th>
                <th className="py-3 px-4">Téléphone</th>
                <th className="py-3 px-4">Rôle / Profil</th>
                <th className="py-3 px-4 text-center">Code Promo</th>
                <th className="py-3 px-4 text-right">Volume Ventes</th>
                <th className="py-3 px-4 text-right">Commissions payées</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredActors.length > 0 ? (
                filteredActors.map(actor => {
                  const stats = getActorStats(actor);
                  return (
                    <tr
                      key={actor.id}
                      onClick={() => setSelectedActorDetails(actor)}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-gray-100 dark:border-slate-800/40"
                      title="Cliquez pour afficher les détails avancés"
                    >
                      <td className="py-3.5 px-4 font-bold text-gray-950 dark:text-slate-100">
                        {actor.full_name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 dark:text-slate-400 font-mono">
                        {actor.phone}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border ${getRoleBadgeStyle(actor.type_actor)}`}>
                          {getRoleLabel(actor.type_actor)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-300">
                        {actor.main_code ? (
                          <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-900/60 text-[10.5px]">
                            {actor.main_code}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-slate-500 italic">Aucun</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-[#0B5D2A] dark:text-green-400 font-mono">
                        {stats.totalSales.toLocaleString()} F
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-orange-600 dark:text-orange-400">
                        {stats.totalCommissions.toLocaleString()} F
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          actor.status === 'active'
                            ? 'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-900/50'
                            : 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/50'
                        }`}>
                          {actor.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 italic">
                    Aucun acteur ne correspond aux filtres appliqués.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* DETAIL DRAWER / POPUP */}
      {selectedActorDetails && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-slate-950/85 backdrop-blur-xs flex items-center justify-end p-0 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-[#111c34] h-screen w-full max-w-md shadow-2xl p-6 overflow-y-auto relative animate-slideLeft text-xs flex flex-col justify-between border-l border-gray-100 dark:border-slate-800 text-gray-805 dark:text-slate-100">
            
            <div className="space-y-6">
              
              {/* Close Button Header */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5D2A]/10 text-[#0B5D2A] dark:text-green-400 flex items-center justify-center font-sans font-black">
                    {selectedActorDetails.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-gray-950 dark:text-white text-sm leading-tight">{selectedActorDetails.full_name}</h3>
                    <p className="text-[10px] text-gray-400 dark:text-slate-400 capitalize">{getRoleLabel(selectedActorDetails.type_actor)} BOAF</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedActorDetails(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-350 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Informational Data Card */}
              <div className="bg-slate-50 dark:bg-[#152342] p-4 rounded-2xl border border-gray-150 dark:border-slate-800 space-y-3 mb-4 text-left">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-450 uppercase font-mono font-bold tracking-wider">Téléphone d'Acteur</span>
                  <span className="font-mono text-gray-900 font-bold">{selectedActorDetails.phone}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-450 uppercase font-mono font-bold tracking-wider">Taux de Commission</span>
                  <span className="font-bold text-orange-650">{selectedActorDetails.commission_rate}% sur ventes</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-450 uppercase font-mono font-bold tracking-wider">Secteur / Zone affecté</span>
                  <span className="font-semibold text-gray-900">
                    {zones.find(z => z.id === selectedActorDetails.zone_id)?.nom || 'Lokossa Zone'}
                  </span>
                </div>
                {selectedActorDetails.meta?.objectif_mensuel && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-450 uppercase font-mono font-bold tracking-wider">Objectif Mensuel</span>
                    <span className="font-mono font-bold text-gray-900">{selectedActorDetails.meta.objectif_mensuel.toLocaleString()} FCFA</span>
                  </div>
                )}
              </div>

              {/* Specific detailed statistics block */}
              <div className="space-y-4 text-left">
                <h4 className="font-display font-bold text-[#0B5D2A] text-xs uppercase tracking-wide">💼 Synthèse Économique Récente</h4>
                
                <div className="grid grid-cols-2 gap-3 pb-4">
                  <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block font-mono">Gain Commissions</span>
                    <span className="text-base font-black font-mono text-[#0B5D2A]">
                      {getActorStats(selectedActorDetails).totalCommissions.toLocaleString()} F
                    </span>
                  </div>

                  <div className="bg-orange-50/50 p-3.5 rounded-xl border border-orange-100 space-y-1">
                    <span className="text-[10px] text-orange-900 font-bold uppercase block font-mono">Apport Ventes</span>
                    <span className="text-base font-black font-mono text-orange-600">
                      {getActorStats(selectedActorDetails).totalSales.toLocaleString()} F
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono text-gray-400 block font-bold">Activité de livraison liée</span>
                  <div className="p-3 bg-white border border-gray-150 rounded-xl space-y-2 max-h-48 overflow-y-auto">
                    {orders.filter(o => o.code_promo_text?.toUpperCase() === selectedActorDetails.main_code?.toUpperCase()).length > 0 ? (
                      orders
                        .filter(o => o.code_promo_text?.toUpperCase() === selectedActorDetails.main_code?.toUpperCase())
                        .map(order => (
                          <div key={order.id} className="flex justify-between text-[11px] py-1 border-b border-gray-50 last:border-none">
                            <span className="text-gray-600">Ticket {order.ticket_number}</span>
                            <span className="font-bold text-slate-800 font-mono">{order.total_net.toLocaleString()} F</span>
                          </div>
                        ))
                    ) : (
                      <p className="text-[11px] text-gray-400 italic py-3 text-center">Aucune vente directe déclarée avec ce code.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Quick close action trigger */}
            <button
              onClick={() => setSelectedActorDetails(null)}
              className="w-full py-3 mt-4 bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
            >
              Fermer le profil
            </button>

          </div>
        </div>
      )}


      {/* FORM MODAL: REGISTER NEW ACTOR */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-xs">
          <div className="bg-white dark:bg-[#111c34] rounded-[28px] w-full max-w-md overflow-hidden border border-gray-150 dark:border-slate-800 shadow-2xl text-left flex flex-col max-h-[90vh]">
            
            <div className="bg-[#0B5D2A] p-5 text-white flex justify-between items-center">
              <h3 className="font-display font-black text-md">➕ Enregistrer un Acteur Terrain</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-gray-800 dark:text-slate-100">
              
              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Identité d'Acteur</label>
                <input
                  type="text"
                  required
                  placeholder="Nom complet (ex. Sévérin Koko)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:border-[#0B5D2A] dark:focus:border-green-450 focus:outline-none text-gray-850 dark:text-slate-150"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Numéro de téléphone</label>
                <input
                  type="tel"
                  required
                  placeholder="Téléphone (ex. +229 97 00 23)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:border-[#0B5D2A] dark:focus:border-green-450 focus:outline-none font-mono text-gray-850 dark:text-slate-150"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                
                <div className="space-y-1 col-span-2">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Type de profil / Rôle</label>
                  <select
                    value={selectedRoleType}
                    onChange={(e) => setSelectedRoleType(e.target.value as Actor['type_actor'])}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none text-gray-850 dark:text-slate-150"
                  >
                    <option value="agent" className="dark:bg-[#111c34]">Agent terrain (Moto-Vendeur)</option>
                    <option value="partner" className="dark:bg-[#111c34]">Partenaire (Boulanger/Dépositaire)</option>
                    <option value="ambassador" className="dark:bg-[#111c34]">Ambassadeur / Élève ambassadeur</option>
                    <option value="collaborator" className="dark:bg-[#111c34]">Collaborateur BOAF</option>
                    <option value="employee" className="dark:bg-[#111c34]">Employé permanent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Commission (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none font-mono font-bold text-gray-850 dark:text-slate-150"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Zone affectée</label>
                  <select
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none text-gray-850 dark:text-slate-150"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id} className="dark:bg-[#111c34]">
                        {z.nom}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="py-2 border-t border-b border-gray-100 dark:border-slate-800 my-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasPromoCode}
                    onChange={(e) => setHasPromoCode(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0B5D2A] focus:ring-[#0B5D2A] accent-[#0B5D2A]"
                  />
                  <span className="text-gray-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                    Associer un Code Promo actif pour cet acteur
                  </span>
                </label>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 pl-6">
                  Cochez pour générer automatiquement un code de réduction unique pour le suivi de ses commissions sur ventes.
                </p>
              </div>

              {hasPromoCode && (
                <div className="space-y-1 animate-fadeIn">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Code Promo Attribué automatiquement</label>
                  <input
                    type="text"
                    required={hasPromoCode}
                    value={assignedCodeText}
                    onChange={(e) => setAssignedCodeText(e.target.value)}
                    className="w-full p-2.5 bg-purple-50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-300 border border-dashed border-purple-300 dark:border-purple-800 rounded-xl focus:outline-none font-mono font-bold text-center tracking-wider"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 mt-4 bg-[#0B5D2A] hover:bg-[#12823c] text-white font-black uppercase text-xs rounded-xl shadow-md cursor-pointer transition-transform hover:scale-101 border-none"
              >
                {hasPromoCode ? 'Créer le profil et le code promo' : 'Créer le profil (sans code promo)'}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
