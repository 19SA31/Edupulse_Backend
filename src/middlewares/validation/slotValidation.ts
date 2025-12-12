// src/middlewares/validation/slotValidation.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { validateDateString } from "./commonValidation";

export const validateSlotCreation = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { date, halfHourPrice, oneHourPrice, slots } = req.body;

    if (!date || !String(date).trim()) {
      throw new AppError("Date is required", HTTP_statusCode.BadRequest);
    }

    if (!validateDateString(date)) {
      throw new AppError("Invalid date format", HTTP_statusCode.BadRequest);
    }

    const slotDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (slotDate < today) {
      throw new AppError(
        "Cannot create slots for past dates",
        HTTP_statusCode.BadRequest
      );
    }

    if (halfHourPrice === undefined || halfHourPrice === null) {
      throw new AppError(
        "Half hour price is required",
        HTTP_statusCode.BadRequest
      );
    }

    const halfHourPriceNum = parseFloat(String(halfHourPrice));
    if (
      isNaN(halfHourPriceNum) ||
      halfHourPriceNum < 0 ||
      halfHourPriceNum > 10000
    ) {
      throw new AppError(
        "Half hour price must be between 0 and 10000",
        HTTP_statusCode.BadRequest
      );
    }

    if (oneHourPrice === undefined || oneHourPrice === null) {
      throw new AppError(
        "One hour price is required",
        HTTP_statusCode.BadRequest
      );
    }

    const oneHourPriceNum = parseFloat(String(oneHourPrice));
    if (
      isNaN(oneHourPriceNum) ||
      oneHourPriceNum < 0 ||
      oneHourPriceNum > 20000
    ) {
      throw new AppError(
        "One hour price must be between 0 and 20000",
        HTTP_statusCode.BadRequest
      );
    }

    if (!Array.isArray(slots)) {
      throw new AppError("Slots must be an array", HTTP_statusCode.BadRequest);
    }

    if (slots.length === 0) {
      throw new AppError(
        "At least one slot is required",
        HTTP_statusCode.BadRequest
      );
    }

    const time12Regex = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i;
    const allowedDurations = new Set([30, 60]);

    const intervals: { start: number; end: number; index: number }[] = [];

    slots.forEach((slot: any, index: number) => {
      if (!slot.time || String(slot.time).trim() === "") {
        throw new AppError(
          `Slot ${index + 1}: time is required`,
          HTTP_statusCode.BadRequest
        );
      }

      const timeMatch = String(slot.time).trim().match(time12Regex);
      if (!timeMatch) {
        throw new AppError(
          `Slot ${index + 1}: Invalid time format (use h:mm AM/PM, e.g. "01:30 PM")`,
          HTTP_statusCode.BadRequest
        );
      }

      const hour12 = Number(timeMatch[1]);
      const minute = Number(timeMatch[2]);
      const meridiem = timeMatch[3].toUpperCase();

      let hour24 = hour12 % 12; 
      if (meridiem === "PM") hour24 += 12;

      const startMinutes = hour24 * 60 + minute;

      const durationNum = Number(slot.duration);
      if (
        Number.isNaN(durationNum) ||
        !Number.isInteger(durationNum) ||
        !allowedDurations.has(durationNum)
      ) {
        throw new AppError(
          `Slot ${index + 1}: duration must be one of [30, 60] (minutes)`,
          HTTP_statusCode.BadRequest
        );
      }

      const endMinutes = startMinutes + durationNum;

      if (endMinutes > 24 * 60) {
        throw new AppError(
          `Slot ${index + 1}: slot ends after midnight which is not allowed`,
          HTTP_statusCode.BadRequest
        );
      }

      intervals.push({ start: startMinutes, end: endMinutes, index });
    });

    intervals.sort((a, b) => a.start - b.start);

    for (let i = 0; i < intervals.length - 1; i++) {
      const current = intervals[i];
      const next = intervals[i + 1];
      if (current.end > next.start) {
        throw new AppError(
          `Slot ${current.index + 1} overlaps with slot ${next.index + 1}`,
          HTTP_statusCode.BadRequest
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
