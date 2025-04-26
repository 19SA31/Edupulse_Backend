
import { User } from "../adminInterface/adminInterface"
export interface IAdminService{
    getAllUsers(skip: number, limit: number,search:any):Promise<{users:User[],totalPages:number}>
}