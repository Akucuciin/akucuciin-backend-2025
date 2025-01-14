import Joi from "joi";

const CustomerSchema = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    confirm_password: Joi.ref("password"),
    name: Joi.string().min(1).max(120).required(),
    address: Joi.string().min(1).max(255).required(),
    telephone: Joi.string().pattern(new RegExp(/^\d+$/)).required(),
  }).with("password", "confirm_password"),
  requestResetPassword: Joi.object({
    email: Joi.string().email().required(),
  }),
  changePassword: Joi.object({
    password: Joi.string().required(),
    confirm_password: Joi.ref("password"),
  }).with("password", "confirm_password"),
};

export default CustomerSchema;
