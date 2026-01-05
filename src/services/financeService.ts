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

interface DebtorEntryData {
  amount: number;
  [key: string]: any;
}

interface CreditorEntryData {
  amount: number;
  [key: string]: any;
}

interface IncomeEntryData {
  amount: number;
  account: string;
  date?: string;
  [key: string]: any;
}

interface ExpenseEntryData {
  amount: number;
  account: string;
  date?: string;
  [key: string]: any;
}

interface JournalEntryData {
  debitAmount?: number;
  creditAmount?: number;
  account?: string;
  date?: string;
  [key: string]: any;
}

interface AssetData {
  name: string;
  value: number;
  [key: string]: any;
}

interface AccountData {
  name: string;
  code: string;
  type?: string;
  [key: string]: any;
}

interface LedgerEntry {
  type: string;
  debit: number;
  credit: number;
  balance: number;
  date: string;
  account?: string;
  [key: string]: any;
}

interface TrialBalanceEntry {
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
}

interface IncomeStatement {
  income: number;
  expenses: number;
  netIncome: number;
  period: {
    startDate?: string;
    endDate?: string;
  };
}

const financeService = {
  // Debtor Entries
  async getAllDebtorEntries(): Promise<(DebtorEntryData & { id: string })[]> {
    return await apiService.getAll<DebtorEntryData & { id: string }>(DEBTOR_ENTRIES_TYPE);
  },

  async createDebtorEntry(entryData: DebtorEntryData): Promise<DebtorEntryData & { id: string }> {
    if (!entryData.amount || entryData.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    return await apiService.create<DebtorEntryData & { id: string }>(DEBTOR_ENTRIES_TYPE, entryData);
  },

  async updateDebtorEntry(id: string, entryData: Partial<DebtorEntryData>): Promise<DebtorEntryData & { id: string }> {
    return await apiService.update<DebtorEntryData & { id: string }>(DEBTOR_ENTRIES_TYPE, id, entryData);
  },

  async deleteDebtorEntry(id: string): Promise<void> {
    await apiService.delete(DEBTOR_ENTRIES_TYPE, id);
  },

  // Creditor Entries
  async getAllCreditorEntries(): Promise<(CreditorEntryData & { id: string })[]> {
    return await apiService.getAll<CreditorEntryData & { id: string }>(CREDITOR_ENTRIES_TYPE);
  },

  async createCreditorEntry(entryData: CreditorEntryData): Promise<CreditorEntryData & { id: string }> {
    if (!entryData.amount || entryData.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    return await apiService.create<CreditorEntryData & { id: string }>(CREDITOR_ENTRIES_TYPE, entryData);
  },

  async updateCreditorEntry(id: string, entryData: Partial<CreditorEntryData>): Promise<CreditorEntryData & { id: string }> {
    return await apiService.update<CreditorEntryData & { id: string }>(CREDITOR_ENTRIES_TYPE, id, entryData);
  },

  async deleteCreditorEntry(id: string): Promise<void> {
    await apiService.delete(CREDITOR_ENTRIES_TYPE, id);
  },

  // Income Entries
  async getAllIncomeEntries(): Promise<(IncomeEntryData & { id: string })[]> {
    return await apiService.getAll<IncomeEntryData & { id: string }>(INCOME_ENTRIES_TYPE);
  },

  async createIncomeEntry(entryData: IncomeEntryData): Promise<IncomeEntryData & { id: string }> {
    if (!entryData.amount || entryData.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    if (!entryData.account) {
      throw new Error('Account is required');
    }
    return await apiService.create<IncomeEntryData & { id: string }>(INCOME_ENTRIES_TYPE, entryData);
  },

  async updateIncomeEntry(id: string, entryData: Partial<IncomeEntryData>): Promise<IncomeEntryData & { id: string }> {
    return await apiService.update<IncomeEntryData & { id: string }>(INCOME_ENTRIES_TYPE, id, entryData);
  },

  async deleteIncomeEntry(id: string): Promise<void> {
    await apiService.delete(INCOME_ENTRIES_TYPE, id);
  },

  // Expense Entries
  async getAllExpenseEntries(): Promise<(ExpenseEntryData & { id: string })[]> {
    return await apiService.getAll<ExpenseEntryData & { id: string }>(EXPENSE_ENTRIES_TYPE);
  },

  async createExpenseEntry(entryData: ExpenseEntryData): Promise<ExpenseEntryData & { id: string }> {
    if (!entryData.amount || entryData.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    if (!entryData.account) {
      throw new Error('Account is required');
    }
    return await apiService.create<ExpenseEntryData & { id: string }>(EXPENSE_ENTRIES_TYPE, entryData);
  },

  async updateExpenseEntry(id: string, entryData: Partial<ExpenseEntryData>): Promise<ExpenseEntryData & { id: string }> {
    return await apiService.update<ExpenseEntryData & { id: string }>(EXPENSE_ENTRIES_TYPE, id, entryData);
  },

  async deleteExpenseEntry(id: string): Promise<void> {
    await apiService.delete(EXPENSE_ENTRIES_TYPE, id);
  },

  // General Journal
  async getAllJournalEntries(): Promise<(JournalEntryData & { id: string })[]> {
    return await apiService.getAll<JournalEntryData & { id: string }>(GENERAL_JOURNAL_TYPE);
  },

  async createJournalEntry(entryData: JournalEntryData): Promise<JournalEntryData & { id: string }> {
    if (!entryData.debitAmount && !entryData.creditAmount) {
      throw new Error('Either debit or credit amount is required');
    }
    if (entryData.debitAmount && entryData.creditAmount) {
      throw new Error('Cannot have both debit and credit amounts');
    }
    return await apiService.create<JournalEntryData & { id: string }>(GENERAL_JOURNAL_TYPE, entryData);
  },

  async updateJournalEntry(id: string, entryData: Partial<JournalEntryData>): Promise<JournalEntryData & { id: string }> {
    return await apiService.update<JournalEntryData & { id: string }>(GENERAL_JOURNAL_TYPE, id, entryData);
  },

  async deleteJournalEntry(id: string): Promise<void> {
    await apiService.delete(GENERAL_JOURNAL_TYPE, id);
  },

  // Fixed Assets
  async getAllAssets(): Promise<(AssetData & { id: string })[]> {
    return await apiService.getAll<AssetData & { id: string }>(FIXED_ASSETS_TYPE);
  },

  async getAssetById(id: string): Promise<AssetData & { id: string }> {
    return await apiService.getById<AssetData & { id: string }>(FIXED_ASSETS_TYPE, id);
  },

  async createAsset(assetData: AssetData): Promise<AssetData & { id: string }> {
    if (!assetData.name) {
      throw new Error('Asset name is required');
    }
    if (!assetData.value || assetData.value <= 0) {
      throw new Error('Asset value must be greater than zero');
    }
    return await apiService.create<AssetData & { id: string }>(FIXED_ASSETS_TYPE, assetData);
  },

  async updateAsset(id: string, assetData: Partial<AssetData>): Promise<AssetData & { id: string }> {
    return await apiService.update<AssetData & { id: string }>(FIXED_ASSETS_TYPE, id, assetData);
  },

  async deleteAsset(id: string): Promise<void> {
    await apiService.delete(FIXED_ASSETS_TYPE, id);
  },

  // Chart of Accounts
  async getAllAccounts(): Promise<(AccountData & { id: string })[]> {
    return await apiService.getAll<AccountData & { id: string }>(CHART_OF_ACCOUNTS_TYPE);
  },

  async getAccountById(id: string): Promise<AccountData & { id: string }> {
    return await apiService.getById<AccountData & { id: string }>(CHART_OF_ACCOUNTS_TYPE, id);
  },

  async createAccount(accountData: AccountData): Promise<AccountData & { id: string }> {
    if (!accountData.name || !accountData.code) {
      throw new Error('Account name and code are required');
    }
    return await apiService.create<AccountData & { id: string }>(CHART_OF_ACCOUNTS_TYPE, accountData);
  },

  async updateAccount(id: string, accountData: Partial<AccountData>): Promise<AccountData & { id: string }> {
    return await apiService.update<AccountData & { id: string }>(CHART_OF_ACCOUNTS_TYPE, id, accountData);
  },

  async deleteAccount(id: string): Promise<void> {
    await apiService.delete(CHART_OF_ACCOUNTS_TYPE, id);
  },

  // General Ledger
  async getGeneralLedger(accountCode?: string | null, startDate?: string | null, endDate?: string | null): Promise<LedgerEntry[]> {
    const journalEntries = await this.getAllJournalEntries();
    const incomeEntries = await this.getAllIncomeEntries();
    const expenseEntries = await this.getAllExpenseEntries();

    let entries: LedgerEntry[] = [];

    // Filter by account and date range
    const filterByAccountAndDate = (entry: any): boolean => {
      if (accountCode && entry.account !== accountCode) return false;
      
      const entryDate = new Date(entry.date || 0);
      if (startDate && entryDate < new Date(startDate)) return false;
      if (endDate && entryDate > new Date(endDate)) return false;
      
      return true;
    };

    journalEntries.filter(filterByAccountAndDate).forEach((entry: JournalEntryData & { id: string }) => {
      entries.push({
        ...entry,
        type: 'journal',
        debit: parseFloat(entry.debitAmount?.toString() || '0') || 0,
        credit: parseFloat(entry.creditAmount?.toString() || '0') || 0,
        balance: 0,
        date: entry.date || new Date().toISOString()
      });
    });

    incomeEntries.filter(filterByAccountAndDate).forEach((entry: IncomeEntryData & { id: string }) => {
      entries.push({
        ...entry,
        type: 'income',
        debit: 0,
        credit: parseFloat(entry.amount.toString()) || 0,
        balance: 0,
        date: entry.date || new Date().toISOString()
      });
    });

    expenseEntries.filter(filterByAccountAndDate).forEach((entry: ExpenseEntryData & { id: string }) => {
      entries.push({
        ...entry,
        type: 'expense',
        debit: parseFloat(entry.amount.toString()) || 0,
        credit: 0,
        balance: 0,
        date: entry.date || new Date().toISOString()
      });
    });

    // Sort by date
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let balance = 0;
    entries = entries.map(entry => {
      balance += entry.debit - entry.credit;
      return { ...entry, balance };
    });

    return entries;
  },

  // Trial Balance
  async getTrialBalance(startDate?: string | null, endDate?: string | null): Promise<TrialBalanceEntry[]> {
    const accounts = await this.getAllAccounts();
    const ledger = await this.getGeneralLedger(null, startDate, endDate);

    const accountBalances: Record<string, TrialBalanceEntry> = {};

    accounts.forEach((account: AccountData & { id: string }) => {
      accountBalances[account.code] = {
        code: account.code,
        name: account.name,
        type: account.type || 'asset',
        debit: 0,
        credit: 0
      };
    });

    ledger.forEach((entry: LedgerEntry) => {
      if (entry.account && accountBalances[entry.account]) {
        accountBalances[entry.account].debit += entry.debit;
        accountBalances[entry.account].credit += entry.credit;
      }
    });

    return Object.values(accountBalances).filter(acc => acc.debit > 0 || acc.credit > 0);
  },

  // Income Statement
  async getIncomeStatement(startDate?: string | null, endDate?: string | null): Promise<IncomeStatement> {
    const incomeEntries = await this.getAllIncomeEntries();
    const expenseEntries = await this.getAllExpenseEntries();

    const filterByDate = (entry: any): boolean => {
      const entryDate = new Date(entry.date || 0);
      if (startDate && entryDate < new Date(startDate)) return false;
      if (endDate && entryDate > new Date(endDate)) return false;
      return true;
    };

    const income = incomeEntries
      .filter(filterByDate)
      .reduce((sum: number, entry: IncomeEntryData & { id: string }) => sum + (parseFloat(entry.amount.toString()) || 0), 0);

    const expenses = expenseEntries
      .filter(filterByDate)
      .reduce((sum: number, entry: ExpenseEntryData & { id: string }) => sum + (parseFloat(entry.amount.toString()) || 0), 0);

    return {
      income,
      expenses,
      netIncome: income - expenses,
      period: { startDate: startDate || undefined, endDate: endDate || undefined }
    };
  }
};

export default financeService;

