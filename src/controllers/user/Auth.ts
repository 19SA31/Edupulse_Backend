import { IAuthService } from "../../interfaces/user/userAuthServiceInterface";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { Request, Response, NextFunction } from "express";
import { ResponseModel } from "../../models/ResponseModel";
import { AuthMapper } from "../../mappers/user/UserAuthMapper";
import { 
  SignUpRequestDto, 
  VerifyOtpRequestDto, 
  LoginRequestDto, 
  ResetPasswordRequestDto 
} from "../../dto/user/UserAuthDTO";

export class AuthController {
  private authService: IAuthService;

  constructor(authServiceInstance: IAuthService) {
    this.authService = authServiceInstance;
  }

  async sendOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      
      const signUpDto: SignUpRequestDto = AuthMapper.mapToSignUpRequest(req.body);
      
      
      if (!signUpDto.email) {
        const response = new ResponseModel(false, "Email is required");
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      await this.authService.signUp(signUpDto);

      const response = AuthMapper.mapToSignUpResponse(true, "OTP sent successfully");
      res.status(HTTP_statusCode.OK).json(response);
      
    } catch (error: any) {
      this.handleSendOtpError(error, res, next);
    }
  }

  async verifyOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      
      const verifyOtpDto: VerifyOtpRequestDto = AuthMapper.mapToVerifyOtpRequest(req.body);
      
      
      if (!verifyOtpDto.email || !verifyOtpDto.otp) {
        const response = new ResponseModel(false, "Email and OTP are required");
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      
      if (!verifyOtpDto.isForgot && !verifyOtpDto.password) {
        const response = new ResponseModel(false, "Password is required for registration");
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }
      
      const isVerified = await this.authService.otpCheck(verifyOtpDto);
      
      if (!isVerified) {
        const response = AuthMapper.mapToVerifyOtpResponse(false, "OTP verification failed");
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }
      
      const response = AuthMapper.mapToVerifyOtpResponse(true, "OTP verified successfully");
      res.status(HTTP_statusCode.OK).json(response);
      
    } catch (error: any) {
      this.handleVerifyOtpError(error, res, next);
    }
  }

  async userLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      
      const loginDto: LoginRequestDto = AuthMapper.mapToLoginRequest(req.body);
      
      
      if (!loginDto.email || !loginDto.password) {
        const response = new ResponseModel(false, "Email and password are required");
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }
      
      const loginResult = await this.authService.loginService(loginDto);
      
      
      const response = AuthMapper.mapToLoginResponse(
        true, 
        "User logged in successfully", 
        loginResult
      );
      
      
      this.setAuthCookies(res, loginResult.accessToken, loginResult.refreshToken);
      
      res.status(HTTP_statusCode.OK).json(response);
      
    } catch (error: any) {
      this.handleLoginError(error, res, next);
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      
      const resetPasswordDto: ResetPasswordRequestDto = AuthMapper.mapToResetPasswordRequest(req.body);
      
      
      if (!resetPasswordDto.email || !resetPasswordDto.password) {
        const response = new ResponseModel(false, "Email and new password are required");
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }
      
      await this.authService.resetPasswordService(resetPasswordDto);
      
      const response = AuthMapper.mapToResetPasswordResponse(true, "Password reset successfully");
      res.status(HTTP_statusCode.OK).json(response);
      
    } catch (error: any) {
      this.handleResetPasswordError(error, res, next);
    }
  }

  async logoutUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      
      this.clearAuthCookies(res);
      
      const response = AuthMapper.mapToLogoutResponse(true, "You have been logged out successfully");
      res.status(HTTP_statusCode.OK).json(response);
      
    } catch (error: any) {
      const response = AuthMapper.mapToLogoutResponse(false, "Internal server error");
      res.status(HTTP_statusCode.InternalServerError).json(response);
      next(error);
    }
  }

  
  private handleSendOtpError(error: any, res: Response, next: NextFunction): void {
    console.error("Error in sendOtp:", error);
    
    let response;
    switch (error.message) {
      case "Email already in use":
        response = AuthMapper.mapToSignUpResponse(false, "Email already in use");
        res.status(HTTP_statusCode.Conflict).json(response);
        break;
      case "Phone already in use":
        response = AuthMapper.mapToSignUpResponse(false, "Phone number already in use");
        res.status(HTTP_statusCode.Conflict).json(response);
        break;
      case "Otp not send":
        response = AuthMapper.mapToSignUpResponse(false, "OTP not sent");
        res.status(HTTP_statusCode.InternalServerError).json(response);
        break;
      case "Email not found":
        response = AuthMapper.mapToSignUpResponse(false, "Email address not found");
        res.status(HTTP_statusCode.BadRequest).json(response);
        break;
      default:
        response = AuthMapper.mapToSignUpResponse(false, "Something went wrong, please try again later");
        res.status(HTTP_statusCode.InternalServerError).json(response);
    }
    
    next(error);
  }

  private handleVerifyOtpError(error: any, res: Response, next: NextFunction): void {
    console.error("Error in verifyOtp:", error);
    
    let response;
    switch (error.message) {
      case "OTP not found":
        response = AuthMapper.mapToVerifyOtpResponse(false, "OTP not found or expired");
        res.status(HTTP_statusCode.BadRequest).json(response);
        break;
      case "Password is required for new user registration":
        response = AuthMapper.mapToVerifyOtpResponse(false, "Password is required for registration");
        res.status(HTTP_statusCode.BadRequest).json(response);
        break;
      default:
        response = AuthMapper.mapToVerifyOtpResponse(false, "Server error occurred");
        res.status(HTTP_statusCode.InternalServerError).json(response);
    }
    
    next(error);
  }

  private handleLoginError(error: any, res: Response, next: NextFunction): void {
    console.error("Error in login:", error);
    
    let response;
    switch (error.message) {
      case "Invalid email":
        response = AuthMapper.mapToLoginResponse(false, "Invalid email address");
        res.status(HTTP_statusCode.BadRequest).json(response);
        break;
      case "Invalid password":
        response = AuthMapper.mapToLoginResponse(false, "Invalid password");
        res.status(HTTP_statusCode.BadRequest).json(response);
        break;
      case "User blocked":
        response = AuthMapper.mapToLoginResponse(false, "Your account has been blocked");
        res.status(HTTP_statusCode.NoAccess).json(response);
        break;
      default:
        response = AuthMapper.mapToLoginResponse(false, "Internal Server Error");
        res.status(HTTP_statusCode.InternalServerError).json(response);
    }
    
    next(error);
  }

  private handleResetPasswordError(error: any, res: Response, next: NextFunction): void {
    console.error("Error in reset password:", error);
    
    let response;
    switch (error.message) {
      case "Invalid email":
        response = AuthMapper.mapToResetPasswordResponse(false, "Email address not found");
        res.status(HTTP_statusCode.BadRequest).json(response);
        break;
      default:
        response = AuthMapper.mapToResetPasswordResponse(false, "Internal Server Error");
        res.status(HTTP_statusCode.InternalServerError).json(response);
    }
    
    next(error);
  }

  
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie("RefreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.cookie("AccessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });
  }

  
  private clearAuthCookies(res: Response): void {
    res.clearCookie("RefreshToken", {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
    });
    
    res.clearCookie("AccessToken", {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
    });
  }
}