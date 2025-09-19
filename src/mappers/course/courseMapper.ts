import {
  Course,
  IChapter,
  Ilesson,
  RawCourse,
  RawChapter,
  RawLesson,
  RawDocument,
  RawVideo,
  RawTutor,
  RawCategory,
} from "../../interfaces/course/courseInterface";
import { Tutor } from "../../interfaces/tutorInterface/tutorInterface";
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
import { Types } from "mongoose";

export class CourseMapper {
  static toEntity(rawCourse: RawCourse): Course {
    let categoryId: Types.ObjectId | string;
    if (
      typeof rawCourse.categoryId === "object" &&
      rawCourse.categoryId !== null &&
      "name" in rawCourse.categoryId
    ) {
      categoryId = new Types.ObjectId();
    } else {
      categoryId = rawCourse.categoryId as Types.ObjectId | string;
    }

    let tutorId: Types.ObjectId | string;
    if (
      typeof rawCourse.tutorId === "object" &&
      rawCourse.tutorId !== null &&
      "name" in rawCourse.tutorId
    ) {
      tutorId = new Types.ObjectId();
    } else {
      tutorId = rawCourse.tutorId as Types.ObjectId | string;
    }

    const chapters: IChapter[] = (rawCourse.chapters || []).map(
      (rawChapter): IChapter => ({
        title: rawChapter.title,
        description: rawChapter.description,
        lessons: rawChapter.lessons.map(
          (rawLesson): Ilesson => ({
            title: rawLesson.title,
            description: rawLesson.description,
            documents: rawLesson.documents.map((doc) => ({
              fileName: doc.fileName,
            })),
            videos: rawLesson.videos.map((video) => ({
              fileName: video.fileName,
            })),
            order: this.extractNumber(rawLesson.order),
          })
        ),
        order: this.extractNumber(rawChapter.order),
      })
    );

    return {
      _id: rawCourse._id instanceof Types.ObjectId ? rawCourse._id : undefined,
      title: rawCourse.title,
      description: rawCourse.description,
      benefits: rawCourse.benefits,
      requirements: rawCourse.requirements,
      categoryId: categoryId,
      price: this.extractNumber(rawCourse.price),
      thumbnailImage: rawCourse.thumbnailImage,
      chapters: chapters,
      tutorId: tutorId,
      isPublished: rawCourse.isPublished,
      isListed: rawCourse.isListed,
      enrollmentCount: this.extractNumber(rawCourse.enrollmentCount),
      createdAt: this.extractDate(rawCourse.createdAt),
      updatedAt: this.extractDate(rawCourse.updatedAt),
    };
  }

  static async toCourseDtoForReview(
    rawCourses: RawCourse[],
    s3Service: S3Service
  ): Promise<CourseForReview[]> {
    const courses = await Promise.all(
      rawCourses.map(async (course) => {
        const isPublished =
          typeof course.isPublished === "boolean"
            ? course.isPublished
            : course.isPublished === "published";

        return {
          _id: this.extractId(course._id),
          title: course.title,
          description: course.description,
          benefits: course.benefits,
          requirements: course.requirements,
          categoryId: {
            name: this.extractCategoryName(course.categoryId),
          },
          price: this.extractNumber(course.price),
          thumbnailImage: course.thumbnailImage
            ? await s3Service.getFile(course.thumbnailImage)
            : "",
          tutorId: {
            name: this.extractTutorName(course.tutorId),
          },
          isPublished: isPublished,
          isListed: course.isListed,
          enrollmentCount: this.extractNumber(course.enrollmentCount),
          createdAt: this.extractDate(course.createdAt),
          updatedAt: this.extractDate(course.updatedAt),
          chapters: await this.mapChaptersForReview(
            course.chapters || [],
            s3Service
          ),
        };
      })
    );

    return courses;
  }

  private static extractCategoryName(
    categoryId: Types.ObjectId | string | { name: string } | undefined
  ): string {
    if (
      typeof categoryId === "object" &&
      categoryId !== null &&
      "name" in categoryId
    ) {
      return categoryId.name;
    }
    return "Unknown Category";
  }

  private static extractTutorName(
    tutorId: Types.ObjectId | string | { name: string } | undefined
  ): string {
    if (typeof tutorId === "object" && tutorId !== null && "name" in tutorId) {
      return tutorId.name;
    }
    return "Unknown Tutor";
  }

  private static async mapChaptersForReview(
    chapters: RawChapter[],
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
    lessons: RawLesson[],
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
    documents: RawDocument[],
    s3Service: S3Service
  ): Promise<DocumentFile[]> {
    return await Promise.all(
      documents.map(async (doc, index) => {
        const signedUrl = await s3Service.getFile(doc.fileName);
        const originalName = s3Service.extractFileName(doc.fileName);

        return {
          _id: this.extractId(doc._id) || `doc-${index}`,
          fileName: doc.fileName,
          signedUrl,
          originalName,
        };
      })
    );
  }

  private static async mapVideosWithSignedUrls(
    videos: RawVideo[],
    s3Service: S3Service
  ): Promise<VideoFile[]> {
    return await Promise.all(
      videos.map(async (video, index) => {
        const signedUrl = await s3Service.getFile(video.fileName);
        const originalName = s3Service.extractFileName(video.fileName);

        return {
          _id: this.extractId(video._id) || `video-${index}`,
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
      isPublished: course.isPublished === "published",
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
      isPublished: course.isPublished === "published",
      isListed: course.isListed,
      enrollmentCount: course.enrollmentCount,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  static toTutorBasicDto(tutor: RawTutor): TutorBasicDto {
    return {
      _id: this.extractId(tutor._id),
      name: tutor.name || "",
      email: tutor.email || "",
    };
  }

  static toCourseRejectDto(course: Course, tutor: RawTutor): CourseRejectDto {
    return {
      course: this.toRejectedCourseDto(course),
      tutor: this.toTutorBasicDto(tutor),
    };
  }

  static toDTO(course: RawCourse): CourseListingDto {
    return {
      courseId: this.extractId(course._id),
      courseName: course.title,
      courseCategory: this.extractCategoryName(course.categoryId),
      tutorName: this.extractTutorName(course.tutorId),
      isListed: course.isListed,
    };
  }

  static toDTOArray(courses: RawCourse[]): CourseListingDto[] {
    return courses.map((course) => this.toDTO(course));
  }

  static toListedCourseDTO(course: RawCourse): ListedCourseDTO {
    return {
      courseId: this.extractId(course._id),
      title: course.title || "",
      description: course.description || "",
      price: this.extractNumber(course.price),
      thumbnailImage: course.thumbnailImage || "",
      categoryName: this.extractCategoryName(course.categoryId),
      tutorName: this.extractTutorName(course.tutorId),
      enrollmentCount: this.extractNumber(course.enrollmentCount),
    };
  }

  static toListedCourseDTOArray(courses: RawCourse[]): ListedCourseDTO[] {
    return courses.map((course) => this.toListedCourseDTO(course));
  }

  static async toCourseDetailsDto(
    course: RawCourse,
    s3Service: S3Service
  ): Promise<CourseDetailsDto> {
    const isPublished =
      typeof course.isPublished === "boolean"
        ? course.isPublished
        : course.isPublished === "published";

    return {
      _id: this.extractId(course._id),
      title: course.title || "",
      description: course.description || "",
      benefits: course.benefits || "",
      requirements: course.requirements || "",
      category: this.mapCategoryDetails(course.categoryId as RawCategory),
      tutor: await this.mapTutorDetails(course.tutorId as RawTutor, s3Service),
      price: this.extractNumber(course.price),
      thumbnailImage: course.thumbnailImage
        ? await s3Service.getFile(course.thumbnailImage)
        : "",
      chapters: await this.mapChaptersForDetails(
        course.chapters || [],
        s3Service
      ),
      isPublished: isPublished,
      isListed: course.isListed || false,
      enrollmentCount: this.extractNumber(course.enrollmentCount),
      createdAt: this.extractDate(course.createdAt),
      updatedAt: this.extractDate(course.updatedAt),
    };
  }

  private static mapCategoryDetails(category: RawCategory): CategoryDetailsDto {
    return {
      _id: this.extractId(category._id),
      name: category.name || "",
      description: category.description || "",
    };
  }

  private static async mapTutorDetails(
    tutor: RawTutor,
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
      _id: this.extractId(tutor._id),
      name: tutor.name || "",
      email: tutor.email || "",
      designation: tutor.designation || "",
      about: tutor.about || "",
      avatar: avatarUrl,
    };
  }

  private static async mapChaptersForDetails(
    chapters: RawChapter[],
    s3Service: S3Service
  ): Promise<ChapterDetailsDto[]> {
    return await Promise.all(
      chapters.map(async (chapter, index) => ({
        _id: this.extractId(chapter._id) || `chapter-${index}`,
        title: chapter.title || "",
        description: chapter.description || "",
        lessons: await this.mapLessonsForDetails(
          chapter.lessons || [],
          s3Service
        ),
        order: this.extractNumber(chapter.order) || index,
      }))
    );
  }

  private static async mapLessonsForDetails(
    lessons: RawLesson[],
    s3Service: S3Service
  ): Promise<LessonDetailsDto[]> {
    return await Promise.all(
      lessons.map(async (lesson, index) => ({
        _id: this.extractId(lesson._id) || `lesson-${index}`,
        title: lesson.title || "",
        description: lesson.description || "",
        documents: await this.mapDocumentsForDetails(
          lesson.documents || [],
          s3Service
        ),
        videos: await this.mapVideosForDetails(lesson.videos || [], s3Service),
        order: this.extractNumber(lesson.order) || index,
      }))
    );
  }

  private static async mapDocumentsForDetails(
    documents: RawDocument[],
    s3Service: S3Service
  ): Promise<DocumentFileDto[]> {
    return await Promise.all(
      documents.map(async (doc, index) => {
        const signedUrl = await s3Service.getFile(doc.fileName);
        const originalName = s3Service.extractFileName(doc.fileName);

        return {
          _id: this.extractId(doc._id) || `doc-${index}`,
          fileName: doc.fileName,
          signedUrl,
          originalName,
        };
      })
    );
  }

  private static async mapVideosForDetails(
    videos: RawVideo[],
    s3Service: S3Service
  ): Promise<VideoFileDto[]> {
    return await Promise.all(
      videos.map(async (video, index) => {
        const signedUrl = await s3Service.getFile(video.fileName);
        const originalName = s3Service.extractFileName(video.fileName);

        return {
          _id: this.extractId(video._id) || `video-${index}`,
          fileName: video.fileName,
          signedUrl,
          originalName,
        };
      })
    );
  }

  private static extractId(
    id: Types.ObjectId | { $oid: string } | string | undefined
  ): string {
    if (!id) return "";
    if (typeof id === "string") return id;
    if (id instanceof Types.ObjectId) return id.toString();
    if (typeof id === "object" && "$oid" in id) return id.$oid;
    return "";
  }

  private static extractNumber(
    value: number | { $numberInt: string } | undefined
  ): number {
    if (typeof value === "number") return value;
    if (typeof value === "object" && value !== null && "$numberInt" in value) {
      return parseInt(value.$numberInt, 10);
    }
    return 0;
  }

  private static extractDate(
    date: Date | { $date: string | { $numberLong: string } } | undefined
  ): Date {
    if (date instanceof Date) return date;
    if (typeof date === "object" && date !== null && "$date" in date) {
      const dateValue = date.$date;
      if (typeof dateValue === "string") {
        return new Date(dateValue);
      } else if (
        typeof dateValue === "object" &&
        dateValue !== null &&
        "$numberLong" in dateValue
      ) {
        return new Date(parseInt(dateValue.$numberLong, 10));
      }
    }
    return new Date();
  }

  static convertTutorToRawTutor(tutor: Tutor): RawTutor {
    return {
      _id: tutor._id.toString(),
      name: tutor.name,
      email: tutor.email,
      designation: tutor.designation,
      about: tutor.about,
      avatar: tutor.avatar,
    };
  }
}
