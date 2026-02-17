/**
 * Notification Service
 * Handles sending login credentials via Email and SMS
 */
import setupService from './setupService';

interface LoginCredentials {
  username: string;
  password: string;
  name: string;
  role: 'staff' | 'parent' | 'student';
  email?: string;
  phone?: string;
}

interface NotificationSettings {
  enableSMSNotifications: boolean;
  enableEmailNotifications: boolean;
  smsApiKey?: string;
  smsApiUrl?: string;
  emailService?: string;
  emailFrom?: string;
}

const notificationService = {
  /**
   * Get notification settings from system settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      // Try to get from system settings
      const settings = await setupService.getSystemSettings();
      if (settings) {
        return {
          enableSMSNotifications: settings?.enableSMSNotifications !== false,
          enableEmailNotifications: settings?.enableEmailNotifications !== false,
          smsApiKey: settings?.smsApiKey,
          smsApiUrl: settings?.smsApiUrl,
          emailService: settings?.emailService,
          emailFrom: settings?.emailFrom || 'noreply@school.com'
        };
      }
      // Default settings if not configured
      return {
        enableSMSNotifications: true,
        enableEmailNotifications: true,
        emailFrom: 'noreply@school.com'
      };
    } catch (error) {
      // Default settings if not configured
      return {
        enableSMSNotifications: true,
        enableEmailNotifications: true,
        emailFrom: 'noreply@school.com'
      };
    }
  },

  /**
   * Send login credentials via SMS
   */
  async sendSMS(credentials: LoginCredentials): Promise<boolean> {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings.enableSMSNotifications || !credentials.phone) {
        return false;
      }

      // Format message for future API implementation
      // const message = this.formatSMSMessage(credentials);
      
      // In a real implementation, this would call an SMS API
      // For now, we'll simulate the API call
      // Simulate API call
      // await fetch(settings.smsApiUrl || 'https://api.smsprovider.com/send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${settings.smsApiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     to: credentials.phone,
      //     message: message
      //   })
      // });

      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Send login credentials via Email
   */
  async sendEmail(credentials: LoginCredentials): Promise<boolean> {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings.enableEmailNotifications || !credentials.email) {
        return false;
      }

      // Format email for future API implementation
      // const emailSubject = this.getEmailSubject(credentials.role);
      // const emailBody = this.formatEmailMessage(credentials);
      
      // In a real implementation, this would call an Email API
      // For now, we'll simulate the API call
      // Simulate API call
      // await fetch(settings.emailService || 'https://api.emailprovider.com/send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${settings.emailApiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     to: credentials.email,
      //     from: settings.emailFrom,
      //     subject: emailSubject,
      //     html: emailBody
      //   })
      // });

      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Send login credentials to staff/teacher
   */
  async sendStaffCredentials(staffData: {
    staffId: string;
    firstName: string;
    surname: string;
    email?: string;
    contact?: string;
    password: string;
  }): Promise<{ smsSent: boolean; emailSent: boolean }> {
    const credentials: LoginCredentials = {
      username: staffData.staffId,
      password: staffData.password,
      name: `${staffData.firstName} ${staffData.surname}`,
      role: 'staff',
      email: staffData.email,
      phone: staffData.contact
    };

    const [smsSent, emailSent] = await Promise.all([
      this.sendSMS(credentials),
      this.sendEmail(credentials)
    ]);

    return { smsSent, emailSent };
  },

  /**
   * Send login credentials to parent
   */
  async sendParentCredentials(parentData: {
    studentId: string;
    studentName: string;
    parentName: string;
    parentEmail?: string;
    parentContact?: string;
    password: string;
  }): Promise<{ smsSent: boolean; emailSent: boolean }> {
    const credentials: LoginCredentials = {
      username: parentData.studentId, // Parents typically use student ID
      password: parentData.password,
      name: parentData.parentName,
      role: 'parent',
      email: parentData.parentEmail,
      phone: parentData.parentContact
    };

    const [smsSent, emailSent] = await Promise.all([
      this.sendSMS(credentials),
      this.sendEmail(credentials)
    ]);

    return { smsSent, emailSent };
  },

  /**
   * Format SMS message
   */
  formatSMSMessage(credentials: LoginCredentials): string {
    const roleText = credentials.role === 'staff' ? 'Staff' : 
                    credentials.role === 'parent' ? 'Parent' : 'Student';
    
    return `Welcome to School Management System!

Your ${roleText} Login Details:
Username: ${credentials.username}
Password: ${credentials.password}

Please keep these credentials secure.
Login at: https://sms.softreturns.com/login

Thank you.`;
  },

  /**
   * Format Email message
   */
  formatEmailMessage(credentials: LoginCredentials): string {
    const roleText = credentials.role === 'staff' ? 'Staff Member' : 
                    credentials.role === 'parent' ? 'Parent/Guardian' : 'Student';
    
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .credentials { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #10b981; }
    .credential-item { margin: 10px 0; }
    .label { font-weight: bold; color: #6b7280; }
    .value { color: #111827; font-family: monospace; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to School Management System</h1>
    </div>
    <div class="content">
      <p>Dear ${credentials.name},</p>
      <p>Your ${roleText} account has been created successfully. Below are your login credentials:</p>
      
      <div class="credentials">
        <div class="credential-item">
          <span class="label">Username:</span>
          <span class="value">${credentials.username}</span>
        </div>
        <div class="credential-item">
          <span class="label">Password:</span>
          <span class="value">${credentials.password}</span>
        </div>
      </div>
      
      <p><strong>Important:</strong> Please keep these credentials secure and do not share them with anyone.</p>
      
      <div style="text-align: center;">
        <a href="https://sms.softreturns.com/login" class="button">Login to Portal</a>
      </div>
      
      <p>If you have any questions or need assistance, please contact the school administration.</p>
      
      <p>Best regards,<br>School Administration</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  /**
   * Get email subject based on role
   */
  getEmailSubject(role: 'staff' | 'parent' | 'student'): string {
    switch (role) {
      case 'staff':
        return 'Your Staff Login Credentials - School Management System';
      case 'parent':
        return 'Your Parent Portal Login Credentials - School Management System';
      case 'student':
        return 'Your Student Portal Login Credentials - School Management System';
      default:
        return 'Your Login Credentials - School Management System';
    }
  }
};

export default notificationService;
