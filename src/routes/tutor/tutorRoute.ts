import express from 'express'
import authRoute from './authRoute'

const tutorRoute =express.Router()

tutorRoute.use('/auth',authRoute)


export default tutorRoute