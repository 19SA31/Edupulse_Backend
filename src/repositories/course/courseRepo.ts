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
import { Tutor } from "../../interfaces/adminInterface/adminInterface";

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

    if (!course) {
      throw new Error("Course not found");
    }

    const tutor = await this._tutorRepository.findOne({
      _id: course.tutorId,
    });

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

  async listUnlistCourse(id: string): Promise<void> {
    const course = await this.findOne({ _id: id });
    if (!course) {
      throw new Error("course not found");
    }
    course.isListed = !course.isListed;
    await course.save();
  }

  async findAllListedCourses(): Promise<Course[]> {
    try {
      const populateOptions = [
        { path: "categoryId", select: "name" },
        { path: "tutorId", select: "name" },
      ];

      return await this.findWithConditionAndPopulate(
        { isListed: true },
        populateOptions
      );
    } catch (error) {
      throw new Error(`Failed to find listed courses: ${error}`);
    }
  }

  async findAllListedCoursesWithFilters(
    filterConditions: any,
    sortOptions: any,
    page = 1,
    limit = 50
  ): Promise<Course[]> {
    try {
      const populateOptions = [
        { path: "categoryId", select: "name" },
        { path: "tutorId", select: "name" },
      ];

      if (filterConditions.categoryName) {
        const categoryName = filterConditions.categoryName;
        delete filterConditions.categoryName;

        const category = await this._categoryRepository.findOne({
          name: categoryName,
        });

        if (!category) {
          return [];
        }

        filterConditions.categoryId = category._id;
      }

      const skip = (page - 1) * limit;

      return this.findWithFiltersAndSort(
        filterConditions,
        skip,
        limit,
        sortOptions,
        populateOptions
      );
    } catch (error) {
      throw new Error(`Failed to find listed courses with filters: ${error}`);
    }
  }

  async findAllListedCategories(): Promise<Category[]> {
    try {
      return await this._categoryRepository.findWithCondition({
        isListed: true,
      });
    } catch (error) {
      throw new Error(`Failed to find listed categories: ${error}`);
    }
  }

  async getCourseDetails(id: string): Promise<Course> {
    try {
      const populateOptions = [
        {
          path: "categoryId",
          select: "name description",
        },
        {
          path: "tutorId",
          select: "name email designation about avatar",
        },
      ];

      const course = await this.findOneAndPopulate(
        { _id: id },
        populateOptions
      );

      if (!course) {
        throw new Error(`Course with id ${id} not found`);
      }

      return course;
    } catch (error) {
      console.error("Error in CourseRepository getCourseDetails:", error);
      throw new Error(`Failed to find course details: ${error}`);
    }
  }
}
