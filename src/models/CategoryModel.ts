import { model,Schema } from 'mongoose'
import { ICategory } from '../interfaces/adminInterface/adminInterface'

const categorySchema = new Schema <ICategory>({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    isListed:{
        type:Boolean,
        default:true
    }
})

const categoryModel = model <ICategory>("Category",categorySchema)
export default categoryModel