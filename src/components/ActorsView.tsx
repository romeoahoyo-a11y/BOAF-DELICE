import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  Mail,
  MapPin,
  Coins,
  Shield,
  Clock,
  Briefcase,
  X,
  Target,
  FileCheck2,
  Calendar
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
  currentRole: string; // admin, superviseur etc
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
  // Current tab filter for Actor Type: 'all' | ActorType
  const [activeTypeTab, setActiveTypeTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Selected Actor for the RIGHT DRAW PANEL
  const [selectedActor, setSelectedActor] = useState<Actor | null>(actors[1]); // Eric Adjovi by default for premium preview!

  // Form creation Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newActorName, setNewActorName] = useState('');
  const [newActorPhone, setNewActorPhone] = useState('');
  const [newActorEmail, setNewActorEmail] = useState('');
  const [newActorType, setNewActorType] = useState<'employee' | 'agent' | 'partner' | 'collaborator' | 'ambassador'>('agent');
  const [newActorZone, setNewActorZone] = useState('z1');
  const [newActorRate, setNewActorRate] = useState<number>(5);
  const [newActorObjective, setNewActorObjective] = useState<number>(500000);
  const [newActorPoste, setNewActorPoste] = useState('Agent Mobile');
  const [newActorAgentType, setNewActorAgentType] = useState('Moto-Vendeur');
  const [newActorSchool, setNewActorSchool] = useState('');
  const [errorText, setErrorText] = useState('');

  // Auto assign promo code state
  const [promoPrefix, setPromoPrefix] = useState('BOAF-AGT');
  const [promoExpires, setPromoExpires] = useState('');

  // Verification helper for admin/superviseur restriction
  const isReadOnly = currentRole === 'lecteur';
  const hasDirectionPower = currentRole === 'admin' || currentRole === 'superviseur';

  // Filters setup
  const filteredActors = actors.filter(act => {
    // Tab filter
    if (activeTypeTab !== 'all' && act.type_actor !== activeTypeTab) return false;

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = act.full_name.toLowerCase().includes(term);
      const matchCode = act.main_code.toLowerCase().includes(term);
      const matchPhone = act.phone.includes(term);
      if (!matchName && !matchCode && !matchPhone) return false;
    }

    // Zone filter
    if (selectedZone !== 'all' && act.zone_id !== selectedZone) return false;

    // Status filter
    if (selectedStatus !== 'all' && act.status !== selectedStatus) return false;

    return true;
  });

  // Calculate stats for selected actor in right panel
  const getActorStats = (actorId: string) => {
    const actPromoCodes = promoCodes.filter(c => c.actor_id === actorId).map(c => c.code);
    
    // Look for orders matching any of this actor's promo codes
    const actOrders = orders.filter(
      o => o.order_status === 'valid' && o.code_promo_text && actPromoCodes.includes(o.code_promo_text)
    );

    const salesVolume = actOrders.reduce((sum, o) => sum + o.total_net, 0);
    const orderCount = actOrders.length;

    const commissionsTotal = commissions
      .filter(c => c.actor_id === actorId && c.statut === 'paid')
      .reduce((sum, c) => sum + c.montant_commission, 0);

    const commissionsPending = commissions
      .filter(c => c.actor_id === actorId && (c.statut === 'pending' || c.statut === 'validated'))
      .reduce((sum, c) => sum + c.montant_commission, 0);

    return {
      salesVolume,
      orderCount,
      commissionsTotal,
      commissionsPending,
      tickets: actOrders
    };
  };

  const selectedStats = selectedActor ? getActorStats(selectedActor.id) : null;

  // Handle addition of new actor
  const handleCreateActor = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!newActorName || !newActorPhone) {
      setErrorText('Le nom et le téléphone sont obligatoires.');
      return;
    }

    // Format automatic unique code sequence
    // Calculate how many actors of this type already exist
    const countType = actors.filter(a => a.type_actor === newActorType).length + 1;
    let typePrefix = 'BOAF-AGT-';
    let commissionDefault = 5;

    if (newActorType === 'partner') {
      typePrefix = 'BOAF-PART-';
      commissionDefault = 6.5;
    } else if (newActorType === 'ambassador') {
      typePrefix = 'BOAF-AMB-';
      commissionDefault = 4;
    } else if (newActorType === 'collaborator') {
      typePrefix = 'BOAF-COL-';
      commissionDefault = 3;
    } else if (newActorType === 'employee') {
      typePrefix = 'BOAF-EMP-';
      commissionDefault = 0;
    }

    const uniqueCode = `${typePrefix}${String(100 + countType).padStart(4, '0')}`;

    const newCreated: Actor = {
      id: `act-gen-${Date.now()}`,
      type_actor: newActorType,
      full_name: newActorName,
      phone: newActorPhone,
      email: newActorEmail || `${newActorName.toLowerCase().replace(/\s+/g, '')}@boaf.com`,
      main_code: uniqueCode,
      zone_id: newActorZone,
      status: 'active',
      commission_rate: newActorRate || commissionDefault,
      date_integration: new Date().toISOString().split('T')[0],
      objective_jour: newActorObjective ? Math.round(newActorObjective / 30) : 15000,
      objective_mois: newActorObjective || 450000,
      poste: newActorPoste || 'Agent terrain',
      type_agent: newActorAgentType || 'Moto-Vendeur',
      etablissement_optionnel: newActorSchool || undefined
    };

    onAddActor(newCreated);

    // Auto-create matching PromoCode record
    const matchingCode: PromoCode = {
      id: `code-gen-${Date.now()}`,
      code: uniqueCode,
      type_code: uniqueCode.split('-').slice(0, 2).join('-'), // e.g. BOAF-AGT
      actor_id: newCreated.id,
      zone_id: newActorZone,
      status: 'active',
      starts_at: newCreated.date_integration,
      created_at: newCreated.date_integration
    };
    onAddPromoCode(matchingCode);

    // Reset Form
    setIsAddModalOpen(false);
    setNewActorName('');
    setNewActorPhone('');
    setNewActorEmail('');
    setSelectedActor(newCreated);
  };

  // Export visible list of actors as CSV file trigger
  const exportActorsToCSV = () => {
    let headers = 'ID,Nom,Type,Telephone,Email,Code Unique,Zone,Taux Comm %,Statut,Date Integration\n';
    const csvContent = filteredActors.map(a => {
      const zoneName = zones.find(z => z.id === a.zone_id)?.nom || 'Inconnue';
      return `"${a.id}","${a.full_name}","${a.type_actor}","${a.phone}","${a.email}","${a.main_code}","${zoneName}",${a.commission_rate},"${a.status}","${a.date_integration}"`;
    }).join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `boaf_delices_acteurs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add extra promo-code directly for this actor
  const handleAssignExtraCode = () => {
    if (!selectedActor) return;
    const countPromo = promoCodes.length + 1;
    const formatCode = `${promoPrefix}-${String(100 + countPromo).padStart(4, '0')}`;

    const extraCode: PromoCode = {
      id: `code-ext-${Date.now()}`,
      code: formatCode,
      type_code: promoPrefix,
      actor_id: selectedActor.id,
      zone_id: selectedActor.zone_id,
      status: 'active',
      starts_at: new Date().toISOString().split('T')[0],
      expires_at: promoExpires || undefined,
      created_at: new Date().toISOString().split('T')[0]
    };

    onAddPromoCode(extraCode);
    alert(`Nouveau code promo ${formatCode} attribué avec succès à ${selectedActor.full_name} !`);
  };

  return (
    <div className="space-y-6">
      {/* Top action header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="font-display font-extrabold text-[#0B5D2A] text-xl tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            Gestion des acteurs & forces de vente
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Suivi des employés, agents, ambassadeurs, partenaires du réseau BOAF FUTURE HOLDINGS
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={exportActorsToCSV}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-500" />
            Exporter CSV
          </button>

          {!isReadOnly && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-[#0B5D2A] hover:bg-[#0B5D2A]/90 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-md shadow-green-900/10 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              Ajouter un acteur
            </button>
          )}
        </div>
      </div>

      {/* Main layout splitting List Grid & Right details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left / Middle List block */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Quick Category Tab Filters (Tous, Employés, Agents terrain, Partenaires...) */}
          <div className="flex bg-white p-1 rounded-2xl border border-gray-150 shadow-xs overflow-x-auto gap-1">
            {[
              { id: 'all', label: 'Tout le réseau', count: actors.length },
              { id: 'employee', label: 'Employés', count: actors.filter(a => a.type_actor === 'employee').length },
              { id: 'agent', label: 'Agents terrain', count: actors.filter(a => a.type_actor === 'agent').length },
              { id: 'partner', label: 'Partenaires', count: actors.filter(a => a.type_actor === 'partner').length },
              { id: 'ambassador', label: 'Ambassadeurs', count: actors.filter(a => a.type_actor === 'ambassador').length },
              { id: 'collaborator', label: 'Collaborateurs', count: actors.filter(a => a.type_actor === 'collaborator').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTypeTab(tab.id);
                  setSelectedActor(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTypeTab === tab.id
                    ? 'bg-[#0B5D2A] text-white'
                    : 'text-gray-500 hover:text-gray-901 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTypeTab === tab.id ? 'bg-green-800 text-green-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Advanced Search & Filtering bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap gap-3">
            <div className="flex-1 relative min-w-44">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, code promo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Zone scope filter */}
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="text-xs bg-slate-50 border border-gray-200 py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="all">Toutes les zones</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.nom}
                </option>
              ))}
            </select>

            {/* Status scope filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-gray-200 py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>

          {/* Table display */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-gray-500 font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Identité Acteur</th>
                    <th className="py-3 px-4">Code d'accès</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4 text-center">Commission %</th>
                    <th className="py-3 px-4 text-right">Ventes Net</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredActors.length > 0 ? (
                    filteredActors.map((act) => {
                      const isActiveSelected = selectedActor?.id === act.id;
                      const actZone = zones.find(z => z.id === act.zone_id)?.nom || 'Non défini';
                      
                      // Calculate sum of valid orders
                      const promoActs = promoCodes.filter(p => p.actor_id === act.id).map(p => p.code);
                      const actOrders = orders.filter(o => o.order_status === 'valid' && o.code_promo_text && promoActs.includes(o.code_promo_text));
                      const salesVolumeNet = actOrders.reduce((sum, o) => sum + o.total_net, 0);

                      return (
                        <tr
                          key={act.id}
                          onClick={() => setSelectedActor(act)}
                          className={`cursor-pointer transition-all ${
                            isActiveSelected ? 'bg-orange-50/40 border-l-4 border-orange-500' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-sans">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 font-black flex items-center justify-center font-display uppercase shrink-0">
                                {act.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{act.full_name}</p>
                                <span className="text-[10px] text-gray-400 capitalize block">{act.type_actor}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-600">
                            <span className="bg-slate-100 px-2.5 py-1 rounded-md text-[11px] border border-slate-150">
                              {act.main_code}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 font-semibold">{actZone}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-orange-500">
                            {act.commission_rate > 0 ? `${act.commission_rate}%` : 'Aucun'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-[#0B5D2A]">
                            {salesVolumeNet.toLocaleString('fr-FR')} F
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              act.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {act.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400 italic font-sans text-xs">
                        Aucun acteur trouvé pour ces filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination simulator */}
            <div className="p-4 bg-slate-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span>Affichage de {filteredActors.length} sur {actors.length} fiches</span>
              <div className="flex gap-1.5">
                <button disabled className="px-2.5 py-1 bg-white border border-gray-200 rounded-md disabled:opacity-50">Préc.</button>
                <button className="px-2.5 py-1 bg-white border border-orange-500 text-orange-600 font-bold rounded-md">1</button>
                <button disabled className="px-2.5 py-1 bg-white border border-gray-200 rounded-md disabled:opacity-50">Suiv.</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Details Panel - "Panneau droit" for selected actor profiles */}
        <div className="lg:col-span-1">
          {selectedActor ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6 space-y-6 sticky top-24">
              
              {/* Profile Card Header */}
              <div className="border-b border-[#E5E7EB] pb-5 text-center relative">
                {/* Status Badge */}
                <span className={`absolute top-0 right-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                  selectedActor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedActor.status}
                </span>

                <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-orange-200 font-display uppercase">
                  {selectedActor.full_name.slice(0, 2)}
                </div>
                
                <h3 className="font-display font-black text-gray-900 text-base tracking-tight leading-snug">
                  {selectedActor.full_name}
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-semibold uppercase tracking-wider text-[9px] mt-1 inline-block">
                  {selectedActor.type_actor}
                </span>

                {/* Subdetails posting */}
                {selectedActor.poste && (
                  <p className="text-[11px] text-gray-400 mt-1.5 flex items-center justify-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {selectedActor.poste} {selectedActor.service ? `(${selectedActor.service})` : ''}
                  </p>
                )}
              </div>

              {/* Core numbers - volume generated, pending commissions */}
              <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-gray-150">
                <div className="space-y-1">
                  <span className="text-[9px] font-sans text-gray-400 uppercase tracking-wider block">Ventes rattachées</span>
                  <p className="text-sm font-extrabold text-[#0B5D2A] font-display">
                    {selectedStats?.salesVolume.toLocaleString('fr-FR')} F
                  </p>
                  <span className="text-[10px] text-gray-500 font-mono block">
                    {selectedStats?.orderCount} tickets
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-sans text-gray-400 uppercase tracking-wider block">Commissions</span>
                  <p className="text-sm font-extrabold text-orange-600 font-display">
                    {selectedStats?.commissionsPending.toLocaleString('fr-FR')} F
                  </p>
                  <span className="text-[10px] text-gray-500 font-mono block">
                    {selectedActor.commission_rate}% de com.
                  </span>
                </div>
              </div>

              {/* Personal info contact links */}
              <div className="space-y-3 font-sans text-xs text-gray-600 border-b border-[#E5E7EB] pb-5">
                <h4 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider font-display text-left">Coordonnées</h4>
                
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-sky-500 shrink-0" />
                  <span className="font-mono">{selectedActor.phone}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-teal-500 shrink-0" />
                  <span className="text-gray-800 break-all font-mono">{selectedActor.email}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Zone : <strong className="text-gray-900">{zones.find(z => z.id === selectedActor.zone_id)?.nom}</strong></span>
                </div>

                {selectedActor.objective_mois && (
                  <div className="flex items-center gap-2.5">
                    <Target className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Objectif : <strong className="text-gray-900">{selectedActor.objective_mois.toLocaleString('fr-FR')} F / mois</strong></span>
                  </div>
                )}

                {selectedActor.etablissement_optionnel && (
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>École : <strong className="text-gray-900">{selectedActor.etablissement_optionnel}</strong></span>
                  </div>
                )}
              </div>

              {/* Extra Promo Code Manager Trigger */}
              {!isReadOnly && hasDirectionPower && (
                <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100 space-y-3 text-xs">
                  <h4 className="font-bold text-orange-800 flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Attribuer code promo additionnel
                  </h4>
                  <div className="flex gap-2">
                    <select
                      value={promoPrefix}
                      onChange={(e) => setPromoPrefix(e.target.value)}
                      className="text-xs bg-white border border-gray-200 p-1.5 rounded-lg focus:outline-none"
                    >
                      <option value="BOAF-AGT">BOAF-AGT</option>
                      <option value="BOAF-PART">BOAF-PART</option>
                      <option value="BOAF-AMB">BOAF-AMB</option>
                      <option value="BOAF-COL">BOAF-COL</option>
                      <option value="BOAF-ECO">BOAF-ECO</option>
                      <option value="BOAF-EGL">BOAF-EGL</option>
                    </select>
                    <button
                      onClick={handleAssignExtraCode}
                      className="flex-1 bg-orange-500 text-white hover:bg-orange-600 font-bold px-3 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer"
                    >
                      Attribuer
                    </button>
                  </div>
                </div>
              )}

              {/* List of active promotional codes */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider font-display text-left">Codes promo reliés</h4>
                <div className="flex flex-wrap gap-1.5">
                  {promoCodes
                    .filter(c => c.actor_id === selectedActor.id)
                    .map(code => (
                      <span
                        key={code.id}
                        className={`px-2 py-1 rounded-md font-bold font-mono text-[10px] uppercase border ${
                          code.status === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {code.code}
                      </span>
                    ))}
                </div>
              </div>

              {/* Recent connected ticket receipts preview */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider font-display text-left">Dernières ventes rattachées</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedStats?.tickets && selectedStats.tickets.length > 0 ? (
                    selectedStats.tickets.map(ticket => (
                      <div key={ticket.id} className="flex justify-between items-center p-2 rounded-xl border border-gray-50 hover:bg-slate-50 transition-all text-xs">
                        <div className="flex flex-col text-left">
                          <span className="font-mono font-bold text-[#0B5D2A]">{ticket.ticket_number}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <span className="font-extrabold text-gray-900">{ticket.total_net.toLocaleString('fr-FR')} F</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">Aucune vente enregistrée avec le code promo de cet acteur.</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center text-gray-400 text-xs italic">
              Veuillez sélectionner un acteur sur le tableau pour inspecter son profil complet.
            </div>
          )}
        </div>
      </div>

      {/* Creation Modal - Add Actor / Assign promo code sequence */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-2xl p-6 relative overflow-hidden font-sans text-xs">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-600 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-150 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Plus className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-extrabold text-gray-900 text-base leading-snug">Ajouter un acteur</h3>
                <p className="text-[11px] text-gray-400 leading-tight">Enregistrer un nouvel acteur avec attribution automatique de code de promotion unique</p>
              </div>
            </div>

            <form onSubmit={handleCreateActor} className="space-y-4">
              {errorText && <p className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-lg font-bold">{errorText}</p>}

              {/* Primary Identity form group */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 block">Nom complet *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. Gérard Soglo"
                    value={newActorName}
                    onChange={(e) => setNewActorName(e.target.value)}
                    className="w-full p-2 border border-gray-200 bg-slate-50 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 block">Téléphone *</label>
                  <input
                    type="phone"
                    required
                    placeholder="ex. +229 97 12 34 56"
                    value={newActorPhone}
                    onChange={(e) => setNewActorPhone(e.target.value)}
                    className="w-full p-2 border border-gray-200 bg-slate-50 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 block">Email (optionnel)</label>
                <input
                  type="email"
                  placeholder="ex. g.soglo@boaf.com"
                  value={newActorEmail}
                  onChange={(e) => setNewActorEmail(e.target.value)}
                  className="w-full p-2 border border-gray-200 bg-slate-50 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              {/* Actor Type & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="font-semibold text-gray-700 block">Catégorie Acteur</label>
                  <select
                    value={newActorType}
                    onChange={(e) => setNewActorType(e.target.value as any)}
                    className="w-full p-2 border border-gray-200 bg-slate-50 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="employee">Employé</option>
                    <option value="agent">Agent terrain</option>
                    <option value="partner">Partenaire</option>
                    <option value="ambassador">Ambassadeur</option>
                    <option value="collaborator">Collaborateur</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="font-semibold text-gray-700 block">Zone d'Affectation</label>
                  <select
                    value={newActorZone}
                    onChange={(e) => setNewActorZone(e.target.value)}
                    className="w-full p-2 border border-gray-200 bg-slate-50 rounded-xl focus:outline-none cursor-pointer"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rate & Target values */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 block">Taux commission par défaut (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    placeholder="e.g. 5"
                    value={newActorRate}
                    onChange={(e) => setNewActorRate(Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 bg-slate-50 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 block">Objectif mensuel de vente (FCFA)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={newActorObjective}
                    onChange={(e) => setNewActorObjective(Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 bg-slate-50 rounded-xl"
                  />
                </div>
              </div>

              {/* Conditional parameters based on selection */}
              {newActorType === 'employee' && (
                <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] p-3 rounded-2xl border border-gray-150">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">Poste de l'employé</label>
                    <input
                      type="text"
                      placeholder="Poste occupé"
                      value={newActorPoste}
                      onChange={(e) => setNewActorPoste(e.target.value)}
                      className="w-full p-1.5 border border-gray-200 bg-white rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">Service administrative</label>
                    <input
                      type="text"
                      placeholder="Service"
                      className="w-full p-1.5 border border-gray-200 bg-white rounded-lg"
                    />
                  </div>
                </div>
              )}

              {newActorType === 'agent' && (
                <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E5E7EB] text-left">
                  <label className="font-semibold text-gray-700 block">Type d'agent terrain</label>
                  <select
                    value={newActorAgentType}
                    onChange={(e) => setNewActorAgentType(e.target.value)}
                    className="w-full p-2 border border-gray-200 bg-white rounded-lg"
                  >
                    <option value="Moto-Vendeur">Moto-Vendeur</option>
                    <option value="Bicyclette Mobile">Bicyclette Mobile</option>
                    <option value="Kiosque Mobile">Kiosque Mobile</option>
                  </select>
                </div>
              )}

              {newActorType === 'ambassador' && (
                <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E5E7EB]">
                  <label className="font-semibold text-gray-700 block">Établissement d'enseignement (optionnel)</label>
                  <input
                    type="text"
                    placeholder="Établissement"
                    value={newActorSchool}
                    onChange={(e) => setNewActorSchool(e.target.value)}
                    className="w-full p-1.5 border border-gray-200 bg-white rounded-lg"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#0B5D2A] text-white hover:bg-[#0B5D2A]/90 rounded-2xl font-bold uppercase transition-all shadow-md shadow-green-900/10 cursor-pointer"
              >
                Créer la fiche et générer le code promo principal
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
