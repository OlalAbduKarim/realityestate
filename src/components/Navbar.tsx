import React, { useState } from 'react';
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
  ChevronDown,
  LogOut,
  Loader2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentPath,
    navigateTo,
    authStatus,
    isDemoMode,
    currentUser,
    demoUsers,
    loginAs,
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

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors duration-200">
      {/* Top Status & Operations Bar (Clearly separates Production Supabase Auth vs. Demo Mode) */}
      <div className="bg-stone-900 text-stone-300 text-xs py-1.5 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {isDemoMode ? (
            <>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-medium text-white">Interactive Demo Mode:</span>
                <span className="hidden sm:inline text-stone-400">
                  Supabase env vars not set — switch demo personas to test Buyer, Agent, Landlord, or Admin workflows.
                </span>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <div className="relative">
                  <button
                    onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-white font-medium border border-stone-700 transition-colors"
                  >
                    <span>
                      Demo Role: {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Guest Visitor'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </button>

                  {isRoleMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 py-1.5 z-50 text-stone-800 dark:text-stone-200">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Switch Active Demo Persona
                      </div>
                      {demoUsers.map((demoUser) => (
                        <button
                          key={demoUser.id}
                          onClick={() => {
                            void loginAs(demoUser);
                            setIsRoleMenuOpen(false);
                            if (demoUser.role === 'admin') {
                              handleNavClick('/admin');
                            }
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-stone-100 dark:hover:bg-stone-800 ${
                            currentUser?.id === demoUser.id
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-semibold'
                              : ''
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{demoUser.name}</div>
                            <div className="text-[11px] text-stone-500 capitalize">
                              {demoUser.role} Account (Demo)
                            </div>
                          </div>
                          {currentUser?.id === demoUser.id && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px]">
                              Active
                            </span>
                          )}
                        </button>
                      ))}
                      {currentUser && (
                        <div className="border-t border-stone-100 dark:border-stone-800 mt-1 pt-1">
                          <button
                            onClick={() => {
                              void logout();
                              setIsRoleMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 font-medium"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Browse as Guest (Sign Out)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    const adminDemo = demoUsers.find((u) => u.role === 'admin');
                    if ((!currentUser || currentUser.role !== 'admin') && adminDemo) {
                      void loginAs(adminDemo);
                    }
                    handleNavClick('/admin');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    currentPath === '/admin'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60'
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
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-medium text-white">Verified Uganda Property Portal</span>
                <span className="hidden sm:inline text-stone-400">
                  • Physical title & ground inspection standards across Greater Kampala & Regional Uganda
                </span>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                {authStatus === 'loading' ? (
                  <span className="flex items-center gap-1.5 text-stone-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Restoring session...
                  </span>
                ) : currentUser ? (
                  <div className="flex items-center gap-3">
                    <span className="text-stone-300">
                      Signed in as <strong className="text-white">{currentUser.name}</strong>{' '}
                      <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-emerald-400 border border-stone-700 ml-1">
                        {currentUser.role}
                      </span>
                      {isDemoMode && (
                        <span className="ml-1 text-amber-400 text-[10px]">(Demo)</span>
                      )}
                    </span>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => handleNavClick('/admin')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                          currentPath === '/admin'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60'
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
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openAuthModal()}
                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    Sign In / Register
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => handleNavClick('/')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-900 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-800 transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xl tracking-tight text-stone-900 dark:text-white leading-none">
                Reality<span className="text-emerald-800 dark:text-emerald-400">Estates</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-medium mt-1">
                Uganda Property Portal
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavClick('/')}
              className={`text-sm font-medium transition-colors ${
                currentPath === '/'
                  ? 'text-emerald-900 dark:text-emerald-400'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => handleNavClick('/search')}
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentPath.startsWith('/search')
                  ? 'text-emerald-900 dark:text-emerald-400'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              Browse Properties
            </button>
            <button
              onClick={() => handleNavClick('/list-property')}
              className={`text-sm font-medium transition-colors ${
                currentPath === '/list-property'
                  ? 'text-emerald-900 dark:text-emerald-400'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              For Owners & Agents
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('/admin')}
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  currentPath === '/admin'
                    ? 'text-emerald-900 dark:text-emerald-400'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                Operations Desk
              </button>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => handleNavClick('/dashboard')}
              className="relative p-2.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
              title="Saved Properties & Viewings"
            >
              <Heart className="w-5 h-5" />
              {savedPropertyIds.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {savedPropertyIds.length}
                </span>
              )}
            </button>

            {authStatus === 'loading' ? (
              <div className="flex items-center gap-2 px-4 py-2 text-xs text-stone-400 dark:text-stone-500">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : currentUser ? (
              <button
                onClick={() => handleNavClick('/dashboard')}
                className="flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50/50 dark:bg-stone-900/50 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-300 flex items-center justify-center font-semibold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-200 max-w-[100px] truncate">
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
                onClick={() => openAuthModal()}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </button>
            )}

            <button
              onClick={() => handleNavClick('/list-property')}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-medium rounded-full shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              List Property
            </button>
          </div>

          {/* Mobile Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
