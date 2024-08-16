import { Response } from "express";
import App from "../../app";
import { AuthAppRequest } from "../../types";

export default function (app: App) {
  app.get("/p/:username", (req: AuthAppRequest, res: Response) => {
    const { user } = req;
    const { username, description } = user;
    res.render("users/profile", {
      username,
      description,
      lud16: user.lud16,
    });
  });
}
