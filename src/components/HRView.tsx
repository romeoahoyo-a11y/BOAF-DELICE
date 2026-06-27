import React, { useState } from 'react';
import { 
  Shield, 
  UserCheck, 
  UserX, 
  Plus, 
  Search, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  UserPlus, 
  Smartphone, 
  Mail, 
  MapPin, 
  Edit2, 
  Trash2,
  Key,
  Users,
  AlertTriangle,
  History,
  Activity,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';

interface HRMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'superviseur' | 'rh' | 'recruteur' | 'assistant';
  status: 'active' | 'suspended' | 'on_leave';
  zone: string;
  permissions: {
    manageActors: boolean;
    validateCommissions: boolean;
    editProducts: boolean;
    viewReports: boolean;
    editAttendance: boolean;
  };
  createdAt: string;
}

interface HRAuditLog {
  id: string;
  operator: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'creation' | 'modification' | 'status_change' | 'deletion';
}

const DEFAULT_HR_MEMBERS: HRMember[] = [
  {
    id: 'hr-1',
    fullName: 'Amina Laleye',
    email: 'a.laleye@boaf.com',
    phone: '+229 97 88 55 44',
    role: 'rh',
    status: 'active',
    zone: 'Lokossa, Bénin',
    permissions: {
      manageActors: true,
      validateCommissions: true,
      editProducts: false,
      viewReports: true,
      editAttendance: true
    },
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'hr-2',
    fullName: 'Jean Doussou',
    email: 'j.doussou@boaf.com',
    phone: '+229 90 12 34 56',
    role: 'admin',
    status: 'active',
    zone: 'National',
    permissions: {
      manageActors: true,
      validateCommissions: true,
      editProducts: true,
      viewReports: true,
      editAttendance: true
    },
    createdAt: '2024-11-01T09:30:00Z'
  },
  {
    id: 'hr-3',
    fullName: 'Diana Biokou',
    email: 'd.biokou@boaf.com',
    phone: '+229 96 45 67 89',
    role: 'superviseur',
    status: 'active',
    zone: 'District Sud',
    permissions: {
      manageActors: true,
      validateCommissions: true,
      editProducts: true,
      viewReports: true,
      editAttendance: true
    },
    createdAt: '2025-02-15T10:15:00Z'
  },
  {
    id: 'hr-4',
    fullName: 'Sébastien Houessou',
    email: 's.houessou@boaf.com',
    phone: '+229 65 33 22 11',
    role: 'recruteur',
    status: 'active',
    zone: 'Lokossa',
    permissions: {
      manageActors: true,
      validateCommissions: false,
      editProducts: false,
      viewReports: false,
      editAttendance: true
    },
    createdAt: '2025-05-20T14:20:00Z'
  },
  {
    id: 'hr-5',
    fullName: 'Chantal Codjia',
    email: 'c.codjia@boaf.com',
    phone: '+229 95 66 77 88',
    role: 'assistant',
    status: 'on_leave',
    zone: 'Athiémé',
    permissions: {
      manageActors: false,
      validateCommissions: false,
      editProducts: false,
      viewReports: true,
      editAttendance: false
    },
    createdAt: '2025-03-01T11:00:00Z'
  }
];

const INITIAL_AUDIT_LOGS: HRAuditLog[] = [
  {
    id: 'log-1',
    operator: 'Jean Doussou',
    action: 'Attribution du rôle Administrateur',
    target: 'Jean Doussou',
    timestamp: '2026-06-25T14:30:00Z',
    type: 'modification'
  },
  {
    id: 'log-2',
    operator: 'Amina Laleye',
    action: 'Création du compte recruteur',
    target: 'Sébastien Houessou',
    timestamp: '2026-06-25T11:15:00Z',
    type: 'creation'
  },
  {
    id: 'log-3',
    operator: 'Diana Biokou',
    action: 'Mise à jour des permissions de district',
    target: 'Chantal Codjia',
    timestamp: '2026-06-24T09:45:00Z',
    type: 'modification'
  }
];

interface HRViewProps {
  currentRole: string;
}

export default function HRView({ currentRole }: HRViewProps) {
  const [members, setMembers] = useState<HRMember[]>(DEFAULT_HR_MEMBERS);
  const [auditLogs, setAuditLogs] = useState<HRAuditLog[]>(INITIAL_AUDIT_LOGS);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states for new member/editing
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Deletion confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Simple toast visual feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'rh' as HRMember['role'],
    status: 'active' as HRMember['status'],
    zone: 'Lokossa, Bénin',
    permissions: {
      manageActors: true,
      validateCommissions: false,
      editProducts: false,
      viewReports: true,
      editAttendance: true
    }
  });

  const isReadOnly = currentRole !== 'admin' && currentRole !== 'superviseur' && currentRole !== 'rh';

  // Audit logging utility
  const addAuditLog = (action: string, targetName: string, type: HRAuditLog['type']) => {
    const newLog: HRAuditLog = {
      id: `log-${Date.now()}`,
      operator: currentRole === 'admin' ? 'Jean Doussou' : currentRole === 'superviseur' ? 'Diana Biokou' : 'Amina Laleye',
      action,
      target: targetName,
      timestamp: new Date().toISOString(),
      type
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      role: 'rh',
      status: 'active',
      zone: 'Lokossa, Bénin',
      permissions: {
        manageActors: true,
        validateCommissions: false,
        editProducts: false,
        viewReports: true,
        editAttendance: true
      }
    });
    setShowFormModal(true);
  };

  const handleOpenEditModal = (member: HRMember) => {
    setIsEditing(true);
    setEditingId(member.id);
    setFormData({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      role: member.role,
      status: member.status,
      zone: member.zone,
      permissions: { ...member.permissions }
    });
    setShowFormModal(true);
  };

  const handleTogglePermission = (key: keyof HRMember['permissions']) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  // Direct toggle permission on individual cards (Highly optimized UX!)
  const handleDirectTogglePermission = (memberId: string, permissionKey: keyof HRMember['permissions']) => {
    if (isReadOnly) {
      showToast("Erreur : Habilitations insuffisantes pour modifier les permissions.");
      return;
    }
    
    // Find member to check if admin (admins cannot be stripped easily or can't edit self blindly)
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;
    
    if (targetMember.role === 'admin' && permissionKey === 'manageActors') {
      showToast("Impossible de désactiver le droit d'administration globale pour la Direction.");
      return;
    }

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updatedPermissions = {
          ...m.permissions,
          [permissionKey]: !m.permissions[permissionKey]
        };
        
        // Log the change
        addAuditLog(
          `Permission ${permissionKey} modifiée (${updatedPermissions[permissionKey] ? 'Activée' : 'Désactivée'})`,
          m.fullName,
          'modification'
        );
        showToast(`Permissions de ${m.fullName} mises à jour avec succès.`);
        return {
          ...m,
          permissions: updatedPermissions
        };
      }
      return m;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    if (isEditing && editingId) {
      setMembers(prev => prev.map(m => m.id === editingId ? {
        ...m,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        zone: formData.zone,
        permissions: formData.permissions
      } : m));
      addAuditLog("Modification des accès et rôles", formData.fullName, "modification");
      showToast(`Profil de ${formData.fullName} enregistré.`);
    } else {
      const generatedEmail = formData.email || `${formData.fullName.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '.')}@boaf.com`;
      const newMember: HRMember = {
        id: `hr-${Date.now()}`,
        fullName: formData.fullName,
        email: generatedEmail,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        zone: formData.zone,
        permissions: formData.permissions,
        createdAt: new Date().toISOString()
      };
      setMembers(prev => [newMember, ...prev]);
      addAuditLog("Invitation de collaborateur", formData.fullName, "creation");
      showToast(`Invitation envoyée à ${formData.fullName}.`);
    }
    setShowFormModal(false);
  };

  const handleToggleMemberStatus = (id: string, currentStatus: HRMember['status']) => {
    if (isReadOnly) return;
    const targetMember = members.find(m => m.id === id);
    if (!targetMember) return;
    if (targetMember.role === 'admin') {
      showToast("Le statut de l'administrateur principal ne peut pas être modifié.");
      return;
    }

    let nextStatus: HRMember['status'] = 'active';
    if (currentStatus === 'active') {
      nextStatus = 'suspended';
    } else if (currentStatus === 'suspended') {
      nextStatus = 'on_leave';
    } else {
      nextStatus = 'active';
    }

    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: nextStatus } : m));
    addAuditLog(`Changement de statut vers [${nextStatus.toUpperCase()}]`, targetMember.fullName, "status_change");
    showToast(`Statut de ${targetMember.fullName} modifié.`);
  };

  const handleDeleteMember = (id: string) => {
    if (isReadOnly) {
      showToast("Permissions insuffisantes pour supprimer un membre.");
      return;
    }
    const targetMember = members.find(m => m.id === id);
    if (!targetMember) return;
    if (targetMember.role === 'admin') {
      showToast("L'administrateur principal ne peut pas être retiré.");
      return;
    }

    setMembers(prev => prev.filter(m => m.id !== id));
    addAuditLog("Retrait d'un collaborateur", targetMember.fullName, "deletion");
    showToast(`Compte de ${targetMember.fullName} supprimé.`);
    setDeleteConfirmId(null);
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.phone.includes(searchTerm) ||
                          m.zone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleLabel = (role: HRMember['role']) => {
    switch (role) {
      case 'admin': return 'Administrateur / Direction';
      case 'superviseur': return 'Superviseur de District';
      case 'rh': return 'Responsable RH';
      case 'recruteur': return 'Chargé de Recrutement';
      case 'assistant': return 'Assistant Administratif';
      default: return role;
    }
  };

  // Calculations for dynamic stats
  const totalCount = members.length;
  const activeCount = members.filter(m => m.status === 'active').length;
  const leaveCount = members.filter(m => m.status === 'on_leave').length;
  const suspendedCount = members.filter(m => m.status === 'suspended').length;

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#0B5D2A] text-white px-4 py-3 rounded-xl border border-emerald-500 shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121c33] p-6 rounded-3xl border border-gray-150 dark:border-slate-800 transition-colors shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-[#0B5D2A] dark:text-green-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black font-display text-gray-900 dark:text-white uppercase tracking-tight">
              Gestion de l'Équipe & Habilitations RH
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed max-w-3xl">
            Attribuez et sécurisez les rôles administratifs de BOAF Délices. Activez, suspendez ou ajustez instantanément les accès granulaires pour les gérants de district, recruteurs et secrétariats.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-4.5 py-3 bg-[#0B5D2A] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all duration-200 cursor-pointer self-start shadow-md hover:scale-[1.02] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nouveau collaborateur
          </button>
        )}
      </div>

      {/* Optimized Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stat */}
        <div className="bg-white dark:bg-[#121c33] p-4.5 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-3xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 tracking-wider">Membres Équipe</span>
            <Users className="w-4 h-4 text-[#0B5D2A] dark:text-green-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white">{totalCount}</span>
            <span className="text-[10px] text-gray-400">Inscrits</span>
          </div>
        </div>

        {/* Active Access */}
        <div className="bg-white dark:bg-[#121c33] p-4.5 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-3xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-500 tracking-wider">Accès Actifs</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</span>
            <span className="text-[10px] text-gray-400">Autorisés</span>
          </div>
        </div>

        {/* Suspended Access */}
        <div className="bg-white dark:bg-[#121c33] p-4.5 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-3xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Accès Suspendus</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{suspendedCount}</span>
            <span className="text-[10px] text-gray-400">Désactivés</span>
          </div>
        </div>

        {/* On Leave Access */}
        <div className="bg-white dark:bg-[#121c33] p-4.5 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-3xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Congés RH</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-500 dark:text-amber-400">{leaveCount}</span>
            <span className="text-[10px] text-gray-400">Inactifs temporaires</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white dark:bg-[#121c33] p-4 rounded-2xl border border-gray-150 dark:border-slate-800 flex flex-col md:flex-row gap-3 shadow-3xs">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone, zone d'affectation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-sans"
          />
        </div>

        {/* Role Filter */}
        <div className="w-full md:w-56">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-white rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
          >
            <option value="all">Tous les rôles d'équipe</option>
            <option value="admin">Direction / Admin</option>
            <option value="superviseur">Superviseurs de District</option>
            <option value="rh">Responsables RH</option>
            <option value="recruteur">Recruteurs</option>
            <option value="assistant">Assistants</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-white rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif / Autorisé</option>
            <option value="suspended">Suspendu</option>
            <option value="on_leave">En congé</option>
          </select>
        </div>
      </div>

      {/* Grid of Optimized Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filteredMembers.map((member) => (
          <div 
            key={member.id} 
            className="bg-white dark:bg-[#121c33] p-5 rounded-3xl border border-gray-150 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-5 shadow-sm"
          >
            {/* Header section with info & status */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center font-bold text-lg text-[#0B5D2A] dark:text-emerald-400">
                  {member.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
                    {member.fullName}
                    {member.role === 'admin' && (
                      <span className="w-2 h-2 rounded-full bg-red-500" title="Accès de Direction" />
                    )}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {getRoleLabel(member.role)}
                  </div>
                </div>
              </div>

              {/* Status and Actions combo */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleToggleMemberStatus(member.id, member.status)}
                  disabled={isReadOnly || member.role === 'admin'}
                  className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg border cursor-pointer transition-all active:scale-95 ${
                    member.status === 'active'
                      ? 'bg-emerald-50 dark:bg-green-950/20 text-[#0B5D2A] dark:text-green-400 border-emerald-150 dark:border-emerald-900/30'
                      : member.status === 'suspended'
                      ? 'bg-red-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-red-150 dark:border-rose-900/30'
                      : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-150 dark:border-amber-900/30'
                  }`}
                  title={member.role === 'admin' ? "Statut permanent pour l'administrateur" : "Cliquez pour cycler le statut (Actif -> Suspendu -> Congé)"}
                >
                  {member.status === 'active' ? '✓ Actif' : member.status === 'suspended' ? '✗ Suspendu' : '• En congé'}
                </button>

                {!isReadOnly && (
                  <>
                    <button
                      onClick={() => handleOpenEditModal(member)}
                      className="p-1.5 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-lg cursor-pointer transition-all"
                      title="Modifier les détails"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {member.role !== 'admin' && (
                      <button
                        onClick={() => setDeleteConfirmId(member.id)}
                        className="p-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/60 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-lg cursor-pointer transition-all"
                        title="Retirer le collaborateur"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Quick Contact Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 dark:bg-slate-950/30 p-3 rounded-2xl border border-gray-100 dark:border-slate-850">
              <div className="flex items-center gap-1.5 text-xs text-gray-650 dark:text-slate-350">
                <Smartphone className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
                <span className="font-mono text-[11px] font-semibold">{member.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-650 dark:text-slate-350 overflow-hidden">
                <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
                <span className="truncate text-[11px] font-sans font-medium" title={member.email}>{member.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-655 dark:text-slate-350">
                <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
                <span className="font-semibold text-[11px] truncate">{member.zone}</span>
              </div>
            </div>

            {/* Interactive Granular Permissions (Click to toggle instantly!) */}
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Key className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Habilitations système granulaires (cliquer pour basculer)
                </span>
                {!isReadOnly && <span className="text-[9px] text-gray-400 lowercase">mode interactif</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'manageActors' as const, label: 'Gérer Acteurs' },
                  { key: 'validateCommissions' as const, label: 'Valider Comm.' },
                  { key: 'editProducts' as const, label: 'Catalogue Prod' },
                  { key: 'editAttendance' as const, label: 'Modif Présence' },
                  { key: 'viewReports' as const, label: 'Voir Rapports' }
                ].map((perm) => {
                  const hasPerm = member.permissions[perm.key];
                  return (
                    <button
                      key={perm.key}
                      onClick={() => handleDirectTogglePermission(member.id, perm.key)}
                      disabled={isReadOnly}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all text-left flex items-center gap-1 ${
                        isReadOnly ? 'cursor-default' : 'cursor-pointer hover:scale-[1.03] active:scale-95'
                      } ${
                        hasPerm 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-[#0B5D2A] dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40' 
                          : 'bg-gray-50 dark:bg-slate-900/50 text-gray-400 dark:text-slate-600 border-gray-150 dark:border-slate-800'
                      }`}
                    >
                      <span>{hasPerm ? '✓' : '✗'}</span>
                      {perm.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Alert Banner */}
      {deleteConfirmId && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/50 rounded-2xl flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Confirmer le retrait du collaborateur ?</p>
              <p className="text-[11px] text-red-700 dark:text-rose-400">Cette personne perdra immédiatement son accès sécurisé à BOAF Délices.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-3 py-1.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 text-gray-800 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={() => handleDeleteMember(deleteConfirmId)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Révoquer l'accès
            </button>
          </div>
        </div>
      )}

      {/* HR Audit Activity Log Section (Highly Optimized & Realistic Feature!) */}
      <div className="bg-white dark:bg-[#121c33] p-5 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-black uppercase text-gray-900 dark:text-white tracking-wide">
              Registre d'Audit & Journal d'Habilitations RH
            </h3>
          </div>
          <span className="text-[10px] bg-gray-100 dark:bg-slate-900 text-gray-500 dark:text-slate-400 font-mono px-2 py-0.5 rounded-md font-bold uppercase">
            Sécurisé
          </span>
        </div>

        <div className="space-y-2.5 max-h-56 overflow-y-auto">
          {auditLogs.map((log) => (
            <div 
              key={log.id} 
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-850 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${
                  log.type === 'creation' ? 'bg-emerald-500' : 
                  log.type === 'status_change' ? 'bg-amber-500' : 
                  log.type === 'deletion' ? 'bg-red-500' : 'bg-purple-500'
                }`} />
                <div>
                  <span className="font-bold text-gray-900 dark:text-slate-200">{log.operator}</span>
                  <span className="text-gray-500 dark:text-slate-400 mx-1.5">a exécuté :</span>
                  <span className="font-semibold text-[#0B5D2A] dark:text-emerald-400">{log.action}</span>
                  <span className="text-gray-500 dark:text-slate-400 mx-1.5">sur</span>
                  <span className="font-bold text-gray-900 dark:text-white">{log.target}</span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-gray-400 dark:text-slate-500">
                {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Add Collaborator Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c33] border border-gray-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative text-left transition-colors">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute right-4 top-4 p-1 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black uppercase text-gray-900 dark:text-white tracking-wide mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {isEditing ? 'Modifier Accès Collaborateur' : 'Ajouter un Collaborateur RH'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
              Définissez les informations de base et sélectionnez précisément les fonctionnalités autorisées pour cette personne.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500">Nom Complet</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amina Laleye"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Contact Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500">Téléphone WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: +229 97 88 55 44"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500">Adresse Email (BOAF)</label>
                  <input
                    type="email"
                    placeholder="Laisser vide pour auto-générer"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Role & Zone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500">Rôle Administratif</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as HRMember['role'] }))}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="rh">Responsable RH</option>
                    <option value="superviseur">Superviseur de District</option>
                    <option value="recruteur">Chargé de Recrutement</option>
                    <option value="assistant">Assistant Administratif</option>
                    <option value="admin">Administrateur / Direction</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500">Zone d'Affectation</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lokossa, Bénin"
                    value={formData.zone}
                    onChange={(e) => setFormData(prev => ({ ...prev, zone: e.target.value }))}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-slate-500">Statut de l'Accès</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-gray-800 dark:text-white font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                      className="accent-emerald-600"
                    />
                    Actif
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-800 dark:text-white font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="suspended"
                      checked={formData.status === 'suspended'}
                      onChange={() => setFormData(prev => ({ ...prev, status: 'suspended' }))}
                      className="accent-emerald-600"
                    />
                    Suspendu
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-800 dark:text-white font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="on_leave"
                      checked={formData.status === 'on_leave'}
                      onChange={() => setFormData(prev => ({ ...prev, status: 'on_leave' }))}
                      className="accent-emerald-600"
                    />
                    En congé
                  </label>
                </div>
              </div>

              {/* Set custom granular permissions */}
              <div className="space-y-2 pt-2 border-t border-gray-150 dark:border-slate-800">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Définir les habilitations système
                </label>
                
                <div className="space-y-2 bg-gray-50 dark:bg-slate-950/60 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                  {/* Manage Actors Toggle */}
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <div>
                      <span className="text-xs text-gray-900 dark:text-white font-bold block">Gérer les Acteurs de Terrain</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-400 block">Autorise à créer ou suspendre les ambassadrices et agents</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permissions.manageActors}
                      onChange={() => handleTogglePermission('manageActors')}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                  </label>

                  {/* Validate Commissions Toggle */}
                  <label className="flex items-center justify-between cursor-pointer select-none pt-2 border-t border-gray-150 dark:border-slate-800/40">
                    <div>
                      <span className="text-xs text-gray-900 dark:text-white font-bold block">Valider les Commissions</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-400 block">Autorise à arbitrer et valider les versements</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permissions.validateCommissions}
                      onChange={() => handleTogglePermission('validateCommissions')}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                  </label>

                  {/* Edit Products Toggle */}
                  <label className="flex items-center justify-between cursor-pointer select-none pt-2 border-t border-gray-150 dark:border-slate-800/40">
                    <div>
                      <span className="text-xs text-gray-900 dark:text-white font-bold block">Gérer le Catalogue Produits</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-400 block">Peut ajuster les tarifs et le stock BOAF</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permissions.editProducts}
                      onChange={() => handleTogglePermission('editProducts')}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                  </label>

                  {/* Edit Attendance Toggle */}
                  <label className="flex items-center justify-between cursor-pointer select-none pt-2 border-t border-gray-150 dark:border-slate-800/40">
                    <div>
                      <span className="text-xs text-gray-900 dark:text-white font-bold block">Planifier la Présence Terrain</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-400 block">Peut valider les fiches de route terrain</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permissions.editAttendance}
                      onChange={() => handleTogglePermission('editAttendance')}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                  </label>

                  {/* View Reports Toggle */}
                  <label className="flex items-center justify-between cursor-pointer select-none pt-2 border-t border-gray-150 dark:border-slate-800/40">
                    <div>
                      <span className="text-xs text-gray-900 dark:text-white font-bold block">Visualiser les Rapports & Stats</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-400 block">Donne accès à la finance et aux audits</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permissions.viewReports}
                      onChange={() => handleTogglePermission('viewReports')}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
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
                  {isEditing ? 'Sauvegarder les modifications' : 'Inviter dans l\'équipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
