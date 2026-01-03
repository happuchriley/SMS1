/**
 * Payroll Service
 * Handles all payroll-related operations
 */
import apiService from './api';

const PAYSLIPS_TYPE = 'payslips';
const PAYROLL_SCHEDULE_TYPE = 'payrollSchedule';
const SALARY_ADVANCES_TYPE = 'salaryAdvances';

const payrollService = {
  // Payslips Operations
  async getAllPayslips() {
    return await apiService.getAll(PAYSLIPS_TYPE);
  },

  async getPayslipById(id) {
    return await apiService.getById(PAYSLIPS_TYPE, id);
  },

  async generatePayslip(payslipData) {
    if (!payslipData.staffId) {
      throw new Error('Staff ID is required');
    }
    if (!payslipData.period) {
      throw new Error('Pay period is required');
    }

    // Generate payslip number
    if (!payslipData.payslipNumber) {
      const count = await apiService.count(PAYSLIPS_TYPE);
      payslipData.payslipNumber = `PAY${String(count + 1).padStart(6, '0')}`;
    }

    // Calculate net pay if not provided
    if (!payslipData.netPay && payslipData.grossPay) {
      const deductions = (payslipData.tax || 0) + 
                        (payslipData.ssnit || 0) + 
                        (payslipData.otherDeductions || 0);
      payslipData.netPay = payslipData.grossPay - deductions;
    }

    return await apiService.create(PAYSLIPS_TYPE, payslipData);
  },

  async updatePayslip(id, payslipData) {
    return await apiService.update(PAYSLIPS_TYPE, id, payslipData);
  },

  async deletePayslip(id) {
    return await apiService.delete(PAYSLIPS_TYPE, id);
  },

  async getPayslipsByStaff(staffId) {
    return await apiService.query(PAYSLIPS_TYPE, payslip => payslip.staffId === staffId);
  },

  async getPayslipsByPeriod(period) {
    return await apiService.query(PAYSLIPS_TYPE, payslip => payslip.period === period);
  },

  // Payroll Schedule Operations
  async getAllSchedules() {
    return await apiService.getAll(PAYROLL_SCHEDULE_TYPE);
  },

  async getScheduleById(id) {
    return await apiService.getById(PAYROLL_SCHEDULE_TYPE, id);
  },

  async createSchedule(scheduleData) {
    return await apiService.create(PAYROLL_SCHEDULE_TYPE, scheduleData);
  },

  async updateSchedule(id, scheduleData) {
    return await apiService.update(PAYROLL_SCHEDULE_TYPE, id, scheduleData);
  },

  async deleteSchedule(id) {
    return await apiService.delete(PAYROLL_SCHEDULE_TYPE, id);
  },

  // Salary Advances Operations
  async getAllAdvances() {
    return await apiService.getAll(SALARY_ADVANCES_TYPE);
  },

  async getAdvanceById(id) {
    return await apiService.getById(SALARY_ADVANCES_TYPE, id);
  },

  async createAdvance(advanceData) {
    if (!advanceData.staffId) {
      throw new Error('Staff ID is required');
    }
    if (!advanceData.amount || advanceData.amount <= 0) {
      throw new Error('Advance amount must be greater than zero');
    }

    if (!advanceData.status) {
      advanceData.status = 'pending';
    }

    return await apiService.create(SALARY_ADVANCES_TYPE, advanceData);
  },

  async updateAdvance(id, advanceData) {
    return await apiService.update(SALARY_ADVANCES_TYPE, id, advanceData);
  },

  async deleteAdvance(id) {
    return await apiService.delete(SALARY_ADVANCES_TYPE, id);
  },

  async getAdvancesByStaff(staffId) {
    return await apiService.query(SALARY_ADVANCES_TYPE, advance => advance.staffId === staffId);
  },

  async getPendingAdvances() {
    return await apiService.query(SALARY_ADVANCES_TYPE, advance => advance.status === 'pending');
  },

  // Reports
  async getPayrollOverview() {
    const payslips = await this.getAllPayslips();
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const thisMonthPayslips = payslips.filter(p => 
      p.period && p.period.startsWith(currentMonth)
    );

    const totalPayroll = thisMonthPayslips.reduce((sum, p) => 
      sum + (parseFloat(p.netPay) || 0), 0
    );

    const totalStaff = new Set(thisMonthPayslips.map(p => p.staffId)).size;

    return {
      totalStaff,
      totalPayroll,
      payslipsCount: thisMonthPayslips.length,
      averagePay: totalStaff > 0 ? totalPayroll / totalStaff : 0
    };
  },

  async getTaxReport(period) {
    const payslips = await this.getPayslipsByPeriod(period);
    
    const totalGross = payslips.reduce((sum, p) => sum + (parseFloat(p.grossPay) || 0), 0);
    const totalTax = payslips.reduce((sum, p) => sum + (parseFloat(p.tax) || 0), 0);
    const totalSSNIT = payslips.reduce((sum, p) => sum + (parseFloat(p.ssnit) || 0), 0);

    return {
      period,
      payslipsCount: payslips.length,
      totalGross,
      totalTax,
      totalSSNIT,
      totalDeductions: totalTax + totalSSNIT,
      netPay: totalGross - (totalTax + totalSSNIT)
    };
  }
};

export default payrollService;

