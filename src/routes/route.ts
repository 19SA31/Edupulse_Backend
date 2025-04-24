import express, { Application } from "express";
import userRoute from "./user/userRoute";
import tutorRoute from "./tutor/tutorRoute";


const routes =(app:Application)=>{
    app.use('/api/user',userRoute)
    app.use('/api/tutor',tutorRoute)
}

export default routes