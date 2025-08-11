import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../utils/jwt";
import { ResponseModel } from "../../models/ResponseModel";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { ICourseService } from "../../interfaces/course/courseServiceInterface";
import { CreateCourseDto } from "../../dto/course/CourseDTO";
import { ValidationError } from "../../errors/ValidationError";
import { sendCourseRejectionEmail } from "../../config/emailConfig";

export class CourseController {
  private _CourseService: ICourseService;
  constructor(CourseServiceIsntance: ICourseService) {
    this._CourseService = CourseServiceIsntance;
  }

  async getCategoryNames(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const fetchCategroyNames = await this._CourseService.getAllCategories();
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

      const result = await this._CourseService.getUnpublishedCourses(
        skip,
        pageLimit,
        searchTerm
      );

      console.log("fetched Courses", result);

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
          .status(500)
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

      let parsedChapters;
      try {
        parsedChapters =
          typeof chapters === "string" ? JSON.parse(chapters) : chapters;
        parsedChapters.forEach((chapter: any, chapterIndex: number) => {
          chapter.lessons?.forEach((lesson: any, lessonIndex: number) => {});
        });
      } catch (parseError) {
        console.error("Error parsing chapters:", parseError);
        res
          .status(400)
          .json(new ResponseModel(false, "Invalid chapters data format"));
        return;
      }

      const tutorId = (req as AuthRequest).user?.id;

      if (!tutorId) {
        res
          .status(401)
          .json(new ResponseModel(false, "Unauthorized: Tutor ID not found"));
        return;
      }

      if (!title || !description || !category || !price || !parsedChapters) {
        res
          .status(400)
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

      const createdCourse = await this._CourseService.createCourse(
        courseDto,
        files,
        thumbnailFile
      );

      res
        .status(201)
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
          .status(500)
          .json(
            new ResponseModel(false, "Failed to create course", error.message)
          );
      }
    }
  }
  async publishCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log("inside publishcourse", id);
      if (!id) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Course id not available"));
        return;
      }
      const publishResponse = await this._CourseService.publishCourse(id);
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
          .status(500)
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
      console.log("inside rejectCourse", id, reason);

      if (!id) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Course id not available"));
        return;
      }

      const { course, tutor } = await this._CourseService.rejectCourse(id);
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
          .status(500)
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

      const result = await this._CourseService.getPublishedCoursesForListing(
        skip,
        pageLimit,
        search
      );
      console.log(result);
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
      console.log("listUnlistCourse", id);
      await this._CourseService.listUnlistCourseService(id);
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
}
