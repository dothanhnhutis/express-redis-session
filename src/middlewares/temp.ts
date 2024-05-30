import { CookieOptions, RequestHandler as Middleware, Request } from "express";
import { parse } from "cookie";
import { decrypt, encrypt } from "@/utils/helper";
import { redisClient } from "@/redis/connection";
import { getData, setData } from "@/redis/cache";

declare global {
  namespace Express {
    interface Request {
      sessionID: string;
      session: ISessionData;
    }
  }
}

interface ISessionData {
  cookie: CookieOptions;
  user?: {
    id: string;
  };
}

interface ISessionOption {
  name?: string;
  secret: string;
  prefix?: string;
  cookie?: CookieOptions;
  genId?: (req: Request) => string;
}

const initCookieOption: CookieOptions = {
  path: "/",
  secure: false,
  httpOnly: true,
};

function initGenId(req: Request) {
  return Math.random().toString(36).substring(2);
}

export function session({
  name = "session",
  cookie,
  secret,
  prefix = "sid",
  genId = initGenId,
}: ISessionOption): Middleware {
  return async function (req, res, next) {
    const cookieOpt: CookieOptions = {
      ...initCookieOption,
      ...cookie,
    };

    let sessionData: ISessionData = {
      cookie: cookieOpt,
    };

    const cookies = parse(req.get("cookie") || "");
    if (cookies[name]) {
      const sessionId = decrypt(cookies[name], secret);
      const cookieRedis = await getData(sessionId);
      if (cookieRedis) {
        sessionData = JSON.parse(cookieRedis);
      }
    }

    const cookieProxy = new Proxy<CookieOptions>(sessionData.cookie, {
      set(target, p: keyof CookieOptions, newValue, receiver) {
        if (p == "expires") {
          delete target["maxAge"];
        } else if (p == "maxAge") {
          delete target["expires"];
        }
        target[p] = newValue;
        console.log("CookieOptions");
        console.log(p);
        console.log(target);
        // req.sessionID = req.sessionID || `${prefix}:${genId(req)}`;
        // res.cookie(name, encrypt(req.sessionID, secret), target);
        // setData(
        //   req.sessionID,
        //   JSON.stringify(req.session),
        //   target["expires"]
        //     ? Math.abs(target["expires"].getTime() - Date.now())
        //     : target["maxAge"]
        // );
        return true;
      },
    });

    req.session = new Proxy<ISessionData>(
      {
        cookie: cookieProxy,
      },
      {
        set(target, p: keyof ISessionData, newValue, receiver) {
          target[p] = newValue;
          console.log("ISessionData");
          console.log(p);
          console.log(target);
          //   req.sessionID = req.sessionID || `${prefix}:${genId(req)}`;
          //   res.cookie(name, encrypt(req.sessionID, secret), target.cookie);

          return true;
        },
      }
    );

    next();

    // const cookies = parse(req.get("cookie") || "");
    // let session: ISession = {
    //   cookie: { ...initCookieOption, ...cookie },
    // };
    // if (cookies[name]) {
    //   const sessionId = decrypt(cookies[name], secret);
    //   req.sessionID = sessionId;
    //   const data = await redisClient.get(req.sessionID);
    //   if (data) {
    //     session = JSON.parse(data) as ISession;
    //   }
    // }
    // req.session = new Proxy<ISession>(session, {
    //   get(target, p) {
    //     return target[p as keyof ISession];
    //   },
    //   set(target, p, newValue) {
    //     console.log(p);
    //     target[p as keyof ISession] = newValue;
    //     const sessionID = req.sessionID || `${name}:${genID(req)}`;
    //     const encryptSessionId = encrypt(sessionID, secret);
    //     res.cookie(name, encryptSessionId, req.session.cookie);

    //     console.log("ok");

    //     return true;
    //   },
    // });

    next();
  };
}
