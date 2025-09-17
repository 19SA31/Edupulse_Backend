// interfaces/course/courseInterface.ts
import { Types } from 'mongoose';
import { Tutor } from '../adminInterface/adminInterface';

export interface IFile {
  fileName: string;
}

export interface Ilesson {
  title: string;
  description: string;
  documents: IFile[];
  videos: IFile[];
  order: number;
}

export interface IChapter {
  title: string;
  description: string;
  lessons: Ilesson[];
  order: number;
}


export interface Course {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  categoryId: Types.ObjectId | string;
  price: number;
  thumbnailImage?: string;
  chapters: IChapter[];
  tutorId: Types.ObjectId | string;
  isPublished: string;
  isListed: boolean;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface CourseReject{
  course:Course,
  tutor:Tutor
}

export interface Category{
  id:string;
  name:string;
  description:string;
}

