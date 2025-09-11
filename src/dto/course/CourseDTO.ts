export interface TutorDetailsDto {
  _id: string;
  name: string;
  email: string;
  designation: string;
  about: string;
  avatar?: string;
}

export interface CategoryDetailsDto {
  _id: string;
  name: string;
  description: string;
}

export interface DocumentFileDto {
  _id: string;
  fileName: string;
  signedUrl: string;
  originalName: string;
}

export interface VideoFileDto {
  _id: string;
  fileName: string;
  signedUrl: string;
  originalName: string;
}

export interface LessonDetailsDto {
  _id: string;
  title: string;
  description: string;
  documents: DocumentFileDto[];
  videos: VideoFileDto[];
  order: number;
}

export interface ChapterDetailsDto {
  _id: string;
  title: string;
  description: string;
  lessons: LessonDetailsDto[];
  order: number;
}

export interface CourseDetailsDto {
  _id: string;
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  category: CategoryDetailsDto;
  tutor: TutorDetailsDto;
  price: number;
  thumbnailImage: string;
  chapters: ChapterDetailsDto[];
  isPublished: boolean;
  isListed: boolean;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileDto {
  id: number;
  name: string;
  size: number;
  type: string;
  file?: File; 
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
  documents: DocumentFileDto[]; 
  videos: VideoFileDto[]; 
}

export type DocumentFile = DocumentFileDto;
export type VideoFile = VideoFileDto;

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
  isPublished: boolean; 
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
  isPublished: boolean; 
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

export interface CourseListingDto {
  courseId: string;
  courseName: string;
  courseCategory: string;
  tutorName: string;
  isListed: boolean;
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

export interface EditCourseDto {
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  category: string;
  price: number;
  chapters: ChapterDto[];
  thumbnailImage?: {
    file?: File;
    preview?: string;
    isExisting?: boolean;
  };
}

export interface UpdateCourseDto extends CreateCourseDto {
  thumbnailUrl?: string;
}

export interface CourseFilterDto {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

export interface PaginationDto {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

export interface PaginatedCoursesDto<T> {
  courses: T[];
  pagination: PaginationDto;
}


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