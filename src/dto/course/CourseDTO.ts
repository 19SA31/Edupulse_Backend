
export interface FileDto {
  id: number;
  name: string;
  size: number;
  type: string;
  file?: any;
  preview?: string | null;
  fileName?: string;
}

export interface LessonDto {
  id: number;
  title: string;
  description: string;
  documents?: FileDto[]; 
  videos?: FileDto[];    
  order?: number;
}

export interface ChapterDto {
  id: number;
  title: string;
  description: string;
  lessons?: LessonDto[]; 
  order?: number;
}

export interface CreateCourseDto {
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  category: string;
  price: number;
  chapters: ChapterDto[];
  tutorId: string;
}
export interface CourseForReview {
  _id: string;
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  categoryId: {
    name: string;
  };
  price: number;
  thumbnailImage: string;
  tutorId: {
    name: string;
  };
  isPublished: boolean;
  isListed: boolean;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
  chapters: ChapterForReview[];
}

export interface ChapterForReview {
  title: string;
  description: string;
  lessons: LessonForReview[];
}

export interface LessonForReview {
  title: string;
  description: string;
  documents: any[];
  videos: any[];
}

export interface DocumentFile {
  _id: string;
  fileName: string;
  signedUrl: string;
  originalName: string;
}

export interface VideoFile {
  _id: string;
  fileName: string;
  signedUrl: string;
  originalName: string;
}

export interface PublishedCourseDto {
  _id: string;
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  categoryId: string;
  price: number;
  thumbnailImage: string;
  tutorId: string;
  isPublished: string;
  isListed: boolean;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RejectedCourseDto {
  _id: string;
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  categoryId: string;
  price: number;
  thumbnailImage: string;
  tutorId: string;
  isPublished: string;
  isListed: boolean;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TutorBasicDto {
  _id: string;
  name: string;
  email: string;
}

export interface CourseRejectDto {
  course: RejectedCourseDto;
  tutor: TutorBasicDto;
}


export interface CourseListingDto{
  courseId:string;
  courseName:string;
  courseCategory:string;
  tutorName:string;
  isListed:boolean
}

export interface ListedCourseDTO {
  courseId: string;
  title: string;
  description: string;
  price: number;
  thumbnailImage: string;
  categoryName: string;
  tutorName: string;
  enrollmentCount: number;
}