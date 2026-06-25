/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Briefcase, Star, CheckCircle2, AlertTriangle, ArrowRight, X, Sparkles } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

interface ProductsProps {
  onSelectProduct: (product: Product) => void;
  setActivePage: (page: string) => void;
}

const CATEGORIES = [
  'All',
  'Engine',
  'Brakes',
  'Transmission',
  'Electrical',
  'Suspension & Body'
];

export default function Products({ onSelectProduct, setActivePage }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Subscribe to real-time products collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleOrderClick = (product: Product) => {
    onSelectProduct(product);
    setSelectedProduct(null); // Close detail modal
    setActivePage('register');
  };

  return (
    <div className="flex-1 min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-red-950/10 pb-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Briefcase className="w-8 h-8 text-red-600" />
              <span>WHOLESALE SPARES CATALOGUE</span>
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Select categories to filter inventory. Real-time availability from our master storage.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/30 border border-red-500/10 text-red-500 font-mono text-xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{products.length} Products Registered</span>
          </div>
        </div>

        {/* Category Filters row */}
        <div className="flex gap-2.5 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer
                ${selectedCategory === cat 
                  ? 'bg-red-700 text-white shadow-lg shadow-red-900/30 border border-red-600' 
                  : 'bg-neutral-900 border border-red-950/20 text-neutral-400 hover:text-white hover:border-red-950'
                }
              `}
              id={`category-chip-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Body */}
        {loading ? (
          <div className="text-center py-24 text-neutral-400 font-mono flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
            <span>Consulting warehouse shelf database...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center border-red-950/30">
            <Briefcase className="w-16 h-16 text-red-950/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-300 uppercase">NO PRODUCTS REGISTERED</h3>
            <p className="text-neutral-500 text-xs mt-2 max-w-md mx-auto leading-relaxed">
              Currently there are zero products on the store. The website is ready and awaiting inventory. 
              Please navigate to the <span className="text-red-500 font-bold">Admin Panel</span> inside the sidebar to manually seed or add new spares!
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center border-red-950/20">
            <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-neutral-300">No Spares in "{selectedCategory}"</h3>
            <p className="text-neutral-500 text-xs mt-1">
              There are no spare parts categorized under this section currently.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="glass-panel rounded-xl overflow-hidden cursor-pointer hover:border-red-600/40 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 group shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between"
                id={`product-card-${product.id}`}
              >
                {/* Product image container */}
                <div className="relative h-48 bg-neutral-900 border-b border-red-950/15 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  {product.stockStatus === 'available' ? (
                    <span className="absolute top-3 right-3 bg-green-950/80 border border-green-500/30 text-green-400 text-[10px] font-extrabold uppercase font-mono px-2 py-1 rounded-md tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      In Stock
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 bg-red-950/80 border border-red-500/30 text-red-400 text-[10px] font-extrabold uppercase font-mono px-2 py-1 rounded-md tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      No Stock
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest font-mono">
                      {product.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 group-hover:text-red-400 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                  
                  {/* Rating & Price row */}
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-bold text-neutral-300 font-mono">{product.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-lg font-black text-white font-mono">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Details Modal Overlay */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-panel-heavy rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)] border-red-900/40 relative animate-scaleUp">
              {/* Close Button */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-red-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image panel */}
                <div className="h-64 md:h-full relative bg-neutral-900">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover opacity-85"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Content Panel */}
                <div className="p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-red-500 font-extrabold uppercase tracking-widest font-mono block">
                      {selectedProduct.category}
                    </span>
                    <h2 className="text-xl md:text-2xl font-black uppercase text-white tracking-tight mt-1 mb-3">
                      {selectedProduct.name}
                    </h2>

                    {/* Price and Stock Row */}
                    <div className="flex items-center justify-between py-2 border-y border-red-950/20 mb-4 font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">Wholesale Price</span>
                        <span className="text-2xl font-black text-white">
                          ₹{selectedProduct.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 block uppercase">Availability</span>
                        {selectedProduct.stockStatus === 'available' ? (
                          <span className="text-green-500 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            In Stock
                          </span>
                        ) : (
                          <span className="text-red-500 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1 justify-end">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            No Stock
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-yellow-500 font-bold text-xs uppercase tracking-wider mb-1 block">RATING</span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4.5 h-4.5 ${i < Math.floor(selectedProduct.rating) ? 'fill-current' : 'text-neutral-800'}`} 
                          />
                        ))}
                        <span className="text-xs text-neutral-300 font-mono ml-2 font-bold">
                          {selectedProduct.rating.toFixed(1)} / 5.0
                        </span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="text-neutral-500 text-[10px] font-mono uppercase block mb-1">PROD DESCRIPTION</span>
                      <p className="text-neutral-300 text-xs leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOrderClick(selectedProduct)}
                    disabled={selectedProduct.stockStatus === 'unavailable'}
                    className="w-full py-3.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:from-neutral-900 disabled:to-neutral-900 disabled:border-neutral-800 disabled:text-neutral-600 text-white font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    id="catalog-order-btn"
                  >
                    <span>Proceed to Order Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
