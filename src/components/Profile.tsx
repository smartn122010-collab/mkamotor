/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, LogOut, CheckCircle2, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Profile() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || 'no-email@google.com');
      setDisplayName(user.displayName || 'MKA Customer');
      
      // Attempt to load custom avatar from local storage or Firestore
      const savedAvatar = localStorage.getItem(`mka_avatar_${user.uid}`);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      } else if (user.photoURL) {
        setAvatar(user.photoURL);
      }
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        
        const user = auth.currentUser;
        if (user) {
          // Persist in localStorage for instant access
          localStorage.setItem(`mka_avatar_${user.uid}`, base64String);
          
          // Also save in Firestore if possible
          setSaving(true);
          setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName,
            avatarUrl: base64String,
            updatedAt: new Date().toISOString()
          }, { merge: true })
          .then(() => {
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 2500);
          })
          .catch((err) => console.error("Error saving user doc:", err))
          .finally(() => setSaving(false));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-neutral-950 text-white p-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-md">
        
        <div className="glass-panel-heavy rounded-2xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)] border-red-950/40 relative text-center">
          {/* Subtle neon outline */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />

          <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-8">
            CUSTOMER PROFILE
          </h1>

          {/* Profile Picture Upload Container */}
          <div className="relative inline-block mb-6 group">
            <div className="w-32 h-32 rounded-full border-4 border-red-600 bg-neutral-900 overflow-hidden flex items-center justify-center relative shadow-[0_0_30px_rgba(220,38,38,0.3)]">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-16 h-16 text-neutral-600" />
              )}
            </div>

            {/* Upload Badge overlay */}
            <label 
              htmlFor="avatar-upload" 
              className="absolute bottom-1 right-1 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-all flex items-center justify-center border border-neutral-950"
              id="upload-avatar-label"
            >
              <Camera className="w-4 h-4" />
              <input 
                id="avatar-upload"
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs text-neutral-400 mb-6 font-mono">
            Click the camera icon to upload a custom picture from your gallery
          </p>

          {/* Success / Saving indicator */}
          {saving && (
            <div className="mb-4 text-xs text-red-400 font-mono animate-pulse">
              Uploading picture to cloud inventory...
            </div>
          )}
          {savedSuccess && (
            <div className="mb-4 text-xs text-green-500 font-mono flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Profile picture saved successfully!
            </div>
          )}

          {/* Profile Details Container */}
          <div className="bg-neutral-900/60 rounded-xl p-5 border border-red-950/20 text-left space-y-4 mb-8">
            <div>
              <span className="text-[10px] text-neutral-500 font-mono uppercase block">CUSTOMER NAME</span>
              <span className="text-base font-bold text-white block mt-0.5">{displayName}</span>
            </div>

            <div className="border-t border-red-950/10 pt-3 flex items-start gap-3">
              <Mail className="w-4 h-4 text-red-500 shrink-0 mt-1" />
              <div>
                <span className="text-[10px] text-neutral-500 font-mono uppercase block">REGISTERED EMAIL</span>
                <span className="text-sm font-semibold text-neutral-300 block mt-0.5 truncate font-mono">{email}</span>
              </div>
            </div>

            <div className="border-t border-red-950/10 pt-3 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-1" />
              <div>
                <span className="text-[10px] text-neutral-500 font-mono uppercase block">ACCOUNT AUTHENTICATION</span>
                <span className="text-xs text-green-500 font-bold block mt-0.5">Google Verified Profile</span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-neutral-900 hover:bg-red-950/20 border border-red-950/30 hover:border-red-600 hover:text-red-400 text-neutral-400 rounded-xl font-bold transition-all duration-300 text-sm flex items-center justify-center gap-2 cursor-pointer"
            id="profile-logout-btn"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out from Showroom</span>
          </button>

          <p className="mt-6 text-[10px] text-neutral-600 font-mono">
            MKA Motors Distributor Portal Client Version 1.2
          </p>
        </div>

      </div>
    </div>
  );
}
