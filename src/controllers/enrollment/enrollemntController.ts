import { Request, Response, NextFunction } from "express";
import EnrollmentService from "../../services/enrollment/enrollmentService";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { AppError } from "../../errors/AppError";
import { sendSuccess, sendError } from "../../helper/responseHelper";
import {
  CreateEnrollmentDTO,
  VerifyPaymentDTO,
  GetUserEnrollmentsDTO,
  VerifyUserEnrollmentDTO,
} from "../../dto/enrollment/enrollmentDTO";
import {
  sendCoursePurchaseEmail,
  tutorNotificationEmail,
} from "../../config/emailConfig";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

class EnrollmentController {
  constructor(private enrollmentService: EnrollmentService) {}

  private getUserId(req: AuthRequest): string {
    if (!req.user?.id) {
      throw new AppError("User authentication required", HTTP_statusCode.Unauthorized);
    }
    return req.user.id;
  }

  private validatePagination(page?: number, limit?: number) {
    return {
      page: !page || page < 1 ? 1 : page,
      limit: !limit || limit < 1 ? 10 : limit,
    };
  }

  private async sendNotificationEmails(paymentId: string): Promise<void> {
    const purchaseData = await this.enrollmentService.getPaymentData(paymentId);

    if (!purchaseData) {
      throw new AppError("Payment data not found", HTTP_statusCode.NotFound);
    }

    const emailSent = await sendCoursePurchaseEmail(
      purchaseData.userEmail,
      purchaseData.userName,
      purchaseData.courseTitle,
      purchaseData.tutorName,
      purchaseData.price.toString()
    );

    if (!emailSent) {
      throw new AppError("Purchase email sending failed", HTTP_statusCode.TaskFailed);
    }

    const tutorMailSent = await tutorNotificationEmail(
      purchaseData.userEmail,
      purchaseData.userName,
      purchaseData.courseTitle,
      purchaseData.tutorName,
      purchaseData.tutorEmail
    );

    if (!tutorMailSent) {
      throw new AppError("Tutor notification email failed", HTTP_statusCode.TaskFailed);
    }
  }

  createPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const { courseId, tutorId, categoryId, price } = req.body;

      if (!courseId || !tutorId || !categoryId || !price) {
        throw new AppError("Missing required fields", HTTP_statusCode.BadRequest);
      }

      const createEnrollmentDTO: CreateEnrollmentDTO = {
        userId,
        tutorId,
        courseId,
        categoryId,
        price: Number(price),
      };

      const result = await this.enrollmentService.createEnrollment(createEnrollmentDTO);

      if (!result) {
        throw new AppError("Payment session failed", HTTP_statusCode.TaskFailed);
      }

      sendSuccess(
        res,
        "Payment session created successfully",
        {
          sessionId: result.sessionId,
          enrollmentId: result.enrollment.id,
          checkoutUrl: `https://checkout.stripe.com/pay/${result.sessionId}`,
        }
      );
    } catch (error) {
      next(error);
    }
  };

  verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const { sessionId } = req.body;

      if (!sessionId) {
        throw new AppError("Session ID is required", HTTP_statusCode.BadRequest);
      }

      const verifyPaymentDTO: VerifyPaymentDTO = { sessionId };
      const result = await this.enrollmentService.verifyPaymentAndUpdateStatus(verifyPaymentDTO);

      if (!result.enrollment) {
        throw new AppError(result.message || "Enrollment not found", HTTP_statusCode.NotFound);
      }

      if (!result.enrollment.paymentId) {
        throw new AppError("Payment ID is missing", HTTP_statusCode.BadRequest);
      }

      await this.sendNotificationEmails(result.enrollment.paymentId);

      sendSuccess(
        res,
        result.message || "Payment verification completed",
        {
          enrollment: result.enrollment,
          paymentStatus: result.paymentStatus,
        }
      );
    } catch (error) {
      next(error);
    }
  };

  getUserEnrollments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const { page, limit, search } = req.query;

      const pagination = this.validatePagination(
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

      const getUserEnrollmentsDTO: GetUserEnrollmentsDTO = {
        userId,
        page: pagination.page,
        limit: pagination.limit,
        search: search as string,
      };

      const result = await this.enrollmentService.getUserEnrollments(getUserEnrollmentsDTO);
      sendSuccess(res, "User enrollments fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };

  verifyEnrollment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const { courseId } = req.params;

      if (!courseId) {
        throw new AppError("Course ID is required", HTTP_statusCode.BadRequest);
      }

      const verifyUserEnrollmentDTO: VerifyUserEnrollmentDTO = { userId, courseId };
      const result = await this.enrollmentService.verifyUserEnrollment(verifyUserEnrollmentDTO);

      if (!result.isEnrolled) {
        throw new AppError("User is not enrolled in this course", HTTP_statusCode.NotFound);
      }

      sendSuccess(res, "User enrollment verified", {
        isEnrolled: result.isEnrolled,
        enrollmentId: result.enrollmentId,
      });
    } catch (error) {
      next(error);
    }
  };

  getEnrollmentByPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.getUserId(req);
      const { paymentId } = req.params;

      if (!paymentId) {
        throw new AppError("Payment ID is required", HTTP_statusCode.BadRequest);
      }

      const result = await this.enrollmentService.getEnrollmentByPaymentId({ paymentId });

      if (!result) {
        throw new AppError("Enrollment not found", HTTP_statusCode.NotFound);
      }

      sendSuccess(res, "Enrollment found", result);
    } catch (error) {
      next(error);
    }
  };

  getEnrolledCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const enrolledCourses = await this.enrollmentService.getEnrolledCourses(userId);

      if (!enrolledCourses) {
        throw new AppError("No enrolled courses", HTTP_statusCode.NotFound);
      }

      sendSuccess(res, "Fetched enrolled courses", enrolledCourses);
    } catch (error) {
      next(error);
    }
  };

  getAllEnrollments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, search, status, startDate, endDate, sortBy } = req.query;

      const pagination = this.validatePagination(
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

      const getAllEnrollmentsDTO = {
        page: pagination.page,
        limit: pagination.limit,
        search: search as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
        sortBy: sortBy as string,
      };

      const result = await this.enrollmentService.getAllEnrollments(getAllEnrollmentsDTO);
      sendSuccess(res, "All enrollments fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };
}

export default EnrollmentController;