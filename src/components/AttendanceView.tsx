import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  PlusCircle,
  FileCheck2,
  Phone,
  Coins,
  Smile,
  AlertOctagon,
  UserCheck,
  Play,
  X,
  Target,
  FileText
} from 'lucide-react';
import { AttendanceLog, Actor, Zone, AttendanceStatus } from '../types';

interface AttendanceViewProps {
  attendanceLogs: AttendanceLog[];
  actors: Actor[];
  zones: Zone[];
  onAddAttendanceLog: (log: AttendanceLog) => void;
  onUpdateAttendanceLog: (log: AttendanceLog) => void;
  currentRole: string;
}

export default function AttendanceView({
  attendanceLogs,
  actors,
  zones,
  onAddAttendanceLog,
  onUpdateAttendanceLog,
  currentRole
}: AttendanceViewProps) {
  
  // State
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    actors.find(a => a.type_actor === 'agent')?.id || ''
  );
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState<AttendanceLog | null>(null);

  // Supervisor Form states for a new mission planning
  const [newAgentId, setNewAgentId] = useState('');
  const [newDate, setNewDate] = useState('2026-06-03');
  const [newLieu, setNewLieu] = useState('');
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('16:00');
  const [newZoneId, setNewZoneId] = useState(zones[0]?.id || 'z1');
  const [newObjectif, setNewObjectif] = useState('vente');

  // Result Form states
  const [inputContacts, setInputContacts] = useState(0);
  const [inputVentesCount, setInputVentesCount] = useState(0);
  const [inputMontant, setInputMontant] = useState(0);
  const [inputDifficulties, setInputDifficulties] = useState('');

  // Filtering logs
  const todayDateStr = '2026-06-03';

  // Handler to quickly plan a mission
  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentId || !newLieu) {
      alert("Veuillez sélectionner l'agent terrain et encoder le lieu précis.");
      return;
    }

    const matchedAgent = actors.find(a => a.id === newAgentId);

    const log: AttendanceLog = {
      id: `att-dyn-${Date.now()}`,
      agent_id: newAgentId,
      agent_name: matchedAgent?.full_name || 'Agent Mobile',
      agent_code: matchedAgent?.main_code || 'BOAF-AGT',
      date: newDate,
      status: 'planned',
      start_time_prevu: newStartTime,
      end_time_prevu: newEndTime,
      lieu_precis: newLieu,
      objectif: newObjectif,
      produits_presentes: ['Pain sucré premium', 'Pain ordinaire au beurre'],
      code_promo_lie: matchedAgent?.main_code || 'BOAF-CODE',
      contacts_count: 0,
      ventes_count: 0,
      montant_vendu: 0,
      difficulties: '',
      zone_id: newZoneId,
      zone_name: zones.find(z => z.id === newZoneId)?.nom || 'Lokossa Centre'
    };

    onAddAttendanceLog(log);
    setShowAddLogModal(false);
    
    // Clear Form
    setNewAgentId('');
    setNewLieu('');
    alert("Mission terrain planifiée et notifiée à l'agent !");
  };

  // Status reporter triggers for agents
  const handleUpdateStatus = (log: AttendanceLog, newStatus: AttendanceStatus) => {
    const updated: AttendanceLog = {
      ...log,
      status: newStatus,
      // If arrived, set a mock check-in time
      checkin_at: newStatus === 'arrived' ? new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) : log.checkin_at,
      checkout_at: newStatus === 'completed' ? new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) : log.checkout_at,
    };
    onUpdateAttendanceLog(updated);
    alert(`Statut de mission mis à jour : "${getFrenchStatus(newStatus)}"`);
  };

  // Result submit trigger
  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResultsModal) return;

    const updated: AttendanceLog = {
      ...showResultsModal,
      contacts_count: Number(inputContacts),
      ventes_count: Number(inputVentesCount),
      montant_vendu: Number(inputMontant),
      difficulties: inputDifficulties,
      status: 'completed' // Mark as completed when report contains results
    };

    onUpdateAttendanceLog(updated);
    setShowResultsModal(null);
    setInputContacts(0);
    setInputVentesCount(0);
    setInputMontant(0);
    setInputDifficulties('');
    alert("Résultats de la mission enregistrés avec succès !");
  };

  // Convert status keys to nice French labels
  const getFrenchStatus = (st: AttendanceStatus) => {
    switch (st) {
      case 'planned': return 'Prévu';
      case 'arrived': return 'Arrivé sur place';
      case 'in_progress': return 'Mission en cours';
      case 'completed': return 'Terminé';
      case 'absent': return 'Absent';
      case 'postponed': return 'Mission reportée';
      default: return 'Inconnu';
    }
  };

  const getStatusBadgeStyle = (st: AttendanceStatus) => {
    switch (st) {
      case 'planned': return 'bg-slate-50 text-slate-800 border-slate-200';
      case 'arrived': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'in_progress': return 'bg-orange-50 text-orange-850 border-orange-205';
      case 'completed': return 'bg-emerald-50 text-emerald-800 border-emerald-250';
      case 'absent': return 'bg-red-50 text-red-800 border-red-200';
      case 'postponed': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-850 border-gray-250';
    }
  };

  // Divide filtered arrays
  const activeAgentLogins = attendanceLogs.filter(log => log.date === todayDateStr);

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      
      {/* Upper header */}
      <div className="bg-white dark:bg-[#0f1a30] p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-display font-black text-[#0B5D2A] dark:text-green-400 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            Planning terrain & Présences
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-normal">
            Gérez les affectations des moto-vendeurs et suivez les présences signalées par zone sans tracking permanent de géolocalisation.
          </p>
        </div>

        {currentRole !== 'agent' && currentRole !== 'lecteur' && (
          <button
            onClick={() => setShowAddLogModal(true)}
            className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 font-extrabold text-white text-xs uppercase tracking-wide rounded-2xl flex items-center gap-2 shadow-sm transition-transform hover:scale-101 border-none cursor-pointer text-center"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            Planifier une mission
          </button>
        )}
      </div>


      {/* PORTAL VIEW SWITCHER FOR DEMO / TEST ROLES */}
      <div className="bg-[#FFF9F6] dark:bg-[#152342] p-4 rounded-2xl border border-orange-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <span className="text-[10px] bg-orange-600 text-white font-bold px-2 py-0.5 rounded font-mono block w-max mb-1 uppercase text-center">Sélecteur de simulateur</span>
          <p className="text-[11px] text-gray-650 dark:text-slate-305 leading-tight">
            Regardez l'application soit du point de vue d'un <strong>Superviseur</strong>, soit comme un <strong>Agent de terrain</strong> sur Android.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Pick Agent to simulate */}
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="p-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 text-gray-800 dark:text-slate-200 rounded-xl focus:outline-none"
          >
            {actors.filter(a => a.type_actor === 'agent').map(a => (
              <option key={a.id} value={a.id}>Simuler : {a.full_name}</option>
            ))}
          </select>
        </div>
      </div>


      {/* SECTION 1: AGENT PORTABLE MOBILE VIEW PERSPECTIVE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Mobile client view representation */}
        <div className="md:col-span-1 bg-white dark:bg-[#0f1a30] p-5 rounded-[28px] border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B5D2A] animate-ping" />
            <span className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 font-mono tracking-wider">Écran Mobile de l'Agent</span>
          </div>

          {(() => {
            const currentAgentObj = actors.find(a => a.id === selectedAgentId);
            const myTodayMissions = attendanceLogs.filter(log => log.agent_id === selectedAgentId && log.date === todayDateStr);

            return (
              <div className="space-y-4 text-left">
                <div className="bg-[#0B5D2A] text-white p-4 rounded-2xl space-y-1">
                  <p className="text-[10px] text-emerald-250 font-mono uppercase">Agent Connecté</p>
                  <p className="font-bold text-sm">{currentAgentObj?.full_name || 'Chargement...'}</p>
                  <p className="text-[10.5px] text-emerald-100 font-mono">Code Ref: {currentAgentObj?.main_code || 'BOAF'}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-display font-bold text-gray-950 dark:text-slate-100 text-xs uppercase tracking-wide">📦 Missions de ma journée</h4>
                  
                  {myTodayMissions.length > 0 ? (
                    myTodayMissions.map(m => (
                      <div key={m.id} className="bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-4 rounded-xl space-y-3 transition-colors">
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9.5px] bg-[#0B5D2A]/10 dark:bg-[#0B5D2A]/25 text-[#0B5D2A] dark:text-green-305 font-bold px-2 py-0.5 rounded uppercase">
                              {m.objectif || 'Livraison / Vente'}
                            </span>
                            <h5 className="font-bold text-gray-900 dark:text-slate-100 mt-1.5">{m.lieu_precis}</h5>
                            <p className="text-[10.5px] text-gray-500 dark:text-slate-400 mt-0.5 font-mono">🕦 Prévu : {m.start_time_prevu} à {m.end_time_prevu}</p>
                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded text-[9.5px] font-bold uppercase ${getStatusBadgeStyle(m.status)}`}>
                            {getFrenchStatus(m.status)}
                          </span>
                        </div>

                        {/* GIANT ACTION BUTTONS FOR AGENT MOBILE PLATFORM */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          
                          {/* "Je suis arrivé" button */}
                          <button
                            onClick={() => handleUpdateStatus(m, 'arrived')}
                            disabled={m.status === 'completed' || m.status === 'absent'}
                            className="p-3 bg-[#0B5D2A] hover:bg-[#12823c] text-white text-[10.5px] font-black rounded-xl text-center uppercase tracking-wide cursor-pointer transition-transform hover:scale-101 border-none disabled:opacity-40 disabled:pointer-events-none flex flex-col items-center justify-center gap-1"
                          >
                            <UserCheck className="w-4 h-4" />
                            Je suis arrivé
                          </button>

                          {/* "Mission en cours" button */}
                          <button
                            onClick={() => handleUpdateStatus(m, 'in_progress')}
                            disabled={m.status === 'completed' || m.status === 'absent'}
                            className="p-3 bg-amber-500 hover:bg-amber-600 text-white text-[10.5px] font-black rounded-xl text-center uppercase tracking-wide cursor-pointer transition-transform hover:scale-101 border-none disabled:opacity-40 disabled:pointer-events-none flex flex-col items-center justify-center gap-1"
                          >
                            <Play className="w-4 h-4" />
                            Mission en cours
                          </button>

                          {/* "Mission terminée" button */}
                          <button
                            onClick={() => handleUpdateStatus(m, 'completed')}
                            disabled={m.status === 'planned' || m.status === 'completed' || m.status === 'absent'}
                            className="p-3 bg-slate-800 dark:bg-slate-950 hover:bg-slate-950 dark:hover:bg-slate-900 text-white text-[10.5px] font-black rounded-xl text-center uppercase tracking-wide cursor-pointer transition-transform hover:scale-101 border-none disabled:opacity-40 disabled:pointer-events-none flex flex-col items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Mission terminée
                          </button>

                          {/* "Ajouter résultat" action */}
                          <button
                            onClick={() => {
                              setInputContacts(m.contacts_count || 0);
                              setInputVentesCount(m.ventes_count || 0);
                              setInputMontant(m.montant_vendu || 0);
                              setInputDifficulties(m.difficulties || '');
                              setShowResultsModal(m);
                            }}
                            className="p-3 bg-orange-500 hover:bg-orange-600 text-white text-[10.5px] font-black rounded-xl text-center uppercase tracking-wide cursor-pointer shadow-xs border-none transition-transform hover:scale-101 flex flex-col items-center justify-center gap-1"
                          >
                            <Coins className="w-4 h-4 text-white" />
                            Ajouter résultat
                          </button>
                        </div>

                        {/* If mission completed, render small summary */}
                        {(m.contacts_count > 0 || m.montant_vendu > 0) && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-800 grid grid-cols-3 text-center text-[10.5px] font-mono text-gray-700 dark:text-slate-350 bg-emerald-50/30 dark:bg-emerald-950/10 p-2 rounded-lg">
                            <div>
                              <span className="text-[9px] text-gray-400 dark:text-slate-500 font-sans block font-bold">CONTACTS</span>
                              <span className="font-bold text-gray-950 dark:text-slate-100">{m.contacts_count} pcs</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-400 dark:text-slate-500 font-sans block font-bold">CLIENTS</span>
                              <span className="font-bold text-gray-950 dark:text-slate-100">{m.ventes_count} cmd</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-400 dark:text-slate-500 font-sans block font-bold">C.A VENDU</span>
                              <span className="font-bold text-[#0B5D2A] dark:text-green-400">{m.montant_vendu.toLocaleString()} F</span>
                            </div>
                          </div>
                        )}

                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-xl text-center py-10 transition-colors">
                      <p className="text-xs text-gray-400 dark:text-slate-500 italic">Aucune mission planifiée aujourd'hui pour cet agent.</p>
                      <button
                        onClick={() => {
                          // Simple auto-assign simulation
                          const log: AttendanceLog = {
                            id: `att-dyn-${Date.now()}`,
                            agent_id: selectedAgentId,
                            agent_name: currentAgentObj?.full_name || 'Agent Mobile',
                            agent_code: currentAgentObj?.main_code || 'BOAF-AGT',
                            date: todayDateStr,
                            status: 'planned',
                            start_time_prevu: '08:00',
                            end_time_prevu: '15:00',
                            lieu_precis: 'Lokossa Centre Ville',
                            objectif: 'vente',
                            produits_presentes: ['Double pain sucré'],
                            code_promo_lie: currentAgentObj?.main_code || 'BOAF-CODE',
                            contacts_count: 0,
                            ventes_count: 0,
                            montant_vendu: 0,
                            zone_id: 'z1',
                            zone_name: 'Lokossa Centre'
                          };
                          onAddAttendanceLog(log);
                          alert("Mission rapide créée pour vous !");
                        }}
                        className="mt-3 bg-white dark:bg-slate-900 border border-gray-350 dark:border-slate-800 p-2 py-1.5 text-[10.5px] font-bold text-slate-850 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-center"
                      >
                        S'auto-assigner une mission
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })()}

        </div>

        {/* SECTION 2: LIST OF ALL MISSIONS TODAY (SUPERVISOR/ADMIN TABLE) */}
        <div className="md:col-span-2 bg-white dark:bg-[#0f1a30] p-5 rounded-[28px] border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3 text-left">
            <div>
              <h3 className="font-display font-bold text-[#0B5D2A] dark:text-green-400 text-sm">
                📌 Tableau de passage & Planning du jour
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-slate-450 font-sans mt-0.5">Pour la date d'aujourd'hui : {todayDateStr}</p>
            </div>
            <span className="bg-green-50/10 dark:bg-green-950/20 text-[#0B5D2A] dark:text-green-300 border border-green-200/50 dark:border-green-900/40 rounded-md font-mono text-[10px] uppercase font-bold px-2 py-0.5">
              Active Logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800 text-gray-450 dark:text-slate-400 uppercase font-mono tracking-wider text-[9.5px]">
                  <th className="py-2 px-3">Agent</th>
                  <th className="py-2 px-3">Lieu désigné</th>
                  <th className="py-2 px-3">Horaires</th>
                  <th className="py-2 px-3">Objectif principal</th>
                  <th className="py-2 px-3 text-center">Statut déclaré</th>
                  <th className="py-2 px-3 text-right">Montant Vendu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {activeAgentLogins.length > 0 ? (
                  activeAgentLogins.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-gray-900 dark:text-slate-200 font-sans">
                        {log.agent_name}
                        {log.checkin_at && <span className="block text-[9px] text-[#0B5D2A] dark:text-green-400 font-mono font-medium">Pointé : {log.checkin_at}</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-205">{log.lieu_precis}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-450 dark:text-slate-400">
                        {log.start_time_prevu} - {log.end_time_prevu}
                      </td>
                      <td className="py-3 px-3 text-gray-500 dark:text-slate-400 capitalize">
                        {log.objectif || 'Vente directe'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeStyle(log.status)}`}>
                          {getFrenchStatus(log.status)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-gray-950 dark:text-slate-100 font-mono">
                        {log.montant_vendu > 0 ? `${log.montant_vendu.toLocaleString()} F` : <span className="text-gray-350 dark:text-slate-650 italic font-normal">Néant</span>}
                        {log.contacts_count > 0 && <span className="block text-[9.5px] text-gray-400 dark:text-slate-500 font-normal font-sans">📞 {log.contacts_count} contacts</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 dark:text-slate-500 italic">
                      Aucun agent n'est planifié pour ce jour.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>


      {/* MODAL 1: ADD REPORTING RESULTS BY AGENT */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-xs">
          <div className="bg-white dark:bg-[#121c33] rounded-[28px] w-full max-w-sm overflow-hidden border border-gray-150 dark:border-slate-800 shadow-2xl scale-up text-left flex flex-col max-h-[90vh] transition-colors">
            
            <div className="bg-[#0B5D2A] p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-orange-400" />
                <h3 className="font-display font-black text-md">📝 Saisir les Résultats Terrain</h3>
              </div>
              <button
                onClick={() => setShowResultsModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResults} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Contacts / Numéros collectés (Prospects)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={inputContacts}
                  onChange={(e) => setInputContacts(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none font-mono font-bold text-gray-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Nombre de clients servis (Commandes réalisées)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={inputVentesCount}
                  onChange={(e) => setInputVentesCount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none font-mono font-bold text-gray-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Chiffre d'Affaire réalisé (Montant total vendu F)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={inputMontant}
                  onChange={(e) => setInputMontant(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none text-[#0B5D2A] dark:text-green-400 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Difficultés ou notes observées</label>
                <textarea
                  placeholder="ex. Rupture de pain sucré à 13h, forte pluie..."
                  value={inputDifficulties}
                  onChange={(e) => setInputDifficulties(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-xl focus:outline-none h-20 text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 dark:bg-[#0b5d2a] dark:hover:bg-[#12823c] text-white font-black uppercase text-xs rounded-xl shadow-md border-none cursor-pointer transition-transform hover:scale-101"
              >
                ✓ Enregistrer et terminer la mission
              </button>

            </form>

          </div>
        </div>
      )}


      {/* MODAL 2: NEW MISSION SCHEDULER */}
      {showAddLogModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-xs">
          <div className="bg-white dark:bg-[#121c33] rounded-[28px] w-full max-w-md overflow-hidden border border-gray-150 dark:border-slate-800 shadow-2xl text-left transition-colors">
            
            <div className="bg-[#0B5D2A] p-5 text-white flex justify-between items-center">
              <h3 className="font-display font-black text-md">📅 Planifier une Affectation Terrain</h3>
              <button
                onClick={() => setShowAddLogModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMission} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Agent de terrain à déployer</label>
                <select
                  value={newAgentId}
                  onChange={(e) => setNewAgentId(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#0B5D2A] dark:focus:border-[#12823c]"
                >
                  <option value="" className="dark:bg-slate-900">-- Choisir un agent mobile --</option>
                  {actors.filter(a => a.type_actor === 'agent').map(a => (
                    <option key={a.id} value={a.id} className="dark:bg-slate-900">👤 {a.full_name} ({a.main_code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Date de mission</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Zone générale</label>
                  <select
                    value={newZoneId}
                    onChange={(e) => setNewZoneId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-xl focus:outline-none"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id} className="dark:bg-slate-900">{z.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Heure Départ</label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-xl font-mono text-center animate-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Heure Fin</label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-xl font-mono text-center animate-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Lieu précis d'affectation</label>
                <input
                  type="text"
                  required
                  placeholder="ex. École Primaire de Lokossa, Marché Centrale de Djougou"
                  value={newLieu}
                  onChange={(e) => setNewLieu(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 font-medium rounded-xl focus:outline-none focus:border-[#0B5D2A] dark:focus:border-[#12823c]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Objectif / Mission prioritaire</label>
                <select
                  value={newObjectif}
                  onChange={(e) => setNewObjectif(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-xl focus:outline-none"
                >
                  <option value="vente" className="dark:bg-slate-900">Vente directe de pains & goûters</option>
                  <option value="distribution de prospectus" className="dark:bg-slate-900">Distribution active de prospectus</option>
                  <option value="collecte de contacts" className="dark:bg-slate-900">Proposition & collecte de prospects</option>
                  <option value="promotion d’un produit" className="dark:bg-slate-900">Promotion d'une nouvelle offre locale</option>
                  <option value="suivi partenaire" className="dark:bg-slate-900">Suivi des comptes partenaires</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-4 bg-[#0B5D2A] hover:bg-[#12823c] text-white font-black uppercase text-xs rounded-xl shadow-md cursor-pointer transition-transform hover:scale-101 border-none"
              >
                Planifier la mission
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
