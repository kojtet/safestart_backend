const welcomeTemplate = (user) => {
  return {
    subject: 'Welcome to SafeStart!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SafeStart</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0; text-align: center;">
          <!-- Logo Section -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo" alt="SafeStart Logo" style="max-width: 200px; height: auto;">
          </div>
          
          <h1 style="color: #044cac; margin-bottom: 20px;">🚗 Welcome to SafeStart!</h1>
          <p style="font-size: 18px; margin-bottom: 30px;">Hi ${user.firstName || user.name},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            Welcome to SafeStart! Your account has been successfully created and you're now ready to 
            manage your vehicle inspections with ease and confidence.
          </p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #044cac; margin-top: 0;">What you can do now:</h3>
            <ul style="text-align: left; padding-left: 20px;">
              <li>Create and manage vehicle profiles</li>
              <li>Schedule and conduct inspections</li>
              <li>Track maintenance and issues</li>
              <li>Generate compliance reports</li>
              <li>Receive safety alerts and reminders</li>
            </ul>
          </div>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="display: inline-block; background-color: #044cac; color: #ffffff; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
            Get Started
          </a>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you have any questions, feel free to contact our support team.
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
Welcome to SafeStart!

Hi ${user.firstName || user.name},

Welcome to SafeStart! Your account has been successfully created and you're now ready to manage your vehicle inspections with ease and confidence.

What you can do now:
- Create and manage vehicle profiles
- Schedule and conduct inspections
- Track maintenance and issues
- Generate compliance reports
- Receive safety alerts and reminders

Get started at: ${process.env.FRONTEND_URL}/dashboard

If you have any questions, feel free to contact our support team.

Best regards,
The SafeStart Team
    `
  };
};

module.exports = welcomeTemplate; 