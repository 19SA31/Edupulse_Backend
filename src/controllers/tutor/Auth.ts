import { ITutorAuthInterface } from "../../interfaces/tutor/tutorAuthServiceInterface";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { Request, Response, NextFunction } from "express";
import {
  SendOtpRequestDTO,
  SendOtpResponseDTO,
  VerifyOtpRequestDTO,
  VerifyOtpResponseDTO,
  TutorLoginRequestDTO,
  TutorLoginResponseDTO,
  ResetPasswordRequestDTO,
  ResetPasswordResponseDTO,
  LogoutResponseDTO,
} from "../../dto/tutor/TutorAuthDTO";
import { TutorAuthMapper } from "../../mappers/tutor/TutorAuthMapper";

// ResponseModel implementation at controller level
export class ResponseModel<T = null> {
  success: boolean;
  message: string;
  data: T | null;

  constructor(success: boolean, message: string, data?: T | null) {
    this.success = success;
    this.message = message;
    this.data = data !== undefined ? data : null;
  }
}

export class AuthTutorController {
  private authService: ITutorAuthInterface;

  constructor(authServiceInstance: ITutorAuthInterface) {
    this.authService = authServiceInstance;
  }

  async sendOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log("inside create tutor auth");
      const requestDTO: SendOtpRequestDTO = req.body;
      console.log(requestDTO);
      
      const serviceDTO = TutorAuthMapper.mapSendOtpRequestToService(requestDTO);
      await this.authService.signUp(serviceDTO);

      const responseDTO: SendOtpResponseDTO = TutorAuthMapper.mapSendOtpResponse(
        true,
        "OTP sent successfully"
      );
      
      res.status(HTTP_statusCode.OK).json(responseDTO);
    } catch (error: any) {
      let responseDTO: SendOtpResponseDTO;
      
      if (error.message === "Email already in use") {
        responseDTO = TutorAuthMapper.mapSendOtpResponse(false, "Email already in use");
        res.status(HTTP_statusCode.Conflict).json(responseDTO);
      } else if (error.message === "Phone already in use") {
        responseDTO = TutorAuthMapper.mapSendOtpResponse(false, "Phone number already in use");
        res.status(HTTP_statusCode.Conflict).json(responseDTO);
      } else if (error.message === "Email not found") {
        responseDTO = TutorAuthMapper.mapSendOtpResponse(false, "Email not found");
        res.status(HTTP_statusCode.NotFound).json(responseDTO);
      } else if (error.message === "Failed to send OTP email") {
        responseDTO = TutorAuthMapper.mapSendOtpResponse(false, "OTP not sent");
        res.status(HTTP_statusCode.InternalServerError).json(responseDTO);
      } else {
        responseDTO = TutorAuthMapper.mapSendOtpResponse(false, "Something went wrong, please try again later");
        res.status(HTTP_statusCode.InternalServerError).json(responseDTO);
      }
      next(error);
    }
  }

  async verifyOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log("inside verify otp controller");
      const requestDTO: VerifyOtpRequestDTO = req.body;
      console.log("inside verify otp data:", requestDTO);
      
      const serviceDTO = TutorAuthMapper.mapVerifyOtpRequestToService(requestDTO);
      await this.authService.otpCheck(serviceDTO);
      
      console.log("OTP Verified Successfully!");
      const responseDTO: VerifyOtpResponseDTO = TutorAuthMapper.mapVerifyOtpResponse(
        true,
        "OTP verified successfully"
      );
      
      res.status(HTTP_statusCode.OK).json(responseDTO);
    } catch (error: any) {
      console.error("Error in verifyOtp:", error);
      
      let responseDTO: VerifyOtpResponseDTO;
      
      if (error.message === "Invalid OTP") {
        responseDTO = TutorAuthMapper.mapVerifyOtpResponse(false, "Invalid OTP");
        res.status(HTTP_statusCode.BadRequest).json(responseDTO);
      } else if (error.message === "Password is required for new tutor registration") {
        responseDTO = TutorAuthMapper.mapVerifyOtpResponse(false, "Password is required");
        res.status(HTTP_statusCode.BadRequest).json(responseDTO);
      } else {
        responseDTO = TutorAuthMapper.mapVerifyOtpResponse(false, "Server error");
        res.status(HTTP_statusCode.InternalServerError).json(responseDTO);
      }
    }
  }

  async tutorLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const requestDTO: TutorLoginRequestDTO = req.body;
      
      const serviceDTO = TutorAuthMapper.mapLoginRequestToService(requestDTO);
      const loginResult = await this.authService.loginService(serviceDTO);
      console.log("tutorLogin response: ", loginResult);

      const serviceResponseDTO = TutorAuthMapper.mapLoginServiceResponse(
        loginResult.accessToken,
        loginResult.refreshToken,
        loginResult.tutor
      );

      const responseDTO: TutorLoginResponseDTO = TutorAuthMapper.mapTutorLoginResponse(
        true,
        "Tutor logged in successfully",
        serviceResponseDTO
      );

      // Set cookies for successful login
      res.cookie("RefreshToken", loginResult.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      res.cookie("AccessToken", loginResult.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      });
      
      res.status(HTTP_statusCode.OK).json(responseDTO);
    } catch (error: any) {
      console.error("Error in login: ", error);
      
      let responseDTO: Partial<TutorLoginResponseDTO>;
      
      if (error.message === "Invalid email or password") {
        responseDTO = TutorAuthMapper.mapErrorResponse(false, "Invalid email or password");
        res.status(HTTP_statusCode.BadRequest).json(responseDTO);
      } else if (error.message === "Tutor account is blocked") {
        responseDTO = TutorAuthMapper.mapErrorResponse(false, "Tutor account is blocked");
        res.status(HTTP_statusCode.NoAccess).json(responseDTO);
      } else {
        responseDTO = TutorAuthMapper.mapErrorResponse(false, "Internal Server Error");
        res.status(HTTP_statusCode.InternalServerError).json(responseDTO);
      }
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const requestDTO: ResetPasswordRequestDTO = req.body;
      
      const serviceDTO = TutorAuthMapper.mapResetPasswordRequestToService(requestDTO);
      await this.authService.resetPasswordService(serviceDTO);
      
      const responseDTO: ResetPasswordResponseDTO = TutorAuthMapper.mapResetPasswordResponse(
        true,
        "Password reset successfully"
      );
      
      res.status(HTTP_statusCode.OK).json(responseDTO);
    } catch (error: any) {
      console.error("Error in reset password: ", error);
      
      let responseDTO: ResetPasswordResponseDTO;
      
      if (error.message === "Email not found") {
        responseDTO = TutorAuthMapper.mapResetPasswordResponse(false, "Email not found");
        res.status(HTTP_statusCode.NotFound).json(responseDTO);
      } else {
        responseDTO = TutorAuthMapper.mapResetPasswordResponse(false, "Internal Server Error");
        res.status(HTTP_statusCode.InternalServerError).json(responseDTO);
      }
    }
  }

  async logoutTutor(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
      });
      
      const responseDTO: LogoutResponseDTO = TutorAuthMapper.mapLogoutResponse(
        true,
        "You have been logged out successfully"
      );
      
      res.status(HTTP_statusCode.OK).json(responseDTO);
    } catch (error: any) {
      const responseDTO: LogoutResponseDTO = TutorAuthMapper.mapLogoutResponse(
        false,
        `Internal server error: ${error}`
      );
      
      res.status(HTTP_statusCode.InternalServerError).json(responseDTO);
    }
  }
}