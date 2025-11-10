import { IAuthService } from "../../interfaces/user/IAuthService";
import { ITutorAuthInterface } from "../../interfaces/tutor/ITutorAuthService";
import { IAdminAuthServiceInterface } from "../../interfaces/admin/IAdminAuthServiceInterface";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendError } from "../../helper/responseHelper";
import { AppError } from "../../errors/AppError";
import { verifyGoogleToken } from "../../utils/googleAuth";
import { createToken } from "../../utils/jwt";

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
        throw new AppError("Email is required", HTTP_statusCode.BadRequest);
      }

      await this.userAuthService.signUp(req.body);
      sendSuccess(res, "OTP sent successfully");
    } catch (error) {
      next(this.mapUserOtpError(error));
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
        throw new AppError(
          "Email and OTP are required",
          HTTP_statusCode.BadRequest
        );
      }

      if (!isForgot && !password) {
        throw new AppError(
          "Password is required for registration",
          HTTP_statusCode.BadRequest
        );
      }

      const isVerified = await this.userAuthService.otpCheck(req.body);

      if (!isVerified) {
        throw new AppError(
          "OTP verification failed",
          HTTP_statusCode.BadRequest
        );
      }

      sendSuccess(res, "OTP verified successfully");
    } catch (error) {
      next(this.mapUserVerifyOtpError(error));
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
        throw new AppError(
          "Email and password are required",
          HTTP_statusCode.BadRequest
        );
      }

      const loginResult = await this.userAuthService.loginService(req.body);

      this.setAuthCookies(
        res,
        loginResult.accessToken,
        loginResult.refreshToken
      );

      sendSuccess(res, "User logged in successfully", {
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
        user: loginResult.user,
      });
    } catch (error) {
      next(this.mapUserLoginError(error));
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
        throw new AppError(
          "Email and new password are required",
          HTTP_statusCode.BadRequest
        );
      }

      await this.userAuthService.resetPasswordService(req.body);
      sendSuccess(res, "Password reset successfully");
    } catch (error) {
      next(this.mapUserResetPasswordError(error));
    }
  }

  async logoutUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      this.clearAuthCookies(res);
      sendSuccess(res, "You have been logged out successfully");
    } catch (error) {
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
      sendSuccess(res, "OTP sent successfully");
    } catch (error) {
      next(this.mapTutorOtpError(error));
    }
  }

  async verifyTutorOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.tutorAuthService.otpCheck(req.body);
      sendSuccess(res, "OTP verified successfully");
    } catch (error) {
      next(this.mapTutorVerifyOtpError(error));
    }
  }

  async tutorLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const loginResult = await this.tutorAuthService.loginService(req.body);

      this.setAuthCookies(
        res,
        loginResult.accessToken,
        loginResult.refreshToken
      );

      sendSuccess(res, "Tutor logged in successfully", {
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
        tutor: loginResult.tutor,
      });
    } catch (error) {
      next(this.mapTutorLoginError(error));
    }
  }

  async resetTutorPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.tutorAuthService.resetPasswordService(req.body);
      sendSuccess(res, "Password reset successfully");
    } catch (error) {
      next(this.mapTutorResetPasswordError(error));
    }
  }

  async logoutTutor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      this.clearAuthCookies(res);
      sendSuccess(res, "You have been logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  async adminLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(
          "Email and password are required",
          HTTP_statusCode.BadRequest
        );
      }

      const serviceResult = await this.adminAuthService.loginService(req.body);

      if (
        !serviceResult.isValid ||
        !serviceResult.accessToken ||
        !serviceResult.refreshToken
      ) {
        throw new AppError(
          serviceResult.error || "Invalid credentials",
          HTTP_statusCode.BadRequest
        );
      }

      this.setAuthCookies(
        res,
        serviceResult.accessToken,
        serviceResult.refreshToken
      );

      sendSuccess(res, "Admin logged in successfully", {
        accessToken: serviceResult.accessToken,
        refreshToken: serviceResult.refreshToken,
        admin: serviceResult.admin,
      });
    } catch (error) {
      next(this.mapAdminLoginError(error));
    }
  }

  async logoutAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      this.clearAuthCookies(res);
      sendSuccess(res, "You have been logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  googleUserAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { credential } = req.body;

      if (!credential) {
        throw new AppError(
          "Google credential is required",
          HTTP_statusCode.BadRequest
        );
      }

      const googleUser = await verifyGoogleToken(credential);

      if (!googleUser.email_verified) {
        throw new AppError(
          "Email not verified by Google",
          HTTP_statusCode.BadRequest
        );
      }

      let checkUser = await this.userAuthService.findUserByEmail(
        googleUser.email
      );

      if (checkUser) {
        if (checkUser.isBlocked) {
          throw new AppError(
            "Your account has been blocked",
            HTTP_statusCode.NoAccess
          );
        }
        let user = await this.userAuthService.getCompleteUserProfile(
          googleUser.email
        );
        if (!user) {
          throw new AppError("No user found", HTTP_statusCode.NoAccess);
        }
        const accessToken = createToken(user._id, user.email, "user");
        const refreshToken = createToken(user._id, user.email, "user");

        this.setAuthCookies(res, accessToken, refreshToken);
        sendSuccess(res, "Login successful", {
          user,
          accessToken,
        });
      } else {
        const newUser = await this.userAuthService.createGoogleUser({
          name: googleUser.name,
          email: googleUser.email,
          phone: "",
          avatar: googleUser.picture,
          googleId: googleUser.sub,
          isEmailVerified: true,
        });

        const accessToken = createToken(newUser._id, newUser.email, "user");
        const refreshToken = createToken(newUser._id, newUser.email, "user");

        this.setAuthCookies(res, accessToken, refreshToken);

        sendSuccess(res, "Account created successfully", {
          user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar,
          },
          accessToken,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  googleTutorAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { credential } = req.body;

      if (!credential) {
        throw new AppError(
          "Google credential is required",
          HTTP_statusCode.BadRequest
        );
      }

      const googleUser = await verifyGoogleToken(credential);

      if (!googleUser.email_verified) {
        throw new AppError(
          "Email not verified by Google",
          HTTP_statusCode.BadRequest
        );
      }

      let checkTutor = await this.tutorAuthService.findTutorByEmail(
        googleUser.email
      );

      if (checkTutor) {
        if (checkTutor.isBlocked) {
          throw new AppError(
            "Your account has been blocked",
            HTTP_statusCode.NoAccess
          );
        }
        let tutor = await this.tutorAuthService.getCompleteTutorProfile(
          googleUser.email
        );
        if (!tutor) {
          throw new AppError("No tutor found", HTTP_statusCode.NoAccess);
        }
        const accessToken = createToken(tutor._id, tutor.email, "tutor");
        const refreshToken = createToken(tutor._id, tutor.email, "tutor");

        this.setAuthCookies(res, accessToken, refreshToken);

        sendSuccess(res, "Login successful", {
          tutor,
          accessToken,
        });
      } else {
        const newTutor = await this.tutorAuthService.createGoogleTutor({
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.picture,
          googleId: googleUser.sub,
          isEmailVerified: true,
        });

        const accessToken = createToken(newTutor._id, newTutor.email, "tutor");
        const refreshToken = createToken(newTutor._id, newTutor.email, "tutor");

        this.setAuthCookies(res, accessToken, refreshToken);

        sendSuccess(res, "Account created successfully", {
          tutor: {
            _id: newTutor._id,
            name: newTutor.name,
            email: newTutor.email,
            avatar: newTutor.avatar,
            isVerified: newTutor.isVerified,
            verificationStatus: newTutor.verificationStatus,
          },
          accessToken,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ): void {
    res.cookie("RefreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("AccessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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

  private mapUserOtpError(error: unknown): Error {
    if (error instanceof Error) {
      switch (error.message) {
        case "Email already in use":
          return new AppError("Email already in use", HTTP_statusCode.Conflict);
        case "Phone already in use":
          return new AppError(
            "Phone number already in use",
            HTTP_statusCode.Conflict
          );
        case "Otp not send":
          return new AppError(
            "OTP not sent",
            HTTP_statusCode.InternalServerError
          );
        case "Email not found":
          return new AppError(
            "Email address not found",
            HTTP_statusCode.BadRequest
          );
      }
    }
    return new AppError(
      "Something went wrong, please try again later",
      HTTP_statusCode.InternalServerError
    );
  }

  private mapUserVerifyOtpError(error: unknown): Error {
    if (error instanceof Error) {
      switch (error.message) {
        case "OTP not found":
          return new AppError(
            "OTP not found or expired",
            HTTP_statusCode.BadRequest
          );
        case "Password is required for new user registration":
          return new AppError(
            "Password is required for registration",
            HTTP_statusCode.BadRequest
          );
      }
    }
    return new AppError(
      "Server error occurred",
      HTTP_statusCode.InternalServerError
    );
  }

  private mapUserLoginError(error: unknown): Error {
    if (error instanceof Error) {
      switch (error.message) {
        case "Invalid email":
          return new AppError(
            "Invalid email address",
            HTTP_statusCode.BadRequest
          );
        case "Invalid password":
          return new AppError("Invalid password", HTTP_statusCode.BadRequest);
        case "User blocked":
          return new AppError(
            "Your account has been blocked",
            HTTP_statusCode.NoAccess
          );
      }
    }
    return new AppError(
      "Internal Server Error",
      HTTP_statusCode.InternalServerError
    );
  }

  private mapUserResetPasswordError(error: unknown): Error {
    if (error instanceof Error && error.message === "Invalid email") {
      return new AppError(
        "Email address not found",
        HTTP_statusCode.BadRequest
      );
    }
    return new AppError(
      "Internal Server Error",
      HTTP_statusCode.InternalServerError
    );
  }

  private mapTutorOtpError(error: unknown): Error {
    if (error instanceof Error) {
      switch (error.message) {
        case "Email already in use":
          return new AppError("Email already in use", HTTP_statusCode.Conflict);
        case "Phone already in use":
          return new AppError(
            "Phone number already in use",
            HTTP_statusCode.Conflict
          );
        case "Email not found":
          return new AppError("Email not found", HTTP_statusCode.NotFound);
        case "Failed to send OTP email":
          return new AppError(
            "OTP not sent",
            HTTP_statusCode.InternalServerError
          );
      }
    }
    return new AppError(
      "Something went wrong, please try again later",
      HTTP_statusCode.InternalServerError
    );
  }

  private mapTutorVerifyOtpError(error: unknown): Error {
    if (error instanceof Error) {
      switch (error.message) {
        case "Invalid OTP":
          return new AppError("Invalid OTP", HTTP_statusCode.BadRequest);
        case "Password is required for new tutor registration":
          return new AppError(
            "Password is required",
            HTTP_statusCode.BadRequest
          );
      }
    }
    return new AppError("Server error", HTTP_statusCode.InternalServerError);
  }

  private mapTutorLoginError(error: unknown): Error {
    if (error instanceof Error) {
      switch (error.message) {
        case "Invalid email or password":
          return new AppError(
            "Invalid email or password",
            HTTP_statusCode.BadRequest
          );
        case "Tutor account is blocked":
          return new AppError(
            "Tutor account is blocked",
            HTTP_statusCode.NoAccess
          );
      }
    }
    return new AppError(
      "Internal Server Error",
      HTTP_statusCode.InternalServerError
    );
  }

  private mapTutorResetPasswordError(error: unknown): Error {
    if (error instanceof Error && error.message === "Email not found") {
      return new AppError("Email not found", HTTP_statusCode.NotFound);
    }
    return new AppError(
      "Internal Server Error",
      HTTP_statusCode.InternalServerError
    );
  }

  private mapAdminLoginError(error: unknown): Error {
    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      return new AppError(
        "Invalid email or password",
        HTTP_statusCode.BadRequest
      );
    }
    return new AppError(
      "Internal Server Error",
      HTTP_statusCode.InternalServerError
    );
  }
}
