const passwordResetTemplate = (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  return {
    subject: 'Password Reset Request - SafeStart',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - SafeStart</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0; text-align: center;">
          <!-- Logo Section -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo" alt="SafeStart Logo" style="max-width: 200px; height: auto;">
          </div>
          
          <h1 style="color: #044cac; margin-bottom: 20px;">🔐 Password Reset Request</h1>
          <p style="font-size: 18px; margin-bottom: 30px;">Hi ${user.firstName || user.name},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            We received a request to reset your SafeStart account password. Click the button below to create a new password:
          </p>
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #044cac; color: #ffffff; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
            Reset Password
          </a>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left;">
            <h4 style="color: #044cac; margin-top: 0;">⚠️ Important Security Notice:</h4>
            <ul style="color: #856404; padding-left: 20px; margin: 0;">
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #044cac; word-break: break-all;">${resetUrl}</a>
          </p>
          <p style="font-size: 14px; color: #666;">
            Best regards,<br>
            The SafeStart Team
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
Password Reset Request - SafeStart

Hi ${user.firstName || user.name},

We received a request to reset your SafeStart account password. Click the link below to create a new password:

${resetUrl}

Important Security Notice:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Never share this link with anyone

If you have any questions, please contact our support team.

Best regards,
The SafeStart Team
    `
  };
};

module.exports = passwordResetTemplate; 