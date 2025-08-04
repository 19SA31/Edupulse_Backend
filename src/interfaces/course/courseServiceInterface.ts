import { CategoryDTOArr } from "../../dto/course/CategoryDTO";
import { CreateCourseDto } from "../../dto/course/CourseDTO";
import { ICourse } from "./courseInterface";
export interface ICourseService {
  getAllCategories(): Promise<CategoryDTOArr>;
  createCourse(
    courseDto: CreateCourseDto,
    files: { [fieldname: string]: Express.Multer.File[] },
    thumbnailFile?: Express.Multer.File
  ): Promise<ICourse>;
}
