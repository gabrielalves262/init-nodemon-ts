import { IController } from "../../interfaces/IController";
import { IRequestWithAuth } from "../../interfaces/IRequestWithAuth";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { NextFunction, Request, Response, Router } from "express";

export class HomeController implements IController {
  public path = "/";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get(this.path, authMiddleware, this.sayHello);
  }

  private sayHello = (request: Request, response: Response) => {
    const user = (request as IRequestWithAuth).user;
    response.json({ message: `Hello ${user.name}!` });
  }
}