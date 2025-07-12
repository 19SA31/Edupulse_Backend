// src/dtos/admin/CategoryDto.ts
export interface CategoryDto {
  id: string;
  name: string;
  description: string;
  isListed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedCategoriesDto {
  categories: CategoryDto[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}