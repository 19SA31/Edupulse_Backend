import { Category } from "../../interfaces/course/courseInterface";
import {
  CategoryRequestDTO,
  CategoryDTO,
  CategoryDTOArr,
  ListedCategoryDTO
} from "../../dto/course/CategoryDTO";

export class CategoryMapper {
  static toDTO(category: Category): CategoryDTO {
    return {
      id: category.id,
      name: category.name,
    };
  }

  static toDTOArr(categories: CategoryRequestDTO[]): CategoryDTOArr {
    return { categories: categories.map(this.toDTO) };
  }
  static toListedCategoryDTO(category: any): ListedCategoryDTO {
    return {
      categoryId: category._id?.toString() || "",
      name: category.name || "",
      description: category.description || "",
    };
  }

  static toListedCategoryDTOArray(categories: any[]): ListedCategoryDTO[] {
    return categories.map((category) => this.toListedCategoryDTO(category));
  }
}
