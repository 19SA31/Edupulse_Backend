import mongoose, { Types } from "mongoose";

export enum SlotDuration {
  HALF_HOUR = 30,
  ONE_HOUR = 60,
}

export enum SlotStatus {
  AVAILABLE = "AVAILABLE",
  BOOKED = "BOOKED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface Slot {
  _id: string;
  start: Date;
  end: Date;
  duration: SlotDuration;
  priceInINR: number;
  status: SlotStatus;
  isBooked: boolean;
  bookedBy: Types.ObjectId | null;
}

export interface TutorSlot {
  tutorId: Types.ObjectId;
  date: Date;
  slots: Slot[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TutorSlotsSchema = new mongoose.Schema(
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
    slots: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        duration: {
          type: Number,
          enum: [SlotDuration.HALF_HOUR, SlotDuration.ONE_HOUR],
          required: true,
        },
        price: { type: Number, required: true },
        status: {
          type: String,
          enum: Object.values(SlotStatus),
          default: SlotStatus.AVAILABLE,
        },
        isBooked: { type: Boolean, default: false },
        bookedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
    ],
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const TutorSlotsModel = mongoose.model<TutorSlot>("TutorSlot", TutorSlotsSchema);
export default TutorSlotsModel;
