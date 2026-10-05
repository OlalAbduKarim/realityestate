import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PublicRegistrableRole } from '../types/api';
import {
  X,
  ShieldCheck,
  Phone,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMessage,
    login,
    loginAs,
    registerUser,
    requestPasswordReset,
    demoUsers,
    isDemoMode,
    isAuthLoading,
    authError
  } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+256 7');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<PublicRegistrableRole>('buyer');
  const [localError, setLocalError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isAuthLoading) return;
    setLocalError(null);
    setInfoNotice(null);

    if (authMode === 'reset') {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        setLocalError('Please enter the email address associated with your account.');
        return;
      }
      setIsSubmitting(true);
      try {
        await requestPasswordReset(trimmedEmail);
        setInfoNotice(
          'Password reset instructions have been sent to your email. Check your inbox to set a new password.'
        );
      } catch (err) {
        if (err instanceof Error) {
          setLocalError(err.message);
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (authMode === 'signup') {
      if (!name.trim()) {
        setLocalError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setLocalError('Please enter a valid email address.');
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
        setLocalError('Please enter a valid Ugandan phone number.');
        return;
      }
      if (!password || password.length < 6) {
        setLocalError('Please enter a password of at least 6 characters.');
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await registerUser(
          name.trim(),
          phone.trim(),
          email.trim(),
          role,
          password
        );
        if (result.requiresEmailConfirmation) {
          setInfoNotice(
            'Account created! Please check your email inbox and click the confirmation link before signing in.'
          );
          setAuthMode('signin');
          setPassword('');
        }
      } catch (err) {
        if (err instanceof Error) {
          setLocalError(err.message);
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Sign In flow
    const trimmedIdentifier = method === 'phone' ? phone.trim() : email.trim();
    if (!trimmedIdentifier) {
      setLocalError(
        method === 'phone'
          ? 'Please enter your Ugandan phone number.'
          : 'Please enter your email address.'
      );
      return;
    }

    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        identifier: trimmedIdentifier,
        password,
        method
      });
    } catch (err) {
      if (err instanceof Error) {
        setLocalError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || authError;
  const buyerPersona = demoUsers.find((u) => u.role === 'buyer') || demoUsers[0];
  const agentPersona = demoUsers.find((u) => u.role === 'agent') || demoUsers[1];
  const adminPersona = demoUsers.find((u) => u.role === 'admin') || demoUsers[2];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={closeAuthModal}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-stone-100 dark:border-stone-800 relative animate-in zoom-in-95 transition-colors max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
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
            <span>{isDemoMode ? 'Demo Verification' : 'Supabase Authentication'}</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white tracking-tight">
            {authMode === 'signup'
              ? 'Create a Free Account'
              : authMode === 'reset'
              ? 'Reset Your Password'
              : 'Sign in to Reality Estates'}
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">
            {authModalMessage}
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex rounded-lg bg-stone-100 dark:bg-stone-800 p-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setLocalError(null);
              setInfoNotice(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              authMode === 'signin'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setLocalError(null);
              setInfoNotice(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              authMode === 'signup'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {infoNotice && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span>{infoNotice}</span>
          </div>
        )}

        {displayError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Input channel switch for Sign In */}
        {authMode === 'signin' && (
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-4 px-1">
            <span>Sign in method:</span>
            <div className="flex gap-2">
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
            </div>
          </div>
        )}

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
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
            </div>
          )}

          {(authMode === 'signup' || authMode === 'reset' || method === 'email') && (
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
            </div>
          )}

          {(authMode === 'signup' || (authMode === 'signin' && method === 'phone')) && (
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
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
            </div>
          )}

          {authMode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                  {authMode === 'signup' ? 'Password (min. 6 characters)' : 'Password'}
                </label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('reset');
                      setLocalError(null);
                      setInfoNotice(null);
                    }}
                    className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={authMode === 'signup' ? 6 : undefined}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
            </div>
          )}

          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                I am primarily joining as:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { value: 'buyer', label: 'Buyer / Tenant' },
                    { value: 'owner', label: 'Property Owner' },
                    { value: 'agent', label: 'Licensed Agent' },
                    { value: 'developer', label: 'Developer' }
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`py-1.5 px-2 text-xs rounded-lg border text-center font-medium transition-colors ${
                      role === option.value
                        ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isAuthLoading}
            className="w-full mt-2 py-2.5 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white disabled:opacity-50 text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>
              {isSubmitting
                ? 'Processing...'
                : authMode === 'signup'
                ? 'Create Free Account'
                : authMode === 'reset'
                ? 'Send Password Reset Link'
                : 'Sign In'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {authMode === 'reset' && (
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setLocalError(null);
                setInfoNotice(null);
              }}
              className="w-full py-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium text-center"
            >
              Back to Sign In
            </button>
          )}
        </form>

        {/* 1-Click Demo Profiles (Strictly isolated to offline Demo Mode when Supabase is not configured) */}
        {isDemoMode && demoUsers.length > 0 && (
          <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
            <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mb-2 uppercase tracking-wider text-center">
              Offline Demo Mode — Test with pre-seeded personas:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {buyerPersona && (
                <button
                  type="button"
                  onClick={() => void loginAs(buyerPersona)}
                  className="py-1.5 px-2 text-[11px] bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-md text-stone-700 dark:text-stone-300 text-center font-medium transition-colors"
                >
                  Buyer
                </button>
              )}
              {agentPersona && (
                <button
                  type="button"
                  onClick={() => void loginAs(agentPersona)}
                  className="py-1.5 px-2 text-[11px] bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-md text-stone-700 dark:text-stone-300 text-center font-medium transition-colors"
                >
                  Agent
                </button>
              )}
              {adminPersona && (
                <button
                  type="button"
                  onClick={() => void loginAs(adminPersona)}
                  className="py-1.5 px-2 text-[11px] bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-md text-emerald-900 dark:text-emerald-300 text-center font-semibold transition-colors"
                >
                  Admin
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
