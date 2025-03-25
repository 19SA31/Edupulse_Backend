import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { otpTemplate } from '../utils/emailTemplate';

dotenv.config();

const sendMail = async (email: string, subject: string, otp: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASS as string,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL as string,
      to: email,
      subject: subject,
      
      html:otpTemplate(otp)
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        resolve(false);  
      } else {
        console.log("Email sent: " + info.response);
        resolve(true); 
      }
    });
  });
};

export default sendMail;
