import mongoose, { ObjectId,Types } from "mongoose";

export interface IUser{
    userId: ObjectId
    name: string
    email: string
    phone: string
    password: string
    DOB: Date
    gender: string
    createdAt: Date
    lastLogin: Date
    referral?: string
    isBlocked: boolean
}

export interface userType{
  _id?: Types.ObjectId;
  name?: string;  
  email: string;
  phone?: string; 
  password: string;
  createdAt: Date;
};

export interface CreateUserType  {
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
}

export type NewUserType = {
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
};


export interface UserProfileData {
  _id: string | ObjectId | any;
  userId: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  createdAt?: string | Date;
  DOB: string | Date;
  address: string;
  isBlocked: boolean;
  __v?: number;
  
}
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  isBlocked: boolean;
  createdAt: Date;
  __v?: number;
}

export interface GetUserData {
  id: string;
  name: string;
  email: string;
}

export interface OTPDocument {
  email:string
  otp:string
  createdTime: Date
}

