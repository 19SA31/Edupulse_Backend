import { Course } from "../../interfaces/course/courseInterface";
import {
  CourseForReview,
  ChapterForReview,
  LessonForReview,
  DocumentFile,
  VideoFile,
} from "../../dto/course/CourseDTO";
import { S3Service } from "../../utils/s3";

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
}
