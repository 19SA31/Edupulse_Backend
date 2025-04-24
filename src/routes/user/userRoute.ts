import express from 'express'
import authRoute from './authRoute'

const userRoute =express.Router()

userRoute.use('/user',authRoute)


export default userRoute