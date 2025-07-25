export const otpTemplate = (otp:string) => `
  <div style="font-family: Arial, sans-serif; background: #f4f4f9; padding: 30px; text-align: center;">
    <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);">
      <h1 style="font-size: 24px; font-weight: bold; color: #333;">Edupulse</h1>
      <p style="font-size: 16px; color: #555;">Hi,</p>
      <p style="font-size: 16px; color: #555;">Use the OTP below to complete your registration. This OTP is valid for one minute.</p>
      
      <div style="margin: 20px auto; display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; border-radius: 8px; font-size: 24px; font-weight: bold;">
        ${otp}
      </div>
      
      <p style="font-size: 14px; color: #777;">If you did not request this, please ignore this email.</p>
      <p style="font-size: 14px; color: #777;">Best regards,<br>Edupulse Team</p>
    </div>
    <footer style="margin-top: 20px; font-size: 12px; color: #999;">&copy; 2025 Edupulse. All rights reserved.</footer>
  </div>
`;

export const rejectionEmailTemplate = (tutorName: string, reason: string) => `
  <div style="font-family: Arial, sans-serif; background: #f4f4f9; padding: 30px; text-align: center;">
    <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);">
      <h1 style="font-size: 24px; font-weight: bold; color: #333;">Edupulse</h1>
      <p style="font-size: 16px; color: #555;">Hi ${tutorName},</p>
      <p style="font-size: 16px; color: #555;">We regret to inform you that your tutor application has been rejected.</p>
      
      <div style="margin: 20px auto; display: inline-block; padding: 15px 20px; background-color: #dc3545; color: #fff; border-radius: 8px; font-size: 18px; font-weight: bold;">
        Application Rejected
      </div>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
        <h3 style="color: #495057; margin-top: 0;">Reason for Rejection:</h3>
        <p style="color: #6c757d; font-size: 14px; line-height: 1.5; margin-bottom: 0;">${reason}</p>
      </div>
      
      <p style="font-size: 14px; color: #777;">You may reapply after addressing the issues mentioned above. Please ensure all documents meet our requirements.</p>
      <p style="font-size: 14px; color: #777;">For any questions, please contact our support team.</p>
      <p style="font-size: 14px; color: #777;">Best regards,<br>Edupulse Team</p>
    </div>
    <footer style="margin-top: 20px; font-size: 12px; color: #999;">&copy; 2025 Edupulse. All rights reserved.</footer>
  </div>
`;