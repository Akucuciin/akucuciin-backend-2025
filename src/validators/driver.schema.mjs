import Joi from "joi";

const DriverSchema = {
  register: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirm_password: Joi.ref("password"),
    telephone: Joi.string().pattern(new RegExp(/^\d+$/)).required(),
    address: Joi.string().max(255).required(),
    city: Joi.string().max(50).required(),
  }).with("password", "confirm_password"),
};

export default DriverSchema;
