import { User, Tutor, Category } from "../adminInterface/adminInterface";
export interface IAdminService {
  getAllUsers(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ users: User[]; totalPages: number }>;
  getAllTutors(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ tutors: Tutor[]; totalPages: number }>;
  listUnlistUser(id: string): Promise<User>;
  listUnlistTutor(id: string): Promise<Tutor>;
  addCourseCategory(data: Category): Promise<Category>;
  getAllCategories(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ category: Category[]; totalPages: number }>;
  updateCourseCategory(
    categoryId: string,
    updateData: {
      name: string;
      description: string;
    }
  ): Promise<Category>;
  toggleCategoryListStatus(categoryId: string): Promise<Category>;
}
