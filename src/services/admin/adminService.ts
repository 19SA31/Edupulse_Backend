import { IAdminService } from "../../interfaces/admin/adminServiceInterface";
import { IAdminRepositoryInterface } from "../../interfaces/admin/adminRepositoryInterface";
import { Tutor, User } from "../../interfaces/adminInterface/adminInterface";

export class AdminService implements IAdminService{
    private _adminRepository: IAdminRepositoryInterface;

    constructor(adminRepository: IAdminRepositoryInterface) {
        this._adminRepository = adminRepository;
    }


    async getAllUsers(skip: number, limit: number, search: any): Promise<{ users: User[], totalPages: number }> {
        try {
            const { data } = await this._adminRepository.getAllUsers(skip, limit, search);
            if (!data) throw new Error('No data found');
    
            const { users, totalPages } = data;
    
            return { users, totalPages };
    
        } catch (error: any) {
            console.error("Error in AdminService:", error.message);
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
    }
    
    async getAllTutors(skip: number, limit: number, search: any): Promise<{ tutors: Tutor[], totalPages: number }> {
        try {
            const { data } = await this._adminRepository.getAllTutors(skip, limit, search);
            if (!data) throw new Error('No data found');
    
            const { tutors, totalPages } = data;
    
            return { tutors, totalPages };
    
        } catch (error: any) {
            console.error("Error in AdminService:", error.message);
            throw new Error(`Failed to fetch tutors: ${error.message}`);
        }
    }
    
}