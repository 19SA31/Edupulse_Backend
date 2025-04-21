import { IAuthService } from "../../interfaces/user/userAuthServiceInterface";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { Request, Response, NextFunction } from "express";

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
      console.log("inside create user auth");
      const data = req.body;
      console.log(data);
      const response = await this.authService.signUp(data);

      if (!response.success) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ success: response.success });
        return;
      }

      res.status(HTTP_statusCode.OK).json({ success: response.success });
    } catch (error: any) {
      if (error.message === "Email already in use") {
        res
          .status(HTTP_statusCode.Conflict)
          .json({ message: "Email already in use" });
      } else if (error.message === "Phone already in use") {
        res
          .status(HTTP_statusCode.Conflict)
          .json({ message: "Phone number already in use" });
      } else if (error.message === "Otp not send") {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "OTP not sent" });
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Something went wrong, please try again later" });
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
      const data = req.body;
      console.log("inside verify otp data:",data)
      const response = await this.authService.otpCheck(data);
      console.log("OTP Check Response:", response);
      if (!response.success) {
        console.log("OTP verification failed!");
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ success: response.success });
        return;
      }
      console.log("OTP Verified Successfully!");
      res
        .status(HTTP_statusCode.OK)
        .json({ success: true, message: "OTP verified" });
    } catch (error) {
      console.error("Error in verifyOtp:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ success: false, message: "Server error" });
    }
  }

  async userLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = req.body;
      console.log("inside login: ", data);

      const response = await this.authService.loginService(data);
      console.log("userLogin response: ", response);

      if (!response.success) {
        console.log("user login failed");
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ success: response.success, message: response.message });
        return;
      }

      console.log("user logged in successfully");
      res.status(HTTP_statusCode.OK).json({
        success: true,
        message: "User logged in",
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      });
    } catch (error) {
      console.error("Error in login: ", error);
      res.status(HTTP_statusCode.InternalServerError).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = req.body;
      console.log("inside reset password: ", data);

      const response = await this.authService.resetPasswordService(data);
      console.log("userLogin response: ", response);

      if (response.success) {
        res.json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (error) {
      console.error("Error in reset password: ", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async logoutUser(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
      });
      res
        .status(HTTP_statusCode.OK)
        .json({ message: "You have been logged Out Successfully" });
    } catch (error: any) {
      res.status(HTTP_statusCode.InternalServerError).json({
        message: `Internal server error : ${error}`,
      });
    }
  }
}
