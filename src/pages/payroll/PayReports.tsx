import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import payrollService from '../../services/payrollService';
import staffService from '../../services/staffService';
import { useModal } from '../../components/ModalProvider';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/printExport';

interface PayslipItem {
  id: string;
  payslipNumber: string;
  staffId: string;
  staffName: string;
  period: string;
  grossPay: number;
  tax: number;
  ssnit: number;
  otherDeductions: number;
  netPay: number;
  status: string;
}

interface ReportFilter {
  period: string;
  department: string;
  status: string;
}

const PayReports: React.FC = () => {
  const { toast } = useModal();
  const [payslips, setPayslips] = useState<PayslipItem[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<ReportFilter>({
    period: '',
    department: 'all',
    status: 'all'
  });
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [payslipsData, staffData] = await Promise.all([
        payrollService.getAllPayslips(),
        staffService.getAll()
      ]);

      // Map payslips with staff names
      const mappedPayslips: PayslipItem[] = payslipsData.map((payslip: any) => {
        const staff = staffData.find((s: any) => s.id === payslip.staffId || s.staffId === payslip.staffId);
        return {
          id: payslip.id,
          payslipNumber: payslip.payslipNumber || payslip.id,
          staffId: payslip.staffId,
          staffName: staff ? `${staff.firstName || ''} ${staff.surname || ''} ${staff.otherNames || ''}`.trim() : 'Unknown',
          period: payslip.period || '',
          grossPay: parseFloat(payslip.grossPay?.toString() || '0') || 0,
          tax: parseFloat(payslip.tax?.toString() || '0') || 0,
          ssnit: parseFloat(payslip.ssnit?.toString() || '0') || 0,
          otherDeductions: parseFloat(payslip.otherDeductions?.toString() || '0') || 0,
          netPay: parseFloat(payslip.netPay?.toString() || '0') || 0,
          status: payslip.status || 'pending'
        };
      });

      setPayslips(mappedPayslips);
      setAllStaff(staffData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get unique periods and departments
  const periods = useMemo(() => {
    const uniquePeriods = new Set(payslips.map(p => p.period).filter(Boolean));
    return Array.from(uniquePeriods).sort().reverse();
  }, [payslips]);

  const departments = useMemo(() => {
    const uniqueDepts = new Set(allStaff.map((s: any) => s.department).filter(Boolean));
    return Array.from(uniqueDepts).sort();
  }, [allStaff]);

  // Filter payslips
  const filteredPayslips = useMemo(() => {
    let filtered = payslips;

    // Filter by period
    if (filter.period) {
      filtered = filtered.filter(p => p.period === filter.period);
    }

    // Filter by department
    if (filter.department !== 'all') {
      const staffInDept = allStaff
        .filter((s: any) => s.department === filter.department)
        .map((s: any) => s.id || s.staffId);
      filtered = filtered.filter(p => staffInDept.includes(p.staffId));
    }

    // Filter by status
    if (filter.status !== 'all') {
      filtered = filtered.filter(p => p.status === filter.status);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.staffName.toLowerCase().includes(term) ||
        p.staffId.toLowerCase().includes(term) ||
        p.payslipNumber.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [payslips, filter, searchTerm, allStaff]);

  // Pagination
  const totalPages = Math.ceil(filteredPayslips.length / entriesPerPage);
  const paginatedPayslips = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filteredPayslips.slice(start, end);
  }, [filteredPayslips, currentPage, entriesPerPage]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: filteredPayslips.length,
      totalGross: filteredPayslips.reduce((sum, p) => sum + p.grossPay, 0),
      totalDeductions: filteredPayslips.reduce((sum, p) => sum + p.tax + p.ssnit + p.otherDeductions, 0),
      totalNet: filteredPayslips.reduce((sum, p) => sum + p.netPay, 0),
      paid: filteredPayslips.filter(p => p.status === 'paid').length,
      pending: filteredPayslips.filter(p => p.status === 'pending').length
    };
  }, [filteredPayslips]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
    setCurrentPage(1);
  };

  const handleExport = (format: 'copy' | 'excel' | 'csv' | 'pdf'): void => {
    if (filteredPayslips.length === 0) {
      toast.showError('No data to export');
      return;
    }

    const columns = [
      { key: 'payslipNumber', label: 'Payslip Number' },
      { key: 'staffId', label: 'Staff ID' },
      { key: 'staffName', label: 'Staff Name' },
      { key: 'period', label: 'Period' },
      { key: 'grossPay', label: 'Gross Pay' },
      { key: 'tax', label: 'Tax' },
      { key: 'ssnit', label: 'SSNIT' },
      { key: 'otherDeductions', label: 'Other Deductions' },
      { key: 'netPay', label: 'Net Pay' },
      { key: 'status', label: 'Status' }
    ];

    const exportData = filteredPayslips.map(p => ({
      payslipNumber: p.payslipNumber,
      staffId: p.staffId,
      staffName: p.staffName,
      period: p.period,
      grossPay: p.grossPay,
      tax: p.tax,
      ssnit: p.ssnit,
      otherDeductions: p.otherDeductions,
      netPay: p.netPay,
      status: p.status
    }));

    switch (format) {
      case 'copy':
        const text = exportData.map(row => Object.values(row).join('\t')).join('\n');
        navigator.clipboard.writeText(text);
        toast.showSuccess('Data copied to clipboard');
        break;
      case 'excel':
        exportToExcel(exportData, `pay-reports-${new Date().toISOString().split('T')[0]}.xlsx`, columns);
        toast.showSuccess('Data exported to Excel');
        break;
      case 'csv':
        exportToCSV(exportData, `pay-reports-${new Date().toISOString().split('T')[0]}.csv`, columns);
        toast.showSuccess('Data exported to CSV');
        break;
      case 'pdf':
        const printContent = document.getElementById('payroll-table');
        if (printContent) {
          exportToPDF(printContent, `pay-reports-${new Date().toISOString().split('T')[0]}.pdf`);
          toast.showSuccess('Data exported to PDF');
        }
        break;
    }
  };

  const handlePrintPayslip = (payslipId: string): void => {
    toast.showInfo('Print payslip functionality will be implemented');
  };

  const handleViewPayslip = (payslipId: string): void => {
    toast.showInfo('View payslip functionality will be implemented');
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Pay Reports</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/payroll/menu" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Payroll</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Pay Reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <div className="text-xs text-gray-600 mb-1 font-medium">Total Payslips</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <div className="text-xs text-gray-600 mb-1 font-medium">Total Gross</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">GHS {stats.totalGross.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500">
          <div className="text-xs text-gray-600 mb-1 font-medium">Total Deductions</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">GHS {stats.totalDeductions.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-primary-500">
          <div className="text-xs text-gray-600 mb-1 font-medium">Total Net Pay</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">GHS {stats.totalNet.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
          <div className="text-xs text-gray-600 mb-1 font-medium">Paid</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.paid}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-500">
          <div className="text-xs text-gray-600 mb-1 font-medium">Pending</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pending}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">Pay Period</label>
            <div className="relative select-dropdown-wrapper">
              <select
                name="period"
                value={filter.period}
                onChange={handleFilterChange}
                className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm min-h-[44px]"
              >
                <option value="">All Periods</option>
                {periods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
              <div className="select-dropdown-arrow">
                <div className="select-dropdown-arrow-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">Department</label>
            <div className="relative select-dropdown-wrapper">
              <select
                name="department"
                value={filter.department}
                onChange={handleFilterChange}
                className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm min-h-[44px]"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <div className="select-dropdown-arrow">
                <div className="select-dropdown-arrow-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">Status</label>
            <div className="relative select-dropdown-wrapper">
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm min-h-[44px]"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
              <div className="select-dropdown-arrow">
                <div className="select-dropdown-arrow-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, ID, or payslip number..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {/* Table Controls */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Show</label>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <label className="text-sm text-gray-700">entries</label>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleExport('copy')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Copy"
            >
              Copy
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Excel"
            >
              Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="CSV"
            >
              CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="PDF"
            >
              PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div id="payroll-table" className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Payslip Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Staff.ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Staff Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Gross Pay</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Tax</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">SSNIT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Other Deductions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Net Pay</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-spinner fa-spin text-4xl mb-4 text-primary-500"></i>
                      <div className="text-lg font-semibold">Loading payslips...</div>
                    </div>
                  </td>
                </tr>
              ) : paginatedPayslips.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                      <div className="text-lg font-semibold">No payslips found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPayslips.map((payslip, index) => (
                  <tr key={payslip.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 relative">
                      <div ref={actionMenuRef}>
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === payslip.id ? null : payslip.id)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                          <i className="fas fa-cog"></i>
                          <i className="fas fa-chevron-right text-xs"></i>
                        </button>
                        {openActionMenu === payslip.id && (
                          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px]">
                            <button
                              onClick={() => {
                                handleViewPayslip(payslip.id);
                                setOpenActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-eye text-green-500"></i>
                              View Payslip
                            </button>
                            <button
                              onClick={() => {
                                handlePrintPayslip(payslip.id);
                                setOpenActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-print text-blue-500"></i>
                              Print Payslip
                            </button>
                            <button
                              onClick={() => {
                                toast.showInfo(`Downloading payslip: ${payslip.payslipNumber}`);
                                setOpenActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-download text-purple-500"></i>
                              Download PDF
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{payslip.payslipNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{payslip.staffId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{payslip.staffName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{payslip.period}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">GHS {payslip.grossPay.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">GHS {payslip.tax.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">GHS {payslip.ssnit.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">GHS {payslip.otherDeductions.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-primary-600">GHS {payslip.netPay.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        payslip.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payslip.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700">
            Showing {filteredPayslips.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredPayslips.length)} of {filteredPayslips.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PayReports;
