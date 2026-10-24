import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getRequiredSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { authService } from '../services/authService';
import { PasswordInput } from '../components/PasswordInput';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Home,
  Building2,
  KeyRound,
  Lock
} from 'lucide-react';

type CallbackStatus = 'loading' | 'success' | 'error' | 'recovery';

export const AuthCallbackView: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    openAuthModal,
    navigateTo,
    refreshCurrentUser,
    updatePassword,
    showToast
  } = useApp();

  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password Recovery / New Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordFormError, setPasswordFormError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const processAuthCallback = async () => {
      // 1. Check Supabase Configuration
      if (!isSupabaseConfigured()) {
        if (!isCancelled) {
          setStatus('error');
          setErrorMessage('TYGA ESTATES authentication backend is currently unreachable.');
        }
        return;
      }

      const client = getRequiredSupabaseClient();

      try {
        // Parse parameters from both window.location.search and window.location.hash
        const searchParams = new URLSearchParams(window.location.search);
        const hashString = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hashString);

        // Check for error parameters first (e.g. otp_expired, link already used)
        const error = searchParams.get('error') || hashParams.get('error');
        const errorDescription =
          searchParams.get('error_description') ||
          hashParams.get('error_description') ||
          searchParams.get('error_code') ||
          hashParams.get('error_code');

        if (error || errorDescription) {
          // Immediately sanitize URL to clear error and token parameters
          window.history.replaceState(null, '', window.location.pathname || '/');

          if (!isCancelled) {
            setStatus('error');
            const desc = (errorDescription || '').replace(/\+/g, ' ');
            if (
              desc.toLowerCase().includes('expired') ||
              desc.toLowerCase().includes('otp') ||
              desc.toLowerCase().includes('invalid')
            ) {
              setErrorMessage(
                'This confirmation link has expired or has already been used. Please sign in or request a new link.'
              );
            } else {
              setErrorMessage(
                desc || 'The confirmation link could not be verified. Please try again.'
              );
            }
          }
          return;
        }

        const type = (searchParams.get('type') || hashParams.get('type') || '').toLowerCase();
        const code = searchParams.get('code');
        const tokenHash = searchParams.get('token_hash') || hashParams.get('token_hash');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // Immediately sanitize URL to avoid exposing authorization codes or tokens
        if (code || tokenHash || accessToken) {
          window.history.replaceState(null, '', window.location.pathname || '/');
        }

        // Case A: PKCE Authorization Code (?code=...)
        if (code) {
          try {
            await authService.exchangeAuthCode(code);
            await refreshCurrentUser();
          } catch (exchangeErr) {
            // Verify if session was already picked up by Supabase client's auto-detect
            const { data: sessionData } = await client.auth.getSession();
            if (!sessionData.session?.user) {
              throw exchangeErr;
            }
            await refreshCurrentUser();
          }
        }

        // Case B: Token Hash OTP (?token_hash=...&type=...)
        else if (tokenHash) {
          const otpType = type === 'recovery' ? 'recovery' : 'email';
          await authService.verifyEmailOtp(tokenHash, otpType);
          await refreshCurrentUser();
        }

        // Case C: Implicit Flow Hash Fragment (#access_token=...&refresh_token=...)
        else if (accessToken && refreshToken) {
          const { error: sessionErr } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (sessionErr) throw sessionErr;
          await refreshCurrentUser();
        }

        // Case D: No direct parameters in URL, wait for existing session / profile resolution
        else {
          const { data: currentSessionData } = await client.auth.getSession();
          if (currentSessionData.session?.user) {
            await refreshCurrentUser();
          }
        }

        // Check if this was a password recovery callback
        if (type === 'recovery' || hashString.includes('type=recovery')) {
          if (!isCancelled) {
            setStatus('recovery');
          }
          return;
        }

        // Successful confirmation state
        if (!isCancelled) {
          setStatus('success');
        }
      } catch (err) {
        console.error('[AuthCallbackView] Callback processing failed:', err);
        if (!isCancelled) {
          // Double check if user is already authenticated
          try {
            const { data } = await client.auth.getSession();
            if (data.session?.user) {
              await refreshCurrentUser();
              setStatus('success');
              return;
            }
          } catch {
            // Ignore fallback error
          }

          setStatus('error');
          setErrorMessage(
            err instanceof Error
              ? err.message
              : 'The email confirmation link is expired, invalid, or has already been used.'
          );
        }
      }
    };

    void processAuthCallback();

    return () => {
      isCancelled = true;
    };
  }, [refreshCurrentUser]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdatingPassword) return;
    setPasswordFormError(null);

    if (newPassword.length < 6) {
      setPasswordFormError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordFormError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword(newPassword);
      showToast('Password updated successfully. You are now signed in.', 'success');
      setStatus('success');
    } catch (err) {
      setPasswordFormError(
        err instanceof Error ? err.message : 'Unable to update password. Please try again.'
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-stone-50 dark:bg-stone-950 font-sans transition-colors">
      <div className="max-w-lg w-full bg-white dark:bg-stone-900 rounded-3xl p-8 sm:p-10 border border-stone-200/80 dark:border-stone-800 shadow-xl text-center">
        {/* Brand Header */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-6 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
          <Building2 className="w-4 h-4" />
          <span>TYGA ESTATES • Account Security</span>
        </div>

        {/* STATE 1: LOADING */}
        {status === 'loading' && (
          <div className="space-y-4 py-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
              Verifying Your Email
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
              Please wait while TYGA ESTATES securely confirms your account credentials and sets up your session.
            </p>
          </div>
        )}

        {/* STATE 2: SUCCESS */}
        {status === 'success' && (
          <div className="space-y-5 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
                Email Confirmed
              </h1>
              <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 max-w-md mx-auto leading-relaxed">
                Your email has been successfully confirmed. Your TYGA ESTATES account is ready.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-left">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                {currentUser?.email ? (
                  <>
                    Account <strong>{currentUser.email}</strong> is now fully active with verified permissions.
                  </>
                ) : (
                  'You can now access saved properties, submit enquiries, and schedule property walkthroughs across Uganda.'
                )}
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              {isAuthenticated || currentUser ? (
                <>
                  <button
                    onClick={() => navigateTo('/')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue to TYGA ESTATES</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateTo('/dashboard')}
                    className="w-full sm:w-auto px-5 py-3.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Go to Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('Your email is confirmed. Sign in to access your account.')}
                    className="w-full sm:w-auto px-7 py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Log in to TYGA ESTATES</span>
                  </button>
                  <button
                    onClick={() => navigateTo('/')}
                    className="w-full sm:w-auto px-5 py-3.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Home className="w-4 h-4" />
                    <span>Browse Properties</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* STATE 3: ERROR / EXPIRED LINK */}
        {status === 'error' && (
          <div className="space-y-5 py-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div>
              <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
                Confirmation Link Invalid or Expired
              </h1>
              <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 max-w-md mx-auto leading-relaxed">
                {errorMessage ||
                  'The confirmation link is expired, invalid or has already been used.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 text-left space-y-1">
              <p className="font-semibold">Next steps:</p>
              <p className="text-[11px] leading-relaxed">
                If you already confirmed your email previously, simply sign in below. If the link expired, sign in to request a fresh confirmation email or reset your password.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={() =>
                  openAuthModal(
                    'If you already verified your account, sign in here. Otherwise, request a new confirmation link.'
                  )
                }
                className="w-full sm:w-auto px-7 py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Log in to TYGA ESTATES</span>
              </button>
              <button
                onClick={() => navigateTo('/')}
                className="w-full sm:w-auto px-5 py-3.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Homepage</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 4: PASSWORD RECOVERY / NEW PASSWORD FORM */}
        {status === 'recovery' && (
          <form onSubmit={handleUpdatePassword} className="space-y-4 py-4 text-left animate-in fade-in duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner mb-3">
                <KeyRound className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
                Set a New Password
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Your reset link was verified. Choose a secure new password for your TYGA ESTATES account.
              </p>
            </div>

            {passwordFormError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordFormError}</span>
              </div>
            )}

            <PasswordInput
              id="new-password"
              name="newPassword"
              label="New Password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              hint="Must be at least 6 characters."
            />

            <PasswordInput
              id="confirm-new-password"
              name="confirmNewPassword"
              label="Confirm New Password"
              required
              minLength={6}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="••••••••"
              error={
                confirmNewPassword && newPassword !== confirmNewPassword
                  ? 'Passwords do not match'
                  : undefined
              }
            />

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full mt-4 py-3.5 px-4 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving New Password...</span>
                </>
              ) : (
                <>
                  <span>Save Password & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
