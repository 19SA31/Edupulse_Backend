import { Request, Response, NextFunction } from 'express';
import { IUserService } from '../../interfaces/user/IUserService';
import { UpdateProfileData, CropData } from '../../interfaces/userInterface/userInterface';
import HTTP_statusCode from '../../enums/HttpStatusCode';
import { AppError } from '../../errors/AppError';
import { sendSuccess } from '../../helper/responseHelper';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

class UserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.body?.id;
      
      if (!userId) {
        throw new AppError('Unauthorized: User not authenticated', HTTP_statusCode.Unauthorized);
      }

      const avatarFile = req.file;
      
      let cropData: CropData | undefined;
      if (req.body.cropData) {
        cropData = this.validateCropData(req.body.cropData);
      }

      if (avatarFile) {
        this.validateAvatarFile(avatarFile, cropData);
      }

      const updateData = this.buildUpdateData(req.body, avatarFile, cropData);
      
      if (Object.keys(updateData).length === 0) {
        throw new AppError('No data provided for update', HTTP_statusCode.BadRequest);
      }
      
      const result = await this.userService.updateProfile(userId, updateData);

      sendSuccess(res, 'Profile updated successfully', result);
    } catch (error) {
      next(error);
    }
  };

  getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new AppError('Unauthorized: User not authenticated', HTTP_statusCode.Unauthorized);
      }

      const result = await this.userService.getUserProfile(userId);

      sendSuccess(res, 'Profile retrieved successfully', result.user);
    } catch (error) {
      next(error);
    }
  };

  // Private helper methods
  private validateCropData(cropDataString: string): CropData {
    try {
      const cropData = JSON.parse(cropDataString);
      
      if (!cropData || typeof cropData !== 'object') {
        throw new AppError('Invalid crop data structure', HTTP_statusCode.BadRequest);
      }

      const { x, y, width, height } = cropData;
      
      if (typeof x !== 'number' || typeof y !== 'number' || 
          typeof width !== 'number' || typeof height !== 'number') {
        throw new AppError('Invalid crop data structure', HTTP_statusCode.BadRequest);
      }

      if (x < 0 || y < 0 || width <= 0 || height <= 0) {
        throw new AppError('Invalid crop data values', HTTP_statusCode.BadRequest);
      }

      if (width > 5000 || height > 5000) {
        throw new AppError('Crop area is too large', HTTP_statusCode.BadRequest);
      }

      return cropData;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid crop data format', HTTP_statusCode.BadRequest);
    }
  }

  private validateAvatarFile(avatarFile: Express.Multer.File, cropData?: CropData): void {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (avatarFile.size > maxSize) {
      throw new AppError('File size exceeds 5MB limit', HTTP_statusCode.BadRequest);
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(avatarFile.mimetype)) {
      throw new AppError('Only JPEG, PNG, GIF, and WebP images are allowed', HTTP_statusCode.BadRequest);
    }
  }

  private buildUpdateData(
    body: any, 
    avatarFile?: Express.Multer.File, 
    cropData?: CropData
  ): UpdateProfileData {
    const updateData: UpdateProfileData = {};
    
    if (body.name && body.name.trim()) {
      updateData.name = body.name.trim();
    }
    if (body.phone && body.phone.trim()) {
      updateData.phone = body.phone.trim();
    }
    if (body.DOB) {
      updateData.DOB = body.DOB;
    }
    if (body.gender) {
      updateData.gender = body.gender;
    }
    if (avatarFile) {
      updateData.avatar = avatarFile;
    }
    if (cropData) {
      updateData.cropData = cropData;
    }

    return updateData;
  }
}

export default UserController;