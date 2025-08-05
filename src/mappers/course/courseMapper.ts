import { ICourse } from "../../interfaces/course/courseInterface";
import {
  CreateCourseDto,
  ChapterDto,
  LessonDto,
  FileDto,
} from "../../dto/course/CourseDTO";

export class CourseMapper {
  static toEntity(rawCourse: any): ICourse {
    return {
      _id: rawCourse._id,
      title: rawCourse.title,
      description: rawCourse.description,
      benefits: rawCourse.benefits,
      requirements: rawCourse.requirements,
      categoryId: rawCourse.categoryId,
      price: rawCourse.price,
      thumbnailImage: rawCourse.thumbnailImage,
      chapters: rawCourse.chapters,
      tutorId: rawCourse.tutorId,
      isPublished: rawCourse.isPublished,
      isListed: rawCourse.isListed,
      enrollmentCount: rawCourse.enrollmentCount,
      createdAt: rawCourse.createdAt,
      updatedAt: rawCourse.updatedAt,
    };
  }

  static fromCreateDto(dto: CreateCourseDto): Partial<ICourse> {
    return {
      title: dto.title,
      description: dto.description,
      benefits: dto.benefits,
      requirements: dto.requirements,
      categoryId: dto.category as any,
      price: dto.price,
      chapters: dto.chapters as any,
      tutorId: dto.tutorId as any,
      isPublished: false,
      isListed: true,
      enrollmentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static toResponseDto(course: ICourse) {
    return {
      id: course._id,
      title: course.title,
      description: course.description,
      benefits: course.benefits,
      requirements: course.requirements,
      categoryId: course.categoryId,
      price: course.price,
      thumbnailImage: course.thumbnailImage,
      chapters: course.chapters,
      tutorId: course.tutorId,
      isPublished: course.isPublished,
      isListed: course.isListed,
      enrollmentCount: course.enrollmentCount,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  static toResponseDtoArr(courses: ICourse[]) {
    return courses.map((course) => this.toResponseDto(course));
  }

  static processChapters(chapters: ChapterDto[]): any[] {
    return chapters.map((chapter) => ({
      title: chapter.title,
      description: chapter.description,
      lessons: (chapter.lessons || []).map((lesson: LessonDto) => ({
        title: lesson.title,
        description: lesson.description,
        documents: lesson.documents || [],
        videos: lesson.videos || [],
        order: lesson.order,
      })),

      order: chapter.order,
    }));
  }

  static mapFileDto(
    fileName: string,
    originalName?: string
  ): { fileName: string; originalName?: string } {
    return {
      fileName,
      originalName,
    };
  }

  static mapFileDtoFromExisting(fileDto: FileDto): {
    fileName: string;
    originalName?: string;
  } {
    return {
      fileName: fileDto.name,
      originalName: fileDto.name,
    };
  }

  static mapProcessedChapter(
    chapter: ChapterDto,
    processedLessons: any[]
  ): any {
    return {
      title: chapter.title,
      description: chapter.description,
      lessons: processedLessons,
      order: chapter.order,
    };
  }

  static mapProcessedLesson(
    lesson: LessonDto,
    processedDocuments: { fileName: string }[],
    processedVideos: { fileName: string }[]
  ): any {
    return {
      title: lesson.title,
      description: lesson.description,
      documents: processedDocuments,
      videos: processedVideos,
      order: lesson.order,
    };
  }
}
