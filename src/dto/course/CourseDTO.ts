
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