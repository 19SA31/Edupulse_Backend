import bcrypt from "bcrypt";
import { IAuthService } from "../../interfaces/user/userAuthServiceInterface";
import { IAuthRepository } from "../../interfaces/user/userAuthRepoInterface";
import sendMail from "../../config/emailConfig";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {  CreateUserType, GetUserData, NewUserType } from "../../interfaces/userInterface/userInterface";

dotenv.config();

export class AuthService implements IAuthService {
  private AuthRepository: IAuthRepository;
  private saltRounds: number = 10;

  constructor(AuthRepository: IAuthRepository) {
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

  async signUp(userData: {
    email: string;
    phone?: string;
    isForgot?: boolean;
  }): Promise<{ success: boolean }> {
    try {
      console.log("Reached user signup");

      const response = await this.AuthRepository.existUser(
        userData.email,
        userData.phone
      );

      if (userData.isForgot) {
        console.log("forgot password");
        if (!response.data?.existEmail) {
          throw new Error("Email not found");
        }
        return await this.sendOTP(userData.email);
      }
      
      if (response.data?.existEmail) {
        throw new Error("Email already in use");
      }
      if (response.data?.existPhone) {
        throw new Error("Phone already in use");
      }
      

      return await this.sendOTP(userData.email);
    } catch (error: any) {
      console.error("Error in signUp:", error.message);
      return { success: false };
    }
  }

  async otpCheck(userData: {
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
        userData.email,
        userData.otp
      );
      console.log("verifyotp respo response in auth service: ",response)
      if (!response.success) {
        return { success: false };
      }

      if (userData.isForgot) {
        return { success: true };
      }

      if (!userData.password) {
        throw new Error("Password is required for new user registration.");
      }

      const hashedPassword: string = await bcrypt.hash(
        userData.password,
        this.saltRounds
      );

      const newUserData: CreateUserType = {
        name: userData.name ?? "",
        email: userData.email,
        phone: userData.phone ?? "",
        password: hashedPassword,
        createdAt: new Date(),
      };

      await this.AuthRepository.createUser(newUserData);
      return { success: true };
    } catch (error: any) {
      console.error("Error in otpCheck:", error);
      return { success: false };
    }
  }

  async loginService(userData: { email: string; password: string }): Promise<{ 
    success: boolean; 
    message: string; 
    accessToken?: string; 
    refreshToken?: string;
    user?: GetUserData; 
  }> {
    try {
      console.log("Reached login service");
  
      const loggedUser = await this.AuthRepository.verifyUser(userData.email, userData.password);
      console.log(loggedUser)
      if (!loggedUser.success || !loggedUser.data) {
        return { success: false, message: loggedUser.message }; // Provide specific error message
      }
  
      const { _id, email, name } = loggedUser.data;
  
      const accessToken = jwt.sign(
        { id: _id, email, role: "user" },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
  
      const refreshToken = jwt.sign(
        { id: _id, email, role: "user" },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );
  
      return { 
        success: true, 
        message: "Login successful", 
        accessToken, 
        refreshToken,
        user: { id: _id, name, email }
      };
    } catch (error) {
      console.error("Error in login service:", error);
      return { success: false, message: "Error in login service" };
    }
  }
  
  

  async resetPasswordService(userData: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      console.log("reached resetpassword service");
      const hashedPassword = await bcrypt.hash(
        userData.password,
        this.saltRounds
      );
      const response = await this.AuthRepository.resetPassword(
        userData.email,
        hashedPassword
      );
      return response;
    } catch (error) {
      console.error("Error in resetPassword service: ", error);
      return { success: false, message: "Error in resetpassword service" };
    }
  }
}
