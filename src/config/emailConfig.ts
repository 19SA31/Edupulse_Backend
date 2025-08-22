import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  otpTemplate,
  rejectionEmailTemplate,
  courseRejectionEmailTemplate,
  coursePurchaseEmailTemplate,
  tutorNotificationEmailTemplate
} from "../utils/emailTemplate";

dotenv.config();

const sendMail = async (
  email: string,
  subject: string,
  otp: string
): Promise<boolean> => {
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

      html: otpTemplate(otp),
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

export const sendRejectionEmail = async (
  email: string,
  tutorName: string,
  reason: string
): Promise<boolean> => {
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
      subject: "Tutor Application Rejected - Edupulse",
      html: rejectionEmailTemplate(tutorName, reason),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending rejection email:", error);
        resolve(false);
      } else {
        console.log("Rejection email sent: " + info.response);
        resolve(true);
      }
    });
  });
};

export const sendCourseRejectionEmail = async (
  email: string,
  tutorName: string,
  courseTitle: string,
  reason: string
): Promise<boolean> => {
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
      subject: "Course Submission Rejected - Edupulse",
      html: courseRejectionEmailTemplate(tutorName, courseTitle, reason),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending course rejection email:", error);
        resolve(false);
      } else {
        console.log("Course rejection email sent: " + info.response);
        resolve(true);
      }
    });
  });
};

export const sendCoursePurchaseEmail = async (
  email: string,
  userName: string,
  courseTitle: string,
  tutorName: string,
  price: string
): Promise<boolean> => {
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
      subject: "Course Purchase Confirmation - Edupulse",
      html: coursePurchaseEmailTemplate(userName, courseTitle, tutorName, price),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending purchase confirmation email:", error);
        resolve(false);
      } else {
        console.log("Purchase confirmation email sent: " + info.response);
        resolve(true);
      }
    });
  });
};

export const tutorNotificationEmail = async (
  userEmail: string,
  userName: string,
  courseTitle: string,
  tutorName: string,
  tutorEmail: string,
): Promise<boolean> => {
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
      to: tutorEmail,
      subject: "New Enrollment - Edupulse",
      html: tutorNotificationEmailTemplate(tutorName, courseTitle, userName, userEmail),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending tutor notification email:", error);
        resolve(false);
      } else {
        console.log("Tutor notification email sent: " + info.response);
        resolve(true);
      }
    });
  });
};


export default sendMail;
