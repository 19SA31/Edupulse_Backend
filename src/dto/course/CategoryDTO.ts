import { Category } from "../../interfaces/course/courseInterface";

export interface CategoryRequestDTO extends Category {}

export interface CategoryDTO {
    id: string;
    name: string;
}

export interface CategoryDTOArr {
    categories: CategoryDTO[];
}