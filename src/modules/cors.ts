import { NextFunction, Request, Response } from "express";
import App from "../app";

export default function cors(app: App) {
  app.use((_: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });
}
