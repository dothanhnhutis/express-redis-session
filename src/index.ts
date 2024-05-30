import express, { Express } from "express";
import RedisServer from "./server";

class Application {
  initialize() {
    const app: Express = express();
    const server: RedisServer = new RedisServer(app);
    server.start();
  }
}
const application: Application = new Application();
application.initialize();
