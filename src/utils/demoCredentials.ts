/**
 * Demo Credentials Utility
 * Generates and manages demo login credentials for testing purposes
 */

import staffService from '../services/staffService';
import studentsService from '../services/studentsService';

export interface DemoCredential {
  username: string;
  password: string;
  userType: 'administrator' | 'staff' | 'student';
  name?: string;
  role?: string;
}

/**
 * Sets demo passwords for all existing staff members
 * Uses predictable passwords for easy demo access
 */
export const setDemoStaffPasswords = async (): Promise<DemoCredential[]> => {
  try {
    const allStaff = await staffService.getAll();
    const credentials: DemoCredential[] = [];

    for (let i = 0; i < allStaff.length; i++) {
      const staff = allStaff[i];
      // Use simple password: STAFF + index (e.g., STAFF001, STAFF002)
      const password = `STAFF${String(i + 1).padStart(3, '0')}`;
      
      await staffService.update(staff.id!, { password });
      
      credentials.push({
        username: staff.staffId || staff.id || '',
        password,
        userType: (staff.userType || 'staff') as 'staff',
        name: `${staff.firstName} ${staff.surname}`,
        role: staff.position || staff.category || 'Staff'
      });
    }

    return credentials;
  } catch (error) {
    throw error;
  }
};

/**
 * Sets demo passwords for all existing students
 * Uses predictable passwords for easy demo access
 */
export const setDemoStudentPasswords = async (): Promise<DemoCredential[]> => {
  try {
    const allStudents = await studentsService.getAll();
    const credentials: DemoCredential[] = [];

    for (let i = 0; i < allStudents.length; i++) {
      const student = allStudents[i];
      // Use simple password: STUDENT + index (e.g., STUDENT001, STUDENT002)
      const password = `STU${String(i + 1).padStart(3, '0')}`;
      
      await studentsService.update(student.id!, { password });
      
      credentials.push({
        username: student.studentId || student.id || '',
        password,
        userType: 'student',
        name: `${student.firstName} ${student.surname}`,
        role: 'Student'
      });
    }

    return credentials;
  } catch (error) {
    throw error;
  }
};

/**
 * Sets demo passwords for all staff and students
 */
export const setAllDemoPasswords = async (): Promise<{
  staff: DemoCredential[];
  students: DemoCredential[];
}> => {
  const [staff, students] = await Promise.all([
    setDemoStaffPasswords(),
    setDemoStudentPasswords()
  ]);

  return { staff, students };
};

/**
 * Get demo credentials for first 5 staff and students
 * Useful for quick demo access
 */
export const getQuickDemoCredentials = async (): Promise<{
  staff: DemoCredential[];
  students: DemoCredential[];
}> => {
  const allStaff = await staffService.getAll();
  const allStudents = await studentsService.getAll();

  const staff = allStaff.slice(0, 5).map((s, i) => ({
    username: s.staffId || s.id || '',
    password: s.password || `STAFF${String(i + 1).padStart(3, '0')}`,
    userType: (s.userType || 'staff') as 'staff',
    name: `${s.firstName} ${s.surname}`,
    role: s.position || s.category || 'Staff'
  }));

  const students = allStudents.slice(0, 5).map((s, i) => ({
    username: s.studentId || s.id || '',
    password: s.password || `STU${String(i + 1).padStart(3, '0')}`,
    userType: 'student' as const,
    name: `${s.firstName} ${s.surname}`,
    role: 'Student'
  }));

  return { staff, students };
};

/**
 * Administrator demo credentials
 */
export const ADMIN_CREDENTIALS: DemoCredential = {
  username: 'DTeye',
  password: '12345',
  userType: 'administrator',
  name: 'Administrator',
  role: 'Administrator'
};
