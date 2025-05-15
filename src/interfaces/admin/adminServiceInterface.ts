
import { User,Tutor } from "../adminInterface/adminInterface"
export interface IAdminService{
    getAllUsers(skip: number, limit: number,search:any):Promise<{users:User[],totalPages:number}>
    getAllTutors(skip: number, limit: number,search:any):Promise<{tutors:Tutor[],totalPages:number}>
    listUnlistUser(id:string):Promise<User>
    listUnlistTutor(id:string):Promise<Tutor>
} 