/**
 * Students Service
 * Handles all student-related API operations
 */
import apiService from './api';

const ENTITY_TYPE = 'students';

const studentsService = {
  /**
   * Get all students
   */
  async getAll() {
    return await apiService.getAll(ENTITY_TYPE);
  },

  /**
   * Get student by ID
   */
  async getById(id) {
    return await apiService.getById(ENTITY_TYPE, id);
  },

  /**
   * Create a new student
   */
  async create(studentData) {
    // Validate required fields
    if (!studentData.firstName || !studentData.surname) {
      throw new Error('First name and surname are required');
    }

    // Generate student ID if not provided
    if (!studentData.studentId) {
      const count = await apiService.count(ENTITY_TYPE);
      studentData.studentId = `STU${String(count + 1).padStart(4, '0')}`;
    }

    // Set default status
    if (!studentData.status) {
      studentData.status = 'active';
    }

    return await apiService.create(ENTITY_TYPE, studentData);
  },

  /**
   * Update a student
   */
  async update(id, studentData) {
    return await apiService.update(ENTITY_TYPE, id, studentData);
  },

  /**
   * Delete a student
   */
  async delete(id) {
    return await apiService.delete(ENTITY_TYPE, id);
  },

  /**
   * Get active students
   */
  async getActive() {
    return await apiService.query(ENTITY_TYPE, student => student.status === 'active');
  },

  /**
   * Get inactive students
   */
  async getInactive() {
    return await apiService.query(ENTITY_TYPE, student => student.status === 'inactive');
  },

  /**
   * Get students by class
   */
  async getByClass(className) {
    return await apiService.query(ENTITY_TYPE, student => student.class === className);
  },

  /**
   * Search students
   */
  async search(searchTerm) {
    const term = searchTerm.toLowerCase();
    return await apiService.query(ENTITY_TYPE, student => {
      const fullName = `${student.firstName || ''} ${student.surname || ''} ${student.otherNames || ''}`.toLowerCase();
      const studentId = (student.studentId || '').toLowerCase();
      return fullName.includes(term) || 
             studentId.includes(term) ||
             (student.email && student.email.toLowerCase().includes(term)) ||
             (student.contact && student.contact.includes(term));
    });
  },

  /**
   * Get fresh/new students
   */
  async getFresh() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return await apiService.query(ENTITY_TYPE, student => {
      if (!student.admissionDate) return false;
      const admissionDate = new Date(student.admissionDate);
      return admissionDate >= thirtyDaysAgo && student.status === 'active';
    });
  },

  /**
   * Get students by parent
   */
  async getByParent(parentId) {
    return await apiService.query(ENTITY_TYPE, student => 
      student.parentId === parentId || student.parent === parentId
    );
  },

  /**
   * Update student status
   */
  async updateStatus(id, status) {
    return await this.update(id, { status });
  },

  /**
   * Get student count
   */
  async count(condition = null) {
    return await apiService.count(ENTITY_TYPE, condition);
  }
};

export default studentsService;

