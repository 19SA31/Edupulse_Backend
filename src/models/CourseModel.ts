import { model, Schema } from "mongoose";
import { Course } from "../interfaces/course/courseInterface";

const fileSchema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
});

const lessonSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  documents: [fileSchema],
  videos: [fileSchema],
  order: {
    type: Number,
    default: 0,
  },
});

const chapterSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  lessons: [lessonSchema],
  order: {
    type: Number,
    default: 0,
  },
});

const courseSchema = new Schema<Course>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  benefits: {
    type: String,
    required: true,
  },
  requirements: {
    type: String,
    required: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  thumbnailImage: {
    type: String,
  },
  chapters: [chapterSchema],
  tutorId: {
    type: Schema.Types.ObjectId,
    ref: "Tutor",
    required: true,
  },
  isPublished: {
    type: String,
    enum: ["draft","published","rejected"],
    default: "draft",
  },
  isListed: {
    type: Boolean,
    default: false,
  },
  enrollmentCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const courseModel = model<Course>("Course", courseSchema);
export default courseModel;
