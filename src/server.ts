import "express-async-errors";
import http from "http";
import compression from "compression";
import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import morgan from "morgan";
import configs from "./configs";
import { StatusCodes } from "http-status-codes";
import { CustomError, IErrorResponse, NotFoundError } from "./error-handler";
import { appRouter } from "./router";
import { initRedis } from "./redis/connection";
import { session } from "./middlewares/session";

const SERVER_PORT = 4000;

export default class RedisServer {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  start() {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.errorHandler(this.app);
    this.startServer(this.app);
  }
  private securityMiddleware(app: Application) {
    app.set("trust proxy", 1);
    initRedis();

    app.use(helmet());
    app.use(
      cors({
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
        origin: configs.CLIENT_URL,
      })
    );
    app.use(morgan(process.env.NODE_ENV == "production" ? "combined" : "dev"));
    app.use(
      session({
        name: "session",
        secret: "4yD+uEp5duehSXRB7AslVkLaBQtiv20mjA7oJuB2opM=",
        cookie: {
          httpOnly: true,
          secure: configs.NODE_ENV == "production",
        },
        genId: (req) => {
          return `${req.session.user?.id}:${Math.random()
            .toString(36)
            .substring(2)}`;
        },
      })
    );
  }

  private standardMiddleware(app: Application) {
    app.use(compression());
    app.use(express.json({ limit: "200mb" }));
    app.use(express.urlencoded({ limit: "200mb", extended: true }));
  }

  private routesMiddleware(app: Application) {
    appRouter(app);
  }
  private errorHandler(app: Application) {
    app.use("*", (req: Request, res: Response, next: NextFunction) => {
      throw new NotFoundError();
    });
    app.use(
      (
        error: IErrorResponse,
        _req: Request,
        res: Response,
        next: NextFunction
      ) => {
        if (error instanceof CustomError) {
          return res.status(error.statusCode).json(error.serializeErrors());
        }
        // console.log(error);

        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ message: "Something went wrong" });
      }
    );
  }

  private startServer(app: Application) {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.startHttpServer(httpServer);
    } catch (error) {
      console.log("GatewayService startServer() error method:", error);
    }
  }

  private startHttpServer(httpServer: http.Server) {
    try {
      console.log(`App server has started with process id ${process.pid}`);
      httpServer.listen(SERVER_PORT, () => {
        console.log(`App server running on port ${SERVER_PORT}`);
      });
    } catch (error) {
      console.log("AppService startServer() method error:", error);
    }
  }
}
