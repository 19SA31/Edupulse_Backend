import { Request, Response } from "express";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { IAdminService } from "../../interfaces/admin/adminServiceInterface";

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

      res.status(HTTP_statusCode.OK).json({
        message: "Fetch users successfully",
        response: { users, totalPages },
      });
    } catch (error: any) {
      console.error("Error in getUsers controller:", error.message);
      res.status(HTTP_statusCode.InternalServerError).json({
        message: "An unexpected error occurred",
        error: error.message,
      });
    }
  }
  async getTutors(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);

      const skip = (pageNumber - 1) * pageLimit;

      const response = await this.AdminService.getAllTutors(
        skip,
        pageLimit,
        search
      );

      res
        .status(HTTP_statusCode.OK)
        .json({ message: "Fetched tutors successfully", response });
    } catch (error: any) {
      console.error("Error in gettutors controller:", error.message);

      res.status(HTTP_statusCode.InternalServerError).json({
        message: "An unexpected error occurred",
        error: error.message,
      });
    }
  }

  async listUnlistUser(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.userId;

      const response = await this.AdminService.listUnlistUser(id);

      res
        .status(HTTP_statusCode.OK)
        .json({ message: "user updated successfully", response });
    } catch (error: any) {
      console.error("Error in listunlistuser controller:", error.message);

      if (error.message === "Something went wrong while creating the user.") {
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ message: "Something went wrong while updating the user." });
      } else {
        res.status(HTTP_statusCode.InternalServerError).json({
          message: "An unexpected error occurred",
          error: error.message,
        });
      }
    }
  }

  async listUnlistTutor(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.tutorId;

      const response = await this.AdminService.listUnlistTutor(id);

      res
        .status(HTTP_statusCode.OK)
        .json({ message: "Tutor updated successfully", response });
    } catch (error: any) {
      console.error("Error in listunlisttutor controller:", error.message);

      if (error.message === "Something went wrong while creating the user.") {
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ message: "Something went wrong while updating the user." });
      } else {
        res.status(HTTP_statusCode.InternalServerError).json({
          message: "An unexpected error occurred",
          error: error.message,
        });
      }
    }
  }

  async addCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("inside admin controll of add category")
      const category = await this.AdminService.addCourseCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
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
      res.status(HTTP_statusCode.OK).json({
        message: "Fetched categories successfully",
        response: { category, totalPages },
      });
    } catch (error: any) {
      console.error("Error in controller:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch categories" });
    }
  }

  // async editCategory(req: Request, res: Response): Promise<void> {
  //   try {
  //     console.log("inside admin controller of edit category");
  //     const categoryId = req.params.categoryId;
  //     const updateData = req.body;

  //     const updatedCategory = await this.AdminService.updateCourseCategory(
  //       categoryId,
  //       updateData
  //     );

  //     res.status(HTTP_statusCode.OK).json({
  //       success: true,
  //       message: "Category updated successfully",
  //       data: updatedCategory
  //     });
  //   } catch (error: any) {
  //     console.error("Error in editCategory controller:", error.message);
      
  //     if (error.message === "Category not found") {
  //       res.status(HTTP_statusCode.NotFound).json({
  //         success: false,
  //         message: "Category not found"
  //       });
  //     } else if (error.message.includes("already exists")) {
  //       res.status(HTTP_statusCode.BadRequest).json({
  //         success: false,
  //         message: error.message
  //       });
  //     } else {
  //       res.status(HTTP_statusCode.InternalServerError).json({
  //         success: false,
  //         message: "An unexpected error occurred",
  //         error: error.message
  //       });
  //     }
  //   }
  // }

  // async toggleCategoryStatus(req: Request, res: Response): Promise<void> {
  //   try {
  //     const categoryId = req.params.categoryId;

  //     const updatedCategory = await this.AdminService.toggleCategoryListStatus(categoryId);

  //     res.status(HTTP_statusCode.OK).json({
  //       success: true,
  //       message: "Category status updated successfully",
  //       data: updatedCategory
  //     });
  //   } catch (error: any) {
  //     console.error("Error in toggleCategoryStatus controller:", error.message);
      
  //     if (error.message === "Category not found") {
  //       res.status(HTTP_statusCode.NotFound).json({
  //         success: false,
  //         message: "Category not found"
  //       });
  //     } else {
  //       res.status(HTTP_statusCode.InternalServerError).json({
  //         success: false,
  //         message: "An unexpected error occurred",
  //         error: error.message
  //       });
  //     }
  //   }
  // }
}

