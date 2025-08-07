import { ICourse } from "../../interfaces/course/courseInterface";


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

  
}
