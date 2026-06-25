/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Gift, ClipboardCheck, Copy, Sparkles, MapPin, Users, HelpCircle, CheckCircle2 } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Offer } from '../types';

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Subscribe to real-time offers collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'offers'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
      setOffers(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error reading offers:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="flex-1 min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-red-950/10 pb-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Gift className="w-8 h-8 text-red-600" />
              <span>ACTIVE WHOLESALE PROMOTIONS</span>
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Visit our wholesale branch, mention the codes to the shop manager, and claim your spare part discounts!
            </p>
          </div>
        </div>

        {/* How to Redeem Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-neutral-900/60 border border-red-950/10 p-5 rounded-2xl">
            <div className="text-red-500 font-extrabold font-mono text-lg mb-2">STEP 01</div>
            <h4 className="text-sm font-bold text-white uppercase tracking-tight">Explore Codes</h4>
            <p className="text-neutral-400 text-xs mt-1 leading-relaxed">Browse active coupon code deals listed below.</p>
          </div>
          <div className="bg-neutral-900/60 border border-red-950/10 p-5 rounded-2xl">
            <div className="text-red-500 font-extrabold font-mono text-lg mb-2">STEP 02</div>
            <h4 className="text-sm font-bold text-white uppercase tracking-tight">Copy Code</h4>
            <p className="text-neutral-400 text-xs mt-1 leading-relaxed">Click any card to instantly copy the discount coupon.</p>
          </div>
          <div className="bg-neutral-900/60 border border-red-950/10 p-5 rounded-2xl">
            <div className="text-red-500 font-extrabold font-mono text-lg mb-2">STEP 03</div>
            <h4 className="text-sm font-bold text-white uppercase tracking-tight">Visit MKA Shop</h4>
            <p className="text-neutral-400 text-xs mt-1 leading-relaxed">Head to our premium two-wheeler spare parts outlet.</p>
          </div>
          <div className="bg-neutral-900/60 border border-red-950/10 p-5 rounded-2xl">
            <div className="text-red-500 font-extrabold font-mono text-lg mb-2">STEP 04</div>
            <h4 className="text-sm font-bold text-white uppercase tracking-tight">Claim discount</h4>
            <p className="text-neutral-400 text-xs mt-1 leading-relaxed">Tell the code to the manager for flat price cuts.</p>
          </div>
        </div>

        {/* Offers list */}
        {loading ? (
          <div className="text-center py-20 text-neutral-400 font-mono flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
            <span>Syncing active discounts...</span>
          </div>
        ) : offers.length === 0 ? (
          /* Static demo fallback offers so screen looks extremely rich right out of the box */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Fallback offer 1 */}
            <div 
              onClick={() => handleCopyCode('MKA-CLUTCH15')}
              className="glass-panel rounded-2xl p-6 border-red-600/10 hover:border-red-600/50 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-3 bg-red-600/10 border-b border-l border-red-600/20 rounded-bl-xl text-red-500 text-xs font-mono font-bold">
                15% OFF
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-950/30 flex items-center justify-center text-red-500">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-tight">CLUTCH ASSEMBLIES</h3>
              </div>
              <p className="text-neutral-400 text-xs mb-6 leading-relaxed">
                Save huge on heavy-duty clutch plate kits. Applicable on premium multi-plate clutch assemblies for Royal Enfield, Honda, and TVS.
              </p>
              
              <div className="flex justify-between items-center bg-neutral-950/60 px-4 py-3 rounded-xl border border-red-950/40 font-mono">
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">COUPON CODE</span>
                  <span className="text-red-500 font-extrabold text-sm">MKA-CLUTCH15</span>
                </div>
                {copiedCode === 'MKA-CLUTCH15' ? (
                  <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                    <ClipboardCheck className="w-4 h-4" /> Copied!
                  </span>
                ) : (
                  <Copy className="w-4 h-4 text-neutral-500 group-hover:text-red-500 transition-colors" />
                )}
              </div>
            </div>

            {/* Fallback offer 2 */}
            <div 
              onClick={() => handleCopyCode('MKA-SPARK10')}
              className="glass-panel rounded-2xl p-6 border-red-600/10 hover:border-red-600/50 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-3 bg-red-600/10 border-b border-l border-red-600/20 rounded-bl-xl text-red-500 text-xs font-mono font-bold">
                10% OFF
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-950/30 flex items-center justify-center text-red-500">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-tight">SPARK PLUGS DEAL</h3>
              </div>
              <p className="text-neutral-400 text-xs mb-6 leading-relaxed">
                Flat discount on original NGK, Bosch & Denso double-iridium high-voltage spark plugs. Keeps your combustion smooth and clean.
              </p>
              
              <div className="flex justify-between items-center bg-neutral-950/60 px-4 py-3 rounded-xl border border-red-950/40 font-mono">
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">COUPON CODE</span>
                  <span className="text-red-500 font-extrabold text-sm">MKA-SPARK10</span>
                </div>
                {copiedCode === 'MKA-SPARK10' ? (
                  <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                    <ClipboardCheck className="w-4 h-4" /> Copied!
                  </span>
                ) : (
                  <Copy className="w-4 h-4 text-neutral-500 group-hover:text-red-500 transition-colors" />
                )}
              </div>
            </div>

            {/* Fallback offer 3 */}
            <div 
              onClick={() => handleCopyCode('MKA-CHAIN500')}
              className="glass-panel rounded-2xl p-6 border-red-600/10 hover:border-red-600/50 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-3 bg-red-600/10 border-b border-l border-red-600/20 rounded-bl-xl text-red-500 text-xs font-mono font-bold">
                ₹500 OFF
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-950/30 flex items-center justify-center text-red-500">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-tight">CHAIN SPROCKETS</h3>
              </div>
              <p className="text-neutral-400 text-xs mb-6 leading-relaxed">
                Flat cash discount on complete Rolon, Diamond, or gold brass O-Ring sprocket replacements. Ultimate transmission performance.
              </p>
              
              <div className="flex justify-between items-center bg-neutral-950/60 px-4 py-3 rounded-xl border border-red-950/40 font-mono">
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">COUPON CODE</span>
                  <span className="text-red-500 font-extrabold text-sm">MKA-CHAIN500</span>
                </div>
                {copiedCode === 'MKA-CHAIN500' ? (
                  <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                    <ClipboardCheck className="w-4 h-4" /> Copied!
                  </span>
                ) : (
                  <Copy className="w-4 h-4 text-neutral-500 group-hover:text-red-500 transition-colors" />
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div 
                key={offer.id}
                onClick={() => handleCopyCode(offer.code)}
                className="glass-panel rounded-2xl p-6 border-red-600/10 hover:border-red-600/50 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group cursor-pointer flex flex-col justify-between"
                id={`offer-card-${offer.id}`}
              >
                <div>
                  <div className="absolute top-0 right-0 p-3 bg-red-600/10 border-b border-l border-red-600/20 rounded-bl-xl text-red-500 text-xs font-mono font-bold">
                    {offer.discount}% OFF
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-950/30 flex items-center justify-center text-red-500">
                      <Gift className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold uppercase tracking-tight">{offer.code}</h3>
                  </div>
                  <p className="text-neutral-400 text-xs mb-6 leading-relaxed">
                    {offer.description}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="text-[10px] text-neutral-500 font-mono uppercase block">
                    Valid Until: {new Date(offer.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex justify-between items-center bg-neutral-950/60 px-4 py-3 rounded-xl border border-red-950/40 font-mono">
                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase">COUPON CODE</span>
                      <span className="text-red-500 font-extrabold text-sm">{offer.code}</span>
                    </div>
                    {copiedCode === offer.code ? (
                      <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                        <ClipboardCheck className="w-4 h-4" /> Copied!
                      </span>
                    ) : (
                      <Copy className="w-4 h-4 text-neutral-500 group-hover:text-red-500 transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Branch Redeeming Advice */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 border-red-950/20 mt-14 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-950/20 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-white mb-2">Salem Wholesale Branch Address</h3>
              <p className="text-neutral-400 text-xs leading-relaxed max-w-2xl">
                Redeem these codes directly at our dealer counter. Let our checkout representative scan your copied coupon codes for immediate discount deductions off wholesale bulk volumes. For enquiries, call <span className="text-red-500 font-bold font-mono">9944003164</span>.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
