import React, { useState } from 'react';
import {
  Receipt,
  ShoppingCart,
  QrCode,
  Tag,
  Plus,
  Minus,
  RefreshCw,
  Search,
  User,
  Activity,
  Trash2,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Order, Product, PromoCode, Actor, OrderItem, Commission } from '../types';

interface SalesViewProps {
  orders: Order[];
  products: Product[];
  promoCodes: PromoCode[];
  actors: Actor[];
  onAddOrder: (order: Order) => void;
  onAddPromoCode: (code: PromoCode) => void;
  currentRole: string; // admin, superviseur, whatsapp
}

export default function SalesView({
  orders,
  products,
  promoCodes,
  actors,
  onAddOrder,
  onAddPromoCode,
  currentRole
}: SalesViewProps) {
  // Live State of order cart in development
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedCodeId, setSelectedCodeId] = useState('none');
  const [paymentMode, setPaymentMode] = useState('Espèces');
  const [source, setSource] = useState('Direct');
  
  // Cart items
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);

  // Promo Code Generator states
  const [genTypeCode, setGenTypeCode] = useState('BOAF-ECO'); // schools
  const [genActorId, setGenActorId] = useState(actors[0]?.id || '');
  const [generatedResult, setGeneratedResult] = useState('');

  // Cart helper functions
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const existingIndex = cartItems.findIndex(i => i.product_id === selectedProduct.id);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantite += quantity;
      updated[existingIndex].total_ligne = updated[existingIndex].quantite * updated[existingIndex].prix_unitaire;
      setCartItems(updated);
    } else {
      const newItem: OrderItem = {
        product_id: selectedProduct.id,
        nom: selectedProduct.nom,
        quantite: quantity,
        prix_unitaire: selectedProduct.prix,
        total_ligne: quantity * selectedProduct.prix
      };
      setCartItems([...cartItems, newItem]);
    }
    // reset current input qty
    setQuantity(1);
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Compute live cart aggregates
  const totalBrut = cartItems.reduce((acc, curr) => acc + curr.total_ligne, 0);
  
  // Find discounts matching promo code
  const chosenPromoCode = promoCodes.find(c => c.id === selectedCodeId);
  const discountRate = chosenPromoCode && chosenPromoCode.status === 'active' ? 5 : 0; // 5% default discount on codes
  const remise = Math.round(totalBrut * (discountRate / 100));
  const totalNet = totalBrut - remise;

  // Generate sequence tracking
  const nextTicketNumber = () => {
    const today = new Date();
    const yyyymmdd = today.toISOString().split('T')[0].replace(/-/g, '');
    const relevantCount = orders.filter(o => o.ticket_number.includes(yyyymmdd)).length + 1;
    return `TK-${yyyymmdd}-${String(relevantCount).padStart(6, '0')}`;
  };

  const [simulatedTicketNum, setSimulatedTicketNum] = useState(nextTicketNumber());

  // Handle Order submit
  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Veuillez ajouter au moins un produit au panier avant de valider la vente.');
      return;
    }

    const tNum = nextTicketNumber();

    const createdOrder: Order = {
      id: `ord-${Date.now()}`,
      ticket_number: tNum,
      customer_name: customerName || 'Client de Passage',
      customer_phone: customerPhone || undefined,
      code_promo_id: selectedCodeId !== 'none' ? selectedCodeId : undefined,
      code_promo_text: chosenPromoCode?.code,
      items: cartItems,
      total_brut: totalBrut,
      remise: remise,
      total_net: totalNet,
      payment_status: 'paid', // Instant sale is paid by default
      order_status: 'valid',
      payment_mode: paymentMode,
      source: source,
      created_by: currentRole,
      created_at: new Date().toISOString()
    };

    onAddOrder(createdOrder);

    // Reset Form
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedCodeId('none');
    setSimulatedTicketNum(nextTicketNumber());
    alert(`Vente de ${totalNet.toLocaleString()} FCFA validée ! Ticket ${tNum} généré.`);
  };

  // Promo code direct generation
  const handleGeneratePromoCode = () => {
    const sequence = Math.floor(1000 + Math.random() * 9000);
    const nextCode = `${genTypeCode}-${sequence}`;
    
    const newCode: PromoCode = {
      id: `code-gen-${Date.now()}`,
      code: nextCode,
      type_code: genTypeCode,
      actor_id: genActorId,
      status: 'active',
      starts_at: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString().split('T')[0]
    };

    onAddPromoCode(newCode);
    setGeneratedResult(nextCode);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Upper Grid panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Box 1: Save Vente Form */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <ShoppingCart className="w-5 h-5 text-orange-500 animate-pulse" />
            <h3 className="font-display font-extrabold text-[#0B5D2A] text-base leading-none">
              Enregistrer une Vente
            </h3>
          </div>

          <form onSubmit={handleSaveOrder} className="space-y-5 text-xs text-left">
            {/* Client Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 block">Nom du Client</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nom complet ou établissement"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 bg-slate-50 focus:bg-white rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 block">Téléphone Portable (WhatsApp)</label>
                <input
                  type="text"
                  placeholder="e.g. +229 97 121 212"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2 border border-gray-200 bg-slate-50 focus:bg-white rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Product selection cart engine */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-gray-150 space-y-4">
              <h4 className="font-bold text-[#0B5D2A] flex items-center gap-1.5 font-display text-[11px] uppercase tracking-wider">
                Sélection des produits BOAF
              </h4>
              
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-44 space-y-1">
                  <label className="text-gray-500 text-[10px] block">Produit</label>
                  <select
                    value={selectedProduct?.id}
                    onChange={(e) => {
                      const prod = products.find(p => p.id === e.target.value);
                      if (prod) setSelectedProduct(prod);
                    }}
                    className="w-full p-2 border border-gray-200 bg-white rounded-xl text-xs focus:outline-none cursor-pointer"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nom} - {p.prix} FCFA ({p.categorie})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24 space-y-1">
                  <label className="text-gray-500 text-[10px] block">Quantité</label>
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-2 py-1.5 hover:bg-slate-100 text-gray-500 text-xs cursor-pointer border-r border-gray-150"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center font-bold text-gray-800 text-xs">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      className="px-2 py-1.5 hover:bg-slate-100 text-gray-500 text-xs cursor-pointer border-l border-gray-150"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 font-bold rounded-xl transition-all h-9 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter au panier
                </button>
              </div>

              {/* Cart List table summary */}
              {cartItems.length > 0 ? (
                <div className="bg-white rounded-xl border border-gray-150 overflow-hidden mt-3">
                  <table className="w-full ml-0 border-collapse font-sans text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-100 text-gray-500 font-semibold text-[10px] uppercase">
                        <th className="p-2 text-left">Produit</th>
                        <th className="p-2 text-center">Quantité</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-center w-10">Option</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cartItems.map((item, idx) => (
                        <tr key={item.product_id} className="hover:bg-slate-50">
                          <td className="p-2 font-semibold text-gray-800">{item.nom}</td>
                          <td className="p-2 text-center font-bold text-gray-700">{item.quantite}</td>
                          <td className="p-2 text-right text-gray-600">{item.prix_unitaire.toLocaleString()} F</td>
                          <td className="p-2 text-right font-black text-[#0B5D2A]">{item.total_ligne.toLocaleString()} F</td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(idx)}
                              className="text-red-500 hover:text-red-700 cursor-pointer p-1 rounded-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 italic">Votre panier est de prime abord vide.</p>
              )}
            </div>

            {/* Campaign configuration details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 block">Code Promo Appliqué</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
                  <select
                    value={selectedCodeId}
                    onChange={(e) => setSelectedCodeId(e.target.value)}
                    className="w-full pl-9 pr-2 py-2 border border-gray-200 bg-slate-50 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="none">Aucun code (Vente directe)</option>
                    {promoCodes
                      .filter(c => c.status === 'active')
                      .map(c => {
                        const actorName = actors.find(a => a.id === c.actor_id)?.full_name || 'Autre';
                        return (
                          <option key={c.id} value={c.id}>
                            {c.code} ({actorName})
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="font-semibold text-gray-700 block">Canal d'Apport</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full p-2 border border-gray-200 bg-slate-50 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="Direct">Direct (Boutique de passage)</option>
                  <option value="WhatsApp">Saisie Whatsapp Business</option>
                  <option value="Terrain">Agent terrain (Mobile)</option>
                  <option value="Partenaire">Dépôt Partenaire</option>
                  <option value="Événement">Prestation Événementielle</option>
                </select>
              </div>

              <div className="space-y-1 text-left">
                <label className="font-semibold text-gray-700 block">Mode de Règlement</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full p-2 border border-gray-200 bg-slate-50 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="Espèces">Espèces (Cash FCFA)</option>
                  <option value="Mobile Money">Mobile Money (MTN MoMo/Moov)</option>
                  <option value="Virement">Virement bancaire</option>
                  <option value="Chèque">Chèque d'entreprise</option>
                </select>
              </div>
            </div>

            {/* Validation row */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-150">
              <div className="text-left space-y-0.5">
                <span className="text-[10px] text-gray-400 font-mono tracking-wider block uppercase">Total net dû</span>
                <span className="text-xl font-extrabold font-display text-gray-900">
                  {totalNet.toLocaleString()} FCFA
                </span>
                {remise > 0 && (
                  <span className="text-[10px] text-green-600 block font-semibold">
                    Rabais de 5% appliqué ({remise.toLocaleString()} FCFA)
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#0B5D2A] text-white hover:bg-[#0B5D2A]/90 rounded-xl font-bold uppercase transition-all shadow-md shadow-green-900/10 cursor-pointer"
              >
                Générer ticket & valider
              </button>
            </div>
          </form>
        </div>

        {/* Box 2: BOAF Delices Receipt Print view / Simulator */}
        <div className="lg:col-span-1">
          <div className="bg-amber-50/60 p-6 rounded-3xl border border-amber-200 shadow-md space-y-4 relative overflow-hidden font-mono text-[11px] text-gray-700 text-left">
            {/* Visual ticket notch */}
            <div className="absolute top-0 inset-x-0 h-1 bg-amber-300 border-t border-b border-amber-400" />
            
            <div className="text-center space-y-1 border-b border-dashed border-amber-200 pb-4">
              <h4 className="font-display font-black text-xs text-[#0B5D2A] uppercase. tracking-widest text-[#0B5D2A]">
                *** BOAF DÉLICES ***
              </h4>
              <p className="text-[10px] text-gray-400">BOAF Future Holdings SARL</p>
              <p className="text-[10px] text-gray-400">Lokossa, Mono, Bénin</p>
              <div className="tag-border text-[9px] bg-orange-100 text-orange-850 px-2.5 py-0.5 rounded-sm inline-block font-bold mt-2">
                REÇU DIGITAL VALIDÉ
              </div>
            </div>

            {/* Simulated Live ticket data fields */}
            <div className="space-y-1.5 border-b border-dashed border-amber-200 pb-4">
              <div className="flex justify-between">
                <span>Réf Ticket :</span>
                <span className="font-bold text-gray-950">{simulatedTicketNum}</span>
              </div>
              <div className="flex justify-between">
                <span>Émis le :</span>
                <span>{new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex justify-between">
                <span>Client :</span>
                <span className="font-sans font-bold text-gray-800">{customerName || 'Client Passage'}</span>
              </div>
              <div className="flex justify-between">
                <span>Type d'apport :</span>
                <span>{source}</span>
              </div>
              <div className="flex justify-between">
                <span>Réglement :</span>
                <span>{paymentMode}</span>
              </div>
            </div>

            {/* Cart products lines items table */}
            <div className="space-y-1.5 border-b border-dashed border-amber-200 pb-4">
              <div className="font-bold text-gray-800 uppercase block tracking-wider mb-1">Détails articles :</div>
              {cartItems.length > 0 ? (
                <div className="space-y-1">
                  {cartItems.map(it => (
                    <div key={it.product_id} className="flex justify-between">
                      <span>{it.nom} x{it.quantite}</span>
                      <span>{it.total_ligne.toLocaleString()} F</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Double Pain sucré x1</span>
                    <span>150 F</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pain ordinaire x1</span>
                    <span>125 F</span>
                  </div>
                </div>
              )}
            </div>

            {/* Receipt Totals summary */}
            <div className="space-y-1 border-b border-dashed border-amber-200 pb-4 font-bold text-gray-900">
              <div className="flex justify-between">
                <span>Total Brut :</span>
                <span>{(totalBrut || 275).toLocaleString()} F</span>
              </div>
              {remise > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Remise Promo (5%) :</span>
                  <span>-{remise.toLocaleString()} F</span>
                </div>
              )}
              <div className="flex justify-between text-lg text-[#0B5D2A] font-black pt-1">
                <span>NET PAYÉ :</span>
                <span>{(totalNet || 275).toLocaleString()} FCFA</span>
              </div>
            </div>

            {/* Associated Agent of promotion details */}
            <div className="text-center space-y-3 pt-2">
              <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">
                Bénéficiaire Code Promo :
              </span>
              <p className="font-sans text-xs font-black text-slate-800">
                {chosenPromoCode
                  ? actors.find(a => a.id === chosenPromoCode.actor_id)?.full_name
                  : 'Vente directe (Pas de commission)'}
              </p>

              {/* Dynamic scan QR code pointing to real parameters verification tool */}
              <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl border border-amber-200 shadow-sm flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${simulatedTicketNum}`}
                  alt="QR Code Ticket"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <span className="text-[9px] text-[#0B5D2A] font-black tracking-widest block uppercase mt-1 animate-pulse">
                SCANNEL POUR CONTRÔLE
              </span>
              <p className="text-[9px] text-gray-400 block max-w-[200px] mx-auto italic">
                Ce QR Code est scannable par le superviseur pour valider le ticket auprès des boulangeries.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Box 3: Promo code quick generator according strictly to format lists */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 text-left">
          <QrCode className="w-5 h-5 text-purple-600" />
          <h3 className="font-display font-extrabold text-[#0B5D2A] text-base leading-none">
            Générer un code promotionnel de Campagne
          </h3>
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Format obligatoire</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs text-left">
          <div className="space-y-1">
            <label className="font-semibold text-gray-700 block">Type de Campagne</label>
            <select
              value={genTypeCode}
              onChange={(e) => setGenTypeCode(e.target.value)}
              className="w-full p-2 border border-gray-200 bg-slate-50 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="BOAF-ECO">Écoles (BOAF-ECO-0001)</option>
              <option value="BOAF-EGL">Églises (BOAF-EGL-0001)</option>
              <option value="BOAF-EVT">Événement (BOAF-EVT-YYMMDD-001)</option>
              <option value="BOAF-DIG">Campagne Digitale (BOAF-DIG-0001)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700 block">Rattacher à un acteur référent</label>
            <select
              value={genActorId}
              onChange={(e) => setGenActorId(e.target.value)}
              className="w-full p-2 border border-gray-200 bg-slate-50 rounded-xl focus:outline-none cursor-pointer"
            >
              {actors.map(act => (
                <option key={act.id} value={act.id}>
                  {act.full_name} ({act.type_actor})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGeneratePromoCode}
            className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all h-9 flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <RefreshCw className="w-4 h-4 text-white" />
            Générer le Code Promo
          </button>

          <div className="space-y-1">
            <label className="text-gray-400 block text-[10px] font-bold">Code généré avec succès :</label>
            <span className="inline-block w-full py-2 px-3 border border-dashed border-purple-300 text-purple-700 font-mono font-bold bg-purple-50 text-center rounded-xl text-sm uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">
              {generatedResult || 'En attente...'}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders log listings table */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <h4 className="font-display font-extrabold text-[#0B5D2A] text-base tracking-tight text-left">
          Historique des tickets récents émis
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 font-mono text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Numéro Ticket</th>
                <th className="py-3 px-4">Date d'Émission</th>
                <th className="py-3 px-4">Identité Client</th>
                <th className="py-3 px-4 text-center">Canal d'Apport</th>
                <th className="py-3 px-4 text-center">Code Promo</th>
                <th className="py-3 px-4 text-right">Montant Brut</th>
                <th className="py-3 px-4 text-right">Montant Net</th>
                <th className="py-3 px-4 text-center">Règlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-105 bg-white">
              {orders.slice(0, 10).map(ord => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-800">
                    <span className="flex items-center gap-2 text-[#0B5D2A]">
                      <FileText className="w-4 h-4 text-gray-450 shrink-0" />
                      {ord.ticket_number}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-500 font-mono">
                    {new Date(ord.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-4 px-4 font-bold text-gray-900 font-sans">{ord.customer_name}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-705 border border-slate-200">
                      {ord.source}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {ord.code_promo_text ? (
                      <span className="px-2.5 py-1 rounded-md font-mono font-bold bg-violet-50 text-violet-700 border border-violet-100">
                        {ord.code_promo_text}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Vente Directe</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600 font-semibold">{ord.total_brut.toLocaleString()} F</td>
                  <td className="py-4 px-4 text-right font-black text-[#0B5D2A]">{ord.total_net.toLocaleString()} F</td>
                  <td className="py-4 px-4 text-center">
                    <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md font-semibold text-[10px] border border-sky-100">
                      {ord.payment_mode}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
