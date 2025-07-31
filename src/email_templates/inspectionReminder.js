const inspectionReminderTemplate = (user, inspection) => {
  return {
    subject: 'Vehicle Inspection Reminder - SafeStart',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inspection Reminder - SafeStart</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;">
          <!-- Logo Section -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo" alt="SafeStart Logo" style="max-width: 200px; height: auto;">
          </div>
          
          <h1 style="color: #044cac; margin-bottom: 20px; text-align: center;">⚠️ Inspection Reminder</h1>
          <p style="font-size: 18px; margin-bottom: 30px;">Hi ${user.firstName || user.name},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            This is a reminder that your vehicle inspection is due. Please complete the inspection as soon as possible to ensure vehicle safety and compliance.
          </p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #044cac;">
            <h3 style="color: #044cac; margin-top: 0;">Inspection Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Vehicle:</td>
                <td style="padding: 8px 0;">${inspection.vehicleName || inspection.vehicleId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Due Date:</td>
                <td style="padding: 8px 0; color: #e74c3c;">${new Date(inspection.dueDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Type:</td>
                <td style="padding: 8px 0;">${inspection.type}</td>
              </tr>
              ${inspection.description ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Description:</td>
                <td style="padding: 8px 0;">${inspection.description}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/inspections/${inspection.id}" 
               style="display: inline-block; background-color: #044cac; color: #ffffff; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Complete Inspection
            </a>
          </div>
          <div style="background-color: #e8f4fd; border: 1px solid #044cac; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #044cac; margin-top: 0;">💡 Safety Tip:</h4>
            <p style="color: #2c3e50; margin: 0;">
              Regular vehicle inspections help prevent accidents and ensure your vehicle meets safety standards. 
              Don't delay - safety comes first!
            </p>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you have any questions about this inspection, please contact our support team.
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
Vehicle Inspection Reminder - SafeStart

Hi ${user.firstName || user.name},

This is a reminder that your vehicle inspection is due. Please complete the inspection as soon as possible to ensure vehicle safety and compliance.

Inspection Details:
- Vehicle: ${inspection.vehicleName || inspection.vehicleId}
- Due Date: ${new Date(inspection.dueDate).toLocaleDateString()}
- Type: ${inspection.type}
${inspection.description ? `- Description: ${inspection.description}` : ''}

Complete your inspection at: ${process.env.FRONTEND_URL}/inspections/${inspection.id}

Safety Tip: Regular vehicle inspections help prevent accidents and ensure your vehicle meets safety standards. Don't delay - safety comes first!

If you have any questions about this inspection, please contact our support team.

Best regards,
The SafeStart Team
    `
  };
};

module.exports = inspectionReminderTemplate; 