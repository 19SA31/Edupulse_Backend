import express from 'express'
import authTutorRoute from './tutorRoute'

const tutorRoute =express.Router()

tutorRoute.use('/tutor',authTutorRoute)


export default tutorRoute