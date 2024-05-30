import { me } from "@/controllers/me";
import { signin } from "@/controllers/signin";
import { signout } from "@/controllers/signout";
import express, { Router } from "express";

const router: Router = express.Router();
export function authRoutes(): Router {
  router.post("/auth/signin", signin);
  router.get("/auth/me", me);
  router.delete("/auth/signout", signout);
  return router;
}
