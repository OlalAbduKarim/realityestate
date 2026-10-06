import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import {
  AuthSessionResponse,
  IAuthService,
  LoginInput,
  ProfileRow,
  PublicRegistrableRole,
  RegisterInput,
  ServiceError
} from '../types/api';
import { User, UserRole } from '../types/property';
import { apiClient } from '../lib/apiClient';
import {
  getRequiredSupabaseClient,
  isSupabaseConfigured
} from '../lib/supabase';

const ALLOWED_PUBLIC_ROLES: ReadonlyArray<PublicRegistrableRole> = [
  'buyer',
  'owner',
  'agent',
  'developer'
];

const ALL_VALID_ROLES: ReadonlyArray<UserRole> = [
  'buyer',
  'owner',
  'agent',
  'developer',
  'admin'
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalizes a Ugandan phone number (`07...`, `2567...`, `+2567...`) into `+256 7XX XXX XXX`
 * and validates its length.
 */
export function normalizeUgandaPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('256') && digits.length === 12) {
    const local = digits.slice(3);
    return `+256 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    const local = digits.slice(1);
    return `+256 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  if (digits.length === 9 && digits.startsWith('7')) {
    return `+256 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return rawPhone.trim();
}

export function isValidUgandaPhone(rawPhone: string): boolean {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('256') && digits.length === 12) return true;
  if (digits.startsWith('0') && digits.length === 10) return true;
  if (digits.startsWith('7') && digits.length === 9) return true;
  return digits.length >= 9 && digits.length <= 15;
}

/**
 * Enforces that a self-selected registration role can NEVER be 'admin'.
 */
function sanitizePublicRole(role?: string | null): PublicRegistrableRole {
  const normalized = (role || 'buyer').toLowerCase().trim();
  if (normalized === 'admin') {
    throw new ServiceError(
      'Public registration cannot create an Admin account. Please choose Buyer, Owner, Agent, or Developer.',
      'FORBIDDEN',
      403,
      { role: 'Admin accounts cannot be self-registered.' }
    );
  }
  if ((ALLOWED_PUBLIC_ROLES as ReadonlyArray<string>).includes(normalized)) {
    return normalized as PublicRegistrableRole;
  }
  return 'buyer';
}

/**
 * Resolves a role from the database `profiles` row (`role` column).
 * Note: Client-side role values are used strictly for UI rendering decisions;
 * actual authorization is enforced by PostgreSQL Row-Level Security (RLS).
 */
function parseDatabaseRole(rawRole?: string | null): UserRole {
  const normalized = (rawRole || 'buyer').toLowerCase().trim();
  if ((ALL_VALID_ROLES as ReadonlyArray<string>).includes(normalized)) {
    return normalized as UserRole;
  }
  return 'buyer';
}

/**
 * Maps raw Supabase Auth / network errors into consistent, user-friendly `ServiceError` instances
 * without exposing internal PostgreSQL or stack trace details.
 */
function mapSupabaseAuthError(err: unknown, fallbackMessage: string): ServiceError {
  if (err instanceof ServiceError) {
    return err;
  }

  const rawMessage =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message?: unknown }).message || '')
      : err instanceof Error
      ? err.message
      : '';
  const lower = rawMessage.toLowerCase();

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed')
  ) {
    return new ServiceError(
      'Reality Estates could not connect to the server. Please check your internet connection and try again.',
      'NETWORK_ERROR',
      503
    );
  }

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('invalid email or password') ||
    lower.includes('user not found')
  ) {
    return new ServiceError(
      'Invalid email address or password. Please check your credentials and try again.',
      'UNAUTHORIZED',
      401
    );
  }

  if (
    lower.includes('email not confirmed') ||
    lower.includes('confirm your email')
  ) {
    return new ServiceError(
      'Your email address has not been confirmed yet. Please check your inbox for the verification link before signing in.',
      'EMAIL_NOT_CONFIRMED',
      403
    );
  }

  if (
    lower.includes('user already registered') ||
    lower.includes('already been registered') ||
    lower.includes('already exists') ||
    lower.includes('duplicate key')
  ) {
    return new ServiceError(
      'An account with this email address is already registered. Please sign in instead.',
      'CONFLICT',
      409,
      { email: 'Email is already registered.' }
    );
  }

  if (
    lower.includes('password should be at least') ||
    lower.includes('weak_password') ||
    lower.includes('password is too weak') ||
    lower.includes('characters')
  ) {
    return new ServiceError(
      'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.',
      'WEAK_PASSWORD',
      400,
      { password: 'Password must be at least 6 characters.' }
    );
  }

  if (
    lower.includes('invalid email') ||
    lower.includes('unable to validate email')
  ) {
    return new ServiceError(
      'Please enter a valid email address.',
      'VALIDATION_ERROR',
      400,
      { email: 'Invalid email format.' }
    );
  }

  if (
    lower.includes('jwt expired') ||
    lower.includes('session_not_found') ||
    lower.includes('refresh_token_not_found') ||
    lower.includes('invalid refresh token')
  ) {
    return new ServiceError(
      'Your session has expired. Please sign in again to continue.',
      'SESSION_EXPIRED',
      401
    );
  }

  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return new ServiceError(
      'Too many authentication attempts. Please wait a moment before trying again.',
      'VALIDATION_ERROR',
      429
    );
  }

  return new ServiceError(fallbackMessage, 'UNKNOWN_ERROR', 500);
}

/**
 * Maps a Supabase Auth User + optional `public.profiles` row into the frontend `User` model.
 */
function mapProfileAndAuthToUser(
  authUser: SupabaseAuthUser,
  profile?: ProfileRow | null
): User {
  const metadata = (authUser.user_metadata || {}) as Record<string, unknown>;

  const resolvedName =
    profile?.name ||
    profile?.full_name ||
    (typeof metadata.name === 'string' ? metadata.name : '') ||
    (typeof metadata.full_name === 'string' ? metadata.full_name : '') ||
    (authUser.email ? authUser.email.split('@')[0] : 'Reality Estates User');

  const resolvedEmail = profile?.email || authUser.email || '';

  const resolvedPhone =
    profile?.phone ||
    profile?.phone_number ||
    (typeof metadata.phone === 'string' ? metadata.phone : '') ||
    authUser.phone ||
    '';

  // Authoritative role comes from `public.profiles.role` when available.
  // If `profiles` row has not yet been read, fall back to sanitized non-admin metadata role.
  const resolvedRole: UserRole = profile?.role
    ? parseDatabaseRole(profile.role)
    : sanitizePublicRole(
        typeof metadata.role === 'string' ? metadata.role : 'buyer'
      );

  const resolvedCompany =
    profile?.company ||
    profile?.agency_name ||
    (typeof metadata.company === 'string' ? metadata.company : undefined);

  const resolvedAvatar =
    profile?.avatar_url ||
    profile?.avatar ||
    (typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined);

  const resolvedVerified = Boolean(
    profile?.verified_identity ??
      profile?.is_verified ??
      Boolean(authUser.email_confirmed_at)
  );

  return {
    id: authUser.id,
    name: resolvedName.trim(),
    email: resolvedEmail.trim(),
    phone: resolvedPhone.trim(),
    role: resolvedRole,
    company: resolvedCompany,
    avatar: resolvedAvatar,
    verifiedIdentity: resolvedVerified
  };
}

class AuthService implements IAuthService {
  constructor() {
    apiClient.setAuthTokenProvider(async () => {
      if (!isSupabaseConfigured()) return null;
      try {
        const client = getRequiredSupabaseClient();
        const { data } = await client.auth.getSession();
        return data.session?.access_token ?? null;
      } catch {
        return null;
      }
    });
  }

  public isSupabaseAuthEnabled(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Queries `public.profiles` for `id = authUser.id`.
   * If the database trigger (`on_auth_user_created`) already created the row,
   * updates any missing fields (`name`, `phone`, `role`, `company`) without creating duplicates.
   * If no row exists yet, inserts the profile row linked to `auth.users.id`.
   */
  private async syncProfileForAuthUser(
    authUser: SupabaseAuthUser,
    overrides?: {
      name?: string;
      phone?: string;
      email?: string;
      role?: PublicRegistrableRole;
      company?: string;
    }
  ): Promise<User> {
    const client = getRequiredSupabaseClient();
    const metadata = (authUser.user_metadata || {}) as Record<string, unknown>;

    const desiredName = (
      overrides?.name ||
      (typeof metadata.name === 'string' ? metadata.name : '') ||
      (typeof metadata.full_name === 'string' ? metadata.full_name : '') ||
      (authUser.email ? authUser.email.split('@')[0] : 'User')
    ).trim();

    const desiredEmail = (overrides?.email || authUser.email || '').trim();
    const desiredPhone = normalizeUgandaPhone(
      overrides?.phone ||
        (typeof metadata.phone === 'string' ? metadata.phone : '') ||
        authUser.phone ||
        ''
    );
    const desiredRole = sanitizePublicRole(
      overrides?.role ||
        (typeof metadata.role === 'string' ? metadata.role : 'buyer')
    );
    const desiredCompany =
      overrides?.company ||
      (typeof metadata.company === 'string' ? metadata.company : undefined);

    try {
      const { data: existingProfile, error: selectError } = await client
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!selectError && existingProfile) {
        const currentRow = existingProfile as ProfileRow;
        const currentName = currentRow.name || '';
        const currentPhone = currentRow.phone || '';
        const currentEmail = currentRow.email || '';

        const needsMetadataBackfill =
          (Boolean(overrides?.name) && currentName !== desiredName) ||
          (Boolean(overrides?.phone) && currentPhone !== desiredPhone) ||
          (!currentPhone && Boolean(desiredPhone)) ||
          (!currentEmail && Boolean(desiredEmail));

        if (needsMetadataBackfill) {
          const updatePayload: Record<string, unknown> = {};
          if (desiredName && (!currentName || overrides?.name)) {
            updatePayload.name = desiredName;
          }
          if (desiredPhone && (!currentPhone || overrides?.phone)) {
            updatePayload.phone = desiredPhone;
          }
          if (desiredEmail && !currentEmail) {
            updatePayload.email = desiredEmail;
          }
          if (desiredCompany && !currentRow.company) {
            updatePayload.company = desiredCompany;
          }
          if (
            overrides?.role &&
            currentRow.role !== 'admin' &&
            currentRow.role !== desiredRole
          ) {
            updatePayload.role = desiredRole;
          }

          if (Object.keys(updatePayload).length > 0) {
            const { data: updatedRow, error: updateErr } = await client
              .from('profiles')
              .update(updatePayload)
              .eq('id', authUser.id)
              .select('*')
              .maybeSingle();

            if (!updateErr && updatedRow) {
              return mapProfileAndAuthToUser(authUser, updatedRow as ProfileRow);
            }
          }
        }

        return mapProfileAndAuthToUser(authUser, currentRow);
      }

      // If no profile row exists yet (e.g. trigger did not run), insert one linked to auth.users.id
      const insertPayload: Record<string, unknown> = {
        id: authUser.id,
        name: desiredName,
        email: desiredEmail,
        phone: desiredPhone,
        role: desiredRole
      };
      if (desiredCompany) {
        insertPayload.company = desiredCompany;
      }

      const { data: insertedProfile, error: insertError } = await client
        .from('profiles')
        .insert(insertPayload)
        .select('*')
        .maybeSingle();

      if (!insertError && insertedProfile) {
        return mapProfileAndAuthToUser(authUser, insertedProfile as ProfileRow);
      }
    } catch {
      // Fall back to authenticated user metadata if RLS temporarily blocks profile mutation
    }

    return mapProfileAndAuthToUser(authUser, null);
  }

  /**
   * Returns the current active Supabase Session (`null` when unauthenticated).
   */
  public async getCurrentSession(): Promise<Session | null> {
    const client = getRequiredSupabaseClient();
    try {
      const { data, error } = await client.auth.getSession();
      if (error) {
        throw mapSupabaseAuthError(
          error,
          'Unable to verify your current session.'
        );
      }
      return data.session ?? null;
    } catch (err) {
      if (err instanceof ServiceError && err.code === 'SESSION_EXPIRED') {
        await client.auth.signOut().catch(() => {});
      }
      return null;
    }
  }

  /**
   * Returns the currently authenticated user mapped with their `profiles` record,
   * or `null` if unauthenticated.
   */
  public async getCurrentUser(): Promise<User | null> {
    return this.getCurrentProfile();
  }

  /**
   * Fetches the authenticated user's profile from `public.profiles` linked to `auth.users.id`.
   */
  public async getCurrentProfile(): Promise<User | null> {
    const client = getRequiredSupabaseClient();
    try {
      const { data: sessionData, error: sessionErr } =
        await client.auth.getSession();
      if (sessionErr || !sessionData.session?.user) {
        return null;
      }

      const authUser = sessionData.session.user;
      const { data: profileRow, error: profileErr } = await client
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!profileErr && profileRow) {
        return mapProfileAndAuthToUser(authUser, profileRow as ProfileRow);
      }

      return await this.syncProfileForAuthUser(authUser);
    } catch {
      return null;
    }
  }

  /**
   * Registers a new account in Supabase Auth and associates the user's profile
   * in `public.profiles` with `auth.users.id`.
   *
   * Security: Public registration strictly forbids `admin` role creation.
   */
  public async signUp(input: RegisterInput): Promise<AuthSessionResponse> {
    const client = getRequiredSupabaseClient();
    const trimmedName = input.name.trim();
    const trimmedEmail = input.email.trim().toLowerCase();
    const trimmedPhone = input.phone.trim();
    const password = input.password || '';

    if (!trimmedName || trimmedName.length < 2) {
      throw new ServiceError(
        'Please enter your full name (at least 2 characters).',
        'VALIDATION_ERROR',
        400,
        { name: 'Full name is required.' }
      );
    }

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      throw new ServiceError(
        'Please enter a valid email address.',
        'VALIDATION_ERROR',
        400,
        { email: 'Valid email address is required.' }
      );
    }

    if (!trimmedPhone || !isValidUgandaPhone(trimmedPhone)) {
      throw new ServiceError(
        'Please enter a valid Ugandan phone number (e.g. 0772 123 456 or +256 772 123 456).',
        'VALIDATION_ERROR',
        400,
        { phone: 'Valid Ugandan phone number is required.' }
      );
    }

    if (password.length < 6) {
      throw new ServiceError(
        'Please choose a password with at least 6 characters.',
        'WEAK_PASSWORD',
        400,
        { password: 'Password must be at least 6 characters.' }
      );
    }

    const sanitizedRole = sanitizePublicRole(input.role);
    const normalizedPhone = normalizeUgandaPhone(trimmedPhone);

    try {
      const { data, error } = await client.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            name: trimmedName,
            phone: normalizedPhone,
            role: sanitizedRole,
            company: input.company?.trim() || null
          }
        }
      });

      if (error) {
        throw mapSupabaseAuthError(
          error,
          'Unable to complete registration. Please check your details and try again.'
        );
      }

      if (!data.user) {
        throw new ServiceError(
          'Registration could not be completed. Please try again.',
          'UNKNOWN_ERROR',
          500
        );
      }

      // Supabase returns an empty identities array when an email is already registered
      // and email enumeration protection is enabled.
      if (
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        throw new ServiceError(
          'An account with this email address is already registered. Please sign in instead.',
          'CONFLICT',
          409,
          { email: 'Email is already registered.' }
        );
      }

      // If email confirmation is disabled in Supabase, `data.session` is immediately active
      if (data.session) {
        const syncedUser = await this.syncProfileForAuthUser(data.user, {
          name: trimmedName,
          phone: normalizedPhone,
          email: trimmedEmail,
          role: sanitizedRole,
          company: input.company
        });

        return {
          user: syncedUser,
          requiresEmailConfirmation: false
        };
      }

      // Email confirmation is required before a session is issued
      const pendingUser = mapProfileAndAuthToUser(data.user, {
        id: data.user.id,
        name: trimmedName,
        email: trimmedEmail,
        phone: normalizedPhone,
        role: sanitizedRole,
        company: input.company
      });

      return {
        user: pendingUser,
        requiresEmailConfirmation: true
      };
    } catch (err) {
      throw mapSupabaseAuthError(
        err,
        'Unable to create your account. Please try again.'
      );
    }
  }

  /**
   * Signs in an existing user against Supabase Auth and resolves their `profiles` record.
   */
  public async signIn(input: LoginInput): Promise<AuthSessionResponse> {
    const client = getRequiredSupabaseClient();
    const rawIdentifier = input.identifier.trim();
    const password = input.password || '';

    if (!rawIdentifier) {
      throw new ServiceError(
        'Please enter your registered email address.',
        'VALIDATION_ERROR',
        400,
        { identifier: 'Email address is required.' }
      );
    }

    if (!EMAIL_REGEX.test(rawIdentifier)) {
      throw new ServiceError(
        'Please sign in using your registered email address (e.g. name@domain.com).',
        'VALIDATION_ERROR',
        400,
        { identifier: 'Valid email address is required for sign in.' }
      );
    }

    if (!password) {
      throw new ServiceError(
        'Please enter your account password.',
        'VALIDATION_ERROR',
        400,
        { password: 'Password is required.' }
      );
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: rawIdentifier.toLowerCase(),
        password
      });

      if (error) {
        throw mapSupabaseAuthError(
          error,
          'Invalid email address or password. Please try again.'
        );
      }

      if (!data.user || !data.session) {
        throw new ServiceError(
          'Unable to establish an authenticated session. Please try again.',
          'UNAUTHORIZED',
          401
        );
      }

      const profileUser = await this.syncProfileForAuthUser(data.user);

      return {
        user: profileUser,
        requiresEmailConfirmation: false
      };
    } catch (err) {
      throw mapSupabaseAuthError(
        err,
        'Unable to sign in. Please verify your email and password.'
      );
    }
  }

  /**
   * Signs out the current user via `supabase.auth.signOut()`.
   */
  public async signOut(): Promise<void> {
    const client = getRequiredSupabaseClient();
    const { error } = await client.auth.signOut();
    if (error) {
      throw mapSupabaseAuthError(
        error,
        'Unable to sign out completely. Please try again.'
      );
    }
  }

  /**
   * Sends a password reset email via Supabase Auth.
   */
  public async requestPasswordReset(email: string): Promise<void> {
    const client = getRequiredSupabaseClient();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      throw new ServiceError(
        'Please enter a valid email address to receive a password reset link.',
        'VALIDATION_ERROR',
        400,
        { email: 'Valid email address is required.' }
      );
    }

    try {
      const redirectTo =
        typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await client.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo
      });
      if (error) {
        throw mapSupabaseAuthError(
          error,
          'Unable to send password reset email. Please try again.'
        );
      }
    } catch (err) {
      throw mapSupabaseAuthError(
        err,
        'Unable to send password reset email. Please try again.'
      );
    }
  }

  /**
   * Subscribes to Supabase Auth state changes (`INITIAL_SESSION`, `SIGNED_IN`,
   * `TOKEN_REFRESHED`, `USER_UPDATED`, `SIGNED_OUT`) and resolves the user's `profiles` row.
   */
  public onAuthStateChange(
    callback: (event: string, user: User | null) => void
  ): () => void {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    const client = getRequiredSupabaseClient();
    const {
      data: { subscription }
    } = client.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        callback(event, null);
        return;
      }

      void this.syncProfileForAuthUser(session.user)
        .then((resolvedUser) => {
          callback(event, resolvedUser);
        })
        .catch(() => {
          callback(event, mapProfileAndAuthToUser(session.user, null));
        });
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  // Method aliases for existing callers
  public async login(input: LoginInput): Promise<AuthSessionResponse> {
    return this.signIn(input);
  }

  public async register(input: RegisterInput): Promise<AuthSessionResponse> {
    return this.signUp(input);
  }

  public async logout(): Promise<void> {
    return this.signOut();
  }
}

export const authService = new AuthService();

export const signUp = (input: RegisterInput): Promise<AuthSessionResponse> =>
  authService.signUp(input);

export const signIn = (input: LoginInput): Promise<AuthSessionResponse> =>
  authService.signIn(input);

export const signOut = (): Promise<void> => authService.signOut();

export const getCurrentSession = (): Promise<Session | null> =>
  authService.getCurrentSession();

export const getCurrentUser = (): Promise<User | null> =>
  authService.getCurrentUser();

export const getCurrentProfile = (): Promise<User | null> =>
  authService.getCurrentProfile();
