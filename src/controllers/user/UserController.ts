import { Request, Response } from 'express';
import { IUserService } from '../../interfaces/user/IUserService';
import { ResponseModel } from '../../models/ResponseModel';
import { UpdateProfileData, CropData } from '../../interfaces/userInterface/userInterface';
import HTTP_statusCode from '../../enums/HttpStatusCode';

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

  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {

      const userId = req.body?.id;
      
      if (!userId) {
        res.status(HTTP_statusCode.Unauthorized).json(
          new ResponseModel(false, 'Unauthorized: User not authenticated')
        );
        return;
      }

      const avatarFile = req.file;
      
      
      let cropData: CropData | undefined;
      if (req.body.cropData) {
        try {
          cropData = JSON.parse(req.body.cropData);
          if (cropData && typeof cropData === 'object') {
            const { x, y, width, height } = cropData;
            if (typeof x !== 'number' || typeof y !== 'number' || 
                typeof width !== 'number' || typeof height !== 'number') {
              res.status(HTTP_statusCode.BadRequest).json(
                new ResponseModel(false, 'Invalid crop data structure')
              );
              return;
            }

            
            if (x < 0 || y < 0 || width <= 0 || height <= 0) {
              res.status(HTTP_statusCode.BadRequest).json(
                new ResponseModel(false, 'Invalid crop data values')
              );
              return;
            }
          }
        } catch (error) {
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, 'Invalid crop data format')
          );
          return;
        }
      }

      
      if (avatarFile) {
        
        const maxSize = 5 * 1024 * 1024;
        if (avatarFile.size > maxSize) {
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, 'File size exceeds 5MB limit')
          );
          return;
        }

        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(avatarFile.mimetype)) {
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, 'Only JPEG, PNG, GIF, and WebP images are allowed')
          );
          return;
        }

        
        if (cropData && avatarFile.buffer) {
          
          const { x, y, width, height } = cropData;
          
          
          if (width > 5000 || height > 5000) {
            res.status(HTTP_statusCode.BadRequest).json(
              new ResponseModel(false, 'Crop area is too large')
            );
            return;
          }
        }
      }

      
      const updateData: UpdateProfileData = {};
      
      
      if (req.body.name && req.body.name.trim()) {
        updateData.name = req.body.name.trim();
      }
      if (req.body.phone && req.body.phone.trim()) {
        updateData.phone = req.body.phone.trim();
      }
      if (req.body.DOB) {
        updateData.DOB = req.body.DOB;
      }
      if (req.body.gender) {
        updateData.gender = req.body.gender;
      }

      
      if (avatarFile) {
        updateData.avatar = avatarFile;
      }

      
      if (cropData) {
        updateData.cropData = cropData;
      }
    
      if (Object.keys(updateData).length === 0) {
        res.status(HTTP_statusCode.BadRequest).json(
          new ResponseModel(false, 'No data provided for update')
        );
        return;
      }
      
      const result = await this.userService.updateProfile(userId, updateData);

      res.status(HTTP_statusCode.OK).json(
        new ResponseModel(true, 'Profile updated successfully', result)
      );

    } catch (error) {

      if (error instanceof Error) {
        const errorMessage = error.message;
        
        
        if (errorMessage.includes('Name must be') || 
            errorMessage.includes('Phone number') || 
            errorMessage.includes('Date of birth') || 
            errorMessage.includes('User must be') || 
            errorMessage.includes('Invalid gender') ||
            errorMessage.includes('already registered')) {
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, errorMessage)
          );
          return;
        }
        
        
        if (errorMessage.includes('User not found')) {
          res.status(HTTP_statusCode.NotFound).json(
            new ResponseModel(false, errorMessage)
          );
          return;
        }
        
       
        if (errorMessage.includes('Failed to upload avatar')) {
          res.status(HTTP_statusCode.InternalServerError).json(
            new ResponseModel(false, 'Failed to upload avatar. Please try again.')
          );
          return;
        }

        
        if (errorMessage.includes('File too large')) {
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, 'File size exceeds the allowed limit')
          );
          return;
        }
        if (errorMessage.includes('Only image files are allowed')) {
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, 'Only image files are allowed')
          );
          return;
        }
        if (errorMessage.includes('Unexpected field')) {
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, 'Invalid file field name')
          );
          return;
        }
      }
      
      res.status(HTTP_statusCode.InternalServerError).json(
        new ResponseModel(false, 'Internal server error')
      );
    }
  };

  getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(HTTP_statusCode.Unauthorized).json(
          new ResponseModel(false, 'Unauthorized: User not authenticated')
        );
        return;
      }

      const result = await this.userService.getUserProfile(userId);

      res.status(HTTP_statusCode.OK).json(
        new ResponseModel(true, 'Profile retrieved successfully', result.user)
      );

    } catch (error) {
      console.error('Get profile controller error:', error);
      
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        
        if (errorMessage.includes('User not found')) {
          res.status(HTTP_statusCode.NotFound).json(
            new ResponseModel(false, errorMessage)
          );
          return;
        }
      }
      
      res.status(HTTP_statusCode.InternalServerError).json(
        new ResponseModel(false, 'Internal server error')
      );
    }
  };

 
}

export default UserController;