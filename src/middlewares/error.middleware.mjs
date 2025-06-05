import pkg from "jsonwebtoken";
const { JsonWebTokenError, TokenExpiredError } = pkg;

import { MulterError } from "multer";
import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  NotFoundError,
} from "../errors/customErrors.mjs";

const errorHandler = function (error, req, res, next) {
  console.error(">>>------------------------------------------------");
  console.error(`ERROR! ${new Date()} => ${req.method} ${req.url}`);
  console.error(error);
  console.error("----------------------------------------------END");

  if (
    error instanceof NotFoundError ||
    error instanceof AuthenticationError ||
    error instanceof AuthorizationError ||
    error instanceof BadRequestError
  ) {
    return res.status(error.statusCode).send({
      success: false,
      errors: error.message,
    });
  } else if (error instanceof MulterError) {
    return res.status(400).send({ success: false, errors: error.message });
  } else if (error instanceof JsonWebTokenError) {
    return res.status(401).send({ success: false, errors: "Invalid payload" });
  } else if (error instanceof TokenExpiredError) {
    return res.status(401).send({ success: false, errors: "Expired" });
  } else {
    return res.status(500).send({
      success: false,
      errors: "An internal server occured",
    });
  }
};

export default errorHandler;
