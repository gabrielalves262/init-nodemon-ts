import { BadRequestException } from "../exceptions/BadRequestException"
import { NextFunction, Request, Response } from "express"
import { ZodObject, ZodRawShape } from 'zod'

export const validationMiddleware = <T extends ZodRawShape>(schema: ZodObject<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parseData = schema.safeParse(req.body)
    if (!parseData.success)
      next(new BadRequestException(parseData.error.errors))
    else
      next()
  }
}