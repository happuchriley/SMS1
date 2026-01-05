/**
 * Reminders Service
 * Handles SMS/Email reminders for bills, payments, events, staff, etc.
 */
import apiService from './api';

const REMINDERS_TYPE = 'reminders';

interface ReminderData {
  type: string;
  message: string;
  status?: string;
  createdBy?: string;
  scheduledDate?: string;
  studentId?: string;
  staffId?: string;
  reminderType?: string;
  studentIds?: string[];
  staffIds?: string[];
  eventTitle?: string;
  eventDate?: string;
  recipientType?: string;
  [key: string]: any;
}

interface ReminderResponse {
  success: boolean;
  sent: number;
  reminders?: (ReminderData & { id: string })[];
  notifications?: (ReminderData & { id: string })[];
  reminder?: ReminderData & { id: string };
}

const remindersService = {
  // General Reminders
  async getAllReminders(): Promise<(ReminderData & { id: string })[]> {
    return await apiService.getAll<ReminderData & { id: string }>(REMINDERS_TYPE);
  },

  async getReminderById(id: string): Promise<ReminderData & { id: string }> {
    return await apiService.getById<ReminderData & { id: string }>(REMINDERS_TYPE, id);
  },

  async createReminder(reminderData: ReminderData): Promise<ReminderData & { id: string }> {
    if (!reminderData.type || !reminderData.message) {
      throw new Error('Reminder type and message are required');
    }

    if (!reminderData.status) {
      reminderData.status = 'pending';
    }

    if (!reminderData.createdBy) {
      reminderData.createdBy = sessionStorage.getItem('username') || 'Unknown';
    }

    // Set scheduled date if not provided
    if (!reminderData.scheduledDate) {
      reminderData.scheduledDate = new Date().toISOString();
    }

    return await apiService.create<ReminderData & { id: string }>(REMINDERS_TYPE, reminderData);
  },

  async updateReminder(id: string, reminderData: Partial<ReminderData>): Promise<ReminderData & { id: string }> {
    return await apiService.update<ReminderData & { id: string }>(REMINDERS_TYPE, id, reminderData);
  },

  async deleteReminder(id: string): Promise<void> {
    await apiService.delete(REMINDERS_TYPE, id);
  },

  // Bill Reminders
  async sendBillReminder(reminderData: ReminderData): Promise<ReminderResponse> {
    if (!reminderData.studentIds || reminderData.studentIds.length === 0) {
      throw new Error('At least one student must be selected');
    }
    if (!reminderData.message) {
      throw new Error('Message is required');
    }

    // Create reminder record for each student
    const reminders: (ReminderData & { id: string })[] = [];
    for (const studentId of reminderData.studentIds) {
      const reminder = await this.createReminder({
        ...reminderData,
        type: 'bill',
        studentId,
        reminderType: reminderData.reminderType || 'sms'
      });
      reminders.push(reminder);
    }

    // Simulate sending - in real implementation, this would call SMS/Email service
    return {
      success: true,
      sent: reminders.length,
      reminders
    };
  },

  // Payment Notifications
  async sendPaymentNotification(notificationData: ReminderData): Promise<ReminderResponse> {
    if (!notificationData.studentIds || notificationData.studentIds.length === 0) {
      throw new Error('At least one student must be selected');
    }
    if (!notificationData.message) {
      throw new Error('Message is required');
    }

    const notifications: (ReminderData & { id: string })[] = [];
    for (const studentId of notificationData.studentIds) {
      const notification = await this.createReminder({
        ...notificationData,
        type: 'payment',
        studentId,
        reminderType: notificationData.reminderType || 'sms'
      });
      notifications.push(notification);
    }

    return {
      success: true,
      sent: notifications.length,
      notifications
    };
  },

  // Event Reminders
  async sendEventReminder(reminderData: ReminderData): Promise<ReminderResponse> {
    if (!reminderData.eventTitle || !reminderData.eventDate) {
      throw new Error('Event title and date are required');
    }
    if (!reminderData.message) {
      throw new Error('Message is required');
    }

    const reminder = await this.createReminder({
      ...reminderData,
      type: 'event',
      reminderType: reminderData.reminderType || 'sms'
    });

    // Simulate sending based on recipient type
    let sent = 0;
    if (reminderData.recipientType === 'all') {
      // Would send to all students and staff
      sent = 100; // Simulated
    } else if (reminderData.recipientType === 'Specific Class') {
      // Would send to specific class
      sent = 25; // Simulated
    }

    return {
      success: true,
      sent,
      reminder
    };
  },

  // Staff Reminders
  async sendStaffReminder(reminderData: ReminderData): Promise<ReminderResponse> {
    if (!reminderData.staffIds || reminderData.staffIds.length === 0) {
      throw new Error('At least one staff member must be selected');
    }
    if (!reminderData.message) {
      throw new Error('Message is required');
    }

    const reminders: (ReminderData & { id: string })[] = [];
    for (const staffId of reminderData.staffIds) {
      const reminder = await this.createReminder({
        ...reminderData,
        type: 'staff',
        staffId,
        reminderType: reminderData.reminderType || 'sms'
      });
      reminders.push(reminder);
    }

    return {
      success: true,
      sent: reminders.length,
      reminders
    };
  },

  // Application Details
  async sendApplicationDetails(reminderData: ReminderData): Promise<ReminderResponse> {
    if (!reminderData.studentIds || reminderData.studentIds.length === 0) {
      throw new Error('At least one student must be selected');
    }
    if (!reminderData.message) {
      throw new Error('Message is required');
    }

    const notifications: (ReminderData & { id: string })[] = [];
    for (const studentId of reminderData.studentIds) {
      const notification = await this.createReminder({
        ...reminderData,
        type: 'application',
        studentId,
        reminderType: reminderData.reminderType || 'sms'
      });
      notifications.push(notification);
    }

    return {
      success: true,
      sent: notifications.length,
      notifications
    };
  },

  // Get reminders by type
  async getRemindersByType(type: string): Promise<(ReminderData & { id: string })[]> {
    return await apiService.query<ReminderData & { id: string }>(REMINDERS_TYPE, (r: ReminderData & { id: string }) => r.type === type);
  },

  // Get reminders by status
  async getRemindersByStatus(status: string): Promise<(ReminderData & { id: string })[]> {
    return await apiService.query<ReminderData & { id: string }>(REMINDERS_TYPE, (r: ReminderData & { id: string }) => r.status === status);
  },

  // Get pending reminders
  async getPendingReminders(): Promise<(ReminderData & { id: string })[]> {
    return await this.getRemindersByStatus('pending');
  },

  // Get sent reminders
  async getSentReminders(): Promise<(ReminderData & { id: string })[]> {
    return await this.getRemindersByStatus('sent');
  }
};

export default remindersService;

