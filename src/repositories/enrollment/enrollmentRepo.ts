import mongoose from "mongoose";
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
    startDate?: string,
    endDate?: string,
    sortBy?: string
  ): Promise<{
    enrollments: any[];
    totalPages: number;
    totalCount: number;
  }> {
    const filter: any = {};

    if (status && status.trim()) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.dateOfEnrollment = {};

      if (startDate && startDate.trim()) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.dateOfEnrollment.$gte = start;
      }

      if (endDate && endDate.trim()) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.dateOfEnrollment.$lte = end;
      }
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

    let sortObject: any = {};
    if (sortBy && sortBy.trim()) {
      switch (sortBy) {
        case "name-asc":
          sortObject = { "userId.name": 1 };
          break;
        case "name-desc":
          sortObject = { "userId.name": -1 };
          break;
        case "course-asc":
          sortObject = { "courseId.title": 1 };
          break;
        case "course-desc":
          sortObject = { "courseId.title": -1 };
          break;
        case "price-asc":
          sortObject = { price: 1 };
          break;
        case "price-desc":
          sortObject = { price: -1 };
          break;
        case "date-asc":
          sortObject = { dateOfEnrollment: 1 };
          break;
        case "date-desc":
          sortObject = { dateOfEnrollment: -1 };
          break;
        default:
          sortObject = { dateOfEnrollment: -1 };
      }
    } else {
      sortObject = { dateOfEnrollment: -1 };
    }

    let allEnrollments = await this.findWithConditionPopulateAndSort(
      filter,
      populateOptions,
      sortObject
    );

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      allEnrollments = allEnrollments.filter((enrollment: any) => {
        const userMatch =
          enrollment.userId &&
          (searchRegex.test(enrollment.userId.name) ||
            searchRegex.test(enrollment.userId.email));

        const courseMatch =
          enrollment.courseId && searchRegex.test(enrollment.courseId.title);

        const tutorMatch =
          enrollment.tutorId && searchRegex.test(enrollment.tutorId.name);

        const categoryMatch =
          enrollment.categoryId && searchRegex.test(enrollment.categoryId.name);

        return userMatch || courseMatch || tutorMatch || categoryMatch;
      });
    }

    const totalCount = allEnrollments.length;
    const enrollments = allEnrollments.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      enrollments,
      totalPages,
      totalCount,
    };
  }

  async findCourseCountsTutor(
    userId: string,
    tutorId: string
  ): Promise<IEnrollment[] | null> {
    return await this.findWithCondition({ userId, tutorId });
  }

  async getTutorRevenueData(tutorId: string): Promise<any[]> {
    try {
      const pipeline = [
        {
          $match: {
            tutorId: new mongoose.Types.ObjectId(tutorId),
            status: "paid",
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "courseDetails",
          },
        },
        {
          $unwind: "$courseDetails",
        },
        {
          $group: {
            _id: "$courseId",
            courseTitle: { $first: "$courseDetails.title" },
            courseThumbnail: { $first: "$courseDetails.thumbnailImage" },
            coursePrice: { $first: "$courseDetails.price" },
            enrollmentCount: { $sum: 1 },
            totalRevenue: { $sum: "$price" },
            tutorEarnings: { $sum: "$tutorEarnings" },
            platformFee: { $sum: "$platformFee" },
          },
        },
        {
          $sort: { totalRevenue: -1 },
        },
      ];

      return await this.aggregate(pipeline);
    } catch (error: any) {
      console.error("Error in getTutorRevenueData:", error.message);
      throw error;
    }
  }

  async getCourseEnrollmentsData(
    courseId: string,
    skip: number,
    limit: number,
    search?: string
  ): Promise<{
    courseStats: any;
    enrolledUsers: any[];
    totalCount: number;
    totalPages: number;
  }> {
    try {
      const courseObjectId = new mongoose.Types.ObjectId(courseId);

      const statsAggregate = await this.aggregate([
        {
          $match: {
            courseId: courseObjectId,
            status: "paid",
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "courseDetails",
          },
        },
        {
          $unwind: "$courseDetails",
        },
        {
          $group: {
            _id: "$courseId",
            courseTitle: { $first: "$courseDetails.title" },
            courseThumbnail: { $first: "$courseDetails.thumbnailImage" },
            coursePrice: { $first: "$courseDetails.price" },
            totalRevenue: { $sum: "$price" },
            totalTutorEarnings: { $sum: "$tutorEarnings" },
            totalPlatformFee: { $sum: "$platformFee" },
            enrollmentCount: { $sum: 1 },
          },
        },
      ]);

      if (!statsAggregate || statsAggregate.length === 0) {
        return {
          courseStats: null,
          enrolledUsers: [],
          totalCount: 0,
          totalPages: 0,
        };
      }

      const courseStats = {
        courseId: statsAggregate[0]._id.toString(),
        courseTitle: statsAggregate[0].courseTitle,
        courseThumbnail: statsAggregate[0].courseThumbnail,
        coursePrice: statsAggregate[0].coursePrice,
        totalRevenue: statsAggregate[0].totalRevenue,
        totalTutorEarnings: statsAggregate[0].totalTutorEarnings,
        totalPlatformFee: statsAggregate[0].totalPlatformFee,
      };

      const filter: any = {
        courseId: courseObjectId,
        status: "paid",
      };

      const populateOptions: PopulateOptions[] = [
        {
          path: "userId",
          select: "name email phone",
        },
      ];

      let enrolledUsers: any[] = [];
      let totalCount = 0;

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");
        const populateWithSearch: PopulateOptions[] = [
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
        ];

        const allEnrollments = await this.findWithConditionAndPopulate(
          filter,
          populateWithSearch
        );

        const filteredEnrollments = allEnrollments.filter(
          (enrollment: any) => enrollment.userId
        );

        totalCount = filteredEnrollments.length;
        enrolledUsers = filteredEnrollments.slice(skip, skip + limit);
      } else {
        enrolledUsers = await this.findWithPagination(
          filter,
          skip,
          limit,
          populateOptions,
          { dateOfEnrollment: -1 }
        );
        totalCount = await this.countDocuments(filter);
      }

      const totalPages = Math.ceil(totalCount / limit);

      return {
        courseStats,
        enrolledUsers,
        totalCount,
        totalPages,
      };
    } catch (error: any) {
      console.error("Error in getCourseEnrollmentsData:", error.message);
      throw error;
    }
  }
}

export default EnrollmentRepository;
