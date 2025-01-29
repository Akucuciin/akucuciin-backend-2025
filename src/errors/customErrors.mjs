class BadRequestError extends Error {
  constructor(message = "Bad Request") {
    super(message);
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message = "Not Authenticated") {
    super(message);
    this.statusCode = 401;
  }
}

class TokenInvalidError extends Error {
  constructor(message = "Token Error") {
    super(message);
    this.statusCode = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.statusCode = 403;
  }
}

class NotFoundError extends Error {
  constructor(message = "Resource not Found") {
    super(message);
    this.statusCode = 404;
  }
}

class ServerError extends Error {
  constructor(message = "Internal Server Error") {
    super(message);
    this.statusCode = 500;
  }
}

export {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  NotFoundError,
  ServerError,
  TokenInvalidError
};

