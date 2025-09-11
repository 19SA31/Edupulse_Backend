// src/services/admin/AdminService.ts
import { IAdminService } from "../../interfaces/admin/IAdminService";
import { IAdminRepositoryInterface } from "../../interfaces/admin/IAdminRepositoryInterface";
import { UserDto } from "../../dto/admin/UserDTO";
import { TutorDto } from "../../dto/admin/TutorDTO";
import { ValidationError } from "../../errors/ValidationError";
import {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  
} from "../../dto/admin/CategoryDTO";
import { UserMapper } from "../../mappers/admin/UserMapper";
import { TutorMapper } from "../../mappers/admin/TutorMapper";
import { CategoryMapper } from "../../mappers/admin/CategoryMapper";
import { TutorDocsMapper } from "../../mappers/admin/TutorDocsMapper";
import { TutorDocsDto } from "../../dto/admin/TutorDocsDTO";
import { S3Service } from "../../utils/s3";

export class AdminService implements IAdminService {
  private _adminRepository: IAdminRepositoryInterface;
  private s3Service: S3Service;

  constructor(adminRepository: IAdminRepositoryInterface) {
    this._adminRepository = adminRepository;
    this.s3Service = new S3Service();
  }

  async getAllUsers(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ users: UserDto[]; totalPages: number; totalCount: number }> {
    try {
      const result = await this._adminRepository.getAllUsers(
        skip,
        limit,
        search
      );

      const userDtos = UserMapper.toDtoArray(result.users);

      const usersWithAvatars = await Promise.all(
        userDtos.map(async (userDto) => {
          let avatarUrl = "";

          if (userDto.avatar) {
            try {
              avatarUrl = await this.s3Service.getFile(userDto.avatar);
            } catch (error) {
              console.warn(
                `Failed to generate avatar URL for user ${userDto.id}:`,
                error
              );
            }
          }

          return { ...userDto, avatar: avatarUrl };
        })
      );

      const totalCount =
        result.users.length > 0
          ? Math.ceil(
              result.totalPages *
                (result.users.length / Math.min(result.users.length, limit))
            ) * limit
          : 0;

      return {
        users: usersWithAvatars,
        totalPages: result.totalPages,
        totalCount: totalCount,
      };
    } catch (error: any) {
      console.error("Error in AdminService getAllUsers:", error.message);
      throw error;
    }
  }

  async getAllTutors( 
    skip: number,
    limit: number,
    search: any
  ): Promise<{ tutors: TutorDto[]; totalPages: number; totalCount: number }> {
    try {
      const result = await this._adminRepository.getAllTutors(
        skip,
        limit,
        search
      );

      const tutorDtos = TutorMapper.toDtoArray(result.tutors);

      const tutorsWithAvatars = await Promise.all(
        tutorDtos.map(async (tutorDto) => {
          let avatarUrl = "";

          if (tutorDto.avatar) {
            try {
              avatarUrl = await this.s3Service.getFile(tutorDto.avatar);
            } catch (error) {
              console.warn(
                `Failed to generate avatar URL for tutor ${tutorDto.id}:`,
                error
              );
            }
          }

          return { ...tutorDto, avatar: avatarUrl };
        })
      );

      const totalCount =
        result.tutors.length > 0
          ? Math.ceil(
              result.totalPages *
                (result.tutors.length / Math.min(result.tutors.length, limit))
            ) * limit
          : 0;

      return {
        tutors: tutorsWithAvatars,
        totalPages: result.totalPages,
        totalCount: totalCount,
      };
    } catch (error: any) {
      console.error("Error in AdminService getAllTutors:", error.message);
      throw error;
    }
  }

  async listUnlistUser(id: string): Promise<UserDto> {
    try {
      const user = await this._adminRepository.changeUserStatus(id);

      const userDto = UserMapper.toDto(user);

      return userDto;
    } catch (error: any) {
      console.error("Error in AdminService listUnlistUser:", error.message);
      throw error;
    }
  }

  async listUnlistTutor(id: string): Promise<TutorDto> {
    try {
      const tutor = await this._adminRepository.changeTutorStatus(id);

      const tutorDto = TutorMapper.toDto(tutor);

      return tutorDto;
    } catch (error: any) {
      console.error("Error in AdminService listUnlistTutor:", error.message);
      throw error;
    }
  }

  async addCourseCategory(data: CreateCategoryDto): Promise<CategoryDto> {
    try {
      const categoryEntity = CategoryMapper.fromCreateDto(data);

      const existingCategory = await this._adminRepository.findCategoryByName(
        categoryEntity.name
      );

      if (existingCategory) {
        throw new ValidationError(
          `Category with name '${data.name}' already exists`
        );
      }

      const createdCategory = await this._adminRepository.addCategory(
        categoryEntity
      );

      const categoryDto = CategoryMapper.toDto(createdCategory);

      return categoryDto;
    } catch (error: any) {
      console.error("Error in AdminService addCourseCategory:", error.message);
      throw error;
    }
  }

  async getAllCategories(
    skip: number,
    limit: number,
    search: any
  ): Promise<{
    categories: CategoryDto[];
    totalPages: number;
    totalCount: number;
  }> {
    try {
      const result = await this._adminRepository.getAllCategories(
        skip,
        limit,
        search
      );

      const categoryDtos = CategoryMapper.toDtoArray(result.category);

      const totalCount =
        result.category.length > 0
          ? Math.ceil(
              result.totalPages *
                (result.category.length /
                  Math.min(result.category.length, limit))
            ) * limit
          : 0;

      return {
        categories: categoryDtos,
        totalPages: result.totalPages,
        totalCount: totalCount,
      };
    } catch (error: any) {
      console.error("Error in AdminService getAllCategories:", error.message);
      throw error;
    }
  }

  async updateCourseCategory(
    categoryId: string,
    updateData: UpdateCategoryDto
  ): Promise<CategoryDto> {
    try {
      const updateEntity = CategoryMapper.fromUpdateDto(updateData);

      const updatedCategory = await this._adminRepository.updateCategory(
        categoryId,
        updateEntity
      );

      const categoryDto = CategoryMapper.toDto(updatedCategory);

      return categoryDto;
    } catch (error: any) {
      console.error(
        "Error in AdminService updateCourseCategory:",
        error.message
      );
      throw error;
    }
  }

  async toggleCategoryListStatus(categoryId: string): Promise<CategoryDto> {
    try {
      const category = await this._adminRepository.toggleCategoryStatus(
        categoryId
      );

      const categoryDto = CategoryMapper.toDto(category);

      return categoryDto;
    } catch (error: any) {
      console.error(
        "Error in AdminService toggleCategoryListStatus:",
        error.message
      );
      throw error;
    }
  }

  async getAllTutorDocs(
    skip: number,
    limit: number,
    search: any
  ): Promise<{
    tutorDocs: TutorDocsDto[];
    totalPages: number;
    totalCount: number;
  }> {
    try {
      const result = await this._adminRepository.getAllTutorDocs(
        skip,
        limit,
        search
      );

      const tutorDocsDtos = TutorDocsMapper.toDtoArray(result.tutorDocs);

      const tutorDocsWithUrls = await Promise.all(
        tutorDocsDtos.map(async (tutorDocsDto) => {
          let avatarUrl = "";
          let degreeUrl = "";
          let aadharFrontUrl = "";
          let aadharBackUrl = "";

          try {
            if (tutorDocsDto.avatar) {
              avatarUrl = await this.s3Service.getFile(tutorDocsDto.avatar);
            }
            if (tutorDocsDto.degree) {
              degreeUrl = await this.s3Service.getFile(tutorDocsDto.degree);
            }
            if (tutorDocsDto.aadharFront) {
              aadharFrontUrl = await this.s3Service.getFile(
                tutorDocsDto.aadharFront
              );
            }
            if (tutorDocsDto.aadharBack) {
              aadharBackUrl = await this.s3Service.getFile(
                tutorDocsDto.aadharBack
              );
            }
          } catch (error) {
            console.warn(
              `Failed to generate document URLs for tutor docs ${tutorDocsDto.id}:`,
              error
            );
          }

          return {
            ...tutorDocsDto,
            avatar: avatarUrl || "",
            degree: degreeUrl || "",
            aadharFront: aadharFrontUrl || "",
            aadharBack: aadharBackUrl || "",
          };
        })
      );

      const totalCount =
        result.tutorDocs.length > 0
          ? Math.ceil(
              result.totalPages *
                (result.tutorDocs.length /
                  Math.min(result.tutorDocs.length, limit))
            ) * limit
          : 0;

      return {
        tutorDocs: tutorDocsWithUrls,
        totalPages: result.totalPages,
        totalCount: totalCount,
      };
    } catch (error: any) {
      console.error("Error in AdminService getAllTutorDocs:", error.message);
      throw error;
    }
  }

  async verifyTutor(
    tutorId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await this._adminRepository.verifyTutor(tutorId);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error("Error in AdminService verifyTutor:", error.message);

      if (error.message === "Tutor not found") {
        return {
          success: false,
          message: "Tutor not found",
        };
      }

      throw error;
    }
  }

  async rejectTutor(
    tutorId: string,
    reason: string
  ): Promise<{
    success: boolean;
    message?: string;
    tutorEmail?: string;
    tutorName?: string;
    rejectionReason?: string;
  }> {
    try {
      const result = await this._adminRepository.rejectTutor(tutorId, reason);

      if (!result) {
        return {
          success: false,
          message: "Tutor not found",
        };
      }

      return {
        success: true,
        tutorEmail: result.tutorEmail,
        tutorName: result.tutorName,
        rejectionReason: reason,
      };
    } catch (error: any) {
      console.error("Error in AdminService rejectTutor:", error.message);

      if (error.message === "Tutor not found") {
        return {
          success: false,
          message: "Tutor not found",
        };
      }

      throw error;
    }
  }
}
