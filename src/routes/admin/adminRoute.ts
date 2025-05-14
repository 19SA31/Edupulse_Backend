import express from 'express'
import adminRoutes from './adminRoutes' 

const adminRoute =express.Router()

adminRoute.use('/admin',adminRoutes)


export default adminRoute