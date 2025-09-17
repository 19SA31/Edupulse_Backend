import { CategoryDTOArr } from "../../dto/course/CategoryDTO";
import { CategoryMapper } from "../../mappers/course/categoryMapper";
import { CourseMapper } from "../../mappers/course/courseMapper";
import { ICourseService } from "../../interfaces/course/ICourseService";
import { ICourseRepoInterface } from "../../interfaces/course/ICourseRepoInterface";
import { IEnrollmentService } from "../../interfaces/enrollment/IEnrollmentService";
import { Course } from "../../interfaces/course/courseInterface";
import {
  CourseForReview,
  CreateCourseDto,
  ChapterDto,
  PublishedCourseDto,
  CourseRejectDto,
  CourseListingDto,
  ListedCourseDTO,
  CourseDetailsDto,
  EditCourseDto,
} from "../../dto/course/CourseDTO";
import { ListedCategoryDTO } from "../../dto/course/CategoryDTO";
import { S3Service } from "../../utils/s3";
import { ObjectId } from "mongoose";

export class CourseService implements ICourseService {
  private _courseRepo: ICourseRepoInterface;
  private _s3Service: S3Service;
  private _enrollmentService: IEnrollmentService;

  constructor(
    courseRepo: ICourseRepoInterface,
    s3Service: S3Service,
    enrollmentService: IEnrollmentService
  ) {
    this._courseRepo = courseRepo;
    this._s3Service = s3Service;
    this._enrollmentService = enrollmentService;
  }

  async getAllCategories(): Promise<CategoryDTOArr> {
    const rawCategories = await this._courseRepo.getCategories();
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

      const courseData: Partial<Course> = {
        title: courseDto.title,
        description: courseDto.description,
        benefits: courseDto.benefits,
        requirements: courseDto.requirements,
        categoryId: courseDto.category as string,
        price: courseDto.price,
        thumbnailImage: thumbnailUrl,
        chapters: processedChapters,
        tutorId: courseDto.tutorId as string,
        isListed: false,
        enrollmentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdCourse = await this._courseRepo.createCourse(courseData);
      return CourseMapper.toEntity(createdCourse);
    } catch (error: unknown) {
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

  async getAllCourses(): Promise<ListedCourseDTO[]> {
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

      return CourseMapper.toListedCourseDTOArray(courses);
    } catch (error) {
      throw new Error(`Failed to fetch listed courses: ${error}`);
    }
  }

  async getAllListedCourses(
    filters: {
      search?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: string;
      page?: number;
      limit?: number;
    },
    userId?: string
  ): Promise<ListedCourseDTO[]> {
    try {
      let userEnrolledCourseIds: string[] = [];
      if (userId) {
        const enrolledCourses =
          await this._enrollmentService.getEnrolledCourses(userId);
        if (enrolledCourses) {
          userEnrolledCourseIds = enrolledCourses.map(
            (course) => course.courseId
          );
        }
      }

      let filterConditions: any = {};

      if (userEnrolledCourseIds.length > 0) {
        filterConditions.$or = [
          { isListed: true },
          { _id: { $in: userEnrolledCourseIds } },
        ];
      } else {
        filterConditions.isListed = true;
      }

      if (filters.category && filters.category !== "All classes") {
        filterConditions.categoryName = filters.category;
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        filterConditions.price = {};
        if (filters.minPrice !== undefined) {
          filterConditions.price.$gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          filterConditions.price.$lte = filters.maxPrice;
        }
      }

      if (filters.search) {
        const searchConditions = {
          $or: [
            { title: { $regex: filters.search, $options: "i" } },
            { description: { $regex: filters.search, $options: "i" } },
          ],
        };

        if (Object.keys(filterConditions).length > 0) {
          filterConditions = {
            $and: [filterConditions, searchConditions],
          };
        } else {
          filterConditions = searchConditions;
        }
      }

      let sortOptions: any = {};
      switch (filters.sortBy) {
        case "price_asc":
          sortOptions = { price: 1 };
          break;
        case "price_desc":
          sortOptions = { price: -1 };
          break;
        case "title_asc":
          sortOptions = { title: 1 };
          break;
        case "title_desc":
          sortOptions = { title: -1 };
          break;
        case "category_asc":
          sortOptions = { "categoryId.name": 1 };
          break;
        case "category_desc":
          sortOptions = { "categoryId.name": -1 };
          break;
        case "newest":
          sortOptions = { createdAt: -1 };
          break;
        case "oldest":
          sortOptions = { createdAt: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      const page = filters.page || 1;
      const limit = filters.limit || 50;

      const courses = await this._courseRepo.findAllListedCoursesWithFilters(
        filterConditions,
        sortOptions,
        page,
        limit
      );

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
          }
        })
      );

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

  async getCourseDetails(id: string): Promise<CourseDetailsDto> {
    try {
      const course = await this._courseRepo.getCourseDetails(id);

      return await CourseMapper.toCourseDetailsDto(course, this._s3Service);
    } catch (error) {
      console.error("Error in CourseService getCourseDetails:", error);
      throw new Error(`Failed to fetch course details: ${error}`);
    }
  }

  async getTutorCourses(
    id: string,
    page: number = 1,
    limit: number = 10,
    search: string = ""
  ): Promise<{
    courses: CourseDetailsDto[];
    total: number;
    totalPages: number;
  }> {
    try {
      const { courses: tutorCourses, total } =
        await this._courseRepo.getTutorCourses(id, page, limit, search);

      const courseDtos = await Promise.all(
        tutorCourses.map((course) =>
          CourseMapper.toCourseDetailsDto(course, this._s3Service)
        )
      );

      return {
        courses: courseDtos,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error in fetching tutor courses:", error);
      throw new Error(`Failed to fetch tutor courses: ${error}`);
    }
  }

  async editCourse(
    courseId: string,
    courseDto: EditCourseDto,
    files: { [fieldname: string]: Express.Multer.File[] },
    thumbnailFile?: Express.Multer.File,
    existingThumbnailUrl?: string
  ): Promise<Course> {
    try {
      const existingCourse = await this._courseRepo.getCourseDetails(courseId);
      if (!existingCourse) {
        throw new Error("Course not found");
      }

      let thumbnailUrl = existingCourse.thumbnailImage;
      const filesToDelete: string[] = [];

      if (thumbnailFile) {
        if (thumbnailUrl) {
          const oldThumbnail = this.extractS3FileName(thumbnailUrl);
          filesToDelete.push(oldThumbnail);
        }

        const folderPath = `courses/thumbnails`;
        thumbnailUrl = await this._s3Service.uploadFile(
          folderPath,
          thumbnailFile
        );
      } else if (existingThumbnailUrl && !thumbnailFile) {
        thumbnailUrl = this.extractS3FileName(existingThumbnailUrl);
      }

      const { processedChapters, filesToCleanup } =
        await this.editProcessChaptersWithFiles(
          courseDto.chapters,
          files,
          existingCourse.chapters
        );

      filesToDelete.push(...filesToCleanup);

      const courseData: Partial<Course> = {
        title: courseDto.title,
        description: courseDto.description,
        benefits: courseDto.benefits,
        requirements: courseDto.requirements,
        categoryId: courseDto.category as any,
        price: courseDto.price,
        thumbnailImage: thumbnailUrl,
        chapters: processedChapters,
        updatedAt: new Date(),
      };

      const updatedCourse = await this._courseRepo.updateCourse(
        courseId,
        courseData
      );

      await this.cleanupFiles(filesToDelete);

      return CourseMapper.toEntity(updatedCourse);
    } catch (error: any) {
      console.error("Error in CourseService.editCourse:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to edit course: ${errorMessage}`);
    }
  }

  private async editProcessChaptersWithFiles(
    chapters: ChapterDto[],
    files: { [fieldname: string]: Express.Multer.File[] },
    existingChapters: any[] = []
  ): Promise<{ processedChapters: any[]; filesToCleanup: string[] }> {
    const processedChapters = [];
    const filesToCleanup: string[] = [];

    for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
      const chapter = chapters[chapterIndex];
      const processedLessons = [];

      const lessons = chapter.lessons || [];
      const existingChapter = existingChapters[chapterIndex];

      for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
        const lesson = lessons[lessonIndex];
        const existingLesson = existingChapter?.lessons?.[lessonIndex];

        const { processedDocuments, filesToDelete: docFilesToDelete } =
          await this.processDocumentsForEdit(
            lesson.documents || [],
            files,
            chapterIndex,
            lessonIndex,
            existingLesson?.documents || []
          );

        const { processedVideos, filesToDelete: videoFilesToDelete } =
          await this.processVideosForEdit(
            lesson.videos || [],
            files,
            chapterIndex,
            lessonIndex,
            existingLesson?.videos || []
          );

        filesToCleanup.push(...docFilesToDelete, ...videoFilesToDelete);

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

    return { processedChapters, filesToCleanup };
  }

  private async processDocumentsForEdit(
    documents: any[],
    files: { [fieldname: string]: Express.Multer.File[] },
    chapterIndex: number,
    lessonIndex: number,
    existingDocuments: any[] = []
  ): Promise<{ processedDocuments: any[]; filesToDelete: string[] }> {
    const processedDocuments = [];
    const filesToDelete: string[] = [];

    for (let docIndex = 0; docIndex < documents.length; docIndex++) {
      const doc = documents[docIndex];
      const existingDoc = existingDocuments[docIndex];

      const fieldName = `lesson_documents_${chapterIndex}_${lessonIndex}_${docIndex}`;
      const fileArray = files[fieldName];

      if (fileArray && fileArray.length > 0) {
        if (existingDoc?.fileName) {
          const oldFileName = this.extractS3FileName(existingDoc.fileName);
          filesToDelete.push(oldFileName);
        }

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
          throw new Error(`Failed to upload document: ${file.originalname}`);
        }
      } else if (existingDoc) {
        const fileName = this.extractS3FileName(existingDoc.fileName);
        processedDocuments.push({ fileName });
      }
    }

    return { processedDocuments, filesToDelete };
  }

  private async processVideosForEdit(
    videos: any[],
    files: { [fieldname: string]: Express.Multer.File[] },
    chapterIndex: number,
    lessonIndex: number,
    existingVideos: any[] = []
  ): Promise<{ processedVideos: any[]; filesToDelete: string[] }> {
    const processedVideos = [];
    const filesToDelete: string[] = [];

    for (let videoIndex = 0; videoIndex < videos.length; videoIndex++) {
      const video = videos[videoIndex];
      const existingVideo = existingVideos[videoIndex];

      const fieldName = `lesson_videos_${chapterIndex}_${lessonIndex}_${videoIndex}`;
      const fileArray = files[fieldName];

      if (fileArray && fileArray.length > 0) {
        if (existingVideo?.fileName) {
          const oldFileName = this.extractS3FileName(existingVideo.fileName);
          filesToDelete.push(oldFileName);
        }

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
      } else if (existingVideo) {
        const fileName = this.extractS3FileName(existingVideo.fileName);
        processedVideos.push({ fileName });
      }
    }

    return { processedVideos, filesToDelete };
  }

  private extractS3FileName(filePathOrUrl: string): string {
    if (!filePathOrUrl.includes("://")) {
      return filePathOrUrl;
    }

    try {
      const url = new URL(filePathOrUrl);
      const pathname = url.pathname.substring(1);
      const cleanPath = pathname.split("?")[0];
      return decodeURIComponent(cleanPath);
    } catch (error) {
      console.warn("Failed to parse URL, returning as is:", filePathOrUrl);
      return filePathOrUrl;
    }
  }

  private async cleanupFiles(fileKeys: string[]): Promise<void> {
    for (const fileKey of fileKeys) {
      if (fileKey) {
        try {
          await this._s3Service.deleteFile(fileKey);
        } catch (error) {
          console.warn(`Failed to delete file ${fileKey}:`, error);
        }
      }
    }
  }
}
