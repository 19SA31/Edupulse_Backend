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
    avatar:string | null;
  }

  export interface Tutor {
    _id: ObjectId|any;
    userId: string; 
    name: string;
    email: string;
    phone: string;
    password: string; 
    createdAt: Date;
    isBlocked: boolean;
    avatar:string;
  }



 export interface ICategory {
  _id?: string;
  name: string;
  description: string;
  isListed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

 export interface ICategoryMap {
  id?: string;
  name: string;
  description: string;
  isListed?: boolean;
  
}
export interface Category{
  name: string;
  description: string;
}
