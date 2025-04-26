import mongoose, { ObjectId,Types } from "mongoose";

export interface IAdmin{
    email: string
    password: string
}

export interface User {
    _id: ObjectId|any;
    userId: string; 
    name: string;
    email: string;
    phone: string;
    password: string; 
    createdAt: Date;
    isBlocked: boolean;
    
  }

export interface GetUser{
    users:User[],
    totalPages:number

  }

  export interface GetTutor{
    tutors:Tutor[],
    totalPages:number,
  }
  export interface Tutor {
    _id: ObjectId|any;
    tutorId: string; // Assuming UUID for doctorId
    name: string;
    email: string;
    phone: string;
    password: string;
    createdAt: Date;
    isBlocked: boolean;

  }