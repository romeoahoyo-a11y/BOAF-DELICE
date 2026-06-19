import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Printer,
  Share2,
  Upload,
  Check,
  X,
  FileText,
  Sparkles,
  Utensils,
  Smartphone,
  CheckCircle2,
  SmartphoneNfc,
  Clock
} from 'lucide-react';
import { Product } from '../types';

interface ProductsCatalogViewProps {
  products: Product[];
  onUpdateProducts: (newProducts: Product[]) => void;
  currentRole: string;
}

export default function ProductsCatalogView({
  products,
  onUpdateProducts,
  currentRole
}: ProductsCatalogViewProps) {
  // Mode controls
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState('Pain');
  const [prix, setPrix] = useState(150);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [disponibilite, setDisponibilite] = useState<'disponible' | 'indisponible'>('disponible');
  const [showInCatalog, setShowInCatalog] = useState(true);

  // Image preview state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Catalogue generation states
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [selectedCatalogProducts, setSelectedCatalogProducts] = useState<string[]>(
    products.filter(p => p.show_in_catalog !== false).map(p => p.id)
  );
  const [catalogTitle, setCatalogTitle] = useState('MENU DU JOUR CHAUD');
  const [catalogModel, setCatalogModel] = useState('Menu du jour');
  const [customSlogan, setCustomSlogan] = useState('Le goût qui rapproche toute la famille !');
  const [whatsappPhone, setWhatsappPhone] = useState('+229 97 12 34 56');
  const [locationText, setLocationText] = useState('Lokossa, Bénin (Face Marché Central)');

  // Categories list
  const categories = [
    'Pain',
    'Repas',
    'Jus',
    'Pâtisserie',
    'Traiteur',
    'Boisson',
    'Offre spéciale',
    'Hébergement',
    'Autre'
  ];

  // Catalogue options
  const catalogModels = [
    { key: 'Catalogue Produits', title: 'CATALOGUE DE DÉLICES BOAF' },
    { key: 'Menu du jour', title: 'MENU DU JOUR CHAUD' },
    { key: 'Catalogue Pâtisserie', title: 'FINES PÂTISSERIES ET CROISSANTS' },
    { key: 'Catalogue Boulangerie', title: 'PAINS CRUSTILLANTS ET BRIOCHES' },
    { key: 'Catalogue Repas', title: 'PLATS ET METS PRÉPARÉS' },
    { key: 'Offre spéciale', title: 'PROMOTIONS ET GRANDS BUFFETS' },
    { key: 'Catalogue événementiel', title: 'SERVICE TRAITEUR ÉVÉNEMENTIEL' }
  ];

  const isReadOnly = currentRole === 'lecteur' || currentRole === 'whatsapp' || currentRole === 'agent';

  // File Upload Helper (converts to Base64)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("L'image est trop lourde (max 2 Mo)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setImageUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearForm = () => {
    setNom('');
    setCategorie('Pain');
    setPrix(150);
    setDescription('');
    setImageUrl('');
    setImagePreview(null);
    setDisponibilite('disponible');
    setShowInCatalog(true);
    setEditingProduct(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || prix <= 0) {
      alert("Veuillez remplir les informations obligatoires.");
      return;
    }

    const newProduct: Product = {
      id: `p-dyn-${Date.now()}`,
      nom,
      categorie,
      prix: Number(prix),
      marge_estimee: 40,
      actif: true,
      description,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80',
      disponibilite,
      show_in_catalog: showInCatalog,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onUpdateProducts([newProduct, ...products]);
    setShowAddForm(false);
    clearForm();
    alert(`Produit "${nom}" ajouté au catalogue.`);
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProduct(p);
    setNom(p.nom);
    setCategorie(p.categorie);
    setPrix(p.prix);
    setDescription(p.description || '');
    setImageUrl(p.image_url || '');
    setImagePreview(p.image_url || null);
    setDisponibilite(p.disponibilite || 'disponible');
    setShowInCatalog(p.show_in_catalog !== false);
    setShowAddForm(true);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated = products.map(p => {
      if (p.id === editingProduct.id) {
        return {
          ...p,
          nom,
          categorie,
          prix: Number(prix),
          description,
          image_url: imageUrl,
          disponibilite,
          show_in_catalog: showInCatalog,
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    onUpdateProducts(updated);
    setShowAddForm(false);
    clearForm();
    alert("Produit mis à jour avec succès !");
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Êtes-vous sûr d'archiver ce produit ? Il n'apparaîtra plus dans le listing actif.")) {
      const updated = products.filter(p => p.id !== id);
      onUpdateProducts(updated);
      alert("Produit archivé.");
    }
  };

  const handleToggleCatalogStatus = (id: string) => {
    const updated = products.map(p => {
      if (p.id === id) {
        const newStatus = !(p.show_in_catalog !== false);
        return { ...p, show_in_catalog: newStatus };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  // Change model default and title
  const handleModelChange = (modelName: string) => {
    const chosen = catalogModels.find(m => m.key === modelName);
    if (chosen) {
      setCatalogModel(modelName);
      setCatalogTitle(chosen.title);
    }
  };

  const handlePrintCatalog = () => {
    window.print();
  };

  // Build formatted text for Whatsapp copy
  const getWhatsAppMessageText = () => {
    const selectedProds = products.filter(p => selectedCatalogProducts.includes(p.id));
    let text = `👑 _*BOAF DÉLICES FUTURE HOLDINGS*_\n`;
    text += `📍 *${locationText}*\n`;
    text += `📞 WhatsApp : *${whatsappPhone}*\n\n`;
    text += `⭐ *${catalogTitle}* ⭐\n`;
    text += `📅 _Catalogue mis à jour le ${new Date().toLocaleDateString('fr-FR')}_\n`;
    text += `----------------------------------------------\n\n`;

    selectedProds.forEach(p => {
      const statusLabel = p.disponibilite === 'indisponible' ? '❌ [Rupture de stock]' : '';
      text += `🔸 *${p.nom}* (${p.categorie})\n`;
      text += `💰 *${p.prix.toLocaleString('fr-FR')} FCFA* ${statusLabel}\n`;
      if (p.description) text += `📝 _${p.description}_\n`;
      text += `\n`;
    });

    text += `----------------------------------------------\n`;
    text += `👉 *Contactez-nous directement pour vos commandes !*`;
    return encodeURIComponent(text);
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      {/* Upper header */}
      <div className="bg-white dark:bg-[#0f1a30] p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors no-print">
        <div>
          <h2 className="text-xl font-display font-black text-[#0B5D2A] dark:text-green-400 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            Catalogue Produits BOAF Délices
          </h2>
          <p className="text-xs text-gray-555 dark:text-slate-400 mt-1 leading-normal">
            Gérez les articles de boulangerie, de traiteur et d’hébergement. Générez instantanément vos catalogues A4 prêts à imprimer avec entête BOAF officielle.
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setShowCatalogModal(true)}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 font-extrabold text-white uppercase rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/10 cursor-pointer border-none"
            >
              <Printer className="w-4 h-4" />
              Créer catalogue A4
            </button>

            <button
              onClick={() => {
                clearForm();
                setShowAddForm(true);
              }}
              className="px-4 py-2.5 bg-[#0B5D2A] hover:bg-[#12823c] font-extrabold text-white uppercase rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-green-900/10 cursor-pointer border-none"
            >
              <Plus className="w-4 h-4" />
              Ajouter un produit
            </button>
          </div>
        )}
      </div>

      {/* Adding / Editing Modal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-905/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-xs no-print">
          <div className="bg-white dark:bg-[#111c33] max-w-lg w-full rounded-[28px] border border-gray-100 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors flex flex-col max-h-[90vh]">
            <div className="bg-[#0B5D2A] p-5 text-white flex justify-between items-center shrink-0">
              <h3 className="font-display font-black text-sm uppercase">
                {editingProduct ? '✏️ Éditer le produit' : '📦 Nouveau produit pour le catalogue'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  clearForm();
                }}
                className="text-white bg-transparent border-none opacity-60 hover:opacity-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingProduct ? handleSaveEditProduct : handleCreateProduct}
              className="p-6 space-y-4 overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Pain sucré aux raisins, etc."
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-xl focus:outline-none font-bold placeholder-gray-400 dark:placeholder-slate-500"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">
                    Catégorie *
                  </label>
                  <select
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-xl focus:outline-none font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Price */}
                <div className="space-y-1">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">
                    Prix de vente (FCFA) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={prix}
                    onChange={(e) => setPrix(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-xl focus:outline-none font-mono font-black text-[#0B5D2A] dark:text-green-400"
                  />
                </div>
              </div>

              {/* Short description */}
              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">
                  Description courte du produit
                </label>
                <textarea
                  placeholder="Caractéristiques, goûts particuliers ou tailles, ex. un délice croustillant pour vos goûters d'après-midi..."
                  maxLength={180}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-xl focus:outline-none h-20 text-[11px] placeholder-gray-400 dark:placeholder-slate-500"
                />
              </div>

              {/* Image Manager */}
              <div className="space-y-2">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">
                  Image du produit (Optionnel)
                </label>
                
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-905 p-3 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
                  <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0 border border-gray-100 dark:border-slate-850">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 italic text-[10px]">Néant</span>
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-tight">
                      Chargez une photo locale ou tapez un lien absolu ci-dessous.
                    </p>
                    
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-1 px-3 bg-slate-200 dark:bg-slate-800 text-gray-700 dark:text-slate-350 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold rounded-lg cursor-pointer flex items-center gap-1 border-none text-[10.5px]"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Choisir un fichier
                      </button>

                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageUrl('');
                          }}
                          className="py-1 px-3 bg-red-50 hover:bg-red-100 text-red-650 font-semibold rounded-lg cursor-pointer border-none text-[10.5px]"
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <input
                  type="text"
                  placeholder="Ou entrez un lien URL absolu d’image (ex. Unsplash)"
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setImageUrl(val);
                    setImagePreview(val || null);
                  }}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-xl focus:outline-none placeholder-gray-400 dark:placeholder-slate-500 font-mono text-[10px]"
                />
              </div>

              {/* Availability & Catalog checkboxes */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50/60 dark:bg-slate-900/60 p-4 rounded-2xl border border-gray-150 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">
                    Disponibilité générale
                  </label>
                  <div className="flex gap-2.5 mt-1">
                    <label className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        checked={disponibilite === 'disponible'}
                        onChange={() => setDisponibilite('disponible')}
                        className="accent-green-600"
                      />
                      Disponible
                    </label>
                    <label className="flex items-center gap-1.5 font-semibold text-red-600 cursor-pointer">
                      <input
                        type="radio"
                        checked={disponibilite === 'indisponible'}
                        onChange={() => setDisponibilite('indisponible')}
                        className="accent-red-600"
                      />
                      En Rupture
                    </label>
                  </div>
                </div>

                <div className="space-y-1 flex flex-col justify-center">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">
                    Statut Catalogue
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-200 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={showInCatalog}
                      onChange={(e) => setShowInCatalog(e.target.checked)}
                      className="accent-orange-500 w-4 h-4 rounded"
                    />
                    <span>Afficher dans le catalogue</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2.5 pt-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    clearForm();
                  }}
                  className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase rounded-xl border-none cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase rounded-xl border-none cursor-pointer shadow-md shadow-orange-500/10"
                >
                  {editingProduct ? '✓ Mettre à jour' : '✓ Enregistrer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAIN SCREEN: grid of products and direct overview list (Section C/Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start no-print">
        {/* Left pane: Small quick action cards or stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0f1a30] p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs text-left transition-colors">
            <h3 className="font-display font-bold text-gray-900 dark:text-slate-100 text-sm flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
              Chiffres Clés du Catalogue
            </h3>
            
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-gray-100 dark:border-slate-800/80 text-left">
                <span className="text-[10px] text-gray-400 dark:text-slate-500 block font-mono uppercase font-black">Actifs</span>
                <span className="text-xl font-black text-[#0B5D2A] dark:text-green-400 font-mono">
                  {products.length}
                </span>
                <span className="text-[9px] text-gray-400 block font-sans">produits en vente</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-gray-100 dark:border-slate-800/80 text-left">
                <span className="text-[10px] text-gray-400 dark:text-slate-500 block font-mono uppercase font-black">A4 Catalogue</span>
                <span className="text-xl font-black text-orange-500 font-mono">
                  {products.filter(p => p.show_in_catalog !== false).length}
                </span>
                <span className="text-[9px] text-gray-400 block font-sans">articles autorisés</span>
              </div>

              <div className="bg-[#FFF9F6] dark:bg-[#152342] p-3 rounded-2xl border border-orange-50 dark:border-slate-800/80 text-left col-span-2">
                <span className="text-[10px] text-orange-600 block font-mono uppercase font-black">En Rupture</span>
                <span className="text-md font-bold text-orange-700 dark:text-orange-400">
                  {products.filter(p => p.disponibilite === 'indisponible').length} produits temporairement épuisés
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/50 dark:border-slate-800/80 text-[10.5px] text-gray-550 dark:text-slate-400 leading-normal">
              ℹ️ Pour générer un nouveau menu imprimable, cliquez sur le bouton <strong className="text-[#0B5D2A] dark:text-green-400">Créer catalogue A4</strong> ci-dessus. Vous pourrez filtrer les produits de boulangerie à afficher sur la page imprimable.
            </div>
          </div>
        </div>

        {/* Right pane: Core product lists with miniature and action keys */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f1a30] p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3 flex-wrap gap-2 text-left">
            <div>
              <h3 className="font-display font-extrabold text-[#0B5D2A] dark:text-green-400 text-sm">
                📋 Liste commerciale des produits
              </h3>
              <p className="text-[11.5px] text-gray-400 font-sans mt-0.5">Cliquez sur l'œil pour masquer ou afficher rapidement un produit du catalogue A4.</p>
            </div>
          </div>

          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-gray-200 dark:border-slate-800 text-gray-450 dark:text-slate-400 uppercase font-mono tracking-wider text-[9px]">
                  <th className="py-2.5 px-3">Produit</th>
                  <th className="py-2.5 px-3">Catégorie</th>
                  <th className="py-2.5 px-3 text-right">Tarif (FCFA)</th>
                  <th className="py-2.5 px-3 text-center">Disponibilité</th>
                  <th className="py-2.5 px-3 text-center">Catalogue</th>
                  {!isReadOnly && <th className="py-2.5 px-3 text-center w-24">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {products.length > 0 ? (
                  products.map(p => {
                     const showInCat = p.show_in_catalog !== false;
                     return (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        {/* Miniature and name */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-gray-200 dark:border-slate-805 shrink-0">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.nom} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold uppercase bg-slate-50 text-[9px]">
                                  BOAF
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 dark:text-slate-205 block leading-tight">{p.nom}</span>
                              {p.description && (
                                <span className="text-[10px] text-gray-400 dark:text-slate-500 block truncate max-w-[200px] mt-0.5 font-sans italic">{p.description}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-850 text-gray-700 dark:text-slate-350 text-[9.5px] rounded-md font-sans">
                            {p.categorie}
                          </span>
                        </td>

                        {/* Price formatted */}
                        <td className="py-3 px-3 text-right font-bold text-gray-950 dark:text-slate-200 font-mono">
                          {p.prix.toLocaleString('fr-FR')} F
                        </td>

                        {/* Availability */}
                        <td className="py-3 px-3 text-center">
                          {p.disponibilite === 'indisponible' ? (
                            <span className="px-2 py-0.5 bg-red-50 dark:bg-red-955/20 text-red-700 dark:text-red-405 font-bold font-sans text-[9px] rounded-md uppercase">
                              Épuisé
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-405 font-bold font-sans text-[9px] rounded-md uppercase">
                              Disponible
                            </span>
                          )}
                        </td>

                        {/* Show in catalogue indicator */}
                        <td className="py-3 px-3 text-center">
                          <button
                            disabled={isReadOnly}
                            onClick={() => handleToggleCatalogStatus(p.id)}
                            title={showInCat ? "Affiché sur le catalogue A4" : "Masqué du catalogue A4"}
                            className="bg-transparent border-none cursor-pointer opacity-80 hover:opacity-100 disabled:opacity-40"
                          >
                            {showInCat ? (
                              <Eye className="w-5 h-5 text-[#0B5D2A] dark:text-green-400" />
                            ) : (
                              <EyeOff className="w-5 h-5 text-gray-350" />
                            )}
                          </button>
                        </td>

                        {/* Action buttons */}
                        {!isReadOnly && (
                          <td className="py-3 px-3 text-center">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => handleEditProductClick(p)}
                                title="Modifier"
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-lg cursor-pointer border-none"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                title="Supprimer de la liste"
                                className="p-1.5 hover:bg-red-50 text-red-550 rounded-lg cursor-pointer border-none"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                     );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 italic">
                      Aucun produit enregistré pour l'instant. Ajoutez des pains et jus pour démarrer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CATALOG PREVIEW & PRINT/EXPORT MODAL (PAPER MODEL VIEW) */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-gray-905/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto block no-print font-sans">
          <div className="bg-slate-100 dark:bg-[#0b1329] p-6 rounded-[28px] max-w-5xl w-full flex flex-col md:flex-row gap-6 max-h-[95vh] text-left">
            
            {/* Left configuration rails inside modal */}
            <div className="w-full md:w-80 shrink-0 space-y-4">
              <div className="bg-white dark:bg-[#111c33] p-5 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-2">
                  <h4 className="font-display font-black text-xs uppercase text-[#0B5D2A] dark:text-green-400">
                    ⚙️ Options A4
                  </h4>
                  <button
                    onClick={() => setShowCatalogModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Select standard model */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Modèle de catalogue</label>
                  <select
                    value={catalogModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg"
                  >
                    {catalogModels.map(m => (
                      <option key={m.key} value={m.key}>{m.key}</option>
                    ))}
                  </select>
                </div>

                {/* Edit Slogan / Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Titre Personnalisé</label>
                  <input
                    type="text"
                    value={catalogTitle}
                    onChange={(e) => setCatalogTitle(e.target.value.toUpperCase())}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Slogan BOAF</label>
                  <input
                    type="text"
                    value={customSlogan}
                    onChange={(e) => setCustomSlogan(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1 grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block">Bénin Zone</label>
                    <input
                      type="text"
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block">WhatsApp Contact</label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg text-[10px] font-mono"
                    />
                  </div>
                </div>

                {/* Products check-filters for selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Sélectionner produits ({selectedCatalogProducts.length})</label>
                  <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50 dark:bg-slate-900">
                    {products.map(p => {
                      const isChecked = selectedCatalogProducts.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 p-1 rounded font-semibold text-[11px] text-gray-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedCatalogProducts(selectedCatalogProducts.filter(id => id !== p.id));
                              } else {
                                setSelectedCatalogProducts([...selectedCatalogProducts, p.id]);
                              }
                            }}
                            className="accent-orange-500 shrink-0"
                          />
                          <span className="truncate">{p.nom}</span>
                          <span className="font-mono text-[9px] text-[#0B5D2A] ml-auto font-bold shrink-0">{p.prix} F</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Action executors */}
                <div className="space-y-2 pt-2 border-t border-gray-150 dark:border-slate-800">
                  <button
                    onClick={handlePrintCatalog}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase rounded-lg flex items-center justify-center gap-2 cursor-pointer border-none shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-white" />
                    Imprimer / Enregistrer en PDF
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${getWhatsAppMessageText()}`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-black uppercase rounded-lg flex items-center justify-center gap-2 cursor-pointer text-center decoration-none no-underline border-none"
                  >
                    <Share2 className="w-4 h-4 text-white" />
                    Partager sur WhatsApp
                  </a>

                  <p className="text-[9.5px] text-slate-400 italic leading-tight text-center">
                    Note : Utilisez des marges étroites ou l'option "Enregistrer comme PDF" de votre imprimante pour sortir en A4 natif.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Real Mock A4 Container preview */}
            <div className="flex-1 overflow-y-auto bg-slate-200 dark:bg-slate-900/40 p-4 rounded-2xl flex justify-center">
              <div 
                id="printable-a4-sheet" 
                className="bg-white text-slate-900 p-8 shadow-2xl rounded-sm w-[793px] min-h-[1122px] border border-gray-300 relative text-left"
                style={{ contentVisibility: 'auto' }}
              >
                
                {/* 1. Header BOAF Obligatoire (Section E) */}
                <div className="border-b-4 border-[#0B5D2A] pb-4 flex justify-between items-start gap-4">
                  {/* Brand graphic */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-[#0B5D2A] rounded-full flex items-center justify-center text-white font-black text-3xl font-display shadow-md">
                      B
                    </div>
                    <div>
                      <h1 className="text-xl font-display font-black text-[#0B5D2A] uppercase tracking-wide">
                        BOAF DÉLICES
                      </h1>
                      <p className="text-[10px] text-orange-600 font-bold tracking-widest uppercase">
                        {customSlogan}
                      </p>
                    </div>
                  </div>

                  {/* Legal contact details */}
                  <div className="text-right text-[10px] text-gray-500 space-y-1 font-mono">
                    <div className="font-bold text-slate-800 text-xs font-sans">Future Holdings SARL</div>
                    <div>📍 {locationText}</div>
                    <div>🟢 WhatsApp : <span className="font-bold text-slate-900">{whatsappPhone}</span></div>
                    <div className="text-gray-400">Date d'édition : {new Date().toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>

                {/* 2. Catalog custom title banner */}
                <div className="my-6 py-3 bg-[#FFF9F6] border-2 border-dashed border-orange-200 rounded-xl text-center">
                  <h2 className="text-lg font-display font-black tracking-widest text-[#0B5D2A]">
                    {catalogTitle}
                  </h2>
                  <p className="text-[9.5px] text-orange-600 font-black tracking-widest uppercase font-mono mt-0.5">
                    — BOAF GROUPE SA —
                  </p>
                </div>

                {/* 3. Catalog Products Grid List */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {products.length > 0 && products.filter(p => selectedCatalogProducts.includes(p.id)).length > 0 ? (
                    products.filter(p => selectedCatalogProducts.includes(p.id)).map(p => (
                      <div key={p.id} className="flex gap-4 border-b border-slate-100 pb-3 items-start break-inside-avoid">
                        {/* Miniature */}
                        <div className="w-18 h-18 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.nom} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold bg-slate-50">
                              BOAF
                            </div>
                          )}
                        </div>

                        {/* Text descriptions */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold text-sm text-slate-900 truncate uppercase mt-0.5" style={{ wordBreak: 'break-all' }}>
                              {p.nom}
                            </span>
                            {p.disponibilite === 'indisponible' && (
                              <span className="bg-red-50 text-red-700 border border-red-200 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
                                Rupture
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded uppercase shrink-0">
                              {p.categorie}
                            </span>
                            <span className="font-bold text-xs text-orange-650 font-mono">
                              {p.prix.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>

                          {p.description ? (
                            <p className="text-[9.5px] text-gray-550 leading-tight italic line-clamp-2 mt-1">
                              {p.description}
                            </p>
                          ) : (
                            <p className="text-[9.5px] text-gray-300 italic mt-1 font-sans">Aucune description disponible pour ce délice.</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-20 text-slate-400 italic font-mono text-[11px]">
                      Aucun produit sélectionné pour ce catalogue. Cochez les articles à gauche pour commencer de suite.
                    </div>
                  )}
                </div>

                {/* 4. Official watermark footer */}
                <div className="absolute bottom-6 left-8 right-8 border-t border-slate-150 pt-2.5 flex justify-between items-center text-[8.5px] text-gray-400 font-mono">
                  <span>© {new Date().getFullYear()} BOAF Délices. Document authentifié pour usage commercial d'ambassadrices.</span>
                  <span>Page 1 / 1</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* EMBEDDED PRINT LAYOUT (HIDES EVERYTHING OUTSIDE MAIN A4 CONTAINER IN SCRIPT) */}
      <style>{`
        @media print {
          /* Hide sidebar, dashboard header, panels, and modal rails */
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          aside, header, main, div.no-print, button, form, .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          #printable-a4-sheet {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 2.5cm !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: always;
          }
          /* Ensure column layout wraps beautifully */
          .break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
