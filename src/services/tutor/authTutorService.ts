import bcrypt from "bcrypt";
import { ITutorAuthInterface } from "../../interfaces/tutor/tutorAuthServiceInterface";
import { ITutorAuthRepository } from "../../interfaces/tutor/tutorAuthRepoInterface";
import sendMail from "../../config/emailConfig";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { CreateTutorType, GetTutorData } from "../../interfaces/tutorInterface/tutorInterface";

dotenv.config();

export class AuthTutorService implements ITutorAuthInterface {
  private AuthRepository: ITutorAuthRepository;
  private saltRounds: number = 10;

  constructor(AuthRepository: ITutorAuthRepository) {
    this.AuthRepository = AuthRepository;
  }

  private async sendOTP(email: string): Promise<void> {
    const GeneratedOTP: string = Math.floor(
      1000 + Math.random() * 9000
    ).toString();
    const hashedOTP: string = await bcrypt.hash(GeneratedOTP, this.saltRounds);
    console.log("inside sendOTP:", GeneratedOTP);
    
    const subject = "OTP Verification";
    const sendMailStatus: boolean = await sendMail(
      email,
      subject,
      GeneratedOTP
    );

    if (!sendMailStatus) {
      throw new Error("Failed to send OTP email");
    }

    await this.AuthRepository.saveOTP(email, hashedOTP);
  }

  async signUp(tutorData: {
    email: string;
    phone?: string;
    isForgot?: boolean;
  }): Promise<boolean> {
    console.log("Reached tutor signup");

    const response = await this.AuthRepository.existTutor(
      tutorData.email,
      tutorData.phone
    );

    if (tutorData.isForgot) {
      console.log("forgot password");
      if (!response.existEmail) {
        throw new Error("Email not found");
      }
      await this.sendOTP(tutorData.email);
      return true;
    }
    
    if (response.existEmail) {
      throw new Error("Email already in use");
    }
    if (response.existPhone) {
      throw new Error("Phone already in use");
    }
    
    await this.sendOTP(tutorData.email);
    return true;
  }

  async otpCheck(tutorData: {
    name?: string;
    email: string;
    phone?: string;
    password?: string;
    otp: string;
    isForgot?: boolean;
  }): Promise<boolean> {
    console.log("Reached otpCheck service");

    const isOtpValid = await this.AuthRepository.verifyOtp(
      tutorData.email,
      tutorData.otp
    );
    
    console.log("verifyotp response in auth service: ", isOtpValid);
    
    if (!isOtpValid) {
      throw new Error("Invalid OTP");
    }

    if (tutorData.isForgot) {
      return true;
    }

    if (!tutorData.password) {
      throw new Error("Password is required for new tutor registration");
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
    return true;
  }

  async loginService(tutorData: { 
    email: string; 
    password: string 
  }): Promise<{ 
    accessToken: string; 
    refreshToken: string;
    tutor: GetTutorData; 
  }> {
    console.log("Reached login service");

    const loggedTutor = await this.AuthRepository.verifyTutor(
      tutorData.email, 
      tutorData.password
    );
    
    if (!loggedTutor) {
      throw new Error("Invalid email or password");
    }

    const { _id, email, name, isVerified } = loggedTutor;

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
      accessToken, 
      refreshToken,
      tutor: { id: _id, name, email, isVerified }
    };
  }

  async resetPasswordService(tutorData: {
    email: string;
    password: string;
  }): Promise<void> {
    const hashedPassword = await bcrypt.hash(
      tutorData.password,
      this.saltRounds
    );
    
    await this.AuthRepository.resetPassword(
      tutorData.email,
      hashedPassword
    );
  }
}