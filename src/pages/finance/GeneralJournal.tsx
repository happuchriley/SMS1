import React, { useState } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import financeService from "../../services/financeService";
import { useModal } from "../../components/ModalProvider";

interface FormData {
  date: string;
  reference: string;
  account: string;
  description: string;
  debitAmount: string;
  creditAmount: string;
  notes: string;
}

const GeneralJournal: React.FC = () => {
  const { toast } = useModal();
  const [, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    date: "",
    reference: "",
    account: "",
    description: "",
    debitAmount: "",
    creditAmount: "",
    notes: "",
  });

  const accounts: string[] = [
    "Cash",
    "Bank Account",
    "Accounts Receivable",
    "Accounts Payable",
    "Tuition Income",
    "Salary Expense",
    "Utility Expense",
    "Maintenance Expense",
    "Other Income",
    "Other Expense",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (
      !formData.date ||
      !formData.account ||
      !formData.description ||
      (!formData.debitAmount && !formData.creditAmount)
    ) {
      toast.showError("Please fill in all required fields.");
      return;
    }

    if (formData.debitAmount && formData.creditAmount) {
      toast.showError("Please enter either debit amount OR credit amount, not both.");
      return;
    }

    setLoading(true);
    try {
      await financeService.createJournalEntry({
        ...formData,
        debitAmount: formData.debitAmount
          ? parseFloat(formData.debitAmount)
          : 0,
        creditAmount: formData.creditAmount
          ? parseFloat(formData.creditAmount)
          : 0,
      });
      toast.showSuccess("General journal entry recorded successfully!");
      handleClear();
    } catch (error: any) {
      console.error("Error recording journal entry:", error);
      toast.showError(error.message || "Failed to record journal entry");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFormData({
      date: "",
      reference: "",
      account: "",
      description: "",
      debitAmount: "",
      creditAmount: "",
      notes: "",
    });
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              General Journal
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link
                to="/"
                className="text-gray-600 no-underline hover:text-primary-500 transition-colors"
              >
                Home
              </Link>
              <span>/</span>
              <Link
                to="/finance"
                className="text-gray-600 no-underline hover:text-primary-500 transition-colors"
              >
                Finance Entries
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">General Journal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Record General Journal Entry
          </h2>
          <p className="text-sm text-gray-600">
            Enter general journal transaction details (debit or credit).
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Reference Number
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Enter reference number"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Account <span className="text-red-500">*</span>
              </label>
              <select
                name="account"
                value={formData.account}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter transaction description"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Debit Amount (GHS)
              </label>
              <input
                type="number"
                name="debitAmount"
                value={formData.debitAmount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Credit Amount (GHS)
              </label>
              <input
                type="number"
                name="creditAmount"
                value={formData.creditAmount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Enter any additional notes..."
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-vertical"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <i className="fas fa-save mr-2"></i>
              Record Entry
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default GeneralJournal;

