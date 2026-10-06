import { ISavedPropertyService, ServiceError } from '../types/api';
import { Property } from '../types/property';
import { getRequiredSupabaseClient } from '../lib/supabase';
import { propertyService } from './propertyService';

function mapSavedPropertyError(err: unknown, fallbackMessage: string): ServiceError {
  if (err instanceof ServiceError) return err;

  const rawMsg =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message?: unknown }).message || '')
      : err instanceof Error
      ? err.message
      : '';
  const lower = rawMsg.toLowerCase();

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

  return new ServiceError(fallbackMessage, 'UNKNOWN_ERROR', 500);
}

class SavedPropertyService implements ISavedPropertyService {
  private async resolveAuthenticatedUserId(explicitUserId?: string): Promise<string | null> {
    if (explicitUserId) return explicitUserId;
    const client = getRequiredSupabaseClient();
    const { data } = await client.auth.getSession();
    return data.session?.user?.id ?? null;
  }

  private async requireAuthenticatedUserId(explicitUserId?: string): Promise<string> {
    const userId = await this.resolveAuthenticatedUserId(explicitUserId);
    if (!userId) {
      throw new ServiceError(
        'Create an account or sign in to continue.',
        'UNAUTHORIZED',
        401
      );
    }
    return userId;
  }

  public async getSavedPropertyIds(userId?: string): Promise<string[]> {
    const client = getRequiredSupabaseClient();
    const resolvedUserId = await this.resolveAuthenticatedUserId(userId);
    if (!resolvedUserId) {
      return [];
    }

    try {
      const { data, error } = await client
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', resolvedUserId)
        .order('created_at', { ascending: false });

      if (error) {
        throw mapSavedPropertyError(
          error,
          'Unable to load your saved properties. Please refresh the page.'
        );
      }

      return ((data || []) as Array<{ property_id: string }>)
        .map((row) => String(row.property_id))
        .filter(Boolean);
    } catch (err) {
      throw mapSavedPropertyError(
        err,
        'Unable to load your saved properties. Please refresh the page.'
      );
    }
  }

  public async getSavedProperties(userId?: string): Promise<Property[]> {
    const savedIds = await this.getSavedPropertyIds(userId);
    if (savedIds.length === 0) return [];

    const allProperties = await propertyService.getProperties();
    return allProperties.filter((p) => savedIds.includes(p.id));
  }

  public async saveProperty(propertyId: string, userId?: string): Promise<string[]> {
    const client = getRequiredSupabaseClient();
    const resolvedUserId = await this.requireAuthenticatedUserId(userId);

    try {
      const { error } = await client.from('saved_properties').upsert(
        {
          user_id: resolvedUserId,
          property_id: propertyId
        },
        { onConflict: 'user_id,property_id' }
      );

      if (error) {
        throw mapSavedPropertyError(
          error,
          'Unable to save this property. Please try again.'
        );
      }

      return this.getSavedPropertyIds(resolvedUserId);
    } catch (err) {
      throw mapSavedPropertyError(
        err,
        'Unable to save this property. Please try again.'
      );
    }
  }

  public async removeSavedProperty(propertyId: string, userId?: string): Promise<string[]> {
    const client = getRequiredSupabaseClient();
    const resolvedUserId = await this.requireAuthenticatedUserId(userId);

    try {
      const { error } = await client
        .from('saved_properties')
        .delete()
        .eq('user_id', resolvedUserId)
        .eq('property_id', propertyId);

      if (error) {
        throw mapSavedPropertyError(
          error,
          'Unable to update your saved properties. Please try again.'
        );
      }

      return this.getSavedPropertyIds(resolvedUserId);
    } catch (err) {
      throw mapSavedPropertyError(
        err,
        'Unable to update your saved properties. Please try again.'
      );
    }
  }

  public async toggleSavedProperty(
    propertyId: string,
    userId?: string
  ): Promise<{ savedIds: string[]; isSaved: boolean }> {
    const resolvedUserId = await this.requireAuthenticatedUserId(userId);
    const current = await this.getSavedPropertyIds(resolvedUserId);
    const alreadySaved = current.includes(propertyId);

    if (alreadySaved) {
      const savedIds = await this.removeSavedProperty(propertyId, resolvedUserId);
      return { savedIds, isSaved: false };
    } else {
      const savedIds = await this.saveProperty(propertyId, resolvedUserId);
      return { savedIds, isSaved: true };
    }
  }

  public async clearSavedProperties(userId?: string): Promise<string[]> {
    const client = getRequiredSupabaseClient();
    const resolvedUserId = await this.requireAuthenticatedUserId(userId);

    try {
      const { error } = await client
        .from('saved_properties')
        .delete()
        .eq('user_id', resolvedUserId);

      if (error) {
        throw mapSavedPropertyError(
          error,
          'Unable to clear your saved properties. Please try again.'
        );
      }

      return [];
    } catch (err) {
      throw mapSavedPropertyError(
        err,
        'Unable to clear your saved properties. Please try again.'
      );
    }
  }
}

export const savedPropertyService = new SavedPropertyService();
