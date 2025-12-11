// src/middlewares/validation/enrollmentValidation.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import {
  validateMongoId,
  sanitizeString,
  validateDateString,
} from "./commonValidation";

export const validatePaymentCreation = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { courseId, tutorId, categoryId, price } = req.body;

    if (!courseId || !courseId.trim()) {
      throw new AppError("Course ID is required", HTTP_statusCode.BadRequest);
    }

    if (!validateMongoId(courseId)) {
      throw new AppError(
        "Invalid course ID format",
        HTTP_statusCode.BadRequest
      );
    }

    if (!tutorId || !tutorId.trim()) {
      throw new AppError("Tutor ID is required", HTTP_statusCode.BadRequest);
    }

    if (!validateMongoId(tutorId)) {
      throw new AppError("Invalid tutor ID format", HTTP_statusCode.BadRequest);
    }

    if (!categoryId || !categoryId.trim()) {
      throw new AppError("Category ID is required", HTTP_statusCode.BadRequest);
    }

    if (!validateMongoId(categoryId)) {
      throw new AppError(
        "Invalid category ID format",
        HTTP_statusCode.BadRequest
      );
    }

    if (price === undefined || price === null) {
      throw new AppError("Price is required", HTTP_statusCode.BadRequest);
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      throw new AppError(
        "Price must be non-negative",
        HTTP_statusCode.BadRequest
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validatePaymentVerification = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || !sessionId.trim()) {
      throw new AppError("Session ID is required", HTTP_statusCode.BadRequest);
    }

    if (typeof sessionId !== "string" || sessionId.trim().length < 10) {
      throw new AppError(
        "Invalid session ID format",
        HTTP_statusCode.BadRequest
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateEnrollmentFilters = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { page, limit, search, status, startDate, endDate, sortBy } =
      req.query;

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

    if (status && typeof status === "string") {
      const validStatuses = ["pending", "completed", "failed", "refunded"];
      if (!validStatuses.includes(status.toLowerCase())) {
        throw new AppError("Invalid status value", HTTP_statusCode.BadRequest);
      }
    }

    if (startDate && !validateDateString(startDate as string)) {
      throw new AppError(
        "Invalid start date format",
        HTTP_statusCode.BadRequest
      );
    }

    if (endDate && !validateDateString(endDate as string)) {
      throw new AppError("Invalid end date format", HTTP_statusCode.BadRequest);
    }

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      if (start > end) {
        throw new AppError(
          "Start date cannot be after end date",
          HTTP_statusCode.BadRequest
        );
      }
    }

    if (sortBy && typeof sortBy === "string") {
      const validSortOptions = [
        "date_asc",
        "date_desc",
        "amount_asc",
        "amount_desc",
      ];
      if (!validSortOptions.includes(sortBy)) {
        throw new AppError("Invalid sort option", HTTP_statusCode.BadRequest);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
