import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import cookie from "cookie";
import { decrypt } from "@/utils/helper";
import RedisStore from "connect-redis";
import { redisClient } from "@/redis/connection";

export async function me(req: Request, res: Response) {
  // console.log(req.session.user);
  // console.log(req.sessionID);

  let redisStore = new RedisStore({
    client: redisClient,
    prefix: "sid:",
  });

  // redisStore.set("2312:asdasdad", {
  //   cookie: { path: "/", httpOnly: true, secure: false },
  // });
  redisStore.destroy("2312");
  redisStore;
  // console.log(kk);
  res.status(StatusCodes.OK).send("oke");
}
