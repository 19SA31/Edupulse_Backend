// src/controllers/admin/AdminController.ts
import { Request, Response } from "express";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { IAdminService } from "../../interfaces/admin/adminServiceInterface";
import { ResponseModel } from "../../models/ResponseModel";
import { UserMapper } from "../../mappers/admin/UserMapper";
import { TutorMapper } from "../../mappers/admin/TutorMapper";
import { CategoryMapper } from "../../mappers/admin/CategoryMapper";
import { CreateCategoryDto, UpdateCategoryDto } from "../../dto/admin/CategoryDTO";

export class AdminController {
  private AdminService: IAdminService;

  constructor(AdminServiceInstance: IAdminService) {
    this.AdminService = AdminServiceInstance;
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;

      const { users, totalPages, totalCount } = await this.AdminService.getAllUsers(
        skip,
        pageLimit,
        search
      );

      // Create paginated DTO
      const paginatedUsers = UserMapper.toPaginatedDto(users, totalPages, pageNumber, totalCount);

      const response = new ResponseModel(
        true,
        "Fetch users successfully",
        paginatedUsers
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in getUsers controller:", error.message);
      
      const response = new ResponseModel(
        false,
        "An unexpected error occurred",
        null
      );

      res.status(HTTP_statusCode.InternalServerError).json(response);
    }
  }

  async getTutors(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;

      const { tutors, totalPages, totalCount } = await this.AdminService.getAllTutors(
        skip,
        pageLimit,
        search
      );

      // Create paginated DTO
      const paginatedTutors = TutorMapper.toPaginatedDto(tutors, totalPages, pageNumber, totalCount);

      const response = new ResponseModel(
        true,
        "Fetched tutors successfully",
        paginatedTutors
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in getTutors controller:", error.message);

      const response = new ResponseModel(
        false,
        "An unexpected error occurred",
        null
      );

      res.status(HTTP_statusCode.InternalServerError).json(response);
    }
  }

  async listUnlistUser(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.userId;

      const userDto = await this.AdminService.listUnlistUser(id);

      const response = new ResponseModel(
        true,
        "User updated successfully",
        userDto
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in listUnlistUser controller:", error.message);

      if (error.message === "User not found") {
        const response = new ResponseModel(
          false,
          "User not found",
          null
        );
        res.status(HTTP_statusCode.NotFound).json(response);
      } else {
        const response = new ResponseModel(
          false,
          "An unexpected error occurred",
          null
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async listUnlistTutor(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.tutorId;

      const tutorDto = await this.AdminService.listUnlistTutor(id);

      const response = new ResponseModel(
        true,
        "Tutor updated successfully",
        tutorDto
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in listUnlistTutor controller:", error.message);

      if (error.message === "Tutor not found") {
        const response = new ResponseModel(
          false,
          "Tutor not found",
          null
        );
        res.status(HTTP_statusCode.NotFound).json(response);
      } else {
        const response = new ResponseModel(
          false,
          "An unexpected error occurred",
          null
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async addCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("inside admin controller of add category");
      
      const createCategoryDto: CreateCategoryDto = req.body;
      const categoryDto = await this.AdminService.addCourseCategory(createCategoryDto);

      const response = new ResponseModel(
        true,
        "Category created successfully",
        categoryDto
      );

      res.status(HTTP_statusCode.updated).json(response);
    } catch (error: any) {
      console.error("Error in addCategory controller:", error.message);

      if (error.message.includes("already exists")) {
        const response = new ResponseModel(
          false,
          error.message,
          null
        );
        res.status(HTTP_statusCode.BadRequest).json(response);
      } else {
        const response = new ResponseModel(
          false,
          "Failed to create category",
          null
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;

      const { categories, totalPages, totalCount } = await this.AdminService.getAllCategories(
        skip,
        pageLimit,
        search
      );

     console.log("inside get all categories",categories)
      const paginatedCategories = CategoryMapper.toPaginatedDto(categories, totalPages, pageNumber, totalCount);
      console.log(paginatedCategories)
      const response = new ResponseModel(
        true,
        "Fetched categories successfully",
        paginatedCategories
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in getCategories controller:", error.message);

      const response = new ResponseModel(
        false,
        "Failed to fetch categories",
        null
      );

      res.status(HTTP_statusCode.InternalServerError).json(response);
    }
  }

  async editCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("inside admin controller of edit category");
      const categoryId = req.params.id;
      const updateCategoryDto: UpdateCategoryDto = req.body;

      const categoryDto = await this.AdminService.updateCourseCategory(
        categoryId,
        updateCategoryDto
      );

      const response = new ResponseModel(
        true,
        "Category updated successfully",
        categoryDto
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in editCategory controller:", error.message);
      
      if (error.message === "Category not found") {
        const response = new ResponseModel(
          false,
          "Category not found",
          null
        );
        res.status(HTTP_statusCode.NotFound).json(response);
      } else if (error.message.includes("already exists")) {
        const response = new ResponseModel(
          false,
          error.message,
          null
        );
        res.status(HTTP_statusCode.BadRequest).json(response);
      } else {
        const response = new ResponseModel(
          false,
          "An unexpected error occurred",
          null
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async toggleCategoryStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log("inside toggle category status");
      const categoryId = req.params.id;

      const categoryDto = await this.AdminService.toggleCategoryListStatus(categoryId);

      const response = new ResponseModel(
        true,
        "Category status updated successfully",
        categoryDto
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in toggleCategoryStatus controller:", error.message);
      
      if (error.message === "Category not found") {
        const response = new ResponseModel(
          false,
          "Category not found",
          null
        );
        res.status(HTTP_statusCode.NotFound).json(response);
      } else {
        const response = new ResponseModel(
          false,
          "An unexpected error occurred",
          null
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }
}