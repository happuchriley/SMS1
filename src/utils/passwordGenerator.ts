/**
 * Password Generator Utility
 * Generates secure random passwords for staff registration
 */

/**
 * Generates a random password with a mix of uppercase, lowercase, numbers, and special characters
 * @param length - Length of the password (default: 8)
 * @returns Generated password string
 */
export const generatePassword = (length: number = 8): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%&*';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  // Ensure at least one character from each set
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to avoid predictable pattern
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Generates a simple numeric password (for easier initial login)
 * @param length - Length of the password (default: 6)
 * @returns Generated numeric password string
 */
export const generateNumericPassword = (length: number = 6): string => {
  const numbers = '0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += numbers[Math.floor(Math.random() * numbers.length)];
  }
  return password;
};

/**
 * Determines user role based on staff category
 * @param category - Staff category (Administrator, Teacher, Support Staff, Security)
 * @returns User role (administrator or staff)
 */
export const getRoleFromCategory = (category: string): string => {
  const normalizedCategory = (category || '').toLowerCase().trim();
  
  if (normalizedCategory === 'administrator' || normalizedCategory === 'admin') {
    return 'administrator';
  }
  
  // All other categories (Teacher, Support Staff, Security) are staff
  return 'staff';
};
