import { Category } from "./courseInterface"
import { ICourse } from "./courseInterface";

export interface ICourseRepoInterface {
    getCategories():Promise<Category[]>
    createCourse(courseData: Partial<ICourse>): Promise<ICourse>;
    checkSameTutor(tutorId:string):Promise<ICourse>
}