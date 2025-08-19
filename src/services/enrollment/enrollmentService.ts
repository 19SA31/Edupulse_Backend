import mongoose from "mongoose";
import {
  IEnrollmentService,
  CreateEnrollmentData,
} from "../../interfaces/enrollment/enrollmentServiceInterface";
import { IEnrollmentRepository } from "../../interfaces/enrollment/enrollmentRepoInterface";
import { IEnrollment } from "../../models/EnrollmentModel";
import { stripe } from "../../config/stripe";

class EnrollmentService implements IEnrollmentService {
  constructor(private enrollmentRepository: IEnrollmentRepository) {}

  async createEnrollment(data: CreateEnrollmentData): Promise<{
    enrollment: IEnrollment;
    sessionId: string;
  }> {
    try {
      const existingEnrollment =
        await this.enrollmentRepository.checkUserEnrollment(
          data.userId,
          data.courseId
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
                description: `Enrollment for course ID: ${data.courseId}`,
              },
              unit_amount: data.price * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${cleanBaseUrl}/payment-success/${data.courseId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${cleanBaseUrl}/payment-success/${data.courseId}?payment=cancelled`,
        metadata: {
          userId: data.userId,
          courseId: data.courseId,
          tutorId: data.tutorId,
          categoryId: data.categoryId,
        },
      });

      const enrollment = await this.enrollmentRepository.create({
        userId: new mongoose.Types.ObjectId(data.userId),
        tutorId: new mongoose.Types.ObjectId(data.tutorId),
        courseId: new mongoose.Types.ObjectId(data.courseId),
        categoryId: new mongoose.Types.ObjectId(data.categoryId),
        price: data.price,
        paymentId: session.id,
        paymentMethod: "stripe",
        status: "pending",
        dateOfEnrollment: new Date(),
      });

      return {
        enrollment,
        sessionId: session.id,
      };
    } catch (error) {
      console.error("Error creating enrollment:", error);
      throw error;
    }
  }

  async verifyPaymentAndUpdateStatus(
    sessionId: string
  ): Promise<IEnrollment | null> {
    try {
      const enrollment = await this.enrollmentRepository.findByPaymentId(
        sessionId
      );

      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      if (enrollment.status === "paid") {
        return enrollment;
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      let updatedEnrollment = enrollment;

      if (session.payment_status === "paid") {
        const updated = await this.enrollmentRepository.updateStatus(
          (enrollment._id as mongoose.Types.ObjectId).toString(),
          "paid"
        );
        if (updated) {
          updatedEnrollment = updated;
        }
        console.log(`Enrollment ${enrollment._id} marked as paid`);
      } else if (session.status === "expired") {
        const updated = await this.enrollmentRepository.updateStatus(
          (enrollment._id as mongoose.Types.ObjectId).toString(),
          "failed"
        );
        if (updated) {
          updatedEnrollment = updated;
        }
        console.log(`Enrollment ${enrollment._id} marked as failed`);
      }

      return updatedEnrollment;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  }

  async getUserEnrollments(userId: string): Promise<IEnrollment[]> {
    return await this.enrollmentRepository.findUserEnrollments(userId);
  }

  async verifyUserEnrollment(
    userId: string,
    courseId: string
  ): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.checkUserEnrollment(
      userId,
      courseId
    );
    return !!enrollment;
  }

  async getEnrollmentByPaymentId(
    paymentId: string
  ): Promise<IEnrollment | null> {
    return await this.enrollmentRepository.findByPaymentId(paymentId);
  }
}

export default EnrollmentService;
