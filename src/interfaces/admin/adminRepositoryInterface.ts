import { User, Tutor, Category } from "../adminInterface/adminInterface";
import { ResponseModel } from "../../models/ResponseModel";
export interface IAdminRepositoryInterface {
  getAllUsers(
    skip: number,
    limit: number,
    search: string
  ): Promise<ResponseModel<{ users: User[]; totalPages: number }>>;
  getAllTutors(
    skip: number,
    limit: number,
    search: string
  ): Promise<ResponseModel<{ tutors: Tutor[]; totalPages: number }>>;
  changeUserStatus(id: string): Promise<ResponseModel<User>>;
  changeTutorStatus(id: string): Promise<ResponseModel<Tutor>>;
  addCategory(data: Category): Promise<ResponseModel<Category | null>>;
  getAllCategories(
    skip: number,
    limit: number,
    search: string
  ): Promise<
    ResponseModel<{ category: Category[]; totalPages: number } | null>
  >;
  updateCategory(
    categoryId: string,
    updateData: { name: string; description: string }
  ): Promise<any>;
  toggleCategoryStatus(categoryId: string): Promise<any>;
}
