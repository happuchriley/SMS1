import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import studentsService from '../../services/studentsService';
import notificationService from '../../services/notificationService';
import { useModal } from '../../components/ModalProvider';
import { generateNumericPassword } from '../../utils/passwordGenerator';
import { getAccessibleClasses } from '../../utils/classRestriction';
import setupService from '../../services/setupService';

interface StudentItem {
  id: string;
  name: string;
  class: string;
  studentId: string;
  phone?: string;
  email?: string;
  parentName?: string;
  parentContact?: string;
  parentEmail?: string;
}

interface FormData {
  class: string;
  reminderType: 'sms' | 'email';
}

const ApplicationDetails: React.FC = () => {
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [accessibleClasses, setAccessibleClasses] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    class: '',
    reminderType: 'sms'
  });

  const loadData = useCallback(async () => {
    try {
      const [students, classes] = await Promise.all([
        studentsService.getAll(),
        getAccessibleClasses()
      ]);
      setAllStudents(students);
      setAccessibleClasses(classes);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Failed to load data');
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredStudents = useMemo<StudentItem[]>(() => {
    if (!formData.class) return [];
    return allStudents
      .filter(s => s.class === formData.class)
      .map(s => ({
        id: s.id,
        name: `${s.firstName || ''} ${s.surname || ''} ${s.otherNames || ''}`.trim(),
        class: s.class,
        studentId: s.studentId || s.id,
        phone: s.contact || s.phone,
        email: s.email,
        parentName: s.parentName || s.parent || s.guardianName,
        parentContact: s.parentContact || s.guardianContact,
        parentEmail: s.parentEmail || s.guardianEmail
      }));
  }, [formData.class, allStudents]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.class) {
      toast.showError('Please select a class/group');
      return;
    }

    if (filteredStudents.length === 0) {
      toast.showError('No students found for the selected class');
      return;
    }

    setLoading(true);
    try {
      let smsSent = 0;
      let emailSent = 0;
      let failed = 0;

      for (const student of filteredStudents) {
        try {
          // Generate password for parent
          const parentPassword = generateNumericPassword(6);
          
          // Send based on reminder type
          const credentials = {
            username: student.studentId,
            password: parentPassword,
            name: student.parentName || 'Parent/Guardian',
            role: 'parent' as const,
            email: student.parentEmail,
            phone: student.parentContact
          };

          if (formData.reminderType === 'sms' && student.parentContact) {
            const sent = await notificationService.sendSMS(credentials);
            if (sent) smsSent++;
            else failed++;
          } else if (formData.reminderType === 'email' && student.parentEmail) {
            const sent = await notificationService.sendEmail(credentials);
            if (sent) emailSent++;
            else failed++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error(`Error sending credentials for ${student.name}:`, error);
          failed++;
        }
      }

      const totalSent = smsSent + emailSent;
      if (totalSent > 0) {
        let message = `${totalSent} login detail(s) sent successfully`;
        if (formData.reminderType === 'sms' && smsSent > 0) {
          message += ` via SMS`;
        } else if (formData.reminderType === 'email' && emailSent > 0) {
          message += ` via Email`;
        }
        if (failed > 0) {
          message += `. ${failed} failed`;
        }
        toast.showSuccess(message);
      } else {
        toast.showError(`Failed to send login details. Please check that students have ${formData.reminderType === 'sms' ? 'parent contact' : 'parent email'} information.`);
      }
    } catch (error: any) {
      console.error('Error sending login details:', error);
      toast.showError(error.message || 'Failed to send login details');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFormData({ class: '', reminderType: 'sms' });
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              SMS/Email to Students/Parents (Login Details)
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">SMS/Email Reminder (Login Details)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, reminderType: 'sms' })}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
              formData.reminderType === 'sms'
                ? 'text-primary-600 border-primary-600 bg-primary-50'
                : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Send SMS Reminder
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, reminderType: 'email' })}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
              formData.reminderType === 'email'
                ? 'text-primary-600 border-primary-600 bg-primary-50'
                : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Send Email Reminder
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              {formData.reminderType === 'sms' ? 'Send SMS Notification' : 'Send Email Notification'}
            </h2>
            
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Select Class/Group <span className="text-red-500">*</span>
              </label>
              <div className="relative select-dropdown-wrapper">
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  required
                  className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm min-h-[44px]"
                >
                  <option value="">Select class group</option>
                  {accessibleClasses.map((className: string) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
                <div className="select-dropdown-arrow">
                  <div className="select-dropdown-arrow-icon">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
            </div>

            {formData.class && filteredStudents.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>{filteredStudents.length}</strong> student(s) found in <strong>{formData.class}</strong>.
                  Login details will be sent to their {formData.reminderType === 'sms' ? 'parent contact numbers' : 'parent email addresses'}.
                </p>
              </div>
            )}

            {formData.class && filteredStudents.length === 0 && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  No students found for the selected class.
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
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
              disabled={loading || !formData.class || filteredStudents.length === 0}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i className={`fas ${formData.reminderType === 'sms' ? 'fa-comment' : 'fa-envelope'}`}></i>
              Send {formData.reminderType === 'sms' ? 'SMS' : 'Email'} Notification
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ApplicationDetails;
