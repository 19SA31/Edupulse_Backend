import bcrypt from "bcrypt";
import { ITutorAuthInterface } from "../../interfaces/tutor/tutorAuthServiceInterface";
import { ITutorAuthRepository } from "../../interfaces/tutor/tutorAuthRepoInterface";
import sendMail from "../../config/emailConfig";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {  CreateTutorType, GetTutorData  } from "../../interfaces/tutorInterface/tutorInterface";

dotenv.config();

export class AuthTutorService implements ITutorAuthInterface {
  private AuthRepository: ITutorAuthRepository;
  private saltRounds: number = 10;

  constructor(AuthRepository: ITutorAuthRepository) {
    this.AuthRepository = AuthRepository;
  }

  private async sendOTP(email: string): Promise<{ success: boolean }> {
    const GeneratedOTP: string = Math.floor(
      1000 + Math.random() * 9000
    ).toString();
    const hashedOTP: string = await bcrypt.hash(GeneratedOTP, this.saltRounds);
    console.log("inside sendOTP:",GeneratedOTP)
    const subject = "OTP Verification";
    const sendMailStatus: boolean = await sendMail(
      email,
      subject,
      GeneratedOTP
    );

    if (!sendMailStatus) {
      throw new Error("OTP not sent");
    }

    await this.AuthRepository.saveOTP(email, hashedOTP);
    return { success: true };
  }

  async signUp(tutorData: {
    email: string;
    phone?: string;
    isForgot?: boolean;
  }): Promise<{ success: boolean }> {
    try {
      console.log("Reached tutor signup");

      const response = await this.AuthRepository.existTutor(
        tutorData.email,
        tutorData.phone
      );

      if (tutorData.isForgot) {
        console.log("forgot password");
        if (!response.data?.existEmail) {
          throw new Error("Email not found");
        }
        return await this.sendOTP(tutorData.email);
      }
      
      if (response.data?.existEmail) {
        throw new Error("Email already in use");
      }
      if (response.data?.existPhone) {
        throw new Error("Phone already in use");
      }
      

      return await this.sendOTP(tutorData.email);
    } catch (error: any) {
      console.error("Error in signUp:", error.message);
      return { success: false };
    }
  }

  async otpCheck(tutorData: {
    name?: string;
    email: string;
    phone?: string;
    password?: string;
    otp: string;
    isForgot?: boolean;
  }): Promise<{ success: boolean }> {
    try {
      console.log("Reached otpCheck service");

      const response = await this.AuthRepository.verifyOtp(
        tutorData.email,
        tutorData.otp
      );
      console.log("verifyotp respo response in auth service: ",response)
      if (!response.success) {
        return { success: false };
      }

      if (tutorData.isForgot) {
        return { success: true };
      }

      if (!tutorData.password) {
        throw new Error("Password is required for new tutor registration.");
      }

      const hashedPassword: string = await bcrypt.hash(
        tutorData.password,
        this.saltRounds
      );

      const newtutorData: CreateTutorType = {
        name: tutorData.name ?? "",
        email: tutorData.email,
        phone: tutorData.phone ?? "",
        password: hashedPassword,
        createdAt: new Date(),
      };

      await this.AuthRepository.createTutor(newtutorData);
      return { success: true };
    } catch (error: any) {
      console.error("Error in otpCheck:", error);
      return { success: false };
    }
  }

  async loginService(tutorData: { email: string; password: string }): Promise<{ 
    success: boolean; 
    message: string; 
    accessToken?: string; 
    refreshToken?: string;
    tutor?: GetTutorData; 
  }> {
    try {
      console.log("Reached login service");
  
      const loggedTutor = await this.AuthRepository.verifyTutor(tutorData.email, tutorData.password);
      console.log(loggedTutor)
      if (!loggedTutor.success || !loggedTutor.data) {
        return { success: false, message: loggedTutor.message }; 
      }
  
      const { _id, email, name } = loggedTutor.data;
  
      const accessToken = jwt.sign(
        { id: _id, email, role: "tutor" },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
  
      const refreshToken = jwt.sign(
        { id: _id, email, role: "tutor" },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );
  
      return { 
        success: true, 
        message: "Login successful", 
        accessToken, 
        refreshToken,
        tutor: { id: _id, name, email }
      };
    } catch (error) {
      console.error("Error in login service:", error);
      return { success: false, message: "Error in login service" };
    }
  }
  
  

  async resetPasswordService(tutorData: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      console.log("reached resetpassword service");
      const hashedPassword = await bcrypt.hash(
        tutorData.password,
        this.saltRounds
      );
      const response = await this.AuthRepository.resetPassword(
        tutorData.email,
        hashedPassword
      );
      return response;
    } catch (error) {
      console.error("Error in resetPassword service: ", error);
      return { success: false, message: "Error in resetpassword service" };
    }
  }
}
