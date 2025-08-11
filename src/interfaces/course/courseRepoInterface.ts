import { Category, CourseReject } from "./courseInterface";
import { Course } from "./courseInterface";

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
}