import express, { Application } from "express";
import userRoute from "./user/userRoute";


const routes =(app:Application)=>{
    app.use('/api/user',userRoute)
}

export default routes