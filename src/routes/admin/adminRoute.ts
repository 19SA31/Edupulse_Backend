import express from 'express'
import authAdminRoute from './authAdminRoute' 

const adminRoute =express.Router()

adminRoute.use('/admin',authAdminRoute)


export default adminRoute