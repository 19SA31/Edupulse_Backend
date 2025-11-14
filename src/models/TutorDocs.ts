import mongoose, { Schema, Document, Types } from "mongoose";
import { TutorDocs } from "../interfaces/tutorInterface/tutorInterface";

const tutorDocsSchema = new Schema<TutorDocs>({
  tutorId: {
    type: Schema.Types.ObjectId,
    ref: "Tutor",
    required: true,
    index: true,
  },
  avatar:{
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  aadharFront: {
    type: String,
    required: true,
  },
  aadharBack: {
    type: String,
    required: true,
  },
  verificationStatus: {
    type: String,
    enum: ["not_submitted","pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionReason: {
    type: String,
    required: function () {
      return this.verificationStatus === "rejected";
    },
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  rejectionCount:{
    type: Number,
    default: 0
  }
});


tutorDocsSchema.index({ tutorId: 1, verificationStatus: 1 });

export const TutorDocuments = mongoose.model<TutorDocs>('TutorDocs', tutorDocsSchema);
