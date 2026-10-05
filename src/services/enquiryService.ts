import {
  CreateEnquiryInput,
  IEnquiryService,
  ServiceError,
  UpdateEnquiryStatusInput
} from '../types/api';
import { Enquiry, EnquiryStatus } from '../types/property';
import { mockStorage } from '../mocks/mockStorage';

const VALID_ENQUIRY_STATUSES: EnquiryStatus[] = [
  'New',
  'Replied',
  'Archived',
  'Contacted',
  'Viewing Scheduled',
  'Offer Made',
  'Closed',
  'Lost'
];

class EnquiryService implements IEnquiryService {
  public async getEnquiries(_userId?: string): Promise<Enquiry[]> {
    return mockStorage.getEnquiries();
  }

  public async createEnquiry(input: CreateEnquiryInput): Promise<Enquiry> {
    const propertyId = (input.propertyId || '').trim();
    const customerName = (input.customerName || '').trim();
    const customerPhone = (input.customerPhone || '').trim();
    const message = (input.message || '').trim();
    const customerEmail = input.customerEmail?.trim() || undefined;

    if (!propertyId) {
      throw new ServiceError('Property reference is required for an enquiry.', 'VALIDATION_ERROR', 400);
    }
    if (!customerName) {
      throw new ServiceError('Please provide your full name.', 'VALIDATION_ERROR', 400, {
        customerName: 'Name is required'
      });
    }
    if (!customerPhone || customerPhone.replace(/\D/g, '').length < 7) {
      throw new ServiceError('Please provide a valid contact phone number.', 'VALIDATION_ERROR', 400, {
        customerPhone: 'Valid phone number is required'
      });
    }
    if (!message) {
      throw new ServiceError('Please enter a message for the property representative.', 'VALIDATION_ERROR', 400, {
        message: 'Message cannot be empty'
      });
    }
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      throw new ServiceError('Please enter a valid email address or leave it blank.', 'VALIDATION_ERROR', 400, {
        customerEmail: 'Invalid email format'
      });
    }

    const newEnquiry: Enquiry = {
      id: `enq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      propertyId,
      propertyTitle: (input.propertyTitle || 'Property Listing').trim(),
      propertyImage: input.propertyImage || '',
      propertyPrice: Number(input.propertyPrice) || 0,
      propertyLocation: (input.propertyLocation || 'Uganda').trim(),
      customerName,
      customerEmail,
      customerPhone,
      subject: input.subject?.trim() || undefined,
      message,
      date: new Date().toISOString().split('T')[0],
      status: 'New',
      assignedRep: 'Grace Achieng'
    };

    const existing = mockStorage.getEnquiries();
    const updated = [newEnquiry, ...existing];
    mockStorage.setEnquiries(updated);

    return newEnquiry;
  }

  public async updateEnquiryStatus(input: UpdateEnquiryStatusInput): Promise<Enquiry> {
    if (!VALID_ENQUIRY_STATUSES.includes(input.status)) {
      throw new ServiceError(`Invalid enquiry status: ${input.status}`, 'VALIDATION_ERROR', 400);
    }

    const existing = mockStorage.getEnquiries();
    const index = existing.findIndex(e => e.id === input.enquiryId);
    if (index === -1) {
      throw new ServiceError(`Enquiry "${input.enquiryId}" not found.`, 'NOT_FOUND', 404);
    }

    const updatedEnquiry: Enquiry = {
      ...existing[index],
      status: input.status,
      notes: input.notes !== undefined ? input.notes : existing[index].notes
    };

    const nextList = [...existing];
    nextList[index] = updatedEnquiry;
    mockStorage.setEnquiries(nextList);

    return updatedEnquiry;
  }
}

export const enquiryService: IEnquiryService = new EnquiryService();
