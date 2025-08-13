import { CategoryDTOArr } from "../../dto/course/CategoryDTO";
import { CategoryMapper } from "../../mappers/course/categoryMapper";
import { CourseMapper } from "../../mappers/course/courseMapper";
import { ICourseService } from "../../interfaces/course/courseServiceInterface";
import { ICourseRepoInterface } from "../../interfaces/course/courseRepoInterface";
import { Course } from "../../interfaces/course/courseInterface";
import {
  CourseForReview,
  CreateCourseDto,
  ChapterDto,
  PublishedCourseDto,
  CourseRejectDto,
  CourseListingDto,
  ListedCourseDTO,
} from "../../dto/course/CourseDTO";
import { ListedCategoryDTO } from "../../dto/course/CategoryDTO";
import { S3Service } from "../../utils/s3";

export class CourseService implements ICourseService {
  private _courseRepo: ICourseRepoInterface;
  private _s3Service: S3Service;

  constructor(courseRepo: ICourseRepoInterface, s3Service: S3Service) {
    this._courseRepo = courseRepo;
    this._s3Service = s3Service;
  }

  async getAllCategories(): Promise<CategoryDTOArr> {
    const rawCategories = await this._courseRepo.getCategories();
    console.log("servvv", rawCategories);
    return CategoryMapper.toDTOArr(rawCategories);
  }

  async createCourse(
    courseDto: CreateCourseDto,
    files: { [fieldname: string]: Express.Multer.File[] },
    thumbnailFile?: Express.Multer.File
  ): Promise<Course> {
    try {
      let thumbnailUrl = "";
      if (thumbnailFile) {
        const folderPath = `courses/thumbnails`;
        thumbnailUrl = await this._s3Service.uploadFile(
          folderPath,
          thumbnailFile
        );
      }

      const processedChapters = await this.processChaptersWithFiles(
        courseDto.chapters,
        files
      );
      console.log("processed chapters", processedChapters);

      const courseData: Partial<Course> = {
        title: courseDto.title,
        description: courseDto.description,
        benefits: courseDto.benefits,
        requirements: courseDto.requirements,
        categoryId: courseDto.category as any,
        price: courseDto.price,
        thumbnailImage: thumbnailUrl,
        chapters: processedChapters,
        tutorId: courseDto.tutorId as any,
        isListed: true,
        enrollmentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdCourse = await this._courseRepo.createCourse(courseData);
      console.log("createdCourse service:", createdCourse);
      return CourseMapper.toEntity(createdCourse);
    } catch (error: any) {
      console.error("Error in CourseService.createCourse:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to create course: ${errorMessage}`);
    }
  }

  private async processChaptersWithFiles(
    chapters: ChapterDto[],
    files: { [fieldname: string]: Express.Multer.File[] }
  ): Promise<any[]> {
    const processedChapters = [];

    for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
      const chapter = chapters[chapterIndex];
      const processedLessons = [];

      const lessons = chapter.lessons || [];

      for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
        const lesson = lessons[lessonIndex];

        const processedDocuments = [];
        if (lesson.documents && Array.isArray(lesson.documents)) {
          for (
            let docIndex = 0;
            docIndex < lesson.documents.length;
            docIndex++
          ) {
            const fieldName = `lesson_documents_${chapterIndex}_${lessonIndex}_${docIndex}`;
            const fileArray = files[fieldName];

            if (fileArray && fileArray.length > 0) {
              const file = fileArray[0];
              try {
                const fileName = await this._s3Service.uploadFile(
                  `courses/documents/chapter_${chapterIndex}/lesson_${lessonIndex}`,
                  file
                );
                processedDocuments.push({ fileName });
              } catch (uploadError) {
                console.error(
                  `Error uploading document ${file.originalname}:`,
                  uploadError
                );
                throw new Error(
                  `Failed to upload document: ${file.originalname}`
                );
              }
            }
          }
        }

        const processedVideos = [];
        if (lesson.videos && Array.isArray(lesson.videos)) {
          for (
            let videoIndex = 0;
            videoIndex < lesson.videos.length;
            videoIndex++
          ) {
            const fieldName = `lesson_videos_${chapterIndex}_${lessonIndex}_${videoIndex}`;
            const fileArray = files[fieldName];

            if (fileArray && fileArray.length > 0) {
              const file = fileArray[0];
              try {
                const fileName = await this._s3Service.uploadFile(
                  `courses/videos/chapter_${chapterIndex}/lesson_${lessonIndex}`,
                  file
                );
                processedVideos.push({ fileName });
              } catch (uploadError) {
                console.error(
                  `Error uploading video ${file.originalname}:`,
                  uploadError
                );
                throw new Error(`Failed to upload video: ${file.originalname}`);
              }
            }
          }
        }

        processedLessons.push({
          title: lesson.title,
          description: lesson.description,
          documents: processedDocuments,
          videos: processedVideos,
          order: lesson.order || lessonIndex,
        });
      }

      processedChapters.push({
        title: chapter.title,
        description: chapter.description,
        lessons: processedLessons,
        order: chapter.order || chapterIndex,
      });
    }

    return processedChapters;
  }

  private async safeDeleteFile(fileKey: string): Promise<void> {
    try {
      await this._s3Service.deleteFile(fileKey);
      console.log("File deleted from S3:", fileKey);
    } catch (deleteError) {
      console.warn("Failed to delete file:", deleteError);
    }
  }

  async getUnpublishedCourses(
    skip: number,
    limit: number,
    search?: string
  ): Promise<{
    courses: CourseForReview[];
    totalPages: number;
    totalCount: number;
  }> {
    const { courses, totalCount } = await this._courseRepo.unpublishedCourses(
      skip,
      limit,
      search
    );

    console.log("unpublished courses", courses);

    const mappedCourses = await CourseMapper.toCourseDtoForReview(
      courses,
      this._s3Service
    );

    const totalPages = Math.ceil(totalCount / limit);

    return {
      courses: mappedCourses,
      totalPages,
      totalCount,
    };
  }
  async publishCourse(courseId: string): Promise<PublishedCourseDto> {
    try {
      const publishedCourse = await this._courseRepo.publishCourse(courseId);

      return CourseMapper.toPublishedCourseDto(publishedCourse);
    } catch (error: unknown) {
      console.error("Error in Course publish service:", error);
      throw error;
    }
  }

  async rejectCourse(courseId: string): Promise<CourseRejectDto> {
    try {
      const { course, tutor } = await this._courseRepo.rejectCourse(courseId);
      console.log("reject service", course, tutor);
      return CourseMapper.toCourseRejectDto(course, tutor);
    } catch (error: unknown) {
      console.error("Error in Course reject service:", error);
      throw error;
    }
  }

  async getPublishedCoursesForListing(
    skip: number,
    limit: number,
    search: any
  ): Promise<{
    courses: CourseListingDto[];
    totalPages: number;
    totalCount: number;
  }> {
    try {
      const result = await this._courseRepo.getPublishedCoursesWithDetails(
        skip,
        limit,
        search
      );
      console.log("...", result);
      const courseDtos = CourseMapper.toDTOArray(result.courses);

      return {
        courses: courseDtos,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    } catch (error: any) {
      console.error(
        "Error in CourseService getPublishedCoursesForListing:",
        error.message
      );
      throw error;
    }
  }

  async listUnlistCourseService(id: string): Promise<void> {
    try {
      await this._courseRepo.listUnlistCourse(id);
    } catch (error: any) {
      console.error("Error in AdminService listUnlistUser:", error.message);
      throw error;
    }
  }

  async getAllListedCourses(): Promise<ListedCourseDTO[]> {
    try {
      const courses = await this._courseRepo.findAllListedCourses();

      await Promise.all(
        courses.map(async (course) => {
          try {
            if (course.thumbnailImage) {
              course.thumbnailImage = await this._s3Service.getFile(
                course.thumbnailImage
              );
            }
          } catch (error) {
            console.error(
              `Error getting signed URL for course ${course._id}:`,
              error
            );
            course.thumbnailImage = course.thumbnailImage;
          }
        })
      );

      console.log("courses with updated thumbnailImage", courses);

      return CourseMapper.toListedCourseDTOArray(courses);
    } catch (error) {
      throw new Error(`Failed to fetch listed courses: ${error}`);
    }
  }

  async getAllListedCategories(): Promise<ListedCategoryDTO[]> {
    try {
      const categories = await this._courseRepo.findAllListedCategories();
      return CategoryMapper.toListedCategoryDTOArray(categories);
    } catch (error) {
      throw new Error(`Failed to fetch listed categories: ${error}`);
    }
  }
}
