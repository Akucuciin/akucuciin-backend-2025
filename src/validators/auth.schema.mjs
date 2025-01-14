import Joi from "joi";

const AuthSchema = {
  login: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
  logout: Joi.object({
    refresh_token: Joi.string().required(),
  }),
  refresh: Joi.object({
    refresh_token: Joi.string().required(),
  }),
};

export default AuthSchema;
