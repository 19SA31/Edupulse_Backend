import mongoose, { Document, Types } from "mongoose";
import {
  TutorSlot,
  Slots,
  SlotDuration,
} from "../interfaces/tutorInterface/tutorInterface";

const TutorSlotsSchema = new mongoose.Schema<TutorSlot>(
  {
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    halfHourPrice: {
      type: Number,
      required: true,
    },
    oneHourPrice: {
      type: Number,
      required: true,
    },
    slots: [
      {
        time: {
          type: String,
          required: true,
        },
        duration: {
          type: Number,
          enum: [SlotDuration.HALF_HOUR, SlotDuration.ONE_HOUR],
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        availability: {
          type: Boolean,
          default: true,
        },
        bookedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const TutorSlotsModel = mongoose.model<TutorSlot>(
  "TutorSlot",
  TutorSlotsSchema
);
export default TutorSlotsModel;
