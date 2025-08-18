import { Request, Response } from "express";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { IAdminService } from "../../interfaces/admin/adminServiceInterface";
import { ResponseModel } from "../../models/ResponseModel";
import { sendRejectionEmail } from "../../config/emailConfig";
import { ValidationError } from "../../errors/ValidationError";

export class AdminController {
  private _AdminService: IAdminService;

  constructor(AdminServiceInstance: IAdminService) {
    this._AdminService = AdminServiceInstance;
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;

      const { users, totalPages } = await this._AdminService.getAllUsers(
        skip,
        pageLimit,
        search
      );

      const response = new ResponseModel(true, "Fetch users successfully", {
        users,
        totalPages,
      });

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

      const result = await this._AdminService.getAllTutors(
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

      const user = await this._AdminService.listUnlistUser(id);

      const response = new ResponseModel(
        true,
        "User updated successfully",
        user
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in listUnlistUser controller:", error.message);

      if (error.message === "User not found") {
        const response = new ResponseModel(false, "User not found", null);
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

      const tutor = await this._AdminService.listUnlistTutor(id);

      const response = new ResponseModel(
        true,
        "Tutor updated successfully",
        tutor
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in listUnlistTutor controller:", error.message);

      if (error.message === "Tutor not found") {
        const response = new ResponseModel(false, "Tutor not found", null);
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
      const category = await this._AdminService.addCourseCategory(req.body);

      const response = new ResponseModel(
        true,
        "Category created successfully",
        category
      );

      res.status(HTTP_statusCode.updated).json(response);
    } catch (error: any) {
      console.error("Error in addCategory controller:", error.message);

      if (error instanceof ValidationError) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, error.message, null));
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

      const { categories, totalPages } =
        await this._AdminService.getAllCategories(skip, pageLimit, search);

      const response = new ResponseModel(
        true,
        "Fetched categories successfully",
        { categories, totalPages }
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

      const updatedCategory = await this._AdminService.updateCourseCategory(
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
        const response = new ResponseModel(false, "Category not found", null);
        res.status(HTTP_statusCode.NotFound).json(response);
      } else if (error.message.includes("already exists")) {
        const response = new ResponseModel(false, error.message, null);
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

      const updatedCategory = await this._AdminService.toggleCategoryListStatus(
        categoryId
      );

      const response = new ResponseModel(
        true,
        "Category status updated successfully",
        updatedCategory
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in toggleCategoryStatus controller:", error.message);

      if (error.message === "Category not found") {
        const response = new ResponseModel(false, "Category not found", null);
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

  async getTutorDocs(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;

      const result = await this._AdminService.getAllTutorDocs(
        skip,
        pageLimit,
        search
      );

      const response = new ResponseModel(
        true,
        "Fetched tutor docs successfully",
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

  async rejectTutor(req: Request, res: Response): Promise<void> {
    try {
      const { tutorId } = req.params;
      const { reason } = req.body;
      console.log("rejecting tutor contr ", tutorId);

      if (!reason || reason.trim() === "") {
        const response = new ResponseModel(
          false,
          "Rejection reason is required",
          null
        );
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      const result = await this._AdminService.rejectTutor(tutorId, reason);

      if (!result) {
        const response = new ResponseModel(
          false,
          "Failed to reject tutor",
          null
        );
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      if (result.success) {
        const emailSent = await sendRejectionEmail(
          result.tutorEmail!,
          result.tutorName!,
          reason
        );

        if (!emailSent) {
          console.warn(
            `Failed to send rejection email to ${result.tutorEmail}`
          );
        }

        const response = new ResponseModel(
          true,
          "Tutor rejected successfully",
          {
            tutorId,
            reason: reason,
            emailSent,
          }
        );

        res.status(HTTP_statusCode.OK).json(response);
      } else {
        const response = new ResponseModel(
          false,
          result.message || "Failed to reject tutor",
          null
        );
        res.status(HTTP_statusCode.BadRequest).json(response);
      }
    } catch (error: any) {
      console.error("Error in rejectTutor controller:", error.message);

      if (error.message === "Tutor not found") {
        const response = new ResponseModel(false, "Tutor not found", null);
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

  async verifyTutor(req: Request, res: Response): Promise<void> {
    try {
      const { tutorId } = req.params;

      const result = await this._AdminService.verifyTutor(tutorId);

      if (result.success) {
        const response = new ResponseModel(
          true,
          "Tutor verified successfully",
          result
        );

        res.status(HTTP_statusCode.OK).json(response);
      } else {
        const response = new ResponseModel(
          false,
          result.message || "Failed to verify tutor",
          null
        );
        res.status(HTTP_statusCode.BadRequest).json(response);
      }
    } catch (error: any) {
      console.error("Error in verifyTutor controller:", error.message);

      if (error.message === "Tutor not found") {
        const response = new ResponseModel(false, "Tutor not found", null);
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
