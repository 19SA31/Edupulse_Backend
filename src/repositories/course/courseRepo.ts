import BaseRepository from "../BaseRepository";
import { ICourseRepoInterface } from "../../interfaces/course/courseRepoInterface";
import courseModel from "../../models/CourseModel";
import categoryModel from "../../models/CategoryModel";
import { Category } from "../../interfaces/course/courseInterface";
import { Course } from "../../interfaces/course/courseInterface";

export class CourseRepository
  extends BaseRepository<any>
  implements ICourseRepoInterface
{
  constructor() {
    super(courseModel);
  }
  private _categoryRepository = new BaseRepository<any>(categoryModel);

  async getCategories(): Promise<Category[]> {
    return await this._categoryRepository.findAll();
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
      isPublished: false,
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
}
