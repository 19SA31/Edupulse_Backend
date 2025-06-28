import {
  User,
  Tutor,
  Category,
} from "../../interfaces/adminInterface/adminInterface";

export interface IAdminService {
  // User methods - return raw data, not ResponseModel
  getAllUsers(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ users: User[]; totalPages: number }>;
  listUnlistUser(id: string): Promise<User>;

  // Tutor methods - return raw data, not ResponseModel
  getAllTutors(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ tutors: Tutor[]; totalPages: number }>;
  listUnlistTutor(id: string): Promise<Tutor>;

  // Category methods - return raw data, not ResponseModel
  addCourseCategory(data: Category): Promise<Category>;
  getAllCategories(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ category: Category[]; totalPages: number }>;
  updateCourseCategory(
    categoryId: string,
    updateData: { name: string; description: string }
  ): Promise<Category>;
  toggleCategoryListStatus(categoryId: string): Promise<Category>;
}
