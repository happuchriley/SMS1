import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import staffService from '../../services/staffService';
import { useModal } from '../../components/ModalProvider';
// StaffData interface is defined in staffService but not exported
interface StaffData {
  id?: string;
  staffId?: string;
  firstName: string;
  surname: string;
  otherNames?: string;
  position?: string;
  department?: string;
  employmentDate?: string;
  [key: string]: any;
}

const StaffListActive: React.FC = () => {
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { toast } = useModal();

  const loadStaff = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const activeStaff = await staffService.getActive();
      setStaff(activeStaff);
    } catch (error) {
      console.error('Error loading active staff:', error);
      toast.showError('Failed to load active staff');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const getStaffName = (s: StaffData): string => `${s.firstName || ''} ${s.surname || ''} ${s.otherNames || ''}`.trim() || 'N/A';

  const filtered = useMemo(() => {
    if (!searchTerm) return staff;
    const term = searchTerm.toLowerCase();
    return staff.filter(s => getStaffName(s).toLowerCase().includes(term) || (s.staffId || s.id || '').toLowerCase().includes(term));
  }, [staff, searchTerm]);

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Active Staff</h1>
        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
          <Link to="/" className="hover:text-primary-500 transition-colors">Home</Link>
          <span>/</span>
          <span>Staff</span>
          <span>/</span>
          <span>Active Staff</span>
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md mb-4">
        <input
          type="text"
          placeholder="Search staff..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-md mb-4 text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
        />
        <div className="text-sm text-gray-600">Total Active: {filtered.length}</div>
      </div>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <i className="fas fa-spinner fa-spin text-4xl mb-3"></i>
            <div>Loading...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <i className="fas fa-inbox text-4xl mb-3"></i>
            <div>No active staff found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-500">
                <tr>
                  <th className="p-3 text-left text-white text-xs uppercase">Staff ID</th>
                  <th className="p-3 text-left text-white text-xs uppercase">Name</th>
                  <th className="p-3 text-left text-white text-xs uppercase">Position</th>
                  <th className="p-3 text-left text-white text-xs uppercase">Department</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm">{s.staffId || s.id}</td>
                    <td className="p-3 text-sm">{getStaffName(s)}</td>
                    <td className="p-3 text-sm">{s.position || 'N/A'}</td>
                    <td className="p-3 text-sm">{s.department || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StaffListActive;

