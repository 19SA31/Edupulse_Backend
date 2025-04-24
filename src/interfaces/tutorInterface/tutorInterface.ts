import mongoose, { ObjectId } from "mongoose";

export interface ITutor{
    userId: string
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

export interface tutorType{
  name?: string;  
  email: string;
  phone?: string; 
  password: string;
  createdAt: Date;
};


export interface tutorProfileData {
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
export interface TutorProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  isBlocked: boolean;
  createdAt: Date;
  __v?: number;
}

export interface GetTutorData {
  id: string;
  name: string;
  email: string;
}

export interface OTPDocument {
  email:string
  otp:string
  createdTime: Date
}

export interface CreateTutorType  {
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
}
