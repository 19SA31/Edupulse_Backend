import { Schema, model, Types, Document } from "mongoose";
import { ICourseProgress } from "../interfaces/courseProgress/courseProgressInterface";

const lastViewedSchema = new Schema(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter" },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
    videoId: { type: Schema.Types.Mixed },
    timestamp: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const courseProgressSchema = new Schema<ICourseProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true,
  },
  completedChapters: { type: [Schema.Types.ObjectId], default: [] },
  lastViewed: { type: lastViewedSchema, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const CourseProgressModel = model<ICourseProgress>(
  "CourseProgress",
  courseProgressSchema
);
