/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Phone, Mail, Award, MessageCircle, ChevronLeft, ChevronRight, Gift, Disc, Sparkles } from 'lucide-react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Offer } from '../types';

interface HomeProps {
  setActivePage: (page: string) => void;
  setSearchQuery: (query: string) => void;
  onSelectProduct: (product: Product) => void;
}

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&auto=format&fit=crop&q=80',
    title: 'PREMIUM CHROME CRUISER SPARES',
    subtitle: 'Finest engine parts, clutches, and custom exhausts for performance cruisers.'
  },
  {
    image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=1200&auto=format&fit=crop&q=80',
    title: 'REINFORCED CHAINS & SPROCKETS',
    subtitle: 'Heavy-duty high-speed transmission gear for all performance superbikes.'
  },
  {
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&auto=format&fit=crop&q=80',
    title: 'RACING BRAKES & CALIPERS',
    subtitle: 'Premium ceramic and carbon brake assemblies for ultimate stopping power.'
  },
  {
    image: 'https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?w=1200&auto=format&fit=crop&q=80',
    title: 'M K A MOTORS WHOLESALE',
    subtitle: 'Tamil Nadu’s primary hub for original multi-brand two-wheeler spare parts.'
  }
];

export default function Home({ setActivePage, setSearchQuery, onSelectProduct }: HomeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [queryInput, setQueryInput] = useState('');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  // Auto slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's offers from Firestore
  useEffect(() => {
    async function fetchOffers() {
      try {
        const q = query(collection(db, 'offers'), limit(5));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
        setOffers(fetched);
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setLoadingOffers(false);
      }
    }
    fetchOffers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      setSearchQuery(queryInput.trim());
      setActivePage('search');
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="flex-1 min-h-screen bg-neutral-950 text-white font-sans overflow-x-hidden">
      {/* 1. Header Banner & Slideshow with 3D Jump & Animation */}
      <div className="relative w-full h-[320px] md:h-[480px] bg-neutral-950 overflow-hidden border-b border-red-950/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/20 z-10" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-950 to-transparent z-10" />
            <img 
              src={SLIDES[currentSlide].image} 
              alt={SLIDES[currentSlide].title}
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            
            {/* Overlay slide content with luxury typography */}
            <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-12 md:pb-20 z-10 max-w-4xl">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-red-500 font-extrabold text-xs md:text-sm tracking-widest uppercase font-mono mb-2 flex items-center gap-1.5"
              >
                <Disc className="w-4.5 h-4.5 text-red-500 animate-spin-slow" />
                MKA Motors Exclusive
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase"
              >
                {SLIDES[currentSlide].title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-neutral-300 text-xs md:text-base mt-2 max-w-xl font-normal leading-relaxed text-shadow"
              >
                {SLIDES[currentSlide].subtitle}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slideshow Arrow Navigation */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 border border-neutral-800 flex items-center justify-center text-white hover:border-red-500 hover:bg-red-950/20 hover:text-red-400 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 border border-neutral-800 flex items-center justify-center text-white hover:border-red-500 hover:bg-red-950/20 hover:text-red-400 transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-red-600 w-6' : 'bg-neutral-600 hover:bg-neutral-400'}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Search Section */}
      <div className="max-w-4xl mx-auto px-6 -mt-10 md:-mt-16 relative z-20 mb-14">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel-heavy rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-red-950/50"
        >
          <div className="text-center md:text-left mb-4">
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-wide">
              SEARCH THE PREMIUM SPARES CATALOGUE
            </h2>
            <p className="text-neutral-400 text-xs md:text-sm mt-1">
              Type part name, category or brand model letters to instantly discover original spare parts
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            {/* Glowing red accent ring */}
            <div className="absolute -inset-1 rounded-xl bg-red-600/25 blur-md opacity-75 group-focus-within:opacity-100 transition-opacity" />
            
            <div className="relative flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="e.g. clutch plate, brake shoe, cylinder piston, headlight..."
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 text-white font-medium text-sm transition-all shadow-inner placeholder-neutral-500"
                  id="home-search-input"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer"
                id="home-search-submit"
              >
                <span>Find Spare</span>
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* 3. Today's Offers Banner Slider & Enter Button */}
      <div className="max-w-6xl mx-auto px-6 mb-20">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b border-red-950/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="text-red-500 font-extrabold uppercase text-xs tracking-widest font-mono">EXCLUSIVE SAVINGS</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              TODAY'S SPECIAL DISCOUNTS
            </h2>
            <p className="text-neutral-400 text-xs md:text-sm mt-0.5">
              Copy these codes, visit the MKA branch and claim wholesale discounts directly from the manager.
            </p>
          </div>
          
          <button
            onClick={() => setActivePage('products')}
            className="w-full md:w-auto px-6 py-3.5 bg-neutral-900 border border-red-900/30 text-white hover:text-red-400 hover:bg-red-950/20 hover:border-red-600 rounded-xl font-bold transition-all duration-300 text-sm flex items-center justify-center gap-2 group cursor-pointer"
            id="enter-showroom-btn"
          >
            <span>Enter Products Menu</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loadingOffers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(n => (
              <div key={n} className="h-32 rounded-xl bg-neutral-900/60 border border-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          /* Elegant Pre-loaded static Fallback Offers if database is empty */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-6 border-red-600/20 hover:border-red-600/50 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 bg-red-600/10 border-b border-l border-red-600/20 rounded-bl-xl text-red-500 text-xs font-mono font-bold">15% OFF</div>
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-8 h-8 text-red-500" />
                <h3 className="text-lg font-bold">CLUTCH ASSEMBLIES</h3>
              </div>
              <p className="text-neutral-400 text-xs mb-4 leading-relaxed">Save huge on heavy-duty clutch plate kits. Premium multi-plate clutch assembly packs.</p>
              <div className="flex justify-between items-center bg-neutral-950/60 px-4 py-2.5 rounded-lg border border-red-950/40">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">COUPON CODE</span>
                <span className="text-red-500 font-extrabold font-mono text-sm group-hover:scale-105 transition-transform">MKA-CLUTCH15</span>
              </div>
            </div>
            
            <div className="glass-panel rounded-2xl p-6 border-red-600/20 hover:border-red-600/50 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 bg-red-600/10 border-b border-l border-red-600/20 rounded-bl-xl text-red-500 text-xs font-mono font-bold">10% OFF</div>
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-8 h-8 text-red-500" />
                <h3 className="text-lg font-bold">SPARK PLUG DEALS</h3>
              </div>
              <p className="text-neutral-400 text-xs mb-4 leading-relaxed">Flat discount on original NGK, Bosch & Denso double-iridium high-voltage spark plugs.</p>
              <div className="flex justify-between items-center bg-neutral-950/60 px-4 py-2.5 rounded-lg border border-red-950/40">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">COUPON CODE</span>
                <span className="text-red-500 font-extrabold font-mono text-sm group-hover:scale-105 transition-transform">MKA-SPARK10</span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 border-red-600/20 hover:border-red-600/50 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 bg-red-600/10 border-b border-l border-red-600/20 rounded-bl-xl text-red-500 text-xs font-mono font-bold">₹500 OFF</div>
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-8 h-8 text-red-500" />
                <h3 className="text-lg font-bold">WHOLE CHAIN KITS</h3>
              </div>
              <p className="text-neutral-400 text-xs mb-4 leading-relaxed">Flat cash discount on complete Rolon or brass chain sprocket set replacements.</p>
              <div className="flex justify-between items-center bg-neutral-950/60 px-4 py-2.5 rounded-lg border border-red-950/40">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">COUPON CODE</span>
                <span className="text-red-500 font-extrabold font-mono text-sm group-hover:scale-105 transition-transform">MKA-CHAIN500</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div 
                key={offer.id} 
                className="glass-panel rounded-2xl p-6 border-red-600/20 hover:border-red-600/50 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-3 bg-red-600/10 border-b border-l border-red-600/20 rounded-bl-xl text-red-500 text-xs font-mono font-bold">
                  {offer.discount}% OFF
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-8 h-8 text-red-500" />
                  <h3 className="text-lg font-bold truncate uppercase tracking-tight">{offer.code}</h3>
                </div>
                <p className="text-neutral-400 text-xs mb-4 leading-relaxed">
                  {offer.description}
                </p>
                <div className="flex justify-between items-center bg-neutral-950/60 px-4 py-2.5 rounded-lg border border-red-950/40">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">COUPON CODE</span>
                  <span className="text-red-500 font-extrabold font-mono text-sm group-hover:scale-105 transition-transform">{offer.code}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Luxury Structured Contact Us Section */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass-panel rounded-3xl p-8 md:p-12 border-red-950/60 shadow-[0_20px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
        >
          {/* Subtle neon glowing accent lines */}
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-red-600/10 blur-[50px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-red-900/10 blur-[50px] rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left side info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/30 border border-red-500/20 text-red-500 text-[10px] font-extrabold uppercase tracking-widest font-mono mb-4">
                Primary Distributor
              </div>
              <h2 className="text-3xl font-black text-white tracking-wide uppercase">
                M K A MOTORS
              </h2>
              <p className="text-red-500 font-bold uppercase tracking-widest text-xs mt-1 font-mono">
                Two Wheeler Spares Whole Dealers
              </p>
              
              <p className="text-neutral-400 text-sm mt-4 leading-relaxed font-normal">
                Serving dealers, workshops, and individual motorists across South India with original, highly durable components. We stock certified assemblies for major brands including Honda, Hero, Bajaj, TVS, Yamaha, and Royal Enfield.
              </p>

              <div className="mt-8 space-y-4">
                <a 
                  href="tel:9944003164" 
                  className="flex items-center gap-4 group p-3 rounded-xl bg-neutral-950/60 border border-neutral-900 hover:border-red-950 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-red-950/20 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-500 uppercase tracking-widest font-mono">CALL US DIRECTLY</span>
                    <span className="block text-base text-white font-bold font-mono group-hover:text-red-500 transition-colors">73050 68207</span>
                  </div>
                </a>

                <a 
                  href="mailto:mkamotors16@outlook.com" 
                  className="flex items-center gap-4 group p-3 rounded-xl bg-neutral-950/60 border border-neutral-900 hover:border-red-950 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-red-950/20 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-500 uppercase tracking-widest font-mono">EMAIL ENQUIRIES</span>
                    <span className="block text-base text-white font-bold font-mono group-hover:text-red-500 transition-colors">mkamotors16@outlook.com</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Right side WhatsApp Connect */}
            <div className="flex flex-col justify-between bg-neutral-950/40 p-6 rounded-2xl border border-red-950/40">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-950/20 border border-green-500/20 flex items-center justify-center text-green-500">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Official WhatsApp Channel</h3>
                    <span className="text-[10px] text-green-500 font-mono font-bold uppercase tracking-wider">Join For Live Catalog Updates</span>
                  </div>
                </div>
                
                <p className="text-neutral-400 text-xs leading-relaxed mb-6">
                  Subscribe to our WhatsApp Channel to receive instant alerts on fresh stock arrivals, wholesale clearance items, and limited-edition product offers. Join our network of over 10,000 spare part dealers.
                </p>
              </div>

              <div className="space-y-3">
                <a 
                  href="https://whatsapp.com/channel/0029VbDLD8lDDmFa22OmnV2g" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-neutral-950 hover:text-black font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-950/30 cursor-pointer"
                  id="whatsapp-channel-btn"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span className="uppercase tracking-wider text-xs">Join WhatsApp Channel</span>
                </a>
                
                <p className="text-[10px] text-center text-neutral-500 font-mono">
                  For product enquiries and wholesale orders, contact us anytime.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer copyright */}
      <div className="w-full py-8 text-center border-t border-red-950/15 bg-neutral-950 text-neutral-500 text-xs font-mono">
        &copy; M K A MOTORS. All Rights Reserved.
      </div>
    </div>
  );
}
