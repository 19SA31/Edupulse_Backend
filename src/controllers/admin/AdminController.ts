import { Request, Response } from "express";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { IAdminService } from "../../interfaces/admin/adminServiceInterface";
import { ResponseModel } from "../../models/ResponseModel";

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

      const { users, totalPages } = await this.AdminService.getAllUsers(
        skip,
        pageLimit,
        search
      );

      const response = new ResponseModel(
        true,
        "Fetch users successfully",
        { users, totalPages }
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

      const result = await this.AdminService.getAllTutors(
        skip,
        pageLimit,
        search
      );

      const response = new ResponseModel(
        true,
        "Fetched tutors successfully",
        result
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

      const user = await this.AdminService.listUnlistUser(id);

      const response = new ResponseModel(
        true,
        "User updated successfully",
        user
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

      const tutor = await this.AdminService.listUnlistTutor(id);

      const response = new ResponseModel(
        true,
        "Tutor updated successfully",
        tutor
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
      const category = await this.AdminService.addCourseCategory(req.body);

      const response = new ResponseModel(
        true,
        "Category created successfully",
        category
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

      const { category, totalPages } = await this.AdminService.getAllCategories(
        skip,
        pageLimit,
        search
      );

      const response = new ResponseModel(
        true,
        "Fetched categories successfully",
        { category, totalPages }
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
      const updateData = req.body;

      const updatedCategory = await this.AdminService.updateCourseCategory(
        categoryId,
        updateData
      );

      const response = new ResponseModel(
        true,
        "Category updated successfully",
        updatedCategory
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

      const updatedCategory = await this.AdminService.toggleCategoryListStatus(categoryId);

      const response = new ResponseModel(
        true,
        "Category status updated successfully",
        updatedCategory
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