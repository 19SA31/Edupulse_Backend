import { IAuthService } from "../../interfaces/user/IAuthService";
import { ITutorAuthInterface } from "../../interfaces/tutor/ITutorAuthInterface";
import { IAdminAuthServiceInterface } from "../../interfaces/admin/IAdminAuthServiceInterface";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { Request, Response, NextFunction } from "express";
import { ResponseModel } from "../../models/ResponseModel";

export class AuthenticationController {
  private userAuthService: IAuthService;
  private tutorAuthService: ITutorAuthInterface;
  private adminAuthService: IAdminAuthServiceInterface;

  constructor(
    userAuthServiceInstance: IAuthService,
    tutorAuthServiceInstance: ITutorAuthInterface,
    adminAuthServiceInstance: IAdminAuthServiceInterface
  ) {
    this.userAuthService = userAuthServiceInstance;
    this.tutorAuthService = tutorAuthServiceInstance;
    this.adminAuthService = adminAuthServiceInstance;
  }

  async sendUserOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        const response = new ResponseModel(false, "Email is required");
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      await this.userAuthService.signUp(req.body);

      const response = new ResponseModel(true, "OTP sent successfully");
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      this.handleUserOtpError(error, res, next);
    }
  }

  async verifyUserOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, otp, password, isForgot } = req.body;

      if (!email || !otp) {
        const response = new ResponseModel(false, "Email and OTP are required");
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      if (!isForgot && !password) {
        const response = new ResponseModel(
          false,
          "Password is required for registration"
        );
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      const isVerified = await this.userAuthService.otpCheck(req.body);

      if (!isVerified) {
        const response = new ResponseModel(false, "OTP verification failed");
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      const response = new ResponseModel(true, "OTP verified successfully");
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      this.handleUserVerifyOtpError(error, res, next);
    }
  }

  async userLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const response = new ResponseModel(
          false,
          "Email and password are required"
        );
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      const loginResult = await this.userAuthService.loginService(req.body);

      const response = new ResponseModel(true, "User logged in successfully", {
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
        user: loginResult.user,
      });

      this.setAuthCookies(
        res,
        loginResult.accessToken,
        loginResult.refreshToken
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      this.handleUserLoginError(error, res, next);
    }
  }

  async resetUserPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const response = new ResponseModel(
          false,
          "Email and new password are required"
        );
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      await this.userAuthService.resetPasswordService(req.body);

      const response = new ResponseModel(true, "Password reset successfully");
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      this.handleUserResetPasswordError(error, res, next);
    }
  }

  async logoutUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      this.clearAuthCookies(res);

      const response = new ResponseModel(
        true,
        "You have been logged out successfully"
      );
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      const response = new ResponseModel(false, "Internal server error");
      res.status(HTTP_statusCode.InternalServerError).json(response);
      next(error);
    }
  }

  async sendTutorOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.tutorAuthService.signUp(req.body);

      const response = new ResponseModel(true, "OTP sent successfully");
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      this.handleTutorOtpError(error, res, next);
    }
  }

  async verifyTutorOtp(req: Request, res: Response): Promise<void> {
    try {
      await this.tutorAuthService.otpCheck(req.body);

      const response = new ResponseModel(true, "OTP verified successfully");
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      this.handleTutorVerifyOtpError(error, res);
    }
  }

  async tutorLogin(req: Request, res: Response): Promise<void> {
    try {
      const loginResult = await this.tutorAuthService.loginService(req.body);

      const response = new ResponseModel(true, "Tutor logged in successfully", {
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
        tutor: loginResult.tutor,
      });

      this.setAuthCookies(
        res,
        loginResult.accessToken,
        loginResult.refreshToken
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      this.handleTutorLoginError(error, res);
    }
  }

  async resetTutorPassword(req: Request, res: Response): Promise<void> {
    try {
      await this.tutorAuthService.resetPasswordService(req.body);

      const response = new ResponseModel(true, "Password reset successfully");
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      this.handleTutorResetPasswordError(error, res);
    }
  }

  async logoutTutor(req: Request, res: Response): Promise<void> {
    try {
      this.clearAuthCookies(res);

      const response = new ResponseModel(
        true,
        "You have been logged out successfully"
      );
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      const response = new ResponseModel(
        false,
        `Internal server error: ${error}`
      );
      res.status(HTTP_statusCode.InternalServerError).json(response);
    }
  }

  async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const response = new ResponseModel(
          false,
          "Email and password are required"
        );
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      const serviceResult = await this.adminAuthService.loginService(req.body);

      if (
        !serviceResult.isValid ||
        !serviceResult.accessToken ||
        !serviceResult.refreshToken
      ) {
        const errorMessage = serviceResult.error || "Invalid credentials";
        const response = new ResponseModel(false, errorMessage);
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      this.setAuthCookies(
        res,
        serviceResult.accessToken,
        serviceResult.refreshToken
      );

      const response = new ResponseModel(true, "Admin logged in successfully", {
        accessToken: serviceResult.accessToken,
        refreshToken: serviceResult.refreshToken,
        admin: serviceResult.admin,
      });

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      this.handleAdminLoginError(error, res);
    }
  }

  async logoutAdmin(req: Request, res: Response): Promise<void> {
    try {
      this.clearAuthCookies(res);

      const response = new ResponseModel(
        true,
        "You have been logged out successfully"
      );
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const response = new ResponseModel(
          false,
          `Internal server error: ${error.message}`
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ): void {
    res.cookie("RefreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("AccessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000,
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

  private handleUserOtpError(
    error: unknown,
    res: Response,
    next: NextFunction
  ): void {
    console.error("Error in sendUserOtp:", error);

    let response: ResponseModel;
    if (error instanceof Error) {
      switch (error.message) {
        case "Email already in use":
          response = new ResponseModel(false, "Email already in use");
          res.status(HTTP_statusCode.Conflict).json(response);
          break;
        case "Phone already in use":
          response = new ResponseModel(false, "Phone number already in use");
          res.status(HTTP_statusCode.Conflict).json(response);
          break;
        case "Otp not send":
          response = new ResponseModel(false, "OTP not sent");
          res.status(HTTP_statusCode.InternalServerError).json(response);
          break;
        case "Email not found":
          response = new ResponseModel(false, "Email address not found");
          res.status(HTTP_statusCode.BadRequest).json(response);
          break;
        default:
          response = new ResponseModel(
            false,
            "Something went wrong, please try again later"
          );
          res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }

    next(error);
  }

  private handleUserVerifyOtpError(
    error: unknown,
    res: Response,
    next: NextFunction
  ): void {
    console.error("Error in verifyUserOtp:", error);

    let response: ResponseModel;
    if (error instanceof Error) {
      switch (error.message) {
        case "OTP not found":
          response = new ResponseModel(false, "OTP not found or expired");
          res.status(HTTP_statusCode.BadRequest).json(response);
          break;
        case "Password is required for new user registration":
          response = new ResponseModel(
            false,
            "Password is required for registration"
          );
          res.status(HTTP_statusCode.BadRequest).json(response);
          break;
        default:
          response = new ResponseModel(false, "Server error occurred");
          res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }

    next(error);
  }

  private handleUserLoginError(
    error: unknown,
    res: Response,
    next: NextFunction
  ): void {
    console.error("Error in userLogin:", error);

    let response: ResponseModel;
    if (error instanceof Error) {
      switch (error.message) {
        case "Invalid email":
          response = new ResponseModel(false, "Invalid email address");
          res.status(HTTP_statusCode.BadRequest).json(response);
          break;
        case "Invalid password":
          response = new ResponseModel(false, "Invalid password");
          res.status(HTTP_statusCode.BadRequest).json(response);
          break;
        case "User blocked":
          response = new ResponseModel(false, "Your account has been blocked");
          res.status(HTTP_statusCode.NoAccess).json(response);
          break;
        default:
          response = new ResponseModel(false, "Internal Server Error");
          res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }

    next(error);
  }

  private handleUserResetPasswordError(
    error: unknown,
    res: Response,
    next: NextFunction
  ): void {
    console.error("Error in resetUserPassword:", error);

    let response: ResponseModel;
    if (error instanceof Error) {
      switch (error.message) {
        case "Invalid email":
          response = new ResponseModel(false, "Email address not found");
          res.status(HTTP_statusCode.BadRequest).json(response);
          break;
        default:
          response = new ResponseModel(false, "Internal Server Error");
          res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }

    next(error);
  }

  private handleTutorOtpError(
    error: unknown,
    res: Response,
    next: NextFunction
  ): void {
    let response: ResponseModel;
    if (error instanceof Error) {
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
        response = new ResponseModel(
          false,
          "Something went wrong, please try again later"
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }

    next(error);
  }

  private handleTutorVerifyOtpError(error: unknown, res: Response): void {
    console.error("Error in verifyTutorOtp:", error);

    let response: ResponseModel;
    if (error instanceof Error) {
      if (error.message === "Invalid OTP") {
        response = new ResponseModel(false, "Invalid OTP");
        res.status(HTTP_statusCode.BadRequest).json(response);
      } else if (
        error.message === "Password is required for new tutor registration"
      ) {
        response = new ResponseModel(false, "Password is required");
        res.status(HTTP_statusCode.BadRequest).json(response);
      } else {
        response = new ResponseModel(false, "Server error");
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  private handleTutorLoginError(error: unknown, res: Response): void {
    console.error("Error in tutorLogin: ", error);

    let response: ResponseModel;
    if (error instanceof Error) {
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

  private handleTutorResetPasswordError(error: unknown, res: Response): void {
    console.error("Error in resetTutorPassword: ", error);

    let response: ResponseModel;
    if (error instanceof Error) {
      if (error.message === "Email not found") {
        response = new ResponseModel(false, "Email not found");
        res.status(HTTP_statusCode.NotFound).json(response);
      } else {
        response = new ResponseModel(false, "Internal Server Error");
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  private handleAdminLoginError(error: unknown, res: Response): void {
    console.error("Error in adminLogin: ", error);

    let response: ResponseModel;
    if (error instanceof Error) {
      if (error.message === "Invalid email or password") {
        response = new ResponseModel(false, "Invalid email or password");
        res.status(HTTP_statusCode.BadRequest).json(response);
      } else {
        response = new ResponseModel(false, "Internal Server Error");
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }
}
