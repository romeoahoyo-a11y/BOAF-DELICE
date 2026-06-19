import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ActorsView from './components/ActorsView';
import SalesView from './components/SalesView';
import PromoCodesView from './components/PromoCodesView';
import AttendanceView from './components/AttendanceView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import ProductsCatalogView from './components/ProductsCatalogView';

import { getStoredData, saveToStoredData, DEFAULT_ZONES, DEFAULT_ACTORS, DEFAULT_PRODUCTS, DEFAULT_PROMO_CODES, DEFAULT_ORDERS, DEFAULT_COMMISSIONS, DEFAULT_ATTENDANCE_LOGS, DEFAULT_PROSPECTS, DEFAULT_ACTIVITY_LOGS } from './mockData';
import { Actor, Zone, PromoCode, Product, Order, Commission, AttendanceLog, Prospect, ActivityLog, CommissionStatus } from './types';

export default function App() {
  // Navigation active tab State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // RBAC permissions simulation states
  const [currentRole, setCurrentRole] = useState<string>('admin');
  const [currentUser, setCurrentUser] = useState<string>('Jean Doussou');

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem('isDarkMode') === 'true');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('isDarkMode', String(isDarkMode));
  }, [isDarkMode]);

  // Load state storage database
  const [db, setDb] = useState(() => getStoredData());

  // Function helper to create a safe activity log entry natively
  const createActivityLog = (action: string, entityType: string, entityId: string, oldVal?: string, newVal?: string): ActivityLog => {
    return {
      id: `log-${Date.now()}`,
      user_id: currentRole,
      user_name: currentUser,
      user_role: currentRole === 'admin' ? 'Administrateur' : currentRole === 'superviseur' ? 'Superviseur' : currentRole === 'whatsapp' ? 'Vendeur' : currentRole === 'agent' ? 'Agent' : 'Lecteur',
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldVal,
      new_value: newVal,
      created_at: new Date().toISOString()
    };
  };

  // State state mutating wrappers
  const saveDb = (updated: typeof db) => {
    setDb(updated);
    saveToStoredData(updated);
  };

  // 1. Add Actor trigger
  const handleAddActor = (newActor: Actor) => {
    const log = createActivityLog(`Création de l'acteur "${newActor.full_name}"`, 'actor', newActor.id);
    const updated = {
      ...db,
      actors: [newActor, ...db.actors],
      activityLogs: [log, ...db.activityLogs]
    };
    saveDb(updated);
  };

  // 2. Update Actor Trigger
  const handleUpdateActor = (updatedActor: Actor) => {
    const log = createActivityLog(`Mise à jour d'un statut d'acteur`, 'actor', updatedActor.id, 'active', updatedActor.status);
    const updated = {
      ...db,
      actors: db.actors.map(a => a.id === updatedActor.id ? updatedActor : a),
      activityLogs: [log, ...db.activityLogs]
    };
    saveDb(updated);
  };

  // 3. Add Promo Code directly
  const handleAddPromoCode = (newCode: PromoCode) => {
    const log = createActivityLog(`Création du code promo unique "${newCode.code}"`, 'promo_code', newCode.id);
    const updated = {
      ...db,
      promoCodes: [newCode, ...db.promoCodes],
      activityLogs: [log, ...db.activityLogs]
    };
    saveDb(updated);
  };

  // 4. Add Order triggering automated commissions calc
  const handleAddOrder = (newOrder: Order) => {
    const log = createActivityLog(`Vente validée et ticket émis: ${newOrder.ticket_number}`, 'order', newOrder.id);
    
    // Generate automated commission if promo code exists
    const matchingCommissions: Commission[] = [];
    if (newOrder.code_promo_id) {
      const codeRecord = db.promoCodes.find(pc => pc.id === newOrder.code_promo_id);
      if (codeRecord) {
        const beneficiaryActor = db.actors.find(a => a.id === codeRecord.actor_id);
        if (beneficiaryActor && beneficiaryActor.status === 'active' && codeRecord.status === 'active') {
          const ratePercent = beneficiaryActor.commission_rate || 5;
          const commissionVal = Math.round(newOrder.total_net * (ratePercent / 100));

          const newComm: Commission = {
            id: `comm-dyn-${Date.now()}`,
            order_id: newOrder.id,
            ticket_number: newOrder.ticket_number,
            actor_id: beneficiaryActor.id,
            actor_name: beneficiaryActor.full_name,
            actor_type: beneficiaryActor.type_actor,
            promo_code_id: codeRecord.id,
            promo_code_text: codeRecord.code,
            montant_vente: newOrder.total_net,
            taux: ratePercent,
            montant_commission: commissionVal,
            statut: 'pending', // Validation of commissions is pending manual validation by admin/superviseur
            created_at: new Date().toISOString()
          };
          matchingCommissions.push(newComm);
        }
      }
    }

    const updated = {
      ...db,
      orders: [newOrder, ...db.orders],
      commissions: [...matchingCommissions, ...db.commissions],
      activityLogs: [log, ...db.activityLogs]
    };
    saveDb(updated);
  };

  // 5. Update commissions status
  const handleUpdateCommissionStatus = (ids: string[], status: CommissionStatus) => {
    const log = createActivityLog(`Mise à jour globale de statut sur ${ids.length} commission(s)`, 'commission', 'batch', 'pending', status);
    
    const updated = {
      ...db,
      commissions: db.commissions.map(c => ids.includes(c.id) ? { ...c, statut: status, validated_by: currentUser, validated_at: new Date().toISOString() } : c),
      activityLogs: [log, ...db.activityLogs]
    };
    saveDb(updated);
  };

  // 6. Add Attendance check-in log
  const handleAddAttendanceLog = (newLog: AttendanceLog) => {
    const log = createActivityLog(`Rapport d'entrée en service par ${newLog.agent_name}`, 'attendance', newLog.id);
    const updated = {
      ...db,
      attendanceLogs: [newLog, ...db.attendanceLogs],
      activityLogs: [log, ...db.activityLogs]
    };
    saveDb(updated);
  };

  // 7. Update Attendance check-out status
  const handleUpdateAttendanceLog = (updatedLog: AttendanceLog) => {
    const log = createActivityLog(`Rapport de sortie/clôture de service par ${updatedLog.agent_name}`, 'attendance', updatedLog.id);
    const updated = {
      ...db,
      attendanceLogs: db.attendanceLogs.map(l => l.id === updatedLog.id ? updatedLog : l),
      activityLogs: [log, ...db.activityLogs]
    };
    saveDb(updated);
  };

  // Reset database back to original defaults
  const handleResetDatabase = () => {
    localStorage.removeItem('boaf_delices_db');
    const freshStore = {
      zones: DEFAULT_ZONES,
      actors: DEFAULT_ACTORS,
      products: DEFAULT_PRODUCTS,
      promoCodes: DEFAULT_PROMO_CODES,
      orders: DEFAULT_ORDERS,
      commissions: DEFAULT_COMMISSIONS,
      attendanceLogs: DEFAULT_ATTENDANCE_LOGS,
      prospects: DEFAULT_PROSPECTS,
      activityLogs: DEFAULT_ACTIVITY_LOGS
    };
    saveDb(freshStore);
  };

  // Zones management updates
  const handleUpdateZones = (newZones: Zone[]) => {
    const log = createActivityLog("Mise à jour de la configuration des air de livraison (zones)", "zones", "zones-config");
    saveDb({ ...db, zones: newZones, activityLogs: [log, ...db.activityLogs] });
  };

  // Products catalog updating helpers
  const handleUpdateProducts = (newProducts: Product[]) => {
    const log = createActivityLog("Mise à jour du catalogue de délices boulangers", "products", "products-config");
    saveDb({ ...db, products: newProducts, activityLogs: [log, ...db.activityLogs] });
  };

  // Dynamically serve requested active screen/tab views
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            orders={db.orders}
            actors={db.actors}
            commissions={db.commissions}
            attendanceLogs={db.attendanceLogs}
            activityLogs={db.activityLogs}
            onNavigate={(tab) => setActiveTab(tab)}
            currentRole={currentRole}
            currentUser={currentUser}
          />
        );
      case 'actors':
        return (
          <ActorsView
            actors={db.actors}
            zones={db.zones}
            promoCodes={db.promoCodes}
            orders={db.orders}
            commissions={db.commissions}
            onAddActor={handleAddActor}
            onUpdateActor={handleUpdateActor}
            onAddPromoCode={handleAddPromoCode}
            currentRole={currentRole}
          />
        );
      case 'sales':
        return (
          <SalesView
            orders={db.orders}
            products={db.products}
            promoCodes={db.promoCodes}
            actors={db.actors}
            onAddOrder={handleAddOrder}
            onAddPromoCode={handleAddPromoCode}
            currentRole={currentRole}
          />
        );
      case 'promo_codes':
        return (
          <PromoCodesView
            promoCodes={db.promoCodes}
            actors={db.actors}
            orders={db.orders}
            commissions={db.commissions}
            zones={db.zones}
            onAddPromoCode={handleAddPromoCode}
            onUpdatePromoCode={(updatedCodes) => saveDb({ ...db, promoCodes: updatedCodes })}
            currentRole={currentRole}
          />
        );
      case 'products':
        return (
          <ProductsCatalogView
            products={db.products}
            onUpdateProducts={handleUpdateProducts}
            currentRole={currentRole}
          />
        );
      case 'attendance':
        return (
          <AttendanceView
            attendanceLogs={db.attendanceLogs}
            actors={db.actors}
            zones={db.zones}
            onAddAttendanceLog={handleAddAttendanceLog}
            onUpdateAttendanceLog={handleUpdateAttendanceLog}
            currentRole={currentRole}
          />
        );
      case 'reports':
        return (
          <ReportsView
            orders={db.orders}
            actors={db.actors}
            zones={db.zones}
            commissions={db.commissions}
            attendanceLogs={db.attendanceLogs}
            onUpdateCommissionStatus={handleUpdateCommissionStatus}
            currentRole={currentRole}
          />
        );
      case 'settings':
        return (
          <SettingsView
            zones={db.zones}
            products={db.products}
            actors={db.actors}
            onResetDatabase={handleResetDatabase}
            onUpdateZones={handleUpdateZones}
            onUpdateProducts={handleUpdateProducts}
            currentRole={currentRole}
          />
        );
      default:
        return <div className="text-center py-20 text-gray-400">Cette page est encore en cours d'intégration...</div>;
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] dark:bg-[#0b1329] min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-250">
      
      {/* 1. Fixed Left sidebar menu panel */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} orders={db.orders} currentRole={currentRole} />

      {/* 2. Main content container sliding */}
      <div className="flex-1 flex flex-col pl-68 min-w-0 min-h-screen">
        
        {/* 2a. Dashboard header tools, search inputs and simulated active roles triggers */}
        <Header
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />

        {/* 2b. Scrollable views container area */}
        <main className="p-8 flex-1 overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
