import jwt from "jsonwebtoken";
import { v7 as uuidV7 } from "uuid";
import AppConfig from "../configs/app.config.mjs";

const TokenService = {
  generateAccessToken: (id, email, role) =>
    jwt.sign(
      {
        id,
        email,
        unique: uuidV7(),
        role,
        exp: Math.floor(Date.now() / 1000) + AppConfig.JWT.accessTokenMaxAge,
      },
      AppConfig.JWT.accessTokenSecret
    ),
  generateRefreshToken: (id, email, role) =>
    jwt.sign(
      {
        id,
        email,
        role,
        unique: uuidV7(),
      },
      AppConfig.JWT.refreshTokenSecret
    ),
  generateRegisterToken: (id, email) =>
    jwt.sign(
      {
        id: id,
        email: email,
        unique: uuidV7(),
        exp: Math.floor(Date.now() / 1000) + AppConfig.JWT.verifyRegisterMaxAge,
      },
      AppConfig.JWT.registerSecret
    ),
  generateRequestResetPasswordToken: (email) =>
    jwt.sign(
      {
        email: email,
        unique: uuidV7(),
        exp: Math.floor(Date.now() / 1000) + AppConfig.JWT.resetPasswordMaxAge,
      },
      AppConfig.JWT.resetPasswordSecret
    ),
  verifyToken: (token, secret) => jwt.verify(token, secret),
};

export default TokenService;
