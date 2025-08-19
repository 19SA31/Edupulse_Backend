import { Request, Response } from "express";
import { IEnrollmentService } from "../../interfaces/enrollment/enrollmentServiceInterface";
import { ResponseModel } from "../../models/ResponseModel";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { ValidationError } from "../../errors/ValidationError";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

class EnrollmentController {
  constructor(private enrollmentService: IEnrollmentService) {}

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

      const result = await this.enrollmentService.createEnrollment({
        userId,
        tutorId,
        courseId,
        categoryId,
        price: Number(price),
      });

      res.status(200).json({
        success: true,
        data: {
          sessionId: result.sessionId,
          enrollmentId: result.enrollment._id,
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
          .status(500)
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

      const enrollment =
        await this.enrollmentService.verifyPaymentAndUpdateStatus(sessionId);

      if (!enrollment) {
        res
          .status(HTTP_statusCode.NotFound)
          .json(new ResponseModel(false, "Enrollment not found", null));
        return;
      }

      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(true, "Payment verification completed", enrollment)
        );
    } catch (error: unknown) {
      console.error("Verify payment error:", error);

      if (error instanceof ValidationError || error instanceof Error) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, (error as Error).message, null));
      } else {
        res
          .status(500)
          .json(new ResponseModel(false, "Failed to verify paymentn", null));
      }
    }
  };

  getUserEnrollments = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_statusCode.Unauthorized)
          .json(new ResponseModel(false, "User authentication required", null));
        return;
      }

      const enrollments = await this.enrollmentService.getUserEnrollments(
        userId
      );

      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(
            true,
            "User enrollments fetched successfully",
            enrollments
          )
        );
    } catch (error: unknown) {
      console.error("Get user enrollments error", error);

      if (error instanceof ValidationError || error instanceof Error) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, (error as Error).message, null));
      } else {
        res
          .status(500)
          .json(
            new ResponseModel(false, "Failed to fetch user enrollment", null)
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

      const isEnrolled = await this.enrollmentService.verifyUserEnrollment(
        userId,
        courseId
      );

      if(!isEnrolled){
        res
        .status(HTTP_statusCode.NotFound)
        .json(new ResponseModel(false, "Enrollment not verified", null));
        return
      }

      res
        .status(HTTP_statusCode.OK)
        .json(new ResponseModel(true, "Verified enrollment", isEnrolled));
    } catch (error: unknown) {
      console.error("Verify enrollment error:", error);

      if (error instanceof ValidationError || error instanceof Error) {
        res.status(HTTP_statusCode.BadRequest);
      } else {
        res
          .status(500)
          .json(new ResponseModel(false, "Failed to verify enrollment", null));
      }
    }
  };

  getEnrollmentStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User authentication required",
        });
        return;
      }

      const enrollment =
        await this.enrollmentService.verifyPaymentAndUpdateStatus(sessionId);

      if (!enrollment) {
        res.status(404).json({
          success: false,
          message: "Enrollment not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: enrollment,
        message: "Enrollment status fetched successfully",
      });
    } catch (error: unknown) {
      console.error("Get enrollment status error:", error);

      if (error instanceof ValidationError || error instanceof Error) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, (error as Error).message, null));
      } else {
        res
          .status(500)
          .json(
            new ResponseModel(false, "Failed to fetch enrollment status", null)
          );
      }
    }
  };
}

export default EnrollmentController;
