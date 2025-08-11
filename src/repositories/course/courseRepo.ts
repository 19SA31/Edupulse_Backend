import BaseRepository from "../BaseRepository";
import { ICourseRepoInterface } from "../../interfaces/course/courseRepoInterface";
import courseModel from "../../models/CourseModel";
import tutorModel from "../../models/Tutors";
import categoryModel from "../../models/CategoryModel";
import {
  Category,
  CourseReject,
} from "../../interfaces/course/courseInterface";
import { Course } from "../../interfaces/course/courseInterface";

export class CourseRepository
  extends BaseRepository<any>
  implements ICourseRepoInterface
{
  constructor() {
    super(courseModel);
  }
  private _tutorRepository = new BaseRepository<any>(tutorModel);
  private _categoryRepository = new BaseRepository<any>(categoryModel);

  async getCategories(): Promise<Category[]> {
    return await this._categoryRepository.findWithCondition({ isListed: true });
  }

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    return this.create(courseData as Course);
  }
  async checkSameTutor(tutorId: string): Promise<Course> {
    return await this.findOne({ tutorId: tutorId });
  }
  async unpublishedCourses(
    skip: number,
    limit: number,
    search?: string
  ): Promise<{
    courses: Course[];
    totalCount: number;
  }> {
    let filter: any = {
      isPublished: "draft",
    };
    if (search && search.trim() !== "") {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }
    const courses = await this.findWithPagination(filter, skip, limit, [
      { path: "tutorId", select: "name" },
      { path: "categoryId", select: "name" },
    ]);

    const totalCount = await this.countDocuments(filter);

    return {
      courses,
      totalCount,
    };
  }
  async publishCourse(courseId: string): Promise<Course> {
    const course = await this.findOne({ _id: courseId });
    if (!course) {
      throw new Error("Course not found");
    }

    course.isPublished = "published";
    const updatedCourse = await course.save();

    return updatedCourse;
  }
  async rejectCourse(courseId: string): Promise<CourseReject> {
    const course = await this.findOne({ _id: courseId });
    console.log("rejectCourse", course);
    if (!course) {
      throw new Error("Course not found");
    }

    const tutor = await this._tutorRepository.findOne({
      _id: course.tutorId,
    });
    console.log("inside cour reject repo", tutor);
    if (!tutor) {
      throw new Error("Tutor not found");
    }
    course.isPublished = "rejected";
    const updatedCourse = await course.save();

    return { course: updatedCourse, tutor };
  }
  async getPublishedCoursesWithDetails(
    skip: number,
    limit: number,
    search?: string
  ): Promise<{ courses: Course[]; totalPages: number; totalCount: number }> {
    const filter: any = { isPublished: "published" };

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.title = searchRegex;
    }

    const populateOptions = [
      { path: "categoryId", select: "name" },
      { path: "tutorId", select: "name" },
    ];

    const courses = await this.findWithPagination(
      filter,
      skip,
      limit,
      populateOptions
    );
    const totalCount = await this.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    return { courses, totalPages, totalCount };
  }
}
