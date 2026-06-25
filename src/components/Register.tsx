/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ClipboardList, ShoppingCart, User, MapPin, Calendar, Smartphone, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Product } from '../types';

interface RegisterProps {
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  setActivePage: (page: string) => void;
}

export default function Register({ selectedProduct, setSelectedProduct, setActivePage }: RegisterProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill user display name if logged in
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      if (user.displayName) setName(user.displayName);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError("Please choose a motorcycle spare part from the Product List first!");
      return;
    }

    if (!name || !contact || !address || !age) {
      setError("Please fill out all registered customer details.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const currentUser = auth.currentUser;
      const orderPayload = {
        customerName: name,
        customerContact: contact,
        customerAddress: address,
        customerAge: parseInt(age) || 0,
        productDetails: {
          productId: selectedProduct.id || 'manual_entry',
          productName: selectedProduct.name,
          price: selectedProduct.price,
          category: selectedProduct.category
        },
        customerUid: currentUser?.uid || 'guest_user',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // 1. Submit order details to Firestore
      await addDoc(collection(db, 'orders'), orderPayload);

      setSuccess(true);

      // 2. Format WhatsApp text
      const whatsappText = encodeURIComponent(
`*M K A MOTORS - NEW SPARE PART ORDER*
---------------------------------------
*CUSTOMER REGISTERED DETAILS*
• *Name:* ${name}
• *Contact:* ${contact}
• *Address:* ${address}
• *Age:* ${age}

*ORDER SPARE DETAILS*
• *Product:* ${selectedProduct.name}
• *Category:* ${selectedProduct.category}
• *Price:* ₹${selectedProduct.price.toLocaleString('en-IN')}

Please confirm the wholesale dispatch. Thank you!`
      );

      // Mobile number is 7305068207 as specified by the customer
      const whatsappUrl = `https://api.whatsapp.com/send?phone=919944003164&text=${whatsappText}`;

      // Open WhatsApp after a short delay
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        // Clear order state and return to website catalog
        setSelectedProduct(null);
        setActivePage('products');
      }, 1500);

    } catch (err: any) {
      console.error("Error submitting order:", err);
      setError(err.message || "Failed to log order. Please check connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2 flex items-center gap-2">
          <ClipboardList className="w-8 h-8 text-red-600" />
          <span>ORDER REGISTRATION</span>
        </h1>
        <p className="text-neutral-400 text-sm mb-10">
          Complete your registration profile to dispatch your order query directly to our manager on WhatsApp.
        </p>

        {success ? (
          <div className="glass-panel-heavy rounded-2xl p-12 text-center border-green-600/30 shadow-[0_0_50px_rgba(34,197,94,0.15)] animate-scaleUp">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Order Logged Successfully!</h2>
            <p className="text-neutral-300 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              We have secure logged your registration on MKA Motor's database. Redirecting you to WhatsApp to send the message to the Wholesale Manager...
            </p>
            <div className="mt-8 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Left (8 cols) */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
              <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-5 border-red-950/40">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-red-950/15 pb-2">
                  Customer Registration details
                </h3>

                {error && (
                  <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 text-white font-semibold text-sm transition-all"
                      id="order-name-input"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <label className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Mobile Contact (WhatsApp Number)</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 text-white font-semibold text-sm transition-all"
                      id="order-contact-input"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Address / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Salem, Tamil Nadu"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 text-white font-semibold text-sm transition-all"
                      id="order-address-input"
                    />
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                    <input
                      type="number"
                      required
                      min="16"
                      max="120"
                      placeholder="e.g. 28"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-neutral-900 border border-red-950/60 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 text-white font-semibold text-sm transition-all"
                      id="order-age-input"
                    />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting || !selectedProduct}
                className="w-full py-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:from-neutral-900 disabled:to-neutral-900 disabled:border-neutral-800 disabled:text-neutral-600 text-white font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 cursor-pointer"
                id="order-submit-btn"
              >
                <Send className="w-4 h-4 animate-pulse" />
                <span>CONFIRM & SEND ORDER VIA WHATSAPP</span>
              </button>
            </form>

            {/* Product Summary Side (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-panel rounded-2xl p-6 border-red-950/40 space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-red-950/15 pb-2 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-red-500" />
                  <span>Selected Spare Part</span>
                </h3>

                {selectedProduct ? (
                  <div className="space-y-4">
                    {/* Image */}
                    <div className="h-40 rounded-xl bg-neutral-950 overflow-hidden border border-red-950/30">
                      <img 
                        src={selectedProduct.image} 
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest font-mono">
                        {selectedProduct.category}
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5 leading-tight">
                        {selectedProduct.name}
                      </h4>
                      <p className="text-neutral-400 text-xs mt-2 line-clamp-3">
                        {selectedProduct.description}
                      </p>
                    </div>

                    {/* Price summary row */}
                    <div className="flex justify-between items-center bg-neutral-950/80 p-4 rounded-xl border border-red-950/20 font-mono">
                      <span className="text-[10px] text-neutral-500 uppercase">WHOLESALE RATE</span>
                      <span className="text-xl font-black text-white">
                        ₹{selectedProduct.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setActivePage('products');
                      }}
                      className="w-full py-2.5 rounded-xl border border-red-950/30 hover:border-red-600/50 hover:bg-red-950/10 text-neutral-400 hover:text-red-400 transition-all text-xs font-semibold"
                    >
                      Change Spare Part Selection
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-10 h-10 text-red-500/50 mx-auto mb-3" />
                    <p className="text-neutral-400 text-xs max-w-xs mx-auto leading-relaxed">
                      You have not chosen any spare part yet!
                    </p>
                    <button
                      type="button"
                      onClick={() => setActivePage('products')}
                      className="mt-4 px-4 py-2 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                    >
                      Explore Products Menu
                    </button>
                  </div>
                )}
              </div>

              {/* Notice */}
              <div className="p-4 rounded-2xl bg-neutral-950/60 border border-red-950/10 text-neutral-400 text-[11px] leading-relaxed">
                <span className="font-bold text-neutral-300 block mb-1">MKA MOTORS SECURITY PROTOCOL</span>
                Your privacy is fully protected under zero-trust guidelines. The logged order allows the admin to keep high-speed dispatch tallies, and launching WhatsApp initiates immediate direct business negotiation with verified credentials.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
