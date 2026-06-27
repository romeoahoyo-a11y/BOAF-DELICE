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
  AlertCircle,
  Users,
  Percent,
  Briefcase,
  Activity,
  Award
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
  const totalMissions = sortedLogs.length;
  const totalActive = sortedLogs.filter(log => log.status !== 'absent').length;
  const countArrived = sortedLogs.filter(log => log.status === 'arrived' || log.status === 'in_progress').length;
  const countCompleted = sortedLogs.filter(log => log.status === 'completed').length;
  const countPlanned = sortedLogs.filter(log => log.status === 'planned').length;
  const countAbsent = sortedLogs.filter(log => log.status === 'absent').length;
  
  const attendanceRate = totalMissions > 0 
    ? Math.round(((totalMissions - countAbsent) / totalMissions) * 100) 
    : 100;

  // Active zones count
  const activeZones = Array.from(new Set(sortedLogs.map(l => l.zone_name).filter(Boolean)));

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121c33] p-6 rounded-3xl border border-gray-150 dark:border-slate-800 transition-colors shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-[#0B5D2A]/10 text-[#0B5D2A] dark:text-emerald-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black font-display text-gray-900 dark:text-white uppercase tracking-tight">
              Présences de Terrain & Horaires
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed max-w-2xl">
            Suivez en toute simplicité les heures d'arrivée et de départ de vos agents mobiles, ainsi que l'avancement de leurs missions quotidiennes.
          </p>
        </div>

        {currentRole !== 'lecteur' && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[#0B5D2A] hover:bg-[#07471E] text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer self-start shadow-md hover:scale-[1.02] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Déclarer une Présence
          </button>
        )}
      </div>

      {/* MINI DASHBOARD PRO */}
      <div className="bg-white dark:bg-[#121c33] p-5 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0B5D2A]" />
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Mini-Dashboard de Présence Pro
            </h3>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            Mise à jour en temps réel
          </span>
        </div>

        {/* 4 KPIs grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div className="p-4 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border border-gray-100 dark:border-slate-850 flex items-center gap-3.5">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/30 text-[#0B5D2A] dark:text-emerald-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Total Agents</span>
              <span className="text-xl font-black text-gray-900 dark:text-white font-mono">{totalMissions}</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="p-4 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border border-gray-100 dark:border-slate-850 flex items-center gap-3.5">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Sur le terrain</span>
              <span className="text-xl font-black text-amber-500 font-mono">{countArrived}</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="p-4 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border border-gray-100 dark:border-slate-850 flex items-center gap-3.5">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Missions Clôturées</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{countCompleted}</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="p-4 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border border-gray-100 dark:border-slate-850 flex items-center gap-3.5">
            <div className="p-3 bg-[#0B5D2A]/10 text-[#0B5D2A] dark:text-emerald-400 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Taux de Présence</span>
              <span className="text-xl font-black text-gray-900 dark:text-white font-mono">{attendanceRate}%</span>
            </div>
          </div>
        </div>

        {/* Breakdown bar and active zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Status Distribution */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">
              Répartition opérationnelle des présences
            </span>
            <div className="h-2.5 w-full bg-gray-150 dark:bg-slate-800 rounded-full overflow-hidden flex">
              {countPlanned > 0 && (
                <div 
                  style={{ width: `${(countPlanned / totalMissions) * 100}%` }} 
                  className="bg-gray-400 h-full" 
                  title={`Prévus: ${countPlanned}`} 
                />
              )}
              {countArrived > 0 && (
                <div 
                  style={{ width: `${(countArrived / totalMissions) * 100}%` }} 
                  className="bg-amber-500 h-full" 
                  title={`Sur le terrain/En Cours: ${countArrived}`} 
                />
              )}
              {countCompleted > 0 && (
                <div 
                  style={{ width: `${(countCompleted / totalMissions) * 100}%` }} 
                  className="bg-emerald-500 h-full" 
                  title={`Terminés: ${countCompleted}`} 
                />
              )}
              {countAbsent > 0 && (
                <div 
                  style={{ width: `${(countAbsent / totalMissions) * 100}%` }} 
                  className="bg-rose-500 h-full" 
                  title={`Absents: ${countAbsent}`} 
                />
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-semibold text-gray-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-gray-400 shrink-0"></span>
                <span>Prévu ({countPlanned})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 shrink-0"></span>
                <span>Sur le terrain ({countArrived})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0"></span>
                <span>Terminé ({countCompleted})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 shrink-0"></span>
                <span>Absent ({countAbsent})</span>
              </div>
            </div>
          </div>

          {/* Quick Stats on Sectors */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">
              Secteurs et zones de déploiement actifs
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeZones.map((zone, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 rounded-lg border border-gray-200/50 dark:border-slate-800">
                  <MapPin className="w-3 h-3 text-orange-500" />
                  {zone}
                </span>
              ))}
              {activeZones.length === 0 && (
                <span className="text-xs text-gray-400 italic">Aucun secteur actif actuellement</span>
              )}
            </div>
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

      {/* PRESENCE LOGS LIST VIEW */}
      <div className="bg-white dark:bg-[#121c33] rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Mobile Grid Warning & Desktop Header */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30">
                <th className="py-4 px-5 text-[10px] font-black uppercase text-gray-400 tracking-wider">Agent</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Zone / Secteur</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Horaires de Mission</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Objectif quotidien</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Statut de Présence</th>
                <th className="py-4 px-5 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr 
                  key={log.id} 
                  className="border-b border-gray-50 dark:border-slate-900 hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-all"
                >
                  {/* AGENT IDENTITY */}
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-300">
                        {log.agent_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-gray-900 dark:text-white leading-snug">
                          {log.agent_name}
                        </div>
                        <div className="font-mono text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                          {log.agent_code}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* ZONE / SECTEUR */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-700 dark:text-slate-300 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      {log.zone_name || 'Lokossa Centre'}
                    </span>
                  </td>

                  {/* HORAIRES EFFECTIFS */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-800 dark:text-slate-200 font-mono">
                        <Clock className="w-3 h-3 text-emerald-500" />
                        <span className="font-semibold">{log.checkin_at || log.start_time_prevu || '--:--'}</span>
                        <span className="text-gray-400 font-sans text-[10px]">à</span>
                        <span className="font-semibold">{log.checkout_at || log.end_time_prevu || '--:--'}</span>
                      </div>
                      <div className="text-[9px] text-gray-400 font-semibold flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 text-gray-400" />
                        {log.date}
                      </div>
                    </div>
                  </td>

                  {/* CORE MISSION OBJECTIVE */}
                  <td className="py-3 px-4 max-w-[200px]">
                    <div className="text-xs font-medium text-gray-600 dark:text-slate-300 line-clamp-2" title={log.objectif}>
                      {log.objectif || "Distribution et prospection commerciale"}
                    </div>
                  </td>

                  {/* STATUS SELECTOR OR BADGE */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1.5">
                      {/* Current Status Badge */}
                      <span className={`inline-flex self-start px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${getStatusColor(log.status)}`}>
                        {getFrenchStatus(log.status)}
                      </span>
                      
                      {/* Interactive inline quick select */}
                      {currentRole !== 'lecteur' && (
                        <select
                          value={log.status}
                          onChange={(e) => handleQuickStatusChange(log, e.target.value as AttendanceStatus)}
                          className="py-1 px-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-[10px] text-gray-700 dark:text-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold max-w-[120px] cursor-pointer"
                        >
                          <option value="planned">Prévu</option>
                          <option value="arrived">Arrivé</option>
                          <option value="in_progress">En Cours</option>
                          <option value="completed">Terminé</option>
                          <option value="absent">Absent</option>
                        </select>
                      )}
                    </div>
                  </td>

                  {/* EDIT & ANNULER ACTIONS */}
                  <td className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {currentRole !== 'lecteur' ? (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(log)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-400 hover:text-[#0B5D2A] dark:hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                            title="Modifier la fiche"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLog(log)}
                            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            title="Déclarer absent / Annuler"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Lecture seule</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="bg-white dark:bg-[#121c33] p-12 text-center">
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
