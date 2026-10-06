import {
  CreateViewingRequestInput,
  IViewingService,
  ServiceError,
  UpdateViewingStatusInput
} from '../types/api';
import { TransactionType, ViewingRequest, ViewingStatus } from '../types/property';
import { generateUuid, getRequiredSupabaseClient } from '../lib/supabase';

const VIEWING_RELATIONAL_SELECT =
  '*, property:properties(id, title, location, price, transaction, price_period, slug, property_images(public_url, sort_order)), assigned_agent:profiles!viewing_requests_assigned_agent_id_fkey(id, name)';

function mapViewingError(err: unknown, fallbackMessage: string): ServiceError {
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

  if (lower.includes('row-level security') || lower.includes('permission denied')) {
    return new ServiceError(
      'You do not have permission to perform this action.',
      'FORBIDDEN',
      403
    );
  }

  return new ServiceError(fallbackMessage, 'UNKNOWN_ERROR', 500);
}

function mapRowToViewingRequest(
  row: Record<string, unknown>,
  fallbackProperty?: {
    title?: string;
    location?: string;
    image?: string;
    price?: number;
    transaction?: TransactionType;
    pricePeriod?: string;
  }
): ViewingRequest {
  const prop =
    row.property && typeof row.property === 'object' && !Array.isArray(row.property)
      ? (row.property as Record<string, unknown>)
      : null;

  const rawImages = Array.isArray(prop?.property_images)
    ? (prop?.property_images as Array<{ public_url?: string; sort_order?: number }>)
    : [];
  const sortedImages = [...rawImages].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const primaryImage = sortedImages[0]?.public_url || fallbackProperty?.image || '';

  const assignedAgentObj =
    row.assigned_agent &&
    typeof row.assigned_agent === 'object' &&
    !Array.isArray(row.assigned_agent)
      ? (row.assigned_agent as Record<string, unknown>)
      : null;

  return {
    id: String(row.id || ''),
    propertyId: String(row.property_id || ''),
    propertyTitle: String(prop?.title || fallbackProperty?.title || 'Property Listing'),
    propertyLocation: String(prop?.location || fallbackProperty?.location || ''),
    propertyImage: primaryImage,
    propertyPrice: Number(prop?.price ?? fallbackProperty?.price ?? 0),
    propertyTransaction: ((prop?.transaction as TransactionType) ||
      fallbackProperty?.transaction ||
      'buy') as TransactionType,
    propertyPricePeriod: prop?.price_period
      ? String(prop.price_period)
      : fallbackProperty?.pricePeriod,
    customerName: String(row.customer_name || ''),
    customerPhone: String(row.customer_phone || ''),
    customerEmail: row.customer_email ? String(row.customer_email) : undefined,
    preferredDate: String(row.preferred_date || ''),
    preferredTime: String(row.preferred_time || ''),
    message: row.message ? String(row.message) : undefined,
    status: ((row.status as ViewingStatus) || 'Pending') as ViewingStatus,
    dateRequested: String(row.created_at || new Date().toISOString()).split('T')[0],
    assignedAgentName: assignedAgentObj?.name
      ? String(assignedAgentObj.name)
      : undefined
  };
}

class ViewingService implements IViewingService {
  public async getViewingRequests(userId?: string): Promise<ViewingRequest[]> {
    const client = getRequiredSupabaseClient();
    const { data: sessionData } = await client.auth.getSession();
    const activeUserId = userId || sessionData.session?.user?.id;

    if (!activeUserId) {
      return [];
    }

    try {
      const { data, error } = await client
        .from('viewing_requests')
        .select(VIEWING_RELATIONAL_SELECT)
        .order('created_at', { ascending: false });

      if (error) {
        throw mapViewingError(
          error,
          'Unable to load viewing requests. Please refresh the page.'
        );
      }

      return ((data || []) as Record<string, unknown>[]).map((row) =>
        mapRowToViewingRequest(row)
      );
    } catch (err) {
      throw mapViewingError(
        err,
        'Unable to load viewing requests. Please refresh the page.'
      );
    }
  }

  public async createViewingRequest(
    input: CreateViewingRequestInput
  ): Promise<ViewingRequest> {
    if (!input.propertyId) {
      throw new ServiceError('Property reference is required.', 'VALIDATION_ERROR', 400);
    }
    if (!input.customerName || !input.customerName.trim()) {
      throw new ServiceError('Your full name is required.', 'VALIDATION_ERROR', 400, {
        customerName: 'Name is required'
      });
    }
    if (!input.customerPhone || !input.customerPhone.trim()) {
      throw new ServiceError('Your phone number is required.', 'VALIDATION_ERROR', 400, {
        customerPhone: 'Phone number is required'
      });
    }
    if (!input.preferredDate) {
      throw new ServiceError(
        'Please select a preferred viewing date.',
        'VALIDATION_ERROR',
        400,
        { preferredDate: 'Preferred date is required' }
      );
    }
    if (!input.preferredTime) {
      throw new ServiceError(
        'Please select a preferred time slot.',
        'VALIDATION_ERROR',
        400,
        { preferredTime: 'Preferred time is required' }
      );
    }

    const client = getRequiredSupabaseClient();
    const { data: sessionData } = await client.auth.getSession();
    const authenticatedUserId = sessionData.session?.user?.id;

    if (!authenticatedUserId) {
      throw new ServiceError(
        'Create an account or sign in to continue.',
        'UNAUTHORIZED',
        401
      );
    }

    try {
      const { data: propData } = await client
        .from('properties')
        .select('advertiser_id')
        .eq('id', input.propertyId)
        .maybeSingle();

      const assignedAgentId =
        propData && typeof propData === 'object' && 'advertiser_id' in propData
          ? (propData as { advertiser_id?: string | null }).advertiser_id || null
          : null;

      const viewingId = generateUuid();
      const insertPayload: Record<string, unknown> = {
        id: viewingId,
        property_id: input.propertyId,
        customer_id: authenticatedUserId,
        assigned_agent_id: assignedAgentId,
        customer_name: input.customerName.trim(),
        customer_phone: input.customerPhone.trim(),
        customer_email: input.customerEmail?.trim() || null,
        preferred_date: input.preferredDate,
        preferred_time: input.preferredTime,
        message: input.message?.trim() || null,
        status: 'Pending'
      };

      const { data, error } = await client
        .from('viewing_requests')
        .insert(insertPayload)
        .select(VIEWING_RELATIONAL_SELECT)
        .single();

      if (error || !data) {
        throw mapViewingError(
          error,
          'Unable to submit your viewing request. Please try again.'
        );
      }

      return mapRowToViewingRequest(data as Record<string, unknown>, {
        title: input.propertyTitle,
        location: input.propertyLocation,
        image: input.propertyImage,
        price: input.propertyPrice,
        transaction: input.propertyTransaction,
        pricePeriod: input.propertyPricePeriod
      });
    } catch (err) {
      throw mapViewingError(
        err,
        'Unable to submit your viewing request. Please try again.'
      );
    }
  }

  public async updateViewingRequestStatus(
    input: UpdateViewingStatusInput
  ): Promise<ViewingRequest> {
    const client = getRequiredSupabaseClient();

    try {
      const { data, error } = await client
        .from('viewing_requests')
        .update({ status: input.status })
        .eq('id', input.requestId)
        .select(VIEWING_RELATIONAL_SELECT)
        .single();

      if (error || !data) {
        throw mapViewingError(
          error,
          'Unable to update viewing status. Please try again.'
        );
      }

      return mapRowToViewingRequest(data as Record<string, unknown>);
    } catch (err) {
      throw mapViewingError(
        err,
        'Unable to update viewing status. Please try again.'
      );
    }
  }
}

export const viewingService = new ViewingService();
