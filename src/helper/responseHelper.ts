// src/helper/responseHelper.ts
import { Response } from "express";
import { ResponseModel } from "../models/ResponseModel";
import HTTP_statusCode from "../enums/HttpStatusCode";

export const sendSuccess = (
  res: Response,
  message: string,
  data?: unknown,
  status: number = HTTP_statusCode.OK
): void => {
  res.status(status).json(new ResponseModel(true, message, data));
};

export const sendError = (
  res: Response,
  message: string,
  status: number = HTTP_statusCode.BadRequest
): void => {
  res.status(status).json(new ResponseModel(false, message));
};
