export interface CreateEnrollmentDTO {
  userId: string;
  tutorId: string;
  courseId: string;
  categoryId: string;
  price: number;
}

export interface VerifyPaymentDTO {
  sessionId: string;
}

export interface GetUserEnrollmentsDTO {
  userId: string;
  page: number;
  limit: number;
  search?: string;
}

export interface VerifyUserEnrollmentDTO {
  userId: string;
  courseId: string;
}

export interface GetEnrollmentByPaymentDTO {
  paymentId: string;
}

export interface EnrollmentResponseDTO {
  id: string;
  userId: string;
  tutorId: string;
  courseId: string;
  categoryId: string;
  price: number;
  paymentId: string;
  paymentMethod: string;
  status: "pending" | "paid" | "failed";
  dateOfEnrollment: string;
}

export interface PopulatedEnrollmentResponseDTO {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    price: number;
    thumbnailImage: string;
  };
  tutorId: {
    _id: string;
    name: string;
  };
  categoryId: {
    _id: string;
    name: string;
  };
  price: number;
  paymentId: string;
  paymentMethod: string;
  status: string;
  dateOfEnrollment: string;
}

export interface CreateEnrollmentResponseDTO {
  enrollment: EnrollmentResponseDTO;
  sessionId: string;
}

export interface UserEnrollmentsResponseDTO {
  enrollments: PopulatedEnrollmentResponseDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaymentVerificationResponseDTO {
  enrollment: EnrollmentResponseDTO | null;
  paymentStatus: "verified" | "pending" | "failed";
  message?: string;
}

export interface EnrollmentVerificationResponseDTO {
  isEnrolled: boolean;
  enrollmentId?: string;
}

export interface EnrollmentErrorDTO {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface EnrollmentValidationDTO {
  isValid: boolean;
  errors: string[];
}

export interface EnrollmentCount{
  courseId:string;
  count:number;
}

export interface EnrollmentCountsDTO{
  enrollments: EnrollmentCount[]
}

export interface EnrolledCoursesDTO {
  courseId: string;
}
