import  { model, Schema } from "mongoose"
import { OTPDocument } from "../interfaces/userInterface/userInterface"

const OTPSchema= new Schema<OTPDocument>({ 
  
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdTime: { type: Date, default: () => Date.now(), index: { expires: '55s' } }, 
  });
  
  
  const OtpModel = model<OTPDocument>('Otp', OTPSchema);
  
  export default OtpModel;