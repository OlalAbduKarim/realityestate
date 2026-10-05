import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { AuthModal } from './components/AuthModal';
import { ContactAgentModal } from './components/ContactAgentModal';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { PropertyDetailView } from './views/PropertyDetailView';
import { DashboardView } from './views/DashboardView';
import { ListPropertyView } from './views/ListPropertyView';
import { AdminView } from './views/AdminView';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    currentPath, 
    toasts, 
    dismissToast,
    contactAgentProperty,
    closeContactAgentModal
  } = useApp();

  const renderCurrentView = () => {
    if (currentPath === '/' || currentPath === '') {
      return <HomeView />;
    }
    if (currentPath === '/search') {
      return <SearchView />;
    }
    if (currentPath.startsWith('/properties/')) {
      const slug = currentPath.replace('/properties/', '');
      return <PropertyDetailView slug={slug} />;
    }
    if (currentPath === '/dashboard') {
      return (
        <ProtectedRoute
          title="Sign in to your account"
          description="Access your saved properties, manage viewing requests, and track your listings across Uganda."
        >
          <DashboardView />
        </ProtectedRoute>
      );
    }
    if (currentPath === '/list-property') {
      return (
        <ProtectedRoute
          title="Sign in to list a property"
          description="Please sign in or create an owner, agent, or developer account to publish and manage property listings."
        >
          <ListPropertyView />
        </ProtectedRoute>
      );
    }
    if (currentPath.startsWith('/edit-property/')) {
      const editId = currentPath.replace('/edit-property/', '');
      return (
        <ProtectedRoute
          title="Sign in to edit your listing"
          description="Please sign in to manage your property listing and photographs."
        >
          <ListPropertyView editPropertyId={editId} />
        </ProtectedRoute>
      );
    }
    if (currentPath === '/admin') {
      return (
        <ProtectedRoute
          requiredRole="admin"
          title="Sign in to Admin Operations Desk"
          description="Please sign in with an authorized Reality Estates Admin account to access verification and transaction pipelines."
        >
          <AdminView />
        </ProtectedRoute>
      );
    }

    // Default fallback
    return <HomeView />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 font-sans selection:bg-stone-900 dark:selection:bg-stone-100 selection:text-white dark:selection:text-stone-900 transition-colors">
      {/* Top Navigation */}
      <Navbar />

      {/* Main View Container */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Contextual Auth Modal */}
      <AuthModal />

      {/* Global Contact Agent Modal */}
      {contactAgentProperty && (
        <ContactAgentModal
          property={contactAgentProperty}
          isOpen={!!contactAgentProperty}
          onClose={closeContactAgentModal}
        />
      )}

      {/* Interactive Toast Notifications Container */}
      <div 
        aria-live="polite"
        className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-lg border text-xs font-medium backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200 transition-colors ${
              toast.type === 'success' 
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800' :
              toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-800' :
                'bg-stone-900/90 dark:bg-stone-800/90 text-white border-stone-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-emerald-400 shrink-0" />}
              <span>{toast.text}</span>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 text-stone-400 hover:text-white rounded-md transition-colors shrink-0"
              aria-label="Dismiss notification"
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
      <AppContent />
    </AppProvider>
  );
}
