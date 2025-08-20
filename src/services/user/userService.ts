// services/userService.ts
import { IUserService } from "../../interfaces/user/userServiceInterface";
import { IUserRepository } from "../../interfaces/user/userRepoInterface";
import {
  UpdateProfileData,
  UserProfileData,
  CropData,
} from "../../interfaces/userInterface/userInterface";
import { S3Service } from "../../utils/s3";
import { cropAndSave } from "../../helper/Sharp";

class UserService implements IUserService {
  private userRepository: IUserRepository;
  private s3Service: S3Service;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
    this.s3Service = new S3Service();
  }

  async ensureUserActive(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.isBlocked) {
      throw new Error("User is blocked");
    }
  }

  async updateProfile(
    userId: string,
    updateData: UpdateProfileData
  ): Promise<{ user: UserProfileData }> {
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }

    if (updateData.name !== undefined) {
      if (!updateData.name || updateData.name.trim().length < 2) {
        throw new Error("Name must be at least 2 characters long");
      }
      if (updateData.name.trim().length > 50) {
        throw new Error("Name must be less than 50 characters");
      }
      updateData.name = updateData.name.trim();
    }

    if (updateData.phone !== undefined) {
      if (!updateData.phone) {
        throw new Error("Phone number is required");
      }

      const phoneRegex = /^[0-9]{10,15}$/;
      const cleanPhone = updateData.phone.replace(/\D/g, "");

      if (!phoneRegex.test(cleanPhone)) {
        throw new Error("Please enter a valid phone number (10-15 digits)");
      }

      const existingPhoneUser =
        await this.userRepository.findByPhoneExcludingId(cleanPhone, userId);
      if (existingPhoneUser) {
        throw new Error(
          "Phone number is already registered with another account"
        );
      }

      updateData.phone = cleanPhone;
    }

    if (updateData.DOB !== undefined && updateData.DOB) {
      const dobDate = new Date(updateData.DOB);
      const today = new Date();

      if (dobDate > today) {
        throw new Error("Date of birth cannot be in the future");
      }

      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 13);

      if (dobDate > minAge) {
        throw new Error("User must be at least 13 years old");
      }
    }

    if (updateData.gender !== undefined && updateData.gender) {
      if (!["male", "female", "other"].includes(updateData.gender)) {
        throw new Error("Invalid gender selection");
      }
    }

    if (
      updateData.avatar &&
      updateData.avatar !== null &&
      typeof updateData.avatar === "object" &&
      "buffer" in updateData.avatar
    ) {
      try {
        const avatarFile = updateData.avatar as Express.Multer.File;
        let processedBuffer = avatarFile.buffer;

        if (updateData.cropData) {
          const { x, y, width, height } = updateData.cropData;

          processedBuffer = (await cropAndSave(
            x,
            y,
            width,
            height,
            avatarFile.buffer
          )) as Buffer;
        }

        const processedFile = {
          ...avatarFile,
          buffer: processedBuffer,
        };

        if (existingUser.avatar) {
          try {
            await this.s3Service.deleteFile(existingUser.avatar);
          } catch (deleteError) {
            console.warn("Failed to delete old avatar:", deleteError);
          }
        }

        const avatarS3Key = await this.s3Service.uploadFile(
          "user_avatars",
          processedFile
        );

        updateData.avatar = avatarS3Key;
      } catch (uploadError) {
        console.error("Avatar upload error:", uploadError);
        throw new Error("Failed to upload avatar. Please try again.");
      }
    } else if (updateData.avatar === null) {
      if (existingUser.avatar) {
        try {
          await this.s3Service.deleteFile(existingUser.avatar);
        } catch (deleteError) {
          console.warn("Failed to delete avatar:", deleteError);
        }
      }
    }

    const { cropData, ...dataToUpdate } = updateData;

    const updatedUser = await this.userRepository.updateProfile(
      userId,
      dataToUpdate
    );

    if (!updatedUser) {
      throw new Error("Failed to update profile");
    }

    let avatarUrl = null;
    if (updatedUser.avatar) {
      try {
        avatarUrl = await this.s3Service.getFile(updatedUser.avatar);
      } catch (error) {
        console.warn("Failed to generate avatar URL:", error);
      }
    }

    const responseData: UserProfileData = {
      _id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      DOB: updatedUser.DOB,
      gender: updatedUser.gender,
      avatar: avatarUrl,
      isBlocked: updatedUser.isBlocked,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      lastLogin: updatedUser.lastLogin,
    };

    return { user: responseData };
  }

  async getUserProfile(userId: string): Promise<{ user: UserProfileData }> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    let avatarUrl = null;
    if (user.avatar) {
      try {
        avatarUrl = await this.s3Service.getFile(user.avatar);
      } catch (error) {
        console.warn("Failed to generate avatar URL:", error);
      }
    }

    const responseData: UserProfileData = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      DOB: user.DOB,
      gender: user.gender,
      avatar: avatarUrl,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
    };

    return { user: responseData };
  }
}

export default UserService;
