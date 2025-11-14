// interfaces/course/courseInterface.ts
import { Types } from "mongoose";
import { Tutor } from "../adminInterface/adminInterface";
import { ListedCourseDTO } from "../../dto/course/CourseDTO";

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
  rejectionCount: Number;
}
export interface CourseReject {
  course: Course;
  tutor: Tutor;
}

export interface Category {
  _id?: any;
  id: string;
  name: string;
  description: string;
}

export interface CourseFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface PriceFilter {
  $gte?: number;
  $lte?: number;
}

export interface BaseFilterCondition {
  isListed?: boolean;
  _id?: { $in: string[] };
  categoryName?: string;
  categoryId?: Types.ObjectId | string;
  price?: PriceFilter;
  title?: { $regex: string; $options: string };
  description?: { $regex: string; $options: string };
}

export interface FilterConditions {
  $or?: BaseFilterCondition[];
  $and?: FilterConditions[];
  isListed?: boolean;
  categoryName?: string;
  categoryId?: Types.ObjectId | string;
  price?: PriceFilter;
}

export interface SortOptions {
  price?: 1 | -1;
  title?: 1 | -1;
  "categoryId.name"?: 1 | -1;
  createdAt?: 1 | -1;
}

export interface PopulateOption {
  path: string;
  select: string;
}

export interface PaginatedCoursesResponse {
  courses: ListedCourseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RawCourse {
  _id?: Types.ObjectId | { $oid: string };
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  categoryId?: Types.ObjectId | string | { name: string };
  price?: number | { $numberInt: string };
  thumbnailImage?: string;
  tutorId?: Types.ObjectId | string | { name: string };
  isPublished: string;
  isListed: boolean;
  enrollmentCount?: number | { $numberInt: string };
  chapters?: RawChapter[];
  createdAt?: Date | { $date: string | { $numberLong: string } };
  updatedAt?: Date | { $date: string | { $numberLong: string } };
  rejectionCount: Number;
}

export interface RawChapter {
  _id?: Types.ObjectId | { $oid: string };
  title: string;
  description: string;
  lessons: RawLesson[];
  order?: number | { $numberInt: string };
}

export interface RawLesson {
  _id?: Types.ObjectId | { $oid: string };
  title: string;
  description: string;
  documents: RawDocument[];
  videos: RawVideo[];
  order?: number | { $numberInt: string };
}

export interface RawDocument {
  _id?: Types.ObjectId | { $oid: string };
  fileName: string;
}

export interface RawVideo {
  _id?: Types.ObjectId | { $oid: string };
  fileName: string;
}

export interface RawTutor {
  _id?: Types.ObjectId | { $oid: string } | string;
  name: string;
  email: string;
  designation?: string;
  about?: string;
  avatar?: string;
}

export interface RawCategory {
  _id?: Types.ObjectId | { $oid: string };
  name: string;
  description: string;
}
