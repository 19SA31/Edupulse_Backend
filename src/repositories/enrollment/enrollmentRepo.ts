import BaseRepository from "../BaseRepository";
import Enrollment, { IEnrollment } from "../../models/EnrollmentModel";
import { IEnrollmentRepository } from "../../interfaces/enrollment/enrollmentRepoInterface";
import { PopulateOptions } from "mongoose";

class EnrollmentRepository
  extends BaseRepository<IEnrollment>
  implements IEnrollmentRepository
{
  constructor() {
    super(Enrollment);
  }

  async findById(id: string): Promise<IEnrollment | null> {
    return await this.findOne({ _id: id });
  }

  async findByPaymentId(paymentId: string): Promise<IEnrollment | null> {
    return await this.findOne({ paymentId });
  }

  async findByUserId(userId: string): Promise<IEnrollment[]> {
    return await this.findWithCondition({ userId });
  }

  async updateStatus(
    id: string,
    status: "pending" | "paid" | "failed"
  ): Promise<IEnrollment | null> {
    return await this.update(id, { status });
  }

  async findUserEnrollments(
    userId: string,
    populateOptions?: PopulateOptions[]
  ): Promise<IEnrollment[]> {
    return await this.findWithConditionAndPopulate(
      { userId, status: "paid" },
      populateOptions || [
        {
          path: "courseId",
          select: "title thumbnailImage price",
        },
        { path: "tutorId", select: "name" },
        { path: "categoryId", select: "name" },
      ]
    );
  }

  async checkUserEnrollment(
    userId: string,
    courseId: string
  ): Promise<IEnrollment | null> {
    return await this.findOne({
      userId,
      courseId,
      status: "paid",
    });
  }
}

export default EnrollmentRepository;
