import bcrypt from "bcrypt";
import { S3Service } from "../../utils/s3";
import { IAuthService } from "../../interfaces/user/IAuthService";
import { IAuthRepository } from "../../interfaces/user/IAuthRepository";
import sendMail from "../../config/emailConfig";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { CreateUserType } from "../../interfaces/userInterface/userInterface";
import { 
  SignUpRequestDto, 
  VerifyOtpRequestDto, 
  LoginRequestDto, 
  ResetPasswordRequestDto,
  LoginServiceResultDto,
} from "../../dto/user/UserAuthDTO";
import { AuthMapper } from "../../mappers/user/UserAuthMapper";

dotenv.config();

export class AuthService implements IAuthService {
  private _AuthRepository: IAuthRepository;
  private _s3Service: S3Service;
  private _saltRounds: number = 10;

  constructor(AuthRepository: IAuthRepository) {
    this._AuthRepository = AuthRepository;
    this._s3Service = new S3Service();
  }

  private async sendOTP(email: string): Promise<void> {
    const GeneratedOTP: string = Math.floor(
      1000 + Math.random() * 9000
    ).toString();
    const hashedOTP: string = await bcrypt.hash(GeneratedOTP, this._saltRounds);

    const subject = "OTP Verification";
    const sendMailStatus: boolean = await sendMail(
      email,
      subject,
      GeneratedOTP
    );

    if (!sendMailStatus) {
      throw new Error("Otp not send");
    }

    await this._AuthRepository.saveOTP(email, hashedOTP);
  }

  async signUp(userData: SignUpRequestDto): Promise<void> {
    const userExistence = await this._AuthRepository.existUser(
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

  async otpCheck(userData: VerifyOtpRequestDto): Promise<boolean> {
    const isOtpValid = await this._AuthRepository.verifyOtp(
      userData.email,
      userData.otp
    );

    if (!isOtpValid) {
      return false;
    }

    
    if (userData.isForgot) {
      return true;
    }

    
    if (!userData.password) {
      throw new Error("Password is required for new user registration");
    }

    const hashedPassword: string = await bcrypt.hash(
      userData.password,
      this._saltRounds
    );

    const newUserData: CreateUserType = {
      name: userData.name ?? "",
      email: userData.email,
      phone: userData.phone ?? "",
      password: hashedPassword,
      createdAt: new Date(),
    };

    await this._AuthRepository.createUser(newUserData);
    return true;
  }

  async loginService(userData: LoginRequestDto): Promise<LoginServiceResultDto> {
    const loggedUser = await this._AuthRepository.verifyUser(
      userData.email,
      userData.password
    );

    const { _id, email, name, phone, DOB, gender, avatar } = loggedUser;

    let avatarUrl = null;
    if (avatar) {
      try {
        avatarUrl = await this._s3Service.getFile(avatar);
      } catch (error) {
        console.warn("Failed to generate avatar URL:", error);
      }
    }

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

    const userProfile = AuthMapper.mapToUserProfileResponse({
      _id,
      name,
      email,
      phone,
      DOB,
      gender,
      avatar: avatarUrl,
    });

    return AuthMapper.mapToLoginServiceResult(accessToken, refreshToken, userProfile);
  }

  async resetPasswordService(userData: ResetPasswordRequestDto): Promise<void> {
    const hashedPassword = await bcrypt.hash(
      userData.password,
      this._saltRounds
    );

    await this._AuthRepository.resetPassword(userData.email, hashedPassword);
  }
}