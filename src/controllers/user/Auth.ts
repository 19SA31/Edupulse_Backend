import { IAuthService } from "../../interfaces/user/userAuthServiceInterface";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { Request, Response, NextFunction } from "express";
import { ResponseModel } from "../../models/ResponseModel";

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
      const data = req.body;
      console.log(data);
      
      await this.authService.signUp(data);

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
      } else if (error.message === "Otp not send") {
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
      const data = req.body;
      
      const isVerified = await this.authService.otpCheck(data);
      
      if (!isVerified) {
        const response = new ResponseModel(false, "OTP verification failed");
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }
      
      const response = new ResponseModel(true, "OTP verified successfully");
      res.status(HTTP_statusCode.OK).json(response);
      
    } catch (error: any) {
      console.error("Error in verifyOtp:", error);
      
      let response: ResponseModel;
      if (error.message === "OTP not found") {
        response = new ResponseModel(false, "OTP not found or expired");
        res.status(HTTP_statusCode.BadRequest).json(response);
      } else {
        response = new ResponseModel(false, "Server error occurred");
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async userLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = req.body;
      
      const loginResult = await this.authService.loginService(data);
      console.log("inside userLogin contrl",loginResult)
      const response = new ResponseModel(
        true, 
        "User logged in successfully", 
        {
          accessToken: loginResult.accessToken,
          refreshToken: loginResult.refreshToken,
          user: loginResult.user,
        }
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
      
      res.status(HTTP_statusCode.OK).json(response);
      
    } catch (error: any) {
      console.error("Error in login: ", error);
      
      let response: ResponseModel;
      if (error.message === "Invalid email") {
        response = new ResponseModel(false, "Invalid email address");
        res.status(HTTP_statusCode.BadRequest).json(response);
      } else if (error.message === "Invalid password") {
        response = new ResponseModel(false, "Invalid password");
        res.status(HTTP_statusCode.BadRequest).json(response);
      } else if (error.message === "User blocked") {
        response = new ResponseModel(false, "Your account has been blocked");
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
      const data = req.body;
      
      await this.authService.resetPasswordService(data);
      
      const response = new ResponseModel(true, "Password reset successfully");
      res.status(HTTP_statusCode.OK).json(response);
      
    } catch (error: any) {
      console.error("Error in reset password: ", error);
      
      let response: ResponseModel;
      if (error.message === "Invalid email") {
        response = new ResponseModel(false, "Email address not found");
        res.status(HTTP_statusCode.BadRequest).json(response);
      } else {
        response = new ResponseModel(false, "Internal Server Error");
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async logoutUser(req: Request, res: Response): Promise<void> {
    try {
      console.log("insidelogoutuser");
      
      res.clearCookie("refreshToken", {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
      });
      
      const response = new ResponseModel(true, "You have been logged out successfully");
      res.status(HTTP_statusCode.OK).json(response);
      
    } catch (error: any) {
      const response = new ResponseModel(false, `Internal server error: ${error.message}`);
      res.status(HTTP_statusCode.InternalServerError).json(response);
    }
  }
}