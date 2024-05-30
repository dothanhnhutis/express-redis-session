import { Redis, RedisOptions } from "ioredis";

// --------------------------- RedisStore ----------------------------
const REDIS_CONNECT_TIMEOUT = 10000;
let connectionTimeout: NodeJS.Timeout;

type RedisClientType =
  | { path: string }
  | { port: number }
  | { options: RedisOptions }
  | { port: number; host: string }
  | { path: string; options: RedisOptions }
  | { port: number; options: RedisOptions }
  | { port: number; host: string; options: RedisOptions };

type RedisStoreType = {
  prefix: string;
  client: RedisClientType;
};

export class RedisStore {
  public prefix: string;
  private client: Redis;

  constructor(params: { prefix: string });
  constructor(params: { prefix: string; client: { path: string } });
  constructor(params: { prefix: string; client: { port: number } });
  constructor(params: { prefix: string; client: { options: RedisOptions } });
  constructor(params: {
    prefix: string;
    client: { port: number; host: string };
  });
  constructor(params: {
    prefix: string;
    client: { path: string; options: RedisOptions };
  });
  constructor(params: {
    prefix: string;
    client: { port: number; options: RedisOptions };
  });
  constructor(params: {
    prefix: string;
    client: {
      port: number;
      host: string;
      options: RedisOptions;
    };
  });

  constructor(params: RedisStoreType) {
    this.prefix = params.prefix;
    if (params.client) {
      const config = params.client;
      if ("path" in config) {
        if ("options" in config) {
          this.client = new Redis(config.path, config.options);
        } else {
          this.client = new Redis(config.path);
        }
      } else if ("port" in config) {
        if ("host" in config) {
          if ("options" in config) {
            this.client = new Redis(config.port, config.host, config.options);
          } else {
            this.client = new Redis(config.port, config.host);
          }
        } else if ("options" in config) {
          this.client = new Redis(config.port, config.options);
        } else {
          this.client = new Redis(config.port);
        }
      } else if ("options" in config) {
        this.client = new Redis(config.options);
      } else {
        this.client = new Redis();
      }
    } else {
      // inplement base store
      this.client = new Redis();
    }
    this.handleEventConnect();
    process.on("SIGINT", () => {
      this.client.disconnect();
    });
  }
  private handleEventConnect() {
    this.client.on("connect", () => {
      console.log("Redis connection status: connected");
      clearTimeout(connectionTimeout);
    });
    this.client.on("end", () => {
      console.log("Redis connection status: disconnected");
      this.handleTimeoutError();
    });
    this.client.on("reconnecting", () => {
      console.log("Redis connection status: reconnecting");
      clearTimeout(connectionTimeout);
    });
    this.client.on("error", (err) => {
      console.log(`Redis connection status: error ${err}`);
      this.handleTimeoutError();
    });
  }
  private handleTimeoutError() {
    connectionTimeout = setTimeout(() => {
      throw new Error("Redis reconnect timed out");
    }, REDIS_CONNECT_TIMEOUT);
  }

  public set(key: string, value: string, maxAge?: number): void {
    if (maxAge) {
      this.client.set(key, value, "PX", maxAge, (err, data) => {
        if (err) throw new Error(err.message);
        return data == "OK";
      });
    } else {
      this.client.set(key, value, (err, data) => {
        if (err) throw new Error(err.message);
        return data == "OK";
      });
    }
  }
  public get(key: string): Promise<string | null> {
    return this.client.get(key, (err, data) => {
      if (err) throw new Error(err.message);
      return data == "OK";
    });
  }
  public delete(pattern: string): void {
    this.client.keys(pattern, (err, datas) => {
      if (err) throw new Error(err.message);
      if (datas && datas.length > 0)
        this.client.del(datas, (err, data) => {
          if (err) throw new Error(err.message);
        });
    });
  }
}
