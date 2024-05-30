// import { CookieOptions, RequestHandler as MiddleWare, Request } from "express";
// import { parse } from "cookie";
// import { decrypt, encrypt } from "@/utils/helper";
// import crypto from "crypto";
// import { getData, setData } from "@/store/redis/cache";

// interface SessionData {
//   cookie: CookieOptions;
//   user?: { id: string };
// }

// declare global {
//   namespace Express {
//     interface Request {
//       sessionID: string;
//       session: SessionData;
//     }
//   }
// }

// interface SessionOptions {
//   secret: string;
//   name?: string | undefined;
//   prefix?: string;
//   cookie?: CookieOptions | undefined;
//   genId?: (request: Request) => string;
// }

// function genIdDefault(req: Request) {
//   const randomId = crypto.randomBytes(10).toString("hex");
//   return randomId;
// }

// const cookieDefault: CookieOptions = {
//   path: "/",
//   httpOnly: true,
//   secure: false,
// };

// export const session =
//   ({
//     name = "session",
//     secret,
//     cookie,
//     prefix = "sid",
//     genId = genIdDefault,
//   }: SessionOptions): MiddleWare =>
//   async (req, res, next) => {
//     req.session = {
//       cookie: { ...cookieDefault, ...cookie },
//     };

//     const cookies = parse(req.get("cookie") || "");
//     if (cookies[name]) {
//       req.sessionID = decrypt(cookies[name], secret);
//       const cookieRedis = await getData(req.sessionID);
//       if (cookieRedis) {
//         req.session = JSON.parse(cookieRedis);
//       }
//     }

//     const cookieProxy = new Proxy<CookieOptions>(req.session.cookie, {
//       set(target, p: keyof CookieOptions, newValue, receiver) {
//         if (p == "expires") {
//           delete target["maxAge"];
//         } else if (p == "maxAge") {
//           delete target["expires"];
//         }
//         target[p] = newValue;
//         req.sessionID = req.sessionID || `${prefix}:${genId(req)}`;
//         res.cookie(name, encrypt(req.sessionID, secret), target);
//         setData(
//           req.sessionID,
//           JSON.stringify(req.session),
//           target["expires"]
//             ? Math.abs(target["expires"].getTime() - Date.now())
//             : target["maxAge"]
//         );
//         return true;
//       },
//     });

//     req.session = new Proxy<SessionData>(
//       {
//         ...req.session,
//         cookie: cookieProxy,
//       },
//       {
//         set(target, p: keyof SessionData, newValue, receiver) {
//           if (p == "cookie") {
//             if ("expires" in newValue && "maxAge" in newValue) {
//               const keysIndex = Object.keys(newValue);
//               if (keysIndex.indexOf("maxAge") > keysIndex.indexOf("expires")) {
//                 delete newValue.expires;
//               } else {
//                 delete newValue.maxAge;
//               }
//             }
//             target.cookie = {
//               ...target.cookie,
//               ...newValue,
//             };
//           }
//           if (p == "user") {
//             target[p] = newValue;
//           }
//           req.sessionID = req.sessionID || `${prefix}:${genId(req)}`;
//           res.cookie(name, encrypt(req.sessionID, secret), {
//             ...target.cookie,
//           });
//           setData(
//             req.sessionID,
//             JSON.stringify(target),
//             target.cookie.expires
//               ? Math.abs(target.cookie.expires.getTime() - Date.now())
//               : target.cookie.maxAge
//           );
//           return true;
//         },
//       }
//     );

//     next();
//   };
