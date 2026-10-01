import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Search, Heart, LayoutDashboard, UserCheck, Shield } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentPath, navigateTo, currentUser, openAuthModal, savedPropertyIds } = useApp();

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 py-1.5 px-3 shadow-lg transition-colors"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Home */}
        <button
          onClick={() => navigateTo('/')}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-colors ${
            currentPath === '/' ? 'text-stone-900 dark:text-white font-semibold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Search */}
        <button
          onClick={() => navigateTo('/search')}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-colors ${
            currentPath.startsWith('/search') ? 'text-stone-900 dark:text-white font-semibold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Search</span>
        </button>

        {/* Saved */}
        <button
          onClick={() => {
            if (currentUser) {
              navigateTo('/dashboard');
            } else {
              openAuthModal('Sign in to view your saved properties and compare listings.');
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] relative transition-colors ${
            currentPath === '/dashboard' ? 'text-stone-900 dark:text-white font-semibold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5" />
            {savedPropertyIds.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center tabular-nums">
                {savedPropertyIds.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">Saved</span>
        </button>

        {/* Dashboard */}
        <button
          onClick={() => {
            if (currentUser) {
              navigateTo('/dashboard');
            } else {
              openAuthModal('Sign in to manage viewing schedules and property enquiries.');
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-colors ${
            currentPath === '/dashboard' ? 'text-stone-900 dark:text-white font-semibold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        {/* Admin or Profile */}
        {currentUser?.role === 'admin' ? (
          <button
            onClick={() => navigateTo('/admin')}
            className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-colors ${
              currentPath === '/admin' ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-emerald-600 dark:text-emerald-500'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (currentUser) {
                navigateTo('/dashboard');
              } else {
                openAuthModal('Sign in or register your account to continue.');
              }
            }}
            className="flex flex-col items-center justify-center py-1 px-2 min-w-[56px] text-stone-500 dark:text-stone-400 transition-colors"
          >
            <UserCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{currentUser ? 'Profile' : 'Sign In'}</span>
          </button>
        )}

      </div>
    </nav>
  );
};
