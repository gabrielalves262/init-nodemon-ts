import express from 'express';
import { IController } from './interfaces/IController';
import { errorMiddleware } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';

export class App {
  private app: express.Application

  constructor(controllers: IController[]) {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  public getSever = () => this.app

  public listen = () => {
    const port = Number(process.env.PORT || '3000');
    const host = process.env.HOST || '0.0.0.0';

    this.app.listen(port, host, () => {
      console.log(`⚡ Server running at http://${host}:${port}`);
    });
  }

  private initializeMiddlewares = () => {
    this.app.use(express.json());
    this.app.use(loggerMiddleware)
  }

  private initializeControllers = (controllers: IController[]) => {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }

  private initializeErrorHandling = () => {
    this.app.use(errorMiddleware);
  }
}