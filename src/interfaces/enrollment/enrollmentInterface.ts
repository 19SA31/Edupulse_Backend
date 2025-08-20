import mongoose from "mongoose";

export interface Enrollment extends Document {
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

export interface CreateEnrollmentData {
  userId: string;
  tutorId: string;
  courseId: string;
  categoryId: string;
  price: number;
}

export interface RevenueQueryParams {
  page: number;
  limit: number;
  search: string;
  status: string;
  date: string;
}

export interface RevenueStatsParams {
  startDate?: string;
  endDate?: string;
}

export interface ExportParams {
  format: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}
