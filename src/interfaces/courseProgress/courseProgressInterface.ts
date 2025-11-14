import { Types } from "mongoose";

export interface ICourseProgress extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  completedChapters: Types.ObjectId[];
  lastViewed?: {
    chapterId: Types.ObjectId;
    lessonId: Types.ObjectId;
    videoId: Types.ObjectId | string;
    timestamp: number;
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
