const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

class SMSService {
  constructor() {
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendSMS(to, message) {
    try {
      const result = await client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });

      console.log('SMS sent successfully:', result.sid);
      return result;
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendVerificationCode(phoneNumber, code) {
    const message = `Your SafeStart verification code is: ${code}. This code will expire in 10 minutes.`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendLoginNotification(phoneNumber, userAgent, location = 'Unknown') {
    const message = `New login detected for your SafeStart account. Device: ${userAgent}. Location: ${location}. If this wasn't you, please contact support immediately.`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendPasswordResetCode(phoneNumber, code) {
    const message = `Your SafeStart password reset code is: ${code}. This code will expire in 10 minutes. If you didn't request this, please ignore this message.`;
    return this.sendSMS(phoneNumber, code);
  }

  async sendTwoFactorCode(phoneNumber, code) {
    const message = `Your SafeStart 2FA code is: ${code}. This code will expire in 5 minutes.`;
    return this.sendSMS(phoneNumber, code);
  }

  async sendAccountLockedNotification(phoneNumber) {
    const message = `Your SafeStart account has been temporarily locked due to multiple failed login attempts. Please contact support to unlock your account.`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendAccountUnlockedNotification(phoneNumber) {
    const message = `Your SafeStart account has been unlocked. You can now log in normally.`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendNewDeviceLogin(phoneNumber, deviceInfo) {
    const message = `New device login detected for your SafeStart account. Device: ${deviceInfo}. If this wasn't you, please change your password immediately.`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendSecurityAlert(phoneNumber, alertType, details = '') {
    const message = `SafeStart Security Alert: ${alertType}. ${details}. Please review your account security settings.`;
    return this.sendSMS(phoneNumber, message);
  }
}

module.exports = new SMSService(); 