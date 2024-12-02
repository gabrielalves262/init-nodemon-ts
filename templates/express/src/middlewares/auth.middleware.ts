import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { IRequestWithAuth } from "../interfaces/IRequestWithAuth";
import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken'

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    try {
      const [type, token] = req.headers.authorization.split(' ')
      if (/^Bearer$/i.test(type)) {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string, name: string }
        (req as IRequestWithAuth).user = {
          id: payload.sub,
          name: payload.name
        }
        next()
      } else {
        next(new UnauthorizedException())
      }
    } catch (error: any) {
      next(new UnauthorizedException())
    }
  } else {
    next(new UnauthorizedException())
  }
}