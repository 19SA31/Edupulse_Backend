import express, { Application } from "express";
import userRoute from "./user/userRoute";
import tutorRoute from "./tutor/tutorRoute";
import adminRoute from "./admin/adminRoute";


const routes =(app:Application)=>{
    app.use('/api/user',userRoute)
    app.use('/api/tutor',tutorRoute)
    app.use('/api/admin',adminRoute)
}

export default routes