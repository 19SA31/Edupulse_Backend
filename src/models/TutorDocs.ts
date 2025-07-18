import mongoose, { Schema, Document, Types } from "mongoose";
import { ITutorDocs } from "../interfaces/tutorInterface/tutorInterface";

const tutorDocsSchema = new Schema<ITutorDocs>({
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
  }
});


tutorDocsSchema.index({ tutorId: 1, verificationStatus: 1 });

export const TutorDocs = mongoose.model<ITutorDocs>('TutorDocs', tutorDocsSchema);
