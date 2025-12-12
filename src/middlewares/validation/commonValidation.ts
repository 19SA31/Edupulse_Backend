// src/middlewares/validation/commonValidation.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError";
import HTTP_statusCode from "../../enums/HttpStatusCode";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string | number): boolean => {
  const phoneStr = String(phone).trim();
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phoneStr);
};

export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*\d)[a-z\d]{6,}$/;
  return passwordRegex.test(password);
};

export const validateMongoId = (id: string): boolean => {
  const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
  return mongoIdRegex.test(id);
};

export const sanitizeString = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().replace(/[<>]/g, "");
};

export const validateDateString = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

export const validateAllMongoIdParams = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    for (const [key, value] of Object.entries(req.params)) {
      if (!value) {
        throw new AppError(`${key} is required`, HTTP_statusCode.BadRequest);
      }
      if (!validateMongoId(value as string)) {
        throw new AppError(`Invalid ${key} format`, HTTP_statusCode.BadRequest);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const validatePagination = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { page, limit, search } = req.query;

    if (page) {
      const pageNum = parseInt(page as string, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        throw new AppError(
          "Page must be a positive integer",
          HTTP_statusCode.BadRequest
        );
      }
    }

    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new AppError(
          "Limit must be between 1 and 100",
          HTTP_statusCode.BadRequest
        );
      }
    }

    if (search && typeof search === "string") {
      req.query.search = sanitizeString(search as string);
    }

    next();
  } catch (error) {
    next(error);
  }
};
