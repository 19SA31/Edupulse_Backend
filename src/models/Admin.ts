import  { model, Schema } from "mongoose"
import { IAdmin } from "../interfaces/adminInterface/adminInterface" 


const adminSchema = new Schema<IAdmin>({
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
})

const userModel = model<IAdmin>("Admin",adminSchema)
export default userModel