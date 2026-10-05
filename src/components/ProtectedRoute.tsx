import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types/property';
import { Building, Lock, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  title?: string;
  description?: string;
}

/**
 * Centralized UX Authentication & Role Route Guard.
 *
 * Security Note:
 * This component prevents unauthenticated flashes during initial session restoration
 * and provides a user-friendly sign-in prompt for protected pages.
 * Actual security and authorization are enforced server-side via Supabase Auth JWTs
 * and PostgreSQL Row-Level Security (RLS).
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  title = 'Sign in to your account',
  description = 'Please sign in or create a free account to access this section of Reality Estates.'
}) => {
  const { authStatus, currentUser, openAuthModal, navigateTo } = useApp();

  // 1. Loading State: Never briefly render protected content before session restoration finishes
  if (authStatus === 'loading') {
    return (
      <div className="min-h-[65vh] bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 transition-colors duration-200">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
            Verifying your session...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (authStatus !== 'authenticated' || !currentUser) {
    return (
      <div className="min-h-[70vh] bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
            {title}
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mb-8 text-sm leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => openAuthModal(description)}
              className="flex-1 py-3.5 px-5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-medium text-sm transition-colors cursor-pointer"
            >
              Sign In / Create Account
            </button>
            <button
              onClick={() => navigateTo('/search')}
              className="py-3.5 px-5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-medium text-sm transition-colors cursor-pointer"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Role Check (UX guard; PostgreSQL RLS is authoritative)
  if (requiredRole && currentUser.role !== requiredRole) {
    return (
      <div className="min-h-[70vh] bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
            Admin Operations Desk
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            Access to property verification, field inspection audits, and transaction pipelines requires an authorized Reality Estates Admin account.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigateTo('/')}
              className="px-6 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
