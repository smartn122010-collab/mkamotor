/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { ShieldCheck, ArrowRight, Loader2, Disc } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 flex items-center justify-center overflow-hidden font-sans">
      
      {/* Background logo animation container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Animated jumping logo */}
        <div className="logo-jump-animate absolute w-48 h-48 rounded-full border-4 border-red-600 bg-red-950/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.4)]">
          <div className="text-center">
            <span className="block text-4xl font-extrabold text-red-500 tracking-wider font-mono">M K A</span>
            <span className="block text-xs font-medium text-neutral-400 tracking-widest uppercase mt-1">MOTORS</span>
          </div>
        </div>
        
        {/* Subtle decorative glowing background shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-900/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neutral-900/40 blur-[120px]" />
      </div>

      {/* Main Luxury Container Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6 py-12"
      >
        <div className="glass-panel-heavy rounded-2xl px-8 py-10 shadow-[0_0_40px_rgba(220,38,38,0.15)] border-red-900/30 text-center relative overflow-hidden">
          
          {/* Subtle neon outline */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
          
          <div className="mb-8 inline-flex items-center justify-center p-3 bg-red-950/30 border border-red-500/20 rounded-full text-red-500 relative">
            <Disc className="w-12 h-12 animate-spin-slow text-red-600" />
            <div className="absolute inset-0 rounded-full border border-red-500/30 animate-pulse" />
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            M K A MOTORS
          </h1>
          <p className="text-neutral-400 text-sm tracking-wide max-w-xs mx-auto mb-10 leading-relaxed">
            Two Wheeler Spares Wholesale Dealers
            <span className="block mt-1 text-red-500 font-medium font-mono text-xs">LUXURY SPARES CATALOGUE</span>
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/30 border border-red-500/30 text-red-400 text-xs text-left flex items-start gap-2 animate-shake">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Luxury Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-red-900/40 hover:shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-75 disabled:pointer-events-none"
            id="google-login-btn"
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.899 0 11.24-4.205 11.24-11.24 0-.758-.08-1.339-.24-1.955H12.24z"/>
              </svg>
            )}
            
            <span className="tracking-wide">
              {loading ? 'Entering Showroom...' : 'Sign In with Google'}
            </span>
            
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-8 text-xs text-neutral-500 font-mono">
            Authorized Customer & Wholesale Network Access Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
