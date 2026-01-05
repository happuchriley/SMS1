import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import setupService from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';

interface SystemSettingsFormData {
  systemName: string;
  systemVersion: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  enableSMSNotifications: boolean;
  enableEmailNotifications: boolean;
  enableAutoBackup: boolean;
  backupFrequency: string;
  sessionTimeout: string;
  enableMaintenanceMode: boolean;
}

const SystemSettings: React.FC = () => {
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<SystemSettingsFormData>({
    systemName: 'School Management System',
    systemVersion: '1.0.0',
    timezone: 'Africa/Accra',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24-hour',
    language: 'English',
    enableSMSNotifications: true,
    enableEmailNotifications: true,
    enableAutoBackup: true,
    backupFrequency: 'daily',
    sessionTimeout: '30',
    enableMaintenanceMode: false
  });

  const timezones: string[] = ['Africa/Accra', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Johannesburg'];
  const dateFormats: string[] = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
  const timeFormats: string[] = ['12-hour', '24-hour'];
  const languages: string[] = ['English', 'French', 'Spanish'];
  const backupFrequencies: string[] = ['Daily', 'Weekly', 'Monthly'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      try {
        const settings = await setupService.getSystemSettings();
        if (settings) {
          setFormData(prev => ({ ...settings, ...prev }));
        }
      } catch (error) {
        console.error('Error loading system settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      await setupService.updateSystemSettings(formData);
      toast.showSuccess('System settings updated successfully!');
    } catch (error: any) {
      console.error('Error updating system settings:', error);
      toast.showError(error.message || 'Failed to update system settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">System Settings</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/setup" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">School Setup</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">System Settings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Configure System Settings</h2>
          <p className="text-sm text-gray-600">Manage system-wide settings and preferences.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* General Settings */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">General Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    System Name
                  </label>
                  <input
                    type="text"
                    name="systemName"
                    value={formData.systemName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    System Version
                  </label>
                  <input
                    type="text"
                    name="systemVersion"
                    value={formData.systemVersion}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Date Format
                  </label>
                  <select
                    name="dateFormat"
                    value={formData.dateFormat}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  >
                    {dateFormats.map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Time Format
                  </label>
                  <select
                    name="timeFormat"
                    value={formData.timeFormat}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  >
                    {timeFormats.map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Notification Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="enableSMSNotifications"
                    checked={formData.enableSMSNotifications}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 mr-3"
                  />
                  <span className="text-sm text-gray-900 font-medium">Enable SMS Notifications</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="enableEmailNotifications"
                    checked={formData.enableEmailNotifications}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 mr-3"
                  />
                  <span className="text-sm text-gray-900 font-medium">Enable Email Notifications</span>
                </label>
              </div>
            </div>

            {/* Backup Settings */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Backup Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <label className="flex items-center col-span-full">
                  <input
                    type="checkbox"
                    name="enableAutoBackup"
                    checked={formData.enableAutoBackup}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 mr-3"
                  />
                  <span className="text-sm text-gray-900 font-medium">Enable Automatic Backup</span>
                </label>

                {formData.enableAutoBackup && (
                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">
                      Backup Frequency
                    </label>
                    <select
                      name="backupFrequency"
                      value={formData.backupFrequency}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    >
                      {backupFrequencies.map(freq => (
                        <option key={freq} value={freq.toLowerCase()}>{freq}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Security Settings */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Security Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    name="sessionTimeout"
                    value={formData.sessionTimeout}
                    onChange={handleChange}
                    min="5"
                    max="120"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="enableMaintenanceMode"
                    checked={formData.enableMaintenanceMode}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 mr-3"
                  />
                  <span className="text-sm text-gray-900 font-medium">Enable Maintenance Mode</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <i className="fas fa-save mr-2"></i>
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SystemSettings;

