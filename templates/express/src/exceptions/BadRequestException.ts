import { ZodIssue } from "zod";
import { HttpException } from "./HttpException";

export class BadRequestException extends HttpException {
  constructor(errors: ZodIssue[]) {
    super(400, `Bad Request`, errors);
  }
}