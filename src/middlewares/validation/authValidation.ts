// src/middlewares/validation/authValidation.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import {
  validateEmail,
  validatePhone,
  validatePassword,
  sanitizeString,
} from "./commonValidation";

export const validateSignup = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { name, email, phone, password, isForgot } = req.body;

    const hasSignupFields = !!(name || phone || password);

    const isForgotFlow =
      isForgot === true || isForgot === "true" || (!hasSignupFields && !!email);

    if (isForgotFlow) {
      if (!email || !email.trim()) {
        throw new AppError("Email is required", HTTP_statusCode.BadRequest);
      }

      if (!validateEmail(email)) {
        throw new AppError("Invalid email format", HTTP_statusCode.BadRequest);
      }

      req.body.email = sanitizeString(email);
      return next();
    }

    if (!name || !name.trim()) {
      throw new AppError("Name is required", HTTP_statusCode.BadRequest);
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      throw new AppError(
        "Name must be between 2 and 50 characters",
        HTTP_statusCode.BadRequest
      );
    }

    if (!email || !email.trim()) {
      throw new AppError("Email is required", HTTP_statusCode.BadRequest);
    }

    if (!validateEmail(email)) {
      throw new AppError("Invalid email format", HTTP_statusCode.BadRequest);
    }

    if (!phone && phone !== 0) {
      throw new AppError(
        "Phone number is required",
        HTTP_statusCode.BadRequest
      );
    }

    const phoneStr = String(phone).trim();

    if (!validatePhone(phoneStr)) {
      throw new AppError(
        "Invalid phone number format (must be 10 digits)",
        HTTP_statusCode.BadRequest
      );
    }

    if (!password || !password.trim()) {
      throw new AppError("Password is required", HTTP_statusCode.BadRequest);
    }

    if (!validatePassword(password)) {
      throw new AppError(
        "Password must be at least 6 characters",
        HTTP_statusCode.BadRequest
      );
    }

    req.body.name = sanitizeString(name);
    req.body.email = sanitizeString(email);
    req.body.phone = phoneStr;

    next();
  } catch (error) {
    next(error);
  }
};

export const validateOtpVerification = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { email, otp, password, isForgot } = req.body;
    console.log("$$$", email, password, isForgot);
    if (!email || !email.trim()) {
      throw new AppError("Email is required", HTTP_statusCode.BadRequest);
    }

    if (!validateEmail(email)) {
      throw new AppError("Invalid email format", HTTP_statusCode.BadRequest);
    }

    if (!otp || !otp.trim()) {
      throw new AppError("OTP is required", HTTP_statusCode.BadRequest);
    }

    if (!/^\d{4}$/.test(otp.trim())) {
      throw new AppError(
        "OTP must be a 4-digit number",
        HTTP_statusCode.BadRequest
      );
    }

    if (!isForgot) {
      if (!password || !password.trim()) {
        throw new AppError("Password is required", HTTP_statusCode.BadRequest);
      }

      if (!validatePassword(password)) {
        throw new AppError(
          "Password must be at least 6 characters long ",
          HTTP_statusCode.BadRequest
        );
      }
    }

    req.body.email = sanitizeString(email);
    req.body.otp = otp.trim();

    next();
  } catch (error) {
    next(error);
  }
};

export const validateLogin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      throw new AppError("Email is required", HTTP_statusCode.BadRequest);
    }

    if (!validateEmail(email)) {
      throw new AppError("Invalid email format", HTTP_statusCode.BadRequest);
    }

    if (!password || !password.trim()) {
      throw new AppError("Password is required", HTTP_statusCode.BadRequest);
    }

    req.body.email = sanitizeString(email);

    next();
  } catch (error) {
    next(error);
  }
};

export const validatePasswordReset = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      throw new AppError("Email is required", HTTP_statusCode.BadRequest);
    }

    if (!validateEmail(email)) {
      throw new AppError("Invalid email format", HTTP_statusCode.BadRequest);
    }

    if (!password || !password.trim()) {
      throw new AppError(
        "New password is required",
        HTTP_statusCode.BadRequest
      );
    }

    if (!validatePassword(password)) {
      throw new AppError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
        HTTP_statusCode.BadRequest
      );
    }

    req.body.email = sanitizeString(email);

    next();
  } catch (error) {
    next(error);
  }
};

export const validateGoogleAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { credential } = req.body;

    if (!credential || !credential.trim()) {
      throw new AppError(
        "Google credential is required",
        HTTP_statusCode.BadRequest
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
