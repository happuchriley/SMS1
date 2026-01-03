/**
 * Finance Service
 * Handles all finance entry and reporting operations
 */
import apiService from './api';

const DEBTOR_ENTRIES_TYPE = 'debtorEntries';
const CREDITOR_ENTRIES_TYPE = 'creditorEntries';
const INCOME_ENTRIES_TYPE = 'incomeEntries';
const EXPENSE_ENTRIES_TYPE = 'expenseEntries';
const GENERAL_JOURNAL_TYPE = 'generalJournal';
const FIXED_ASSETS_TYPE = 'fixedAssets';
const CHART_OF_ACCOUNTS_TYPE = 'chartOfAccounts';

const financeService = {
  // Debtor Entries
  async getAllDebtorEntries() {
    return await apiService.getAll(DEBTOR_ENTRIES_TYPE);
  },

  async createDebtorEntry(entryData) {
    if (!entryData.amount || entryData.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    return await apiService.create(DEBTOR_ENTRIES_TYPE, entryData);
  },

  async updateDebtorEntry(id, entryData) {
    return await apiService.update(DEBTOR_ENTRIES_TYPE, id, entryData);
  },

  async deleteDebtorEntry(id) {
    return await apiService.delete(DEBTOR_ENTRIES_TYPE, id);
  },

  // Creditor Entries
  async getAllCreditorEntries() {
    return await apiService.getAll(CREDITOR_ENTRIES_TYPE);
  },

  async createCreditorEntry(entryData) {
    if (!entryData.amount || entryData.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    return await apiService.create(CREDITOR_ENTRIES_TYPE, entryData);
  },

  async updateCreditorEntry(id, entryData) {
    return await apiService.update(CREDITOR_ENTRIES_TYPE, id, entryData);
  },

  async deleteCreditorEntry(id) {
    return await apiService.delete(CREDITOR_ENTRIES_TYPE, id);
  },

  // Income Entries
  async getAllIncomeEntries() {
    return await apiService.getAll(INCOME_ENTRIES_TYPE);
  },

  async createIncomeEntry(entryData) {
    if (!entryData.amount || entryData.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    if (!entryData.account) {
      throw new Error('Account is required');
    }
    return await apiService.create(INCOME_ENTRIES_TYPE, entryData);
  },

  async updateIncomeEntry(id, entryData) {
    return await apiService.update(INCOME_ENTRIES_TYPE, id, entryData);
  },

  async deleteIncomeEntry(id) {
    return await apiService.delete(INCOME_ENTRIES_TYPE, id);
  },

  // Expense Entries
  async getAllExpenseEntries() {
    return await apiService.getAll(EXPENSE_ENTRIES_TYPE);
  },

  async createExpenseEntry(entryData) {
    if (!entryData.amount || entryData.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    if (!entryData.account) {
      throw new Error('Account is required');
    }
    return await apiService.create(EXPENSE_ENTRIES_TYPE, entryData);
  },

  async updateExpenseEntry(id, entryData) {
    return await apiService.update(EXPENSE_ENTRIES_TYPE, id, entryData);
  },

  async deleteExpenseEntry(id) {
    return await apiService.delete(EXPENSE_ENTRIES_TYPE, id);
  },

  // General Journal
  async getAllJournalEntries() {
    return await apiService.getAll(GENERAL_JOURNAL_TYPE);
  },

  async createJournalEntry(entryData) {
    if (!entryData.debitAmount && !entryData.creditAmount) {
      throw new Error('Either debit or credit amount is required');
    }
    if (entryData.debitAmount && entryData.creditAmount) {
      throw new Error('Cannot have both debit and credit amounts');
    }
    return await apiService.create(GENERAL_JOURNAL_TYPE, entryData);
  },

  async updateJournalEntry(id, entryData) {
    return await apiService.update(GENERAL_JOURNAL_TYPE, id, entryData);
  },

  async deleteJournalEntry(id) {
    return await apiService.delete(GENERAL_JOURNAL_TYPE, id);
  },

  // Fixed Assets
  async getAllAssets() {
    return await apiService.getAll(FIXED_ASSETS_TYPE);
  },

  async getAssetById(id) {
    return await apiService.getById(FIXED_ASSETS_TYPE, id);
  },

  async createAsset(assetData) {
    if (!assetData.name) {
      throw new Error('Asset name is required');
    }
    if (!assetData.value || assetData.value <= 0) {
      throw new Error('Asset value must be greater than zero');
    }
    return await apiService.create(FIXED_ASSETS_TYPE, assetData);
  },

  async updateAsset(id, assetData) {
    return await apiService.update(FIXED_ASSETS_TYPE, id, assetData);
  },

  async deleteAsset(id) {
    return await apiService.delete(FIXED_ASSETS_TYPE, id);
  },

  // Chart of Accounts
  async getAllAccounts() {
    return await apiService.getAll(CHART_OF_ACCOUNTS_TYPE);
  },

  async getAccountById(id) {
    return await apiService.getById(CHART_OF_ACCOUNTS_TYPE, id);
  },

  async createAccount(accountData) {
    if (!accountData.name || !accountData.code) {
      throw new Error('Account name and code are required');
    }
    return await apiService.create(CHART_OF_ACCOUNTS_TYPE, accountData);
  },

  async updateAccount(id, accountData) {
    return await apiService.update(CHART_OF_ACCOUNTS_TYPE, id, accountData);
  },

  async deleteAccount(id) {
    return await apiService.delete(CHART_OF_ACCOUNTS_TYPE, id);
  },

  // General Ledger
  async getGeneralLedger(accountCode, startDate, endDate) {
    const journalEntries = await this.getAllJournalEntries();
    const incomeEntries = await this.getAllIncomeEntries();
    const expenseEntries = await this.getAllExpenseEntries();

    let entries = [];

    // Filter by account and date range
    const filterByAccountAndDate = (entry) => {
      if (accountCode && entry.account !== accountCode) return false;
      
      const entryDate = new Date(entry.date);
      if (startDate && entryDate < new Date(startDate)) return false;
      if (endDate && entryDate > new Date(endDate)) return false;
      
      return true;
    };

    journalEntries.filter(filterByAccountAndDate).forEach(entry => {
      entries.push({
        ...entry,
        type: 'journal',
        debit: parseFloat(entry.debitAmount) || 0,
        credit: parseFloat(entry.creditAmount) || 0
      });
    });

    incomeEntries.filter(filterByAccountAndDate).forEach(entry => {
      entries.push({
        ...entry,
        type: 'income',
        debit: 0,
        credit: parseFloat(entry.amount) || 0
      });
    });

    expenseEntries.filter(filterByAccountAndDate).forEach(entry => {
      entries.push({
        ...entry,
        type: 'expense',
        debit: parseFloat(entry.amount) || 0,
        credit: 0
      });
    });

    // Sort by date
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let balance = 0;
    entries = entries.map(entry => {
      balance += entry.debit - entry.credit;
      return { ...entry, balance };
    });

    return entries;
  },

  // Trial Balance
  async getTrialBalance(startDate, endDate) {
    const accounts = await this.getAllAccounts();
    const ledger = await this.getGeneralLedger(null, startDate, endDate);

    const accountBalances = {};

    accounts.forEach(account => {
      accountBalances[account.code] = {
        code: account.code,
        name: account.name,
        type: account.type || 'asset',
        debit: 0,
        credit: 0
      };
    });

    ledger.forEach(entry => {
      if (accountBalances[entry.account]) {
        accountBalances[entry.account].debit += entry.debit;
        accountBalances[entry.account].credit += entry.credit;
      }
    });

    return Object.values(accountBalances).filter(acc => acc.debit > 0 || acc.credit > 0);
  },

  // Income Statement
  async getIncomeStatement(startDate, endDate) {
    const incomeEntries = await this.getAllIncomeEntries();
    const expenseEntries = await this.getAllExpenseEntries();

    const filterByDate = (entry) => {
      const entryDate = new Date(entry.date);
      if (startDate && entryDate < new Date(startDate)) return false;
      if (endDate && entryDate > new Date(endDate)) return false;
      return true;
    };

    const income = incomeEntries
      .filter(filterByDate)
      .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);

    const expenses = expenseEntries
      .filter(filterByDate)
      .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);

    return {
      income,
      expenses,
      netIncome: income - expenses,
      period: { startDate, endDate }
    };
  }
};

export default financeService;

