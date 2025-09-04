import {
  CreateEnrollmentDTO,
  CreateEnrollmentResponseDTO,
  VerifyPaymentDTO,
  PaymentVerificationResponseDTO,
  GetUserEnrollmentsDTO,
  UserEnrollmentsResponseDTO,
  VerifyUserEnrollmentDTO,
  EnrollmentVerificationResponseDTO,
  GetEnrollmentByPaymentDTO,
  EnrollmentResponseDTO,
  PurchaseEmailDTO,
  EnrolledCoursesDTO,
} from "../../dto/enrollment/enrollmentDTO";

export interface IEnrollmentService {
  createEnrollment(
    dto: CreateEnrollmentDTO
  ): Promise<CreateEnrollmentResponseDTO>;
  verifyPaymentAndUpdateStatus(
    dto: VerifyPaymentDTO
  ): Promise<PaymentVerificationResponseDTO>;
  getUserEnrollments(
    dto: GetUserEnrollmentsDTO
  ): Promise<UserEnrollmentsResponseDTO>;
  verifyUserEnrollment(
    dto: VerifyUserEnrollmentDTO
  ): Promise<EnrollmentVerificationResponseDTO>;
  getEnrollmentByPaymentId(
    dto: GetEnrollmentByPaymentDTO
  ): Promise<EnrollmentResponseDTO | null>;
  getPaymentData(paymentId: string): Promise<PurchaseEmailDTO | null>;
  getEnrolledCourses(userId: string): Promise<EnrolledCoursesDTO[] | null>;
}
