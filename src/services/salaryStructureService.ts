/**
 * Salary Structure Service
 * Handles all salary structure-related operations
 */
import apiService from './api';

const ENTITY_TYPE = 'salaryStructures';

interface SalaryStructureData {
  name: string;
  description?: string;
  basicSalary: number;
  allowances: {
    name: string;
    amount: number;
    type: 'fixed' | 'percentage';
  }[];
  deductions: {
    name: string;
    amount: number;
    type: 'fixed' | 'percentage';
  }[];
  taxRate?: number;
  ssnitRate?: number;
  status?: string;
  [key: string]: any;
}

const salaryStructureService = {
  /**
   * Get all salary structures
   */
  async getAll(): Promise<(SalaryStructureData & { id: string })[]> {
    return await apiService.getAll<SalaryStructureData & { id: string }>(ENTITY_TYPE);
  },

  /**
   * Get salary structure by ID
   */
  async getById(id: string): Promise<SalaryStructureData & { id: string }> {
    return await apiService.getById<SalaryStructureData & { id: string }>(ENTITY_TYPE, id);
  },

  /**
   * Create a new salary structure
   */
  async create(structureData: SalaryStructureData): Promise<SalaryStructureData & { id: string }> {
    if (!structureData.name) {
      throw new Error('Structure name is required');
    }
    if (!structureData.basicSalary || structureData.basicSalary <= 0) {
      throw new Error('Basic salary must be greater than zero');
    }

    if (!structureData.allowances) {
      structureData.allowances = [];
    }
    if (!structureData.deductions) {
      structureData.deductions = [];
    }
    if (!structureData.status) {
      structureData.status = 'active';
    }
    if (!structureData.taxRate) {
      structureData.taxRate = 0;
    }
    if (!structureData.ssnitRate) {
      structureData.ssnitRate = 5.5; // Default SSNIT rate in Ghana
    }

    return await apiService.create<SalaryStructureData & { id: string }>(ENTITY_TYPE, structureData);
  },

  /**
   * Update a salary structure
   */
  async update(id: string, structureData: Partial<SalaryStructureData>): Promise<SalaryStructureData & { id: string }> {
    return await apiService.update<SalaryStructureData & { id: string }>(ENTITY_TYPE, id, structureData);
  },

  /**
   * Delete a salary structure
   */
  async delete(id: string): Promise<void> {
    await apiService.delete(ENTITY_TYPE, id);
  },

  /**
   * Get active salary structures
   */
  async getActive(): Promise<(SalaryStructureData & { id: string })[]> {
    return await apiService.query<SalaryStructureData & { id: string }>(
      ENTITY_TYPE,
      (structure: SalaryStructureData & { id: string }) => structure.status === 'active'
    );
  },

  /**
   * Calculate gross salary for a structure
   */
  calculateGrossSalary(structure: SalaryStructureData): number {
    let gross = structure.basicSalary;
    
    structure.allowances.forEach(allowance => {
      if (allowance.type === 'fixed') {
        gross += allowance.amount;
      } else if (allowance.type === 'percentage') {
        gross += (structure.basicSalary * allowance.amount) / 100;
      }
    });

    return gross;
  },

  /**
   * Calculate net salary for a structure
   */
  calculateNetSalary(structure: SalaryStructureData): number {
    const gross = this.calculateGrossSalary(structure);
    let deductions = 0;

    // Add tax
    if (structure.taxRate) {
      deductions += (gross * structure.taxRate) / 100;
    }

    // Add SSNIT
    if (structure.ssnitRate) {
      deductions += (gross * structure.ssnitRate) / 100;
    }

    // Add other deductions
    structure.deductions.forEach(deduction => {
      if (deduction.type === 'fixed') {
        deductions += deduction.amount;
      } else if (deduction.type === 'percentage') {
        deductions += (gross * deduction.amount) / 100;
      }
    });

    return gross - deductions;
  }
};

export default salaryStructureService;

