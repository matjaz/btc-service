import { NextFunction, Response } from "express";
import App from "../app";
import { AppRequest } from "../types";

export default function (app: App) {
  app.use((req: AppRequest, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });
}
