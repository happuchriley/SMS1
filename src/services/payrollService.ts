/**
 * Payroll Service
 * Handles all payroll-related operations
 */
import apiService from './api';

const PAYSLIPS_TYPE = 'payslips';
const PAYROLL_SCHEDULE_TYPE = 'payrollSchedule';
const SALARY_ADVANCES_TYPE = 'salaryAdvances';

interface PayslipData {
  staffId: string;
  period: string;
  payslipNumber?: string;
  grossPay?: number;
  netPay?: number;
  tax?: number;
  ssnit?: number;
  otherDeductions?: number;
  [key: string]: any;
}

interface ScheduleData {
  [key: string]: any;
}

interface AdvanceData {
  staffId: string;
  amount: number;
  status?: string;
  [key: string]: any;
}

interface PayrollOverview {
  totalStaff: number;
  totalPayroll: number;
  payslipsCount: number;
  averagePay: number;
}

interface TaxReport {
  period: string;
  payslipsCount: number;
  totalGross: number;
  totalTax: number;
  totalSSNIT: number;
  totalDeductions: number;
  netPay: number;
}

const payrollService = {
  // Payslips Operations
  async getAllPayslips(): Promise<(PayslipData & { id: string })[]> {
    return await apiService.getAll<PayslipData & { id: string }>(PAYSLIPS_TYPE);
  },

  async getPayslipById(id: string): Promise<PayslipData & { id: string }> {
    return await apiService.getById<PayslipData & { id: string }>(PAYSLIPS_TYPE, id);
  },

  async generatePayslip(payslipData: PayslipData): Promise<PayslipData & { id: string }> {
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

    return await apiService.create<PayslipData & { id: string }>(PAYSLIPS_TYPE, payslipData);
  },

  async updatePayslip(id: string, payslipData: Partial<PayslipData>): Promise<PayslipData & { id: string }> {
    return await apiService.update<PayslipData & { id: string }>(PAYSLIPS_TYPE, id, payslipData);
  },

  async deletePayslip(id: string): Promise<void> {
    await apiService.delete(PAYSLIPS_TYPE, id);
  },

  async getPayslipsByStaff(staffId: string): Promise<(PayslipData & { id: string })[]> {
    return await apiService.query<PayslipData & { id: string }>(PAYSLIPS_TYPE, (payslip: PayslipData & { id: string }) => payslip.staffId === staffId);
  },

  async getPayslipsByPeriod(period: string): Promise<(PayslipData & { id: string })[]> {
    return await apiService.query<PayslipData & { id: string }>(PAYSLIPS_TYPE, (payslip: PayslipData & { id: string }) => payslip.period === period);
  },

  // Payroll Schedule Operations
  async getAllSchedules(): Promise<(ScheduleData & { id: string })[]> {
    return await apiService.getAll<ScheduleData & { id: string }>(PAYROLL_SCHEDULE_TYPE);
  },

  async getScheduleById(id: string): Promise<ScheduleData & { id: string }> {
    return await apiService.getById<ScheduleData & { id: string }>(PAYROLL_SCHEDULE_TYPE, id);
  },

  async createSchedule(scheduleData: ScheduleData): Promise<ScheduleData & { id: string }> {
    return await apiService.create<ScheduleData & { id: string }>(PAYROLL_SCHEDULE_TYPE, scheduleData);
  },

  async updateSchedule(id: string, scheduleData: Partial<ScheduleData>): Promise<ScheduleData & { id: string }> {
    return await apiService.update<ScheduleData & { id: string }>(PAYROLL_SCHEDULE_TYPE, id, scheduleData);
  },

  async deleteSchedule(id: string): Promise<void> {
    await apiService.delete(PAYROLL_SCHEDULE_TYPE, id);
  },

  // Salary Advances Operations
  async getAllAdvances(): Promise<(AdvanceData & { id: string })[]> {
    return await apiService.getAll<AdvanceData & { id: string }>(SALARY_ADVANCES_TYPE);
  },

  async getAdvanceById(id: string): Promise<AdvanceData & { id: string }> {
    return await apiService.getById<AdvanceData & { id: string }>(SALARY_ADVANCES_TYPE, id);
  },

  async createAdvance(advanceData: AdvanceData): Promise<AdvanceData & { id: string }> {
    if (!advanceData.staffId) {
      throw new Error('Staff ID is required');
    }
    if (!advanceData.amount || advanceData.amount <= 0) {
      throw new Error('Advance amount must be greater than zero');
    }

    if (!advanceData.status) {
      advanceData.status = 'pending';
    }

    return await apiService.create<AdvanceData & { id: string }>(SALARY_ADVANCES_TYPE, advanceData);
  },

  async updateAdvance(id: string, advanceData: Partial<AdvanceData>): Promise<AdvanceData & { id: string }> {
    return await apiService.update<AdvanceData & { id: string }>(SALARY_ADVANCES_TYPE, id, advanceData);
  },

  async deleteAdvance(id: string): Promise<void> {
    await apiService.delete(SALARY_ADVANCES_TYPE, id);
  },

  async getAdvancesByStaff(staffId: string): Promise<(AdvanceData & { id: string })[]> {
    return await apiService.query<AdvanceData & { id: string }>(SALARY_ADVANCES_TYPE, (advance: AdvanceData & { id: string }) => advance.staffId === staffId);
  },

  async getPendingAdvances(): Promise<(AdvanceData & { id: string })[]> {
    return await apiService.query<AdvanceData & { id: string }>(SALARY_ADVANCES_TYPE, (advance: AdvanceData & { id: string }) => advance.status === 'pending');
  },

  // Reports
  async getPayrollOverview(): Promise<PayrollOverview> {
    const payslips = await this.getAllPayslips();
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const thisMonthPayslips = payslips.filter((p: PayslipData & { id: string }) => 
      p.period && p.period.startsWith(currentMonth)
    );

    const totalPayroll = thisMonthPayslips.reduce((sum: number, p: PayslipData & { id: string }) => 
      sum + (parseFloat(p.netPay?.toString() || '0') || 0), 0
    );

    const totalStaff = new Set(thisMonthPayslips.map((p: PayslipData & { id: string }) => p.staffId)).size;

    return {
      totalStaff,
      totalPayroll,
      payslipsCount: thisMonthPayslips.length,
      averagePay: totalStaff > 0 ? totalPayroll / totalStaff : 0
    };
  },

  async getTaxReport(period: string): Promise<TaxReport> {
    const payslips = await this.getPayslipsByPeriod(period);
    
    const totalGross = payslips.reduce((sum: number, p: PayslipData & { id: string }) => sum + (parseFloat(p.grossPay?.toString() || '0') || 0), 0);
    const totalTax = payslips.reduce((sum: number, p: PayslipData & { id: string }) => sum + (parseFloat(p.tax?.toString() || '0') || 0), 0);
    const totalSSNIT = payslips.reduce((sum: number, p: PayslipData & { id: string }) => sum + (parseFloat(p.ssnit?.toString() || '0') || 0), 0);

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

