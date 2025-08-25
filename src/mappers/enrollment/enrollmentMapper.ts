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

    console.log("Pagination params:", { skip, limit, page });

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
}
