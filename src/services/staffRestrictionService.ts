/**
 * Staff Restriction Service
 * Handles all staff restriction-related operations
 */
import apiService from './api';

const ENTITY_TYPE = 'staffRestrictions';

interface StaffRestrictionData {
  staffId: string;
  restrictionType: string;
  reason: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  notes?: string;
  [key: string]: any;
}

const staffRestrictionService = {
  /**
   * Get all restrictions
   */
  async getAll(): Promise<(StaffRestrictionData & { id: string })[]> {
    return await apiService.getAll<StaffRestrictionData & { id: string }>(ENTITY_TYPE);
  },

  /**
   * Get restriction by ID
   */
  async getById(id: string): Promise<StaffRestrictionData & { id: string }> {
    return await apiService.getById<StaffRestrictionData & { id: string }>(ENTITY_TYPE, id);
  },

  /**
   * Create a new restriction
   */
  async create(restrictionData: StaffRestrictionData): Promise<StaffRestrictionData & { id: string }> {
    if (!restrictionData.staffId) {
      throw new Error('Staff ID is required');
    }
    if (!restrictionData.restrictionType) {
      throw new Error('Restriction type is required');
    }
    if (!restrictionData.reason) {
      throw new Error('Reason is required');
    }

    if (!restrictionData.status) {
      restrictionData.status = 'active';
    }

    return await apiService.create<StaffRestrictionData & { id: string }>(ENTITY_TYPE, restrictionData);
  },

  /**
   * Update a restriction
   */
  async update(id: string, restrictionData: Partial<StaffRestrictionData>): Promise<StaffRestrictionData & { id: string }> {
    return await apiService.update<StaffRestrictionData & { id: string }>(ENTITY_TYPE, id, restrictionData);
  },

  /**
   * Delete a restriction
   */
  async delete(id: string): Promise<void> {
    await apiService.delete(ENTITY_TYPE, id);
  },

  /**
   * Get restrictions by staff ID
   */
  async getByStaff(staffId: string): Promise<(StaffRestrictionData & { id: string })[]> {
    return await apiService.query<StaffRestrictionData & { id: string }>(
      ENTITY_TYPE,
      (restriction: StaffRestrictionData & { id: string }) => restriction.staffId === staffId
    );
  },

  /**
   * Get active restrictions
   */
  async getActive(): Promise<(StaffRestrictionData & { id: string })[]> {
    return await apiService.query<StaffRestrictionData & { id: string }>(
      ENTITY_TYPE,
      (restriction: StaffRestrictionData & { id: string }) => restriction.status === 'active'
    );
  }
};

export default staffRestrictionService;

