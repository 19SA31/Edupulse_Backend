// interfaces/course/courseInterface.ts
import { Types } from 'mongoose';

export interface IFile {
  fileName: string;
}

export interface IModule {
  title: string;
  description: string;
  documents: IFile[];
  videos: IFile[];
  order: number;
}

export interface IChapter {
  title: string;
  description: string;
  modules: IModule[];
  order: number;
}


export interface Course {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  categoryId: Types.ObjectId;
  price: number;
  thumbnailImage?: string;
  chapters: IChapter[];
  tutorId: Types.ObjectId;
  isPublished: boolean;
  isListed: boolean;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category{
  id:string;
  name:string;
  description:string;
}