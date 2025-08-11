import { CategoryDTOArr } from "../../dto/course/CategoryDTO";
import {
  CreateCourseDto,
  CourseForReview,
  PublishedCourseDto,
  CourseRejectDto,
  CourseListingDto
} from "../../dto/course/CourseDTO";
import { Course } from "./courseInterface";

export interface ICourseService {
  getAllCategories(): Promise<CategoryDTOArr>;
  createCourse(
    courseDto: CreateCourseDto,
    files: { [fieldname: string]: Express.Multer.File[] },
    thumbnailFile?: Express.Multer.File
  ): Promise<Course>;
  getUnpublishedCourses(
    skip: number,
    limit: number,
    search?: string
  ): Promise<{
    courses: CourseForReview[];
    totalPages: number;
    totalCount: number;
  }>;
  publishCourse(courseId: string): Promise<PublishedCourseDto>;
  rejectCourse(courseId: string): Promise<CourseRejectDto>;
  getPublishedCoursesForListing(
    skip: number,
    limit: number,
    search: any
  ): Promise<{
    courses: CourseListingDto[];
    totalPages: number;
    totalCount: number;
  }>;
  listUnlistCourseService(id:string): Promise<void>
}