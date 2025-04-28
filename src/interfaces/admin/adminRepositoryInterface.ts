import { User,Tutor } from "../adminInterface/adminInterface"
import { ResponseModel } from "../../models/ResponseModel";
export interface IAdminRepositoryInterface{

    getAllUsers(skip: number, limit: number,search:string):Promise<ResponseModel<{ users: User[], totalPages: number }>>
    getAllTutors(skip: number, limit: number,search:string):Promise<ResponseModel<{ tutors: Tutor[], totalPages: number }>>
    changeUserStatus(id: string):Promise<ResponseModel<User>>
    changeTutorStatus(id: string):Promise<ResponseModel<Tutor>>;
}