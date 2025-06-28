import bcrypt from "bcrypt";
import { IAuthService } from "../../interfaces/user/userAuthServiceInterface";
import { IAuthRepository } from "../../interfaces/user/userAuthRepoInterface";
import sendMail from "../../config/emailConfig";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {
  CreateUserType,
  GetUserData,
} from "../../interfaces/userInterface/userInterface";

dotenv.config();

export class AuthService implements IAuthService {
  private AuthRepository: IAuthRepository;
  private saltRounds: number = 10;

  constructor(AuthRepository: IAuthRepository) {
    this.AuthRepository = AuthRepository;
  }

  private async sendOTP(email: string): Promise<void> {
    const GeneratedOTP: string = Math.floor(
      1000 + Math.random() * 9000
    ).toString();
    const hashedOTP: string = await bcrypt.hash(GeneratedOTP, this.saltRounds);

    const subject = "OTP Verification";
    const sendMailStatus: boolean = await sendMail(
      email,
      subject,
      GeneratedOTP
    );

    if (!sendMailStatus) {
      throw new Error("Otp not send");
    }

    await this.AuthRepository.saveOTP(email, hashedOTP);
  }

  async signUp(userData: {
    email: string;
    phone?: string;
    isForgot?: boolean;
  }): Promise<void> {
    const userExistence = await this.AuthRepository.existUser(
      userData.email,
      userData.phone
    );

    if (userData.isForgot) {
      if (!userExistence.existEmail) {
        throw new Error("Email not found");
      }
      await this.sendOTP(userData.email);
      return;
    }

    if (userExistence.existEmail) {
      throw new Error("Email already in use");
    }
    if (userExistence.existPhone) {
      throw new Error("Phone already in use");
    }

    await this.sendOTP(userData.email);
  }

  async otpCheck(userData: {
    name?: string;
    email: string;
    phone?: string;
    password?: string;
    otp: string;
    isForgot?: boolean;
  }): Promise<boolean> {
    const isOtpValid = await this.AuthRepository.verifyOtp(
      userData.email,
      userData.otp
    );

    if (!isOtpValid) {
      return false;
    }

    // If it's a forgot password flow, just return true after OTP verification
    if (userData.isForgot) {
      return true;
    }

    // For new user registration, create the user
    if (!userData.password) {
      throw new Error("Password is required for new user registration");
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
    return true;
  }

  async loginService(userData: { email: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: GetUserData;
  }> {
    const loggedUser = await this.AuthRepository.verifyUser(
      userData.email,
      userData.password
    );

    const { _id, email, name } = loggedUser;

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
      accessToken,
      refreshToken,
      user: { id: _id, name, email },
    };
  }

  async resetPasswordService(userData: {
    email: string;
    password: string;
  }): Promise<void> {
    const hashedPassword = await bcrypt.hash(
      userData.password,
      this.saltRounds
    );

    await this.AuthRepository.resetPassword(userData.email, hashedPassword);
  }
}
