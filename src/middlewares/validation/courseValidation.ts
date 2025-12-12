// src/middlewares/validation/courseValidation.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { validateMongoId, sanitizeString } from "./commonValidation";

export const validateCourseCreation = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const {
      title,
      description,
      category,
      price,
      chapters,
      benefits,
      requirements,
    } = req.body;

    if (!title || !title.trim()) {
      throw new AppError(
        "Course title is required",
        HTTP_statusCode.BadRequest
      );
    }

    if (title.trim().length < 5 || title.trim().length > 200) {
      throw new AppError(
        "Course title must be between 5 and 200 characters",
        HTTP_statusCode.BadRequest
      );
    }

    if (!description || !description.trim()) {
      throw new AppError(
        "Course description is required",
        HTTP_statusCode.BadRequest
      );
    }

    if (description.trim().length < 20 || description.trim().length > 2000) {
      throw new AppError(
        "Course description must be between 20 and 2000 characters",
        HTTP_statusCode.BadRequest
      );
    }

    if (!category || !category.trim()) {
      throw new AppError(
        "Course category is required",
        HTTP_statusCode.BadRequest
      );
    }

    if (!validateMongoId(category)) {
      throw new AppError("Invalid category ID", HTTP_statusCode.BadRequest);
    }

    if (!price && price !== 0) {
      throw new AppError(
        "Course price is required",
        HTTP_statusCode.BadRequest
      );
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0 || priceNum > 100000) {
      throw new AppError(
        "Price must be between 0 and 100000",
        HTTP_statusCode.BadRequest
      );
    }

    if (!chapters) {
      throw new AppError(
        "Course chapters are required",
        HTTP_statusCode.BadRequest
      );
    }

    let parsedChapters;
    try {
      parsedChapters =
        typeof chapters === "string" ? JSON.parse(chapters) : chapters;
    } catch {
      throw new AppError("Invalid chapters format", HTTP_statusCode.BadRequest);
    }

    if (!Array.isArray(parsedChapters) || parsedChapters.length === 0) {
      throw new AppError(
        "At least one chapter is required",
        HTTP_statusCode.BadRequest
      );
    }

    parsedChapters.forEach((chapter: any, chapterIndex: number) => {
      if (!chapter.title || !chapter.title.trim()) {
        throw new AppError(
          `Chapter ${chapterIndex + 1} title is required`,
          HTTP_statusCode.BadRequest
        );
      }

      if (!Array.isArray(chapter.lessons) || chapter.lessons.length === 0) {
        throw new AppError(
          `Chapter ${chapterIndex + 1} must have at least one lesson`,
          HTTP_statusCode.BadRequest
        );
      }

      chapter.lessons.forEach((lesson: any, lessonIndex: number) => {
        if (!lesson.title || !lesson.title.trim()) {
          throw new AppError(
            `Lesson ${lessonIndex + 1} in chapter ${
              chapterIndex + 1
            } title is required`,
            HTTP_statusCode.BadRequest
          );
        }

        if (!lesson.description || !lesson.description.trim()) {
          throw new AppError(
            `Lesson ${lessonIndex + 1} in chapter ${
              chapterIndex + 1
            } description is required`,
            HTTP_statusCode.BadRequest
          );
        }
      });
    });

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    if (!files || !files.thumbnail || files.thumbnail.length === 0) {
      throw new AppError(
        "Course thumbnail is required",
        HTTP_statusCode.BadRequest
      );
    }

    req.body.title = sanitizeString(title);
    req.body.description = sanitizeString(description);
    if (benefits) req.body.benefits = sanitizeString(benefits);
    if (requirements) req.body.requirements = sanitizeString(requirements);

    next();
  } catch (error) {
    next(error);
  }
};

export const validateCourseUpdate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const {
      title,
      description,
      category,
      price,
      chapters,
      benefits,
      requirements,
    } = req.body;

    if (!title || !title.trim()) {
      throw new AppError(
        "Course title is required",
        HTTP_statusCode.BadRequest
      );
    }

    if (title.trim().length < 5 || title.trim().length > 200) {
      throw new AppError(
        "Course title must be between 5 and 200 characters",
        HTTP_statusCode.BadRequest
      );
    }

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    req.body.title = sanitizeString(title);
    req.body.description = sanitizeString(description);
    if (benefits) req.body.benefits = sanitizeString(benefits);
    if (requirements) req.body.requirements = sanitizeString(requirements);

    next();
  } catch (error) {
    next(error);
  }
};

export const validateCourseFilters = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, page, limit } =
      req.query;

    if (search && typeof search === "string") {
      req.query.search = sanitizeString(search as string);
    }
    if (
      category &&
      typeof category === "string" &&
      category !== "All classes"
    ) {
      const candidate = category as string;
      if (/^[0-9a-fA-F]{24}$/.test(candidate)) {
        if (!validateMongoId(candidate)) {
          throw new AppError("Invalid category ID", HTTP_statusCode.BadRequest);
        }
      } else {
      }
    }

    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (isNaN(min) || min < 0) {
        throw new AppError(
          "Minimum price must be non-negative",
          HTTP_statusCode.BadRequest
        );
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (isNaN(max) || max < 0) {
        throw new AppError(
          "Maximum price must be non-negative",
          HTTP_statusCode.BadRequest
        );
      }
    }

    if (minPrice && maxPrice) {
      const min = parseFloat(minPrice as string);
      const max = parseFloat(maxPrice as string);
      if (min > max) {
        throw new AppError(
          "Minimum price cannot be greater than maximum price",
          HTTP_statusCode.BadRequest
        );
      }
    }

    if (sortBy && typeof sortBy === "string") {
      const validSortOptions = [
        "price_asc",
        "price_desc",
        "title_asc",
        "title_desc",
        "newest",
        "oldest",
      ];
      if (!validSortOptions.includes(sortBy)) {
        throw new AppError("Invalid sort option", HTTP_statusCode.BadRequest);
      }
    }

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

    next();
  } catch (error) {
    next(error);
  }
};
