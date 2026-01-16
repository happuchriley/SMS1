/**
 * Staff Service
 * Handles all staff-related API operations
 */
import apiService from './api';
import { generatePassword, getRoleFromCategory } from '../utils/passwordGenerator';

const ENTITY_TYPE = 'staff';

interface StaffData {
  firstName: string;
  surname: string;
  staffId?: string;
  status?: string;
  position?: string;
  department?: string;
  otherNames?: string;
  email?: string;
  contact?: string;
  employmentDate?: string;
  password?: string;
  userType?: string;
  category?: string;
  [key: string]: any;
}

const staffService = {
  /**
   * Get all staff
   */
  async getAll(): Promise<StaffData[]> {
    return await apiService.getAll<StaffData>(ENTITY_TYPE);
  },

  /**
   * Get staff by ID
   */
  async getById(id: string): Promise<StaffData> {
    return await apiService.getById<StaffData>(ENTITY_TYPE, id);
  },

  /**
   * Create a new staff member
   */
  async create(staffData: StaffData): Promise<StaffData> {
    // Validate required fields
    if (!staffData.firstName || !staffData.surname) {
      throw new Error('First name and surname are required');
    }

    // Generate staff ID if not provided
    if (!staffData.staffId) {
      const count = await apiService.count(ENTITY_TYPE);
      staffData.staffId = `STAFF${String(count + 1).padStart(4, '0')}`;
    }

    // Set default status
    if (!staffData.status) {
      staffData.status = 'active';
    }

    // Generate password if not provided
    if (!staffData.password) {
      staffData.password = generatePassword(8);
    }

    // Determine user role based on category
    if (!staffData.userType && staffData.category) {
      staffData.userType = getRoleFromCategory(staffData.category);
    } else if (!staffData.userType) {
      // Default to staff if no category specified
      staffData.userType = 'staff';
    }

    return await apiService.create<StaffData>(ENTITY_TYPE, staffData);
  },

  /**
   * Update a staff member
   */
  async update(id: string, staffData: Partial<StaffData>): Promise<StaffData> {
    return await apiService.update<StaffData>(ENTITY_TYPE, id, staffData);
  },

  /**
   * Delete a staff member
   */
  async delete(id: string): Promise<void> {
    await apiService.delete(ENTITY_TYPE, id);
  },

  /**
   * Get active staff
   */
  async getActive(): Promise<StaffData[]> {
    return await apiService.query<StaffData>(ENTITY_TYPE, (staff: StaffData) => staff.status === 'active');
  },

  /**
   * Get inactive staff
   */
  async getInactive(): Promise<StaffData[]> {
    return await apiService.query<StaffData>(ENTITY_TYPE, (staff: StaffData) => staff.status === 'inactive');
  },

  /**
   * Get new staff
   */
  async getNew(): Promise<StaffData[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return await apiService.query<StaffData>(ENTITY_TYPE, (staff: StaffData) => {
      if (!staff.employmentDate) return false;
      const employmentDate = new Date(staff.employmentDate);
      return employmentDate >= thirtyDaysAgo && staff.status === 'active';
    });
  },

  /**
   * Search staff
   */
  async search(searchTerm: string): Promise<StaffData[]> {
    const term = searchTerm.toLowerCase();
    return await apiService.query<StaffData>(ENTITY_TYPE, (staff: StaffData) => {
      const fullName = `${staff.firstName || ''} ${staff.surname || ''} ${staff.otherNames || ''}`.toLowerCase();
      const staffId = (staff.staffId || '').toLowerCase();
      return Boolean(
        fullName.includes(term) || 
        staffId.includes(term) ||
        (staff.email ? staff.email.toLowerCase().includes(term) : false) ||
        (staff.contact ? staff.contact.includes(term) : false) ||
        (staff.position ? staff.position.toLowerCase().includes(term) : false)
      );
    });
  },

  /**
   * Get staff by position
   */
  async getByPosition(position: string): Promise<StaffData[]> {
    return await apiService.query<StaffData>(ENTITY_TYPE, (staff: StaffData) => staff.position === position);
  },

  /**
   * Get staff by department
   */
  async getByDepartment(department: string): Promise<StaffData[]> {
    return await apiService.query<StaffData>(ENTITY_TYPE, (staff: StaffData) => staff.department === department);
  },

  /**
   * Update staff status
   */
  async updateStatus(id: string, status: string): Promise<StaffData> {
    return await this.update(id, { status });
  },

  /**
   * Get staff count
   */
  async count(condition: ((item: StaffData) => boolean) | null = null): Promise<number> {
    return await apiService.count(ENTITY_TYPE, condition);
  }
};

export default staffService;

