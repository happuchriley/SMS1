/**
 * Reminders Service
 * Handles SMS/Email reminders for bills, payments, events, staff, etc.
 */
import apiService from './api';

const REMINDERS_TYPE = 'reminders';

const remindersService = {
  // General Reminders
  async getAllReminders() {
    return await apiService.getAll(REMINDERS_TYPE);
  },

  async getReminderById(id) {
    return await apiService.getById(REMINDERS_TYPE, id);
  },

  async createReminder(reminderData) {
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

    return await apiService.create(REMINDERS_TYPE, reminderData);
  },

  async updateReminder(id, reminderData) {
    return await apiService.update(REMINDERS_TYPE, id, reminderData);
  },

  async deleteReminder(id) {
    return await apiService.delete(REMINDERS_TYPE, id);
  },

  // Bill Reminders
  async sendBillReminder(reminderData) {
    if (!reminderData.studentIds || reminderData.studentIds.length === 0) {
      throw new Error('At least one student must be selected');
    }
    if (!reminderData.message) {
      throw new Error('Message is required');
    }

    // Create reminder record for each student
    const reminders = [];
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
  async sendPaymentNotification(notificationData) {
    if (!notificationData.studentIds || notificationData.studentIds.length === 0) {
      throw new Error('At least one student must be selected');
    }
    if (!notificationData.message) {
      throw new Error('Message is required');
    }

    const notifications = [];
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
  async sendEventReminder(reminderData) {
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
  async sendStaffReminder(reminderData) {
    if (!reminderData.staffIds || reminderData.staffIds.length === 0) {
      throw new Error('At least one staff member must be selected');
    }
    if (!reminderData.message) {
      throw new Error('Message is required');
    }

    const reminders = [];
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
  async sendApplicationDetails(reminderData) {
    if (!reminderData.studentIds || reminderData.studentIds.length === 0) {
      throw new Error('At least one student must be selected');
    }
    if (!reminderData.message) {
      throw new Error('Message is required');
    }

    const notifications = [];
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
  async getRemindersByType(type) {
    return await apiService.query(REMINDERS_TYPE, r => r.type === type);
  },

  // Get reminders by status
  async getRemindersByStatus(status) {
    return await apiService.query(REMINDERS_TYPE, r => r.status === status);
  },

  // Get pending reminders
  async getPendingReminders() {
    return await this.getRemindersByStatus('pending');
  },

  // Get sent reminders
  async getSentReminders() {
    return await this.getRemindersByStatus('sent');
  }
};

export default remindersService;

