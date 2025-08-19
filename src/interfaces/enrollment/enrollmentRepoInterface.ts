import { IEnrollment } from "../../models/EnrollmentModel";
import { PopulateOptions } from "mongoose";

export interface IEnrollmentRepository {
  create(data: Partial<IEnrollment>): Promise<IEnrollment>;
  findById(id: string): Promise<IEnrollment | null>;
  findByPaymentId(paymentId: string): Promise<IEnrollment | null>;
  findByUserId(userId: string): Promise<IEnrollment[]>;
  updateStatus(
    id: string,
    status: "pending" | "paid" | "failed"
  ): Promise<IEnrollment | null>;
  findUserEnrollments(
    userId: string,
    populateOptions?: PopulateOptions[]
  ): Promise<IEnrollment[]>;
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
}
