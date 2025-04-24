import express from 'express'
import authAdminRoute from './authAdminRoute' 

const adminRoute =express.Router()

adminRoute.use('/tutor',authAdminRoute)


export default adminRoute