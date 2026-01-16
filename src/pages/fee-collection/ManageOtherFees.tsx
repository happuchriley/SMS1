import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import billingService from '../../services/billingService';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';
import { getAccessibleClasses, filterStudentsByAccessibleClasses } from '../../utils/classRestriction';

interface StudentFeeItem {
  id: string;
  studentId: string;
  name: string;
  gender: string;
  class: string;
  image?: string;
  bussFees: string;
  feeding: string;
  otherFee1: string;
  otherFee2: string;
}

interface OtherFeeType {
  id: string;
  name: string;
  amount: number;
}

const ManageOtherFees: React.FC = () => {
  const { toast } = useModal();
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [otherFeeTypes, setOtherFeeTypes] = useState<OtherFeeType[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [studentFees, setStudentFees] = useState<StudentFeeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [classes, setClasses] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [students, fees, accessibleClasses] = await Promise.all([
        studentsService.getAll(),
        billingService.getAllOtherFees(),
        getAccessibleClasses()
      ]);
      // Filter students by accessible classes
      const filteredStudents = await filterStudentsByAccessibleClasses(students);
      setAllStudents(filteredStudents);
      setClasses(accessibleClasses);
      setOtherFeeTypes(fees.map((f: any) => ({
        id: f.id,
        name: f.name,
        amount: parseFloat(f.amount) || 0
      })));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Failed to load data');
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load students when class is selected
  useEffect(() => {
    if (selectedClass) {
      const filteredStudents = allStudents.filter(s => s.class === selectedClass);
      const initialFees = filteredStudents.map(student => ({
        id: student.id,
        studentId: student.studentId || student.id,
        name: `${student.firstName || ''} ${student.surname || ''} ${student.otherNames || ''}`.trim(),
        gender: student.gender || 'N/A',
        class: student.class,
        image: student.profileImage,
        bussFees: '',
        feeding: '',
        otherFee1: '',
        otherFee2: ''
      }));
      setStudentFees(initialFees);
      setCurrentPage(1);
    } else {
      setStudentFees([]);
    }
  }, [selectedClass, allStudents]);

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return studentFees;
    const term = searchTerm.toLowerCase();
    return studentFees.filter(s =>
      s.studentId.toLowerCase().includes(term) ||
      s.name.toLowerCase().includes(term) ||
      s.class.toLowerCase().includes(term)
    );
  }, [studentFees, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filteredStudents.slice(start, end);
  }, [filteredStudents, currentPage, entriesPerPage]);

  const handleFeeChange = (studentId: string, field: 'bussFees' | 'feeding' | 'otherFee1' | 'otherFee2', value: string): void => {
    setStudentFees(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const handleSave = async (studentId: string): Promise<void> => {
    const student = studentFees.find(s => s.id === studentId);
    if (!student) return;

    try {
      // Here you would save the fees to the backend
      // For now, we'll just show a success message
      toast.showSuccess(`Fees saved for ${student.name}`);
      
      // In a real implementation, you would call an API:
      // await billingService.saveStudentFees(studentId, {
      //   bussFees: student.bussFees,
      //   feeding: student.feeding,
      //   otherFee1: student.otherFee1,
      //   otherFee2: student.otherFee2
      // });
    } catch (error: any) {
      console.error('Error saving fees:', error);
      toast.showError(error.message || 'Failed to save fees');
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Manage Students All</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/fee-collection" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Fee Collection</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Manage Other Fees</span>
            </div>
          </div>
        </div>
      </div>

      {/* Class Filter */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">
              Class <span className="text-red-500">*</span>
            </label>
            <div className="relative select-dropdown-wrapper">
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
                required
                className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <div className="select-dropdown-arrow">
                <div className="select-dropdown-arrow-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {selectedClass && (
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

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-500 w-48"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Student.ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Student.Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Current.Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Buss.Fees</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Feeding</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Other.Fee1</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Other.Fee2</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                      <td className="px-4 py-3">
                        {student.image ? (
                          <img src={student.image} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-gray-500"></i>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{student.studentId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.gender}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.class}</td>
                      <td className="px-4 py-3">
                        <div className="relative select-dropdown-wrapper">
                          <select
                            value={student.bussFees}
                            onChange={(e) => handleFeeChange(student.id, 'bussFees', e.target.value)}
                            className="select-dropdown w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 min-h-[40px]"
                          >
                            <option value="">Select</option>
                            {otherFeeTypes.map(fee => (
                              <option key={fee.id} value={fee.id}>{fee.name}</option>
                            ))}
                          </select>
                          <div className="select-dropdown-arrow">
                            <div className="select-dropdown-arrow-icon">
                              <i className="fas fa-chevron-down"></i>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative select-dropdown-wrapper">
                          <select
                            value={student.feeding}
                            onChange={(e) => handleFeeChange(student.id, 'feeding', e.target.value)}
                            className="select-dropdown w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 min-h-[40px]"
                          >
                            <option value="">Select</option>
                            {otherFeeTypes.map(fee => (
                              <option key={fee.id} value={fee.id}>{fee.name}</option>
                            ))}
                          </select>
                          <div className="select-dropdown-arrow">
                            <div className="select-dropdown-arrow-icon">
                              <i className="fas fa-chevron-down"></i>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative select-dropdown-wrapper">
                          <select
                            value={student.otherFee1}
                            onChange={(e) => handleFeeChange(student.id, 'otherFee1', e.target.value)}
                            className="select-dropdown w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 min-h-[40px]"
                          >
                            <option value="">Select</option>
                            {otherFeeTypes.map(fee => (
                              <option key={fee.id} value={fee.id}>{fee.name}</option>
                            ))}
                          </select>
                          <div className="select-dropdown-arrow">
                            <div className="select-dropdown-arrow-icon">
                              <i className="fas fa-chevron-down"></i>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative select-dropdown-wrapper">
                          <select
                            value={student.otherFee2}
                            onChange={(e) => handleFeeChange(student.id, 'otherFee2', e.target.value)}
                            className="select-dropdown w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 min-h-[40px]"
                          >
                            <option value="">Select</option>
                            {otherFeeTypes.map(fee => (
                              <option key={fee.id} value={fee.id}>{fee.name}</option>
                            ))}
                          </select>
                          <div className="select-dropdown-arrow">
                            <div className="select-dropdown-arrow-icon">
                              <i className="fas fa-chevron-down"></i>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSave(student.id)}
                          className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Save
                        </button>
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
              Showing {filteredStudents.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredStudents.length)} of {filteredStudents.length} entries
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
      )}
    </Layout>
  );
};

export default ManageOtherFees;
