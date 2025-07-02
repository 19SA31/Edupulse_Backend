import { Request, Response } from 'express';
import { IUserService } from '../../interfaces/user/userServiceInterface';
import { ResponseModel } from '../../models/ResponseModel';
import { UpdateProfileData } from '../../interfaces/userInterface/userInterface';
import HTTP_statusCode from '../../enums/HttpStatusCode'; // Adjust the import path as needed

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
      console.log("inside controller for update,body: ")
      const userId = req.body.id;
      console.log()
      if (!userId) {
        console.log("no user id")
        res.status(HTTP_statusCode.Unauthorized).json(new ResponseModel(false, 'Unauthorized: User not authenticated'));
        return;
      }

      // Extract update data from request body
      const updateData: UpdateProfileData = {};
      
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.phone !== undefined) updateData.phone = req.body.phone;
      if (req.body.DOB !== undefined) updateData.DOB = req.body.DOB;
      if (req.body.gender !== undefined) updateData.gender = req.body.gender;

      // Get avatar file if uploaded
      const avatarFile = req.file;
      console.log("#######",updateData,avatarFile)
      // Validate that at least one field is being updated
      if (Object.keys(updateData).length === 0 && !avatarFile) {
        res.status(HTTP_statusCode.BadRequest).json(new ResponseModel(false, 'No data provided for update'));
        return;
      }

      // Call service to update profile
      const result = await this.userService.updateProfile(userId, updateData, avatarFile);

      console.log("inside updateprofile with userservice result ",result)
      // Send appropriate response based on result
      if (result.success) {
        res.status(HTTP_statusCode.OK).json(result);
      } else {
        const statusCode = this.getErrorStatusCode(result.message);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      console.error('Update profile controller error:', error);
      res.status(HTTP_statusCode.InternalServerError).json(new ResponseModel(false, 'Internal server error'));
    }
  };

  getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(HTTP_statusCode.Unauthorized).json(new ResponseModel(false, 'Unauthorized: User not authenticated'));
        return;
      }

      const result = await this.userService.getUserProfile(userId);

      if (result.success) {
        res.status(HTTP_statusCode.OK).json(result);
      } else {
        const statusCode = this.getErrorStatusCode(result.message);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      console.error('Get profile controller error:', error);
      res.status(HTTP_statusCode.InternalServerError).json(new ResponseModel(false, 'Internal server error'));
    }
  };

  private getErrorStatusCode(message: string): number {
    if (message.includes('not found')) return HTTP_statusCode.NotFound;
    if (message.includes('already registered') || message.includes('already taken')) return HTTP_statusCode.Conflict;
    if (message.includes('invalid') || message.includes('must be') || message.includes('required')) return HTTP_statusCode.BadRequest;
    if (message.includes('unauthorized')) return HTTP_statusCode.Unauthorized;
    return HTTP_statusCode.BadRequest; // Default to bad request
  }
}

export default UserController;