// src/mappers/admin/CategoryMapper.ts
import {
  Category,
  ICategoryMap,
} from "../../interfaces/adminInterface/adminInterface";
import {
  CategoryDto,
  PaginatedCategoriesDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../../dto/admin/CategoryDTO";

export class CategoryMapper {
  static toDto(category: ICategoryMap): CategoryDto {
    return {
      id: category.id ? category.id.toString() : '',
      name: category.name,
      description: category.description,
      isListed: category.isListed ?? true,
     
      createdAt: this.formatDate((category as any).createdAt),
      updatedAt: this.formatDate((category as any).updatedAt),
    };
  }

  
  private static formatDate(dateValue: any): string | undefined {
    if (!dateValue) return undefined;
    
    
    if (dateValue instanceof Date) {
      return dateValue.toISOString();
    }
    
    
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    
    
    if (typeof dateValue === 'number') {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    
    return undefined;
  }

  static toDtoArray(categories: ICategoryMap[]): CategoryDto[] {
    return categories.map((category) => this.toDto(category));
  }

  static toPaginatedDto(
    categories: ICategoryMap[],
    totalPages: number,
    currentPage: number,
    totalCount: number
  ): PaginatedCategoriesDto {
    return {
      categories: this.toDtoArray(categories),
      totalPages,
      currentPage,
      totalCount,
    };
  }

  static fromCreateDto(dto: CreateCategoryDto): Category {
    return {
      name: dto.name,
      description: dto.description,
    };
  }

  static fromUpdateDto(dto: UpdateCategoryDto): Partial<Category> {
    const updateData: Partial<Category> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    return updateData;
  }
}