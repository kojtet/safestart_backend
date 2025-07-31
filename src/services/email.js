const { Resend } = require('resend');
const emailTemplates = require('../email_templates');

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  constructor() {
    this.from = process.env.EMAIL_FROM || 'noreply@safestart.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'SafeStart';
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const { data, error } = await resend.emails.send({
        from: `${this.fromName} <${this.from}>`,
        to: [to],
        subject: subject,
        html: html,
        text: text || this.stripHtml(html)
      });

      if (error) {
        console.error('Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log('Email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const template = emailTemplates.welcomeTemplate(user);
    return this.sendEmail(user.email, template.subject, template.html, template.text);
  }

  async sendPasswordResetEmail(user, resetToken) {
    const template = emailTemplates.passwordResetTemplate(user, resetToken);
    return this.sendEmail(user.email, template.subject, template.html, template.text);
  }

  async sendAccountVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const subject = 'Verify Your Email - SafeStart';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Verify Your Email Address</h2>
        <p>Hi ${user.firstName || user.name},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a></p>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>The SafeStart Team</p>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendInspectionReminderEmail(user, inspection) {
    const template = emailTemplates.inspectionReminderTemplate(user, inspection);
    return this.sendEmail(user.email, template.subject, template.html, template.text);
  }

  async sendIssueNotificationEmail(user, issue) {
    const template = emailTemplates.issueNotificationTemplate(user, issue);
    return this.sendEmail(user.email, template.subject, template.html, template.text);
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }
}

module.exports = new EmailService();
