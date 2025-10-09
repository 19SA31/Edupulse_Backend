
import mongoose, { Document, Types } from "mongoose";

export enum SlotDuration {
  HALF_HOUR = 30,
  ONE_HOUR = 60,
}

export interface Slots {
  _id?: Types.ObjectId;
  time: string;
  duration: SlotDuration;
  price: number;
  availability: boolean;
  bookedBy: Types.ObjectId | null;
}


export interface TutorSlot extends Document {
  _id: Types.ObjectId;
  tutorId: Types.ObjectId;
  date: Date;
  slots: Slots[];
  halfHourPrice: number;
  oneHourPrice: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
