import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Heart,
  User as UserIcon,
  Plus,
  Search,
  Sun,
  Moon,
  ShieldCheck,
  LogOut,
  Loader2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentPath,
    navigateTo,
    authStatus,
    currentUser,
    logout,
    openAuthModal,
    savedPropertyIds,
    viewingRequests,
    enquiries,
    properties,
    resetFilters,
    theme,
    toggleTheme
  } = useApp();

  const handleNavClick = (path: string) => {
    if (path === '/search') {
      resetFilters();
    }
    navigateTo(path);
  };

  const pendingCount =
    properties.filter((p) => p.verificationStatus === 'pending').length +
    enquiries.filter((e) => e.status === 'New').length +
    viewingRequests.filter((v) => v.status === 'Pending').length;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0c0d0f]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors duration-200">
      {/* Top Portal Status & Account Bar (20% Charcoal foundation) */}
      <div className="bg-[#0f1115] text-stone-300 text-xs py-1.5 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-semibold text-white tracking-wide">TYGA ESTATES</span>
            <span className="text-amber-400 font-medium">📍 Rubaga Road, Kampala</span>
            <span className="hidden lg:inline text-stone-400">
              • Lines: <span className="text-red-400 font-mono font-medium">Airtel +256 759 705 328</span> | <span className="text-amber-400 font-mono font-medium">MTN +256 764 384 080</span>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {authStatus === 'loading' ? (
              <span className="flex items-center gap-1.5 text-stone-400">
                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                Verifying session...
              </span>
            ) : currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-stone-300">
                  Signed in as <strong className="text-white">{currentUser.name}</strong>{' '}
                  <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700 ml-1">
                    {currentUser.role}
                  </span>
                </span>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('/admin')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      currentPath === '/admin'
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Desk</span>
                    {pendingCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-500 text-stone-950 rounded-full text-[10px] font-bold">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                )}
                <button
                  onClick={() => void logout()}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('Create an account or sign in to continue.')}
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors cursor-pointer"
              >
                Sign In / Create Account
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo (20% Charcoal + 10% Golden Yellow) */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => handleNavClick('/')}
          >
            <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center text-amber-400 shadow-sm group-hover:bg-stone-900 transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-stone-950 dark:text-white leading-none">
                TYGA<span className="text-amber-500 ml-1">ESTATES</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-medium mt-1">
                Uganda Property Marketplace
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            <button
              onClick={() => handleNavClick('/')}
              className={`text-sm font-medium transition-colors cursor-pointer py-1 ${
                currentPath === '/'
                  ? 'text-stone-950 dark:text-white font-bold border-b-2 border-amber-500'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => handleNavClick('/search')}
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer py-1 ${
                currentPath.startsWith('/search')
                  ? 'text-stone-950 dark:text-white font-bold border-b-2 border-amber-500'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
              }`}
            >
              <Search className="w-4 h-4 text-amber-500" />
              Browse Properties
            </button>
            <button
              onClick={() => handleNavClick('/contact')}
              className={`text-sm font-medium transition-colors cursor-pointer py-1 ${
                currentPath === '/contact'
                  ? 'text-stone-950 dark:text-white font-bold border-b-2 border-amber-500'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
              }`}
            >
              Contact Us
            </button>
            <button
              onClick={() => handleNavClick('/list-property')}
              className={`text-sm font-medium transition-colors cursor-pointer py-1 ${
                currentPath === '/list-property'
                  ? 'text-stone-950 dark:text-white font-bold border-b-2 border-amber-500'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
              }`}
            >
              For Owners & Agents
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('/admin')}
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer py-1 ${
                  currentPath === '/admin'
                    ? 'text-amber-600 dark:text-amber-400 font-bold border-b-2 border-amber-500'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                Operations Desk
              </button>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => handleNavClick('/dashboard')}
              className="relative p-2.5 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
              title="Saved Properties & Viewings"
            >
              <Heart className="w-5 h-5" />
              {savedPropertyIds.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center rounded-full">
                  {savedPropertyIds.length}
                </span>
              )}
            </button>

            {authStatus === 'loading' ? (
              <div className="flex items-center gap-2 px-4 py-2 text-xs text-stone-400 dark:text-stone-500">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              </div>
            ) : currentUser ? (
              <button
                onClick={() => handleNavClick('/dashboard')}
                className="flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50/80 dark:bg-stone-900/80 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-stone-800 dark:text-stone-200 max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                {viewingRequests.length > 0 && (
                  <span
                    className="w-2 h-2 rounded-full bg-amber-500"
                    title={`${viewingRequests.length} active viewing requests`}
                  />
                )}
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('Create an account or sign in to continue.')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </button>
            )}

            {/* 10% Golden Yellow CTA Button */}
            <button
              onClick={() => handleNavClick('/list-property')}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>List Property</span>
            </button>
          </div>

          {/* Mobile Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
