/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Key, Lock, Unlock, RefreshCw, BarChart3, Package, Gift, Edit3, Trash2, Plus, X, 
  CheckCircle2, TrendingUp, Sparkles, Database, Wrench, ShieldCheck, CreditCard, Calendar, BarChart2
} from 'lucide-react';
import { 
  collection, doc, getDoc, setDoc, addDoc, getDocs, deleteDoc, onSnapshot, query, updateDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Product, Offer, Stats } from '../types';

export default function Admin() {
  const [pinSetup, setPinSetup] = useState(false); // Whether a PIN exists
  const [pinEntered, setPinEntered] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Admin tabs: 'dashboard' | 'products' | 'offers'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'offers'>('dashboard');

  // Real-time collections
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Stat values state
  const [stats, setStats] = useState<Stats>({
    totalStock: 1420,
    totalService: 840,
    todaySale: 12500,
    monthSale: 345000,
    yearSale: 4120000,
    updatedAt: new Date().toISOString()
  });

  // Modal states
  const [editStatTarget, setEditStatTarget] = useState<keyof Stats | null>(null);
  const [editStatVal, setEditStatVal] = useState('');
  
  // Product Form Modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    image: '',
    price: '',
    rating: '4.5',
    category: 'Engine',
    description: '',
    stockStatus: 'available' as 'available' | 'unavailable'
  });

  // Offer Form Modal state
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({
    code: '',
    description: '',
    discount: '15',
    expiryDate: ''
  });

  // Check if PIN config already exists in Firestore / LocalStorage
  useEffect(() => {
    async function checkPinConfig() {
      try {
        const docRef = doc(db, 'admin', 'config');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().pinHash) {
          setPinSetup(true);
        } else {
          // Check localStorage backup
          const localPin = localStorage.getItem('mka_admin_pin');
          if (localPin) {
            setPinSetup(true);
            // Re-sync local pin back to firestore for durability
            await setDoc(docRef, { pinHash: localPin, updatedAt: new Date().toISOString() });
          } else {
            setPinSetup(false);
          }
        }
      } catch (err) {
        console.error("Error reading pin config:", err);
        // Fallback to local storage
        if (localStorage.getItem('mka_admin_pin')) {
          setPinSetup(true);
        }
      }
    }
    checkPinConfig();
  }, []);

  // Fetch Stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const docRef = doc(db, 'stats', 'dashboard');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStats(docSnap.data() as Stats);
        } else {
          // Initialize stats if empty
          const initialStats = {
            totalStock: 1420,
            totalService: 840,
            todaySale: 12500,
            monthSale: 345000,
            yearSale: 4120000,
            updatedAt: new Date().toISOString()
          };
          await setDoc(docRef, initialStats);
          setStats(initialStats);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        // Fallback to local storage cached values
        const cached = localStorage.getItem('mka_cached_stats');
        if (cached) setStats(JSON.parse(cached));
      }
    }
    fetchStats();
  }, [isUnlocked]);

  // Subscribe to real-time collections
  useEffect(() => {
    if (!isUnlocked) return;

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(fetched);
      setLoading(false);
    });

    const unsubOffers = onSnapshot(collection(db, 'offers'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
      setOffers(fetched);
    });

    return () => {
      unsubProducts();
      unsubOffers();
    };
  }, [isUnlocked]);

  // Handle PIN Setup
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPin.length < 4) {
      setError("PIN must be at least 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("PIN and Confirm PIN do not match.");
      return;
    }

    try {
      // For luxury simplicity, save plain pin string
      await setDoc(doc(db, 'admin', 'config'), {
        pinHash: newPin,
        updatedAt: new Date().toISOString()
      });
      localStorage.setItem('mka_admin_pin', newPin);
      setPinSetup(true);
      setIsUnlocked(true);
      setSuccess("Security PIN configured successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save security PIN configuration.");
    }
  };

  // Handle PIN Verification
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const docSnap = await getDoc(doc(db, 'admin', 'config'));
      let correctPin = '';
      if (docSnap.exists()) {
        correctPin = docSnap.data().pinHash;
      } else {
        correctPin = localStorage.getItem('mka_admin_pin') || '';
      }

      if (pinEntered === correctPin) {
        setIsUnlocked(true);
        setPinEntered('');
      } else {
        setError("Invalid security PIN. Access denied.");
      }
    } catch (err: any) {
      // Offline fallback
      const localPin = localStorage.getItem('mka_admin_pin');
      if (localPin && pinEntered === localPin) {
        setIsUnlocked(true);
        setPinEntered('');
      } else {
        setError("Invalid security PIN or Firestore is unavailable.");
      }
    }
  };

  // Handle PIN Reset
  const handleResetPin = () => {
    if (window.confirm("Are you sure you want to reset the admin PIN? This will wipe the locked configuration.")) {
      localStorage.removeItem('mka_admin_pin');
      setPinSetup(false);
      setIsUnlocked(false);
      setError("Security PIN has been reset. Please configure a new one.");
    }
  };

  // Stats Manual Update Modal Save
  const handleSaveStat = async () => {
    if (!editStatTarget || !editStatVal) return;
    const numericVal = parseInt(editStatVal) || 0;
    
    const updatedStats = {
      ...stats,
      [editStatTarget]: numericVal,
      updatedAt: new Date().toISOString()
    };

    setStats(updatedStats);
    setEditStatTarget(null);

    try {
      await setDoc(doc(db, 'stats', 'dashboard'), updatedStats);
      localStorage.setItem('mka_cached_stats', JSON.stringify(updatedStats));
    } catch (err) {
      console.error("Failed to update dashboard statistics:", err);
    }
  };

  // Handle Product deletion
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this spare part from the catalogue?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  // Open Product Modal for Add
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      image: '',
      price: '',
      rating: '4.5',
      category: 'Engine',
      description: '',
      stockStatus: 'available'
    });
    setProductModalOpen(true);
  };

  // Open Product Modal for Edit
  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      image: prod.image,
      price: prod.price.toString(),
      rating: prod.rating.toString(),
      category: prod.category,
      description: prod.description,
      stockStatus: prod.stockStatus
    });
    setProductModalOpen(true);
  };

  // Submit Product Add / Edit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.image || !productForm.price) {
      alert("Please enter Name, Image URL, and Price.");
      return;
    }

    const payload: Omit<Product, 'id'> = {
      name: productForm.name,
      image: productForm.image,
      price: parseFloat(productForm.price) || 0,
      rating: parseFloat(productForm.rating) || 4.5,
      category: productForm.category,
      description: productForm.description,
      stockStatus: productForm.stockStatus,
      createdAt: editingProduct?.createdAt || new Date().toISOString()
    };

    try {
      if (editingProduct?.id) {
        // Update
        await setDoc(doc(db, 'products', editingProduct.id), payload);
      } else {
        // Create
        await addDoc(collection(db, 'products'), payload);
      }
      setProductModalOpen(false);
    } catch (err) {
      console.error("Failed saving product:", err);
    }
  };

  // Submit Offer
  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.code || !offerForm.description || !offerForm.expiryDate) {
      alert("Please fill out all fields.");
      return;
    }

    const payload: Omit<Offer, 'id'> = {
      code: offerForm.code.toUpperCase().replace(/\s+/g, '-'),
      description: offerForm.description,
      discount: parseInt(offerForm.discount) || 10,
      expiryDate: offerForm.expiryDate,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'offers'), payload);
      setOfferModalOpen(false);
      setOfferForm({ code: '', description: '', discount: '15', expiryDate: '' });
    } catch (err) {
      console.error("Failed saving offer:", err);
    }
  };

  // Delete Offer
  const handleDeleteOffer = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this promotion code?")) {
      try {
        await deleteDoc(doc(db, 'offers', id));
      } catch (err) {
        console.error("Error deleting offer:", err);
      }
    }
  };

  // Seed Default Products Helper (makes testing incredibly smooth for the user)
  const handleSeedDefaults = async () => {
    const defaultSpares = [
      {
        name: "Yamaha R15 Cylinder Piston Kit",
        category: "Engine",
        price: 3450,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=80",
        rating: 4.8,
        stockStatus: "available" as const,
        description: "Original premium alloy cylinder barrel with high-thermal pistons, rings, wrist pin, and clips. Extends motorcycle lifecycle."
      },
      {
        name: "Brembo Sintered Racing Brake Pads",
        category: "Brakes",
        price: 1250,
        image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=80",
        rating: 4.9,
        stockStatus: "available" as const,
        description: "Premium racing sintered metal brake pads. Delivers ultimate friction, minimum heat fade, and reliable street stoppage."
      },
      {
        name: "Rolon Heavy Duty Brass Chain Sprocket Kit",
        category: "Transmission",
        price: 2800,
        image: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=500&auto=format&fit=crop&q=80",
        rating: 4.7,
        stockStatus: "available" as const,
        description: "Premium gold plated O-ring chain sprocket kit. Extremely low friction, high speed durability, and reduced stretch."
      },
      {
        name: "Amaron Pro Rider Maintenance-Free VRLA Battery",
        category: "Electrical",
        price: 1850,
        image: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=500&auto=format&fit=crop&q=80",
        rating: 4.6,
        stockStatus: "available" as const,
        description: "Corrosion resistant ultra-reliable VRLA battery with high CCA. Delivers instant start in freezing conditions."
      },
      {
        name: "Royal Enfield Classic double high comfort seat set",
        category: "Suspension & Body",
        price: 4200,
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=80",
        rating: 4.5,
        stockStatus: "available" as const,
        description: "Plush density touring split seat set for Classic 350. Waterproof weather resistant black upholstery."
      },
      {
        name: "Universal Carbon Fiber Aerodynamic Rear Mirrors",
        category: "Suspension & Body",
        price: 950,
        image: "https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?w=500&auto=format&fit=crop&q=80",
        rating: 4.4,
        stockStatus: "available" as const,
        description: "Sleek Carbon fiber styled motorcycle side mirrors. Non-glare wide-angle lenses for highway safety."
      }
    ];

    try {
      for (const item of defaultSpares) {
        await addDoc(collection(db, 'products'), {
          ...item,
          createdAt: new Date().toISOString()
        });
      }
      alert("Successfully seeded 6 default premium spare products!");
    } catch (err) {
      console.error("Failed seeding defaults:", err);
    }
  };

  // Locked View
  if (!isUnlocked) {
    return (
      <div className="flex-1 min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md">
          {!pinSetup ? (
            /* Screen A: PIN Configuration */
            <div className="glass-panel-heavy rounded-2xl p-8 border-red-950/40 relative shadow-[0_0_50px_rgba(220,38,38,0.15)] text-center">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
              
              <div className="mb-6 inline-flex items-center justify-center p-3.5 bg-red-950/30 border border-red-500/20 rounded-full text-red-500 relative">
                <Key className="w-8 h-8 text-red-600" />
                <div className="absolute inset-0 rounded-full border border-red-500/30 animate-pulse" />
              </div>

              <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">Set Security PIN</h2>
              <p className="text-neutral-400 text-xs mb-6 max-w-xs mx-auto">
                Establish a 4-digit numeric PIN to protect MKA Motors wholesale inventory & statistics.
              </p>

              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-red-400 text-xs text-left">
                  {error}
                </div>
              )}

              <form onSubmit={handleSavePin} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Enter New PIN</label>
                  <input
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="Enter numeric PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-center font-bold tracking-widest text-lg"
                    id="setup-pin-input"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Confirm PIN</label>
                  <input
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="Confirm numeric PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-center font-bold tracking-widest text-lg"
                    id="confirm-pin-input"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-extrabold rounded-xl transition-all duration-300 text-sm tracking-wide shadow-lg cursor-pointer"
                  id="save-pin-btn"
                >
                  SAVE SECURITY PIN
                </button>
              </form>
            </div>
          ) : (
            /* Screen B: Enter Security PIN */
            <div className="glass-panel-heavy rounded-2xl p-8 border-red-950/40 relative shadow-[0_0_50px_rgba(220,38,38,0.15)] text-center">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
              
              <div className="mb-6 inline-flex items-center justify-center p-3.5 bg-red-950/30 border border-red-500/20 rounded-full text-red-500 relative">
                <Lock className="w-8 h-8 text-red-600" />
                <div className="absolute inset-0 rounded-full border border-red-500/30 animate-pulse" />
              </div>

              <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">Unlock Admin Dashboard</h2>
              <p className="text-neutral-400 text-xs mb-6 max-w-xs mx-auto">
                Enter your secure code to modify wholesale pricing, inventory, and stats.
              </p>

              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-red-400 text-xs text-center font-mono">
                  {error}
                </div>
              )}

              <form onSubmit={handleUnlock} className="space-y-4">
                <input
                  type="password"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="• • • •"
                  value={pinEntered}
                  onChange={(e) => setPinEntered(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-center font-black tracking-[0.5em] text-2xl"
                  id="unlock-pin-input"
                  autoFocus
                />

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-extrabold rounded-xl transition-all duration-300 text-sm tracking-wide shadow-lg cursor-pointer"
                  id="unlock-submit-btn"
                >
                  UNLOCK SYSTEM
                </button>
              </form>

              <button 
                onClick={handleResetPin}
                className="mt-6 text-[10px] text-neutral-500 hover:text-red-400 transition-colors font-mono cursor-pointer uppercase block mx-auto"
              >
                Reset Pin Options
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Unlocked Admin View
  const inStockCount = products.filter(p => p.stockStatus === 'available').length;

  return (
    <div className="flex-1 min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-red-950/15 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              <span className="text-xs text-red-500 font-extrabold uppercase tracking-widest font-mono">CONTROL CONSOLE UNLOCKED</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">MKA ADMIN CONSOLE</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleResetPin}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-red-950/30 text-neutral-400 hover:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              id="admin-reset-pin-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Access PIN</span>
            </button>
            <button 
              onClick={() => setIsUnlocked(false)}
              className="px-4 py-2 bg-red-950/30 border border-red-900/30 text-red-400 hover:bg-red-900 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              id="admin-lock-btn"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Console</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-950/30 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 border-b border-red-950/10 pb-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-red-700 border border-red-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Stat Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'products' ? 'bg-red-700 border border-red-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            <Package className="w-4 h-4" />
            <span>Catalog Items ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'offers' ? 'bg-red-700 border border-red-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            <Gift className="w-4 h-4" />
            <span>Promotions ({offers.length})</span>
          </button>
        </div>

        {/* Tab 1: Stat Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* 5 Stat Cards Grid with distinct colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              
              {/* Total Stock - Red */}
              <div className="glass-panel hover:border-red-600/40 transition-all p-5 rounded-2xl relative group shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-red-950/30 flex items-center justify-center text-red-500 border border-red-500/10">
                    <Database className="w-5 h-5" />
                  </div>
                  <button 
                    onClick={() => { setEditStatTarget('totalStock'); setEditStatVal(stats.totalStock.toString()); }}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-red-500 border border-transparent hover:border-red-950/20 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-4">
                  <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest block">Total Stock Volumes</span>
                  <span className="text-2xl font-black text-white block mt-1 font-mono tracking-tight group-hover:text-red-500 transition-colors">
                    {stats.totalStock.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Total Services - Amber */}
              <div className="glass-panel hover:border-amber-600/40 transition-all p-5 rounded-2xl relative group shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/30 flex items-center justify-center text-amber-500 border border-amber-500/10">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <button 
                    onClick={() => { setEditStatTarget('totalService'); setEditStatVal(stats.totalService.toString()); }}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-amber-500 border border-transparent hover:border-amber-950/20 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-4">
                  <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest block">Total Services</span>
                  <span className="text-2xl font-black text-white block mt-1 font-mono tracking-tight group-hover:text-amber-500 transition-colors">
                    {stats.totalService.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Today's Sales - Emerald */}
              <div className="glass-panel hover:border-emerald-600/40 transition-all p-5 rounded-2xl relative group shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/30 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <button 
                    onClick={() => { setEditStatTarget('todaySale'); setEditStatVal(stats.todaySale.toString()); }}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-emerald-500 border border-transparent hover:border-emerald-950/20 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-4">
                  <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest block">Today Sales (INR)</span>
                  <span className="text-2xl font-black text-white block mt-1 font-mono tracking-tight group-hover:text-emerald-500 transition-colors">
                    ₹{stats.todaySale.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Month Sales - Blue */}
              <div className="glass-panel hover:border-blue-600/40 transition-all p-5 rounded-2xl relative group shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/30 flex items-center justify-center text-blue-500 border border-blue-500/10">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <button 
                    onClick={() => { setEditStatTarget('monthSale'); setEditStatVal(stats.monthSale.toString()); }}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-blue-500 border border-transparent hover:border-blue-950/20 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-4">
                  <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest block">Month Sales (INR)</span>
                  <span className="text-2xl font-black text-white block mt-1 font-mono tracking-tight group-hover:text-blue-500 transition-colors">
                    ₹{stats.monthSale.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Year Sales - Purple */}
              <div className="glass-panel hover:border-purple-600/40 transition-all p-5 rounded-2xl relative group shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/30 flex items-center justify-center text-purple-500 border border-purple-500/10">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <button 
                    onClick={() => { setEditStatTarget('yearSale'); setEditStatVal(stats.yearSale.toString()); }}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-purple-500 border border-transparent hover:border-purple-950/20 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-4">
                  <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest block">Year Sales (INR)</span>
                  <span className="text-2xl font-black text-white block mt-1 font-mono tracking-tight group-hover:text-purple-500 transition-colors">
                    ₹{stats.yearSale.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>

            {/* Quick Summary Row */}
            <div className="glass-panel rounded-2xl p-6 border-red-950/15">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
                <span>Quick Stock & sales Summary</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-neutral-400 font-mono">
                <div className="bg-neutral-900/40 p-4 rounded-xl border border-red-950/10">
                  <span className="block text-[10px] text-neutral-500">WHOLESALE CATALOG STATUS</span>
                  <span className="block text-sm font-bold text-neutral-200 mt-1">
                    {products.length} registered spares ({inStockCount} in stock)
                  </span>
                </div>
                <div className="bg-neutral-900/40 p-4 rounded-xl border border-red-950/10">
                  <span className="block text-[10px] text-neutral-500">TODAY'S OUTLOOK</span>
                  <span className="block text-sm font-bold text-emerald-400 mt-1">
                    ₹{stats.todaySale.toLocaleString('en-IN')} cash volume flowing
                  </span>
                </div>
                <div className="bg-neutral-900/40 p-4 rounded-xl border border-red-950/10">
                  <span className="block text-[10px] text-neutral-500">MONTH VS YEAR TALLY</span>
                  <span className="block text-sm font-bold text-neutral-200 mt-1">
                    {((stats.monthSale / stats.yearSale) * 100 || 0).toFixed(1)}% of annual target reached
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Stat Entry Compact Table */}
            <div className="glass-panel rounded-2xl p-6 border-red-950/15">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Manual Stat Entry Panel
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono text-neutral-400">
                  <thead>
                    <tr className="border-b border-red-950/20 text-[10px] text-neutral-500 uppercase font-mono">
                      <th className="py-2.5">Statistic Title</th>
                      <th className="py-2.5">Current Value</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-950/10">
                    <tr>
                      <td className="py-3 font-semibold text-neutral-200">Total Stock Volumes</td>
                      <td className="py-3 text-red-500 font-bold">{stats.totalStock}</td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => { setEditStatTarget('totalStock'); setEditStatVal(stats.totalStock.toString()); }}
                          className="px-3 py-1 rounded bg-neutral-900 hover:bg-red-950/30 hover:text-red-400 border border-red-950/20 text-neutral-400 text-xs font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-neutral-200">Total Services Count</td>
                      <td className="py-3 text-amber-500 font-bold">{stats.totalService}</td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => { setEditStatTarget('totalService'); setEditStatVal(stats.totalService.toString()); }}
                          className="px-3 py-1 rounded bg-neutral-900 hover:bg-amber-950/30 hover:text-amber-400 border border-red-950/20 text-neutral-400 text-xs font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-neutral-200">Today's Sales Revenue (₹)</td>
                      <td className="py-3 text-emerald-500 font-bold">₹{stats.todaySale.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => { setEditStatTarget('todaySale'); setEditStatVal(stats.todaySale.toString()); }}
                          className="px-3 py-1 rounded bg-neutral-900 hover:bg-emerald-950/30 hover:text-emerald-400 border border-red-950/20 text-neutral-400 text-xs font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-neutral-200">Month's Sales Revenue (₹)</td>
                      <td className="py-3 text-blue-500 font-bold">₹{stats.monthSale.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => { setEditStatTarget('monthSale'); setEditStatVal(stats.monthSale.toString()); }}
                          className="px-3 py-1 rounded bg-neutral-900 hover:bg-blue-950/30 hover:text-blue-400 border border-red-950/20 text-neutral-400 text-xs font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-neutral-200">Year's Sales Revenue (₹)</td>
                      <td className="py-3 text-purple-500 font-bold">₹{stats.yearSale.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => { setEditStatTarget('yearSale'); setEditStatVal(stats.yearSale.toString()); }}
                          className="px-3 py-1 rounded bg-neutral-900 hover:bg-purple-950/30 hover:text-purple-400 border border-red-950/20 text-neutral-400 text-xs font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Editing Statistic Modal */}
            {editStatTarget && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="glass-panel-heavy rounded-2xl w-full max-w-sm p-6 border-red-900/40 relative animate-scaleUp">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">Edit Dashboard Statistic</h3>
                  <p className="text-neutral-400 text-xs mb-4">
                    Modify the numeric value. This updates real-time across client screens.
                  </p>
                  
                  <input
                    type="number"
                    value={editStatVal}
                    onChange={(e) => setEditStatVal(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-center text-lg font-bold font-mono"
                    id="edit-stat-numeric-input"
                    autoFocus
                  />

                  <div className="flex gap-2.5 mt-5">
                    <button 
                      onClick={() => setEditStatTarget(null)}
                      className="flex-1 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveStat}
                      className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Products Catalog management */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold uppercase tracking-tight">Manage Spare Parts</h2>
              <div className="flex gap-2.5">
                {products.length === 0 && (
                  <button 
                    onClick={handleSeedDefaults}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-red-950/40 text-neutral-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Database className="w-4 h-4 text-red-500" />
                    <span>Seed Demo Spares</span>
                  </button>
                )}
                <button
                  onClick={openAddProductModal}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  id="admin-add-product-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Spare Part</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-neutral-400 font-mono">
                Loading catalogue items...
              </div>
            ) : products.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center border-red-950/20">
                <Package className="w-12 h-12 text-red-950/40 mx-auto mb-4" />
                <h3 className="text-base font-bold text-neutral-400">Catalogue is Currently Empty</h3>
                <p className="text-neutral-500 text-xs mt-1">
                  Click 'Register Spare Part' or 'Seed Demo Spares' above to populate motorcycle inventory.
                </p>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl overflow-hidden border-red-950/15">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono text-neutral-400">
                    <thead>
                      <tr className="border-b border-red-950/20 text-[10px] text-neutral-500 uppercase font-mono bg-neutral-950/40">
                        <th className="p-4">Image</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Wholesale Price</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-950/10">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-red-950/5 transition-colors">
                          <td className="p-4">
                            <div className="w-12 h-12 rounded bg-neutral-900 overflow-hidden border border-red-950/15">
                              <img src={p.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-white font-sans max-w-xs truncate">{p.name}</td>
                          <td className="p-4 uppercase text-[10px] text-neutral-400 font-mono">{p.category}</td>
                          <td className="p-4 font-bold text-white">₹{p.price.toLocaleString('en-IN')}</td>
                          <td className="p-4">
                            {p.stockStatus === 'available' ? (
                              <span className="text-green-500 font-bold">In Stock</span>
                            ) : (
                              <span className="text-red-500 font-bold">No Stock</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => openEditProductModal(p)}
                                className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-red-950/10 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(p.id!)}
                                className="p-1.5 rounded bg-red-950/30 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Product Modal overlay */}
            {productModalOpen && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="glass-panel-heavy rounded-2xl w-full max-w-lg p-6 md:p-8 border-red-900/40 relative animate-scaleUp max-h-[90vh] overflow-y-auto">
                  <button 
                    onClick={() => setProductModalOpen(false)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="text-lg font-black uppercase tracking-tight text-white mb-6">
                    {editingProduct ? 'Modify Registered Spare' : 'Register New Spare Part'}
                  </h3>

                  <form onSubmit={handleProductSubmit} className="space-y-4 text-left font-sans text-xs font-semibold">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Spare Part Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TVS Apache RTR 160 Valve Guide"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-white text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Wholesale Price (₹)</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 1450"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Product Rating (1.0 - 5.0)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          required
                          value={productForm.rating}
                          onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })}
                          className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-white text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Category</label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-white text-sm"
                        >
                          <option value="Engine">Engine</option>
                          <option value="Brakes">Brakes</option>
                          <option value="Transmission">Transmission</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Suspension & Body">Suspension & Body</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Availability</label>
                        <select
                          value={productForm.stockStatus}
                          onChange={(e) => setProductForm({ ...productForm, stockStatus: e.target.value as 'available' | 'unavailable' })}
                          className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-white text-sm"
                        >
                          <option value="available">In Stock (Available)</option>
                          <option value="unavailable">Out of Stock (Unavailable)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Image URL</label>
                      <input
                        type="url"
                        required
                        placeholder="https://images.unsplash.com/..."
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Product Description / Uses</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Describe compatibility, dimensions, brand origin, and durability specifications..."
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-white text-sm resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-extrabold rounded-xl text-sm transition-all shadow-lg cursor-pointer"
                    >
                      SAVE SPARE PART
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Active Promotions/Offers Management */}
        {activeTab === 'offers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold uppercase tracking-tight">Claimable Promotions</h2>
              <button
                onClick={() => setOfferModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                id="admin-add-offer-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Issue Coupon Offer</span>
              </button>
            </div>

            {offers.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center border-red-950/20">
                <Gift className="w-12 h-12 text-red-950/40 mx-auto mb-4" />
                <h3 className="text-base font-bold text-neutral-400">No Promotions Issued</h3>
                <p className="text-neutral-500 text-xs mt-1">
                  Click 'Issue Coupon Offer' to configure live branch codes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                  <div key={offer.id} className="glass-panel rounded-2xl p-5 border-red-600/15 relative flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-2.5 py-1 rounded bg-red-950/40 border border-red-500/20 text-red-500 font-extrabold text-xs font-mono">
                          {offer.discount}% DISCOUNT
                        </span>
                        <button 
                          onClick={() => handleDeleteOffer(offer.id!)}
                          className="p-1.5 rounded bg-red-950/30 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight font-mono">{offer.code}</h3>
                      <p className="text-neutral-400 text-xs mt-2 leading-relaxed">{offer.description}</p>
                    </div>

                    <div className="mt-5 border-t border-red-950/10 pt-3 text-[10px] text-neutral-500 font-mono">
                      EXPIRES: {new Date(offer.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Offer Modal Overlay */}
            {offerModalOpen && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="glass-panel-heavy rounded-2xl w-full max-w-sm p-6 border-red-900/40 relative animate-scaleUp">
                  <button 
                    onClick={() => setOfferModalOpen(false)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="text-base font-black uppercase tracking-tight text-white mb-6">
                    Issue New Promo Coupon
                  </h3>

                  <form onSubmit={handleOfferSubmit} className="space-y-4 text-left font-sans text-xs font-semibold">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Coupon Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MKA-BULK15"
                        value={offerForm.code}
                        onChange={(e) => setOfferForm({ ...offerForm, code: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-white text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Discount (%)</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          required
                          value={offerForm.discount}
                          onChange={(e) => setOfferForm({ ...offerForm, discount: e.target.value })}
                          className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Expiry Date</label>
                        <input
                          type="date"
                          required
                          value={offerForm.expiryDate}
                          onChange={(e) => setOfferForm({ ...offerForm, expiryDate: e.target.value })}
                          className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-white text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Promotion Description</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Claim 15% discount on TVS chain sets."
                        value={offerForm.description}
                        onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none rounded-xl text-white text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg cursor-pointer"
                    >
                      ISSUE PROMOTIONAL CODE
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
