/**
 * Class Restriction Utility
 * Handles class-based access restrictions for staff/teachers
 */

import setupService from '../services/setupService';
import staffService from '../services/staffService';

/**
 * Get all classes assigned to a staff member (where they are the class teacher)
 */
export const getAssignedClasses = async (staffIdOrUsername: string): Promise<string[]> => {
  try {
    const [allClasses, allStaff] = await Promise.all([
      setupService.getAllClasses(),
      staffService.getAll()
    ]);

    // Find the staff member
    const staff = allStaff.find(s => 
      s.staffId === staffIdOrUsername || 
      s.id === staffIdOrUsername ||
      s.email === staffIdOrUsername ||
      `${s.firstName} ${s.surname}` === staffIdOrUsername ||
      `${s.firstName} ${s.surname} ${s.otherNames || ''}`.trim() === staffIdOrUsername
    );

    if (!staff) {
      return [];
    }

    const staffName = `${staff.firstName || ''} ${staff.surname || ''} ${staff.otherNames || ''}`.trim();
    const staffId = staff.staffId || staff.id || '';

    // Find classes where this staff is the class teacher
    const assignedClasses = allClasses
      .filter((cls: any) => {
        const classTeacher = cls.classTeacher || '';
        return (
          classTeacher === staffName ||
          classTeacher === `${staff.firstName} ${staff.surname}` ||
          classTeacher === staffId ||
          classTeacher === staff.id
        );
      })
      .map((cls: any) => cls.name || cls.className)
      .filter(Boolean);

    return assignedClasses;
  } catch (error) {
    console.error('Error getting assigned classes:', error);
    return [];
  }
};

/**
 * Check if a user is an administrator
 */
export const isAdministrator = (): boolean => {
  const userType = sessionStorage.getItem('userType') || '';
  return userType === 'administrator';
};

/**
 * Get classes that a user can access
 * - Administrators: All classes
 * - Staff/Teachers: Only assigned classes
 */
export const getAccessibleClasses = async (): Promise<string[]> => {
  if (isAdministrator()) {
    // Administrators can access all classes
    try {
      const allClasses = await setupService.getAllClasses();
      return allClasses
        .map((cls: any) => cls.name || cls.className)
        .filter(Boolean);
    } catch (error) {
      console.error('Error getting all classes:', error);
      return [];
    }
  } else {
    // Staff/Teachers: Only assigned classes
    const username = sessionStorage.getItem('username') || '';
    return await getAssignedClasses(username);
  }
};

/**
 * Filter students by accessible classes
 */
export const filterStudentsByAccessibleClasses = async <T extends { class?: string }>(
  students: T[]
): Promise<T[]> => {
  if (isAdministrator()) {
    // Administrators can see all students
    return students;
  }

  // Staff/Teachers: Only students in assigned classes
  const accessibleClasses = await getAccessibleClasses();
  if (accessibleClasses.length === 0) {
    // No assigned classes, return empty array
    return [];
  }

  return students.filter(student => 
    student.class && accessibleClasses.includes(student.class)
  );
};

/**
 * Check if a user can access a specific class
 */
export const canAccessClass = async (className: string): Promise<boolean> => {
  if (isAdministrator()) {
    return true;
  }

  const accessibleClasses = await getAccessibleClasses();
  return accessibleClasses.includes(className);
};
