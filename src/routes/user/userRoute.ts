import express from 'express'
import authRoute from './authRoute'

const userRoute =express.Router()

userRoute.use('/auth',authRoute)


export default userRoute