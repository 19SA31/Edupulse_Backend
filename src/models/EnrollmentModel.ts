import mongoose, { Document, Schema } from "mongoose";

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  tutorId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  price: number;
  paymentId: string;
  paymentMethod?: "stripe";
  status: "pending" | "paid" | "failed";
  dateOfEnrollment: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
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
    },
    paymentId: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["stripe"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    dateOfEnrollment: { 
      type: Date, 
      default: Date.now 
    },
  }
);

export default mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);
