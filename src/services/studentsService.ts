/**
 * Students Service
 * Handles all student-related API operations
 */
import apiService from './api';

const ENTITY_TYPE = 'students';

interface StudentData {
  firstName: string;
  surname: string;
  studentId?: string;
  status?: string;
  class?: string;
  parentId?: string;
  parent?: string;
  otherNames?: string;
  email?: string;
  contact?: string;
  admissionDate?: string;
  [key: string]: any;
}

const studentsService = {
  /**
   * Get all students
   */
  async getAll(): Promise<StudentData[]> {
    return await apiService.getAll<StudentData>(ENTITY_TYPE);
  },

  /**
   * Get student by ID
   */
  async getById(id: string): Promise<StudentData> {
    return await apiService.getById<StudentData>(ENTITY_TYPE, id);
  },

  /**
   * Create a new student
   */
  async create(studentData: StudentData): Promise<StudentData> {
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

    // Generate password if not provided - use student ID as password for easy demo access
    if (!studentData.password) {
      studentData.password = studentData.studentId || `STU${String((await apiService.count(ENTITY_TYPE)) + 1).padStart(4, '0')}`;
    }

    return await apiService.create<StudentData>(ENTITY_TYPE, studentData);
  },

  /**
   * Update a student
   */
  async update(id: string, studentData: Partial<StudentData>): Promise<StudentData> {
    return await apiService.update<StudentData>(ENTITY_TYPE, id, studentData);
  },

  /**
   * Delete a student
   */
  async delete(id: string): Promise<void> {
    await apiService.delete(ENTITY_TYPE, id);
  },

  /**
   * Get active students
   */
  async getActive(): Promise<StudentData[]> {
    return await apiService.query<StudentData>(ENTITY_TYPE, (student: StudentData) => student.status === 'active');
  },

  /**
   * Get inactive students
   */
  async getInactive(): Promise<StudentData[]> {
    return await apiService.query<StudentData>(ENTITY_TYPE, (student: StudentData) => student.status === 'inactive');
  },

  /**
   * Get students by class
   */
  async getByClass(className: string): Promise<StudentData[]> {
    return await apiService.query<StudentData>(ENTITY_TYPE, (student: StudentData) => student.class === className);
  },

  /**
   * Search students
   */
  async search(searchTerm: string): Promise<StudentData[]> {
    const term = searchTerm.toLowerCase();
    return await apiService.query<StudentData>(ENTITY_TYPE, (student: StudentData) => {
      const fullName = `${student.firstName || ''} ${student.surname || ''} ${student.otherNames || ''}`.toLowerCase();
      const studentId = (student.studentId || '').toLowerCase();
      return Boolean(
        fullName.includes(term) || 
        studentId.includes(term) ||
        (student.email ? student.email.toLowerCase().includes(term) : false) ||
        (student.contact ? student.contact.includes(term) : false)
      );
    });
  },

  /**
   * Get fresh/new students
   */
  async getFresh(): Promise<StudentData[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return await apiService.query<StudentData>(ENTITY_TYPE, (student: StudentData) => {
      if (!student.admissionDate) return false;
      const admissionDate = new Date(student.admissionDate);
      return admissionDate >= thirtyDaysAgo && student.status === 'active';
    });
  },

  /**
   * Get students by parent
   */
  async getByParent(parentId: string): Promise<StudentData[]> {
    return await apiService.query<StudentData>(ENTITY_TYPE, (student: StudentData) => 
      student.parentId === parentId || student.parent === parentId
    );
  },

  /**
   * Update student status
   */
  async updateStatus(id: string, status: string): Promise<StudentData> {
    return await this.update(id, { status });
  },

  /**
   * Get student count
   */
  async count(condition: ((item: StudentData) => boolean) | null = null): Promise<number> {
    return await apiService.count(ENTITY_TYPE, condition);
  }
};

export default studentsService;

