import { model, Schema } from "mongoose";
import { ITutor } from "../interfaces/tutorInterface/tutorInterface";

const tutorSchema = new Schema<ITutor>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  DOB: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  avatar: {
    type: String,
    default: null,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },isVerified: {
    type: Boolean,
    default: false,
  },
});

const tutorModel = model<ITutor>("Tutor", tutorSchema);
export default tutorModel;
