/**
 * Utility to generate passwords for existing staff and students that don't have passwords
 * This is a one-time migration function
 */

import staffService from '../services/staffService';
import studentsService from '../services/studentsService';

/**
 * Generate passwords for all existing staff that don't have passwords
 */
export const generatePasswordsForExistingStaff = async (): Promise<number> => {
  try {
    const allStaff = await staffService.getAll();
    let count = 0;

    for (const staff of allStaff) {
      if (!staff.password && staff.staffId) {
        // Use staffId as password for easy demo access
        await staffService.update(staff.id!, { password: staff.staffId });
        count++;
      }
    }

    return count;
  } catch (error) {
    throw error;
  }
};

/**
 * Generate passwords for all existing students that don't have passwords
 */
export const generatePasswordsForExistingStudents = async (): Promise<number> => {
  try {
    const allStudents = await studentsService.getAll();
    let count = 0;

    for (const student of allStudents) {
      if (!student.password && student.studentId) {
        // Use studentId as password for easy demo access
        await studentsService.update(student.id!, { password: student.studentId });
        count++;
      }
    }

    return count;
  } catch (error) {
    throw error;
  }
};

/**
 * Generate passwords for all existing staff and students
 */
export const generatePasswordsForAllExisting = async (): Promise<{
  staffCount: number;
  studentCount: number;
}> => {
  const [staffCount, studentCount] = await Promise.all([
    generatePasswordsForExistingStaff(),
    generatePasswordsForExistingStudents()
  ]);

  return { staffCount, studentCount };
};
