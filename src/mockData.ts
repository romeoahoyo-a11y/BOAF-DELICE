import { Actor, Zone, PromoCode, Product, Order, Commission, AttendanceLog, Prospect, ActivityLog, CodeStatus, CommissionStatus } from './types';

// Benchmark Zones in Lokossa & surroundings
export const DEFAULT_ZONES: Zone[] = [
  { id: 'z1', nom: 'Lokossa Centre', commune: 'Lokossa', departement: 'Mono', latitude: 6.6433, longitude: 1.7167, rayon_metre: 1500, description: 'Secteur commercial central, grands marchés, administrations' },
  { id: 'z2', nom: 'Agamé', commune: 'Lokossa', departement: 'Mono', latitude: 6.6789, longitude: 1.6321, rayon_metre: 2500, description: 'Zone rurale active, commerces de relais' },
  { id: 'z3', nom: 'Houinvié', commune: 'Lokossa', departement: 'Mono', latitude: 6.6212, longitude: 1.7345, rayon_metre: 1200, description: 'Quartier résidentiel, écoles et collèges' },
  { id: 'z4', nom: 'Ouèdèmè', commune: 'Lokossa', departement: 'Mono', latitude: 6.6901, longitude: 1.7456, rayon_metre: 2000, description: 'Axes secondaires vers Dogbo, maraîchers et églises' },
  { id: 'z5', nom: 'Athiémé Centre', commune: 'Athiémé', departement: 'Mono', latitude: 6.5786, longitude: 1.6702, rayon_metre: 1800, description: 'Zone fluviale frontalière et commerces annexes' }
];

// Benchmark Products
export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', nom: 'Pain sucré Premium', categorie: 'Pain', prix: 150, marge_estimee: 45, actif: true, description: 'Le célèbre pain sucré BOAF moelleux et doré au four traditionnel.', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80', disponibilite: 'disponible', show_in_catalog: true, created_at: '2026-01-01T08:00:00Z', updated_at: '2026-06-19T08:00:00Z' },
  { id: 'p2', nom: 'Pain ordinaire croustillant', categorie: 'Pain', prix: 125, marge_estimee: 35, actif: true, description: 'Pain de table traditionnel, croustillant et parfait pour le petit-déjeuner.', image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&auto=format&fit=crop&q=80', disponibilite: 'disponible', show_in_catalog: true, created_at: '2026-01-01T08:00:00Z', updated_at: '2026-06-19T08:00:00Z' },
  { id: 'p3', nom: 'Jus d’Ananas local pur', categorie: 'Jus', prix: 500, marge_estimee: 50, actif: true, description: 'Jus d’ananas pressé sans eau ajoutée ni conservateur, issu des cultures de Lokossa.', image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80', disponibilite: 'disponible', show_in_catalog: true, created_at: '2026-01-10T09:00:00Z', updated_at: '2026-06-19T08:00:00Z' },
  { id: 'p4', nom: 'Croissant au Beurre frais', categorie: 'Pâtisserie', prix: 400, marge_estimee: 45, actif: true, description: 'Pur beurre de baratte, feuilletage croustillant façonné à la main.', image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80', disponibilite: 'disponible', show_in_catalog: true, created_at: '2026-02-15T08:00:00Z', updated_at: '2026-06-19T08:00:00Z' },
  { id: 'p5', nom: 'Plat de Riz au Gras traditionnel', categorie: 'Repas', prix: 2000, marge_estimee: 42, actif: true, description: 'Riz parfumé mijoté aux épices locales, servi avec du poulet braisé tendre.', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80', disponibilite: 'disponible', show_in_catalog: true, created_at: '2026-03-01T12:00:00Z', updated_at: '2026-06-19T08:00:00Z' },
  { id: 'p6', nom: 'Gâteau d’Anniversaire Chocolat', categorie: 'Pâtisserie', prix: 15000, marge_estimee: 55, actif: true, description: 'Moelleux chocolat noir intense avec glaçage miroir personnalisé sur commande.', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80', disponibilite: 'disponible', show_in_catalog: true, created_at: '2026-04-01T10:00:00Z', updated_at: '2026-06-19T08:00:00Z' },
  { id: 'p7', nom: 'Cocktail de Goûters assortis', categorie: 'Offre spéciale', prix: 3500, marge_estimee: 40, actif: true, description: 'Assortiment de 10 gâteaux, pains sucrés miniatures et jus de fruits.', image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&auto=format&fit=crop&q=80', disponibilite: 'disponible', show_in_catalog: true, created_at: '2026-05-01T08:00:00Z', updated_at: '2026-06-19T08:00:00Z' },
  { id: 'p8', nom: 'Séjour Éco-Gîte Lokossa (1 Nuit)', categorie: 'Hébergement', prix: 15000, marge_estimee: 60, actif: true, description: 'Chambre double confortable ventilée au cœur d’une nature préservée à Lokossa.', image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop&q=80', disponibilite: 'disponible', show_in_catalog: true, created_at: '2026-01-01T08:00:00Z', updated_at: '2026-06-19T08:00:00Z' }
];

// Reusable names for actors in South West Benin
const YORUBA_FON_NAMES = [
  'Jean Doussou', 'Edouard Soglo', 'Grace Houngbédji', 'Eric Adjovi', 'Marc Dosso',
  'Diana Biokou', 'Brice Amoussou', 'Sylvie Kode', 'Robert Faton', 'Anatole Zinsi',
  'Bernadette Sossa', 'Clément Tchibozo', 'Marie-Claire Ahoyo', 'Felicien Gbaguidi',
  'Juliette Keke', 'Christian Lokossou', 'Gisèle Agbo', 'Hubert Tossou', 'Isabelle Dagba',
  'Pascal Béhanzin', 'Noélie Zannou', 'Sylvestre Codjia', 'Thierry Aguiah', 'Chantal Hounsa',
  'Modeste Kpadonou', 'Evelyne Gnahoui', 'Armand Degbo', 'Viviane Zomahe', 'Rodrigue Alladaye',
  'Alice Ségla', 'Mathieu Bio', 'Solange Guedegbe', 'Fabrice Loko', 'Véronique Sessi',
  'Sébastien Houndjo', 'Augustine Djidonou', 'Raoul Vilon', 'Colette Avocetien', 'Patrice Fanou',
  'Emilienne Lawson', 'Gérard Ahouandjinou'
];

// Setup exact list of some key actors
export const DEFAULT_ACTORS: Actor[] = [
  // Employees (10 items required)
  { id: 'act-emp-01', type_actor: 'employee', full_name: 'Jean Doussou', phone: '+229 97 12 34 56', email: 'j.doussou@boaf.com', main_code: 'BOAF-EMP-001', zone_id: 'z1', status: 'active', commission_rate: 0, date_integration: '2025-01-10', poste: 'Directeur Général', service: 'Administration', salaire_optionnel: 450000 },
  { id: 'act-emp-02', type_actor: 'employee', full_name: 'Diana Biokou', phone: '+229 96 45 67 89', email: 'd.biokou@boaf.com', main_code: 'BOAF-EMP-002', zone_id: 'z1', status: 'active', commission_rate: 2, date_integration: '2025-02-15', poste: 'Superviseur de District', service: 'Commercial', salaire_optionnel: 250000 },
  { id: 'act-emp-03', type_actor: 'employee', full_name: 'Marc Dosso', phone: '+229 90 78 90 12', email: 'm.dosso@boaf.com', main_code: 'BOAF-EMP-003', zone_id: 'z1', status: 'active', commission_rate: 1, date_integration: '2025-03-01', poste: 'Comptable Principal', service: 'Finances', salaire_optionnel: 300000 },
  { id: 'act-emp-04', type_actor: 'employee', full_name: 'Sylvie Kode', phone: '+229 61 23 45 67', email: 's.kode@boaf.com', main_code: 'BOAF-EMP-004', zone_id: 'z3', status: 'active', commission_rate: 0, date_integration: '2025-03-12', poste: 'Responsable WhatsApp / Ventes', service: 'Commercial', salaire_optionnel: 180000 },
  { id: 'act-emp-05', type_actor: 'employee', full_name: 'Brice Amoussou', phone: '+229 62 34 56 78', email: 'b.amoussou@boaf.com', main_code: 'BOAF-EMP-005', zone_id: 'z2', status: 'active', commission_rate: 1.5, date_integration: '2025-04-01', poste: 'Chef d\'Atelier Pâtisserie', service: 'Production', salaire_optionnel: 200000 },
  { id: 'act-emp-06', type_actor: 'employee', full_name: 'Robert Faton', phone: '+229 63 45 67 89', email: 'r.faton@boaf.com', main_code: 'BOAF-EMP-006', zone_id: 'z4', status: 'active', commission_rate: 0, date_integration: '2025-04-18', poste: 'Responsable Logistique', service: 'Distribution', salaire_optionnel: 175000 },
  { id: 'act-emp-07', type_actor: 'employee', full_name: 'Anatole Zinsi', phone: '+229 64 56 78 90', email: 'a.zinsi@boaf.com', main_code: 'BOAF-EMP-007', zone_id: 'z1', status: 'active', commission_rate: 0, date_integration: '2025-05-02', poste: 'Livreur', service: 'Distribution', salaire_optionnel: 120000 },
  { id: 'act-emp-08', type_actor: 'employee', full_name: 'Bernadette Sossa', phone: '+229 65 67 89 01', email: 'b.sossa@boaf.com', main_code: 'BOAF-EMP-008', zone_id: 'z1', status: 'active', commission_rate: 0, date_integration: '2025-05-20', poste: 'Secrétaire Administrative', service: 'Administration', salaire_optionnel: 130000 },
  { id: 'act-emp-09', type_actor: 'employee', full_name: 'Clément Tchibozo', phone: '+229 66 78 90 12', email: 'c.tchibozo@boaf.com', main_code: 'BOAF-EMP-009', zone_id: 'z5', status: 'active', commission_rate: 1, date_integration: '2025-06-05', poste: 'Superviseur Athiémé', service: 'Commercial', salaire_optionnel: 210000 },
  { id: 'act-emp-10', type_actor: 'employee', full_name: 'Marie-Claire Ahoyo', phone: '+229 67 89 01 23', email: 'm.ahoyo@boaf.com', main_code: 'BOAF-EMP-010', zone_id: 'z1', status: 'active', commission_rate: 0, date_integration: '2025-07-01', poste: 'Contrôleur de Gestion', service: 'Finances', salaire_optionnel: 280000 },

  // Agents Terrain (10 items required)
  { id: 'act-agt-01', type_actor: 'agent', full_name: 'Eric Adjovi', phone: '+229 97 45 45 01', email: 'e.adjovi@boaf.com', main_code: 'BOAF-AGT-0234', zone_id: 'z1', status: 'active', commission_rate: 5, date_integration: '2025-01-20', objective_jour: 25000, objective_mois: 750000, type_agent: 'Bicyclette Mobile' },
  { id: 'act-agt-02', type_actor: 'agent', full_name: 'Grace Houngbédji', phone: '+229 96 32 32 02', email: 'g.houngbedji@boaf.com', main_code: 'BOAF-AGT-0235', zone_id: 'z2', status: 'active', commission_rate: 5, date_integration: '2025-02-10', objective_jour: 20000, objective_mois: 600000, type_agent: 'Moto-Vendeur' },
  { id: 'act-agt-03', type_actor: 'agent', full_name: 'Felicien Gbaguidi', phone: '+229 91 12 12 03', email: 'f.gbaguidi@boaf.com', main_code: 'BOAF-AGT-0236', zone_id: 'z3', status: 'active', commission_rate: 4.5, date_integration: '2025-02-18', objective_jour: 15000, objective_mois: 450000, type_agent: 'Kiosque Mobile' },
  { id: 'act-agt-04', type_actor: 'agent', full_name: 'Juliette Keke', phone: '+229 92 23 23 04', email: 'j.keke@boaf.com', main_code: 'BOAF-AGT-0237', zone_id: 'z4', status: 'active', commission_rate: 5, date_integration: '2025-03-05', objective_jour: 25000, objective_mois: 750000, type_agent: 'Moto-Vendeur' },
  { id: 'act-agt-05', type_actor: 'agent', full_name: 'Christian Lokossou', phone: '+229 93 34 34 05', email: 'c.lokossou@boaf.com', main_code: 'BOAF-AGT-0238', zone_id: 'z5', status: 'active', commission_rate: 4, date_integration: '2025-03-22', objective_jour: 30000, objective_mois: 900000, type_agent: 'Moto-Vendeur' },
  { id: 'act-agt-06', type_actor: 'agent', full_name: 'Gisèle Agbo', phone: '+229 94 45 45 06', email: 'g.agbo@boaf.com', main_code: 'BOAF-AGT-0239', zone_id: 'z1', status: 'active', commission_rate: 5, date_integration: '2025-04-10', objective_jour: 15000, objective_mois: 450000, type_agent: 'Bicyclette Mobile' },
  { id: 'act-agt-07', type_actor: 'agent', full_name: 'Hubert Tossou', phone: '+229 95 56 56 07', email: 'h.tossou@boaf.com', main_code: 'BOAF-AGT-0240', zone_id: 'z2', status: 'active', commission_rate: 4.5, date_integration: '2025-04-20', objective_jour: 20000, objective_mois: 600000, type_agent: 'Kiosque Mobile' },
  { id: 'act-agt-08', type_actor: 'agent', full_name: 'Isabelle Dagba', phone: '+229 98 67 67 08', email: 'i.dagba@boaf.com', main_code: 'BOAF-AGT-0241', zone_id: 'z3', status: 'suspended', commission_rate: 5, date_integration: '2025-05-02', objective_jour: 15000, objective_mois: 450000, type_agent: 'Bicyclette Mobile' },
  { id: 'act-agt-09', type_actor: 'agent', full_name: 'Pascal Béhanzin', phone: '+229 99 78 78 09', email: 'p.behanzin@boaf.com', main_code: 'BOAF-AGT-0242', zone_id: 'z4', status: 'active', commission_rate: 5, date_integration: '2025-05-15', objective_jour: 20000, objective_mois: 600000, type_agent: 'Moto-Vendeur' },
  { id: 'act-agt-10', type_actor: 'agent', full_name: 'Noélie Zannou', phone: '+229 90 89 89 10', email: 'n.zannou@boaf.com', main_code: 'BOAF-AGT-0243', zone_id: 'z5', status: 'active', commission_rate: 5, date_integration: '2025-06-01', objective_jour: 25000, objective_mois: 750000, type_agent: 'Kiosque Mobile' },

  // Partenaires (10 items required)
  { id: 'act-part-01', type_actor: 'partner', full_name: 'Sébastien Houndjo', phone: '+229 95 11 22 33', email: 's.houndjo@partner.com', main_code: 'BOAF-PART-0142', zone_id: 'z1', status: 'active', commission_rate: 6, date_integration: '2025-01-15', type_partenaire: 'Boutique d\'Alimentation', activite: 'Supermarché de quartier', adresse: 'Carrefour Central Lokossa', quartier: 'Centre-Ville' },
  { id: 'act-part-02', type_actor: 'partner', full_name: 'Alice Ségla', phone: '+229 94 22 33 44', email: 'a.segla@partner.com', main_code: 'BOAF-PART-0143', zone_id: 'z2', status: 'active', commission_rate: 7, date_integration: '2025-01-28', type_partenaire: 'Relais Routier', activite: 'Cafétéria Gare d\'Agamé', adresse: 'Gare routière', quartier: 'Gare' },
  { id: 'act-part-03', type_actor: 'partner', full_name: 'Rodrigue Alladaye', phone: '+229 93 33 44 55', email: 'r.alladaye@partner.com', main_code: 'BOAF-PART-0144', zone_id: 'z3', status: 'active', commission_rate: 6.5, date_integration: '2025-02-05', type_partenaire: 'Chauffeur de Taxi', activite: 'Réseau interurbain Mono', adresse: 'Station Lokossa', quartier: 'Sable' },
  { id: 'act-part-04', type_actor: 'partner', full_name: 'Solange Guedegbe', phone: '+229 92 44 55 66', email: 's.guedegbe@partner.com', main_code: 'BOAF-PART-0145', zone_id: 'z4', status: 'active', commission_rate: 6, date_integration: '2025-02-12', type_partenaire: 'Boutique d\'Alimentation', activite: 'Boulangerie partenaire', adresse: 'Face Église St Michel', quartier: 'St Michel' },
  { id: 'act-part-05', type_actor: 'partner', full_name: 'Fabrice Loko', phone: '+229 91 55 66 77', email: 'f.loko@partner.com', main_code: 'BOAF-PART-0146', zone_id: 'z5', status: 'active', commission_rate: 7, date_integration: '2025-02-25', type_partenaire: 'Salon de Thé', activite: 'Espace détente Athiémé', adresse: 'Berges du Mono', quartier: 'Fluvial' },
  { id: 'act-part-06', type_actor: 'partner', full_name: 'Véronique Sessi', phone: '+229 90 66 77 88', email: 'v.sessi@partner.com', main_code: 'BOAF-PART-0147', zone_id: 'z1', status: 'active', commission_rate: 6, date_integration: '2025-03-01', type_partenaire: 'Relais de Distribution', activite: 'Épicerie fine', adresse: 'Quartier des Banques', quartier: 'Bancaire' },
  { id: 'act-part-07', type_actor: 'partner', full_name: 'Augustine Djidonou', phone: '+229 61 77 88 99', email: 'a.djidonou@partner.com', main_code: 'BOAF-PART-0148', zone_id: 'z2', status: 'active', commission_rate: 6, date_integration: '2025-03-15', type_partenaire: 'Boutique d\'Alimentation', activite: 'Kiosque de boissons', adresse: 'Route nationale', quartier: 'Passage' },
  { id: 'act-part-08', type_actor: 'partner', full_name: 'Raoul Vilon', phone: '+229 62 88 99 00', email: 'r.vilon@partner.com', main_code: 'BOAF-PART-0149', zone_id: 'z3', status: 'suspended', commission_rate: 6.5, date_integration: '2025-03-25', type_partenaire: 'Relais de Distribution', activite: 'Cave à vins & délices', adresse: 'Avenue royale', quartier: 'Palais' },
  { id: 'act-part-09', type_actor: 'partner', full_name: 'Colette Avocetien', phone: '+229 63 99 00 11', email: 'c.avocetien@partner.com', main_code: 'BOAF-PART-0150', zone_id: 'z4', status: 'active', commission_rate: 7, date_integration: '2025-04-05', type_partenaire: 'Salon de Thé', activite: 'Café gourmand', adresse: 'Zone artisanale', quartier: 'Artisans' },
  { id: 'act-part-10', type_actor: 'partner', full_name: 'Patrice Fanou', phone: '+229 64 00 11 22', email: 'p.fanou@partner.com', main_code: 'BOAF-PART-0151', zone_id: 'z5', status: 'active', commission_rate: 6, date_integration: '2025-04-12', type_partenaire: 'Chauffeur de Taxi', activite: 'Navette Lokossa-Athiémé', adresse: 'Sous-préfecture Athiémé', quartier: 'Sous-pref' },

  // Ambassadeurs (10 items required)
  { id: 'act-amb-01', type_actor: 'ambassador', full_name: 'Emilienne Lawson', phone: '+229 97 88 77 11', email: 'e.lawson@ambassador.com', main_code: 'BOAF-AMB-0024', zone_id: 'z3', status: 'active', commission_rate: 4, date_integration: '2025-01-10', type_ambassadeur: 'Élève Ambassadeur', etablissement_optionnel: 'Collège de Lokossa', responsable_legal_optionnel: 'Christian Lawson', autorisation_parentale_bool: true },
  { id: 'act-amb-02', type_actor: 'ambassador', full_name: 'Gérard Ahouandjinou', phone: '+229 96 99 88 22', email: 'g.ahouandjinou@ambassador.com', main_code: 'BOAF-AMB-0025', zone_id: 'z1', status: 'active', commission_rate: 4.5, date_integration: '2025-01-22', type_ambassadeur: 'Influenceur Local', etablissement_optionnel: 'Université Abomey-Calavi (Lokossa)', autorisation_parentale_bool: false },
  { id: 'act-amb-03', type_actor: 'ambassador', full_name: 'Evelyne Gnahoui', phone: '+229 95 12 34 56', email: 'e.gnahoui@ambassador.com', main_code: 'BOAF-AMB-0026', zone_id: 'z2', status: 'active', commission_rate: 4, date_integration: '2025-02-02', type_ambassadeur: 'Élève Ambassadeur', etablissement_optionnel: 'Lycée Technique d\'Agamé', responsable_legal_optionnel: 'Aimé Gnahoui', autorisation_parentale_bool: true },
  { id: 'act-amb-04', type_actor: 'ambassador', full_name: 'Armand Degbo', phone: '+229 94 23 45 67', email: 'a.degbo@ambassador.com', main_code: 'BOAF-AMB-0027', zone_id: 'z3', status: 'active', commission_rate: 4, date_integration: '2025-02-15', type_ambassadeur: 'Jeune Ambassadeur', etablissement_optionnel: 'Collège Privé St Augustin', responsable_legal_optionnel: 'Anicet Degbo', autorisation_parentale_bool: true },
  { id: 'act-amb-05', type_actor: 'ambassador', full_name: 'Viviane Zomahe', phone: '+229 93 34 56 78', email: 'v.zomahe@ambassador.com', main_code: 'BOAF-AMB-0028', zone_id: 'z4', status: 'active', commission_rate: 4.5, date_integration: '2025-02-28', type_ambassadeur: 'Influenceur Local', etablissement_optionnel: 'Blogueuse Culinaire', autorisation_parentale_bool: false },
  { id: 'act-amb-06', type_actor: 'ambassador', full_name: 'Modeste Kpadonou', phone: '+229 92 45 67 89', email: 'm.kpadonou@ambassador.com', main_code: 'BOAF-AMB-0029', zone_id: 'z5', status: 'active', commission_rate: 4, date_integration: '2025-03-05', type_ambassadeur: 'Élève Ambassadeur', etablissement_optionnel: 'Lycée Agricole Athiémé', responsable_legal_optionnel: 'Hubert Kpadonou', autorisation_parentale_bool: true },
  { id: 'act-amb-07', type_actor: 'ambassador', full_name: 'Chantal Hounsa', phone: '+229 91 56 78 90', email: 'c.hounsa@ambassador.com', main_code: 'BOAF-AMB-0030', zone_id: 'z1', status: 'active', commission_rate: 4, date_integration: '2025-03-18', type_ambassadeur: 'Jeune Ambassadeur', etablissement_optionnel: 'Collège de Houinvié', responsable_legal_optionnel: 'Félix Hounsa', autorisation_parentale_bool: true },
  { id: 'act-amb-08', type_actor: 'ambassador', full_name: 'Thierry Aguiah', phone: '+229 90 67 89 01', email: 't.aguiah@ambassador.com', main_code: 'BOAF-AMB-0031', zone_id: 'z2', status: 'active', commission_rate: 4.5, date_integration: '2025-04-01', type_ambassadeur: 'Influenceur Local', etablissement_optionnel: 'Animateur Radio Lokossa FM', autorisation_parentale_bool: false },
  { id: 'act-amb-09', type_actor: 'ambassador', full_name: 'Sylvestre Codjia', phone: '+229 61 78 90 12', email: 's.codjia@ambassador.com', main_code: 'BOAF-AMB-0032', zone_id: 'z3', status: 'active', commission_rate: 4, date_integration: '2025-04-10', type_ambassadeur: 'Élève Ambassadeur', etablissement_optionnel: 'Lycée Technique Lokossa', responsable_legal_optionnel: 'Simon Codjia', autorisation_parentale_bool: true },
  { id: 'act-amb-10', type_actor: 'ambassador', full_name: 'Claude Akou', phone: '+229 62 89 01 23', email: 'c.akou@ambassador.com', main_code: 'BOAF-AMB-0033', zone_id: 'z4', status: 'suspended', commission_rate: 4, date_integration: '2025-04-20', type_ambassadeur: 'Jeune Ambassadeur', etablissement_optionnel: 'Collège d\'Ouèdèmè', responsable_legal_optionnel: 'Barthélémy Akou', autorisation_parentale_bool: true },

  // Collaborateurs (5 items required)
  { id: 'act-col-01', type_actor: 'collaborator', full_name: 'Sébastien Houndjo Jr', phone: '+229 63 90 12 34', email: 's.houndjojr@boaf.com', main_code: 'BOAF-COL-0011', zone_id: 'z3', status: 'active', commission_rate: 3, date_integration: '2025-01-12' },
  { id: 'act-col-02', type_actor: 'collaborator', full_name: 'Véronique Tossavi', phone: '+229 64 01 23 45', email: 'v.tossavi@boaf.com', main_code: 'BOAF-COL-0012', zone_id: 'z1', status: 'active', commission_rate: 3.5, date_integration: '2025-01-25' },
  { id: 'act-col-03', type_actor: 'collaborator', full_name: 'Solange Houéfa', phone: '+229 65 12 34 56', email: 's.houefa@boaf.com', main_code: 'BOAF-COL-0013', zone_id: 'z2', status: 'active', commission_rate: 3.2, date_integration: '2025-02-14' },
  { id: 'act-col-04', type_actor: 'collaborator', full_name: 'Augustine Codjo', phone: '+229 66 23 45 67', email: 'a.codjo@boaf.com', main_code: 'BOAF-COL-0014', zone_id: 'z4', status: 'active', commission_rate: 3, date_integration: '2025-03-02' },
  { id: 'act-col-05', type_actor: 'collaborator', full_name: 'Félicienne Sossa', phone: '+229 67 34 56 78', email: 'f.sossa@boaf.com', main_code: 'BOAF-COL-0015', zone_id: 'z5', status: 'active', commission_rate: 3, date_integration: '2025-04-01' }
];

// Generate 30 Active Promo Codes of correct formats
export const DEFAULT_PROMO_CODES: PromoCode[] = [
  ...DEFAULT_ACTORS.map((act, idx) => {
    let prefix = 'BOAF-AGT';
    if (act.type_actor === 'partner') prefix = 'BOAF-PART';
    else if (act.type_actor === 'ambassador') prefix = 'BOAF-AMB';
    else if (act.type_actor === 'collaborator') prefix = 'BOAF-COL';
    else if (act.type_actor === 'employee') prefix = 'BOAF-EMP';

    // Formats mapping
    const codeStr = `${prefix}-${act.main_code.split('-').pop()}`;

    return {
      id: `code-${act.id}`,
      code: codeStr,
      type_code: prefix,
      actor_id: act.id,
      zone_id: act.zone_id,
      status: (idx === 8 || idx === 18 || idx === 28) ? 'suspended' : 'active' as CodeStatus,
      starts_at: '2025-01-01',
      expires_at: '2027-12-31',
      created_at: '2025-01-01'
    };
  }),
  { id: 'code-extra-01', code: 'BOAF-ECO-0007', type_code: 'BOAF-ECO', actor_id: 'act-amb-01', status: 'active', starts_at: '2026-05-01', expires_at: '2026-12-31', created_at: '2026-05-01' },
  { id: 'code-extra-02', code: 'BOAF-EGL-0004', type_code: 'BOAF-EGL', actor_id: 'act-part-04', status: 'active', starts_at: '2026-05-10', expires_at: '2026-11-30', created_at: '2026-05-10' },
  { id: 'code-extra-03', code: 'BOAF-EVT-260615-001', type_code: 'BOAF-EVT', actor_id: 'act-agt-01', status: 'active', starts_at: '2026-06-01', expires_at: '2026-06-20', created_at: '2026-06-01' },
  { id: 'code-extra-04', code: 'BOAF-EGL-0012', type_code: 'BOAF-EGL', actor_id: 'act-part-09', status: 'active', starts_at: '2026-01-10', expires_at: '2026-12-31', created_at: '2026-01-10' },
  { id: 'code-extra-05', code: 'BOAF-DIG-0099', type_code: 'BOAF-DIG', actor_id: 'act-emp-04', status: 'active', starts_at: '2026-02-01', expires_at: '2026-12-31', created_at: '2026-02-01' }
];

// Generate 50 realistic historical orders/sales yielding various commissions
export const DEFAULT_ORDERS: Order[] = [];
export const DEFAULT_COMMISSIONS: Commission[] = [];

// Let's seed orders and commissions programmatically to match exactly 50+ entries
const seedSales = () => {
  const sources = ['WhatsApp', 'Direct', 'Terrain', 'Partenaire', 'Événement'];
  const paymentModes = ['Espèces', 'Mobile Money', 'Virement', 'Chèque'];
  const dates = [
    '2026-05-25T14:30:00Z',
    '2026-05-26T10:15:00Z',
    '2026-05-27T08:45:00Z',
    '2026-05-28T16:20:00Z',
    '2026-05-29T11:00:00Z',
    '2026-05-30T17:35:00Z',
    '2026-05-31T09:10:00Z',
    '2026-06-01T15:50:00Z',
    '2026-06-02T13:12:00Z',
    '2026-06-03T09:44:00Z'
  ];

  // Primary actors for commissions
  const agents = DEFAULT_ACTORS.filter(a => a.type_actor === 'agent');
  const partners = DEFAULT_ACTORS.filter(a => a.type_actor === 'partner');
  const ambassadors = DEFAULT_ACTORS.filter(a => a.type_actor === 'ambassador');
  const commissionActors = [...agents, ...partners, ...ambassadors];

  for (let i = 1; i <= 52; i++) {
    // Determine dynamic values
    const act = commissionActors[(i - 1) % commissionActors.length];
    const code = DEFAULT_PROMO_CODES.find(c => c.actor_id === act.id) || DEFAULT_PROMO_CODES[0];
    const dateStr = dates[i % dates.length];
    
    // Choose products
    const productItems = [
      { ...DEFAULT_PRODUCTS[0], qty: ((i % 3) + 1) * 10 },    // Pain sucré
      { ...DEFAULT_PRODUCTS[1], qty: ((i % 2) + 1) * 20 },    // Pain ordinaire
      { ...DEFAULT_PRODUCTS[3], qty: i % 4 === 0 ? 5 : 0 },   // Goûter deluxe
      { ...DEFAULT_PRODUCTS[5], qty: i % 7 === 0 ? 3 : 0 }    // Pâtisserie
    ].filter(item => item.qty > 0);

    const items = productItems.map(p => ({
      product_id: p.id,
      nom: p.nom,
      quantite: p.qty,
      prix_unitaire: p.prix,
      total_ligne: p.qty * p.prix
    }));

    const total_brut = items.reduce((acc, curr) => acc + curr.total_ligne, 0);
    const hasDiscount = code.status === 'active';
    const remise = hasDiscount ? Math.round(total_brut * 0.05) : 0; // 5% flat promo discount
    const total_net = total_brut - remise;

    const t_num = `TK-2026060${Math.floor((i / 8) + i % 3)}-${String(i).padStart(6, '0')}`;
    const order_id = `ord-${i}`;

    const newOrder: Order = {
      id: order_id,
      ticket_number: t_num,
      customer_name: i % 2 === 0 ? `Client ${YORUBA_FON_NAMES[i % YORUBA_FON_NAMES.length]}` : `Anonyme Lokossa ${i}`,
      customer_phone: i % 3 === 0 ? `+229 97 ${String(100000 + i * 29).slice(0, 6)}` : undefined,
      code_promo_id: code.id,
      code_promo_text: code.code,
      items,
      total_brut,
      remise,
      total_net,
      payment_status: i % 15 === 0 ? 'unpaid' : 'paid',
      order_status: i % 25 === 0 ? 'cancelled' : 'valid',
      payment_mode: paymentModes[i % paymentModes.length],
      source: i % 2 === 0 ? 'Terrain' : sources[i % sources.length],
      created_by: 'act-emp-04',
      created_at: dateStr,
      cancellation_reason: i % 25 === 0 ? 'Erreur de saisie s\'est produite' : undefined
    };

    DEFAULT_ORDERS.push(newOrder);

    // Add Commission with state: pending, validated, rejected, paid
    if (newOrder.order_status === 'valid' && newOrder.payment_status === 'paid') {
      const activeRate = act.commission_rate || 5;
      const amountComm = Math.round(newOrder.total_net * (activeRate / 100));

      let commStatus: CommissionStatus = 'pending';
      if (i < 20) commStatus = 'paid';
      else if (i < 40) commStatus = 'validated';
      else if (i === 45) commStatus = 'rejected';

      const newComm: Commission = {
        id: `comm-${i}`,
        order_id: order_id,
        ticket_number: t_num,
        actor_id: act.id,
        actor_name: act.full_name,
        actor_type: act.type_actor,
        promo_code_id: code.id,
        promo_code_text: code.code,
        montant_vente: total_net,
        taux: activeRate,
        montant_commission: amountComm,
        statut: commStatus,
        validated_by: commStatus !== 'pending' ? 'act-emp-02' : undefined,
        validated_at: commStatus !== 'pending' ? dateStr : undefined,
        paid_at: commStatus === 'paid' ? dateStr : undefined,
        created_at: dateStr
      };

      DEFAULT_COMMISSIONS.push(newComm);
    }
  }
};

seedSales();

// 7 Days Attendance Log database for agent_id listed in DEFAULT_ACTORS
export const DEFAULT_ATTENDANCE_LOGS: AttendanceLog[] = [
  // Missions for Today: 2026-06-03
  {
    id: 'att-today-1',
    agent_id: 'act-agt-01',
    agent_name: 'Eric Adjovi',
    agent_code: 'BOAF-AGT-0234',
    date: '2026-06-03',
    start_time_prevu: '08:00',
    end_time_prevu: '16:00',
    status: 'in_progress', // Mission en cours
    zone_id: 'z1',
    zone_name: 'Lokossa Centre',
    lieu_precis: 'Carrefour Central de Lokossa',
    objectif: 'Vente directe & Prospection',
    produits_presentes: ['Pain sucré Premium', 'Pain ordinaire'],
    code_promo_lie: 'BOAF-AGT-0234',
    checkin_at: '2026-06-03T07:55:00Z',
    lat_in: 6.6433,
    lng_in: 1.7167,
    note: 'Arrivé avec vélo garni de pains frais, forte demande près des banques.',
    contacts_count: 14,
    ventes_count: 28,
    montant_vendu: 15200,
    difficulties: 'Léger vent de poussière le matin.'
  },
  {
    id: 'att-today-2',
    agent_id: 'act-agt-02',
    agent_name: 'Grace Houngbédji',
    agent_code: 'BOAF-AGT-0235',
    date: '2026-06-03',
    start_time_prevu: '08:30',
    end_time_prevu: '17:00',
    status: 'arrived', // Je suis arrivé
    zone_id: 'z2',
    zone_name: 'Agamé',
    lieu_precis: 'Grand Marché d\'Agamé',
    objectif: 'Distribution de prospectus & Vente',
    produits_presentes: ['Formule Petit-Déjeuner complet'],
    code_promo_lie: 'BOAF-AGT-0235',
    checkin_at: '2026-06-03T08:25:00Z',
    lat_in: 6.6789,
    lng_in: 1.6321,
    note: 'Installation du stand promotionnel terminée. Distribution en cours.',
    contacts_count: 5,
    ventes_count: 0,
    montant_vendu: 0
  },
  {
    id: 'att-today-3',
    agent_id: 'act-agt-03',
    agent_name: 'Felicien Gbaguidi',
    agent_code: 'BOAF-AGT-0236',
    date: '2026-06-03',
    start_time_prevu: '09:00',
    end_time_prevu: '15:00',
    status: 'completed', // Mission terminée
    zone_id: 'z3',
    zone_name: 'Houinvié',
    lieu_precis: 'Collège de Houinvié',
    objectif: 'Promotion d’un produit',
    produits_presentes: ['Goûter Scolaire Deluxe'],
    code_promo_lie: 'BOAF-AGT-0236',
    checkin_at: '2026-06-03T08:50:00Z',
    checkout_at: '2026-06-03T15:10:00Z',
    lat_in: 6.6212,
    lng_in: 1.7345,
    note: 'Forte affluence d\'élèves durant la récréation de 10h. Tout le stock est écoulé.',
    contacts_count: 42,
    ventes_count: 65,
    montant_vendu: 32500,
    difficulties: 'Rupture de stock de jus de fruits dès 11h.'
  },
  {
    id: 'att-today-4',
    agent_id: 'act-agt-04',
    agent_name: 'Juliette Keke',
    agent_code: 'BOAF-AGT-0237',
    date: '2026-06-03',
    start_time_prevu: '08:00',
    end_time_prevu: '16:00',
    status: 'postponed', // Mission reportée
    zone_id: 'z4',
    zone_name: 'Ouèdèmè',
    lieu_precis: 'Église Protestante de Ouèdèmè',
    objectif: 'Suivi partenaire',
    produits_presentes: ['Prestation Traiteur (par convive)'],
    code_promo_lie: 'BOAF-AGT-0237',
    note: 'Le Pasteur est absent pour un synode d\'urgence à Cotonou.',
    difficulties: 'Pasteur absent. Mission reprogrammée à samedi matin.'
  },
  {
    id: 'att-today-5',
    agent_id: 'act-agt-05',
    agent_name: 'Christian Lokossou',
    agent_code: 'BOAF-AGT-0238',
    date: '2026-06-03',
    start_time_prevu: '08:00',
    end_time_prevu: '12:00',
    status: 'absent', // Absent
    zone_id: 'z5',
    zone_name: 'Athiémé Centre',
    lieu_precis: 'Mairie d\'Athiémé',
    objectif: 'Collecte de contacts',
    produits_presentes: ['Repas du Jour chaud'],
    code_promo_lie: 'BOAF-AGT-0238',
    note: 'Maladie déclarée ce matin.',
    difficulties: 'Forte fièvre signalée ce matin par téléphone. Remplaçant indisponible.'
  },

  // Historic logged missions
  {
    id: 'att-1',
    agent_id: 'act-agt-01',
    agent_name: 'Eric Adjovi',
    agent_code: 'BOAF-AGT-0234',
    date: '2026-05-28',
    start_time_prevu: '08:00',
    end_time_prevu: '16:00',
    checkin_at: '2026-05-28T07:45:00Z',
    checkout_at: '2026-05-28T16:00:00Z',
    lat_in: 6.6433,
    lng_in: 1.7167,
    lat_out: 6.6429,
    lng_out: 1.7155,
    accuracy_m: 8.5,
    status: 'present', // treated as present / completed
    zone_id: 'z1',
    zone_name: 'Lokossa Centre',
    lieu_precis: 'Administration publique Lokossa',
    objectif: 'Vente directe',
    produits_presentes: ['Pain sucré Premium', 'Pain ordinaire'],
    code_promo_lie: 'BOAF-AGT-0234',
    note: 'Arrivé sur site avec vélo garni de pains frais.',
    contacts_count: 8,
    ventes_count: 24,
    montant_vendu: 12400
  },
  {
    id: 'att-2',
    agent_id: 'act-agt-02',
    agent_name: 'Grace Houngbédji',
    agent_code: 'BOAF-AGT-0235',
    date: '2026-05-28',
    start_time_prevu: '08:30',
    end_time_prevu: '17:30',
    checkin_at: '2026-05-28T08:15:00Z',
    checkout_at: '2026-05-28T17:30:00Z',
    lat_in: 6.6789,
    lng_in: 1.6321,
    lat_out: 6.6795,
    lng_out: 1.6315,
    accuracy_m: 12.2,
    status: 'present',
    zone_id: 'z2',
    zone_name: 'Agamé',
    lieu_precis: 'Écoles d\'Agamé',
    objectif: 'Distribution de prospectus',
    code_promo_lie: 'BOAF-AGT-0235',
    note: 'Vente auprès des écoles primaires de la localité.',
    contacts_count: 15,
    ventes_count: 30,
    montant_vendu: 15000
  },
  {
    id: 'att-3',
    agent_id: 'act-agt-03',
    agent_name: 'Felicien Gbaguidi',
    agent_code: 'BOAF-AGT-0236',
    date: '2026-05-29',
    start_time_prevu: '08:00',
    end_time_prevu: '16:00',
    checkin_at: '2026-05-29T09:12:00Z', // Late
    checkout_at: '2026-05-29T16:30:00Z',
    lat_in: 6.6212,
    lng_in: 1.7345,
    lat_out: 6.6210,
    lng_out: 1.7340,
    accuracy_m: 10.0,
    status: 'late',
    zone_id: 'z3',
    zone_name: 'Houinvié',
    lieu_precis: 'Carrefour Houinvié',
    objectif: 'Vente directe',
    code_promo_lie: 'BOAF-AGT-0236',
    note: 'Retard suite à un incident technique de kiosque mobile.',
    contacts_count: 6,
    ventes_count: 14,
    montant_vendu: 7500,
    difficulties: 'Pneu crevé sur le trajet.'
  }
];

// Seed raw Prospects (prospects and clients section)
export const DEFAULT_PROSPECTS: Prospect[] = [
  { id: 'prsp-1', nom: 'Mme Christine Sossa', telephone: '+229 95 44 88 12', besoin: 'Commande groupée gouter scolaire', source: 'WhatsApp', code_promo: 'BOAF-ECO-0007', statut: 'contacte', date_relance: '2026-06-10', note: 'École maternelle Lokossa, attente devis final', created_at: '2026-05-25T10:00:00Z' },
  { id: 'prsp-2', nom: 'Eglise Baptiste d\'Agamé', telephone: '+229 96 22 11 00', besoin: 'Fourniture de pain régulier pour cultes', source: 'Direct', code_promo: 'BOAF-EGL-0004', statut: 'converted', note: 'Convertie en client fidèle du Relais Agamé', created_at: '2026-05-26T09:30:00Z' },
  { id: 'prsp-3', nom: 'Hôtel Splendide Lokossa', telephone: '+229 97 12 34 88', besoin: 'Livraison de petits-déjeuners éco', source: 'Partenaire', statut: 'nouveau', date_relance: '2026-06-05', note: 'Demande d\'échantillonnage de pain sucré', created_at: '2026-06-01T15:00:00Z' }
];

// Operational activity log standard
export const DEFAULT_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'log-1', user_id: 'act-emp-01', user_name: 'Jean Doussou', user_role: 'Administrateur', action: 'Initialisation de la base de données', entity_type: 'system', entity_id: '0', created_at: '2026-05-01T08:00:00Z' },
  { id: 'log-2', user_id: 'act-emp-02', user_name: 'Diana Biokou', user_role: 'Superviseur', action: 'Validation de commission', entity_type: 'commission', entity_id: 'comm-1', old_value: 'pending', new_value: 'validated', created_at: '2026-06-02T15:00:00Z' },
  { id: 'log-3', user_id: 'act-emp-04', user_name: 'Sylvie Kode', user_role: 'WhatsApp / Vente', action: 'Création d\'une commande', entity_type: 'order', entity_id: 'ord-12', created_at: '2026-06-03T09:30:00Z' }
];

interface PlatformStore {
  zones: Zone[];
  actors: Actor[];
  products: Product[];
  promoCodes: PromoCode[];
  orders: Order[];
  commissions: Commission[];
  attendanceLogs: AttendanceLog[];
  prospects: Prospect[];
  activityLogs: ActivityLog[];
}

const STORAGE_KEY = 'boaf_delices_db';

export function getStoredData(): PlatformStore {
  if (typeof window === 'undefined') {
    return {
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
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initialStore = {
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStore));
    return initialStore;
  }

  try {
    return JSON.parse(stored);
  } catch (err) {
    console.error('Error parsing stored data', err);
    return {
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
  }
}

export function saveToStoredData(data: PlatformStore) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
