import { ITutorAuthInterface } from "../../interfaces/tutor/tutorAuthServiceInterface";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { Request, Response, NextFunction } from "express";

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
      console.log(req.body);
      
      await this.authService.signUp(req.body);

      const response = new ResponseModel(true, "OTP sent successfully");
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      let response: ResponseModel;
      
      if (error.message === "Email already in use") {
        response = new ResponseModel(false, "Email already in use");
        res.status(HTTP_statusCode.Conflict).json(response);
      } else if (error.message === "Phone already in use") {
        response = new ResponseModel(false, "Phone number already in use");
        res.status(HTTP_statusCode.Conflict).json(response);
      } else if (error.message === "Email not found") {
        response = new ResponseModel(false, "Email not found");
        res.status(HTTP_statusCode.NotFound).json(response);
      } else if (error.message === "Failed to send OTP email") {
        response = new ResponseModel(false, "OTP not sent");
        res.status(HTTP_statusCode.InternalServerError).json(response);
      } else {
        response = new ResponseModel(false, "Something went wrong, please try again later");
        res.status(HTTP_statusCode.InternalServerError).json(response);
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
      console.log("inside verify otp data:", req.body);
      
      await this.authService.otpCheck(req.body);
      
      console.log("OTP Verified Successfully!");
      const response = new ResponseModel(true, "OTP verified successfully");
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in verifyOtp:", error);
      
      let response: ResponseModel;
      
      if (error.message === "Invalid OTP") {
        response = new ResponseModel(false, "Invalid OTP");
        res.status(HTTP_statusCode.BadRequest).json(response);
      } else if (error.message === "Password is required for new tutor registration") {
        response = new ResponseModel(false, "Password is required");
        res.status(HTTP_statusCode.BadRequest).json(response);
      } else {
        response = new ResponseModel(false, "Server error");
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async tutorLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const loginResult = await this.authService.loginService(req.body);
      console.log("tutorLogin response: ", loginResult);

      const response = new ResponseModel(
        true,
        "Tutor logged in successfully",
        {
          accessToken: loginResult.accessToken,
          refreshToken: loginResult.refreshToken,
          tutor: loginResult.tutor
        }
      );

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
      
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in login: ", error);
      
      let response: ResponseModel;
      
      if (error.message === "Invalid email or password") {
        response = new ResponseModel(false, "Invalid email or password");
        res.status(HTTP_statusCode.BadRequest).json(response);
      } else if (error.message === "Tutor account is blocked") {
        response = new ResponseModel(false, "Tutor account is blocked");
        res.status(HTTP_statusCode.NoAccess).json(response);
      } else {
        response = new ResponseModel(false, "Internal Server Error");
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.authService.resetPasswordService(req.body);
      
      const response = new ResponseModel(true, "Password reset successfully");
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in reset password: ", error);
      
      let response: ResponseModel;
      
      if (error.message === "Email not found") {
        response = new ResponseModel(false, "Email not found");
        res.status(HTTP_statusCode.NotFound).json(response);
      } else {
        response = new ResponseModel(false, "Internal Server Error");
        res.status(HTTP_statusCode.InternalServerError).json(response);
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
      
      const response = new ResponseModel(true, "You have been logged out successfully");
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      const response = new ResponseModel(false, `Internal server error: ${error}`);
      res.status(HTTP_statusCode.InternalServerError).json(response);
    }
  }
}