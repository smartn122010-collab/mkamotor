/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Home, 
  Search, 
  Briefcase, 
  ClipboardList, 
  Gift, 
  User, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X,
  Disc
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userEmail: string | null;
}

export default function Sidebar({ 
  activePage, 
  setActivePage, 
  isOpen, 
  setIsOpen,
  userEmail 
}: SidebarProps) {
  
  const menuItems = [
    { id: 'home', label: 'Home Page', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'products', label: 'Product List', icon: Briefcase },
    { id: 'register', label: 'Register Details', icon: ClipboardList },
    { id: 'offers', label: 'Offers', icon: Gift },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'admin', label: 'Admin Panel', icon: ShieldAlert }
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const selectPage = (pageId: string) => {
    setActivePage(pageId);
    setIsOpen(false); // Auto close sidebar on mobile
  };

  return (
    <>
      {/* Mobile top navigation bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-red-950/40 relative z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center">
            <span className="text-red-500 font-bold font-mono text-xs">MKA</span>
          </div>
          <span className="text-white font-bold text-sm tracking-widest font-mono">M K A MOTORS</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:text-red-500 transition-colors p-1"
          aria-label="Toggle menu"
          id="menu-toggle-btn"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-25 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-30 w-72 md:w-64 transform transition-transform duration-300 ease-out
        md:translate-x-0 md:static md:h-screen flex flex-col bg-neutral-950 border-r border-red-950/35
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand header */}
        <div className="hidden md:flex items-center gap-3 px-6 py-8 border-b border-red-950/15">
          <div className="relative w-10 h-10 rounded-full border border-red-600/30 flex items-center justify-center bg-red-950/20 text-red-500">
            <Disc className="w-6 h-6 text-red-600 animate-spin-slow" />
            <div className="absolute inset-0 rounded-full border border-red-500/20 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-widest font-mono">MKA</h2>
            <p className="text-red-500 text-[10px] tracking-widest font-bold uppercase">MOTORS</p>
          </div>
        </div>

        {/* Sidebar Title (Mobile close button) */}
        <div className="md:hidden flex items-center justify-between px-6 py-6 border-b border-red-950/15">
          <span className="text-white font-extrabold font-mono tracking-widest">NAVIGATION</span>
          <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-red-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => selectPage(item.id)}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-300
                  ${isActive 
                    ? 'bg-red-950/40 text-red-400 border-l-4 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.15)] font-semibold' 
                    : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-white border-l-4 border-transparent'
                  }
                `}
                id={`sidebar-link-${item.id}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-red-500' : 'text-neutral-400 group-hover:text-white'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logged in User info & Logout */}
        <div className="p-4 border-t border-red-950/15 bg-neutral-950/80">
          {userEmail && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-950/10 border border-red-950/20 text-center">
              <span className="block text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-0.5">SIGNED IN AS</span>
              <span className="block text-xs text-neutral-300 font-medium truncate font-mono">{userEmail}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-900/30 hover:bg-red-950/20 text-neutral-400 hover:text-red-400 transition-all duration-300 text-sm font-semibold cursor-pointer"
            id="sidebar-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
