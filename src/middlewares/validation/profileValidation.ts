// src/middlewares/validation/profileValidation.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import {
  sanitizeString,
  validateDateString,
  validateEmail,
  validatePhone,
} from "./commonValidation";

export const validateProfileUpdate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { name, phone, DOB, gender, designation, about } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        throw new AppError("Name cannot be empty", HTTP_statusCode.BadRequest);
      }

      if (name.trim().length < 2 || name.trim().length > 50) {
        throw new AppError(
          "Name must be between 2 and 50 characters",
          HTTP_statusCode.BadRequest
        );
      }

      req.body.name = sanitizeString(name);
    }

    if (phone !== undefined) {
      if (!phone.trim()) {
        throw new AppError("Phone cannot be empty", HTTP_statusCode.BadRequest);
      }

      if (!validatePhone(phone)) {
        throw new AppError(
          "Invalid phone number format (must be 10 digits)",
          HTTP_statusCode.BadRequest
        );
      }

      req.body.phone = phone.trim();
    }

    if (DOB !== undefined) {
      if (!validateDateString(DOB)) {
        throw new AppError("Invalid date format", HTTP_statusCode.BadRequest);
      }

      const birthDate = new Date(DOB);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 13 || age > 120) {
        throw new AppError(
          "Age must be between 13 and 120 years",
          HTTP_statusCode.BadRequest
        );
      }
    }

    if (gender !== undefined) {
      const validGenders = ["male", "female", "other"];
      if (!validGenders.includes(gender.toLowerCase())) {
        throw new AppError(
          "Gender must be male, female, or other",
          HTTP_statusCode.BadRequest
        );
      }
    }

    if (designation !== undefined && designation.trim()) {
      if (designation.trim().length < 2 || designation.trim().length > 100) {
        throw new AppError(
          "Designation must be between 2 and 100 characters",
          HTTP_statusCode.BadRequest
        );
      }

      req.body.designation = sanitizeString(designation);
    }

    if (about !== undefined && about.trim()) {
      if (about.trim().length < 10 || about.trim().length > 1000) {
        throw new AppError(
          "About section must be between 10 and 1000 characters",
          HTTP_statusCode.BadRequest
        );
      }

      req.body.about = sanitizeString(about);
    }

    if (req.file) {
      const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        throw new AppError(
          "Only JPEG, PNG, GIF, and WebP images are allowed",
          HTTP_statusCode.BadRequest
        );
      }

      const maxSize = 5 * 1024 * 1024;
      if (req.file.size > maxSize) {
        throw new AppError(
          "File size exceeds 5MB limit",
          HTTP_statusCode.BadRequest
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateVerificationDocuments = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const { email, phone } = req.body;

    if (!files) {
      throw new AppError("No files uploaded", HTTP_statusCode.BadRequest);
    }

    const requiredFiles = ["avatar", "degree", "aadharFront", "aadharBack"];
    const missingFiles = requiredFiles.filter(
      (field) => !files[field] || files[field].length === 0
    );

    if (missingFiles.length > 0) {
      throw new AppError(
        `Missing required files: ${missingFiles.join(", ")}`,
        HTTP_statusCode.BadRequest
      );
    }

    if (!email && !phone) {
      throw new AppError(
        "Either email or phone number is required",
        HTTP_statusCode.BadRequest
      );
    }

    if (email && !validateEmail(email)) {
      throw new AppError("Invalid email format", HTTP_statusCode.BadRequest);
    }

    if (phone && !validatePhone(phone)) {
      throw new AppError(
        "Invalid phone number format",
        HTTP_statusCode.BadRequest
      );
    }

    Object.entries(files).forEach(([fieldName, fileArray]) => {
      fileArray.forEach((file) => {
        const allowedMimeTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "application/pdf",
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new AppError(
            `${fieldName}: Only JPEG, PNG, and PDF files are allowed`,
            HTTP_statusCode.BadRequest
          );
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new AppError(
            `${fieldName}: File size exceeds 10MB limit`,
            HTTP_statusCode.BadRequest
          );
        }
      });
    });

    if (email) req.body.email = sanitizeString(email);
    if (phone) req.body.phone = phone.trim();

    next();
  } catch (error) {
    next(error);
  }
};
