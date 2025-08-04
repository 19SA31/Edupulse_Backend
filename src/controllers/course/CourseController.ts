import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../utils/jwt";
import { ResponseModel } from "../../models/ResponseModel";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { ICourseService } from "../../interfaces/course/courseServiceInterface";
import { CreateCourseDto } from "../../dto/course/CourseDTO";

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
    console.log(
      "course-create-contr",
      title,
      description,
      benefits,
      requirements,
      category,
      price,
      chapters
    );

    let parsedChapters;
    try {
      parsedChapters =
        typeof chapters === "string" ? JSON.parse(chapters) : chapters;
    } catch (parseError) {
      res
        .status(400)
        .json(new ResponseModel(false, "Invalid chapters data format"));
      return;
    }

    const tutorId = (req as AuthRequest).user?.id;
    console.log("Tutor ID from token:", tutorId);

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

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
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
  } catch (error: any) {
    console.error("Error in CourseController.createCourse:", error);
    res
      .status(500)
      .json(
        new ResponseModel(false, "Failed to create course", error.message)
      );
  }
}
}
