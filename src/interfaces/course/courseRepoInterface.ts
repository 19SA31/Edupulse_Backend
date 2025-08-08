import { Category } from "./courseInterface"
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
}