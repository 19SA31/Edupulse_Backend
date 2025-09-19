import { Category, CourseReject } from "./courseInterface";
import { Course, FilterConditions, SortOptions } from "./courseInterface";

export interface ICourseRepoInterface {
  getCategories(): Promise<Category[]>;
  createCourse(courseData: Partial<Course>): Promise<Course>;
  checkSameTutor(tutorId: string): Promise<Course>;
  unpublishedCourses(
    skip: number,
    limit: number,
    search?: string
  ): Promise<{
    courses: Course[];
    totalCount: number;
  }>;
  publishCourse(courseId: string): Promise<Course>;
  rejectCourse(courseId: string): Promise<CourseReject>;
  getPublishedCoursesWithDetails(
    skip: number,
    limit: number,
    search: string
  ): Promise<{
    courses: Course[];
    totalPages: number;
    totalCount: number;
  }>;
  listUnlistCourse(id: string): Promise<void>;
  findAllListedCourses(): Promise<Course[]>;
  findAllListedCoursesWithFilters(
    filterConditions: FilterConditions,
    sortOptions: SortOptions,
    page: number,
    limit: number
  ): Promise<Course[]>;
  findAllListedCategories(): Promise<Category[]>;
  getCourseDetails(id: string): Promise<Course>;
  addEnrollment(id: string): Promise<void>;
  getTutorCourses(
    id: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ courses: Course[]; total: number }>;
  updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course>;
}
