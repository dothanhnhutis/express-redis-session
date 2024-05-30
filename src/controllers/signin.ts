import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function signin(req: Request, res: Response) {
  const expires = new Date(Date.now() + 5 * 60000);

  req.session.user = {
    id: "12132121",
  };
  req.session.cookie = {
    expires,
    maxAge: 120000,
  };
  req.session.cookie.expires = expires;
  req.session.cookie.maxAge = 120000;
  req.session.cookie.expires = expires;

  res.status(StatusCodes.OK).send("ok");
}

// export async function signin(req: Request, res: Response) {
//   const randomId = Math.random().toString(36).substring(2);
//   const redisKey = `${prefix}:${userId}:${randomId}`;
//   const expires = new Date(Date.now() + 5 * 60000);
//   const otp: CookieOptions = {
//     path: "/",
//     expires,
//     httpOnly: true,
//     secure: configs.NODE_ENV == "production",
//   };
//   await redisClient.set(
//     redisKey,
//     JSON.stringify({ cookie: otp, user: { id: userId } }),
//     "PX",
//     Math.abs(Date.now() - expires.getTime()),
//     "NX"
//   );
//   const hashSessionId = encrypt(
//     redisKey,
//     "4yD+uEp5duehSXRB7AslVkLaBQtiv20mjA7oJuB2opM="
//   );
//   res.cookie(prefix, hashSessionId, otp);
//   res.status(StatusCodes.OK).send("ok");
// }

// export async function me(req: Request, res: Response) {
//   const cookies = cookie.parse(req.get("cookie") || "");
//   if (cookies[prefix]) {
//     const sessionId = decrypt(
//       cookies[prefix],
//       "4yD+uEp5duehSXRB7AslVkLaBQtiv20mjA7oJuB2opM="
//     );
//     const key = await redisClient.keys(sessionId);
//     const data = await redisClient.get(key[0]);
//     console.log(data);
//   }
//   res.status(StatusCodes.OK).send("ok");
// }
// export async function signout(req: Request, res: Response) {
//   const cookies = cookie.parse(req.get("cookie") || "");
//   if (cookies[prefix]) {
//     const sessionId = decrypt(
//       cookies[prefix],
//       "4yD+uEp5duehSXRB7AslVkLaBQtiv20mjA7oJuB2opM="
//     );
//   }
//   // const redisclient = getRedis();
//   // const session = await redisclient.keys("session:999999:*");
//   // redisclient.del(session);
//   // res.clearCookie("session");
//   res.status(StatusCodes.OK).send("ok");
// }

// export async function signoutAll(req: Request, res: Response) {
//   // const session = await redisclient.keys("session:999999:*");
//   // redisclient.del(session);
//   res.clearCookie("session");

//   res.status(StatusCodes.OK).send("ok");
// }
