import React, { useState } from 'react';
import {
  Receipt,
  ShoppingCart,
  PlusCircle,
  Tag,
  Search,
  User,
  CheckCircle,
  FileText,
  X,
  Printer,
  Smartphone,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Order, Product, PromoCode, Actor, OrderItem } from '../types';

interface SalesViewProps {
  orders: Order[];
  products: Product[];
  promoCodes: PromoCode[];
  actors: Actor[];
  onAddOrder: (order: Order) => void;
  onAddPromoCode: (code: PromoCode) => void;
  currentRole: string;
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
  
  // States
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [qty, setQty] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | ''>(''); // allowing manual overrides of amount as requested
  const [selectedPromoCodeId, setSelectedPromoCodeId] = useState('none');
  const [paymentMode, setPaymentMode] = useState('Espèces');

  // Search filter for recent orders listing
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-detect price when product changes
  const activeProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleProductChange = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setCustomPrice(prod.prix);
    }
  };

  // Initialize price on mount/open
  React.useEffect(() => {
    if (activeProduct && customPrice === '') {
      setCustomPrice(activeProduct.prix);
    }
  }, [activeProduct]);

  // Calculations
  const unitPrice = customPrice !== '' ? Number(customPrice) : (activeProduct?.prix || 0);
  const totalBrut = unitPrice * qty;

  const activePromoCode = promoCodes.find(pc => pc.id === selectedPromoCodeId);
  const discountRate = activePromoCode && activePromoCode.status === 'active' ? 5 : 0; // 5% standard code promo discount
  const discountVal = Math.round(totalBrut * (discountRate / 100));
  const totalNet = totalBrut - discountVal;

  const handleGenerateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId) {
      alert('Veuillez sélectionner un produit BOAF.');
      return;
    }

    const today = new Date();
    const yyyymmdd = today.toISOString().split('T')[0].replace(/-/g, '');
    const todayCount = orders.filter(o => o.ticket_number.includes(yyyymmdd)).length + 1;
    const computedTicketNum = `TK-${yyyymmdd}-${String(todayCount).padStart(4, '0')}`;

    const item: OrderItem = {
      product_id: selectedProductId,
      nom: activeProduct?.nom || 'Pain BOAF',
      quantite: qty,
      prix_unitaire: unitPrice,
      total_ligne: totalBrut
    };

    const newOrder: Order = {
      id: `ord-dyn-${Date.now()}`,
      ticket_number: computedTicketNum,
      customer_name: customerName || 'Client de Passage',
      customer_phone: customerPhone || undefined,
      code_promo_id: selectedPromoCodeId !== 'none' ? selectedPromoCodeId : undefined,
      code_promo_text: activePromoCode?.code,
      items: [item],
      total_brut: totalBrut,
      remise: discountVal,
      total_net: totalNet,
      payment_status: 'paid',
      order_status: 'valid',
      payment_mode: paymentMode,
      source: currentRole === 'agent' ? 'Terrain' : 'Direct',
      created_by: currentRole,
      created_at: new Date().toISOString()
    };

    onAddOrder(newOrder);

    // Save for visual popup ticket
    setLastCreatedOrder(newOrder);
    setShowNewSaleModal(false);
    setShowTicketModal(true);

    // Reset Form fields
    setCustomerName('');
    setCustomerPhone('');
    setQty(1);
    setSelectedPromoCodeId('none');
    if (products[0]) {
      setSelectedProductId(products[0].id);
      setCustomPrice(products[0].prix);
    }
  };

  // Filter local sales lists
  const filteredRecentOrders = orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.ticket_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      (o.code_promo_text && o.code_promo_text.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Upper header section */}
      <div className="bg-white dark:bg-[#121c33] p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-display font-black text-[#0B5D2A] dark:text-green-400 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-500" />
            Enregistrement des Ventes (Caisse Directe)
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-normal">
            Saisissez les ventes réalisées sur l'instant, configurez les remises de code promo et générez immédiatement les reçus scannables de livraison.
          </p>
        </div>
        
        <button
          onClick={() => {
            if (products.length > 0) {
              setSelectedProductId(products[0].id);
              setCustomPrice(products[0].prix);
            }
            setShowNewSaleModal(true);
          }}
          className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wide rounded-2xl flex items-center gap-2 shadow-md hover:scale-101 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          Nouvelle vente
        </button>
      </div>

      {/* Main List view table */}
      <div className="bg-white dark:bg-[#121c33] p-6 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="font-display font-bold text-gray-950 dark:text-white text-sm">
              📋 Historique des ventes de pains et goûters
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-slate-500">Cliquez sur un ticket pour rééditer son reçu BOAF</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher ticket, client, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#0B5D2A] dark:focus:border-green-450 text-gray-800 dark:text-slate-100 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 text-gray-450 dark:text-slate-400 uppercase font-mono tracking-wider text-[10px]">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Date / Heure</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Produits vendus</th>
                <th className="py-3 px-4 text-center">Code Promo</th>
                <th className="py-3 px-4 text-right">Total Net</th>
                <th className="py-3 px-4 text-center">Règlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredRecentOrders.length > 0 ? (
                filteredRecentOrders.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => {
                      setLastCreatedOrder(order);
                      setShowTicketModal(true);
                    }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-gray-100 dark:border-slate-800/40"
                    title="Voir le ticket BOAF"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0B5D2A] dark:text-green-400">
                      {order.ticket_number}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 dark:text-slate-400 font-mono">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')} • {new Date(order.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-slate-100 font-sans">
                      {order.customer_name}
                      {order.customer_phone && <span className="block text-[10px] text-gray-400 dark:text-slate-500 font-mono font-normal">{order.customer_phone}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 dark:text-slate-300">
                      {order.items.map(it => `${it.nom} (x${it.quantite})`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {order.code_promo_text ? (
                        <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-250 dark:border-purple-900/60 font-mono">
                          {order.code_promo_text}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500 italic">Vente directe</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-gray-950 dark:text-white font-mono">
                      {order.total_net.toLocaleString()} F
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/55 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {order.payment_mode}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 dark:text-slate-500 italic">
                    Aucune vente enregistrée avec ces critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* MODAL 1: SHORT NEW SALE FORM */}
      {showNewSaleModal && (
        <div className="fixed inset-0 bg-gray-905/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-[#111c34] rounded-[28px] w-full max-w-md overflow-hidden border border-gray-100 dark:border-slate-800 shadow-2xl scale-up text-left flex flex-col max-h-[90vh]">
            
            {/* Modal header */}
            <div className="bg-[#0B5D2A] p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-400" />
                <h3 className="font-display font-black text-md">📝 Saisir une Vente Directe</h3>
              </div>
              <button
                onClick={() => setShowNewSaleModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable body form */}
            <form onSubmit={handleGenerateTicket} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-gray-800 dark:text-slate-100">
              
              {/* Customer tracking */}
              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">1. Identité du Client</label>
                <input
                  type="text"
                  placeholder="Nom complet (ex. Marc Adjovi)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:border-[#0B5D2A] dark:focus:border-green-450 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-550 transition-colors"
                />
              </div>

              {/* Customer Phone */}
              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Téléphone du Client (Facultatif)</label>
                <input
                  type="tel"
                  placeholder="Téléphone (ex. +229 97 12 12)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl font-mono focus:outline-none focus:border-[#0B5D2A] dark:focus:border-green-450 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-550 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                
                {/* Product picker */}
                <div className="space-y-1 col-span-2">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">2. Produit Boulanger</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none text-gray-800 dark:text-slate-100"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id} className="dark:bg-[#111c34]">
                        🍞 {p.nom} ({p.prix} F)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount override */}
                <div className="space-y-1">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Montant / Prix Unitaire</label>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="Prix FCFA de l'unité"
                    required
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl font-mono focus:outline-none font-bold text-gray-800 dark:text-slate-100"
                  />
                </div>

                {/* Product qty */}
                <div className="space-y-1">
                  <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">Quantité</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl font-mono text-center font-bold text-gray-800 dark:text-slate-100"
                  />
                </div>

              </div>

              {/* Promo code reduction */}
              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px] flex justify-between">
                  <span>3. Code Promotionnel Référent</span>
                  {discountRate > 0 && <span className="text-green-600 dark:text-green-450 normal-case font-bold">-5% applicable</span>}
                </label>
                <select
                  value={selectedPromoCodeId}
                  onChange={(e) => setSelectedPromoCodeId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none font-mono text-gray-800 dark:text-slate-100"
                >
                  <option value="none" className="dark:bg-[#111c34]">Aucun code promo (Vente directe)</option>
                  {promoCodes
                    .filter(c => c.status === 'active')
                    .map(c => {
                      const owner = actors.find(a => a.id === c.actor_id);
                      return (
                        <option key={c.id} value={c.id} className="dark:bg-[#111c34]">
                          {c.code} ({owner ? `${owner.full_name} - ${owner.type_actor}` : 'BOAF'})
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Payment Mode */}
              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase text-[10px]">4. Mode de règlement</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Espèces', 'Mobile Money'].map(m => (
                    <label
                      key={m}
                      className={`p-2.5 border rounded-xl text-center font-bold cursor-pointer transition-all block ${
                        paymentMode === m
                          ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-850 dark:text-orange-400 border-orange-400'
                          : 'bg-slate-50 dark:bg-slate-900/50 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMode"
                        value={m}
                        checked={paymentMode === m}
                        onChange={() => setPaymentMode(m)}
                        className="sr-only"
                      />
                      {m === 'Espèces' ? '💵 Espèces' : '📱 MoMo / Wave'}
                    </label>
                  ))}
                </div>
              </div>

              {/* Total calculations inline summary footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3.5 rounded-2xl">
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-slate-400 font-semibold font-mono">
                  <span>Montant Brut :</span>
                  <span>{totalBrut.toLocaleString()} F</span>
                </div>
                {discountVal > 0 && (
                  <div className="flex justify-between text-[11px] text-green-700 dark:text-green-400 font-bold font-mono">
                    <span>Remise Promo Code (5%) :</span>
                    <span>-{discountVal.toLocaleString()} F</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t border-dotted border-gray-200 dark:border-slate-800 mt-2 pt-2">
                  <span>Net à payer :</span>
                  <span className="text-[#0B5D2A] dark:text-green-400 font-mono">{totalNet.toLocaleString()} FCFA</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 bg-[#0B5D2A] hover:bg-[#12823c] text-white font-black uppercase text-xs rounded-xl shadow-md transition-transform hover:scale-101 cursor-pointer"
              >
                🎟️ Générer ticket BOAF
              </button>
            </form>
          </div>
        </div>
      )}


      {/* MODAL 2: TICKET PRINT OVERLAY VIEW */}
      {showTicketModal && lastCreatedOrder && (
        <div className="fixed inset-0 bg-gray-900/70 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-left text-xs">
          <div className="bg-white dark:bg-[#111c34] rounded-[28px] w-full max-w-sm overflow-hidden border border-gray-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh]">
            
            <div className="bg-[#0B5D2A] p-4 text-white flex justify-between items-center shrink-0">
              <span className="text-xs uppercase font-mono font-bold tracking-widest text-orange-400">Reçu Boulangerie</span>
              <button
                onClick={() => setShowTicketModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Receipt Arena */}
            <div className="p-6 overflow-y-auto flex-1 bg-amber-50/10 dark:bg-slate-950/40 text-gray-800 dark:text-slate-100 font-mono">
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 p-4 rounded-xl bg-white dark:bg-[#152342] space-y-4">
                
                {/* Header brand details */}
                <div className="text-center border-b border-dashed border-gray-300 dark:border-slate-700 pb-3 space-y-1">
                  <h4 className="font-display font-black text-sm text-[#0B5D2A] dark:text-green-400 tracking-widest">
                    *** BOAF DÉLICES ***
                  </h4>
                  <p className="text-[10px] text-gray-400 dark:text-slate-400 font-sans leading-tight">BOAF Future Holdings SARL</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-400 font-sans leading-tight">Lokossa, Mono, Bénin</p>
                  <span className="mt-2 inline-block px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold">
                    REÇU DE COMMANDE VALIDÉ
                  </span>
                </div>

                {/* Ticket Details metadata */}
                <div className="space-y-1.5 border-b border-dashed border-gray-300 dark:border-slate-700 pb-3 text-[11px]">
                  <div className="flex justify-between">
                    <span>N° TICKET :</span>
                    <span className="font-bold text-gray-950 dark:text-emerald-300">{lastCreatedOrder.ticket_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date :</span>
                    <span>{new Date(lastCreatedOrder.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mode paiement :</span>
                    <span className="font-bold text-gray-950 dark:text-emerald-300">{lastCreatedOrder.payment_mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client :</span>
                    <span className="font-sans font-bold text-gray-900 dark:text-white">{lastCreatedOrder.customer_name}</span>
                  </div>
                </div>

                {/* Product details */}
                <div className="space-y-1.5 border-b border-dashed border-gray-300 dark:border-slate-700 pb-3 text-[11px]">
                  <span className="font-sans font-bold text-[10px] text-gray-400 dark:text-slate-400 block mb-1">DÉTAIL ARTICLES :</span>
                  {lastCreatedOrder.items.map(it => (
                    <div key={it.product_id} className="flex justify-between">
                      <span>{it.nom} (x{it.quantite})</span>
                      <span>{it.total_ligne.toLocaleString()} F</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-1 border-b border-dashed border-gray-300 dark:border-slate-700 pb-3 font-bold text-gray-950 dark:text-white">
                  <div className="flex justify-between">
                    <span>Total Brut :</span>
                    <span>{lastCreatedOrder.total_brut.toLocaleString()} F</span>
                  </div>
                  {lastCreatedOrder.remise > 0 && (
                    <div className="flex justify-between text-green-700 dark:text-green-400">
                      <span>Remise (Code Promo) :</span>
                      <span>-{lastCreatedOrder.remise.toLocaleString()} F</span>
                    </div>
                  )}
                  <div className="flex justify-between text-md text-[#0B5D2A] dark:text-green-400 font-black pt-1">
                    <span>NET À PAYER :</span>
                    <span>{lastCreatedOrder.total_net.toLocaleString()} FCFA</span>
                  </div>
                </div>

                {/* Match QR and scanner control */}
                <div className="pt-2 text-center space-y-2">
                  <p className="text-[10px] font-sans font-semibold text-center text-gray-500 dark:text-slate-405">
                    Bénéficiaire commission : <br />
                    <strong className="text-[#0B5D2A] dark:text-green-450 text-xs font-bold leading-none">
                      {lastCreatedOrder.code_promo_text 
                        ? (actors.find(a => promoCodes.some(p => p.code === lastCreatedOrder.code_promo_text && p.actor_id === a.id))?.full_name || 'Partenaire Référencé')
                        : 'Vente directe (Sans apporteur)'
                      }
                    </strong>
                  </p>

                  <div className="w-24 h-24 bg-white p-1.5 rounded-lg border border-gray-250 mx-auto flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${lastCreatedOrder.ticket_number}`}
                      alt="Ticket Scan QR"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <span className="text-[8px] bg-[#0B5D2A] dark:bg-[#12823c] text-white px-2 py-0.5 rounded font-black tracking-widest inline-block animate-pulse">
                    BOAF SECURITY SYSTEM
                  </span>
                </div>

              </div>
            </div>

            {/* Actions Footer print */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-gray-150 dark:border-slate-800 flex gap-2 shrink-0">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-950 dark:hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border dark:border-slate-800"
              >
                <Printer className="w-4 h-4" />
                Imprimer le Ticket
              </button>
              
              <button
                onClick={() => setShowTicketModal(false)}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl cursor-pointer"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
