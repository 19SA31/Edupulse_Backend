import { IEnrollment } from "../../models/EnrollmentModel";
import { CreateEnrollmentData } from "../../interfaces/enrollment/enrollmentInterface";
import {
  CreateEnrollmentDTO,
  EnrollmentResponseDTO,
  CreateEnrollmentResponseDTO,
  UserEnrollmentsResponseDTO,
  PaymentVerificationResponseDTO,
  EnrollmentVerificationResponseDTO,
  GetUserEnrollmentsDTO,
  PopulatedEnrollmentResponseDTO,
  EnrolledCoursesDTO,
  PurchaseEmailDTO,
  AllEnrollmentsResponseDTO,
  TutorRevenueResponseDTO,
  CourseRevenueDetail,
  CourseEnrollmentsResponseDTO,
  EnrolledUserDetail,
  GetCourseEnrollmentsDTO,
} from "../../dto/enrollment/enrollmentDTO";
import { PopulatedEnrollment } from "../../interfaces/enrollment/enrollmentInterface";

export class EnrollmentMapper {
  static toDomainModel(dto: CreateEnrollmentDTO): CreateEnrollmentData {
    return {
      userId: dto.userId,
      tutorId: dto.tutorId,
      courseId: dto.courseId,
      categoryId: dto.categoryId,
      price: dto.price,
    };
  }

  static toResponseDTO(enrollment: IEnrollment): EnrollmentResponseDTO {
    return {
      id: enrollment._id?.toString() || "",
      userId: enrollment.userId.toString(),
      tutorId: enrollment.tutorId.toString(),
      courseId: enrollment.courseId.toString(),
      categoryId: enrollment.categoryId.toString(),
      price: enrollment.price,
      platformFee: enrollment.platformFee,
      platformFeePercentage: enrollment.platformFeePercentage,
      tutorEarnings: enrollment.tutorEarnings,
      paymentId: enrollment.paymentId,
      paymentMethod: enrollment.paymentMethod || "stripe",
      status: enrollment.status,
      dateOfEnrollment: enrollment.dateOfEnrollment.toISOString(),
    };
  }

  static toPopulatedResponseDTO(
    enrollment: any
  ): PopulatedEnrollmentResponseDTO {
    return {
      _id: enrollment._id?.toString() || "",
      courseId: {
        _id: enrollment.courseId?._id?.toString() || "",
        title: enrollment.courseId?.title || "Unknown Course",
        price: enrollment.courseId?.price || 0,
        thumbnailImage: enrollment.courseId?.thumbnailImage || "",
      },
      tutorId: {
        _id: enrollment.tutorId?._id?.toString() || "",
        name: enrollment.tutorId?.name || "Unknown Tutor",
      },
      categoryId: {
        _id: enrollment.categoryId?._id?.toString() || "",
        name: enrollment.categoryId?.name || "Unknown Category",
      },
      price: enrollment.price,
      platformFee: enrollment.platformFee,
      platformFeePercentage: enrollment.platformFeePercentage,
      tutorEarnings: enrollment.tutorEarnings,
      paymentId: enrollment.paymentId,
      paymentMethod: enrollment.paymentMethod || "stripe",
      status: enrollment.status,
      dateOfEnrollment: enrollment.dateOfEnrollment,
    };
  }

  static toResponseDTOs(enrollments: IEnrollment[]): EnrollmentResponseDTO[] {
    return enrollments.map((enrollment) => this.toResponseDTO(enrollment));
  }

  static toPopulatedResponseDTOs(
    enrollments: any[]
  ): PopulatedEnrollmentResponseDTO[] {
    return enrollments.map((enrollment) =>
      this.toPopulatedResponseDTO(enrollment)
    );
  }

  static toCreateEnrollmentResponse(
    enrollment: IEnrollment,
    sessionId: string
  ): CreateEnrollmentResponseDTO {
    return {
      enrollment: this.toResponseDTO(enrollment),
      sessionId,
    };
  }

  static toUserEnrollmentsResponse(
    enrollments: any[],
    totalPages: number,
    totalCount: number,
    currentPage: number,
    limit: number
  ): UserEnrollmentsResponseDTO {
    return {
      enrollments: this.toPopulatedResponseDTOs(enrollments),
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        limit,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  }

  static toPaymentVerificationResponse(
    enrollment: IEnrollment | null,
    message?: string
  ): PaymentVerificationResponseDTO {
    if (!enrollment) {
      return {
        enrollment: null,
        paymentStatus: "failed",
        message: message || "Enrollment not found",
      };
    }

    const paymentStatus =
      enrollment.status === "paid"
        ? "verified"
        : enrollment.status === "failed"
        ? "failed"
        : "pending";

    return {
      enrollment: this.toResponseDTO(enrollment),
      paymentStatus,
      message,
    };
  }

  static toEnrollmentVerificationResponse(
    isEnrolled: boolean,
    enrollmentId?: string
  ): EnrollmentVerificationResponseDTO {
    return {
      isEnrolled,
      enrollmentId,
    };
  }

  static mapPaginationParams(dto: GetUserEnrollmentsDTO): {
    skip: number;
    limit: number;
    page: number;
  } {
    let limit = dto.limit || 10;
    let page = dto.page || 1;

    if (isNaN(limit) || limit <= 0) limit = 10;
    if (isNaN(page) || page <= 0) page = 1;

    limit = Math.min(limit, 100);
    page = Math.max(page, 1);

    const skip = (page - 1) * limit;
    return { skip, limit, page };
  }

  static validateCreateEnrollmentDTO(dto: CreateEnrollmentDTO): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!dto.userId?.trim()) {
      errors.push("User ID is required");
    }

    if (!dto.tutorId?.trim()) {
      errors.push("Tutor ID is required");
    }

    if (!dto.courseId?.trim()) {
      errors.push("Course ID is required");
    }

    if (!dto.categoryId?.trim()) {
      errors.push("Category ID is required");
    }

    if (typeof dto.price !== "number" || dto.price <= 0) {
      errors.push("Price must be a positive number");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateGetUserEnrollmentsDTO(dto: GetUserEnrollmentsDTO): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!dto.userId?.trim()) {
      errors.push("User ID is required");
    }

    if (dto.page !== undefined && (isNaN(dto.page) || dto.page < 1)) {
      errors.push("Page must be a positive number");
    }

    if (
      dto.limit !== undefined &&
      (isNaN(dto.limit) || dto.limit < 1 || dto.limit > 100)
    ) {
      errors.push("Limit must be between 1 and 100");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static toEnrolledCourses(enrollments: IEnrollment[]): EnrolledCoursesDTO[] {
    return enrollments.map((e) => ({
      courseId: e.courseId.toString(),
    }));
  }

  static toEmailData(data: PopulatedEnrollment): PurchaseEmailDTO {
    return {
      userEmail: data.userId.email,
      userName: data.userId.name,
      courseTitle: data.courseId.title,
      tutorEmail: data.tutorId.email,
      tutorName: data.tutorId.name,
      price: data.price,
    };
  }

  static toAllEnrollmentsResponse(
    enrollments: any[],
    totalPages: number,
    totalCount: number,
    currentPage: number,
    limit: number
  ): AllEnrollmentsResponseDTO {
    return {
      enrollments: this.toPopulatedWithUserDTOs(enrollments),
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        limit,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  }

  static toPopulatedWithUserDTO(enrollment: any) {
    return {
      _id: enrollment._id?.toString() || "",
      userId: enrollment.userId
        ? {
            _id: enrollment.userId._id?.toString() || "",
            name: enrollment.userId.name || "Unknown User",
            email: enrollment.userId.email || "",
            phone: enrollment.userId.phone || "",
          }
        : null,
      courseId: {
        _id: enrollment.courseId?._id?.toString() || "",
        title: enrollment.courseId?.title || "Unknown Course",
        price: enrollment.courseId?.price || 0,
        thumbnailImage: enrollment.courseId?.thumbnailImage || "",
      },
      tutorId: {
        _id: enrollment.tutorId?._id?.toString() || "",
        name: enrollment.tutorId?.name || "Unknown Tutor",
      },
      categoryId: {
        _id: enrollment.categoryId?._id?.toString() || "",
        name: enrollment.categoryId?.name || "Unknown Category",
      },
      price: enrollment.price,
      platformFee: enrollment.platformFee,
      platformFeePercentage: enrollment.platformFeePercentage,
      tutorEarnings: enrollment.tutorEarnings,
      paymentId: enrollment.paymentId,
      paymentMethod: enrollment.paymentMethod || "stripe",
      status: enrollment.status,
      dateOfEnrollment: enrollment.dateOfEnrollment,
    };
  }

  static toPopulatedWithUserDTOs(enrollments: any[]) {
    return enrollments.map((enrollment) =>
      this.toPopulatedWithUserDTO(enrollment)
    );
  }

  static mapCoursePaginationParams(
    page: number,
    limit: number
  ): {
    skip: number;
    limit: number;
    page: number;
  } {
    let validLimit = limit || 10;
    let validPage = page || 1;

    if (isNaN(validLimit) || validLimit <= 0) validLimit = 10;
    if (isNaN(validPage) || validPage <= 0) validPage = 1;

    validLimit = Math.min(validLimit, 100);
    validPage = Math.max(validPage, 1);

    const skip = (validPage - 1) * validLimit;
    return { skip, limit: validLimit, page: validPage };
  }

  static toTutorRevenueResponse(
    tutorId: string,
    tutorName: string,
    aggregatedData: any[]
  ): TutorRevenueResponseDTO {
    const courses: CourseRevenueDetail[] = aggregatedData.map((course) => ({
      courseId: course._id.toString(),
      courseTitle: course.courseTitle,
      courseThumbnail: course.courseThumbnail,
      coursePrice: course.coursePrice,
      enrollmentCount: course.enrollmentCount,
      totalRevenue: course.totalRevenue,
      tutorEarnings: course.tutorEarnings,
      platformFee: course.platformFee,
    }));

    const totalRevenue = courses.reduce((sum, c) => sum + c.totalRevenue, 0);
    const totalTutorEarnings = courses.reduce(
      (sum, c) => sum + c.tutorEarnings,
      0
    );
    const totalPlatformFee = courses.reduce((sum, c) => sum + c.platformFee, 0);
    const totalEnrollments = courses.reduce(
      (sum, c) => sum + c.enrollmentCount,
      0
    );

    return {
      tutorId,
      tutorName,
      totalRevenue,
      totalTutorEarnings,
      totalPlatformFee,
      totalEnrollments,
      courses,
    };
  }

  static toCourseEnrollmentsResponse(
    courseData: any,
    enrolledUsers: any[],
    totalPages: number,
    totalCount: number,
    currentPage: number,
    limit: number
  ): CourseEnrollmentsResponseDTO {
    const users: EnrolledUserDetail[] = enrolledUsers.map((enrollment) => ({
      _id: enrollment._id.toString(),
      userId: {
        _id: enrollment.userId._id.toString(),
        name: enrollment.userId.name,
        email: enrollment.userId.email,
        phone: enrollment.userId.phone,
      },
      price: enrollment.price,
      paymentMethod: enrollment.paymentMethod || "stripe",
      status: enrollment.status,
      dateOfEnrollment: enrollment.dateOfEnrollment,
      paymentId: enrollment.paymentId,
      progress: enrollment.progress || 0,
      platformFee: enrollment.platformFee,
      tutorEarnings: enrollment.tutorEarnings,
    }));

    return {
      courseId: courseData.courseId,
      courseTitle: courseData.courseTitle,
      courseThumbnail: courseData.courseThumbnail,
      coursePrice: courseData.coursePrice,
      totalRevenue: courseData.totalRevenue,
      totalTutorEarnings: courseData.totalTutorEarnings,
      totalPlatformFee: courseData.totalPlatformFee,
      enrollmentCount: totalCount,
      enrolledUsers: users,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        limit,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  }

  static validateGetTutorRevenueDTO(tutorId: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!tutorId?.trim()) {
      errors.push("Tutor ID is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateGetCourseEnrollmentsDTO(dto: GetCourseEnrollmentsDTO): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!dto.courseId?.trim()) {
      errors.push("Course ID is required");
    }

    if (dto.page !== undefined && (isNaN(dto.page) || dto.page < 1)) {
      errors.push("Page must be a positive number");
    }

    if (
      dto.limit !== undefined &&
      (isNaN(dto.limit) || dto.limit < 1 || dto.limit > 100)
    ) {
      errors.push("Limit must be between 1 and 100");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
