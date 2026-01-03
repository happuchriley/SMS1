/**
 * Billing Service
 * Handles all billing and fee collection operations
 */
import apiService from './api';

const BILLS_TYPE = 'bills';
const PAYMENTS_TYPE = 'payments';
const OTHER_FEES_TYPE = 'otherFees';

const billingService = {
  // Bills Operations
  async getAllBills() {
    return await apiService.getAll(BILLS_TYPE);
  },

  async getBillById(id) {
    return await apiService.getById(BILLS_TYPE, id);
  },

  async createBill(billData) {
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
      billData.total = billData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    }

    return await apiService.create(BILLS_TYPE, billData);
  },

  async updateBill(id, billData) {
    return await apiService.update(BILLS_TYPE, id, billData);
  },

  async deleteBill(id) {
    return await apiService.delete(BILLS_TYPE, id);
  },

  async getBillsByStudent(studentId) {
    return await apiService.query(BILLS_TYPE, bill => 
      bill.studentId === studentId || 
      (bill.studentIds && bill.studentIds.includes(studentId))
    );
  },

  async getPendingBills() {
    return await apiService.query(BILLS_TYPE, bill => bill.status === 'pending');
  },

  async getPaidBills() {
    return await apiService.query(BILLS_TYPE, bill => bill.status === 'paid');
  },

  // Payments Operations
  async getAllPayments() {
    return await apiService.getAll(PAYMENTS_TYPE);
  },

  async getPaymentById(id) {
    return await apiService.getById(PAYMENTS_TYPE, id);
  },

  async recordPayment(paymentData) {
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

    const payment = await apiService.create(PAYMENTS_TYPE, paymentData);

    // Update bill status if billId provided
    if (paymentData.billId) {
      const bill = await this.getBillById(paymentData.billId);
      const totalPaid = await this.getTotalPaidForBill(paymentData.billId);
      
      if (totalPaid >= bill.total) {
        await this.updateBill(paymentData.billId, { status: 'paid' });
      } else {
        await this.updateBill(paymentData.billId, { status: 'partial' });
      }
    }

    return payment;
  },

  async getPaymentsByStudent(studentId) {
    return await apiService.query(PAYMENTS_TYPE, payment => 
      payment.studentId === studentId ||
      (payment.studentIds && payment.studentIds.includes(studentId))
    );
  },

  async getPaymentsByBill(billId) {
    return await apiService.query(PAYMENTS_TYPE, payment => payment.billId === billId);
  },

  async getTotalPaidForBill(billId) {
    const payments = await this.getPaymentsByBill(billId);
    return payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
  },

  // Debtors and Creditors
  async getDebtors() {
    const bills = await this.getAllBills();
    const debtors = [];

    for (const bill of bills) {
      if (bill.status !== 'paid') {
        const totalPaid = await this.getTotalPaidForBill(bill.id);
        const balance = bill.total - totalPaid;
        
        if (balance > 0) {
          debtors.push({
            ...bill,
            totalPaid,
            balance
          });
        }
      }
    }

    return debtors;
  },

  async getCreditors() {
    const payments = await this.getAllPayments();
    const creditors = [];

    for (const payment of payments) {
      if (payment.billId) {
        const bill = await this.getBillById(payment.billId).catch(() => null);
        if (bill) {
          const totalPaid = await this.getTotalPaidForBill(bill.id);
          const overpayment = totalPaid - bill.total;
          
          if (overpayment > 0) {
            creditors.push({
              ...payment,
              bill,
              overpayment
            });
          }
        }
      }
    }

    return creditors;
  },

  // Other Fees Operations
  async getAllOtherFees() {
    return await apiService.getAll(OTHER_FEES_TYPE);
  },

  async getOtherFeeById(id) {
    return await apiService.getById(OTHER_FEES_TYPE, id);
  },

  async createOtherFee(feeData) {
    return await apiService.create(OTHER_FEES_TYPE, feeData);
  },

  async updateOtherFee(id, feeData) {
    return await apiService.update(OTHER_FEES_TYPE, id, feeData);
  },

  async deleteOtherFee(id) {
    return await apiService.delete(OTHER_FEES_TYPE, id);
  },

  // Reports
  async getFeeCollectionReport(startDate, endDate, classFilter = null) {
    const payments = await this.getAllPayments();
    
    let filtered = payments.filter(payment => {
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

