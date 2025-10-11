// src/middlewares/errorMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { ResponseModel } from "../models/ResponseModel";
import HTTP_statusCode from "../enums/HttpStatusCode";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error Middleware:", err);

  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json(new ResponseModel(false, err.message));
    return;
  }
  res
    .status(HTTP_statusCode.InternalServerError)
    .json(new ResponseModel(false, "Internal server error"));
};
