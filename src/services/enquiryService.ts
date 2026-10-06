import {
  CreateEnquiryInput,
  IEnquiryService,
  ServiceError,
  UpdateEnquiryStatusInput
} from '../types/api';
import { Enquiry, EnquiryStatus } from '../types/property';
import { generateUuid, getRequiredSupabaseClient } from '../lib/supabase';

const ENQUIRY_RELATIONAL_SELECT =
  '*, property:properties(id, title, location, price, slug, property_images(public_url, sort_order)), assigned_rep:profiles!enquiries_assigned_rep_id_fkey(id, name)';

function mapEnquiryError(err: unknown, fallbackMessage: string): ServiceError {
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

function mapRowToEnquiry(
  row: Record<string, unknown>,
  fallbackProperty?: {
    title?: string;
    location?: string;
    price?: number;
    image?: string;
  }
): Enquiry {
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
  const primaryImage = sortedImages[0]?.public_url || fallbackProperty?.image || undefined;

  const assignedRepObj =
    row.assigned_rep &&
    typeof row.assigned_rep === 'object' &&
    !Array.isArray(row.assigned_rep)
      ? (row.assigned_rep as Record<string, unknown>)
      : null;

  return {
    id: String(row.id || ''),
    propertyId: String(row.property_id || ''),
    propertyTitle: String(
      prop?.title || fallbackProperty?.title || 'Property Listing'
    ),
    propertyImage: primaryImage,
    propertyPrice: Number(prop?.price ?? fallbackProperty?.price ?? 0),
    propertyLocation: String(prop?.location || fallbackProperty?.location || ''),
    customerName: String(row.customer_name || ''),
    customerEmail: row.customer_email ? String(row.customer_email) : undefined,
    customerPhone: String(row.customer_phone || ''),
    subject: row.subject ? String(row.subject) : undefined,
    message: String(row.message || ''),
    date: String(row.created_at || new Date().toISOString()).split('T')[0],
    status: ((row.status as EnquiryStatus) || 'New') as EnquiryStatus,
    notes: row.notes ? String(row.notes) : undefined,
    assignedRep: assignedRepObj?.name ? String(assignedRepObj.name) : undefined
  };
}

class EnquiryService implements IEnquiryService {
  public async getEnquiries(userId?: string): Promise<Enquiry[]> {
    const client = getRequiredSupabaseClient();
    const { data: sessionData } = await client.auth.getSession();
    const activeUserId = userId || sessionData.session?.user?.id;

    if (!activeUserId) {
      return [];
    }

    try {
      const { data, error } = await client
        .from('enquiries')
        .select(ENQUIRY_RELATIONAL_SELECT)
        .order('created_at', { ascending: false });

      if (error) {
        throw mapEnquiryError(
          error,
          'Unable to load enquiries. Please refresh the page.'
        );
      }

      return ((data || []) as Record<string, unknown>[]).map((row) =>
        mapRowToEnquiry(row)
      );
    } catch (err) {
      throw mapEnquiryError(
        err,
        'Unable to load enquiries. Please refresh the page.'
      );
    }
  }

  public async createEnquiry(input: CreateEnquiryInput): Promise<Enquiry> {
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
    if (!input.message || !input.message.trim()) {
      throw new ServiceError('Please enter an enquiry message.', 'VALIDATION_ERROR', 400, {
        message: 'Message cannot be empty'
      });
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
      // Look up the property's advertiser_id so the enquiry is routed to the property representative
      const { data: propData } = await client
        .from('properties')
        .select('advertiser_id')
        .eq('id', input.propertyId)
        .maybeSingle();

      const assignedRepId =
        propData && typeof propData === 'object' && 'advertiser_id' in propData
          ? (propData as { advertiser_id?: string | null }).advertiser_id || null
          : null;

      const enquiryId = generateUuid();
      const insertPayload: Record<string, unknown> = {
        id: enquiryId,
        property_id: input.propertyId,
        customer_id: authenticatedUserId,
        assigned_rep_id: assignedRepId,
        customer_name: input.customerName.trim(),
        customer_email: input.customerEmail?.trim() || null,
        customer_phone: input.customerPhone.trim(),
        subject: input.subject?.trim() || `Enquiry on ${input.propertyTitle}`,
        message: input.message.trim(),
        status: 'New'
      };

      const { data, error } = await client
        .from('enquiries')
        .insert(insertPayload)
        .select(ENQUIRY_RELATIONAL_SELECT)
        .single();

      if (error || !data) {
        throw mapEnquiryError(
          error,
          'Unable to submit your enquiry. Please try again.'
        );
      }

      return mapRowToEnquiry(data as Record<string, unknown>, {
        title: input.propertyTitle,
        location: input.propertyLocation,
        price: input.propertyPrice,
        image: input.propertyImage
      });
    } catch (err) {
      throw mapEnquiryError(
        err,
        'Unable to submit your enquiry. Please try again.'
      );
    }
  }

  public async updateEnquiryStatus(input: UpdateEnquiryStatusInput): Promise<Enquiry> {
    const client = getRequiredSupabaseClient();

    try {
      const updatePayload: Record<string, unknown> = {
        status: input.status
      };
      if (input.notes !== undefined) {
        updatePayload.notes = input.notes;
      }

      const { data, error } = await client
        .from('enquiries')
        .update(updatePayload)
        .eq('id', input.enquiryId)
        .select(ENQUIRY_RELATIONAL_SELECT)
        .single();

      if (error || !data) {
        throw mapEnquiryError(
          error,
          'Unable to update enquiry status. Please try again.'
        );
      }

      return mapRowToEnquiry(data as Record<string, unknown>);
    } catch (err) {
      throw mapEnquiryError(
        err,
        'Unable to update enquiry status. Please try again.'
      );
    }
  }
}

export const enquiryService = new EnquiryService();
