import BaseRepository from "../BaseRepository";
import Enrollment, { IEnrollment } from "../../models/EnrollmentModel";
import { IEnrollmentRepository } from "../../interfaces/enrollment/enrollmentRepoInterface";
import { PopulateOptions } from "mongoose";
import { PopulatedEnrollment } from "../../interfaces/enrollment/enrollmentInterface"

class EnrollmentRepository
  extends BaseRepository<IEnrollment>
  implements IEnrollmentRepository
{
  constructor() {
    super(Enrollment);
  }

  async findByPaymentId(paymentId: string): Promise<IEnrollment | null> {
    return await this.findOne({ paymentId });
  }

  async getPurchaseMailData(paymentId: string): Promise<PopulatedEnrollment | null> {
    return await Enrollment.findOne({ paymentId })
      .populate("userId", "name email") 
      .populate("tutorId", "name email") 
      .populate("courseId", "title") 
      .exec() as unknown as PopulatedEnrollment | null;
  }

  async updateStatus(
    id: string,
    status: "pending" | "paid" | "failed"
  ): Promise<IEnrollment | null> {
    return await this.update(id, { status });
  }

  async findUserEnrollmentsWithPagination(
    userId: string,
    skip: number,
    limit: number,
    search?: string,
    populateOptions?: PopulateOptions[]
  ): Promise<{
    enrollments: IEnrollment[];
    totalPages: number;
    totalCount: number;
  }> {
    const filter: any = { userId, status: "paid" };

    const defaultPopulateOptions: PopulateOptions[] = populateOptions || [
      {
        path: "courseId",
        select: "title thumbnailImage price",
      },
      {
        path: "tutorId",
        select: "name",
      },
      {
        path: "categoryId",
        select: "name",
      },
    ];

    let enrollments: IEnrollment[] = [];
    let totalCount: number = 0;

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      const populateOptionsWithSearch: PopulateOptions[] = [
        {
          path: "courseId",
          select: "title thumbnailImage price",
          match: { title: { $regex: searchRegex } },
        },
        {
          path: "tutorId",
          select: "name",
          match: { name: { $regex: searchRegex } },
        },
        {
          path: "categoryId",
          select: "name",
        },
      ];

      const allEnrollments = await this.findWithConditionAndPopulate(
        filter,
        populateOptionsWithSearch
      );

      const filteredEnrollments = allEnrollments.filter(
        (enrollment: any) => enrollment.courseId || enrollment.tutorId
      );

      totalCount = filteredEnrollments.length;
      enrollments = filteredEnrollments.slice(skip, skip + limit);
    } else {
      enrollments = await this.findWithPagination(
        filter,
        skip,
        limit,
        defaultPopulateOptions
      );
      totalCount = await this.countDocuments(filter);
    }

    const totalPages = Math.ceil(totalCount / limit);

    console.log("Final result:", {
      enrollmentsCount: enrollments.length,
      totalPages,
      totalCount,
      search: search || "none",
    });

    return {
      enrollments,
      totalPages,
      totalCount,
    };
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

  async findAllEnrolledCourses(userId: string): Promise<IEnrollment[]> {
    return await this.findWithCondition({ userId: userId });
  }
}

export default EnrollmentRepository;
