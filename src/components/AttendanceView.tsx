import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  User,
  Compass,
  Check,
  AlertCircle
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
  
  // States for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingLog, setEditingLog] = useState<AttendanceLog | null>(null);

  // Form fields
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [missionDate, setMissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [missionDescription, setMissionDescription] = useState('');
  const [arrivalTime, setArrivalTime] = useState('08:00');
  const [departureTime, setDepartureTime] = useState('16:00');
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id || '');
  const [logStatus, setLogStatus] = useState<AttendanceStatus>('planned');

  // Open modal for creating a new presence record
  const handleOpenCreateModal = () => {
    setEditingLog(null);
    setSelectedAgentId(actors.filter(a => a.type_actor === 'agent')[0]?.id || '');
    setMissionDate(new Date().toISOString().split('T')[0]);
    setMissionDescription('Vente directe de pains & goûters');
    setArrivalTime('08:00');
    setDepartureTime('16:00');
    setSelectedZoneId(zones[0]?.id || '');
    setLogStatus('planned');
    setShowFormModal(true);
  };

  // Open modal for editing an existing presence record
  const handleOpenEditModal = (log: AttendanceLog) => {
    setEditingLog(log);
    setSelectedAgentId(log.agent_id);
    setMissionDate(log.date);
    setMissionDescription(log.objectif || '');
    setArrivalTime(log.checkin_at || log.start_time_prevu || '08:00');
    setDepartureTime(log.checkout_at || log.end_time_prevu || '16:00');
    setSelectedZoneId(log.zone_id);
    setLogStatus(log.status);
    setShowFormModal(true);
  };

  // Submit form (create or update)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId || !missionDescription) {
      alert("Veuillez remplir tous les champs requis.");
      return;
    }

    const matchedAgent = actors.find(a => a.id === selectedAgentId);
    const matchedZone = zones.find(z => z.id === selectedZoneId);

    if (editingLog) {
      // Update
      const updatedLog: AttendanceLog = {
        ...editingLog,
        agent_id: selectedAgentId,
        agent_name: matchedAgent?.full_name || editingLog.agent_name,
        agent_code: matchedAgent?.main_code || editingLog.agent_code,
        date: missionDate,
        objectif: missionDescription,
        checkin_at: arrivalTime,
        checkout_at: departureTime,
        zone_id: selectedZoneId,
        zone_name: matchedZone?.nom || editingLog.zone_name,
        status: logStatus
      };
      onUpdateAttendanceLog(updatedLog);
    } else {
      // Create
      const newLog: AttendanceLog = {
        id: `att-${Date.now()}`,
        agent_id: selectedAgentId,
        agent_name: matchedAgent?.full_name || 'Agent Terrain',
        agent_code: matchedAgent?.main_code || 'BOAF-AGT',
        date: missionDate,
        status: logStatus,
        objectif: missionDescription,
        checkin_at: arrivalTime,
        checkout_at: departureTime,
        zone_id: selectedZoneId,
        zone_name: matchedZone?.nom || 'Lokossa Centre'
      };
      onAddAttendanceLog(newLog);
    }

    setShowFormModal(false);
  };

  // Delete a presence log (by updating status to absent or removing if needed, here we just set status to absent)
  const handleDeleteLog = (log: AttendanceLog) => {
    if (confirm("Voulez-vous annuler/supprimer cette fiche de présence ?")) {
      const updated: AttendanceLog = {
        ...log,
        status: 'absent'
      };
      onUpdateAttendanceLog(updated);
    }
  };

  // Simple direct state transition from the card UI
  const handleQuickStatusChange = (log: AttendanceLog, nextStatus: AttendanceStatus) => {
    const updated: AttendanceLog = {
      ...log,
      status: nextStatus
    };
    onUpdateAttendanceLog(updated);
  };

  // Translate status label into French
  const getFrenchStatus = (status: AttendanceStatus) => {
    switch (status) {
      case 'planned': return 'Prévu';
      case 'arrived': return 'Arrivé';
      case 'in_progress': return 'En Cours';
      case 'completed': return 'Terminé';
      case 'absent': return 'Absent';
      default: return 'Inconnu';
    }
  };

  // Get color badges for statuses
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'planned': return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'arrived': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/50';
      case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/50';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50';
      case 'absent': return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/50';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // Filter logs by date (focusing on latest entries) and search/status filters
  const sortedLogs = [...attendanceLogs].sort((a, b) => b.date.localeCompare(a.date));
  const filteredLogs = sortedLogs.filter(log => {
    const matchesSearch = log.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.objectif || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.zone_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate high level simplified metrics
  const totalActive = sortedLogs.filter(log => log.status !== 'absent').length;
  const countArrived = sortedLogs.filter(log => log.status === 'arrived' || log.status === 'in_progress').length;
  const countCompleted = sortedLogs.filter(log => log.status === 'completed').length;

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121c33] p-6 rounded-3xl border border-gray-150 dark:border-slate-800 transition-colors shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black font-display text-gray-900 dark:text-white uppercase tracking-tight">
              Présences de Terrain & Horaires
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed max-w-2xl">
            Suivez en toute simplicité les heures d'arrivée et de départ effectives de vos agents mobiles, ainsi que l'objectif de leur mission de la journée.
          </p>
        </div>

        {currentRole !== 'lecteur' && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[#0B5D2A] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer self-start shadow-md hover:scale-[1.02] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Déclarer une Présence
          </button>
        )}
      </div>

      {/* Simplified Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#121c33] p-4 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-3xs flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Missions de terrain</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white font-mono">{totalActive}</span>
            <span className="text-[10px] text-gray-400 font-semibold">Déclarées</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121c33] p-4 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-3xs flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Actuellement Sur Place</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-500 font-mono">{countArrived}</span>
            <span className="text-[10px] text-gray-400 font-semibold">En mission</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121c33] p-4 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-3xs flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Missions Terminées</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{countCompleted}</span>
            <span className="text-[10px] text-gray-400 font-semibold">Clôturées</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-[#121c33] p-3.5 rounded-2xl border border-gray-150 dark:border-slate-800 flex flex-col md:flex-row gap-3 shadow-3xs">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par agent, mission, ou secteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-white placeholder-gray-450 dark:placeholder-slate-550 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-white rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-bold"
          >
            <option value="all">Tous les statuts</option>
            <option value="planned">Prévu</option>
            <option value="arrived">Arrivé sur place</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
            <option value="absent">Absent / Annulé</option>
          </select>
        </div>
      </div>

      {/* Simplified Presence Log Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredLogs.map((log) => (
            <motion.div
              layout
              key={log.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#121c33] p-5 rounded-3xl border border-gray-150 dark:border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-4 shadow-3xs"
            >
              {/* Agent info & Action menu header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-[#0B5D2A] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center font-bold text-sm shrink-0 font-sans">
                    {log.agent_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                      {log.agent_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[9px] text-gray-400 font-bold uppercase">
                        {log.agent_code}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">•</span>
                      <span className="text-[10px] text-gray-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                        <MapPin className="w-3 h-3 text-orange-500" /> {log.zone_name || 'Lokossa'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${getStatusColor(log.status)}`}>
                    {getFrenchStatus(log.status)}
                  </span>
                  {currentRole !== 'lecteur' && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(log)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Modifier la fiche"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteLog(log)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        title="Annuler/Absent"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Core Mission Section */}
              <div className="bg-gray-50 dark:bg-slate-950/30 p-3 rounded-2xl border border-gray-100 dark:border-slate-850 space-y-2">
                <div className="text-left">
                  <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-wider">Mission d'aujourd'hui</span>
                  <p className="text-xs font-bold text-gray-800 dark:text-slate-200 mt-0.5 leading-snug">
                    {log.objectif || "Vente et distribution de pains"}
                  </p>
                </div>

                {/* Arrival & Departure Hours block (Simple, highlighted design) */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-slate-800/60 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-[#0B5D2A] dark:text-emerald-400 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-gray-400 block font-bold">Heure Arrivée</span>
                      <span className="text-xs font-black font-mono text-gray-900 dark:text-white">
                        {log.checkin_at || log.start_time_prevu || '--:--'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-gray-400 block font-bold">Heure Sortie</span>
                      <span className="text-xs font-black font-mono text-gray-900 dark:text-white">
                        {log.checkout_at || log.end_time_prevu || '--:--'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inline Interactive Status Update Quick Actions */}
              {currentRole !== 'lecteur' && (
                <div className="pt-1">
                  <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                    Changer rapidement le statut de présence :
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {(['planned', 'arrived', 'in_progress', 'completed'] as AttendanceStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleQuickStatusChange(log, st)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all active:scale-95 ${
                          log.status === st
                            ? 'bg-[#0B5D2A] text-white border-emerald-600 dark:bg-emerald-650'
                            : 'bg-white hover:bg-slate-50 border-gray-200 text-gray-500 dark:bg-[#121c33] dark:border-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {getFrenchStatus(st)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredLogs.length === 0 && (
          <div className="col-span-full bg-white dark:bg-[#121c33] p-12 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-slate-400 italic">
              Aucune fiche de présence ne correspond aux critères de recherche actuels.
            </p>
          </div>
        )}
      </div>

      {/* FORM MODAL: DECLARE OR MODIFY A DEPLOYMENT PRESENCE */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c33] border border-gray-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative text-left transition-colors">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute right-4 top-4 p-1 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-400 rounded-lg cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black uppercase text-gray-900 dark:text-white tracking-wide mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              {editingLog ? 'Modifier la Fiche de Présence' : 'Déclarer une Présence Terrain'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
              Enregistrez ou ajustez les heures de présence de l'agent mobile et sa mission de la journée.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-gray-850 dark:text-slate-150">
              
              {/* Agent Picker */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500">Agent terrain concerné</label>
                <select
                  disabled={!!editingLog}
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                >
                  {actors.filter(a => a.type_actor === 'agent').map(a => (
                    <option key={a.id} value={a.id}>👤 {a.full_name} ({a.main_code || 'Sans code'})</option>
                  ))}
                </select>
              </div>

              {/* Date & Sector */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500">Date</label>
                  <input
                    type="date"
                    required
                    value={missionDate}
                    onChange={(e) => setMissionDate(e.target.value)}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500">Secteur / Zone</label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mission input */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500">Mission ou Objectif</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vente directe de pains sucrés au grand marché"
                  value={missionDescription}
                  onChange={(e) => setMissionDescription(e.target.value)}
                  className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Arrival and Departure Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500">Heure d'Arrivée</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 07:45 ou 08:00"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-mono font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500">Heure de Sortie</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 15:30 ou 16:00"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-mono font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Status picker */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500">Statut de la mission</label>
                <select
                  value={logStatus}
                  onChange={(e) => setLogStatus(e.target.value as AttendanceStatus)}
                  className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="planned">Prévu</option>
                  <option value="arrived">Arrivé sur place</option>
                  <option value="in_progress">En mission cours</option>
                  <option value="completed">Terminé / Clôturé</option>
                  <option value="absent">Absent / Annulé</option>
                </select>
              </div>

              {/* Modal buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B5D2A] hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                >
                  {editingLog ? 'Enregistrer les modifications' : 'Déclarer la présence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
