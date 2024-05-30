import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function me(req: Request, res: Response) {
  console.log(req.session.user);
  console.log(req.sessionID);

  res.status(StatusCodes.OK).send("oke");
}
