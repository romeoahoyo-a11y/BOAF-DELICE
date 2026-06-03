import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Smartphone,
  Navigation,
  FileSpreadsheet,
  PhoneCall,
  Notebook,
  UserCheck,
  ShieldCheck,
  Download
} from 'lucide-react';
import { AttendanceLog, Actor, Zone, AttendanceStatus } from '../types';

interface AttendanceViewProps {
  attendanceLogs: AttendanceLog[];
  actors: Actor[];
  zones: Zone[];
  onAddAttendanceLog: (log: AttendanceLog) => void;
  onUpdateAttendanceLog: (log: AttendanceLog) => void;
  currentRole: string; // admin, superviseur, agent
}

// Haversine formulas to compute real-world metric distances
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

export default function AttendanceView({
  attendanceLogs,
  actors,
  zones,
  onAddAttendanceLog,
  onUpdateAttendanceLog,
  currentRole
}: AttendanceViewProps) {
  
  // Mobile simulator reactive state controls
  const [selectedSimAgentId, setSelectedSimAgentId] = useState(actors.find(a => a.type_actor === 'agent')?.id || '');
  const [selectedSimZoneId, setSelectedSimZoneId] = useState(zones[0]?.id || '');
  const [simNote, setSimNote] = useState('');
  const [simPhoto, setSimPhoto] = useState('https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&h=100&fit=crop');
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [simStatusMsg, setSimStatusMsg] = useState('');

  // Daily supervisor filters
  const [filterZone, setFilterZone] = useState('all');
  const [filterDate, setFilterDate] = useState('2026-06-03'); // Context today is June 3rd

  const terrainAgents = actors.filter(a => a.type_actor === 'agent');

  // Filter logs for the main workspace grid
  const filteredLogs = attendanceLogs.filter(log => {
    // filter by date
    if (filterDate && log.date !== filterDate) return false;
    // filter by zone
    if (filterZone !== 'all' && log.zone_id !== filterZone) return false;
    return true;
  });

  // Calculate high performance counts
  const countPresent = filteredLogs.filter(l => l.status === 'present').length;
  const countMission = filteredLogs.filter(l => l.status === 'on_mission').length;
  const countLate = filteredLogs.filter(l => l.status === 'late').length;
  const countOutOfZone = filteredLogs.filter(l => l.status === 'out_of_zone').length;
  const countNotClosed = filteredLogs.filter(l => l.status === 'not_closed').length;
  const countAbsent = Math.max(0, terrainAgents.length - filteredLogs.length);

  // Trigger browser High-Precision GPS or Fallback mock
  const handleSimulateCheckin = () => {
    setIsLoadingGPS(true);
    setSimStatusMsg('Recherche du signal GPS satellite...');

    const agent = actors.find(a => a.id === selectedSimAgentId);
    const zone = zones.find(z => z.id === selectedSimZoneId);

    if (!agent || !zone) {
      setSimStatusMsg('Veuillez configurer un agent et une zone valide.');
      setIsLoadingGPS(false);
      return;
    }

    // Geolocation API check
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const accuracy = position.coords.accuracy || 10;
          processCheckin(userLat, userLng, accuracy, agent, zone);
        },
        (error) => {
          console.warn('GPS browser error, starting fallback mock coordinates alignment', error);
          // Fallback coordinates directly in Lokossa territory (z1 to z5)
          const fallbackLat = zone.latitude + (Math.random() - 0.5) * 0.005;
          const fallbackLng = zone.longitude + (Math.random() - 0.5) * 0.005;
          processCheckin(fallbackLat, fallbackLng, 15, agent, zone);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      // Direct fallback
      const fallbackLat = zone.latitude;
      const fallbackLng = zone.longitude;
      processCheckin(fallbackLat, fallbackLng, 20, agent, zone);
    }
  };

  const processCheckin = (lat: number, lng: number, accuracy: number, agent: Actor, zone: Zone) => {
    // 1. Calculate distance in meters using Haversine formula
    const distanceM = getDistanceMeters(lat, lng, zone.latitude, zone.longitude);
    const isWithinRadius = distanceM <= zone.rayon_metre;

    // 2. Decide status : present or out_of_zone (Hors zone)
    let finalStatus: AttendanceStatus = isWithinRadius ? 'present' : 'out_of_zone';
    
    // Check if late (mock hours: checkin after 08:30)
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    if (finalStatus === 'present' && (currentHour > 8 || (currentHour === 8 && currentMin > 30))) {
      finalStatus = 'late';
    }

    // 3. Create fresh attendance record
    const newLog: AttendanceLog = {
      id: `att-sim-${Date.now()}`,
      agent_id: agent.id,
      agent_name: agent.full_name,
      agent_code: agent.main_code,
      date: '2026-06-03', // default simulated context date
      checkin_at: new Date().toISOString(),
      lat_in: lat,
      lng_in: lng,
      accuracy_m: Math.round(accuracy),
      status: finalStatus,
      zone_id: zone.id,
      zone_name: zone.nom,
      note: simNote || 'Check-in depuis le simulateur mobile terrain',
      photo_url: simPhoto
    };

    onAddAttendanceLog(newLog);
    setIsLoadingGPS(false);
    
    // Construct user friendly feedback
    const distanceText = isWithinRadius 
      ? `Vous êtes dans la zone ${zone.nom} (Écart: ${Math.round(distanceM)}m).` 
      : `HORS ZONE ! Écart de ${Math.round(distanceM)}m de ${zone.nom} (Rayon max autorisé: ${zone.rayon_metre}m).`;
    
    setSimStatusMsg(`Check-in réussi ! Statut : ${finalStatus.toUpperCase()}. ${distanceText}`);
    setSimNote('');
  };

  // Simulates Agent checkout/clockout
  const handleSimulateCheckout = (logId: string) => {
    const existingLog = attendanceLogs.find(l => l.id === logId);
    if (!existingLog) return;

    const updatedLog: AttendanceLog = {
      ...existingLog,
      checkout_at: new Date().toISOString(),
      lat_out: existingLog.lat_in + 0.0002, // slightly shifted
      lng_out: existingLog.lng_in - 0.0001
    };

    // If it was of status 'not_closed', update status to present/late
    if (updatedLog.status === 'not_closed') {
      updatedLog.status = 'present';
    }

    onUpdateAttendanceLog(updatedLog);
    setSimStatusMsg(`Check-out réussi pour le ticket ${existingLog.agent_name} ! Fin de service enregistrée.`);
  };

  // Trigger approval validation of attendance logs by direction / supervisor
  const handleValidateLog = (log: AttendanceLog, targetStatus: AttendanceStatus) => {
    const updated = { ...log, status: targetStatus };
    onUpdateAttendanceLog(updated);
    alert(`Rapport de présence de ${log.agent_name} mis à jour en statut : ${targetStatus}`);
  };

  // Export Daily log table to CSV download
  const exportLogsToCSV = () => {
    let headers = 'ID,Agent,Code,Date,CheckIn,CheckOut,Zone,Statut,Ecart Position,Note\n';
    const csvContent = filteredLogs.map(l => {
      return `"${l.id}","${l.agent_name}","${l.agent_code}","${l.date}","${l.checkin_at}","${l.checkout_at || 'En cours'}","${l.zone_name}","${l.status}",${l.accuracy_m},"${l.note || ''}"`;
    }).join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `boaf_delices_presences_${filterDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Upper screen stats KPIs summary */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <span className="text-[10px] text-gray-400 block font-mono uppercase">Présents</span>
          <span className="text-xl font-bold font-display text-green-600 block mt-1">{countPresent}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <span className="text-[10px] text-gray-400 block font-mono uppercase">En Mission</span>
          <span className="text-xl font-bold font-display text-orange-500 block mt-1">{countMission}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <span className="text-[10px] text-gray-400 block font-mono uppercase">En retard</span>
          <span className="text-xl font-bold font-display text-amber-500 block mt-1">{countLate}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center animate-pulse">
          <span className="text-[10px] text-gray-400 block font-mono uppercase">Hors Zone</span>
          <span className="text-xl font-bold font-display text-red-600 block mt-1">{countOutOfZone}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <span className="text-[10px] text-gray-400 block font-mono uppercase">Non Clôturés</span>
          <span className="text-xl font-bold font-display text-sky-600 block mt-1">{countNotClosed}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <span className="text-[10px] text-gray-400 block font-mono uppercase">Absents</span>
          <span className="text-xl font-bold font-display text-gray-500 block mt-1">{countAbsent}</span>
        </div>
      </div>

      {/* Main dashboard body: split into (Supervisor Control lists) & (Agent Mobile View Simulator) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left pane: Supervisor Control lists */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              {/* Date selection for day view */}
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4 text-orange-500" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-slate-50 border border-gray-200 py-1.5 px-3 rounded-lg text-xs font-bold"
                />
              </div>

              {/* Zone Filter */}
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="text-xs bg-slate-50 border border-gray-200 py-1.5 px-3 rounded-lg focus:outline-none cursor-pointer font-bold text-gray-600"
              >
                <option value="all">Secteurs géographiques</option>
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.nom}</option>
                ))}
              </select>
            </div>

            <button
              onClick={exportLogsToCSV}
              className="px-4 py-1.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg font-semibold cursor-pointer hover:bg-emerald-100 transition-all flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Rapport de Présence (.CSV)
            </button>
          </div>

          {/* Daily Table Log */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs text-left">
            <h4 className="font-display font-extrabold text-[#0B5D2A] text-base mb-4">
              Journal quotidien d'émissions de présence (Monos / Couffo)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-150 text-gray-400 font-mono uppercase tracking-wider">
                    <th className="pb-3 text-left">Agent</th>
                    <th className="pb-3 text-center">Zone attendue</th>
                    <th className="pb-3 text-center">Check-In</th>
                    <th className="pb-3 text-center">Check-Out</th>
                    <th className="pb-3 text-center">Distance GPS</th>
                    <th className="pb-3 text-center">Statut</th>
                    <th className="pb-3 text-center w-20">Actions admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => {
                      const age = actors.find(a => a.id === log.agent_id);
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 text-left">
                            <div className="flex items-center gap-2">
                              {log.photo_url ? (
                                <img src={log.photo_url} alt="agent" className="w-6 h-6 rounded-full border shrink-0 object-cover" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-100 font-bold shrink-0 text-gray-400 flex items-center justify-center">?</div>
                              )}
                              <div>
                                <p className="font-bold text-gray-800">{log.agent_name}</p>
                                <span className="text-[10px] text-gray-400 font-mono">{log.agent_code}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-center text-gray-650 font-semibold">{log.zone_name}</td>
                          <td className="py-3 text-center font-mono text-gray-500">
                            {log.checkin_at ? new Date(log.checkin_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) : '--'}
                          </td>
                          <td className="py-3 text-center font-mono text-gray-500">
                            {log.checkout_at ? (
                              new Date(log.checkout_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})
                            ) : log.status === 'not_closed' ? (
                              <button
                                onClick={() => handleSimulateCheckout(log.id)}
                                className="px-1.5 py-0.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100 rounded-sm font-bold text-[9px] cursor-pointer"
                              >
                                Clôturer now
                              </button>
                            ) : (
                              <span className="text-gray-300 italic">En service</span>
                            )}
                          </td>
                          <td className="py-3 text-center font-mono text-slate-500 font-bold">
                            {log.accuracy_m ? `±${log.accuracy_m} m` : 'Inconnu'}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              log.status === 'present'
                                ? 'bg-green-100 text-green-700'
                                : log.status === 'late'
                                ? 'bg-amber-100 text-amber-700'
                                : log.status === 'out_of_zone'
                                ? 'bg-red-100 text-red-700 animate-pulse'
                                : 'bg-sky-150 text-sky-700'
                            }`}>
                              {log.status === 'out_of_zone' ? 'Hors zone' : log.status}
                            </span>
                            {log.note && (
                              <p className="text-[9px] text-gray-400 italic max-w-[140px] truncate text-center mx-auto" title={log.note}>
                                "{log.note}"
                              </p>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex gap-1 justify-center">
                              {log.status === 'out_of_zone' && (
                                <button
                                  onClick={() => handleValidateLog(log, 'present')}
                                  title="Forcer validation présent (Dérogation)"
                                  className="w-5 h-5 bg-green-50 text-green-600 border border-green-200 rounded-sm flex items-center justify-center hover:bg-green-100 cursor-pointer text-[10px] font-bold"
                                >
                                  ✓
                                </button>
                              )}
                              <a
                                href={`tel:${age?.phone || ''}`}
                                title="Appeler l'agent"
                                className="w-5 h-5 bg-sky-50 text-sky-600 border border-sky-200 rounded-sm flex items-center justify-center hover:bg-sky-100"
                              >
                                <PhoneCall className="w-3 h-3" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400 italic font-sans">
                        Aucun check-in d'agent enregistré pour ce jour de service.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right pane: Operational Mobile View Simulator outlines */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-[38px] p-4 shadow-2xl relative border-8 border-gray-800">
            
            {/* Speaker and Camera visual overlays */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-gray-800 rounded-full z-20 flex justify-center items-center">
              <span className="w-8 h-1 bg-gray-700 rounded-xs" />
              <span className="w-2.5 h-2.5 bg-gray-900 rounded-full ml-3" />
            </div>

            {/* Simulated Phone screen Area */}
            <div className="bg-[#F8FAFC] rounded-[28px] overflow-hidden min-h-[500px] text-left flex flex-col justify-between p-4 pt-10 font-sans text-xs border border-gray-950">
              
              {/* Phone Header panel */}
              <div className="border-b border-gray-200 pb-3 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-400 font-mono text-[9px]">
                  <Smartphone className="w-4 h-4 text-orange-500" />
                  <span>GPS SIMULATOR OS</span>
                </div>
                <span className="text-[9px] bg-red-100 text-red-700 font-bold uppercase px-2 py-0.5 rounded-md">
                  VUE AGENT MOBILE
                </span>
              </div>

              {/* Form entries for simulator */}
              <div className="flex-1 space-y-4">
                
                {/* 1. Pick Agent */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 block text-[10px] uppercase">1. Sélectionner mon profil Agent</label>
                  <select
                    value={selectedSimAgentId}
                    onChange={(e) => setSelectedSimAgentId(e.target.value)}
                    className="w-full p-2 border border-gray-200 bg-white rounded-xl focus:outline-none"
                  >
                    {terrainAgents.map(a => (
                      <option key={a.id} value={a.id}>{a.full_name} ({a.main_code})</option>
                    ))}
                  </select>
                </div>

                {/* 2. Choose Zone target */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 block text-[10px] uppercase">2. Ma Zone d'Opérations du jour</label>
                  <select
                    value={selectedSimZoneId}
                    onChange={(e) => setSelectedSimZoneId(e.target.value)}
                    className="w-full p-2 border border-gray-200 bg-white rounded-xl focus:outline-none"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.nom} - Rayon {z.rayon_metre}m</option>
                    ))}
                  </select>
                </div>

                {/* 3. Notes and photo upload simulation */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 block text-[10px] uppercase">3. Message / Note d'activité</label>
                  <input
                    type="text"
                    placeholder="Note de démarrage (ex. vélo garni...)"
                    value={simNote}
                    onChange={(e) => setSimNote(e.target.value)}
                    className="w-full p-2 border border-gray-200 bg-white rounded-xl text-xs focus:outline-none"
                  />
                </div>

                {/* 4. Photo avatar select mockup */}
                <div className="space-y-1 text-left">
                  <label className="font-bold text-gray-650 block text-[10px] uppercase">4. Photo de Présence Facultative</label>
                  <div className="flex gap-2.5 items-center">
                    <img src={simPhoto} alt="preset" className="w-10 h-10 rounded-xl object-cover border-2 border-orange-500" />
                    <select
                      value={simPhoto}
                      onChange={(e) => setSimPhoto(e.target.value)}
                      className="flex-1 p-1.5 border border-gray-200 bg-white rounded-lg text-[10px]"
                    >
                      <option value="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&h=100&fit=crop">Kiosque BOAF Lokossa (Déjeuner)</option>
                      <option value="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop">Cycliste avec sacoche thermique</option>
                      <option value="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop">Kiosque Agamé principal</option>
                    </select>
                  </div>
                </div>

                {/* Action button trigger check-in */}
                <button
                  type="button"
                  disabled={isLoadingGPS}
                  onClick={handleSimulateCheckin}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl uppercase font-display tracking-wider shadow-md text-xs mt-4 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Navigation className="w-4 h-4 animate-spin shrink-0" style={{ animationDuration: isLoadingGPS ? '1.5s' : '0s' }} />
                  {isLoadingGPS ? 'Vérification GPS...' : 'Déclarer Ma Présence (Check-In)'}
                </button>
              </div>

              {/* Status and instruction console display */}
              {simStatusMsg && (
                <div className="bg-slate-900 text-green-400 p-3 rounded-xl font-mono text-[9px] mt-4 leading-normal text-left border border-slate-950">
                  <span className="text-orange-400 block font-bold text-[10px] mb-0.5">📟 SYSTEM RESPONSE LOGS :</span>
                  {simStatusMsg}
                </div>
              )}

              <div className="text-[9px] text-gray-400 text-center mt-3 font-sans pt-2 border-t border-gray-150">
                BOAF Mobile Tracker Platform • Licence locale v1.0
              </div>
            </div>

            {/* Home button visual mockup */}
            <div className="w-10 h-10 rounded-full border border-gray-700 bg-gray-850 hover:bg-gray-800 mx-auto mt-3 shadow-md z-10 flex items-center justify-center cursor-pointer">
              <span className="w-3.5 h-3.5 border border-gray-600 rounded-sm" />
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
