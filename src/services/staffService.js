/**
 * Staff Service
 * Handles all staff-related API operations
 */
import apiService from './api';

const ENTITY_TYPE = 'staff';

const staffService = {
  /**
   * Get all staff
   */
  async getAll() {
    return await apiService.getAll(ENTITY_TYPE);
  },

  /**
   * Get staff by ID
   */
  async getById(id) {
    return await apiService.getById(ENTITY_TYPE, id);
  },

  /**
   * Create a new staff member
   */
  async create(staffData) {
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

    return await apiService.create(ENTITY_TYPE, staffData);
  },

  /**
   * Update a staff member
   */
  async update(id, staffData) {
    return await apiService.update(ENTITY_TYPE, id, staffData);
  },

  /**
   * Delete a staff member
   */
  async delete(id) {
    return await apiService.delete(ENTITY_TYPE, id);
  },

  /**
   * Get active staff
   */
  async getActive() {
    return await apiService.query(ENTITY_TYPE, staff => staff.status === 'active');
  },

  /**
   * Get inactive staff
   */
  async getInactive() {
    return await apiService.query(ENTITY_TYPE, staff => staff.status === 'inactive');
  },

  /**
   * Get new staff
   */
  async getNew() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return await apiService.query(ENTITY_TYPE, staff => {
      if (!staff.employmentDate) return false;
      const employmentDate = new Date(staff.employmentDate);
      return employmentDate >= thirtyDaysAgo && staff.status === 'active';
    });
  },

  /**
   * Search staff
   */
  async search(searchTerm) {
    const term = searchTerm.toLowerCase();
    return await apiService.query(ENTITY_TYPE, staff => {
      const fullName = `${staff.firstName || ''} ${staff.surname || ''} ${staff.otherNames || ''}`.toLowerCase();
      const staffId = (staff.staffId || '').toLowerCase();
      return fullName.includes(term) || 
             staffId.includes(term) ||
             (staff.email && staff.email.toLowerCase().includes(term)) ||
             (staff.contact && staff.contact.includes(term)) ||
             (staff.position && staff.position.toLowerCase().includes(term));
    });
  },

  /**
   * Get staff by position
   */
  async getByPosition(position) {
    return await apiService.query(ENTITY_TYPE, staff => staff.position === position);
  },

  /**
   * Get staff by department
   */
  async getByDepartment(department) {
    return await apiService.query(ENTITY_TYPE, staff => staff.department === department);
  },

  /**
   * Update staff status
   */
  async updateStatus(id, status) {
    return await this.update(id, { status });
  },

  /**
   * Get staff count
   */
  async count(condition = null) {
    return await apiService.count(ENTITY_TYPE, condition);
  }
};

export default staffService;

