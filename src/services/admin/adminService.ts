// src/services/admin/AdminService.ts
import { IAdminService } from "../../interfaces/admin/adminServiceInterface";
import { IAdminRepositoryInterface } from "../../interfaces/admin/adminRepositoryInterface";
import { UserDto } from "../../dto/admin/UserDTO";
import { TutorDto } from "../../dto/admin/TutorDTO";
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
      // Get raw data from repository
      const result = await this._adminRepository.getAllUsers(
        skip,
        limit,
        search
      );

      // Transform entities to DTOs using mapper
      const userDtos = UserMapper.toDtoArray(result.users);

      // Process avatars for each user DTO
      const usersWithAvatars = await Promise.all(
        userDtos.map(async (userDto) => {
          let avatarUrl = "";

          if (userDto.avatar) {
            try {
              // Use the complete S3 key path stored in the database
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

      // Calculate total count from repository data
      const totalCount =
        result.users.length > 0
          ? Math.ceil(
              result.totalPages *
                (result.users.length / Math.min(result.users.length, limit))
            ) * limit
          : 0;

      console.log("result", usersWithAvatars);

      return {
        users: usersWithAvatars,
        totalPages: result.totalPages,
        totalCount: totalCount,
      };
    } catch (error: any) {
      console.error("Error in AdminService getAllUsers:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async getAllTutors(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ tutors: TutorDto[]; totalPages: number; totalCount: number }> {
    try {
      // Get raw data from repository
      const result = await this._adminRepository.getAllTutors(
        skip,
        limit,
        search
      );

      // Transform entities to DTOs using mapper
      const tutorDtos = TutorMapper.toDtoArray(result.tutors);

      // Process avatars for each tutor DTO
      const tutorsWithAvatars = await Promise.all(
        tutorDtos.map(async (tutorDto) => {
          let avatarUrl = "";

          if (tutorDto.avatar) {
            try {
              // Use the complete S3 key path stored in the database
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

      // Calculate total count from repository data
      const totalCount =
        result.tutors.length > 0
          ? Math.ceil(
              result.totalPages *
                (result.tutors.length / Math.min(result.tutors.length, limit))
            ) * limit
          : 0;

      console.log("result", tutorsWithAvatars);

      return {
        tutors: tutorsWithAvatars,
        totalPages: result.totalPages,
        totalCount: totalCount,
      };
    } catch (error: any) {
      console.error("Error in AdminService getAllTutors:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async listUnlistUser(id: string): Promise<UserDto> {
    try {
      // Get raw entity from repository
      const user = await this._adminRepository.changeUserStatus(id);

      // Transform entity to DTO using mapper
      const userDto = UserMapper.toDto(user);

      return userDto;
    } catch (error: any) {
      console.error("Error in AdminService listUnlistUser:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async listUnlistTutor(id: string): Promise<TutorDto> {
    try {
      // Get raw entity from repository
      const tutor = await this._adminRepository.changeTutorStatus(id);

      // Transform entity to DTO using mapper
      const tutorDto = TutorMapper.toDto(tutor);

      return tutorDto;
    } catch (error: any) {
      console.error("Error in AdminService listUnlistTutor:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async addCourseCategory(data: CreateCategoryDto): Promise<CategoryDto> {
    try {
      // Transform DTO to entity using mapper
      const categoryEntity = CategoryMapper.fromCreateDto(data);

      // Pass entity to repository
      const createdCategory = await this._adminRepository.addCategory(
        categoryEntity
      );

      // Transform result back to DTO using mapper
      const categoryDto = CategoryMapper.toDto(createdCategory);

      return categoryDto;
    } catch (error: any) {
      console.error("Error in AdminService addCourseCategory:", error.message);
      throw error; // Re-throw to let controller handle
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
      // Get raw data from repository
      const result = await this._adminRepository.getAllCategories(
        skip,
        limit,
        search
      );

      // Transform entities to DTOs using mapper
      const categoryDtos = CategoryMapper.toDtoArray(result.category);

      // Calculate total count from repository data
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
      // Transform DTO to partial entity using mapper
      const updateEntity = CategoryMapper.fromUpdateDto(updateData);

      // Pass entity to repository
      const updatedCategory = await this._adminRepository.updateCategory(
        categoryId,
        updateEntity
      );

      // Transform result back to DTO using mapper
      const categoryDto = CategoryMapper.toDto(updatedCategory);

      return categoryDto;
    } catch (error: any) {
      console.error(
        "Error in AdminService updateCourseCategory:",
        error.message
      );
      throw error; // Re-throw to let controller handle
    }
  }

  async toggleCategoryListStatus(categoryId: string): Promise<CategoryDto> {
    try {
      // Get raw entity from repository
      const category = await this._adminRepository.toggleCategoryStatus(
        categoryId
      );

      // Transform entity to DTO using mapper
      const categoryDto = CategoryMapper.toDto(category);

      return categoryDto;
    } catch (error: any) {
      console.error(
        "Error in AdminService toggleCategoryListStatus:",
        error.message
      );
      throw error; // Re-throw to let controller handle
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
      // Get raw data from repository
      const result = await this._adminRepository.getAllTutorDocs(
        skip,
        limit,
        search
      );

      // Transform entities to DTOs using mapper
      const tutorDocsDtos = TutorDocsMapper.toDtoArray(result.tutorDocs);

      // Process document URLs for each tutor docs DTO
      const tutorDocsWithUrls = await Promise.all(
        tutorDocsDtos.map(async (tutorDocsDto) => {
          let avatarUrl = "";
          let degreeUrl = "";
          let aadharFrontUrl = "";
          let aadharBackUrl = "";

          try {
            // Use the complete S3 key paths stored in the database
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

      // Calculate total count from repository data
      const totalCount =
        result.tutorDocs.length > 0
          ? Math.ceil(
              result.totalPages *
                (result.tutorDocs.length /
                  Math.min(result.tutorDocs.length, limit))
            ) * limit
          : 0;

      console.log("tutor docs result", tutorDocsWithUrls);

      return {
        tutorDocs: tutorDocsWithUrls,
        totalPages: result.totalPages,
        totalCount: totalCount,
      };
    } catch (error: any) {
      console.error("Error in AdminService getAllTutorDocs:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async verifyTutor(
    tutorId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Call repository to verify tutor
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

      throw error; // Re-throw to let controller handle
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
      // Call repository to reject tutor
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
        rejectionReason: reason, // Use the reason parameter directly
      };
    } catch (error: any) {
      console.error("Error in AdminService rejectTutor:", error.message);

      if (error.message === "Tutor not found") {
        return {
          success: false,
          message: "Tutor not found",
        };
      }

      throw error; // Re-throw to let controller handle
    }
  }
}
