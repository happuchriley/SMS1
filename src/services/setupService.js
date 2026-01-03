/**
 * Setup Service
 * Handles school setup and configuration
 */
import apiService from './api';

const SCHOOL_INFO_TYPE = 'schoolInfo';
const SYSTEM_SETTINGS_TYPE = 'systemSettings';
const ACADEMIC_SETTINGS_TYPE = 'academicSettings';
const CLASSES_TYPE = 'classes';
const SUBJECTS_TYPE = 'subjects';
const BILL_ITEMS_TYPE = 'billItems';
const ITEM_SETUP_TYPE = 'itemSetup';

const setupService = {
  // School Information
  async getSchoolInfo() {
    const info = await apiService.getAll(SCHOOL_INFO_TYPE);
    return info.length > 0 ? info[0] : null;
  },

  async updateSchoolInfo(infoData) {
    const existing = await this.getSchoolInfo();
    if (existing) {
      return await apiService.update(existing.id, infoData);
    } else {
      return await apiService.create(SCHOOL_INFO_TYPE, infoData);
    }
  },

  // System Settings
  async getSystemSettings() {
    const settings = await apiService.getAll(SYSTEM_SETTINGS_TYPE);
    return settings.length > 0 ? settings[0] : null;
  },

  async updateSystemSettings(settingsData) {
    const existing = await this.getSystemSettings();
    if (existing) {
      return await apiService.update(existing.id, settingsData);
    } else {
      return await apiService.create(SYSTEM_SETTINGS_TYPE, settingsData);
    }
  },

  // Academic Settings
  async getAcademicSettings() {
    const settings = await apiService.getAll(ACADEMIC_SETTINGS_TYPE);
    return settings.length > 0 ? settings[0] : null;
  },

  async updateAcademicSettings(settingsData) {
    const existing = await this.getAcademicSettings();
    if (existing) {
      return await apiService.update(existing.id, settingsData);
    } else {
      return await apiService.create(ACADEMIC_SETTINGS_TYPE, settingsData);
    }
  },

  // Classes Management
  async getAllClasses() {
    return await apiService.getAll(CLASSES_TYPE);
  },

  async getClassById(id) {
    return await apiService.getById(CLASSES_TYPE, id);
  },

  async createClass(classData) {
    if (!classData.name || !classData.code) {
      throw new Error('Class name and code are required');
    }

    // Check for duplicate code
    const existing = await apiService.findOne(CLASSES_TYPE, c => c.code === classData.code);
    if (existing) {
      throw new Error('Class with this code already exists');
    }

    return await apiService.create(CLASSES_TYPE, classData);
  },

  async updateClass(id, classData) {
    return await apiService.update(CLASSES_TYPE, id, classData);
  },

  async deleteClass(id) {
    return await apiService.delete(CLASSES_TYPE, id);
  },

  // Subjects Management
  async getAllSubjects() {
    return await apiService.getAll(SUBJECTS_TYPE);
  },

  async getSubjectById(id) {
    return await apiService.getById(SUBJECTS_TYPE, id);
  },

  async createSubject(subjectData) {
    if (!subjectData.name || !subjectData.code) {
      throw new Error('Subject name and code are required');
    }

    // Check for duplicate code
    const existing = await apiService.findOne(SUBJECTS_TYPE, s => s.code === subjectData.code);
    if (existing) {
      throw new Error('Subject with this code already exists');
    }

    return await apiService.create(SUBJECTS_TYPE, subjectData);
  },

  async updateSubject(id, subjectData) {
    return await apiService.update(SUBJECTS_TYPE, id, subjectData);
  },

  async deleteSubject(id) {
    return await apiService.delete(SUBJECTS_TYPE, id);
  },

  // Bill Items Management
  async getAllBillItems() {
    return await apiService.getAll(BILL_ITEMS_TYPE);
  },

  async getBillItemById(id) {
    return await apiService.getById(BILL_ITEMS_TYPE, id);
  },

  async createBillItem(itemData) {
    if (!itemData.name) {
      throw new Error('Bill item name is required');
    }
    if (!itemData.amount || itemData.amount <= 0) {
      throw new Error('Bill item amount must be greater than zero');
    }

    return await apiService.create(BILL_ITEMS_TYPE, itemData);
  },

  async updateBillItem(id, itemData) {
    return await apiService.update(BILL_ITEMS_TYPE, id, itemData);
  },

  async deleteBillItem(id) {
    return await apiService.delete(BILL_ITEMS_TYPE, id);
  },

  // Item Setup
  async getAllItemSetup() {
    return await apiService.getAll(ITEM_SETUP_TYPE);
  },

  async getItemSetupById(id) {
    return await apiService.getById(ITEM_SETUP_TYPE, id);
  },

  async createItemSetup(itemData) {
    if (!itemData.name) {
      throw new Error('Item name is required');
    }
    return await apiService.create(ITEM_SETUP_TYPE, itemData);
  },

  async updateItemSetup(id, itemData) {
    return await apiService.update(ITEM_SETUP_TYPE, id, itemData);
  },

  async deleteItemSetup(id) {
    return await apiService.delete(ITEM_SETUP_TYPE, id);
  }
};

export default setupService;

