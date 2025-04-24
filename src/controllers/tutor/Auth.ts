import { ITutorAuthInterface } from "../../interfaces/tutor/tutorAuthServiceInterface";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { Request, Response, NextFunction } from "express";

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

  async tutorLogin(
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
        console.log("tutor login failed");
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ success: response.success, message: response.message });
        return;
      }

      console.log("tutor logged in successfully");
      res.status(HTTP_statusCode.OK).json({
        success: true,
        message: "Tutor logged in",
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        tutor: response.tutor,
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
      console.log("tutorLogin response: ", response);

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

  async logoutTutor(req: Request, res: Response): Promise<void> {
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
