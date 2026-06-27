import React, { useState } from 'react';
import {
  Coins,
  CheckCircle,
  XCircle,
  FileCheck2,
  Download,
  ShieldCheck,
  Search,
  Filter,
  CreditCard,
  Ban,
  Activity
} from 'lucide-react';
import { Commission, CommissionStatus } from '../types';

interface CommissionsViewProps {
  commissions: Commission[];
  onUpdateCommissionStatus: (ids: string[], status: CommissionStatus) => void;
  currentRole: string; // admin, superviseur etc
}

export default function CommissionsView({
  commissions,
  onUpdateCommissionStatus,
  currentRole
}: CommissionsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedActorTypeFilter, setSelectedActorTypeFilter] = useState('all');

  // Multi-row selection tracking state
  const [selectedCommIds, setSelectedCommIds] = useState<string[]>([]);

  const isReadOnly = currentRole === 'lecteur' || currentRole === 'whatsapp';
  const hasValidationPower = currentRole === 'admin' || currentRole === 'superviseur' || currentRole === 'rh';

  // Apply filters
  const filteredComms = commissions.filter(c => {
    // search name
    if (searchTerm && !c.actor_name.toLowerCase().includes(searchTerm.toLowerCase()) && !c.ticket_number.includes(searchTerm)) {
      return false;
    }

    // status filter
    if (selectedStatusFilter !== 'all' && c.statut !== selectedStatusFilter) {
      return false;
    }

    // actor type filter
    if (selectedActorTypeFilter !== 'all' && c.actor_type !== selectedActorTypeFilter) {
      return false;
    }

    return true;
  });

  // Calculate top visual KPI cards totals
  const totalCommGenerated = commissions.reduce((sum, c) => sum + c.montant_commission, 0);
  const totalPaid = commissions.filter(c => c.statut === 'paid').reduce((sum, c) => sum + c.montant_commission, 0);
  const totalValidated = commissions.filter(c => c.statut === 'validated').reduce((sum, c) => sum + c.montant_commission, 0);
  const totalPending = commissions.filter(c => c.statut === 'pending').reduce((sum, c) => sum + c.montant_commission, 0);
  const totalRejected = commissions.filter(c => c.statut === 'rejected').reduce((sum, c) => sum + c.montant_commission, 0);

  // Multi row triggers
  const handleToggleSelect = (id: string) => {
    if (selectedCommIds.includes(id)) {
      setSelectedCommIds(selectedCommIds.filter(x => x !== id));
    } else {
      setSelectedCommIds([...selectedCommIds, id]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedCommIds.length === filteredComms.length) {
      setSelectedCommIds([]); // Unselect all
    } else {
      setSelectedCommIds(filteredComms.map(c => c.id)); // Select all filtered
    }
  };

  const handleBatchStatusUpdate = (status: CommissionStatus) => {
    if (selectedCommIds.length === 0) {
      alert("Veuillez d'abord sélectionner des commissions à traiter.");
      return;
    }
    onUpdateCommissionStatus(selectedCommIds, status);
    setSelectedCommIds([]);
    alert(`Opération réussie. ${selectedCommIds.length} commission(s) passée(s) à l'état "${status.toUpperCase()}".`);
  };

  // CSV exporting of checked validated commissions for banks trigger
  const exportPayoutsToCSV = () => {
    let headers = 'ID,Ticket,Acteur,Type Acteur,Montant Vente,Taux %,Commission Due,Statut\n';
    const csvContent = filteredComms.map(c => {
      return `"${c.id}","${c.ticket_number}","${c.actor_name}","${c.actor_type}",${c.montant_vente},${c.taux},${c.montant_commission},"${c.statut}"`;
    }).join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `boaf_com_ventes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Visual top indicator cards of ledger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-left">
          <span className="text-[10px] text-gray-400 block font-mono uppercase">Générées globales</span>
          <span className="text-lg font-extrabold font-display text-gray-900 block mt-1">
            {totalCommGenerated.toLocaleString()} F
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-left">
          <span className="text-[10px] text-[#0B5D2A] block font-mono uppercase">Payées (Livrées)</span>
          <span className="text-lg font-extrabold font-display text-[#0B5D2A] block mt-1">
            {totalPaid.toLocaleString()} F
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-left">
          <span className="text-[10px] text-blue-600 block font-mono uppercase">Validées (Prêt Bank)</span>
          <span className="text-lg font-extrabold font-display text-blue-600 block mt-1">
            {totalValidated.toLocaleString()} F
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-left">
          <span className="text-[10px] text-amber-600 block font-mono uppercase">En Attente</span>
          <span className="text-lg font-extrabold font-display text-amber-500 block mt-1">
            {totalPending.toLocaleString()} F
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-left">
          <span className="text-[10px] text-gray-400 block font-mono uppercase">Rejetées</span>
          <span className="text-lg font-extrabold font-display text-gray-400 block mt-1">
            {totalRejected.toLocaleString()} F
          </span>
        </div>
      </div>

      {/* Main Commission Workspace control bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        
        {/* Header and export */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-4">
          <div className="text-left font-display">
            <h3 className="font-extrabold text-[#0B5D2A] text-lg tracking-tight flex items-center gap-2">
              <Coins className="w-5 h-5 text-orange-500 animate-bounce" />
              Régularisation des Commissions du réseau
            </h3>
            <p className="text-xs text-gray-400 font-sans mt-0.5">
              Traitement comptable, validations, suspension et déclenchements de virements bancaires
            </p>
          </div>

          <button
            onClick={exportPayoutsToCSV}
            className="px-4 py-2 bg-slate-50 border border-slate-200 text-[#0B5D2A] hover:bg-slate-100 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-500" />
            Exporter l'État de Paie (.CSV)
          </button>
        </div>

        {/* Filters and search values */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 relative min-w-44">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Chercher bénéficiaire, numéro de ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 bg-slate-50 focus:bg-white rounded-xl focus:outline-none"
            />
          </div>

          {/* Status filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-gray-200 py-2 px-3 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="all">Tous les états comptables</option>
            <option value="pending">En attente (Pending)</option>
            <option value="validated">Validé (Prêt à payer)</option>
            <option value="paid">Payé d'avance (Paid)</option>
            <option value="rejected">Rejeté (Rejected)</option>
          </select>

          {/* Actor type filter */}
          <select
            value={selectedActorTypeFilter}
            onChange={(e) => setSelectedActorTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-gray-200 py-2 px-3 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes les forces de vente</option>
            <option value="agent">Agents de terrain</option>
            <option value="partner">Partenaires Relais</option>
            <option value="ambassador">Ambassadeurs Influence</option>
            <option value="collaborator">Collaborateurs</option>
          </select>
        </div>

        {/* BATCH ACTION TRIGGERS FOR ADMINS - ONLY VISIBLE TO AUTH ROLES */}
        {hasValidationPower && !isReadOnly && (
          <div className="bg-orange-50/45 p-3 rounded-2xl border border-orange-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
              <span className="font-bold text-gray-800">
                Action groupée : <strong className="text-orange-600 font-mono">{selectedCommIds.length}</strong> ligne(s) cochée(s)
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleBatchStatusUpdate('validated')}
                disabled={selectedCommIds.length === 0}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer disabled:opacity-50 text-[11px] flex items-center gap-1.5 transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Valider (Prêt)
              </button>
              <button
                onClick={() => handleBatchStatusUpdate('paid')}
                disabled={selectedCommIds.length === 0}
                className="px-3 py-1.5 bg-[#0B5D2A] hover:bg-[#0B5D2A]/90 text-white font-bold rounded-lg cursor-pointer disabled:opacity-50 text-[11px] flex items-center gap-1.5 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Décliquer en Payé
              </button>
              <button
                onClick={() => handleBatchStatusUpdate('rejected')}
                disabled={selectedCommIds.length === 0}
                className="px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer disabled:opacity-50 text-[11px] flex items-center gap-1.5 transition-all"
              >
                <Ban className="w-3.5 h-3.5" />
                Rejeter (Annulé)
              </button>
            </div>
          </div>
        )}

        {/* Ledger table */}
        <div className="border border-gray-150 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-gray-500 font-mono uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredComms.length > 0 && selectedCommIds.length === filteredComms.length}
                    onChange={handleToggleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Ticket affecté</th>
                <th className="py-3 px-4">Bénéficiaire Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Volume Vente Net</th>
                <th className="py-3 px-4 text-center">Taux commission</th>
                <th className="py-3 px-4 text-right">Commission Due</th>
                <th className="py-3 px-4 text-center">Statut comptable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredComms.length > 0 ? (
                filteredComms.map(c => {
                  const isChecked = selectedCommIds.includes(c.id);
                  return (
                    <tr key={c.id} className={`hover:bg-slate-50/50 ${isChecked ? 'bg-orange-50/20' : ''}`}>
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(c.id)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-700">
                        {c.ticket_number}
                      </td>
                      <td className="py-3 px-4 font-sans font-bold text-gray-800">
                        <div>
                          <p>{c.actor_name}</p>
                          <span className="text-[10px] text-gray-400 font-mono">{c.promo_code_text}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500 capitalize">{c.actor_type}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-700">
                        {c.montant_vente.toLocaleString()} F
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-orange-500">
                        {c.taux}%
                      </td>
                      <td className="py-3 px-4 text-right font-black text-[#0B5D2A]">
                        {c.montant_commission.toLocaleString()} F
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          c.statut === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : c.statut === 'validated'
                            ? 'bg-blue-100 text-blue-700 font-semibold'
                            : c.statut === 'pending'
                            ? 'bg-amber-100 text-amber-700 animate-pulse'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {c.statut === 'pending' ? 'En attente' : c.statut === 'validated' ? 'Validé' : c.statut === 'paid' ? 'Payé' : 'Rejeté'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 italic">
                    Aucune ligne de commission ne correspond à votre filtre de recherche comptable.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
