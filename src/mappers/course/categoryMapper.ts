import { Category } from "../../interfaces/course/courseInterface";
import { CategoryRequestDTO, CategoryDTO, CategoryDTOArr } from "../../dto/course/CategoryDTO";

export class CategoryMapper {
    static toDTO(category: Category): CategoryDTO {
        return {
            id: category.id,
            name: category.name
        }
    }

    static toDTOArr(categories: CategoryRequestDTO[]): CategoryDTOArr {
        return { categories: categories.map(this.toDTO) }
    }
}