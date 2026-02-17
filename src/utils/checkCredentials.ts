/**
 * Utility to check and display available login credentials
 */

import staffService from '../services/staffService';
import studentsService from '../services/studentsService';

export interface AvailableCredential {
  username: string;
  password: string;
  userType: 'staff' | 'student';
  name: string;
  hasPassword: boolean;
}

/**
 * Get available staff credentials (first 5)
 */
export const getAvailableStaffCredentials = async (): Promise<AvailableCredential[]> => {
  try {
    const allStaff = await staffService.getAll();
    return allStaff.slice(0, 5).map((staff, index) => ({
      username: staff.staffId || staff.id || '',
      password: staff.password || `STAFF${String(index + 1).padStart(3, '0')}`,
      userType: 'staff' as const,
      name: `${staff.firstName} ${staff.surname}`,
      hasPassword: !!staff.password
    }));
  } catch (error) {
    return [];
  }
};

/**
 * Get available student credentials (first 5)
 */
export const getAvailableStudentCredentials = async (): Promise<AvailableCredential[]> => {
  try {
    const allStudents = await studentsService.getAll();
    return allStudents.slice(0, 5).map((student, index) => ({
      username: student.studentId || student.id || '',
      password: student.password || `STU${String(index + 1).padStart(3, '0')}`,
      userType: 'student' as const,
      name: `${student.firstName} ${student.surname}`,
      hasPassword: !!student.password
    }));
  } catch (error) {
    return [];
  }
};

/**
 * Get all available credentials
 */
export const getAllAvailableCredentials = async (): Promise<{
  staff: AvailableCredential[];
  students: AvailableCredential[];
}> => {
  const [staff, students] = await Promise.all([
    getAvailableStaffCredentials(),
    getAvailableStudentCredentials()
  ]);

  return { staff, students };
};

