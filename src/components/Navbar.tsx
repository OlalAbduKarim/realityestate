import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../data/mockProperties';
import { 
  Building2, 
  LogOut, 
  ShieldCheck, 
  PlusCircle, 
  Menu, 
  X, 
  ChevronDown,
  LayoutDashboard,
  Heart,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    loginAs, 
    logout, 
    openAuthModal, 
    navigateTo, 
    currentPath, 
    savedPropertyIds,
    setFilters,
    theme,
    toggleTheme
  } = useApp();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (path: string, filterChange?: Record<string, any>) => {
    if (filterChange) {
      setFilters(filterChange);
    }
    navigateTo(path);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleNavClick('/')}
              className="group text-left focus-visible:outline-stone-900 dark:focus-visible:outline-stone-100"
            >
              <span className="text-2xl font-serif font-bold tracking-tight text-stone-900 dark:text-white group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
                Reality Estates
              </span>
            </button>
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600 dark:text-stone-300">
            <button 
              onClick={() => handleNavClick('/search', { transaction: 'buy' })}
              className={`hover:text-stone-900 dark:hover:text-white transition-colors py-1 relative ${
                currentPath === '/search' ? 'text-stone-900 dark:text-white font-semibold' : ''
              }`}
            >
              Buy
            </button>
            <button 
              onClick={() => handleNavClick('/search', { transaction: 'rent' })}
              className="hover:text-stone-900 dark:hover:text-white transition-colors py-1"
            >
              Rent
            </button>
            <button 
              onClick={() => handleNavClick('/search', { propertyType: 'Commercial' })}
              className="hover:text-stone-900 dark:hover:text-white transition-colors py-1"
            >
              Commercial
            </button>
            <button 
              onClick={() => handleNavClick('/search', { propertyType: 'Land' })}
              className="hover:text-stone-900 dark:hover:text-white transition-colors py-1"
            >
              Land
            </button>
          </nav>

          {/* Zone 3: Primary actions + theme toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700" />
              )}
            </button>

            {/* List Property CTA */}
            <button
              onClick={() => handleNavClick('/list-property')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 text-stone-700 dark:text-stone-300" />
              <span>List Property</span>
            </button>

            {/* Saved properties count shortcut */}
            <button
              onClick={() => handleNavClick('/dashboard')}
              title={`Saved Properties (${savedPropertyIds.length})`}
              className="flex items-center gap-1.5 p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${savedPropertyIds.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 tabular-nums">
                {savedPropertyIds.length}
              </span>
            </button>

            {/* Auth / Account State */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-medium text-stone-800 dark:text-stone-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center text-[11px] font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[110px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-100 dark:border-stone-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-700">
                      <p className="text-xs font-semibold text-stone-900 dark:text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                        {currentUser.role}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNavClick('/dashboard')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 text-left"
                    >
                      <LayoutDashboard className="w-4 h-4 text-stone-400" />
                      Client Dashboard
                    </button>

                    <button
                      onClick={() => handleNavClick('/list-property')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 text-left"
                    >
                      <Building2 className="w-4 h-4 text-stone-400" />
                      Supplier & Agent Portal
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => handleNavClick('/admin')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Admin Verification & CRM
                      </button>
                    )}

                    <div className="border-t border-stone-100 dark:border-stone-700 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('Sign in to access your saved properties, viewings, and direct agent contacts.')}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('Create a free account to contact property representatives and schedule viewings.')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap shadow-xs"
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Quick Demo Role Switcher for rapid evaluator testing */}
            <div className="hidden xl:flex items-center gap-1 pl-2 border-l border-stone-200 dark:border-stone-700">
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wider">Demo:</span>
              <button
                onClick={() => loginAs(DEMO_USERS[0])}
                className="px-2 py-1 text-[11px] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
                title="Switch to Buyer Persona"
              >
                Buyer
              </button>
              <button
                onClick={() => loginAs(DEMO_USERS[1])}
                className="px-2 py-1 text-[11px] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
                title="Switch to Agent Persona"
              >
                Agent
              </button>
              <button
                onClick={() => loginAs(DEMO_USERS[2])}
                className="px-2 py-1 text-[11px] text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded font-medium transition-colors"
                title="Switch to Admin Persona"
              >
                Admin
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile drop-down drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
            <button
              onClick={() => handleNavClick('/search', { transaction: 'buy' })}
              className="py-2.5 px-3 text-sm font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 rounded-lg text-left"
            >
              Buy Properties
            </button>
            <button
              onClick={() => handleNavClick('/search', { transaction: 'rent' })}
              className="py-2.5 px-3 text-sm font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 rounded-lg text-left"
            >
              Rent Properties
            </button>
            <button
              onClick={() => handleNavClick('/search', { propertyType: 'Commercial' })}
              className="py-2.5 px-3 text-sm font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 rounded-lg text-left"
            >
              Commercial
            </button>
            <button
              onClick={() => handleNavClick('/search', { propertyType: 'Land' })}
              className="py-2.5 px-3 text-sm font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 rounded-lg text-left"
            >
              Land & Plots
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('/list-property')}
              className="w-full text-left py-2 text-sm text-stone-700 dark:text-stone-300 font-medium"
            >
              List a Property
            </button>
            {currentUser && (
              <button
                onClick={() => handleNavClick('/dashboard')}
                className="w-full text-left py-2 text-sm text-stone-700 dark:text-stone-300 font-medium"
              >
                My Dashboard
              </button>
            )}
            <button
              onClick={() => handleNavClick('/admin')}
              className="w-full text-left py-2 text-sm text-emerald-700 dark:text-emerald-400 font-medium"
            >
              Admin & Verification Console
            </button>
          </div>

          {/* Dark mode switch in mobile menu */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs text-stone-600 dark:text-stone-400">Appearance Mode</span>
            <button
              onClick={toggleTheme}
              className="py-1 px-3 bg-stone-100 dark:bg-stone-800 rounded-md text-xs font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1.5"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          {/* Quick Demo Switcher on mobile */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium mb-1.5 uppercase tracking-wider">Quick Demo Switcher:</p>
            <div className="flex gap-2">
              <button
                onClick={() => { loginAs(DEMO_USERS[0]); setIsMobileMenuOpen(false); }}
                className="flex-1 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 rounded text-stone-800 dark:text-stone-200 font-medium"
              >
                Buyer
              </button>
              <button
                onClick={() => { loginAs(DEMO_USERS[1]); setIsMobileMenuOpen(false); }}
                className="flex-1 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 rounded text-stone-800 dark:text-stone-200 font-medium"
              >
                Agent
              </button>
              <button
                onClick={() => { loginAs(DEMO_USERS[2]); setIsMobileMenuOpen(false); }}
                className="flex-1 py-1.5 text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 rounded font-medium"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
