import { health } from "@/controllers/health";
import express, { Router } from "express";

const router: Router = express.Router();
export function healthRoutes(): Router {
  router.get("", health);
  return router;
}
