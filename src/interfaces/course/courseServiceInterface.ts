import { CategoryDTOArr } from "../../dto/course/CategoryDTO";
import {
  CreateCourseDto,
  CourseForReview,
  PublishedCourseDto,
  CourseRejectDto,
  CourseListingDto,
  ListedCourseDTO,
  CourseDetailsDto,
  EditCourseDto,
} from "../../dto/course/CourseDTO";
import { ListedTutorDTO } from "../../dto/tutor/TutorDTO";
import { ListedCategoryDTO } from "../../dto/course/CategoryDTO";
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
  listUnlistCourseService(id: string): Promise<void>;
  getAllCourses(): Promise<ListedCourseDTO[]>;
  getAllListedCourses(filters: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<ListedCourseDTO[]>;
  getAllListedCategories(): Promise<ListedCategoryDTO[]>;
  getCourseDetails(id: string): Promise<CourseDetailsDto>;
  getTutorCourses(
    id: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{
    courses: CourseDetailsDto[];
    total: number;
    totalPages: number;
  }>;
  editCourse(
    courseId: string,
    courseDto: EditCourseDto,
    files: { [fieldname: string]: Express.Multer.File[] },
    thumbnailFile?: Express.Multer.File,
    existingThumbnailUrl?: string
  ): Promise<Course>;
}
