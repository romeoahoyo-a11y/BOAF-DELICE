export type ActorType = 'employee' | 'agent' | 'partner' | 'collaborator' | 'ambassador';
export type ActorStatus = 'active' | 'suspended' | 'inactive';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'on_mission' | 'out_of_zone' | 'not_closed';
export type CodeStatus = 'active' | 'suspended' | 'expired';
export type CommissionStatus = 'pending' | 'validated' | 'rejected' | 'paid';
export type PaymentStatus = 'unpaid' | 'paid';
export type OrderStatus = 'valid' | 'cancelled';

export interface Zone {
  id: string;
  nom: string;
  commune: string;
  departement: string;
  latitude: number;
  longitude: number;
  rayon_metre: number;
  description: string;
}

export interface Actor {
  id: string;
  type_actor: ActorType;
  full_name: string;
  phone: string;
  email: string;
  main_code: string;
  zone_id: string;
  status: ActorStatus;
  commission_rate: number; // percentage (e.g. 5)
  date_integration: string;
  objective_jour?: number; // FCFA
  objective_mois?: number; // FCFA
  poste?: string;
  service?: string;
  salaire_optionnel?: number;
  responsable_id?: string;
  type_agent?: string; // terrain, mobile, etc.
  type_partenaire?: string; // Boutique, Relais, Salon, Chauffeur, etc.
  activite?: string;
  adresse?: string;
  quartier?: string;
  niveau?: string;
  type_ambassadeur?: string; // Elève, Influenceur, etc.
  etablissement_optionnel?: string;
  responsable_legal_optionnel?: string;
  autorisation_parentale_bool?: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  type_code: string; // e.g. 'BOAF-AGT', 'BOAF-PART', 'BOAF-AMB', 'BOAF-COL', 'BOAF-ECO', 'BOAF-EGL', 'BOAF-EVT', 'BOAF-DIG'
  actor_id: string; // references Actor
  zone_id?: string;
  status: CodeStatus;
  starts_at: string;
  expires_at?: string;
  created_at: string;
}

export interface Product {
  id: string;
  nom: string;
  categorie: string; // 'Pain', 'Gouter', 'Repas', 'Patisserie', 'Traiteur', 'Hebergement'
  prix: number; // FCFA
  marge_estimee: number; // percentage (e.g. 40)
  actif: boolean;
}

export interface OrderItem {
  product_id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

export interface Order {
  id: string;
  ticket_number: string; // e.g. TK-20260603-000001
  customer_name: string;
  customer_phone?: string;
  prospect_id?: string;
  code_promo_id?: string; // references PromoCode
  code_promo_text?: string;
  items: OrderItem[];
  total_brut: number;
  remise: number;
  total_net: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  payment_mode: string; // 'Espèces', 'Mobile Money', 'Virement', 'Chèque'
  source: string; // 'WhatsApp', 'Direct', 'Terrain', 'Partenaire', 'Événement'
  created_by: string; // user ID or Actor ID
  created_at: string;
  cancellation_reason?: string;
}

export interface Commission {
  id: string;
  order_id: string;
  ticket_number: string;
  actor_id: string;
  actor_name: string;
  actor_type: ActorType;
  promo_code_id?: string;
  promo_code_text?: string;
  montant_vente: number;
  taux: number; // percentage
  montant_commission: number;
  statut: CommissionStatus;
  validated_by?: string;
  validated_at?: string;
  paid_at?: string;
  created_at: string;
}

export interface AttendanceLog {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_code: string;
  date: string; // YYYY-MM-DD
  checkin_at: string; // ISO String
  checkout_at?: string; // ISO String
  lat_in: number;
  lng_in: number;
  lat_out?: number;
  lng_out?: number;
  accuracy_m: number;
  status: AttendanceStatus;
  zone_id: string;
  zone_name: string;
  note?: string;
  photo_url?: string;
}

export interface Prospect {
  id: string;
  nom: string;
  telephone: string;
  besoin: string;
  source: string;
  code_promo?: string;
  statut: 'nouveau' | 'contacte' | 'converted' | 'annule';
  date_relance?: string;
  note?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}
