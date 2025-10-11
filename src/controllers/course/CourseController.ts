// src/controllers/CourseController.ts
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../utils/jwt";
import { ICourseService } from "../../interfaces/course/ICourseService";
import { CreateCourseDto, EditCourseDto, ChapterDto } from "../../dto/course/CourseDTO";
import { sendCourseRejectionEmail } from "../../config/emailConfig";
import { CourseFilters } from "../../interfaces/course/courseInterface";
import { sendSuccess, sendError } from "../../helper/responseHelper";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { AppError } from "../../errors/AppError";

export class CourseController {
  constructor(private readonly _courseService: ICourseService) {}

  getCategoryNames = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this._courseService.getAllCategories();
      sendSuccess(res, "Categories fetched", categories);
    } catch (error) {
      next(error);
    }
  };

  getAllUnpublishedCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;
      const searchTerm = search ? (search as string).trim() : undefined;

      const result = await this._courseService.getUnpublishedCourses(skip, pageLimit, searchTerm);

      sendSuccess(res, "Courses fetched successfully", {
        courses: result.courses,
        pagination: {
          currentPage: pageNumber,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          limit: pageLimit,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tutorId = (req as AuthRequest).user?.id;
      if (!tutorId) {
        throw new AppError("Unauthorized: Tutor ID not found", HTTP_statusCode.Unauthorized);
      }

      const { title, description, benefits, requirements, category, price, chapters } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const parsedChapters = this.parseChapters(chapters);
      this.validateRequiredFields({ title, description, category, price, chapters: parsedChapters });

      const courseDto: CreateCourseDto = {
        title,
        description,
        benefits: benefits || "",
        requirements: requirements || "",
        category,
        price: parseFloat(price),
        chapters: parsedChapters,
        tutorId,
      };

      const thumbnailFile = files?.thumbnail?.[0];
      const createdCourse = await this._courseService.createCourse(courseDto, files, thumbnailFile);

      sendSuccess(res, "Course created successfully", createdCourse);
    } catch (error) {
      next(error);
    }
  };

  publishCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError("Course id not available", HTTP_statusCode.BadRequest);
      }

      const publishResponse = await this._courseService.publishCourse(id);
      sendSuccess(res, "Course published successfully", publishResponse);
    } catch (error) {
      next(error);
    }
  };

  rejectCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!id) {
        throw new AppError("Course id not available", HTTP_statusCode.BadRequest);
      }

      const { course, tutor } = await this._courseService.rejectCourse(id);

      if (!tutor) {
        throw new AppError("Cannot find tutor", HTTP_statusCode.BadRequest);
      }

      if (!course) {
        throw new AppError("Cannot find course", HTTP_statusCode.BadRequest);
      }

      const emailSent = await sendCourseRejectionEmail(
        tutor.email,
        tutor.name,
        course.title,
        reason || "No specific reason provided"
      );

      if (!emailSent) {
        console.warn(`Failed to send rejection email to ${tutor.email}`);
      }

      sendSuccess(res, "Course rejected successfully", course);
    } catch (error) {
      next(error);
    }
  };

  getPublishedCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 7, search } = req.query;
      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;

      const result = await this._courseService.getPublishedCoursesForListing(skip, pageLimit, search);
      sendSuccess(res, "Courses fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };

  listUnlistCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this._courseService.listUnlistCourseService(id);
      sendSuccess(res, "Course listing changed successfully");
    } catch (error) {
      next(error);
    }
  };

  getAllCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const listedCourses = await this._courseService.getAllCourses();
      sendSuccess(res, "Successfully fetched all listed courses", listedCourses);
    } catch (error) {
      next(error);
    }
  };

  getAllListedCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthRequest).user?.id;
      const { search, category, minPrice, maxPrice, sortBy, page = 1, limit = 50 } = req.query;

      const filters: CourseFilters = {
        search: search as string,
        category: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sortBy as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      };

      this.validatePriceFilters(filters);

      const courses = await this._courseService.getAllListedCourses(filters, userId);
      sendSuccess(res, "Successfully fetched all listed courses", courses);
    } catch (error) {
      next(error);
    }
  };

  getAllListedCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const listedCategories = await this._courseService.getAllListedCategories();
      sendSuccess(res, "Successfully fetched listed categories", listedCategories);
    } catch (error) {
      next(error);
    }
  };

  getCourseDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const courseDetails = await this._courseService.getCourseDetails(id);
      sendSuccess(res, "Successfully fetched course details", courseDetails);
    } catch (error) {
      next(error);
    }
  };

  getTutorCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tutorId = req.user?.id;
      if (!tutorId) {
        throw new AppError("Tutor authentication required", HTTP_statusCode.Unauthorized);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";

      const result = await this._courseService.getTutorCourses(tutorId, page, limit, search);
      sendSuccess(res, "Tutor courses fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };

  editCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const tutorId = (req as AuthRequest).user?.id;

      if (!tutorId) {
        throw new AppError("Unauthorized: Tutor ID not found", HTTP_statusCode.Unauthorized);
      }

      const existingCourse = await this._courseService.getCourseDetails(courseId);
      if (!existingCourse || existingCourse.tutor._id !== tutorId) {
        throw new AppError("You can only edit your own courses", HTTP_statusCode.NoAccess);
      }

      const { title, description, benefits, requirements, category, price, chapters, thumbnailUrl } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const parsedChapters = this.parseChapters(chapters);
      this.validateRequiredFields({ title, description, category, price, chapters: parsedChapters });

      const courseDto: EditCourseDto = {
        title,
        description,
        benefits: benefits || "",
        requirements: requirements || "",
        category,
        price: parseFloat(price),
        chapters: parsedChapters,
        thumbnailImage: {
          preview: thumbnailUrl,
          isExisting: !!thumbnailUrl && !files?.thumbnail,
        },
      };

      const thumbnailFile = files?.thumbnail?.[0];
      const updatedCourse = await this._courseService.editCourse(
        courseId,
        courseDto,
        files,
        thumbnailFile,
        thumbnailUrl
      );

      sendSuccess(res, "Course updated successfully", updatedCourse);
    } catch (error) {
      next(error);
    }
  };

  // Private helper methods
  private parseChapters(chapters: any): ChapterDto[] {
    try {
      return typeof chapters === "string" ? JSON.parse(chapters) : chapters;
    } catch (error) {
      throw new AppError("Invalid chapters data format", HTTP_statusCode.BadRequest);
    }
  }

  private validateRequiredFields(fields: Record<string, any>): void {
    const missingFields = Object.entries(fields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new AppError("Missing required fields", HTTP_statusCode.BadRequest);
    }
  }

  private validatePriceFilters(filters: CourseFilters): void {
    if (
      filters.minPrice !== undefined &&
      filters.maxPrice !== undefined &&
      filters.minPrice > filters.maxPrice
    ) {
      throw new AppError(
        "Minimum price cannot be greater than maximum price",
        HTTP_statusCode.BadRequest
      );
    }

    if (filters.minPrice !== undefined && filters.minPrice < 0) {
      throw new AppError("Minimum price cannot be negative", HTTP_statusCode.BadRequest);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice < 0) {
      throw new AppError("Maximum price cannot be negative", HTTP_statusCode.BadRequest);
    }
  }
}