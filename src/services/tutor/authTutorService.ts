import bcrypt from "bcrypt";
import { S3Service } from "../../utils/s3";
import { ITutorAuthInterface } from "../../interfaces/tutor/tutorAuthServiceInterface";
import { ITutorAuthRepository } from "../../interfaces/tutor/tutorAuthRepoInterface";
import sendMail from "../../config/emailConfig";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {
  CreateTutorType,
  GetTutorDataLogin,
} from "../../interfaces/tutorInterface/tutorInterface";
import {
  SignUpServiceDTO,
  OtpCheckServiceDTO,
  LoginServiceDTO,
  LoginServiceResponseDTO,
  ResetPasswordServiceDTO,
  TutorDataDTO,
} from "../../dto/tutor/TutorAuthDTO";
import { TutorAuthMapper } from "../../mappers/tutor/TutorAuthMapper";

dotenv.config();

export class AuthTutorService implements ITutorAuthInterface {
  private _AuthRepository: ITutorAuthRepository;
  private _saltRounds: number = 10;
  private _s3Service: S3Service;

  constructor(_AuthRepository: ITutorAuthRepository) {
    this._AuthRepository = _AuthRepository;
    this._s3Service = new S3Service();
  }

  private async sendOTP(email: string): Promise<void> {
    const GeneratedOTP: string = Math.floor(
      1000 + Math.random() * 9000
    ).toString();
    const hashedOTP: string = await bcrypt.hash(GeneratedOTP, this._saltRounds);
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

    await this._AuthRepository.saveOTP(email, hashedOTP);
  }

  async signUp(tutorData: SignUpServiceDTO): Promise<boolean> {
    console.log("Reached tutor signup");

    const response = await this._AuthRepository.existTutor(
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

  async otpCheck(tutorData: OtpCheckServiceDTO): Promise<boolean> {
    console.log("Reached otpCheck service");

    const isOtpValid = await this._AuthRepository.verifyOtp(
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
      this._saltRounds
    );

    const newtutorData: CreateTutorType = {
      name: tutorData.name ?? "",
      email: tutorData.email,
      phone: tutorData.phone ?? "",
      password: hashedPassword,
      createdAt: new Date(),
    };

    await this._AuthRepository.createTutor(newtutorData);
    return true;
  }

  
  async loginService(
    tutorData: LoginServiceDTO
  ): Promise<LoginServiceResponseDTO> {
    console.log("Reached login service");

    const loggedTutor = await this._AuthRepository.verifyTutor(
      tutorData.email,
      tutorData.password
    );

    if (!loggedTutor) {
      throw new Error("Invalid email or password");
    }

    const { _id, email, name, isVerified, avatar, phone, DOB, gender } = loggedTutor;
    console.log("inside service,", loggedTutor)
    
    const doc = await this._AuthRepository.checkVerificationStatus(_id);

    let verificationStatus:
      | "not_submitted"
      | "pending"
      | "approved"
      | "rejected";

    if (!doc) {
      verificationStatus = "not_submitted";
    } else {
      verificationStatus = doc.verificationStatus as
        | "not_submitted"
        | "pending"
        | "approved"
        | "rejected";
    }

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

    let avatarUrl = null;
    if (avatar) {
      try {
        avatarUrl = await this._s3Service.getFile(avatar);
      } catch (error) {
        console.warn("Failed to generate avatar URL:", error);
      }
    }

    const tutorResponseData: GetTutorDataLogin = {
      id: _id,
      name,
      email,
      phone,
      DOB,
      gender,
      avatar: avatarUrl|| null, 
      isVerified,
      verificationStatus: verificationStatus,
    };

    return TutorAuthMapper.mapLoginServiceResponse(
      accessToken,
      refreshToken,
      tutorResponseData
    );
  }

  async resetPasswordService(
    tutorData: ResetPasswordServiceDTO
  ): Promise<void> {
    const hashedPassword = await bcrypt.hash(
      tutorData.password,
      this._saltRounds
    );

    await this._AuthRepository.resetPassword(tutorData.email, hashedPassword);
  }
}