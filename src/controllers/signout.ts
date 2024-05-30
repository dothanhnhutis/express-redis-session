import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function signout(req: Request, res: Response) {
  //   const cookieHeader = req.get("cookie") || "";
  //   const cookies = cookie.parse(cookieHeader);
  //   if (cookies["session"]) {
  //     const sessionId = decrypt(cookies["session"], "123");
  //     console.log(sessionId);
  //     const keys = await redisClient.keys(sessionId);
  //     console.log(keys);
  //     await redisClient.del(keys);
  //   }
  // deteleData("sid:12132121:*");
  res.clearCookie("session");
  res.status(StatusCodes.OK).send("oke");
}
