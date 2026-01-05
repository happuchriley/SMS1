import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import remindersService from '../../services/remindersService';
import { useModal } from '../../components/ModalProvider';

interface FormData {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  reminderType: string;
  recipientType: string;
  class: string;
  message: string;
  scheduleDate: string;
}

const EventReminder: React.FC = () => {
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    eventTitle: '',
    eventDate: '',
    eventTime: '',
    reminderType: 'sms',
    recipientType: 'all',
    class: '',
    message: '',
    scheduleDate: ''
  });

  const classes: string[] = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];

  const defaultMessage = `Dear Parent/Guardian,

This is a reminder about the upcoming event: [Event Title] on [Date] at [Time].

We look forward to your participation.

Thank you.`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Update message when event details change
      if (name === 'eventTitle' || name === 'eventDate' || name === 'eventTime') {
        const updatedMessage = defaultMessage
          .replace('[Event Title]', name === 'eventTitle' ? value : prev.eventTitle || '[Event Title]')
          .replace('[Date]', name === 'eventDate' ? value : prev.eventDate || '[Date]')
          .replace('[Time]', name === 'eventTime' ? value : prev.eventTime || '[Time]');
        
        updated.message = prev.message || updatedMessage;
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.eventTitle || !formData.eventDate || !formData.message) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    if (formData.recipientType === 'class' && !formData.class) {
      toast.showError('Please select a class.');
      return;
    }

    setLoading(true);
    try {
      const result = await remindersService.sendEventReminder({
        type: 'event',
        eventTitle: formData.eventTitle,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        reminderType: formData.reminderType,
        recipientType: formData.recipientType,
        class: formData.class,
        message: formData.message,
        scheduledDate: formData.scheduleDate || new Date().toISOString()
      });
      toast.showSuccess(`Event reminder sent successfully! Sent to ${result.sent} recipients.`);
      handleClear();
    } catch (error: any) {
      console.error('Error sending event reminder:', error);
      toast.showError(error.message || 'Failed to send event reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFormData({
      eventTitle: '',
      eventDate: '',
      eventTime: '',
      reminderType: 'sms',
      recipientType: 'all',
      class: '',
      message: '',
      scheduleDate: ''
    });
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Event Reminder</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/reminders" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">SMS/Email Reminders</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Event Reminder</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Send Event Reminder</h2>
          <p className="text-sm text-gray-600">Send event reminders to students, parents, or staff.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="eventTitle"
                value={formData.eventTitle}
                onChange={handleChange}
                placeholder="Enter event title"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Event Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Event Time
              </label>
              <input
                type="time"
                name="eventTime"
                value={formData.eventTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
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
                Recipient Type <span className="text-red-500">*</span>
              </label>
              <select
                name="recipientType"
                value={formData.recipientType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="all">All Students</option>
                <option value="class">Specific Class</option>
                <option value="staff">Staff Only</option>
                <option value="both">All (Students & Staff)</option>
              </select>
            </div>

            {formData.recipientType === 'class' && (
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
            )}

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
              placeholder="Enter event reminder message..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-vertical"
            />
            <p className="mt-1 text-xs text-gray-500">Character count: {formData.message.length}</p>
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

export default EventReminder;

