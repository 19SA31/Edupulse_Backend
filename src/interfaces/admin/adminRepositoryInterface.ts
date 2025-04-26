import { GetUser,GetTutor } from "../adminInterface/adminInterface"
import { ResponseModel } from "../../models/ResponseModel";
export interface IAdminRepositoryInterface{

    getAllUsers(skip: number, limit: number,search:string):Promise<ResponseModel<GetUser>>
    getAllTutors(skip: number, limit: number,search:string):Promise<ResponseModel<GetTutor>>
}