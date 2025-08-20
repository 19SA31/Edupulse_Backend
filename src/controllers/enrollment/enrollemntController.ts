import { Request, Response } from "express";
import EnrollmentService from "../../services/enrollment/enrollmentService";
import { ResponseModel } from "../../models/ResponseModel";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { ValidationError } from "../../errors/ValidationError";
import {
  CreateEnrollmentDTO,
  VerifyPaymentDTO,
  GetUserEnrollmentsDTO,
  VerifyUserEnrollmentDTO,
} from "../../dto/enrollment/enrollmentDTO";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

class EnrollmentController {
  constructor(private enrollmentService: EnrollmentService) {}

  createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { courseId, tutorId, categoryId, price } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_statusCode.Unauthorized)
          .json(new ResponseModel(false, "User authentication required", null));
        return;
      }

      if (!courseId || !tutorId || !categoryId || !price) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Missing required fields", null));
        return;
      }

      const createEnrollmentDTO: CreateEnrollmentDTO = {
        userId,
        tutorId,
        courseId,
        categoryId,
        price: Number(price),
      };

      const result = await this.enrollmentService.createEnrollment(createEnrollmentDTO);

      res.status(HTTP_statusCode.OK).json({
        success: true,
        data: {
          sessionId: result.sessionId,
          enrollmentId: result.enrollment.id,
          checkoutUrl: `https://checkout.stripe.com/pay/${result.sessionId}`,
        },
        message: "Payment session created successfully",
      });
    } catch (error: unknown) {
      console.error("Create payment error:", error);

      if (error instanceof ValidationError || error instanceof Error) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, (error as Error).message, null));
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json(
            new ResponseModel(false, "Failed to create payment session", null)
          );
      }
    }
  };

  verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_statusCode.Unauthorized)
          .json(new ResponseModel(false, "User authentication required", null));
        return;
      }

      if (!sessionId) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Session ID is required", null));
        return;
      }

      const verifyPaymentDTO: VerifyPaymentDTO = {
        sessionId,
      };

      const result = await this.enrollmentService.verifyPaymentAndUpdateStatus(verifyPaymentDTO);

      if (!result.enrollment) {
        res
          .status(HTTP_statusCode.NotFound)
          .json(new ResponseModel(false, result.message || "Enrollment not found", null));
        return;
      }

      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(true, result.message || "Payment verification completed", {
            enrollment: result.enrollment,
            paymentStatus: result.paymentStatus,
          })
        );
    } catch (error: unknown) {
      console.error("Verify payment error:", error);

      if (error instanceof ValidationError || error instanceof Error) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, (error as Error).message, null));
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json(new ResponseModel(false, "Failed to verify payment", null));
      }
    }
  };

  getUserEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { page = "1", limit = "10", search } = req.query;

      if (!userId) {
        res
          .status(HTTP_statusCode.Unauthorized)
          .json(new ResponseModel(false, "User authentication required", null));
        return;
      }

      const getUserEnrollmentsDTO: GetUserEnrollmentsDTO = {
        userId,
        page: parseInt(page as string, 10) || 1,
        limit: parseInt(limit as string, 10) || 10,
        search: search as string,
      };

      const result = await this.enrollmentService.getUserEnrollments(getUserEnrollmentsDTO);

      console.log(result);
      const response = new ResponseModel(
        true,
        "User enrollments fetched successfully",
        result
      );

      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: unknown) {
      console.error("Get user enrollments error", error);

      if (error instanceof ValidationError || error instanceof Error) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, (error as Error).message, null));
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json(
            new ResponseModel(false, "Failed to fetch user enrollments", null)
          );
      }
    }
  };

  verifyEnrollment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_statusCode.Unauthorized)
          .json(new ResponseModel(false, "User authentication required", null));
        return;
      }

      if (!courseId) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Course ID is required", null));
        return;
      }

      const verifyUserEnrollmentDTO: VerifyUserEnrollmentDTO = {
        userId,
        courseId,
      };

      const result = await this.enrollmentService.verifyUserEnrollment(verifyUserEnrollmentDTO);

      if (!result.isEnrolled) {
        res
          .status(HTTP_statusCode.NotFound)
          .json(new ResponseModel(false, "User is not enrolled in this course", null));
        return;
      }

      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(true, "User enrollment verified", {
            isEnrolled: result.isEnrolled,
            enrollmentId: result.enrollmentId,
          })
        );
    } catch (error: unknown) {
      console.error("Verify enrollment error:", error);

      if (error instanceof ValidationError || error instanceof Error) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, (error as Error).message, null));
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json(new ResponseModel(false, "Failed to verify enrollment", null));
      }
    }
  };

  getEnrollmentByPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { paymentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_statusCode.Unauthorized)
          .json(new ResponseModel(false, "User authentication required", null));
        return;
      }

      if (!paymentId) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Payment ID is required", null));
        return;
      }

      const result = await this.enrollmentService.getEnrollmentByPaymentId({
        paymentId,
      });

      if (!result) {
        res
          .status(HTTP_statusCode.NotFound)
          .json(new ResponseModel(false, "Enrollment not found", null));
        return;
      }

      res
        .status(HTTP_statusCode.OK)
        .json(new ResponseModel(true, "Enrollment found", result));
    } catch (error: unknown) {
      console.error("Get enrollment by payment error:", error);

      if (error instanceof ValidationError || error instanceof Error) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, (error as Error).message, null));
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json(new ResponseModel(false, "Failed to get enrollment", null));
      }
    }
  };
}

export default EnrollmentController;