import { IEnrollment } from "../../models/EnrollmentModel";

export interface CreateEnrollmentData {
  userId: string;
  tutorId: string;
  courseId: string;
  categoryId: string;
  price: number;
}

export interface IEnrollmentService {
  createEnrollment(data: CreateEnrollmentData): Promise<{
    enrollment: IEnrollment;
    sessionId: string;
  }>;
  verifyPaymentAndUpdateStatus(sessionId: string): Promise<IEnrollment | null>;
  getUserEnrollments(userId: string): Promise<IEnrollment[]>;
  verifyUserEnrollment(userId: string, courseId: string): Promise<boolean>;
  getEnrollmentByPaymentId(paymentId: string): Promise<IEnrollment | null>;
}
