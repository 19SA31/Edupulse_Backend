import { Document, Model } from "mongoose";
import { ResponseModel } from "../../models/ResponseModel";
import adminModel from '../../models/Admin'
import { IAdminAuthRepository } from "../../interfaces/admin/adminAuthRepoInterface"; 
import { Messages } from "../../enums/messages";
import BaseRepository from "../BaseRepository";



export class AuthAdminRepository extends BaseRepository<any> implements IAdminAuthRepository {
    

    constructor() {
        super(adminModel); 
    }



    async verifyAdmin(email: string, password: string): Promise<ResponseModel<null>> {
        try {
            const userData = await this.findOne({ email });
            if (!userData) {
                return new ResponseModel(false, Messages.INVALID_EMAIL, null);
            }

            const isMatch = password === userData.password;
            if (!isMatch) {
                return new ResponseModel(false, Messages.INVALID_PASSWORD, null);
            }

            

            return new ResponseModel(true, Messages.LOGIN_SUCCESS, null);
        } catch (error: any) {
            return new ResponseModel(false, `${Messages.ERROR_LOGIN}: ${error.message}`, null);
        }
    }

    
}