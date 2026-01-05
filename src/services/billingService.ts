/**
 * Billing Service
 * Handles all billing and fee collection operations
 */
import apiService from './api';

const BILLS_TYPE = 'bills';
const PAYMENTS_TYPE = 'payments';
const OTHER_FEES_TYPE = 'otherFees';

interface BillItem {
  amount: number;
  [key: string]: any;
}

interface BillData {
  studentId?: string;
  studentIds?: string[];
  billNumber?: string;
  status?: string;
  items?: BillItem[];
  total?: number;
  [key: string]: any;
}

interface PaymentData {
  studentId?: string;
  studentIds?: string[];
  amount: number;
  receiptNumber?: string;
  billId?: string;
  paymentDate?: string;
  [key: string]: any;
}

interface OtherFeeData {
  [key: string]: any;
}

interface DebtorBill extends BillData {
  totalPaid: number;
  balance: number;
  id: string;
}

interface CreditorPayment extends PaymentData {
  bill: BillData;
  overpayment: number;
  [key: string]: any;
}

const billingService = {
  // Bills Operations
  async getAllBills(): Promise<BillData[]> {
    return await apiService.getAll<BillData>(BILLS_TYPE);
  },

  async getBillById(id: string): Promise<BillData & { id: string }> {
    return await apiService.getById<BillData & { id: string }>(BILLS_TYPE, id);
  },

  async createBill(billData: BillData): Promise<BillData & { id: string }> {
    if (!billData.studentId && !billData.studentIds) {
      throw new Error('Student ID or IDs are required');
    }

    // Generate bill number if not provided
    if (!billData.billNumber) {
      const count = await apiService.count(BILLS_TYPE);
      billData.billNumber = `BILL${String(count + 1).padStart(6, '0')}`;
    }

    if (!billData.status) {
      billData.status = 'pending';
    }

    // Calculate total if items provided
    if (billData.items && Array.isArray(billData.items)) {
      billData.total = billData.items.reduce((sum: number, item: BillItem) => sum + (parseFloat(item.amount.toString()) || 0), 0);
    }

    return await apiService.create<BillData & { id: string }>(BILLS_TYPE, billData);
  },

  async updateBill(id: string, billData: Partial<BillData>): Promise<BillData & { id: string }> {
    return await apiService.update<BillData & { id: string }>(BILLS_TYPE, id, billData);
  },

  async deleteBill(id: string): Promise<void> {
    await apiService.delete(BILLS_TYPE, id);
  },

  async getBillsByStudent(studentId: string): Promise<(BillData & { id: string })[]> {
    return await apiService.query<BillData & { id: string }>(BILLS_TYPE, (bill: BillData & { id: string }) => 
      (bill.studentId === studentId) || 
      (bill.studentIds ? bill.studentIds.includes(studentId) : false)
    );
  },

  async getPendingBills(): Promise<(BillData & { id: string })[]> {
    return await apiService.query<BillData & { id: string }>(BILLS_TYPE, (bill: BillData & { id: string }) => bill.status === 'pending');
  },

  async getPaidBills(): Promise<(BillData & { id: string })[]> {
    return await apiService.query<BillData & { id: string }>(BILLS_TYPE, (bill: BillData & { id: string }) => bill.status === 'paid');
  },

  // Payments Operations
  async getAllPayments(): Promise<(PaymentData & { id: string })[]> {
    return await apiService.getAll<PaymentData & { id: string }>(PAYMENTS_TYPE);
  },

  async getPaymentById(id: string): Promise<PaymentData & { id: string }> {
    return await apiService.getById<PaymentData & { id: string }>(PAYMENTS_TYPE, id);
  },

  async recordPayment(paymentData: PaymentData): Promise<PaymentData & { id: string }> {
    if (!paymentData.studentId && !paymentData.studentIds) {
      throw new Error('Student ID or IDs are required');
    }
    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    // Generate receipt number
    if (!paymentData.receiptNumber) {
      const count = await apiService.count(PAYMENTS_TYPE);
      paymentData.receiptNumber = `REC${String(count + 1).padStart(6, '0')}`;
    }

    const payment = await apiService.create<PaymentData & { id: string }>(PAYMENTS_TYPE, paymentData);

    // Update bill status if billId provided
    if (paymentData.billId) {
      const bill = await this.getBillById(paymentData.billId);
      const totalPaid = await this.getTotalPaidForBill(paymentData.billId);
      
      if (totalPaid >= (bill.total || 0)) {
        await this.updateBill(paymentData.billId, { status: 'paid' });
      } else {
        await this.updateBill(paymentData.billId, { status: 'partial' });
      }
    }

    return payment;
  },

  async getPaymentsByStudent(studentId: string): Promise<(PaymentData & { id: string })[]> {
    return await apiService.query<PaymentData & { id: string }>(PAYMENTS_TYPE, (payment: PaymentData & { id: string }) => 
      (payment.studentId === studentId) ||
      (payment.studentIds ? payment.studentIds.includes(studentId) : false)
    );
  },

  async getPaymentsByBill(billId: string): Promise<(PaymentData & { id: string })[]> {
    return await apiService.query<PaymentData & { id: string }>(PAYMENTS_TYPE, (payment: PaymentData & { id: string }) => payment.billId === billId);
  },

  async getTotalPaidForBill(billId: string): Promise<number> {
    const payments = await this.getPaymentsByBill(billId);
    return payments.reduce((sum: number, payment: PaymentData & { id: string }) => sum + (parseFloat(payment.amount.toString()) || 0), 0);
  },

  // Debtors and Creditors
  async getDebtors(): Promise<DebtorBill[]> {
    const bills = await this.getAllBills();
    const debtors: DebtorBill[] = [];

    for (const bill of bills) {
      const billWithId = bill as BillData & { id: string };
      if (billWithId.status !== 'paid') {
        const totalPaid = await this.getTotalPaidForBill(billWithId.id);
        const balance = (billWithId.total || 0) - totalPaid;
        
        if (balance > 0) {
          debtors.push({
            ...billWithId,
            totalPaid,
            balance
          });
        }
      }
    }

    return debtors;
  },

  async getCreditors(): Promise<CreditorPayment[]> {
    const payments = await this.getAllPayments();
    const creditors: CreditorPayment[] = [];

    for (const payment of payments) {
      if (payment.billId) {
        const bill = await this.getBillById(payment.billId).catch(() => null);
        if (bill) {
          const totalPaid = await this.getTotalPaidForBill(bill.id);
          const overpayment = totalPaid - (bill.total || 0);
          
          if (overpayment > 0) {
            creditors.push({
              ...payment,
              bill,
              overpayment
            } as CreditorPayment);
          }
        }
      }
    }

    return creditors;
  },

  // Other Fees Operations
  async getAllOtherFees(): Promise<(OtherFeeData & { id: string })[]> {
    return await apiService.getAll<OtherFeeData & { id: string }>(OTHER_FEES_TYPE);
  },

  async getOtherFeeById(id: string): Promise<OtherFeeData & { id: string }> {
    return await apiService.getById<OtherFeeData & { id: string }>(OTHER_FEES_TYPE, id);
  },

  async createOtherFee(feeData: OtherFeeData): Promise<OtherFeeData & { id: string }> {
    return await apiService.create<OtherFeeData & { id: string }>(OTHER_FEES_TYPE, feeData);
  },

  async updateOtherFee(id: string, feeData: Partial<OtherFeeData>): Promise<OtherFeeData & { id: string }> {
    return await apiService.update<OtherFeeData & { id: string }>(OTHER_FEES_TYPE, id, feeData);
  },

  async deleteOtherFee(id: string): Promise<void> {
    await apiService.delete(OTHER_FEES_TYPE, id);
  },

  // Reports
  async getFeeCollectionReport(startDate?: string, endDate?: string, classFilter: string | null = null): Promise<(PaymentData & { id: string })[]> {
    const payments = await this.getAllPayments();
    
    let filtered = payments.filter((payment: PaymentData & { id: string }) => {
      if (!payment.paymentDate) return false;
      const paymentDate = new Date(payment.paymentDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && paymentDate < start) return false;
      if (end && paymentDate > end) return false;
      return true;
    });

    if (classFilter) {
      // Filter by class would require joining with student data
      // This is simplified - in real implementation, you'd join the data
    }

    return filtered;
  }
};

export default billingService;

