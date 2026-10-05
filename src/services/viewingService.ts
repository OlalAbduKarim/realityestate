import {
  CreateViewingRequestInput,
  IViewingService,
  ServiceError,
  UpdateViewingStatusInput
} from '../types/api';
import { ViewingRequest, ViewingStatus } from '../types/property';
import { mockStorage } from '../mocks/mockStorage';
import { isValidIsoDateString } from '../utils/formatters';

const VALID_VIEWING_STATUSES: ViewingStatus[] = [
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled'
];

class ViewingService implements IViewingService {
  public async getViewingRequests(_userId?: string): Promise<ViewingRequest[]> {
    return mockStorage.getViewingRequests();
  }

  public async createViewingRequest(input: CreateViewingRequestInput): Promise<ViewingRequest> {
    const propertyId = (input.propertyId || '').trim();
    const customerName = (input.customerName || '').trim();
    const customerPhone = (input.customerPhone || '').trim();
    const preferredDate = (input.preferredDate || '').trim();
    const preferredTime = (input.preferredTime || '').trim();

    if (!propertyId) {
      throw new ServiceError('Property ID is required to schedule a viewing.', 'VALIDATION_ERROR', 400);
    }
    if (!customerName) {
      throw new ServiceError('Please provide your full name.', 'VALIDATION_ERROR', 400, {
        customerName: 'Name is required'
      });
    }
    if (!customerPhone || customerPhone.replace(/\D/g, '').length < 7) {
      throw new ServiceError('Please provide a valid phone number.', 'VALIDATION_ERROR', 400, {
        customerPhone: 'Valid phone number is required'
      });
    }
    if (!isValidIsoDateString(preferredDate)) {
      throw new ServiceError(
        'Please select a valid calendar date (YYYY-MM-DD) for your viewing.',
        'VALIDATION_ERROR',
        400,
        { preferredDate: 'Invalid date value' }
      );
    }
    if (!preferredTime) {
      throw new ServiceError('Please select a preferred time window.', 'VALIDATION_ERROR', 400, {
        preferredTime: 'Time window is required'
      });
    }

    const newRequest: ViewingRequest = {
      id: `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      propertyId,
      propertyTitle: (input.propertyTitle || 'Property Listing').trim(),
      propertyLocation: (input.propertyLocation || 'Uganda').trim(),
      propertyImage: input.propertyImage || '',
      propertyPrice: Number(input.propertyPrice) || 0,
      propertyTransaction: input.propertyTransaction || 'buy',
      propertyPricePeriod: input.propertyPricePeriod,
      customerName,
      customerPhone,
      customerEmail: input.customerEmail?.trim() || undefined,
      preferredDate,
      preferredTime,
      message: input.message?.trim() || 'Requesting on-site property inspection with representative.',
      status: 'Pending',
      dateRequested: new Date().toISOString().split('T')[0],
      assignedAgentName: 'Pearl Prime Verification Desk'
    };

    const existing = mockStorage.getViewingRequests();
    const updated = [newRequest, ...existing];
    mockStorage.setViewingRequests(updated);

    return newRequest;
  }

  public async updateViewingRequestStatus(
    input: UpdateViewingStatusInput
  ): Promise<ViewingRequest> {
    if (!VALID_VIEWING_STATUSES.includes(input.status)) {
      throw new ServiceError(`Invalid viewing status: ${input.status}`, 'VALIDATION_ERROR', 400);
    }

    const existing = mockStorage.getViewingRequests();
    const index = existing.findIndex(v => v.id === input.requestId);
    if (index === -1) {
      throw new ServiceError(`Viewing request "${input.requestId}" not found.`, 'NOT_FOUND', 404);
    }

    const updatedRequest: ViewingRequest = {
      ...existing[index],
      status: input.status,
      assignedAgentName: input.assignedAgentName ?? existing[index].assignedAgentName
    };

    const nextList = [...existing];
    nextList[index] = updatedRequest;
    mockStorage.setViewingRequests(nextList);

    return updatedRequest;
  }
}

export const viewingService: IViewingService = new ViewingService();
