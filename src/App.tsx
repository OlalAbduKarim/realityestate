/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { PropertyDetailView } from './views/PropertyDetailView';
import { DashboardView } from './views/DashboardView';
import { ListPropertyView } from './views/ListPropertyView';
import { AdminView } from './views/AdminView';
import { FinancingView } from './views/FinancingView';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentPath, toasts, dismissToast } = useApp();

  // Route dispatcher
  const renderView = () => {
    // Property Details: /properties/[slug]
    if (currentPath.startsWith('/properties/')) {
      const slug = currentPath.replace('/properties/', '');
      return <PropertyDetailView slug={slug} />;
    }

    // Search and category routes
    if (
      currentPath.startsWith('/search') ||
      currentPath === '/buy' ||
      currentPath === '/rent' ||
      currentPath === '/commercial' ||
      currentPath === '/land'
    ) {
      return <SearchView />;
    }

    // Dashboard
    if (currentPath.startsWith('/dashboard')) {
      return <DashboardView />;
    }

    // List Property Portal
    if (currentPath.startsWith('/list-property')) {
      return <ListPropertyView />;
    }

    // Admin Console
    if (currentPath.startsWith('/admin')) {
      return <AdminView />;
    }

    // Financing
    if (currentPath.startsWith('/financing')) {
      return <FinancingView />;
    }

    // Default to Homepage
    return <HomeView />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 font-sans selection:bg-stone-900 dark:selection:bg-stone-100 selection:text-white dark:selection:text-stone-900 transition-colors">
      {/* Top Navigation */}
      <Navbar />

      {/* Main View Container */}
      <main className="flex-1">
        {renderView()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Contextual Auth Modal */}
      <AuthModal />

      {/* Global Toast Notification System */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border text-xs font-medium flex items-start gap-2.5 transition-all duration-200 animate-in slide-in-from-top-2 ${
              toast.type === 'success'
                ? 'bg-stone-900 dark:bg-stone-800 text-white border-stone-800 dark:border-stone-700'
                : toast.type === 'error'
                  ? 'bg-rose-900 dark:bg-rose-950 text-white border-rose-800 dark:border-rose-900'
                  : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-stone-600 dark:text-stone-400 shrink-0 mt-0.5" />}
            
            <p className="flex-1 leading-relaxed">{toast.text}</p>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-white p-0.5 shrink-0 transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
