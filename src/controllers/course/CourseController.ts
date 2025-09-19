import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../utils/jwt";
import { ResponseModel } from "../../models/ResponseModel";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { ICourseService } from "../../interfaces/course/ICourseService";
import {
  CreateCourseDto,
  EditCourseDto,
  ChapterDto,
} from "../../dto/course/CourseDTO";
import { ValidationError } from "../../errors/ValidationError";
import { sendCourseRejectionEmail } from "../../config/emailConfig";
import { CourseFilters } from "../../interfaces/course/courseInterface";
interface Lesson {
  title: string;
  videoFile?: string;
}

interface Chapter {
  title: string;
  lessons?: Lesson[];
}

export class CourseController {
  private _courseService: ICourseService;
  constructor(CourseServiceIsntance: ICourseService) {
    this._courseService = CourseServiceIsntance;
  }

  async getCategoryNames(req: Request, res: Response): Promise<void> {
    try {
      const fetchCategroyNames = await this._courseService.getAllCategories();
      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(true, "Categories fetched", fetchCategroyNames)
        );
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json(new ResponseModel(false, "failed to fetch categories"));
    }
  }

  async getAllUnpublishedCourses(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;

      const searchTerm = search ? (search as string).trim() : undefined;

      const result = await this._courseService.getUnpublishedCourses(
        skip,
        pageLimit,
        searchTerm
      );

      res.status(HTTP_statusCode.OK).json(
        new ResponseModel(true, "Courses fetched successfully", {
          courses: result.courses,
          pagination: {
            currentPage: pageNumber,
            totalPages: result.totalPages,
            totalCount: result.totalCount,
            limit: pageLimit,
          },
        })
      );
    } catch (error: unknown) {
      console.error("Error in getAllUnpublishedCourses:", error);

      if (error instanceof ValidationError || error instanceof Error) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, (error as Error).message, null));
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json(new ResponseModel(false, "Failed to fetch courses", null));
      }
    }
  }

  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        benefits,
        requirements,
        category,
        price,
        chapters,
      } = req.body;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      let parsedChapters: ChapterDto[];
      try {
        parsedChapters =
          typeof chapters === "string" ? JSON.parse(chapters) : chapters;
        // Removed the unused forEach loops that were causing ESLint errors
        // If you need to validate chapters structure, do it here with proper validation
      } catch (parseError) {
        console.error("Error parsing chapters:", parseError);
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Invalid chapters data format"));
        return;
      }

      const tutorId = (req as AuthRequest).user?.id;

      if (!tutorId) {
        res
          .status(HTTP_statusCode.Unauthorized)
          .json(new ResponseModel(false, "Unauthorized: Tutor ID not found"));
        return;
      }

      if (!title || !description || !category || !price || !parsedChapters) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Missing required fields"));
        return;
      }

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

      const createdCourse = await this._courseService.createCourse(
        courseDto,
        files,
        thumbnailFile
      );

      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(true, "Course created successfully", createdCourse)
        );
    } catch (error: unknown) {
      console.error("Error in CourseController.createCourse:", error);
      if (error instanceof ValidationError) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, error.message, null));
      } else if (error instanceof Error) {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json(
            new ResponseModel(false, "Failed to create course", error.message)
          );
      }
    }
  }
  async publishCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Course id not available"));
        return;
      }
      const publishResponse = await this._courseService.publishCourse(id);
      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(
            true,
            "Course published successfully",
            publishResponse
          )
        );
    } catch (error) {
      console.error("Error in CourseController.createCourse:", error);
      if (error instanceof ValidationError) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, error.message, null));
      } else if (error instanceof Error) {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json(
            new ResponseModel(false, "Failed to publish course", error.message)
          );
      }
    }
  }
  async rejectCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!id) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Course id not available"));
        return;
      }

      const { course, tutor } = await this._courseService.rejectCourse(id);
      if (!tutor) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Cannot find tutor"));
        return;
      }

      if (!course) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Cannot find course"));
        return;
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

      res
        .status(HTTP_statusCode.OK)
        .json(new ResponseModel(true, "Course rejected successfully", course));
    } catch (error) {
      console.error("Error in CourseController.createCourse:", error);
      if (error instanceof ValidationError) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, error.message, null));
      } else if (error instanceof Error) {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json(
            new ResponseModel(false, "Failed to reject course", error.message)
          );
      }
    }
  }

  async getPublishedCourses(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 7, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;

      const result = await this._courseService.getPublishedCoursesForListing(
        skip,
        pageLimit,
        search
      );
      const response = new ResponseModel(
        true,
        "Courses fetched successfully",
        result
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, error.message, null));
      } else {
        const response = new ResponseModel(
          false,
          "Error in getPublishedCourse controller",
          null
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async listUnlistCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this._courseService.listUnlistCourseService(id);
      res
        .status(HTTP_statusCode.OK)
        .json(new ResponseModel(true, "Course listing changed successfully"));
    } catch (error) {
      if (error instanceof ValidationError) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, error.message, null));
      } else {
        const response = new ResponseModel(
          false,
          "Error in listUnlist Course",
          null
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const listedCourses = await this._courseService.getAllCourses();

      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(
            true,
            "Successfully fetched all listed courses",
            listedCourses
          )
        );
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, error.message, null));
      } else {
        const response = new ResponseModel(
          false,
          "Error fetching listed courses",
          null
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async getAllListedCourses(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user?.id;
      const {
        search,
        category,
        minPrice,
        maxPrice,
        sortBy,
        page = 1,
        limit = 50,
      } = req.query;

      const filters: CourseFilters = {
        search: search as string,
        category: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sortBy as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      };

      if (
        filters.minPrice !== undefined &&
        filters.maxPrice !== undefined &&
        filters.minPrice > filters.maxPrice
      ) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(
            new ResponseModel(
              false,
              "Minimum price cannot be greater than maximum price",
              null
            )
          );
        return;
      }

      if (filters.minPrice !== undefined && filters.minPrice < 0) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(
            new ResponseModel(false, "Minimum price cannot be negative", null)
          );
        return;
      }

      if (filters.maxPrice !== undefined && filters.maxPrice < 0) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(
            new ResponseModel(false, "Maximum price cannot be negative", null)
          );
        return;
      }

      const courses = await this._courseService.getAllListedCourses(
        filters,
        userId
      );
      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(
            true,
            "Successfully fetched all listed courses",
            courses
          )
        );
    } catch (error: unknown) {
      console.error("Error in getAllListedCourses:", error);

      if (error instanceof ValidationError) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, error.message, null));
      } else {
        const response = new ResponseModel(
          false,
          "Error fetching listed courses",
          null
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async getAllListedCategories(req: Request, res: Response): Promise<void> {
    try {
      const listedCategories =
        await this._courseService.getAllListedCategories();
      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(
            true,
            "Successfully fetched listed categories",
            listedCategories
          )
        );
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, error.message, null));
      } else {
        const response = new ResponseModel(
          false,
          "Error fetching listed categories",
          null
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async getCourseDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const courseDetails = await this._courseService.getCourseDetails(id);
      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(
            true,
            "Successfully fetched course details",
            courseDetails
          )
        );
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, error.message, null));
      } else {
        const response = new ResponseModel(
          false,
          "Error fetching course details",
          null
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async getTutorCourses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      if (!tutorId) {
        res
          .status(HTTP_statusCode.Unauthorized)
          .json(
            new ResponseModel(false, "Tutor authentication required", null)
          );
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";

      const result = await this._courseService.getTutorCourses(
        tutorId,
        page,
        limit,
        search
      );

      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(true, "Tutor courses fetched successfully", result)
        );
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, error.message, null));
      } else {
        const response = new ResponseModel(
          false,
          "Error fetching tutor's courses",
          null
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async editCourse(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const {
        title,
        description,
        benefits,
        requirements,
        category,
        price,
        chapters,
        thumbnailUrl,
      } = req.body;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      let parsedChapters: ChapterDto[];
      try {
        parsedChapters =
          typeof chapters === "string" ? JSON.parse(chapters) : chapters;
      } catch (parseError) {
        console.error("Error parsing chapters:", parseError);
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Invalid chapters data format"));
        return;
      }

      const tutorId = (req as AuthRequest).user?.id;

      if (!tutorId) {
        res
          .status(HTTP_statusCode.Unauthorized)
          .json(new ResponseModel(false, "Unauthorized: Tutor ID not found"));
        return;
      }

      const existingCourse = await this._courseService.getCourseDetails(
        courseId
      );
      if (!existingCourse || existingCourse.tutor._id !== tutorId) {
        res
          .status(HTTP_statusCode.NoAccess)
          .json(new ResponseModel(false, "You can only edit your own courses"));
        return;
      }

      if (!title || !description || !category || !price || !parsedChapters) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Missing required fields"));
        return;
      }

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

      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(true, "Course updated successfully", updatedCourse)
        );
    } catch (error: unknown) {
      console.error("Error in CourseController.editCourse:", error);
      if (error instanceof ValidationError) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, error.message, null));
      } else if (error instanceof Error) {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json(
            new ResponseModel(false, "Failed to update course", error.message)
          );
      }
    }
  }
}
