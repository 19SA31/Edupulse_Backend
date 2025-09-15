import { IEnrollment } from "../../models/EnrollmentModel";
import { PopulateOptions } from "mongoose";
import { PopulatedEnrollment } from "./enrollmentInterface";

export interface IEnrollmentRepository {
  create(data: Partial<IEnrollment>): Promise<IEnrollment>;
  findByPaymentId(paymentId: string): Promise<IEnrollment | null>;
  updateStatus(
    id: string,
    status: "pending" | "paid" | "failed"
  ): Promise<IEnrollment | null>;
  findUserEnrollmentsWithPagination(
    userId: string,
    skip: number,
    limit: number,
    search?: string,
    populateOptions?: PopulateOptions[]
  ): Promise<{
    enrollments: IEnrollment[];
    totalPages: number;
    totalCount: number;
  }>;
  checkUserEnrollment(
    userId: string,
    courseId: string
  ): Promise<IEnrollment | null>;
  findWithPagination(
    filter: object,
    skip: number,
    limit: number,
    populateOptions?: PopulateOptions[]
  ): Promise<IEnrollment[]>;
  findAllEnrolledCourses(userId: string): Promise<IEnrollment[]>;
  getPurchaseMailData(paymentId: string): Promise<PopulatedEnrollment | null>;
  getAllEnrollmentsWithPagination(
    skip: number,
    limit: number,
    search?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
    sortBy?:string
  ): Promise<{
    enrollments: any[];
    totalPages: number;
    totalCount: number;
  }>;
  findCourseCountsTutor(userId: string,tutorId: string): Promise<IEnrollment[]|null>
}
