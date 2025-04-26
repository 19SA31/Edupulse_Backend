import { Messages } from "../../enums/messages";
import BaseRepository from "../BaseRepository";
import userModel from "../../models/Users";
import tutorModel from "../../models/Tutors"
import { GetTutor, GetUser } from "../../interfaces/adminInterface/adminInterface";
import { IAdminRepositoryInterface } from "../../interfaces/admin/adminRepositoryInterface";
import { ResponseModel } from "../../models/ResponseModel";

export class AdminRepository extends BaseRepository<any> implements IAdminRepositoryInterface{
    private _userRepository = new BaseRepository<any>(userModel);
    private _tutorRepository =  new BaseRepository<any>(tutorModel)
    
    

    async getAllUsers(skip: number, limit: number,search:string):Promise<ResponseModel<GetUser>> {
        try {
            const searchFilter = search
        ? {
            name: { $regex: search, $options: 'i' },
          }
        : {};

            const users = await this._userRepository.findWithPagination(searchFilter,skip,limit)
            const totalCount = await this._userRepository.countDocuments(searchFilter)

            const totalPages = Math.ceil(totalCount / limit); // Calculate total pages

            return new ResponseModel(true, Messages.FETCH_SUCCESS,{
                users,
                totalPages
            })

        } catch (error: any) {
            console.error("Error in AdminRepository:", error.message);
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
    }


    async getAllTutors(skip: number, limit: number,search:string):Promise<ResponseModel<GetTutor>> {
        try {
            const searchFilter = search
        ? {
            name: { $regex: search, $options: 'i' },
          }
        : {};

            const tutors = await this._tutorRepository.findWithPagination(searchFilter,skip,limit)
            const totalCount = await this._tutorRepository.countDocuments(searchFilter)

            const totalPages = Math.ceil(totalCount / limit); // Calculate total pages

            return new ResponseModel(true, Messages.FETCH_SUCCESS,{
                tutors,
                totalPages
            })

        } catch (error: any) {
            console.error("Error in AdminRepository:", error.message);
            throw new Error(`Failed to fetch Tutors: ${error.message}`);
        }
    }
} 