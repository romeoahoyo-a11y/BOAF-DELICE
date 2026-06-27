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
  ArrowRight,
  Database,
  RefreshCw,
  AlertCircle,
  Lock
} from 'lucide-react';
import { Order, Product, PromoCode, Actor, OrderItem } from '../types';
import { parseClientNameAndPromo } from '../utils/promoMatcher';

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
  const [isSupabaseSyncMode, setIsSupabaseSyncMode] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('boaf_supabase_url') || 'https://boaf-delices.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('boaf_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sfw-boaf-key-example');
  const [supabaseTable, setSupabaseTable] = useState(() => localStorage.getItem('boaf_supabase_table') || 'commandes');
  const [showErrorOnly, setShowErrorOnly] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  const handleSyncSupabase = async () => {
    setIsSyncing(true);
    setSyncSuccessMessage('');
    
    const isPlaceholderKey = supabaseKey.includes('sfw-boaf-key-example') || !supabaseKey;
    const isPlaceholderUrl = supabaseUrl.includes('boaf-delices.supabase.co') || !supabaseUrl;
    
    if (isPlaceholderKey || isPlaceholderUrl) {
      setIsSyncing(false);
      alert("Veuillez saisir votre URL de projet et votre clé de Service Role réels pour lancer la synchronisation de production.");
      return;
    }

    // Real REST API query to their real Supabase project!
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${supabaseTable}?select=*`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Le format renvoyé par l'API REST de Supabase n'est pas un tableau de lignes.");
      }
      
      let count = 0;
      data.forEach((row: any, idx: number) => {
        const rawName = row.customer_name || row.nom_client || row.client_name || row.customerName || 'Client Supabase';
        const phone = row.customer_phone || row.phone || row.telephone || '';
        const pName = row.product_name || row.produit || products[0]?.nom || 'Pain Brioché Premium';
        const quantity = parseInt(row.quantity || row.quantite || row.qty || '1', 10);
        const price = parseFloat(row.price || row.prix || row.prix_unitaire || products[0]?.prix || '1500');
        const rowPayment = row.payment_mode || row.payment || 'Mobile Money';
        
        const totalBrut = price * quantity;
        const parsed = parseClientNameAndPromo(rawName, promoCodes, actors);
        
        const codeId = parsed.matchedPromoCode ? parsed.matchedPromoCode.id : undefined;
        const codeText = parsed.matchedPromoCode ? parsed.matchedPromoCode.code : (parsed.code_complet || parsed.numero_code || undefined);
        const discount = (parsed.matchedPromoCode && !parsed.has_code_error) ? Math.round(totalBrut * 0.05) : 0;
        const totalNet = totalBrut - discount;
        
        const ticketNum = row.ticket_number || `TK-SUP-REAL-${Date.now().toString().slice(-6)}-${idx}`;
        
        if (orders.some(o => o.ticket_number === ticketNum)) {
          return; // skip duplicate
        }
        
        const item = {
          product_id: row.product_id || products[0]?.id || 'prod-1',
          nom: pName,
          quantite: quantity,
          prix_unitaire: price,
          total_ligne: totalBrut
        };
        
        const newOrder: Order = {
          id: `ord-sup-real-${row.id || idx}-${Date.now()}`,
          ticket_number: ticketNum,
          customer_name: parsed.nom_client,
          customer_phone: phone || undefined,
          code_promo_id: codeId,
          code_promo_text: codeText,
          items: [item],
          total_brut: totalBrut,
          remise: discount,
          total_net: totalNet,
          payment_status: 'paid',
          order_status: 'valid',
          payment_mode: rowPayment,
          source: 'Supabase',
          created_by: 'Supabase API',
          created_at: row.created_at || new Date().toISOString(),
          has_code_error: parsed.has_code_error,
          code_error_type: parsed.code_error_type
        };
        
        onAddOrder(newOrder);
        count++;
      });
      
      setIsSyncing(false);
      if (count > 0) {
        setSyncSuccessMessage(`Synchronisation réelle réussie ! ${count} commande(s) récupérée(s) et synchronisée(s) depuis votre base de données réelle Supabase.`);
      } else {
        setSyncSuccessMessage('Synchronisation réelle réussie ! Aucune nouvelle commande détectée dans votre base Supabase.');
      }
      setTimeout(() => setSyncSuccessMessage(''), 8000);
      
    } catch (err: any) {
      setIsSyncing(false);
      alert(`Erreur de connexion réelle à Supabase : ${err.message}\nVérifiez l'URL, la clé Service Role, et les permissions RLS de votre table "${supabaseTable}".`);
    }
  };

  const handleImportSales = () => {
    if (!importText.trim()) {
      alert('Veuillez saisir des lignes de vente à importer.');
      return;
    }

    const lines = importText.split('\n');
    let importedCount = 0;
    let ignoredCount = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Skip comments
      if (trimmed.startsWith('#')) return;

      // Expected format: Nom client - Code Promo, Produit, Quantité, Mode Paiement (optionnel)
      // Example: Ablavi Gnonlonfoun - BOAF-AMB-0024, Pain Brioché Premium, 12, Mobile Money
      const parts = trimmed.split(',');
      if (parts.length < 3) {
        ignoredCount++;
        return;
      }

      const rawCustomer = parts[0].trim();
      const rawProduct = parts[1].trim();
      const rawQty = parseInt(parts[2].trim(), 10);
      const rawPayment = parts[3] ? parts[3].trim() : 'Espèces';

      if (isNaN(rawQty) || rawQty <= 0) {
        ignoredCount++;
        return;
      }

      // Find matching product
      const product = products.find(p => p.nom.toLowerCase() === rawProduct.toLowerCase() || p.id === rawProduct) || products[0] || { id: 'prod-1', nom: 'Pain Brioché Premium', prix: 1500 };
      
      const totalBrut = product.prix * rawQty;
      const parsed = parseClientNameAndPromo(rawCustomer, promoCodes, actors);

      const codeId = parsed.matchedPromoCode ? parsed.matchedPromoCode.id : undefined;
      const codeText = parsed.matchedPromoCode ? parsed.matchedPromoCode.code : (parsed.code_complet || parsed.numero_code || undefined);
      const discount = (parsed.matchedPromoCode && !parsed.has_code_error) ? Math.round(totalBrut * 0.05) : 0;
      const totalNet = totalBrut - discount;

      const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const ticketNum = `TK-IMP-${todayStr}-${Math.floor(100000 + Math.random() * 900000)}`;

      const item = {
        product_id: product.id,
        nom: product.nom,
        quantite: rawQty,
        prix_unitaire: product.prix,
        total_ligne: totalBrut
      };

      const newOrder: Order = {
        id: `ord-imp-${Date.now()}-${index}`,
        ticket_number: ticketNum,
        customer_name: parsed.nom_client,
        customer_phone: undefined,
        code_promo_id: codeId,
        code_promo_text: codeText,
        items: [item],
        total_brut: totalBrut,
        remise: discount,
        total_net: totalNet,
        payment_status: 'paid',
        order_status: 'valid',
        payment_mode: rawPayment,
        source: 'Importation',
        created_by: currentRole,
        created_at: new Date().toISOString(),
        has_code_error: parsed.has_code_error,
        code_error_type: parsed.code_error_type
      };

      onAddOrder(newOrder);
      importedCount++;
    });

    setImportText('');
    setShowImportModal(false);
    alert(`Importation par lot réussie ! ${importedCount} vente(s) enregistrée(s). Lignes ignorées/erronées : ${ignoredCount}.`);
  };

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

    let finalCustomerName = customerName || 'Client de Passage';
    let finalPromoCodeId = selectedPromoCodeId !== 'none' ? selectedPromoCodeId : undefined;
    let finalPromoCodeText = activePromoCode?.code;
    let finalRemise = discountVal;
    let finalTotalNet = totalNet;
    let has_code_error = false;
    let code_error_type: string | undefined = undefined;

    // Apply auto-parsing if selectedPromoCodeId is 'none' and customerName is provided
    if (selectedPromoCodeId === 'none' && customerName) {
      const parsed = parseClientNameAndPromo(customerName, promoCodes, actors);
      if (parsed.numero_code) {
        finalCustomerName = parsed.nom_client;
        if (parsed.matchedPromoCode) {
          finalPromoCodeId = parsed.matchedPromoCode.id;
          finalPromoCodeText = parsed.matchedPromoCode.code;
          // Apply 5% discount
          finalRemise = Math.round(totalBrut * 0.05);
          finalTotalNet = totalBrut - finalRemise;
        } else {
          // Extracted a code/number but no beneficiary matched
          finalPromoCodeText = parsed.code_complet || parsed.numero_code;
          has_code_error = true;
          code_error_type = 'code_inconnu';
        }
      }
    }

    const newOrder: Order = {
      id: `ord-dyn-${Date.now()}`,
      ticket_number: computedTicketNum,
      customer_name: finalCustomerName,
      customer_phone: customerPhone || undefined,
      code_promo_id: finalPromoCodeId,
      code_promo_text: finalPromoCodeText,
      items: [item],
      total_brut: totalBrut,
      remise: finalRemise,
      total_net: finalTotalNet,
      payment_status: 'paid',
      order_status: 'valid',
      payment_mode: paymentMode,
      source: currentRole === 'agent' ? 'Terrain' : 'Direct',
      created_by: currentRole,
      created_at: new Date().toISOString(),
      has_code_error,
      code_error_type
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
    if (showErrorOnly && !o.has_code_error) return false;
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
      <div className="bg-white dark:bg-[#121c33] p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-display font-black text-[#0B5D2A] dark:text-green-400 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500 animate-pulse" />
            Synchronisation & Hub de Ventes Supabase
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-normal">
            Plus besoin de saisir vos ventes en double ! Connectez la base de données de votre logiciel de vente externe Supabase pour alimenter automatiquement les résultats de BOAF Délices.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsSupabaseSyncMode(!isSupabaseSyncMode)}
            className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border flex items-center gap-1.5 cursor-pointer ${
              isSupabaseSyncMode 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-[#0B5D2A] dark:text-green-400 border-emerald-200 dark:border-emerald-900/40' 
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            {isSupabaseSyncMode ? 'Mode Supabase Activé' : 'Activer Mode Supabase'}
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-black text-xs uppercase tracking-wide rounded-xl flex items-center gap-1.5 shadow-md hover:scale-101 transition-all cursor-pointer shrink-0"
          >
            <FileText className="w-4 h-4" />
            Importer par lot
          </button>

          <button
            onClick={() => {
              if (products.length > 0) {
                setSelectedProductId(products[0].id);
                setCustomPrice(products[0].prix);
              }
              setShowNewSaleModal(true);
            }}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wide rounded-xl flex items-center gap-1.5 shadow-md hover:scale-101 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Saisie manuelle
          </button>
        </div>
      </div>

      {/* Supabase Connection Setup Card */}
      {isSupabaseSyncMode && (
        <div className="bg-slate-900/40 dark:bg-[#111c34]/40 p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Paramètres de Connexion Supabase Active
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Le logiciel va interroger la table <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-400 font-mono text-[10px]">{supabaseTable}</code> pour identifier toutes les commandes liées à un code promotionnel BOAF actif, puis recalculer instantanément les remises de 5% clients et vos commissions affiliés.
              </p>
            </div>

            <button
              onClick={handleSyncSupabase}
              disabled={isSyncing}
              className="px-5 py-3 bg-[#0B5D2A] hover:bg-emerald-700 disabled:bg-emerald-800/60 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Lecture Supabase en cours...' : 'Synchroniser maintenant'}
            </button>
          </div>

          {/* Sync Success message */}
          {syncSuccessMessage && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-900/60 text-emerald-300 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{syncSuccessMessage}</span>
            </div>
          )}

          {/* Setup fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
            <div className="space-y-1">
              <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-500">Supabase URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => {
                  setSupabaseUrl(e.target.value);
                  localStorage.setItem('boaf_supabase_url', e.target.value);
                }}
                placeholder="https://your-project.supabase.co"
                className="w-full py-1.5 px-3 bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-500">Service Role API Key</label>
              <div className="relative">
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => {
                    setSupabaseKey(e.target.value);
                    localStorage.setItem('boaf_supabase_key', e.target.value);
                  }}
                  placeholder="eyJhbGciOiJIUzI1..."
                  className="w-full py-1.5 pl-3 pr-8 bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <Lock className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-500">Nom de la table des commandes</label>
              <input
                type="text"
                value={supabaseTable}
                onChange={(e) => {
                  setSupabaseTable(e.target.value);
                  localStorage.setItem('boaf_supabase_table', e.target.value);
                }}
                placeholder="commandes"
                className="w-full py-1.5 px-3 bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main List view table */}
      <div className="bg-white dark:bg-[#121c33] p-6 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="font-display font-bold text-gray-950 dark:text-white text-sm">
              📋 Historique des ventes de pains et goûters
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-slate-500">Cliquez sur un ticket pour rééditer son reçu BOAF</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl">
              <button
                onClick={() => setShowErrorOnly(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !showErrorOnly
                    ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-3xs'
                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Toutes les ventes
              </button>
              <button
                onClick={() => setShowErrorOnly(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  showErrorOnly
                    ? 'bg-rose-500 text-white shadow-3xs'
                    : 'text-gray-400 hover:text-rose-500'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Alertes ({orders.filter(o => o.has_code_error).length})
              </button>
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
                      {order.has_code_error ? (
                        <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-rose-250 dark:border-rose-900/60 font-mono inline-flex items-center gap-1" title="Le numéro de code promo extrait n'existe pas ou est inactif">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" />
                          Code Inconnu ({order.code_promo_text || '?'})
                        </span>
                      ) : order.code_promo_text ? (
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


      {/* MODAL 3: BATCH IMPORTER MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-900/70 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-left text-xs">
          <div className="bg-white dark:bg-[#111c34] rounded-[28px] w-full max-w-lg overflow-hidden border border-gray-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh]">
            
            <div className="bg-indigo-700 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h3 className="text-sm font-display font-black uppercase tracking-wider">Importation de Ventes par lot</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-gray-700 dark:text-slate-200">
              <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-150 dark:border-indigo-900/50 space-y-2">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Format d'importation requis (CSV ou lignes de texte) :</h4>
                <p className="text-[11px] leading-relaxed">
                  Saisissez ou collez une ligne par vente en respectant l'ordre suivant séparé par des virgules : <br />
                  <code className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-400 font-mono text-[10px]">Client [et/ou Code], Désignation Produit, Quantité, Mode de Règlement</code>
                </p>
                <p className="text-[11px] font-bold mt-1 text-indigo-850 dark:text-indigo-300">Exemples valides :</p>
                <pre className="bg-white dark:bg-slate-950/80 p-2.5 rounded-lg border border-indigo-100 dark:border-slate-850 text-[10px] font-mono leading-tight">
{`Ablavi Gnonlonfoun BOAF-AMB-0024, Pain Brioché Premium, 10, Mobile Money
Jean Hounsou 0025, Gâteau Sec BOAF, 5, Moov Money
Marc Bio, Viennoiserie Goûter, 12, Espèces`}
                </pre>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Lignes de vente à traiter
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Collez vos lignes de vente ici..."
                  rows={8}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-gray-205 dark:border-slate-850 rounded-xl text-xs text-gray-800 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder-gray-400"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-gray-150 dark:border-slate-800 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleImportSales}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl cursor-pointer shadow-md shadow-indigo-900/10 transition-colors"
              >
                Lancer l'importation par lot
              </button>
            </div>

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
