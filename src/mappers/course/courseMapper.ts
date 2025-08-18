import { Course } from "../../interfaces/course/courseInterface";
import {
  CourseForReview,
  ChapterForReview,
  LessonForReview,
  DocumentFile,
  VideoFile,
  RejectedCourseDto,
  TutorBasicDto,
  CourseRejectDto,
  PublishedCourseDto,
  CourseListingDto,
  ListedCourseDTO,
  VideoFileDto,
  CourseDetailsDto,
  CategoryDetailsDto,
  TutorDetailsDto,
  ChapterDetailsDto,
  LessonDetailsDto,
  DocumentFileDto,
} from "../../dto/course/CourseDTO";
import { S3Service } from "../../utils/s3";
import {
  Category,
  Tutor,
} from "../../interfaces/adminInterface/adminInterface";

export class CourseMapper {
  static toEntity(rawCourse: any): Course {
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

  static async toCourseDtoForReview(
    rawCourses: any[],
    s3Service: S3Service
  ): Promise<CourseForReview[]> {
    const courses = await Promise.all(
      rawCourses.map(async (course) => ({
        _id: course._id?.$oid || course._id,
        title: course.title,
        description: course.description,
        benefits: course.benefits,
        requirements: course.requirements,
        categoryId: {
          name: course.categoryId?.name || "Unknown Category",
        },
        price: course.price?.$numberInt
          ? parseInt(course.price.$numberInt)
          : course.price,
        thumbnailImage: course.thumbnailImage
          ? await s3Service.getFile(course.thumbnailImage)
          : "",
        tutorId: {
          name: course.tutorId?.name || "Unknown Tutor",
        },
        isPublished: course.isPublished,
        isListed: course.isListed,
        enrollmentCount: course.enrollmentCount?.$numberInt
          ? parseInt(course.enrollmentCount.$numberInt)
          : course.enrollmentCount,
        createdAt: course.createdAt?.$date
          ? new Date(
              course.createdAt.$date.$numberLong
                ? parseInt(course.createdAt.$date.$numberLong)
                : course.createdAt.$date
            )
          : course.createdAt,
        updatedAt: course.updatedAt?.$date
          ? new Date(
              course.updatedAt.$date.$numberLong
                ? parseInt(course.updatedAt.$date.$numberLong)
                : course.updatedAt.$date
            )
          : course.updatedAt,
        chapters: await this.mapChaptersForReview(
          course.chapters || [],
          s3Service
        ),
      }))
    );

    return courses;
  }

  private static async mapChaptersForReview(
    chapters: any[],
    s3Service: S3Service
  ): Promise<ChapterForReview[]> {
    return await Promise.all(
      chapters.map(async (chapter) => ({
        title: chapter.title,
        description: chapter.description,
        lessons: await this.mapLessonsForReview(
          chapter.lessons || [],
          s3Service
        ),
      }))
    );
  }

  private static async mapLessonsForReview(
    lessons: any[],
    s3Service: S3Service
  ): Promise<LessonForReview[]> {
    return await Promise.all(
      lessons.map(async (lesson) => ({
        title: lesson.title,
        description: lesson.description,
        documents: await this.mapDocumentsWithSignedUrls(
          lesson.documents || [],
          s3Service
        ),
        videos: await this.mapVideosWithSignedUrls(
          lesson.videos || [],
          s3Service
        ),
      }))
    );
  }

  private static async mapDocumentsWithSignedUrls(
    documents: any[],
    s3Service: S3Service
  ): Promise<DocumentFile[]> {
    return await Promise.all(
      documents.map(async (doc, index) => {
        const signedUrl = await s3Service.getFile(doc.fileName);
        const originalName = s3Service.extractFileName(doc.fileName);

        return {
          _id: doc._id?.$oid || doc._id || `doc-${index}`,
          fileName: doc.fileName,
          signedUrl,
          originalName,
        };
      })
    );
  }

  private static async mapVideosWithSignedUrls(
    videos: any[],
    s3Service: S3Service
  ): Promise<VideoFile[]> {
    return await Promise.all(
      videos.map(async (video, index) => {
        const signedUrl = await s3Service.getFile(video.fileName);
        const originalName = s3Service.extractFileName(video.fileName);

        return {
          _id: video._id?.$oid || video._id || `video-${index}`,
          fileName: video.fileName,
          signedUrl,
          originalName,
        };
      })
    );
  }

  static toPublishedCourseDto(course: Course): PublishedCourseDto {
    return {
      _id: course._id?.toString() || "",
      title: course.title,
      description: course.description,
      benefits: course.benefits,
      requirements: course.requirements,
      categoryId: course.categoryId?.toString() || "",
      price: course.price,
      thumbnailImage: course.thumbnailImage || "",
      tutorId: course.tutorId?.toString() || "",
      isPublished: course.isPublished,
      isListed: course.isListed,
      enrollmentCount: course.enrollmentCount,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  static toRejectedCourseDto(course: Course): RejectedCourseDto {
    return {
      _id: course._id?.toString() || "",
      title: course.title,
      description: course.description,
      benefits: course.benefits,
      requirements: course.requirements,
      categoryId: course.categoryId?.toString() || "",
      price: course.price,
      thumbnailImage: course.thumbnailImage || "",
      tutorId: course.tutorId?.toString() || "",
      isPublished: course.isPublished,
      isListed: course.isListed,
      enrollmentCount: course.enrollmentCount,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  static toTutorBasicDto(tutor: any): TutorBasicDto {
    return {
      _id: tutor._id?.toString() || "",
      name: tutor.name || "",
      email: tutor.email || "",
    };
  }

  static toCourseRejectDto(course: Course, tutor: any): CourseRejectDto {
    return {
      course: this.toRejectedCourseDto(course),
      tutor: this.toTutorBasicDto(tutor),
    };
  }

  static toDTO(course: any): CourseListingDto {
    return {
      courseId: course._id.toString(),
      courseName: course.title,
      courseCategory: course.categoryId?.name || "Unknown",
      tutorName: course.tutorId?.name || "Unknown",
      isListed: course.isListed,
    };
  }

  static toDTOArray(courses: any[]): CourseListingDto[] {
    return courses.map((course) => this.toDTO(course));
  }

  static toListedCourseDTO(course: any): ListedCourseDTO {
    return {
      courseId: course._id?.toString() || "",
      title: course.title || "",
      description: course.description || "",
      price: course.price?.$numberInt
        ? parseInt(course.price.$numberInt)
        : course.price || 0,
      thumbnailImage: course.thumbnailImage || "",
      categoryName: course.categoryId?.name || "Unknown Category",
      tutorName: course.tutorId?.name || "Unknown Tutor",
      enrollmentCount: course.enrollmentCount?.$numberInt
        ? parseInt(course.enrollmentCount.$numberInt)
        : course.enrollmentCount || 0,
    };
  }

  static toListedCourseDTOArray(courses: any[]): ListedCourseDTO[] {
    return courses.map((course) => this.toListedCourseDTO(course));
  }

  static async toCourseDetailsDto(
    course: any, 
    s3Service: S3Service
  ): Promise<CourseDetailsDto> {
    return {
      _id: course._id?.$oid || course._id?.toString() || "",
      title: course.title || "",
      description: course.description || "",
      benefits: course.benefits || "",
      requirements: course.requirements || "",
      category: this.mapCategoryDetails(course.categoryId),
      tutor: await this.mapTutorDetails(course.tutorId, s3Service),
      price: course.price?.$numberInt
        ? parseInt(course.price.$numberInt)
        : course.price || 0,
      thumbnailImage: course.thumbnailImage
        ? await s3Service.getFile(course.thumbnailImage)
        : "",
      chapters: await this.mapChaptersForDetails(
        course.chapters || [],
        s3Service
      ),
      isPublished:
        course.isPublished === "published" || course.isPublished === true,
      isListed: course.isListed || false,
      enrollmentCount: course.enrollmentCount?.$numberInt
        ? parseInt(course.enrollmentCount.$numberInt)
        : course.enrollmentCount || 0,
      createdAt: course.createdAt?.$date
        ? new Date(
            course.createdAt.$date.$numberLong
              ? parseInt(course.createdAt.$date.$numberLong)
              : course.createdAt.$date
          )
        : course.createdAt || new Date(),
      updatedAt: course.updatedAt?.$date
        ? new Date(
            course.updatedAt.$date.$numberLong
              ? parseInt(course.updatedAt.$date.$numberLong)
              : course.updatedAt.$date
          )
        : course.updatedAt || new Date(),
    };
  }

  private static mapCategoryDetails(category: any): CategoryDetailsDto {
    return {
      _id: category._id?.$oid || category._id?.toString() || "",
      name: category.name || "",
      description: category.description || "",
    };
  }

  private static async mapTutorDetails(
    tutor: any,
    s3Service: S3Service
  ): Promise<TutorDetailsDto> {
    let avatarUrl = "";
    if (tutor.avatar) {
      try {
        avatarUrl = await s3Service.getFile(tutor.avatar);
      } catch (error) {
        console.error("Error getting tutor avatar:", error);
        avatarUrl = "";
      }
    }

    return {
      _id: tutor._id?.$oid || tutor._id?.toString() || "",
      name: tutor.name || "",
      email: tutor.email || "",
      designation: tutor.designation || "",
      about: tutor.about || "",
      avatar: avatarUrl,
    };
  }

  private static async mapChaptersForDetails(
    chapters: any[],
    s3Service: S3Service
  ): Promise<ChapterDetailsDto[]> {
    return await Promise.all(
      chapters.map(async (chapter, index) => ({
        _id: chapter._id?.$oid || chapter._id?.toString() || `chapter-${index}`,
        title: chapter.title || "",
        description: chapter.description || "",
        lessons: await this.mapLessonsForDetails(
          chapter.lessons || [],
          s3Service
        ),
        order: chapter.order?.$numberInt
          ? parseInt(chapter.order.$numberInt)
          : chapter.order || index,
      }))
    );
  }

  private static async mapLessonsForDetails(
    lessons: any[],
    s3Service: S3Service
  ): Promise<LessonDetailsDto[]> {
    return await Promise.all(
      lessons.map(async (lesson, index) => ({
        _id: lesson._id?.$oid || lesson._id?.toString() || `lesson-${index}`,
        title: lesson.title || "",
        description: lesson.description || "",
        documents: await this.mapDocumentsForDetails(
          lesson.documents || [],
          s3Service
        ),
        videos: await this.mapVideosForDetails(lesson.videos || [], s3Service),
        order: lesson.order?.$numberInt
          ? parseInt(lesson.order.$numberInt)
          : lesson.order || index,
      }))
    );
  }

  private static async mapDocumentsForDetails(
    documents: any[],
    s3Service: S3Service
  ): Promise<DocumentFileDto[]> {
    return await Promise.all(
      documents.map(async (doc, index) => {
        const signedUrl = await s3Service.getFile(doc.fileName);
        const originalName = s3Service.extractFileName(doc.fileName);

        return {
          _id: doc._id?.$oid || doc._id?.toString() || `doc-${index}`,
          fileName: doc.fileName,
          signedUrl,
          originalName,
        };
      })
    );
  }

  private static async mapVideosForDetails(
    videos: any[],
    s3Service: S3Service
  ): Promise<VideoFileDto[]> {
    return await Promise.all(
      videos.map(async (video, index) => {
        const signedUrl = await s3Service.getFile(video.fileName);
        const originalName = s3Service.extractFileName(video.fileName);

        return {
          _id: video._id?.$oid || video._id?.toString() || `video-${index}`,
          fileName: video.fileName,
          signedUrl,
          originalName,
        };
      })
    );
  }
}
