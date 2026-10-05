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
import {
  getRequiredSupabaseClient,
  isSupabaseConfigured,
  supabase
} from '../lib/supabase';
import { mockStorage } from '../mocks/mockStorage';

const VALID_ROLES: UserRole[] = ['buyer', 'agent', 'owner', 'developer', 'admin'];
const PUBLIC_ROLES: PublicRegistrableRole[] = ['buyer', 'agent', 'owner', 'developer'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalizes a role value from the authoritative PostgreSQL `profiles` table.
 */
function normalizeDbProfileRole(rawRole?: string | null): UserRole {
  const normalized = (rawRole || '').trim().toLowerCase() as UserRole;
  return VALID_ROLES.includes(normalized) ? normalized : 'buyer';
}

/**
 * Normalizes a public self-selected role. Never allows 'admin' from user metadata or signup inputs.
 */
function normalizePublicRole(rawRole?: string | null): PublicRegistrableRole {
  const normalized = (rawRole || '').trim().toLowerCase() as PublicRegistrableRole;
  return PUBLIC_ROLES.includes(normalized) ? normalized : 'buyer';
}

/**
 * Maps raw Supabase Auth errors into consistent, user-friendly ServiceError instances
 * without leaking internal database or server details.
 */
export function mapSupabaseAuthError(
  err: unknown,
  fallbackMessage = 'Authentication request failed. Please try again.'
): ServiceError {
  if (err instanceof ServiceError) {
    return err;
  }

  const rawMessage =
    err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
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
      'Network connection failed. Please check your internet connection and try again.',
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
      'Invalid email or password. Please check your credentials and try again.',
      'UNAUTHORIZED',
      401
    );
  }

  if (
    lower.includes('email not confirmed') ||
    lower.includes('confirm your email') ||
    lower.includes('unverified email')
  ) {
    return new ServiceError(
      'Please verify your email address before signing in. Check your inbox for the confirmation link.',
      'FORBIDDEN',
      403
    );
  }

  if (
    lower.includes('user already registered') ||
    lower.includes('already registered') ||
    lower.includes('already been registered') ||
    lower.includes('emailExists'.toLowerCase())
  ) {
    return new ServiceError(
      'An account with this email address is already registered. Please sign in instead.',
      'CONFLICT',
      409
    );
  }

  if (
    lower.includes('password should be') ||
    lower.includes('weak_password') ||
    lower.includes('password is too weak') ||
    lower.includes('password must be at least')
  ) {
    return new ServiceError(
      'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.',
      'VALIDATION_ERROR',
      400
    );
  }

  if (
    lower.includes('unable to validate email address') ||
    lower.includes('invalid email') ||
    lower.includes('email address is invalid')
  ) {
    return new ServiceError(
      'Please enter a valid email address.',
      'VALIDATION_ERROR',
      400
    );
  }

  if (
    lower.includes('jwt expired') ||
    lower.includes('refresh_token_not_found') ||
    lower.includes('session_not_found') ||
    lower.includes('session expired') ||
    lower.includes('invalid refresh token')
  ) {
    return new ServiceError(
      'Your session has expired. Please sign in again to continue.',
      'UNAUTHORIZED',
      401
    );
  }

  return new ServiceError(fallbackMessage, 'UNKNOWN_ERROR', 400);
}

/**
 * Maps a Supabase Auth user + PostgreSQL `profiles` row into the domain `User` model.
 *
 * Security Rules:
 * - `profiles.role` from PostgreSQL (enforced by RLS) is the primary source of role.
 * - `user_metadata` is NEVER trusted to grant `admin` role.
 */
function mapSupabaseUserAndProfileToDomainUser(
  authUser: SupabaseAuthUser,
  profileRow?: ProfileRow | null
): User {
  const meta = (authUser.user_metadata || {}) as Record<string, unknown>;
  const appMeta = (authUser.app_metadata || {}) as Record<string, unknown>;

  let resolvedRole: UserRole = 'buyer';
  if (profileRow?.role) {
    resolvedRole = normalizeDbProfileRole(profileRow.role);
  } else if (appMeta.role === 'admin') {
    resolvedRole = 'admin';
  } else if (typeof meta.role === 'string') {
    resolvedRole = normalizePublicRole(meta.role);
  }

  const resolvedName = (
    profileRow?.full_name ||
    profileRow?.name ||
    (typeof meta.full_name === 'string' ? meta.full_name : '') ||
    (typeof meta.name === 'string' ? meta.name : '') ||
    (authUser.email ? authUser.email.split('@')[0].replace(/[._-]/g, ' ') : 'Reality Estates Member')
  ).trim();

  const resolvedEmail = (
    profileRow?.email ||
    authUser.email ||
    (typeof meta.email === 'string' ? meta.email : '')
  ).trim();

  const resolvedPhone = (
    profileRow?.phone ||
    profileRow?.phone_number ||
    authUser.phone ||
    (typeof meta.phone === 'string' ? meta.phone : '')
  ).trim();

  const resolvedCompany = (
    profileRow?.company ||
    profileRow?.agency_name ||
    (typeof meta.company === 'string' ? meta.company : '')
  ).trim();

  const resolvedAvatar = (
    profileRow?.avatar_url ||
    profileRow?.avatar ||
    (typeof meta.avatar_url === 'string' ? meta.avatar_url : '')
  ).trim();

  const verifiedIdentity = Boolean(
    profileRow?.verified_identity ??
      profileRow?.is_verified ??
      authUser.email_confirmed_at ??
      authUser.phone_confirmed_at
  );

  return {
    id: authUser.id,
    name: resolvedName || 'Reality Estates Member',
    email: resolvedEmail,
    phone: resolvedPhone,
    role: resolvedRole,
    avatar: resolvedAvatar || undefined,
    company: resolvedCompany || undefined,
    verifiedIdentity
  };
}

/**
 * Validates an in-memory Demo Mode persona (used ONLY when Supabase env vars are missing).
 */
function validateDemoPersona(candidate: User | null): User | null {
  if (!candidate || typeof candidate !== 'object') return null;
  if (!candidate.id || !candidate.name) return null;

  const demoUsers = mockStorage.getDemoUsers();
  const matchedAdmin = demoUsers.find(
    (u) => u.role === 'admin' && u.id === candidate.id && u.email === candidate.email
  );

  let safeRole: UserRole = VALID_ROLES.includes(candidate.role)
    ? candidate.role
    : 'buyer';
  if (safeRole === 'admin' && !matchedAdmin) {
    safeRole = 'buyer';
  }

  return {
    id: String(candidate.id),
    name: String(candidate.name).trim(),
    email: String(candidate.email || '').trim(),
    phone: String(candidate.phone || '').trim(),
    role: safeRole,
    avatar: candidate.avatar,
    company: candidate.company,
    verifiedIdentity: Boolean(candidate.verifiedIdentity)
  };
}

class AuthService implements IAuthService {
  // Strictly in-memory session state for offline Demo Mode (when Supabase is not configured).
  // Never persisted to localStorage.
  private inMemoryDemoUser: User | null = null;
  private demoListeners = new Set<(event: string, user: User | null) => void>();

  public isSupabaseAuthEnabled(): boolean {
    return isSupabaseConfigured();
  }

  private notifyDemoListeners(event: string, user: User | null): void {
    this.demoListeners.forEach((listener) => {
      try {
        listener(event, user);
      } catch {
        // Ignore listener errors
      }
    });
  }

  /**
   * Fetches the row from `public.profiles` matching `auth.users.id`.
   */
  private async fetchProfileRowByUserId(userId: string): Promise<ProfileRow | null> {
    if (!supabase || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }
      return data as ProfileRow;
    } catch {
      return null;
    }
  }

  /**
   * Ensures a single profile row exists in `public.profiles` for `auth.users.id`
   * after registration or login, respecting any existing database trigger (`handle_new_user`)
   * and never creating duplicate profile rows.
   */
  private async ensureProfileSynchronized(
    authUser: SupabaseAuthUser,
    registrationDetails?: {
      name: string;
      email: string;
      phone: string;
      role: PublicRegistrableRole;
      company?: string;
    }
  ): Promise<ProfileRow | null> {
    if (!supabase) return null;

    // 1. Check if the database trigger (`on_auth_user_created`) already created the profile row
    const existingRow = await this.fetchProfileRowByUserId(authUser.id);

    if (existingRow) {
      // If registration provided phone/name/role that the trigger didn't populate yet, update that existing row
      if (registrationDetails) {
        const currentName = existingRow.full_name || existingRow.name;
        const currentPhone = existingRow.phone || existingRow.phone_number;
        const needsUpdate =
          !currentName ||
          !currentPhone ||
          (existingRow.role !== 'admin' && existingRow.role !== registrationDetails.role);

        if (needsUpdate) {
          const updateCandidates: Record<string, unknown>[] = [
            {
              full_name: registrationDetails.name,
              phone: registrationDetails.phone,
              role: registrationDetails.role
            },
            {
              name: registrationDetails.name,
              phone: registrationDetails.phone,
              role: registrationDetails.role
            }
          ];

          for (const patch of updateCandidates) {
            const { data: updatedData, error: updateErr } = await supabase
              .from('profiles')
              .update(patch)
              .eq('id', authUser.id)
              .select('*')
              .maybeSingle();

            if (!updateErr && updatedData) {
              return updatedData as ProfileRow;
            }
          }
        }
      }
      return existingRow;
    }

    // 2. If no database trigger created the row yet, perform a single idempotent upsert by `id` (`auth.users.id`)
    const meta = (authUser.user_metadata || {}) as Record<string, unknown>;
    const fullName =
      registrationDetails?.name ||
      (typeof meta.full_name === 'string' ? meta.full_name : '') ||
      (typeof meta.name === 'string' ? meta.name : '') ||
      (authUser.email ? authUser.email.split('@')[0] : 'Reality Estates Member');
    const email = registrationDetails?.email || authUser.email || '';
    const phone =
      registrationDetails?.phone ||
      authUser.phone ||
      (typeof meta.phone === 'string' ? meta.phone : '');
    const safeRole: PublicRegistrableRole =
      registrationDetails?.role ||
      normalizePublicRole(typeof meta.role === 'string' ? meta.role : 'buyer');

    const candidatePayloads: Record<string, unknown>[] = [
      {
        id: authUser.id,
        email,
        full_name: fullName,
        phone,
        role: safeRole
      },
      {
        id: authUser.id,
        email,
        name: fullName,
        phone,
        role: safeRole
      },
      {
        id: authUser.id,
        full_name: fullName,
        role: safeRole
      }
    ];

    for (const payload of candidatePayloads) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select('*')
        .maybeSingle();

      if (!error && data) {
        return data as ProfileRow;
      }
    }

    return this.fetchProfileRowByUserId(authUser.id);
  }

  /**
   * Returns the current active Supabase Auth session (or null if unauthenticated).
   */
  public async getCurrentSession(): Promise<Session | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw mapSupabaseAuthError(error);
      }
      return data.session;
    } catch {
      return null;
    }
  }

  /**
   * Returns the authenticated user's profile combined from Supabase Auth and `public.profiles`.
   */
  public async getCurrentProfile(): Promise<User | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError || !sessionData.session?.user) {
          return null;
        }

        const authUser = sessionData.session.user;
        const profileRow = await this.fetchProfileRowByUserId(authUser.id);
        return mapSupabaseUserAndProfileToDomainUser(authUser, profileRow);
      } catch {
        return null;
      }
    }

    return this.inMemoryDemoUser;
  }

  /**
   * Returns the current authenticated user (delegating to `getCurrentProfile`).
   */
  public async getCurrentUser(): Promise<User | null> {
    return this.getCurrentProfile();
  }

  /**
   * Registers a new user account via Supabase Auth (`supabase.auth.signUp`)
   * and associates their profile in `public.profiles` with `auth.users.id`.
   */
  public async signUp(input: RegisterInput): Promise<AuthSessionResponse> {
    const name = (input.name || '').trim();
    const phone = (input.phone || '').trim();
    const email = (input.email || '').trim().toLowerCase();
    const password = input.password || '';

    // Never allow public registration to create an 'admin' account
    const requestedRole = String(input.role || 'buyer')
      .trim()
      .toLowerCase();
    if (requestedRole === 'admin') {
      throw new ServiceError(
        'Administrator accounts cannot be created through public registration.',
        'FORBIDDEN',
        403
      );
    }

    const safeRole: PublicRegistrableRole = normalizePublicRole(requestedRole);

    if (!name) {
      throw new ServiceError(
        'Please enter your full name to create an account.',
        'VALIDATION_ERROR',
        400,
        { name: 'Full name is required' }
      );
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      throw new ServiceError(
        'Please enter a valid email address.',
        'VALIDATION_ERROR',
        400,
        { email: 'Valid email address is required' }
      );
    }

    if (!phone || phone.replace(/\D/g, '').length < 7) {
      throw new ServiceError(
        'Please enter a valid Ugandan phone number.',
        'VALIDATION_ERROR',
        400,
        { phone: 'Valid phone number is required' }
      );
    }

    if (!password || password.length < 6) {
      throw new ServiceError(
        'Password is too weak. Please use at least 6 characters.',
        'VALIDATION_ERROR',
        400,
        { password: 'Minimum 6 characters required' }
      );
    }

    // Production Supabase Auth registration
    if (isSupabaseConfigured()) {
      const client = getRequiredSupabaseClient();
      try {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              name,
              phone,
              role: safeRole,
              company: input.company?.trim() || null
            }
          }
        });

        if (error) {
          throw mapSupabaseAuthError(error, 'Could not complete registration.');
        }

        if (!data.user) {
          throw new ServiceError(
            'Registration could not be completed. Please try again.',
            'UNKNOWN_ERROR',
            500
          );
        }

        // Supabase returns an empty identities array when an email is already registered and obfuscation is active
        if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          throw new ServiceError(
            'An account with this email address is already registered. Please sign in instead.',
            'CONFLICT',
            409
          );
        }

        // If a session was immediately issued, ensure `profiles` row is synchronized
        if (data.session) {
          const profileRow = await this.ensureProfileSynchronized(data.user, {
            name,
            email,
            phone,
            role: safeRole,
            company: input.company?.trim()
          });
          const domainUser = mapSupabaseUserAndProfileToDomainUser(
            data.user,
            profileRow
          );
          return {
            user: domainUser,
            isDemoSession: false,
            requiresEmailConfirmation: false
          };
        }

        // Email confirmation is required before an active session is established
        const pendingUser = mapSupabaseUserAndProfileToDomainUser(data.user, {
          id: data.user.id,
          email,
          full_name: name,
          phone,
          role: safeRole
        });

        return {
          user: pendingUser,
          isDemoSession: false,
          requiresEmailConfirmation: true
        };
      } catch (err) {
        throw mapSupabaseAuthError(err, 'Could not complete registration.');
      }
    }

    // Isolated Demo Mode fallback (ONLY when VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are not configured)
    const demoUser: User = {
      id: `demo-usr-${Date.now().toString(36)}`,
      name,
      phone,
      email,
      role: safeRole,
      company: input.company?.trim() || undefined,
      verifiedIdentity: true
    };

    this.inMemoryDemoUser = demoUser;
    this.notifyDemoListeners('SIGNED_IN', demoUser);
    return {
      user: demoUser,
      isDemoSession: true
    };
  }

  /**
   * Signs in an existing user via Supabase Auth (`supabase.auth.signInWithPassword`)
   * and loads their profile from `public.profiles`.
   */
  public async signIn(input: LoginInput): Promise<AuthSessionResponse> {
    const identifier = (input.identifier || '').trim();
    const password = input.password || '';

    if (!identifier) {
      throw new ServiceError(
        'Please enter your email address.',
        'VALIDATION_ERROR',
        400,
        { identifier: 'Email address is required' }
      );
    }

    // Production Supabase Auth sign-in
    if (isSupabaseConfigured()) {
      const client = getRequiredSupabaseClient();
      const isEmail = identifier.includes('@');

      if (isEmail && !EMAIL_REGEX.test(identifier)) {
        throw new ServiceError(
          'Please enter a valid email address.',
          'VALIDATION_ERROR',
          400,
          { identifier: 'Invalid email format' }
        );
      }

      if (!password) {
        throw new ServiceError(
          'Please enter your password to sign in.',
          'VALIDATION_ERROR',
          400,
          { password: 'Password is required' }
        );
      }

      try {
        const credentials = isEmail
          ? { email: identifier.toLowerCase(), password }
          : { phone: identifier, password };

        const { data, error } = await client.auth.signInWithPassword(credentials);
        if (error) {
          throw mapSupabaseAuthError(error, 'Unable to sign in.');
        }

        if (!data.user || !data.session) {
          throw new ServiceError(
            'Invalid email or password. Please check your credentials and try again.',
            'UNAUTHORIZED',
            401
          );
        }

        const profileRow = await this.ensureProfileSynchronized(data.user);
        const domainUser = mapSupabaseUserAndProfileToDomainUser(
          data.user,
          profileRow
        );

        return {
          user: domainUser,
          isDemoSession: false
        };
      } catch (err) {
        throw mapSupabaseAuthError(err, 'Unable to sign in.');
      }
    }

    // Offline Demo Mode fallback (ONLY when Supabase env vars are not configured)
    const demoUsers = mockStorage.getDemoUsers();
    const normalizedDigits = identifier.replace(/\D/g, '');

    const matchedDemo = demoUsers.find((u) => {
      const emailMatch = u.email.toLowerCase() === identifier.toLowerCase();
      const userDigits = u.phone.replace(/\D/g, '');
      const phoneMatch =
        normalizedDigits.length >= 6 &&
        userDigits.endsWith(normalizedDigits.slice(-6));
      return emailMatch || phoneMatch;
    });

    if (matchedDemo) {
      this.inMemoryDemoUser = matchedDemo;
      this.notifyDemoListeners('SIGNED_IN', matchedDemo);
      return {
        user: matchedDemo,
        isDemoSession: true
      };
    }

    const isEmail = identifier.includes('@');
    const fallbackDemoUser: User = {
      id: `demo-usr-${Date.now().toString(36)}`,
      name: isEmail
        ? identifier.split('@')[0].replace(/[._-]/g, ' ')
        : 'Demo Client',
      email: isEmail ? identifier : 'client@realityestates.ug',
      phone: isEmail ? '+256 700 000 000' : identifier,
      role: 'buyer',
      verifiedIdentity: true
    };

    this.inMemoryDemoUser = fallbackDemoUser;
    this.notifyDemoListeners('SIGNED_IN', fallbackDemoUser);
    return {
      user: fallbackDemoUser,
      isDemoSession: true
    };
  }

  /**
   * Signs out the authenticated user via `supabase.auth.signOut()` and clears application user state.
   */
  public async signOut(): Promise<void> {
    this.inMemoryDemoUser = null;

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw mapSupabaseAuthError(error, 'Failed to sign out cleanly.');
      }
      return;
    }

    this.notifyDemoListeners('SIGNED_OUT', null);
  }

  /**
   * Sends a password reset email via `supabase.auth.resetPasswordForEmail`.
   */
  public async requestPasswordReset(email: string): Promise<void> {
    const trimmed = (email || '').trim().toLowerCase();
    if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
      throw new ServiceError(
        'Please enter a valid email address to receive a password reset link.',
        'VALIDATION_ERROR',
        400
      );
    }

    if (!isSupabaseConfigured() || !supabase) {
      throw new ServiceError(
        'Password reset emails require Supabase Authentication (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY) to be configured.',
        'STORAGE_NOT_CONFIGURED',
        503
      );
    }

    try {
      const redirectTo =
        typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo
      });
      if (error) {
        throw mapSupabaseAuthError(
          error,
          'Could not send password reset email. Please try again.'
        );
      }
    } catch (err) {
      throw mapSupabaseAuthError(
        err,
        'Could not send password reset email. Please try again.'
      );
    }
  }

  /**
   * Subscribes to authentication state transitions (`SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`, `USER_UPDATED`).
   * Returns an unsubscribe function.
   */
  public onAuthStateChange(
    callback: (event: string, user: User | null) => void
  ): () => void {
    if (isSupabaseConfigured() && supabase) {
      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session?.user) {
          callback(event, null);
          return;
        }

        // Resolve profile asynchronously without blocking Supabase's internal auth lock
        void (async () => {
          const profileRow = await this.fetchProfileRowByUserId(session.user.id);
          const domainUser = mapSupabaseUserAndProfileToDomainUser(
            session.user,
            profileRow
          );
          callback(event, domainUser);
        })();
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    this.demoListeners.add(callback);
    return () => {
      this.demoListeners.delete(callback);
    };
  }

  // Aliases preserved for existing callers
  public async login(input: LoginInput): Promise<AuthSessionResponse> {
    return this.signIn(input);
  }

  public async register(input: RegisterInput): Promise<AuthSessionResponse> {
    return this.signUp(input);
  }

  public async logout(): Promise<void> {
    return this.signOut();
  }

  /**
   * Demo persona switcher — strictly disabled when Supabase Auth is configured.
   */
  public async loginAsDemoUser(user: User): Promise<AuthSessionResponse> {
    if (isSupabaseConfigured()) {
      throw new ServiceError(
        'Demo persona switching is disabled when connected to Supabase Authentication. Please sign in with your account credentials.',
        'FORBIDDEN',
        403
      );
    }

    const validated = validateDemoPersona(user);
    if (!validated) {
      throw new ServiceError(
        'Invalid demo user profile selected.',
        'VALIDATION_ERROR',
        400
      );
    }

    this.inMemoryDemoUser = validated;
    this.notifyDemoListeners('SIGNED_IN', validated);
    return {
      user: validated,
      isDemoSession: true
    };
  }

  public getDemoUsers(): User[] {
    if (isSupabaseConfigured()) {
      return [];
    }
    return mockStorage.getDemoUsers();
  }
}

export const authService: IAuthService = new AuthService();
