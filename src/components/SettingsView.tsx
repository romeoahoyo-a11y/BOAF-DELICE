import React, { useState } from 'react';
import {
  Settings,
  Coins,
  MapPin,
  Package,
  RotateCcw,
  Smartphone,
  Save,
  ShieldCheck,
  Plus,
  Trash2
} from 'lucide-react';
import { Zone, Product, Actor } from '../types';

interface SettingsViewProps {
  zones: Zone[];
  products: Product[];
  actors: Actor[];
  onResetDatabase: () => void;
  onUpdateZones: (zones: Zone[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  currentRole: string; // admin, superviseur etc
}

export default function SettingsView({
  zones,
  products,
  actors,
  onResetDatabase,
  onUpdateZones,
  onUpdateProducts,
  currentRole
}: SettingsViewProps) {
  // Configured Commission Rates default values states
  const [commPainMin, setCommPainMin] = useState(3);
  const [commPainMax, setCommPainMax] = useState(5);
  const [commSchoolMin, setCommSchoolMin] = useState(5);
  const [commSchoolMax, setCommSchoolMax] = useState(8);
  const [commPatisMin, setCommPatisMin] = useState(3);
  const [commPatisMax, setCommPatisMax] = useState(7);
  const [commTraiteurMin, setCommTraiteurMin] = useState(2);
  const [commTraiteurMax, setCommTraiteurMax] = useState(5);

  const isReadOnly = currentRole === 'lecteur' || currentRole === 'whatsapp' || currentRole === 'agent';

  // Zone addition controls
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCommune, setNewZoneCommune] = useState('Lokossa');
  const [newZoneLat, setNewZoneLat] = useState(6.6433);
  const [newZoneLng, setNewZoneLng] = useState(1.7167);
  const [newZoneRadius, setNewZoneRadius] = useState(1500);

  // Product addition controls
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(150);
  const [newProdCat, setNewProdCat] = useState('Pain');

  // Add Zone callback handler
  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName) return;

    const newZone: Zone = {
      id: `z-gen-${Date.now()}`,
      nom: newZoneName,
      commune: newZoneCommune,
      departement: 'Mono',
      latitude: newZoneLat,
      longitude: newZoneLng,
      rayon_metre: newZoneRadius,
      description: 'Nouveau secteur d\'activités terrain paramétré'
    };

    onUpdateZones([...zones, newZone]);
    setNewZoneName('');
    alert(`Nouvelle zone de livraison "${newZoneName}" ajoutée.`);
  };

  const handleRemoveZone = (id: string) => {
    if (zones.length <= 2) {
      alert("Impossible de supprimer d'avantage de zones baselines.");
      return;
    }
    onUpdateZones(zones.filter(z => z.id !== id));
  };

  // Add Product callback handler
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const newProd: Product = {
      id: `p-gen-${Date.now()}`,
      nom: newProdName,
      categorie: newProdCat,
      prix: newProdPrice,
      marge_estimee: 40,
      actif: true
    };

    onUpdateProducts([...products, newProd]);
    setNewProdName('');
    alert(`Produit de boulangerie "${newProdName}" enregistré.`);
  };

  const handleRemoveProduct = (id: string) => {
    onUpdateProducts(products.filter(p => p.id !== id));
  };

  const handleSaveCommissionRules = () => {
    alert("Barème de commission indicatif mis à jour ! Tous les futurs calculs automatiques de commissions s'aligneront sur ces limites.");
  };

  // Handle baseline wipe/restore
  const handleRestoreDefaults = () => {
    if (window.confirm("Êtes-vous certain de vouloir restaurer toute la base de données aux valeurs démo usine originelles (45 acteurs, 30 codes, 50 tickets historiques) ?")) {
      onResetDatabase();
      alert("Base de données restaurée aux valeurs usines standard de BOAF Délices !");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12 text-xs">
      
      {/* 2 core row blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Commission levels setting */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6 lg:col-span-1 text-left">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <Coins className="w-5 h-5 text-orange-500" />
            <h3 className="font-display font-extrabold text-[#0B5D2A] text-sm">Barème indicatif des Commissions</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-700 block">Pains / Petits Produits (%)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={commPainMin}
                  onChange={(e) => setCommPainMin(Number(e.target.value))}
                  disabled={isReadOnly}
                  className="w-1/2 p-2 border border-gray-200 bg-slate-50 rounded-lg text-center font-bold"
                />
                <span className="self-center font-bold text-gray-400">à</span>
                <input
                  type="number"
                  value={commPainMax}
                  onChange={(e) => setCommPainMax(Number(e.target.value))}
                  disabled={isReadOnly}
                  className="w-1/2 p-2 border border-gray-200 bg-slate-50 rounded-lg text-center font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700 block">Commande groupée écoles / entreprises (%)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={commSchoolMin}
                  onChange={(e) => setCommSchoolMin(Number(e.target.value))}
                  disabled={isReadOnly}
                  className="w-1/2 p-2 border border-gray-200 bg-slate-50 rounded-lg text-center font-bold"
                />
                <span className="self-center font-bold text-gray-400">à</span>
                <input
                  type="number"
                  value={commSchoolMax}
                  onChange={(e) => setCommSchoolMax(Number(e.target.value))}
                  disabled={isReadOnly}
                  className="w-1/2 p-2 border border-gray-200 bg-slate-50 rounded-lg text-center font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700 block">Pâtisserie Événementielle (%)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={commPatisMin}
                  onChange={(e) => setCommPatisMin(Number(e.target.value))}
                  disabled={isReadOnly}
                  className="w-1/2 p-2 border border-gray-200 bg-slate-50 rounded-lg text-center font-bold"
                />
                <span className="self-center font-bold text-gray-400">à</span>
                <input
                  type="number"
                  value={commPatisMax}
                  onChange={(e) => setCommPatisMax(Number(e.target.value))}
                  disabled={isReadOnly}
                  className="w-1/2 p-2 border border-gray-200 bg-slate-50 rounded-lg text-center font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700 block">Services Traiteurs (%)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={commTraiteurMin}
                  onChange={(e) => setCommTraiteurMin(Number(e.target.value))}
                  disabled={isReadOnly}
                  className="w-1/2 p-2 border border-gray-200 bg-slate-50 rounded-lg text-center font-bold"
                />
                <span className="self-center font-bold text-gray-400">à</span>
                <input
                  type="number"
                  value={commTraiteurMax}
                  onChange={(e) => setCommTraiteurMax(Number(e.target.value))}
                  disabled={isReadOnly}
                  className="w-1/2 p-2 border border-gray-200 bg-slate-50 rounded-lg text-center font-bold"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border text-[10px] text-gray-400">
              Barème conforme aux statuts BOAF FUTURE HOLDINGS SARL / BOAF Délices de Juin 2026.
            </div>

            {!isReadOnly && (
              <button
                onClick={handleSaveCommissionRules}
                className="w-full py-2.5 bg-[#0B5D2A] text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-green-900/10 transition-all"
              >
                <Save className="w-4 h-4 text-white" />
                Enregistrer la Grille
              </button>
            )}
          </div>
        </div>

        {/* Right Column (2 parts): Managed Zones Coordinates & Products items list layout */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Managed zones parameters */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4 text-left">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500 animate-bounce" />
              <h3 className="font-display font-extrabold text-[#0B5D2A] text-sm">Aires de Livraison & Zones GPS autorisées</h3>
            </div>

            {/* List and add forms */}
            <div className="space-y-4">
              <table className="w-full ml-0 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-gray-500 font-mono text-[10px] uppercase">
                    <th className="p-2 text-left">Nom de Zone</th>
                    <th className="p-2 text-center">Commune</th>
                    <th className="p-2 text-center">Latitude</th>
                    <th className="p-2 text-center">Longitude</th>
                    <th className="p-2 text-center">Rayon (m)</th>
                    <th className="p-2 text-center w-10">Option</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {zones.map(z => (
                    <tr key={z.id} className="hover:bg-slate-50">
                      <td className="p-2 font-sans font-semibold text-gray-800">{z.nom}</td>
                      <td className="p-2 text-center font-sans text-gray-650">{z.commune}</td>
                      <td className="p-2 text-center">{z.latitude.toFixed(4)}</td>
                      <td className="p-2 text-center">{z.longitude.toFixed(4)}</td>
                      <td className="p-2 text-center font-bold text-orange-500">{z.rayon_metre} m</td>
                      <td className="p-2 text-center">
                        <button
                          disabled={isReadOnly}
                          onClick={() => handleRemoveZone(z.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!isReadOnly && (
                <form onSubmit={handleAddZone} className="p-4 bg-slate-50/60 rounded-xl border border-gray-150 grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500">Nom Zone</label>
                    <input
                      type="text"
                      required
                      placeholder="ex Athiémé"
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      className="w-full p-1.5 border border-gray-200 bg-white rounded-lg text-[11px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500">Commune</label>
                    <input
                      type="text"
                      required
                      value={newZoneCommune}
                      onChange={(e) => setNewZoneCommune(e.target.value)}
                      className="w-full p-1.5 border border-gray-200 bg-white rounded-lg text-[11px]"
                    />
                  </div>
                  <div className="space-y-1 font-mono">
                    <label className="text-[10px] text-gray-500">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={newZoneLat}
                      onChange={(e) => setNewZoneLat(Number(e.target.value))}
                      className="w-full p-1.5 border border-gray-200 bg-white rounded-lg text-[11px]"
                    />
                  </div>
                  <div className="space-y-1 font-mono">
                    <label className="text-[10px] text-gray-500">Rayon (m)</label>
                    <input
                      type="number"
                      required
                      value={newZoneRadius}
                      onChange={(e) => setNewZoneRadius(Number(e.target.value))}
                      className="w-full p-1.5 border border-gray-200 bg-white rounded-lg text-[11px]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Ajouter Zone
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Managed Products lists */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4 text-left">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              <h3 className="font-display font-extrabold text-[#0B5D2A] text-sm">Catalogue d'articles Boulangerie</h3>
            </div>

            {/* List and add form */}
            <div className="space-y-4">
              <table className="w-full ml-0 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-gray-500 font-mono text-[10px] uppercase">
                    <th className="p-2 text-left">Désignation</th>
                    <th className="p-2 text-center">Catégorie</th>
                    <th className="p-2 text-right">Tarif National</th>
                    <th className="p-2 text-center w-10">Option</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-2 font-sans font-semibold text-gray-800">{p.nom}</td>
                      <td className="p-2 text-center font-sans text-gray-500 capitalize">{p.categorie}</td>
                      <td className="p-2 text-right font-bold text-[#0B5D2A]">{p.prix.toLocaleString()} F</td>
                      <td className="p-2 text-center">
                        <button
                          disabled={isReadOnly}
                          onClick={() => handleRemoveProduct(p.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!isReadOnly && (
                <form onSubmit={handleAddProduct} className="p-4 bg-slate-50/60 rounded-xl border border-gray-150 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] text-gray-500">Nom du pain / gâteau</label>
                    <input
                      type="text"
                      required
                      placeholder="Nom du délice"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full p-1.5 border border-gray-200 bg-white rounded-lg text-[11px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500">Tarif (FCFA)</label>
                    <input
                      type="number"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      className="w-full p-1.5 border border-gray-200 bg-white rounded-lg text-[11px]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Ajouter Article
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Critical System Control Box (Reset / Seed) */}
      <div className="bg-red-50/30 p-6 rounded-3xl border border-red-150 space-y-4 text-left">
        <h4 className="font-display font-black text-red-700 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          Paramètres du Core Système & Réinitialisation
        </h4>
        <p className="text-gray-500 text-[11px] max-w-3xl leading-relaxed">
          Si vous effectuez des modifications drastiques et souhaitez d'emblée repartir avec le jeu complet certifié d'Annexe A (45 acteurs réels du réseau Lokossa, codes d'attribution et 50+ tickets historiques), veuillez déclencher le bouton ci-dessous pour forcer une ré-injection de seed.
        </p>
        <button
          onClick={handleRestoreDefaults}
          className="px-5 py-2.5 bg-red-650 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md shadow-red-900/10 cursor-pointer"
        >
          Wipe local storage & Re-injecter Seed complet (Annexe A)
        </button>
      </div>

    </div>
  );
}
