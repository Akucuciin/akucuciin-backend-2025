import pkg from "jsonwebtoken";
const { JsonWebTokenError, TokenExpiredError } = pkg;

import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  NotFoundError,
} from "../errors/customErrors.mjs";

const errorHandler = function (err, req, res, next) {
  console.log(">>>------------------------------------------------");
  console.log(`ERROR! ${new Date()} => ${req.method} ${req.url}`);
  console.log(err);
  console.log("----------------------------------------------END");

  if (
    err instanceof NotFoundError ||
    err instanceof AuthenticationError ||
    err instanceof AuthorizationError ||
    err instanceof BadRequestError
  ) {
    return res.status(err.statusCode).send({
      success: false,
      errors: err.message,
    });
  } else if (err instanceof JsonWebTokenError) {
    return res.status(401).send({ success: false, errors: "Invalid payload" });
  } else if (err instanceof TokenExpiredError) {
    return res.status(401).send({ success: false, errors: "Expired" });
  } else {
    return res.status(500).send({
      success: false,
      errors: "An internal server occured",
    });
  }
};

export default errorHandler;