import { Document } from "mongoose";
import { ResponseModel } from "../../models/ResponseModel"; 


export interface IAdminAuthRepository{
    verifyAdmin(email: string, password: string): Promise<ResponseModel<null>>;
    
}