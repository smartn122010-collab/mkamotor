/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Star, CheckCircle2, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectProduct: (product: Product) => void;
  setActivePage: (page: string) => void;
}

export default function Search({ searchQuery, setSearchQuery, onSelectProduct, setActivePage }: SearchProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Subscribe to products in Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error reading products:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter products as search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts([]);
      return;
    }
    const queryLower = searchQuery.toLowerCase();
    const matched = products.filter(p => 
      p.name.toLowerCase().includes(queryLower) ||
      p.category.toLowerCase().includes(queryLower) ||
      p.description.toLowerCase().includes(queryLower)
    );
    setFilteredProducts(matched);
  }, [searchQuery, products]);

  const handleOrderInitiate = (product: Product) => {
    onSelectProduct(product);
    setSelectedProduct(null); // Close modal
    setActivePage('register');
  };

  return (
    <div className="flex-1 min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2 flex items-center gap-2">
          <SearchIcon className="w-8 h-8 text-red-600" />
          <span>Real-time Spare Search</span>
        </h1>
        <p className="text-neutral-400 text-sm mb-8">
          Type part names, categories or letters. The catalog filters instantly below.
        </p>

        {/* Input Bar */}
        <div className="relative mb-10">
          <div className="absolute -inset-1 rounded-2xl bg-red-600/10 blur-md" />
          <div className="relative flex items-center bg-neutral-900 border border-red-950/80 rounded-2xl p-1">
            <SearchIcon className="text-neutral-500 w-6 h-6 ml-4" />
            <input
              type="text"
              placeholder="Start typing motorcycle part names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-4 bg-transparent text-white focus:outline-none font-semibold placeholder-neutral-500 text-base"
              id="search-page-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-neutral-500 hover:text-red-500 p-2 mr-2"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {loading ? (
          <div className="text-center py-20 text-neutral-400 font-mono flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
            <span>Consulting spare index...</span>
          </div>
        ) : !searchQuery.trim() ? (
          <div className="glass-panel rounded-2xl p-12 text-center border-red-950/20">
            <SearchIcon className="w-12 h-12 text-red-950/60 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-neutral-300">Awaiting Search Letters</h3>
            <p className="text-neutral-500 text-xs mt-1 max-w-sm mx-auto">
              Please enter more than one letter or part name in the bar above to query our wholesale inventory database.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border-red-950/30">
            <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-neutral-300">No Spares Matched "{searchQuery}"</h3>
            <p className="text-neutral-500 text-xs mt-1 max-w-sm mx-auto">
              Please check the spelling or type general categories like <span className="text-red-500 font-bold font-mono">Engine</span>, <span className="text-red-500 font-bold font-mono">Brakes</span>, or <span className="text-red-500 font-bold font-mono">Transmission</span>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="glass-panel rounded-xl overflow-hidden cursor-pointer hover:border-red-600/40 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 group shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                id={`search-result-card-${product.id}`}
              >
                {/* Product image container */}
                <div className="relative h-44 bg-neutral-900 border-b border-red-950/15 overflow-hidden">
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
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      No Stock
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-5">
                  <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest font-mono">
                    {product.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1 group-hover:text-red-400 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  
                  {/* Rating & Price row */}
                  <div className="flex items-center justify-between mt-4">
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

        {/* Detailed Product Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div 
              className="glass-panel-heavy rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)] border-red-900/40 relative animate-scaleUp"
            >
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
                    className="w-full h-full object-cover opacity-80"
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
                    <div className="flex items-center justify-between py-2 border-y border-red-950/20 mb-4">
                      <div>
                        <span className="text-[10px] text-neutral-500 block font-mono uppercase">Wholesale Price</span>
                        <span className="text-2xl font-black text-white font-mono">
                          ₹{selectedProduct.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 block font-mono uppercase">Availability</span>
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
                    onClick={() => handleOrderInitiate(selectedProduct)}
                    disabled={selectedProduct.stockStatus === 'unavailable'}
                    className="w-full py-3.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:from-neutral-900 disabled:to-neutral-900 disabled:border-neutral-800 disabled:text-neutral-600 text-white font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    id="search-order-initiate-btn"
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
