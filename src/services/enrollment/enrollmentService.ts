import mongoose from "mongoose";
import { IEnrollmentRepository } from "../../interfaces/enrollment/enrollmentRepoInterface";
import { stripe } from "../../config/stripe";
import {
  CreateEnrollmentDTO,
  VerifyPaymentDTO,
  GetUserEnrollmentsDTO,
  VerifyUserEnrollmentDTO,
  GetEnrollmentByPaymentDTO,
  CreateEnrollmentResponseDTO,
  UserEnrollmentsResponseDTO,
  PaymentVerificationResponseDTO,
  EnrollmentVerificationResponseDTO,
  EnrollmentResponseDTO,
  EnrollmentErrorDTO,
} from "../../dto/enrollment/enrollmentDTO";
import { EnrollmentMapper } from "../../mappers/enrollment/enrollmentMapper";

class EnrollmentService {
  constructor(private enrollmentRepository: IEnrollmentRepository) {}

  async createEnrollment(
    dto: CreateEnrollmentDTO
  ): Promise<CreateEnrollmentResponseDTO> {
    try {
      const validation = EnrollmentMapper.validateCreateEnrollmentDTO(dto);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const domainData = EnrollmentMapper.toDomainModel(dto);

      const existingEnrollment =
        await this.enrollmentRepository.checkUserEnrollment(
          domainData.userId,
          domainData.courseId
        );

      if (existingEnrollment) {
        throw new Error("User is already enrolled in this course");
      }

      const baseUrl = process.env.FRONTEND_URL;
      if (!baseUrl) {
        throw new Error("FRONTEND_URL environment variable is required");
      }
      const cleanBaseUrl = baseUrl.replace(/\/$/, "");

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: "Course Enrollment",
                description: `Enrollment for course ID: ${domainData.courseId}`,
              },
              unit_amount: domainData.price * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${cleanBaseUrl}/payment-success/${domainData.courseId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${cleanBaseUrl}/payment-success/${domainData.courseId}?payment=cancelled`,
        metadata: {
          userId: domainData.userId,
          courseId: domainData.courseId,
          tutorId: domainData.tutorId,
          categoryId: domainData.categoryId,
        },
      });

      const enrollment = await this.enrollmentRepository.create({
        userId: new mongoose.Types.ObjectId(domainData.userId),
        tutorId: new mongoose.Types.ObjectId(domainData.tutorId),
        courseId: new mongoose.Types.ObjectId(domainData.courseId),
        categoryId: new mongoose.Types.ObjectId(domainData.categoryId),
        price: domainData.price,
        paymentId: session.id,
        paymentMethod: "stripe",
        status: "pending",
        dateOfEnrollment: new Date(),
      });

      return EnrollmentMapper.toCreateEnrollmentResponse(
        enrollment,
        session.id
      );
    } catch (error) {
      console.error("Error creating enrollment:", error);
      throw error;
    }
  }

  async verifyPaymentAndUpdateStatus(
    dto: VerifyPaymentDTO
  ): Promise<PaymentVerificationResponseDTO> {
    try {
      const enrollment = await this.enrollmentRepository.findByPaymentId(
        dto.sessionId
      );

      if (!enrollment) {
        return EnrollmentMapper.toPaymentVerificationResponse(
          null,
          "Enrollment not found"
        );
      }

      if (enrollment.status === "paid") {
        return EnrollmentMapper.toPaymentVerificationResponse(
          enrollment,
          "Payment already verified"
        );
      }

      const session = await stripe.checkout.sessions.retrieve(dto.sessionId);
      let updatedEnrollment = enrollment;
      let message = "";

      if (session.payment_status === "paid") {
        const updated = await this.enrollmentRepository.updateStatus(
          (enrollment._id as mongoose.Types.ObjectId).toString(),
          "paid"
        );
        if (updated) {
          updatedEnrollment = updated;
        }
        message = "Payment verified successfully";
        console.log(`Enrollment ${enrollment._id} marked as paid`);
      } else if (session.status === "expired") {
        const updated = await this.enrollmentRepository.updateStatus(
          (enrollment._id as mongoose.Types.ObjectId).toString(),
          "failed"
        );
        if (updated) {
          updatedEnrollment = updated;
        }
        message = "Payment session expired";
        console.log(`Enrollment ${enrollment._id} marked as failed`);
      } else {
        message = "Payment still pending";
      }

      return EnrollmentMapper.toPaymentVerificationResponse(
        updatedEnrollment,
        message
      );
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  }

  async getUserEnrollments(
    dto: GetUserEnrollmentsDTO
  ): Promise<UserEnrollmentsResponseDTO> {
    try {
      const validation = EnrollmentMapper.validateGetUserEnrollmentsDTO(dto);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const { skip, limit, page } = EnrollmentMapper.mapPaginationParams(dto);

      const result =
        await this.enrollmentRepository.findUserEnrollmentsWithPagination(
          dto.userId,
          skip,
          limit,
          dto.search
        );

      return EnrollmentMapper.toUserEnrollmentsResponse(
        result.enrollments,
        result.totalPages,
        result.totalCount,
        page,
        limit
      );
    } catch (error: any) {
      console.error(
        "Error in EnrollmentService getUserEnrollments:",
        error.message
      );
      throw error;
    }
  }

  async verifyUserEnrollment(
    dto: VerifyUserEnrollmentDTO
  ): Promise<EnrollmentVerificationResponseDTO> {
    try {
      const enrollment = await this.enrollmentRepository.checkUserEnrollment(
        dto.userId,
        dto.courseId
      );

      return EnrollmentMapper.toEnrollmentVerificationResponse(
        !!enrollment,
        enrollment?._id?.toString()
      );
    } catch (error) {
      console.error("Error verifying user enrollment:", error);
      throw error;
    }
  }

  async getEnrollmentByPaymentId(
    dto: GetEnrollmentByPaymentDTO
  ): Promise<EnrollmentResponseDTO | null> {
    try {
      const enrollment = await this.enrollmentRepository.findByPaymentId(
        dto.paymentId
      );

      if (!enrollment) {
        return null;
      }

      return EnrollmentMapper.toResponseDTO(enrollment);
    } catch (error) {
      console.error("Error getting enrollment by payment ID:", error);
      throw error;
    }
  }
}

export default EnrollmentService;