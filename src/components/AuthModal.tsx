import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../data/mockProperties';
import { X, ShieldCheck, Phone, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMessage, 
    loginAs, 
    registerUser 
  } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+256 7');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'agent' | 'owner'>('buyer');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup') {
      const finalName = name.trim() || 'New User';
      const finalPhone = phone.trim() || '+256 700 000 000';
      const finalEmail = email.trim() || `${finalName.toLowerCase().replace(/\s+/g, '')}@example.com`;
      registerUser(finalName, finalPhone, finalEmail, role);
    } else {
      // In sign-in mode, find matching demo user or use buyer default
      const matched = DEMO_USERS.find(u => 
        (email && u.email.toLowerCase() === email.toLowerCase()) ||
        (phone && u.phone.includes(phone.slice(-6)))
      );
      if (matched) {
        loginAs(matched);
      } else {
        registerUser(name || 'Verified User', phone, email || 'user@realityestates.ug', 'buyer');
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={closeAuthModal}
    >
      <div 
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-stone-100 dark:border-stone-800 relative animate-in zoom-in-95 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Secure Verification</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white tracking-tight">
            {authMode === 'signup' ? 'Create a Free Account' : 'Sign in to Reality Estates'}
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">
            {authModalMessage}
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex rounded-lg bg-stone-100 dark:bg-stone-800 p-1 mb-5">
          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              authMode === 'signup' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              authMode === 'signin' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Input channel switch: Phone or Email */}
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-4 px-1">
          <span>Verification method:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMethod('phone')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                method === 'phone' 
                  ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <Phone className="w-3 h-3" />
              Phone (Uganda)
            </button>
            <button
              type="button"
              onClick={() => setMethod('email')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                method === 'email' 
                  ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <Mail className="w-3 h-3" />
              Email
            </button>
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ronald Kato"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
            </div>
          )}

          {method === 'phone' ? (
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Ugandan Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="+256 772 000 000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                Instant SMS verification code will be sent.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              {authMode === 'signup' ? 'Password or 4-digit PIN' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>
          </div>

          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                I am primarily joining as:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-center font-medium transition-colors ${
                    role === 'buyer' 
                      ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  Buyer / Tenant
                </button>
                <button
                  type="button"
                  onClick={() => setRole('agent')}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-center font-medium transition-colors ${
                    role === 'agent' 
                      ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  Licensed Agent
                </button>
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-center font-medium transition-colors ${
                    role === 'owner' 
                      ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  Property Owner
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>{authMode === 'signup' ? 'Create Free Account' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
          <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mb-2 uppercase tracking-wider text-center">
            Or test instantly with pre-verified personas:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => loginAs(DEMO_USERS[0])}
              className="py-1.5 px-2 text-[11px] bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-md text-stone-700 dark:text-stone-300 text-center font-medium transition-colors"
            >
              🧑 Buyer
            </button>
            <button
              onClick={() => loginAs(DEMO_USERS[1])}
              className="py-1.5 px-2 text-[11px] bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-md text-stone-700 dark:text-stone-300 text-center font-medium transition-colors"
            >
              💼 Agent
            </button>
            <button
              onClick={() => loginAs(DEMO_USERS[2])}
              className="py-1.5 px-2 text-[11px] bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-md text-emerald-900 dark:text-emerald-300 text-center font-semibold transition-colors"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
