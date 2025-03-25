import mongoose from "mongoose"
import dotenv from "dotenv"


dotenv.config()

const connectDB = async () =>{
    try {
        const mongoURI = process.env.MONGO_ATLAS_URL
        if (!mongoURI) {
            throw new Error("MONGO_ATLAS_URL is not defined in environment variables");
          }
        await mongoose.connect(process.env.MONGO_ATLAS_URL as string)
        console.log("MongoDB connected")
    } catch (error:unknown) {
        if(error instanceof Error){
            throw new Error(error.message)
        }else{
            throw new Error("Unknown error at Mongo connect")
        }
    }
}
 
export default connectDB