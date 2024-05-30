import { RequestHandler as Middleware, CookieOptions, Request } from "express";
import crypto from "crypto";
import { parse } from "cookie";
import { decrypt, encrypt } from "@/utils/helper";
import { RedisStore } from "@/redis/connection";

interface SessionData {
  cookie: CookieOptions;
  user?: { id: string };
}

declare global {
  namespace Express {
    interface Request {
      sessionID: string;
      session: SessionData;
    }
  }
}

// passport
// declare global {
//   namespace Express {
//     interface User extends CurrentUser {}
//   }
// }

interface ISession {
  name?: string;
  secret: string;
  resave?: boolean;
  saveUninitialized?: boolean;
  cookie?: CookieOptions;
  genId?: (request: Request) => string;
  store: RedisStore;
}

function genIdDefault(req: Request) {
  const randomId = crypto.randomBytes(10).toString("hex");
  return randomId;
}

export const session =
  ({
    name = "session:",
    secret,
    resave,
    saveUninitialized,
    cookie,
    store,
    genId = genIdDefault,
  }: ISession): Middleware =>
  async (req, res, next) => {
    req.session = {
      cookie: { path: "/", httpOnly: true, secure: false, ...cookie },
    };

    const cookies = parse(req.get("cookie") || "");
    if (cookies[name]) {
      req.sessionID = decrypt(cookies[name], secret);
      const cookieRedis = await store.get(req.sessionID);
      if (cookieRedis) {
        req.session = JSON.parse(cookieRedis);
      }
    }

    const cookieProxy = new Proxy<CookieOptions>(req.session.cookie, {
      set(target, p: keyof CookieOptions, newValue, receiver) {
        if (p == "expires") {
          delete target["maxAge"];
        } else if (p == "maxAge") {
          delete target["expires"];
        }
        target[p] = newValue;
        req.sessionID = req.sessionID || `${store.prefix}${genId(req)}`;
        res.cookie(name, encrypt(req.sessionID, secret), target);
        store.set(
          req.sessionID,
          JSON.stringify(req.session),
          target["expires"]
            ? Math.abs(target["expires"].getTime() - Date.now())
            : target["maxAge"]
        );
        return true;
      },
    });

    req.session = new Proxy<SessionData>(
      {
        ...req.session,
        cookie: cookieProxy,
      },
      {
        set(target, p: keyof SessionData, newValue, receiver) {
          if (p == "cookie") {
            if ("expires" in newValue && "maxAge" in newValue) {
              const keysIndex = Object.keys(newValue);
              if (keysIndex.indexOf("maxAge") > keysIndex.indexOf("expires")) {
                delete newValue.expires;
              } else {
                delete newValue.maxAge;
              }
            }
            target.cookie = {
              ...target.cookie,
              ...newValue,
            };
          }
          if (p == "user") {
            target[p] = newValue;
          }
          req.sessionID = req.sessionID || `${store.prefix}${genId(req)}`;
          res.cookie(name, encrypt(req.sessionID, secret), {
            ...target.cookie,
          });
          store.set(
            req.sessionID,
            JSON.stringify(target),
            target.cookie.expires
              ? Math.abs(target.cookie.expires.getTime() - Date.now())
              : target.cookie.maxAge
          );
          return true;
        },
      }
    );

    next();
  };
