import express, { Application } from "express";
import userRoute from "./user/userRoutes";
import tutorRoute from "./tutor/tutorRoute";
import adminRoute from "./admin/adminRoute";


const routes =(app:Application)=>{
    app.use('/api/',userRoute)
    app.use('/api/',tutorRoute)
    app.use('/api/',adminRoute)
}

export default routes