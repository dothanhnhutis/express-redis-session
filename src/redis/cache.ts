import { redisClient } from "./connection";

export function setData(key: string, value: string, maxAge?: number): void {
  if (maxAge) {
    redisClient.set(key, value, "PX", maxAge, (err, data) => {
      if (err) throw new Error(err.message);
      return data == "OK";
    });
  } else {
    redisClient.set(key, value, (err, data) => {
      if (err) throw new Error(err.message);
      return data == "OK";
    });
  }
}

export function getData(key: string) {
  return redisClient.get(key, (err, data) => {
    if (err) throw new Error(err.message);
    return data == "OK";
  });
}

export function deteleData(pattern: string) {
  redisClient.keys(pattern, (err, datas) => {
    if (err) throw new Error(err.message);
    if (datas && datas.length > 0)
      redisClient.del(datas, (err, data) => {
        if (err) throw new Error(err.message);
      });
  });
}
