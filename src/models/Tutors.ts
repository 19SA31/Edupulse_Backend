import { model, Schema } from "mongoose";
import { Tutor } from "../interfaces/tutorInterface/tutorInterface";

const tutorSchema = new Schema<Tutor>({
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
  designation: {
    type: String,
    default: null
  },
  about: {
    type: String,
    default: null
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

const tutorModel = model<Tutor>("Tutor", tutorSchema);
export default tutorModel;
