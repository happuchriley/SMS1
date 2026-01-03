import React, { useState, useMemo, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import remindersService from '../../services/remindersService';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

const ApplicationDetails = () => {
  const { toast } = useModal();
  const [, setLoading] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [formData, setFormData] = useState({
    academicYear: '',
    class: '',
    reminderType: 'sms',
    message: '',
    scheduleDate: ''
  });

  const [selectedStudents, setSelectedStudents] = useState([]);

  // Sample data
  const academicYears = ['2023/2024', '2024/2025', '2025/2026'];
  const classes = ['Basic 1', 'Basic 2', 'Basic 3'];

  // Default message template
  const defaultMessage = `Dear Parent/Guardian,

Your application details have been processed. Please check your status.

Thank you.`;

  const loadStudents = useCallback(async () => {
    try {
      const students = await studentsService.getAll();
      setAllStudents(students);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.showError('Failed to load students');
    }
  }, [toast]);

  // Filter students by selected class
  const filteredStudents = useMemo(() => {
    if (!formData.class) return [];
    return allStudents
      .filter(s => s.class === formData.class)
      .map(s => ({
        id: s.id,
        name: `${s.firstName || ''} ${s.surname || ''} ${s.otherNames || ''}`.trim(),
        class: s.class,
        phone: s.contact || s.phone,
        email: s.email
      }));
  }, [formData.class, allStudents]);

  React.useEffect(() => {
    if (formData.class && filteredStudents.length > 0) {
      setSelectedStudents(filteredStudents.map(s => s.id));
      setFormData(prev => ({ ...prev, message: defaultMessage }));
    }
  }, [formData.class]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'class') {
      setSelectedStudents([]);
    }
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.academicYear || !formData.class || !formData.message || selectedStudents.length === 0) {
      toast.showError('Please fill in all required fields and select at least one student.');
      return;
    }

    setLoading(true);
    try {
      const result = await remindersService.sendApplicationDetails({
        studentIds: selectedStudents,
        reminderType: formData.reminderType,
        message: formData.message,
        scheduledDate: formData.scheduleDate || new Date().toISOString(),
        academicYear: formData.academicYear,
        class: formData.class
      });
      toast.showSuccess(`${result.sent} application detail(s) sent successfully via ${formData.reminderType.toUpperCase()}!`);
      handleClear();
    } catch (error) {
      console.error('Error sending application details:', error);
      toast.showError(error.message || 'Failed to send application details');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ academicYear: '', class: '', reminderType: 'sms', message: '', scheduleDate: '' });
    setSelectedStudents([]);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Application Details</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/reminders" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">SMS/Email Reminders</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Application Details</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Send Application Details</h2>
          <p className="text-sm text-gray-600">Send application status/details to parents/guardians.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Notification Type <span className="text-red-500">*</span>
              </label>
              <select
                name="reminderType"
                value={formData.reminderType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="both">Both SMS & Email</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Schedule Date (Optional)
              </label>
              <input
                type="datetime-local"
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-900 text-sm">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="6"
              required
              placeholder="Enter application details message..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-vertical"
            />
            <p className="mt-1 text-xs text-gray-500">Character count: {formData.message.length}</p>
          </div>

          {/* Students Selection */}
          {filteredStudents.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block font-semibold text-gray-900 text-sm">
                  Select Students <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="border-2 border-gray-200 rounded-md p-4 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredStudents.map(student => (
                    <label
                      key={student.id}
                      className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                        className="mr-3 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.id}</div>
                        <div className="text-xs text-gray-400">{formData.reminderType === 'sms' ? student.phone : student.email}</div>
                        <div className="text-xs mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            student.applicationStatus === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.applicationStatus}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              {selectedStudents.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {selectedStudents.length} student(s) selected
                </p>
              )}
            </div>
          )}

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
              <i className="fas fa-paper-plane mr-2"></i>
              Send Details
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ApplicationDetails;
