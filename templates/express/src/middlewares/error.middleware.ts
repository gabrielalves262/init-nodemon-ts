import { HttpException } from "../exceptions/HttpException";
import { NextFunction, Request, Response } from "express"

export const errorMiddleware = (error: HttpException, request: Request, response: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  const errors = error.errors;
  response
    .status(status)
    .send({
      message,
      status,
      errors
    });
}