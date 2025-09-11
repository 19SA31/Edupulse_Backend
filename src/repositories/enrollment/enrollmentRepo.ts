import BaseRepository from "../BaseRepository";
import Enrollment, { IEnrollment } from "../../models/EnrollmentModel";
import { IEnrollmentRepository } from "../../interfaces/enrollment/IEnrollmentRepository";
import { PopulateOptions } from "mongoose";
import { PopulatedEnrollment } from "../../interfaces/enrollment/enrollmentInterface";

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

  async getPurchaseMailData(
    paymentId: string
  ): Promise<PopulatedEnrollment | null> {
    return (await Enrollment.findOne({ paymentId })
      .populate("userId", "name email")
      .populate("tutorId", "name email")
      .populate("courseId", "title")
      .exec()) as unknown as PopulatedEnrollment | null;
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
    return await this.findWithCondition({ userId: userId, status: "paid" });
  }

  async getAllEnrollmentsWithPagination(
    skip: number,
    limit: number,
    search?: string,
    status?: string,
    date?: string
  ): Promise<{
    enrollments: any[];
    totalPages: number;
    totalCount: number;
  }> {
    const filter: any = {};

    if (status && status.trim()) {
      filter.status = status;
    }

    if (date && date.trim()) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      filter.dateOfEnrollment = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const populateOptions: PopulateOptions[] = [
      {
        path: "userId",
        select: "name email phone",
      },
      {
        path: "courseId",
        select: "title price thumbnailImage",
      },
      {
        path: "tutorId",
        select: "name email",
      },
      {
        path: "categoryId",
        select: "name",
      },
    ];

    let enrollments: any[] = [];
    let totalCount: number = 0;

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      const populateOptionsWithSearch: PopulateOptions[] = [
        {
          path: "userId",
          select: "name email phone",
          match: {
            $or: [
              { name: { $regex: searchRegex } },
              { email: { $regex: searchRegex } },
            ],
          },
        },
        {
          path: "courseId",
          select: "title price thumbnailImage",
          match: { title: { $regex: searchRegex } },
        },
        {
          path: "tutorId",
          select: "name email",
          match: { name: { $regex: searchRegex } },
        },
        {
          path: "categoryId",
          select: "name",
          match: { name: { $regex: searchRegex } },
        },
      ];

      const allEnrollments = await this.findWithConditionAndPopulate(
        filter,
        populateOptionsWithSearch
      );

      const filteredEnrollments = allEnrollments.filter(
        (enrollment: any) =>
          enrollment.userId ||
          enrollment.courseId ||
          enrollment.tutorId ||
          enrollment.categoryId
      );

      totalCount = filteredEnrollments.length;
      enrollments = filteredEnrollments.slice(skip, skip + limit);
    } else {
      enrollments = await this.findWithPagination(
        filter,
        skip,
        limit,
        populateOptions
      );
      totalCount = await this.countDocuments(filter);
    }

    const totalPages = Math.ceil(totalCount / limit);

    return {
      enrollments,
      totalPages,
      totalCount,
    };
  }
}

export default EnrollmentRepository;
