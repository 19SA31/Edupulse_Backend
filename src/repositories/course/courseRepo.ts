import BaseRepository from "../BaseRepository";
import { ICourseRepoInterface } from "../../interfaces/course/courseRepoInterface";
import courseModel from "../../models/CourseModel";
import categoryModel from "../../models/CategoryModel";
import { Category } from "../../interfaces/course/courseInterface";
import { ICourse } from "../../interfaces/course/courseInterface";


export class CourseRepository
  extends BaseRepository<any>
  implements ICourseRepoInterface
{
  constructor() {
    super(courseModel);
  }
  private _categoryRepository = new BaseRepository<any>(categoryModel);

  async getCategories(): Promise<Category[]> {
      return await this._categoryRepository.findAll()   
  }

  async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    return this.create(courseData as ICourse);
  }
  async checkSameTutor(tutorId: string): Promise<ICourse> {
    return await this.findOne({tutorId:tutorId})
  }
}
