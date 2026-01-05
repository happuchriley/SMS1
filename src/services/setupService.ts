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

interface SchoolInfoData {
  [key: string]: any;
}

interface SystemSettingsData {
  [key: string]: any;
}

interface AcademicSettingsData {
  [key: string]: any;
}

interface ClassData {
  name: string;
  code: string;
  [key: string]: any;
}

interface SubjectData {
  name: string;
  code: string;
  [key: string]: any;
}

export interface BillItemData {
  id?: string;
  code?: string;
  name: string;
  type?: string;
  amount: number;
  taxable?: boolean;
  active?: boolean;
  [key: string]: any;
}

interface ItemSetupData {
  name: string;
  [key: string]: any;
}

const setupService = {
  // School Information
  async getSchoolInfo(): Promise<SchoolInfoData | null> {
    const info = await apiService.getAll<SchoolInfoData>(SCHOOL_INFO_TYPE);
    return info.length > 0 ? info[0] : null;
  },

  async updateSchoolInfo(infoData: Partial<SchoolInfoData>): Promise<SchoolInfoData> {
    const existing = await this.getSchoolInfo();
    if (existing) {
      return await apiService.update<SchoolInfoData>(SCHOOL_INFO_TYPE, existing.id, infoData);
    } else {
      return await apiService.create<SchoolInfoData>(SCHOOL_INFO_TYPE, infoData);
    }
  },

  // System Settings
  async getSystemSettings(): Promise<SystemSettingsData | null> {
    const settings = await apiService.getAll<SystemSettingsData>(SYSTEM_SETTINGS_TYPE);
    return settings.length > 0 ? settings[0] : null;
  },

  async updateSystemSettings(settingsData: Partial<SystemSettingsData>): Promise<SystemSettingsData> {
    const existing = await this.getSystemSettings();
    if (existing) {
      return await apiService.update<SystemSettingsData>(SYSTEM_SETTINGS_TYPE, existing.id, settingsData);
    } else {
      return await apiService.create<SystemSettingsData>(SYSTEM_SETTINGS_TYPE, settingsData);
    }
  },

  // Academic Settings
  async getAcademicSettings(): Promise<AcademicSettingsData | null> {
    const settings = await apiService.getAll<AcademicSettingsData>(ACADEMIC_SETTINGS_TYPE);
    return settings.length > 0 ? settings[0] : null;
  },

  async updateAcademicSettings(settingsData: Partial<AcademicSettingsData>): Promise<AcademicSettingsData> {
    const existing = await this.getAcademicSettings();
    if (existing) {
      return await apiService.update<AcademicSettingsData>(ACADEMIC_SETTINGS_TYPE, existing.id, settingsData);
    } else {
      return await apiService.create<AcademicSettingsData>(ACADEMIC_SETTINGS_TYPE, settingsData);
    }
  },

  // Classes Management
  async getAllClasses(): Promise<ClassData[]> {
    return await apiService.getAll<ClassData>(CLASSES_TYPE);
  },

  async getClassById(id: string): Promise<ClassData> {
    return await apiService.getById<ClassData>(CLASSES_TYPE, id);
  },

  async createClass(classData: ClassData): Promise<ClassData> {
    if (!classData.name || !classData.code) {
      throw new Error('Class name and code are required');
    }

    // Check for duplicate code
    const existing = await apiService.findOne<ClassData>(CLASSES_TYPE, (c: ClassData) => c.code === classData.code);
    if (existing) {
      throw new Error('Class with this code already exists');
    }

    return await apiService.create<ClassData>(CLASSES_TYPE, classData);
  },

  async updateClass(id: string, classData: Partial<ClassData>): Promise<ClassData> {
    return await apiService.update<ClassData>(CLASSES_TYPE, id, classData);
  },

  async deleteClass(id: string): Promise<void> {
    await apiService.delete(CLASSES_TYPE, id);
  },

  // Subjects Management
  async getAllSubjects(): Promise<SubjectData[]> {
    return await apiService.getAll<SubjectData>(SUBJECTS_TYPE);
  },

  async getSubjectById(id: string): Promise<SubjectData> {
    return await apiService.getById<SubjectData>(SUBJECTS_TYPE, id);
  },

  async createSubject(subjectData: SubjectData): Promise<SubjectData> {
    if (!subjectData.name || !subjectData.code) {
      throw new Error('Subject name and code are required');
    }

    // Check for duplicate code
    const existing = await apiService.findOne<SubjectData>(SUBJECTS_TYPE, (s: SubjectData) => s.code === subjectData.code);
    if (existing) {
      throw new Error('Subject with this code already exists');
    }

    return await apiService.create<SubjectData>(SUBJECTS_TYPE, subjectData);
  },

  async updateSubject(id: string, subjectData: Partial<SubjectData>): Promise<SubjectData> {
    return await apiService.update<SubjectData>(SUBJECTS_TYPE, id, subjectData);
  },

  async deleteSubject(id: string): Promise<void> {
    await apiService.delete(SUBJECTS_TYPE, id);
  },

  // Bill Items Management
  async getAllBillItems(): Promise<BillItemData[]> {
    return await apiService.getAll<BillItemData>(BILL_ITEMS_TYPE);
  },

  async getBillItemById(id: string): Promise<BillItemData> {
    return await apiService.getById<BillItemData>(BILL_ITEMS_TYPE, id);
  },

  async createBillItem(itemData: BillItemData): Promise<BillItemData> {
    if (!itemData.name) {
      throw new Error('Bill item name is required');
    }
    if (!itemData.amount || itemData.amount <= 0) {
      throw new Error('Bill item amount must be greater than zero');
    }

    return await apiService.create<BillItemData>(BILL_ITEMS_TYPE, itemData);
  },

  async updateBillItem(id: string, itemData: Partial<BillItemData>): Promise<BillItemData> {
    return await apiService.update<BillItemData>(BILL_ITEMS_TYPE, id, itemData);
  },

  async deleteBillItem(id: string): Promise<void> {
    await apiService.delete(BILL_ITEMS_TYPE, id);
  },

  // Item Setup
  async getAllItemSetup(): Promise<ItemSetupData[]> {
    return await apiService.getAll<ItemSetupData>(ITEM_SETUP_TYPE);
  },

  async getItemSetupById(id: string): Promise<ItemSetupData> {
    return await apiService.getById<ItemSetupData>(ITEM_SETUP_TYPE, id);
  },

  async createItemSetup(itemData: ItemSetupData): Promise<ItemSetupData> {
    if (!itemData.name) {
      throw new Error('Item name is required');
    }
    return await apiService.create<ItemSetupData>(ITEM_SETUP_TYPE, itemData);
  },

  async updateItemSetup(id: string, itemData: Partial<ItemSetupData>): Promise<ItemSetupData> {
    return await apiService.update<ItemSetupData>(ITEM_SETUP_TYPE, id, itemData);
  },

  async deleteItemSetup(id: string): Promise<void> {
    await apiService.delete(ITEM_SETUP_TYPE, id);
  }
};

export default setupService;

