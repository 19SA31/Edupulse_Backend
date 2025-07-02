import express from 'express'
import authRoute from './userRoute'

const userRoute =express.Router()

userRoute.use('/user',authRoute)


export default userRoute