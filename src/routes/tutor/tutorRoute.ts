import express from 'express'
import authTutorRoute from './authTutorRoute'

const tutorRoute =express.Router()

tutorRoute.use('/tutor',authTutorRoute)


export default tutorRoute