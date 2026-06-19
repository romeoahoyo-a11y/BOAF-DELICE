import React, { useState } from 'react';
import {
  Tag,
  Search,
  PlusCircle,
  X,
  FileCheck2,
  TrendingUp,
  Coins,
  QrCode,
  Calendar,
  Layers,
  CheckCircle,
  HelpCircle,
  Smartphone,
  ShieldCheck,
  Power,
  Eye,
  FileSpreadsheet,
  Download,
  Printer,
  ChevronDown,
  Scissors
} from 'lucide-react';
import { PromoCode, Actor, Order, Commission, Zone, CodeStatus } from '../types';

interface PromoCodesViewProps {
  promoCodes: PromoCode[];
  actors: Actor[];
  orders: Order[];
  commissions: Commission[];
  zones: Zone[];
  onAddPromoCode: (code: PromoCode) => void;
  onUpdatePromoCode?: (updatedCodes: PromoCode[]) => void;
  currentRole: string;
}

export default function PromoCodesView({
  promoCodes,
  actors,
  orders,
  commissions,
  zones,
  onAddPromoCode,
  onUpdatePromoCode,
  currentRole
}: PromoCodesViewProps) {
  
  const isReadOnly = currentRole === 'lecteur' || currentRole === 'whatsapp' || currentRole === 'agent';

  // Advanced filters states
  const [searchTerm, setSearchTerm] = useState('');
  const [beneficiaryTypeFilter, setBeneficiaryTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');

  // Selected promo code details modal state
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);
  
  // Quick Code proof verification states
  const [verifyCodeText, setVerifyCodeText] = useState('');
  const [verifyPhoneText, setVerifyPhoneText] = useState('');
  const [verificationResult, setVerificationResult] = useState<{ status: 'verified' | 'error'; message: string; actor?: Actor } | null>(null);

  // Creation form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campagneType, setCampagneType] = useState('BOAF-ECO');
  const [selectedActorId, setSelectedActorId] = useState(actors[0]?.id || '');
  const [customCodeSuffix, setCustomCodeSuffix] = useState('');

  // Coupon Generator States
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [couponActorId, setCouponActorId] = useState(actors.find(a => a.type_actor === 'ambassador')?.id || actors[0]?.id || '');
  const [couponsPerPage, setCouponsPerPage] = useState<8 | 10 | 12>(12);
  const [couponModel, setCouponModel] = useState('elegant'); // elegant, bold, standard
  const [whatsappCompanyPhone, setWhatsappCompanyPhone] = useState('+229 97 12 34 56');

  // Multi-criteria code promo stats computer
  const getPromoCodeStats = (promo: PromoCode) => {
    // Match based on text
    const matchingOrders = orders.filter(o => 
      o.order_status === 'valid' && 
      o.code_promo_text?.toUpperCase() === promo.code.toUpperCase()
    );

    const matchCommissions = commissions.filter(c => 
      c.statut !== 'rejected' && 
      (c.order_id && matchingOrders.map(o => o.id).includes(c.order_id) || c.actor_id === promo.actor_id)
    );

    const totalSalesVol = matchingOrders.reduce((sum, o) => sum + o.total_net, 0);
    const totalComsGen = matchCommissions.reduce((sum, c) => sum + c.montant_commission, 0);

    return {
      salesCount: matchingOrders.length,
      salesVolume: totalSalesVol,
      commissionsGenerated: totalComsGen,
      ordersList: matchingOrders
    };
  };

  // Proof check code lookup
  const handleScanProofVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCodeText) {
      setVerificationResult({
        status: 'error',
        message: 'Veuillez saisir le code promo à vérifier.'
      });
      return;
    }

    const cleanCode = verifyCodeText.trim().toUpperCase();
    const cleanContact = verifyPhoneText.trim().toLowerCase();

    const codeRecord = promoCodes.find(pc => pc.code.toUpperCase() === cleanCode);
    if (!codeRecord) {
      setVerificationResult({
        status: 'error',
        message: `Erreur : Le code "${cleanCode}" n’existe pas dans notre base de données.`
      });
      return;
    }

    const matchingActor = actors.find(a => a.id === codeRecord.actor_id);
    if (cleanContact) {
      const matchName = matchingActor?.full_name.toLowerCase().includes(cleanContact);
      const matchPhone = matchingActor?.phone.toLowerCase().replace(/\s/g, '').includes(cleanContact.replace(/\s/g, ''));
      if (!matchName && !matchPhone) {
        setVerificationResult({
          status: 'error',
          message: `Le code "${cleanCode}" existe mais il n'est pas associé au contact "${verifyPhoneText}".`
        });
        return;
      }
    }

    let statusMsg = 'Le code promo est de statut ACTIF et éligible aux commissions.';
    if (codeRecord.status === 'suspended') {
      statusMsg = 'ATTENTION : Ce code est actuellement suspendu. Les commissions sont bloquées.';
    } else if (codeRecord.status === 'expired') {
      statusMsg = 'ATTENTION : Ce code promo a expiré. Les commissions sont bloquées.';
    } else if (codeRecord.status === 'inactive') {
      statusMsg = 'ATTENTION : Ce code promo est inactif.';
    }

    setVerificationResult({
      status: codeRecord.status === 'active' ? 'verified' : 'error',
      message: `Code identifié avec succès. Apporteur : ${matchingActor?.full_name} (${getProfileLabel(matchingActor?.type_actor)}). ${statusMsg}`,
      actor: matchingActor
    });
  };

  // Create brand new Promo Code campaign
  const handleAddNewPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedActor = actors.find(a => a.id === selectedActorId);
    if (!matchedActor) {
      alert("Veuillez désigner un acteur valide.");
      return;
    }

    let calculatedSuffix = customCodeSuffix.trim().toUpperCase();
    if (!calculatedSuffix) {
      calculatedSuffix = Math.floor(100 + Math.random() * 900).toString();
    }

    const cleanFormat = campagneType.replace('BOAF-', '');
    const codeString = `BOAF-${cleanFormat}-${calculatedSuffix}`;

    const alreadyExists = promoCodes.find(pc => pc.code === codeString);
    if (alreadyExists) {
      alert(`Erreur: Un code promo "${codeString}" existe déjà dans le système.`);
      return;
    }

    const newCode: PromoCode = {
      id: `pc-gen-${Date.now()}`,
      code: codeString,
      type_code: campagneType,
      actor_id: selectedActorId,
      zone_id: matchedActor.zone_id,
      status: 'active',
      starts_at: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString().split('T')[0]
    };

    onAddPromoCode(newCode);
    setShowCreateModal(false);
    setCustomCodeSuffix('');
    alert(`Code Promo de campagne ${codeString} créé et rattaché à ${matchedActor.full_name} !`);
  };

  // Toggle active status wrapper
  const handleToggleCodeStatus = (codeToToggle: PromoCode) => {
    if (onUpdatePromoCode) {
      const updated = promoCodes.map(c => {
        if (c.id === codeToToggle.id) {
          let nextStatus: CodeStatus = 'active';
          if (c.status === 'active') {
            nextStatus = 'inactive';
          } else if (c.status === 'inactive') {
            nextStatus = 'suspended';
          } else if (c.status === 'suspended') {
            nextStatus = 'expired';
          } else {
            nextStatus = 'active';
          }
          return { ...c, status: nextStatus };
        }
        return c;
      });
      onUpdatePromoCode(updated);
      alert(`Code ${codeToToggle.code} basculé vers le nouveau statut.`);
    }
  };

  // Helper labels mapping
  const getProfileLabel = (r?: string) => {
    switch (r) {
      case 'agent': return 'Agent terrain';
      case 'partner': return 'Partenaire dépositaire';
      case 'ambassador': return 'Ambassadrice / Ambassadeur';
      case 'collaborator': return 'Collaborateur';
      case 'employee': return 'Employé Bureau';
      default: return 'Apporteur';
    }
  };

  // Filters application
  const filteredPromoCodes = promoCodes.filter(pc => {
    const owner = actors.find(a => a.id === pc.actor_id);
    
    // 1. Text filter search matching (Code / Name / Phone)
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchCode = pc.code.toLowerCase().includes(q);
      const matchOwnerName = owner?.full_name.toLowerCase().includes(q);
      const matchOwnerPhone = owner?.phone.toLowerCase().replace(/\s/g, '').includes(q.replace(/\s/g, ''));
      if (!matchCode && !matchOwnerName && !matchOwnerPhone) return false;
    }

    // 2. Beneficiary Type Filter
    if (beneficiaryTypeFilter !== 'all') {
      if (owner?.type_actor !== beneficiaryTypeFilter) return false;
    }

    // 3. Status filter
    if (statusFilter !== 'all') {
      if (pc.status !== statusFilter) return false;
    }

    // 4. Zone filter
    if (zoneFilter !== 'all') {
      if (pc.zone_id !== zoneFilter && owner?.zone_id !== zoneFilter) return false;
    }

    // 5. Creation Period Date filters
    if (startDateStr && pc.created_at < startDateStr) return false;
    if (endDateStr && pc.created_at > endDateStr) return false;

    return true;
  });

  // Export mechanisms (CSV and Excel)
  const downloadTextFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    let csv = `Code Promo;Beneficiaire;Role;Telephone;Zone;Statut;Date Creation;Expiration;Ventes Generées;Commissions Generées\n`;
    
    filteredPromoCodes.forEach(pc => {
      const owner = actors.find(a => a.id === pc.actor_id);
      const zoneName = zones.find(z => z.id === pc.zone_id || z.id === owner?.zone_id)?.nom || 'Néant';
      const stats = getPromoCodeStats(pc);
      
      csv += `"${pc.code}";"${owner?.full_name || 'Néant'}";"${owner ? getProfileLabel(owner.type_actor) : 'Néant'}";"${owner?.phone || ''}";"${zoneName}";"${pc.status.toUpperCase()}";"${pc.created_at}";"${pc.expires_at || 'Jamais'}";"${stats.salesVolume} FCFA (${stats.salesCount} cmd)";"${stats.commissionsGenerated} FCFA"\n`;
    });

    downloadTextFile(csv, `BOAF_CodesPromo_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    alert("Export CSV de vos codes promo téléchargé !");
  };

  const handleExportExcel = () => {
    // Excel tabular representation utilizing a structured CSV format
    this?.handleExportCSV();
  };

  const handlePrintRegistry = () => {
    window.print();
  };

  // Coupons data retrieval
  const activeCouponActor = actors.find(a => a.id === couponActorId);
  const activeCouponCode = promoCodes.find(pc => pc.actor_id === couponActorId)?.code || 'BOAF-CODE';

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12 font-sans text-xs">
      
      {/* 1. Header with Export Actions */}
      <div className="bg-white dark:bg-[#0f1a30] p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors no-print">
        <div>
          <h2 className="text-xl font-display font-black text-[#0B5D2A] dark:text-green-400 flex items-center gap-2">
            <Tag className="w-5 h-5 text-orange-500" />
            Codes Promo et Coupons Ambassadrices
          </h2>
          <p className="text-[11px] text-gray-400 mt-1 leading-normal">
            Gérez la distribution des codes promo, exportez les commissions et imprimez les planches A4 de coupons découpables pour vos ambassadrices terrain.
          </p>
        </div>

        {/* Export buttons row */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setShowCouponsModal(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/10 cursor-pointer border-none"
          >
            <Scissors className="w-4 h-4" />
            Générer coupons A4
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 dark:bg-slate-900 border border-slate-700 hover:bg-slate-900 text-white font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-300" />
            Exporter CSV
          </button>

          <button
            onClick={handlePrintRegistry}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-805 dark:bg-slate-850 dark:text-slate-200 border border-transparent rounded-xl flex items-center gap-1 cursor-pointer hover:scale-101 transition-transform font-bold"
          >
            <Printer className="w-4 h-4 text-orange-550" />
            Imprimer Registre A4
          </button>

          {currentRole !== 'lecteur' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#0B5D2A] hover:bg-[#12823c] text-white font-black uppercase rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-green-905/10 cursor-pointer border-none"
            >
              <PlusCircle className="w-4 h-4" />
              Nouveau Code Promo
            </button>
          )}
        </div>
      </div>

      {/* 2. Advanced Multi-Criteria Filter card */}
      <div className="bg-white dark:bg-[#0f1a30] p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs space-y-4 text-left transition-colors no-print">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800/80 pb-2.5">
          <h3 className="font-display font-black text-[#0B5D2A] dark:text-green-400 uppercase tracking-widest text-[10.5px] flex items-center gap-1.5">
            🔍 Recherche et Filtres d'Exportation
          </h3>
          <span className="text-[10px] text-gray-400 font-mono">
            {filteredPromoCodes.length} code(s) correspondant(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Text query */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-500 uppercase block">Recherche texte</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-450" />
              <input
                type="text"
                placeholder="Chercher code, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Beneficiary Type */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-500 uppercase block">Rôle Bénéficiaire</label>
            <select
              value={beneficiaryTypeFilter}
              onChange={(e) => setBeneficiaryTypeFilter(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Tous les rôles</option>
              <option value="ambassador">Ambassadrice / Ambassadeur</option>
              <option value="agent">Agent terrain</option>
              <option value="partner">Partenaire dépositaire</option>
              <option value="collaborator">Collaborateur</option>
              <option value="employee">Employé de bureau</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-500 uppercase block">Statut du Code</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
              <option value="expired">Expiré</option>
            </select>
          </div>

          {/* Zone filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-500 uppercase block">Secteur / Zone</label>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Toutes les zones</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.nom}</option>
              ))}
            </select>
          </div>

          {/* Creation date bounds */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-500 uppercase block">Date de création</label>
            <div className="flex gap-1 items-center">
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="w-1/2 p-1 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-[10px]"
              />
              <span className="text-gray-400 text-[10px]">à</span>
              <input
                type="date"
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                className="w-1/2 p-1 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-[10px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Data Content & Verification quick tools */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start no-print">
        
        {/* Left main database grid columns */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0f1a30] p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800/80 pb-3">
            <h3 className="font-display font-extrabold text-[#0B5D2A] dark:text-green-400 text-sm">
              🔑 Codes d'affiliation enregistrés
            </h3>
            <span className="text-[10px] text-gray-400">Total actifs : {filteredPromoCodes.filter(pc => pc.status === 'active').length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-205 dark:border-slate-800 uppercase font-mono tracking-wider text-[9px] text-gray-400 dark:text-slate-450">
                  <th className="py-2.5 px-3">Code Promo</th>
                  <th className="py-2.5 px-3">Bénéficiaire Référent</th>
                  <th className="py-2.5 px-3 uppercase text-center">Rôle</th>
                  <th className="py-2.5 px-3 text-right">Ventes Liées</th>
                  <th className="py-2.5 px-3 text-right">Commissions</th>
                  <th className="py-2.5 px-3 text-center">Statut</th>
                  <th className="py-2.5 px-3 text-center w-20">Fiche</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredPromoCodes.length > 0 ? (
                  filteredPromoCodes.map(pc => {
                    const stats = getPromoCodeStats(pc);
                    const owner = actors.find(a => a.id === pc.actor_id);
                    return (
                      <tr key={pc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors border-b border-gray-100 dark:border-slate-800/40">
                        {/* Copyable code promo style */}
                        <td className="py-3 px-3 font-mono font-black text-purple-700 dark:text-purple-300">
                          {pc.code}
                        </td>

                        {/* Beneficiary Name & contact */}
                        <td className="py-3 px-3 font-semibold text-gray-950 dark:text-slate-150">
                          {owner?.full_name || 'Néant'}
                          {owner?.phone && (
                            <span className="block text-[10px] text-gray-400 dark:text-slate-500 font-mono font-normal">
                              🟢 {owner.phone}
                            </span>
                          )}
                        </td>

                        {/* Category Label */}
                        <td className="py-3 px-3 capitalize font-semibold text-gray-600 dark:text-slate-400 text-center">
                          {owner ? getProfileLabel(owner.type_actor).replace(' / ', '\n') : 'Libre'}
                        </td>

                        {/* Ventes associées */}
                        <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-slate-200">
                          {stats.salesVolume.toLocaleString('fr-FR')} F
                          <span className="block text-[10px] text-gray-400 font-semibold">{stats.salesCount} cmd</span>
                        </td>

                        {/* Commissions */}
                        <td className="py-3 px-3 text-right font-black text-orange-650 dark:text-orange-400 font-mono">
                          {stats.commissionsGenerated.toLocaleString('fr-FR')} F
                        </td>

                        {/* Interactive Status switch */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleCodeStatus(pc)}
                            disabled={currentRole === 'lecteur' || isReadOnly}
                            className={`px-2 py-0.5 rounded-lg text-[9.5px] font-bold border cursor-pointer ${
                              pc.status === 'active'
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-305 border-emerald-200 dark:border-emerald-850/40'
                                : pc.status === 'inactive'
                                ? 'bg-gray-100 dark:bg-slate-900 text-gray-600 dark:text-slate-400 border-gray-300'
                                : pc.status === 'suspended'
                                ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-305 border-amber-200'
                                : 'bg-red-50 dark:bg-red-955/20 text-red-700 dark:text-red-405 border-red-200'
                            }`}
                            title="Cliquez pour changer cycliquement le statut"
                          >
                            ● {pc.status.toUpperCase()}
                          </button>
                        </td>

                        {/* Detail modal button */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setSelectedPromoCode(pc)}
                            className="bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 text-slate-800 dark:text-slate-200 p-1 rounded-lg border border-gray-200 dark:border-slate-800 cursor-pointer"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 italic font-mono">
                      Aucun code promo correspondant à vos filtres de sélection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right validation controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#FFF9F6] dark:bg-[#152342] p-5 rounded-3xl border border-orange-100 dark:border-slate-800 space-y-4 text-left shadow-2xs transition-colors">
            <div className="flex items-center gap-1.5 border-b border-orange-100 dark:border-slate-800 pb-2.5">
              <QrCode className="w-5 h-5 text-orange-550" />
              <h4 className="font-display font-black text-xs uppercase text-[#0B5D2A] dark:text-green-400">
                Vérification d’affiliation
              </h4>
            </div>
            
            <p className="text-[10.5px] text-gray-550 leading-relaxed dark:text-slate-400">
              Tapez un code promo déclaré ci-dessous pour identifier son éligibilité aux commissions BOAF FUTURE HOLDINGS.
            </p>

            <form onSubmit={handleScanProofVerify} className="space-y-3 font-sans">
              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-gray-500 block">Code Promo</label>
                <input
                  type="text"
                  placeholder="ex. BOAF-AMB-0234"
                  value={verifyCodeText}
                  onChange={(e) => setVerifyCodeText(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg font-bold uppercase font-mono text-gray-850 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-gray-500 block">Contact / Nom facultatif</label>
                <input
                  type="text"
                  placeholder="ex. Grâce"
                  value={verifyPhoneText}
                  onChange={(e) => setVerifyPhoneText(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg text-gray-850 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0B5D2A] hover:bg-[#12823c] text-white font-black text-xs rounded-xl shadow-sm uppercase tracking-wide border-none cursor-pointer"
              >
                Lancer la vérification
              </button>
            </form>

            {verificationResult && (
              <div className={`p-3 rounded-xl border text-[10.5px] leading-relaxed text-left ${
                verificationResult.status === 'verified'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-850 dark:text-emerald-305'
                  : 'bg-red-50 dark:bg-red-955/20 border-red-200 text-red-900 dark:text-red-405'
              }`}>
                <div className="font-bold flex items-center gap-1">
                  {verificationResult.status === 'verified' ? '✓ ÉLIGIBLE' : '✗ REFUSÉ'}
                </div>
                <p className="mt-1">{verificationResult.message}</p>
              </div>
            )}
            
          </div>
        </div>

      </div>

      {/* CODE SELECTION DETAILED RECORD MODAL (FICHE INFO) */}
      {selectedPromoCode && (
        <div className="fixed inset-0 bg-gray-905/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-xs no-print">
          <div className="bg-white dark:bg-[#111c33] rounded-[28px] w-full max-w-sm overflow-hidden border border-gray-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] text-left transition-colors">
            
            <div className="bg-[#0B5D2A] p-4 text-white flex justify-between items-center">
              <span className="text-xs uppercase font-mono font-bold tracking-widest text-orange-400">Dossier d'affiliation</span>
              <button
                onClick={() => setSelectedPromoCode(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="text-center space-y-2">
                <span className="inline-block p-1 bg-purple-50 dark:bg-purple-955/20 text-purple-750 dark:text-purple-300 font-mono font-black text-md px-4 py-1.5 rounded-xl border border-purple-200">
                  🎟️ {selectedPromoCode.code}
                </span>
                <p className="text-[10px] text-gray-400">Code rattaché le {selectedPromoCode.created_at}</p>
              </div>

              {/* Actor details */}
              {(() => {
                const act = actors.find(a => a.id === selectedPromoCode.actor_id);
                const stats = getPromoCodeStats(selectedPromoCode);
                return (
                  <div className="space-y-3.5 pt-2">
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-gray-150 dark:border-slate-800 space-y-2">
                      <span className="text-[9px] font-black uppercase text-gray-400 block font-mono">Bénéficiaire Officiel</span>
                      <p className="font-black text-gray-900 dark:text-slate-100 text-sm leading-tight">{act?.full_name || 'Bénéficiaire libre'}</p>
                      <p className="font-semibold text-gray-500">Rôle d’accord : {act ? getProfileLabel(act.type_actor) : 'Inconnu'}</p>
                      <p className="font-mono text-gray-400">Numéro : {act?.phone || 'Non renseigné'}</p>
                      <p className="text-xs text-orange-650 font-bold">Commission assignée : {act?.commission_rate || 5}% de commission</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-3 bg-[#EBF7EE] dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-305 rounded-xl border border-emerald-250">
                        <span className="text-[9px] block font-mono">FINANCES LIÉES</span>
                        <span className="font-black text-sm">{stats.salesVolume.toLocaleString('fr-FR')} F</span>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-955/20 text-orange-850 dark:text-orange-305 rounded-xl border border-orange-250">
                        <span className="text-[9px] block font-mono">CUMUL COMS</span>
                        <span className="font-black text-sm">{stats.commissionsGenerated.toLocaleString('fr-FR')} F</span>
                      </div>
                    </div>

                    <div className="pt-2 text-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${selectedPromoCode.code}`}
                        alt="Promo QR"
                        className="w-24 h-24 p-1 bg-white border border-gray-250 rounded-lg mx-auto"
                      />
                      <span className="text-[9px] text-gray-400 mt-1 uppercase font-mono block">QR Promo pour distribution</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-gray-150">
              <button
                onClick={() => setSelectedPromoCode(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl border-none cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATION FORM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-905/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-xs no-print">
          <div className="bg-white dark:bg-[#111c33] rounded-[28px] w-full max-w-md overflow-hidden border border-gray-150 shadow-2xl text-left flex flex-col max-h-[90vh]">
            
            <div className="bg-[#0B5D2A] p-5 text-white flex justify-between items-center">
              <h3 className="font-display font-black text-sm uppercase">🎟️ Créer un Code Promo Campagne</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer border-none text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewPromoCode} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Type / Format de Campagne</label>
                <select
                  value={campagneType}
                  onChange={(e) => setCampagneType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="BOAF-ECO">Écoles & Élèves (BOAF-ECO-XXXX)</option>
                  <option value="BOAF-AMB">Ambassadrices ordinaires (BOAF-AMB-XXXX)</option>
                  <option value="BOAF-PART">Partenaires dépositaires (BOAF-PART-XXXX)</option>
                  <option value="BOAF-EGL">Églises & Communautés (BOAF-EGL-XXXX)</option>
                  <option value="BOAF-EVT">Événementiel & Foires (BOAF-EVT-XXXX)</option>
                  <option value="BOAF-AGT">Agents Mobiles (BOAF-AGT-XXXX)</option>
                </select>
              </div>

              <div className="space-y-1 font-sans">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Rattacher à l'Acteur Référent</label>
                <select
                  value={selectedActorId}
                  onChange={(e) => setSelectedActorId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800 rounded-xl"
                >
                  {actors.map(act => (
                    <option key={act.id} value={act.id}>
                      {act.full_name} ({getProfileLabel(act.type_actor)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Suffixe numérique/lettres personnalisé (ex. 001 ou GRACE)</label>
                <input
                  type="text"
                  placeholder="Laisser vide pour générer un numéro aléatoire"
                  value={customCodeSuffix}
                  onChange={(e) => setCustomCodeSuffix(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800 rounded-xl font-mono uppercase font-black text-purple-750 placeholder-gray-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border-none cursor-pointer uppercase"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#0B5D2A] hover:bg-[#12823c] text-white font-black uppercase rounded-xl border-none cursor-pointer"
                >
                  ✓ Générer
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* A4 COUPONS PRINT PREVIEW GENERATOR DL */}
      {showCouponsModal && (
        <div className="fixed inset-0 bg-gray-905/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto block no-print font-sans">
          <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-[28px] max-w-5xl w-full flex flex-col md:flex-row gap-6 max-h-[95vh] text-left">
            
            {/* Control Column */}
            <div className="w-full md:w-80 shrink-0 space-y-4">
              <div className="bg-white dark:bg-[#111c33] p-5 rounded-2xl border border-gray-255 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-2">
                  <h4 className="font-display font-black text-xs uppercase text-[#0B5D2A] dark:text-green-400">
                    ✂️ Coupons A4 Ambassadrice
                  </h4>
                  <button
                    onClick={() => setShowCouponsModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Choose Ambassador */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Ambassadrice / Partenaire</label>
                  <select
                    value={couponActorId}
                    onChange={(e) => setCouponActorId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-gray-250 rounded-lg text-xs font-semibold"
                  >
                    {actors.filter(a => a.type_actor === 'ambassador' || a.type_actor === 'partner').map(a => (
                      <option key={a.id} value={a.id}>
                        {a.full_name} ({getProfileLabel(a.type_actor).replace(' / ', '/')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of coupons per page */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Coupons par page A4</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[8, 10, 12].map(num => (
                      <button
                        key={num}
                        onClick={() => setCouponsPerPage(num as 8 | 10 | 12)}
                        className={`py-1.5 border text-center text-xs font-bold rounded-lg cursor-pointer ${
                          couponsPerPage === num
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-white dark:bg-slate-900 text-gray-600 border-gray-250'
                        }`}
                      >
                        {num} coupons
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model pattern style */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Gabarit de style</label>
                  <select
                    value={couponModel}
                    onChange={(e) => setCouponModel(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-gray-250 rounded-lg text-xs"
                  >
                    <option value="elegant">Modèle Premium Vert & Orange</option>
                    <option value="bold">Modèle Impact Minimal Noir</option>
                    <option value="classic">Modèle Classique Épuré</option>
                  </select>
                </div>

                {/* WhatsApp validation number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">WhatsApp validation client</label>
                  <input
                    type="text"
                    value={whatsappCompanyPhone}
                    onChange={(e) => setWhatsappCompanyPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-gray-250 rounded-lg font-mono text-xs"
                  />
                </div>

                {/* Print command action */}
                <div className="pt-3 border-t border-gray-150">
                  <button
                    onClick={handlePrintRegistry}
                    className="w-full py-2.5 bg-[#0B5D2A] hover:bg-[#12823c] text-white font-black uppercase rounded-lg flex items-center justify-center gap-1.5 cursor-pointer border-none"
                  >
                    <Printer className="w-4 h-4 text-white" />
                    Imprimer les Coupons A4
                  </button>
                  <p className="text-[9px] text-gray-400 leading-tight mt-1.5 text-center">
                    Utilisez des ciseaux pour découper selon les pointillés. Tous les coupons d’une même page portent le code de l'ambassadrice.
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Paper A4 preview panel */}
            <div className="flex-1 overflow-y-auto bg-slate-200 dark:bg-slate-950 p-4 rounded-2xl flex justify-center">
              <div 
                id="printable-coupons-a4" 
                className="bg-white text-slate-900 p-8 shadow-2xl rounded-sm w-[793px] min-h-[1122px] border border-gray-300 relative text-left"
                style={{ contentVisibility: 'auto' }}
              >
                {/* Visual A4 divider label */}
                <span className="absolute left-1/2 top-2 -translate-x-1/2 text-[8px] uppercase text-gray-400 font-mono tracking-wider items-center no-print flex gap-1">
                  🔍 Prévisualisation Planche A4 Coupons Découpables
                </span>

                {/* Coupons grids block */}
                <div className={`grid gap-4 mt-4 h-full ${
                  couponsPerPage === 8 ? 'grid-cols-2 grid-rows-4' :
                  couponsPerPage === 10 ? 'grid-cols-2 grid-rows-5' :
                  'grid-cols-2 grid-rows-6'
                }`}>
                  {Array.from({ length: couponsPerPage }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`p-4 border-2 border-dashed border-gray-300 rounded-xl relative overflow-hidden break-inside-avoid flex flex-col justify-between ${
                        couponModel === 'elegant' ? 'bg-gradient-to-br from-emerald-50/20 to-orange-50/10' : 'bg-white'
                      }`}
                      style={{ height: couponsPerPage === 8 ? '240px' : couponsPerPage === 10 ? '190px' : '155px' }}
                    >
                      {/* Decorative layout parts */}
                      {couponModel === 'elegant' && (
                        <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-orange-200/40 rounded-full blur-xl" />
                      )}

                      {/* Coupon Header */}
                      <div className="flex justify-between items-center border-b border-gray-100 pb-1 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-[#0B5D2A] rounded-full flex items-center justify-center text-white font-black text-xs font-display">B</div>
                          <span className="font-display font-black text-[#0B5D2A] tracking-wider text-[11px]">BOAF DÉLICES</span>
                        </div>
                        <span className="text-[8px] font-mono font-bold text-orange-605 tracking-widest bg-orange-50 px-1.5 py-0.2 rounded uppercase shrink-0">COUPON CADEAU</span>
                      </div>

                      {/* Coupon Body */}
                      <div className="my-1.5 space-y-1 select-none text-[11px] flex-1 flex flex-col justify-center">
                        <p className="font-sans font-medium text-gray-500 uppercase tracking-widest text-[8px]">AMBASSADRICE BOAF</p>
                        <p className="font-bold text-slate-800 text-[12px] truncate">Nom : <span className="text-gray-900">{activeCouponActor?.full_name || 'Grâce HOUNKPÈVI'}</span></p>
                        
                        {/* Huge highlight Code promo key */}
                        <div className="my-1 py-1 bg-purple-50 border border-purple-200 rounded-lg text-center font-mono font-black text-purple-855 text-sm uppercase select-all tracking-wider">
                          🎁 {activeCouponCode}
                        </div>
                      </div>

                      {/* Coupon Footer */}
                      <div className="border-t border-slate-100 pt-1 text-[8.5px] text-gray-500 leading-tight space-y-0.5 shrink-0 flex justify-between items-end">
                        <div>
                          <p className="font-bold text-[#0B5D2A]">Commandes WhatsApp : {whatsappCompanyPhone}</p>
                          <p className="italic text-[8px] text-gray-400">Présentez ce code lors de votre commande.</p>
                        </div>

                        {/* Scissors icon indicator */}
                        <Scissors className="w-3.5 h-3.5 text-gray-350" />
                      </div>

                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-8 right-8 border-t border-slate-100 pt-1 text-center font-mono text-[8px] text-gray-400 uppercase">
                  ✂️ Planche imprimable de coupons individuels de fidélité pour distribution manuelle.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED PRINTOUTS CSS RULES PRINT AREA OVERRIDES STRICTLY COUPLING */}
      <style>{`
        @media print {
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          aside, header, main, .no-print, button, form, select, input {
            display: none !important;
            visibility: hidden !important;
          }
          /* Custom overrides depending on active view printable frame */
          #printable-coupons-a4 {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 1.5cm !important;
            box-shadow: none !important;
            border: none !important;
          }
          .break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
