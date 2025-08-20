import BaseRepository from "../BaseRepository";
import Enrollment, { IEnrollment } from "../../models/EnrollmentModel";
import { IEnrollmentRepository } from "../../interfaces/enrollment/enrollmentRepoInterface";
import { PopulateOptions } from "mongoose";

class EnrollmentRepository
  extends BaseRepository<IEnrollment>
  implements IEnrollmentRepository {
  constructor() {
    super(Enrollment);
  }

  async findByPaymentId(paymentId: string): Promise<IEnrollment | null> {
    return await this.findOne({ paymentId });
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
        select: "name" 
      },
      { 
        path: "categoryId", 
        select: "name" 
      },
    ];

    let enrollments: IEnrollment[] = [];
    let totalCount: number = 0;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      
      const pipeline = [
        { $match: filter },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "courseData"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "tutorId", 
            foreignField: "_id",
            as: "tutorData"
          }
        },
        {
          $match: {
            $or: [
              { "courseData.title": { $regex: searchRegex } },
              { "tutorData.name": { $regex: searchRegex } }
            ]
          }
        },
        {
          $facet: {
            data: [
              { $skip: skip },
              { $limit: limit }
            ],
            count: [
              { $count: "total" }
            ]
          }
        }
      ];

      const result = await this.aggregate(pipeline);
      const enrollmentIds = result[0]?.data?.map((item: any) => item._id) || [];
      totalCount = result[0]?.count[0]?.total || 0;

      if (enrollmentIds.length > 0) {
        enrollments = await this.findWithConditionAndPopulate(
          { _id: { $in: enrollmentIds } },
          defaultPopulateOptions
        );
      }
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
}

export default EnrollmentRepository;