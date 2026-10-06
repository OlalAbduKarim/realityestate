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
  CheckCircle2,
  Loader2,
  KeyRound
} from 'lucide-react';

const PUBLIC_REGISTRATION_ROLES: Array<{
  role: PublicRegistrableRole;
  label: string;
}> = [
  { role: 'buyer', label: 'Buyer / Tenant' },
  { role: 'agent', label: 'Broker / Agent' },
  { role: 'owner', label: 'Landlord / Owner' },
  { role: 'developer', label: 'Developer' }
];

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMessage,
    login,
    registerUser,
    requestPasswordReset
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<PublicRegistrableRole>('buyer');
  const [formError, setFormError] = useState<string | null>(null);
  const [infoBanner, setInfoBanner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const resetFormMessages = () => {
    setFormError(null);
    setInfoBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    resetFormMessages();
    setIsSubmitting(true);

    try {
      if (mode === 'reset') {
        await requestPasswordReset(email.trim());
        setInfoBanner(
          `Password reset link sent to ${email.trim()}. Please check your inbox.`
        );
        return;
      }

      if (mode === 'login') {
        await login({
          identifier: email.trim(),
          password,
          method: 'email'
        });
        closeAuthModal();
      } else {
        const session = await registerUser(
          name.trim(),
          phone.trim(),
          email.trim(),
          role,
          password
        );

        if (session.requiresEmailConfirmation) {
          setInfoBanner(
            `We sent a confirmation link to ${email.trim()}. Please verify your email address, then sign in below.`
          );
          setMode('login');
          setPassword('');
          return;
        }

        closeAuthModal();
      }
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please check your credentials and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/60 dark:bg-stone-950/60">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Reality Estates Account</span>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contextual Prompt Banner */}
        {authModalMessage && (
          <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs font-medium leading-relaxed">
            {authModalMessage}
          </div>
        )}

        {/* Email Confirmation / Password Reset Info Banner */}
        {infoBanner && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoBanner}</span>
          </div>
        )}

        {/* Error Banner */}
        {formError && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
              {mode === 'login'
                ? 'Welcome back'
                : mode === 'signup'
                ? 'Create your account'
                : 'Reset your password'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {mode === 'login'
                ? 'Sign in to access saved properties, enquiries, and viewing requests.'
                : mode === 'signup'
                ? 'Join Uganda’s verified property marketplace.'
                : 'Enter your registered email address and we will send you a password reset link.'}
            </p>
          </div>

          {/* Mode Tabs */}
          {mode !== 'reset' && (
            <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  resetFormMessages();
                }}
                className={`py-2 rounded-md transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  resetFormMessages();
                }}
                className={`py-2 rounded-md transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Sign Up Extra Fields */}
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Grace Nakato"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Ugandan Mobile Number (WhatsApp & Calls)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+256 772 123 456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  I am joining as a:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PUBLIC_REGISTRATION_ROLES.map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setRole(item.role)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        role === item.role
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Password Input */}
          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      resetFormMessages();
                    }}
                    className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              {mode === 'signup' && (
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                  Must be at least 6 characters.
                </p>
              )}
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-lg bg-emerald-900 hover:bg-emerald-800 disabled:opacity-60 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {mode === 'login'
                    ? 'Signing In...'
                    : mode === 'signup'
                    ? 'Creating Account...'
                    : 'Sending Reset Link...'}
                </span>
              </>
            ) : (
              <>
                {mode === 'reset' && <KeyRound className="w-4 h-4" />}
                <span>
                  {mode === 'login'
                    ? 'Sign In'
                    : mode === 'signup'
                    ? 'Create Account'
                    : 'Send Password Reset Email'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                resetFormMessages();
              }}
              className="w-full py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
