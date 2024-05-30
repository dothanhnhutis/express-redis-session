import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function health(req: Request, res: Response) {
  res.status(StatusCodes.OK).send("Api service is healthy and OK.");
}
