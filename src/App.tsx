/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Loader2, Disc } from 'lucide-react';

// Components
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Search from './components/Search';
import Products from './components/Products';
import Register from './components/Register';
import Offers from './components/Offers';
import Profile from './components/Profile';
import Admin from './components/Admin';

import { Product } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Navigation: 'home' | 'search' | 'products' | 'register' | 'offers' | 'profile' | 'admin'
  const [activePage, setActivePage] = useState<string>('home');
  
  // Global Shared States for smooth transition
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    setActivePage('home');
  };

  // Rendering loading state during auth check
  if (authChecking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center font-mono">
        <div className="relative w-16 h-16 rounded-full border border-red-600/30 flex items-center justify-center bg-red-950/20 text-red-500 mb-4">
          <Disc className="w-8 h-8 text-red-600 animate-spin-slow" />
          <div className="absolute inset-0 rounded-full border border-red-500/20 animate-pulse" />
        </div>
        <span className="text-neutral-400 text-xs tracking-widest uppercase">MKA SHOWROOM INITIALIZING...</span>
      </div>
    );
  }

  // Not authenticated -> show Luxury Login Page
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated -> render app with responsive Sidebar
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row font-sans overflow-x-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        userEmail={user.email}
      />

      {/* Main Page Area */}
      <main className="flex-1 min-h-screen flex flex-col overflow-y-auto">
        {activePage === 'home' && (
          <Home 
            setActivePage={setActivePage} 
            setSearchQuery={setSearchQuery} 
            onSelectProduct={setSelectedProduct} 
          />
        )}
        
        {activePage === 'search' && (
          <Search 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onSelectProduct={setSelectedProduct} 
            setActivePage={setActivePage} 
          />
        )}
        
        {activePage === 'products' && (
          <Products 
            onSelectProduct={setSelectedProduct} 
            setActivePage={setActivePage} 
          />
        )}
        
        {activePage === 'register' && (
          <Register 
            selectedProduct={selectedProduct} 
            setSelectedProduct={setSelectedProduct} 
            setActivePage={setActivePage} 
          />
        )}
        
        {activePage === 'offers' && (
          <Offers />
        )}
        
        {activePage === 'profile' && (
          <Profile />
        )}
        
        {activePage === 'admin' && (
          <Admin />
        )}
      </main>
    </div>
  );
}
