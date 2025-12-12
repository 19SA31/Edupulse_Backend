// src/middlewares/validation/adminValidation.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { sanitizeString } from "./commonValidation";

export const validateCategoryInput = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      throw new AppError(
        "Category name is required",
        HTTP_statusCode.BadRequest
      );
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      throw new AppError(
        "Category name must be between 2 and 50 characters",
        HTTP_statusCode.BadRequest
      );
    }

    if (!description || !description.trim()) {
      throw new AppError(
        "Category description is required",
        HTTP_statusCode.BadRequest
      );
    }

    if (description.trim().length < 10 || description.trim().length > 500) {
      throw new AppError(
        "Category description must be between 10 and 500 characters",
        HTTP_statusCode.BadRequest
      );
    }

    req.body.name = sanitizeString(name);
    req.body.description = sanitizeString(description);

    next();
  } catch (error) {
    next(error);
  }
};

export const validateRejectionReason = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      throw new AppError(
        "Rejection reason is required",
        HTTP_statusCode.BadRequest
      );
    }

    if (reason.trim().length < 10 || reason.trim().length > 500) {
      throw new AppError(
        "Rejection reason must be between 10 and 500 characters",
        HTTP_statusCode.BadRequest
      );
    }

    req.body.reason = sanitizeString(reason);

    next();
  } catch (error) {
    next(error);
  }
};
