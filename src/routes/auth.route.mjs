import { Router } from "express";
import AuthController from "../controllers/auth.controller.mjs";

const AuthRouter = Router();

AuthRouter.put("/api/auth", async (req, res, next) =>
  AuthController.refresh(req, res, next)
);

export default AuthRouter;
