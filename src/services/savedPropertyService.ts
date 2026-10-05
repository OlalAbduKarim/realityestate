import { ISavedPropertyService, ServiceError } from '../types/api';
import { Property } from '../types/property';
import { mockStorage } from '../mocks/mockStorage';

class SavedPropertyService implements ISavedPropertyService {
  public async getSavedPropertyIds(_userId?: string): Promise<string[]> {
    return mockStorage.getSavedPropertyIds();
  }

  public async getSavedProperties(_userId?: string): Promise<Property[]> {
    const savedIds = mockStorage.getSavedPropertyIds();
    const properties = mockStorage.getProperties();
    return properties.filter(p => savedIds.includes(p.id));
  }

  public async saveProperty(propertyId: string, _userId?: string): Promise<string[]> {
    if (!propertyId) {
      throw new ServiceError('Property ID is required to save a listing.', 'VALIDATION_ERROR', 400);
    }
    const current = mockStorage.getSavedPropertyIds();
    if (current.includes(propertyId)) {
      return current;
    }
    const next = [...current, propertyId];
    mockStorage.setSavedPropertyIds(next);
    return next;
  }

  public async removeSavedProperty(propertyId: string, _userId?: string): Promise<string[]> {
    const current = mockStorage.getSavedPropertyIds();
    const next = current.filter(id => id !== propertyId);
    mockStorage.setSavedPropertyIds(next);
    return next;
  }

  public async toggleSavedProperty(
    propertyId: string,
    _userId?: string
  ): Promise<{ savedIds: string[]; isSaved: boolean }> {
    if (!propertyId) {
      throw new ServiceError('Property ID is required.', 'VALIDATION_ERROR', 400);
    }
    const current = mockStorage.getSavedPropertyIds();
    const exists = current.includes(propertyId);
    const savedIds = exists
      ? current.filter(id => id !== propertyId)
      : [...current, propertyId];

    mockStorage.setSavedPropertyIds(savedIds);
    return {
      savedIds,
      isSaved: !exists
    };
  }

  public async clearSavedProperties(_userId?: string): Promise<string[]> {
    mockStorage.setSavedPropertyIds([]);
    return [];
  }
}

export const savedPropertyService: ISavedPropertyService = new SavedPropertyService();
