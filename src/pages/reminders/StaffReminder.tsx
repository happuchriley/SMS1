import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import remindersService from '../../services/remindersService';
import staffService from '../../services/staffService';
import { useModal } from '../../components/ModalProvider';

interface StaffItem {
  id: string;
  name: string;
  department: string;
  phone?: string;
  email?: string;
}

interface FormData {
  reminderType: string;
  department: string;
  reminderCategory: string;
  message: string;
  scheduleDate: string;
}

const StaffReminder: React.FC = () => {
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    reminderType: 'sms',
    department: '',
    reminderCategory: '',
    message: '',
    scheduleDate: ''
  });

  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  const departments: string[] = ['All Departments', 'Mathematics', 'Administration', 'Finance', 'IT', 'Science'];
  const reminderCategories: string[] = ['Meeting Reminder', 'Deadline Reminder', 'Task Assignment', 'General Notification'];

  const loadStaff = useCallback(async () => {
    try {
      const staff = await staffService.getAll();
      setAllStaff(staff);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast.showError('Failed to load staff');
    }
  }, [toast]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const filteredStaff = useMemo<StaffItem[]>(() => {
    if (!formData.department || formData.department === 'All Departments') {
      return allStaff.map(s => ({
        id: s.id,
        name: `${s.firstName || ''} ${s.surname || ''} ${s.otherNames || ''}`.trim(),
        department: s.department || '',
        phone: s.contact || s.phone,
        email: s.email
      }));
    }
    return allStaff
      .filter(s => s.department === formData.department)
      .map(s => ({
        id: s.id,
        name: `${s.firstName || ''} ${s.surname || ''} ${s.otherNames || ''}`.trim(),
        department: s.department || '',
        phone: s.contact || s.phone,
        email: s.email
      }));
  }, [formData.department, allStaff]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'department') {
      setSelectedStaff([]);
    }
  };

  const handleStaffToggle = (staffId: string): void => {
    setSelectedStaff(prev => {
      if (prev.includes(staffId)) {
        return prev.filter(id => id !== staffId);
      } else {
        return [...prev, staffId];
      }
    });
  };

  const handleSelectAll = (): void => {
    if (selectedStaff.length === filteredStaff.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(filteredStaff.map(s => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.reminderCategory || !formData.message || selectedStaff.length === 0) {
      toast.showError('Please fill in all required fields and select at least one staff member.');
      return;
    }

    setLoading(true);
    try {
      const result = await remindersService.sendStaffReminder({
        staffIds: selectedStaff,
        type: 'staff',
        reminderType: formData.reminderType,
        reminderCategory: formData.reminderCategory,
        message: formData.message,
        scheduledDate: formData.scheduleDate || new Date().toISOString(),
        department: formData.department
      });
      toast.showSuccess(`${result.sent} staff reminder(s) sent successfully via ${formData.reminderType.toUpperCase()}!`);
      handleClear();
    } catch (error: any) {
      console.error('Error sending staff reminder:', error);
      toast.showError(error.message || 'Failed to send staff reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFormData({ reminderType: 'sms', department: '', reminderCategory: '', message: '', scheduleDate: '' });
    setSelectedStaff([]);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Staff Reminder</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/reminders" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">SMS/Email Reminders</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Staff Reminder</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Send Staff Reminder</h2>
          <p className="text-sm text-gray-600">Send reminders and notifications to staff members.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Reminder Category <span className="text-red-500">*</span>
              </label>
              <select
                name="reminderCategory"
                value={formData.reminderCategory}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Category</option>
                {reminderCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept === 'All Departments' ? '' : dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Reminder Type <span className="text-red-500">*</span>
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
              rows={6}
              required
              placeholder="Enter staff reminder message..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-vertical"
            />
            <p className="mt-1 text-xs text-gray-500">Character count: {formData.message.length}</p>
          </div>

          {/* Staff Selection */}
          {filteredStaff.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block font-semibold text-gray-900 text-sm">
                  Select Staff <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {selectedStaff.length === filteredStaff.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="border-2 border-gray-200 rounded-md p-4 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredStaff.map(staff => (
                    <label
                      key={staff.id}
                      className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStaff.includes(staff.id)}
                        onChange={() => handleStaffToggle(staff.id)}
                        className="mr-3 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        <div className="text-xs text-gray-500">{staff.id} - {staff.department}</div>
                        <div className="text-xs text-gray-400">{formData.reminderType === 'sms' ? staff.phone : staff.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              {selectedStaff.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {selectedStaff.length} staff member(s) selected
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
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-paper-plane mr-2"></i>
              Send Reminder
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default StaffReminder;

