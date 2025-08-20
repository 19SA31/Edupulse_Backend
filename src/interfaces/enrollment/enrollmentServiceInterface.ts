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
}
