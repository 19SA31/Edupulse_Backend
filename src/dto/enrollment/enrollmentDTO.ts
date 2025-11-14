export interface CreateEnrollmentDTO {
  userId: string;
  tutorId: string;
  courseId: string;
  categoryId: string;
  price: number;
  platformFee?: number;
  platformFeePercentage?: number;
  tutorEarnings?: number;
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
  platformFee: number;
  platformFeePercentage: number;
  tutorEarnings: number;
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
  platformFee: number;
  platformFeePercentage: number;
  tutorEarnings: number;
  paymentId: string;
  paymentMethod: string;
  status: string;
  dateOfEnrollment: string;
}

export interface PurchaseEmailDTO {
  userEmail: string;
  userName: string;
  courseTitle: string;
  tutorEmail: string;
  tutorName: string;
  price: number;
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

export interface EnrollmentErrorDTO<T = unknown> {
  code: string;
  message: string;
  details?: Record<string, T>;
}

export interface EnrollmentValidationDTO {
  isValid: boolean;
  errors: string[];
}

export interface EnrolledCoursesDTO {
  courseId: string;
}

export interface GetAllEnrollmentsDTO {
  page: number;
  limit: number;
  search: string;
  status: string;
  startDate: string;
  endDate: string;
  sortBy: string;
}

export interface AllEnrollmentsResponseDTO {
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

export interface GetTutorRevenueDTO {
  tutorId: string;
}

export interface GetCourseEnrollmentsDTO {
  courseId: string;
  page: number;
  limit: number;
  search?: string;
}

export interface CourseRevenueDetail {
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  coursePrice: number;
  enrollmentCount: number;
  totalRevenue: number;
  tutorEarnings: number;
  platformFee: number;
}

export interface TutorRevenueResponseDTO {
  tutorId: string;
  tutorName: string;
  totalRevenue: number;
  totalTutorEarnings: number;
  totalPlatformFee: number;
  totalEnrollments: number;
  courses: CourseRevenueDetail[];
}

export interface EnrolledUserDetail {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  price: number;
  paymentMethod: string;
  status: string;
  dateOfEnrollment: Date;
  paymentId: string;
  progress: number;
  platformFee: number;
  tutorEarnings: number;
}

export interface CourseEnrollmentsResponseDTO {
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  coursePrice: number;
  totalRevenue: number;
  totalTutorEarnings: number;
  totalPlatformFee: number;
  enrollmentCount: number;
  enrolledUsers: EnrolledUserDetail[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
