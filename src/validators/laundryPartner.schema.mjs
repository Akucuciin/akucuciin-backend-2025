import Joi from "joi";

const LaundryPartnerSchema = {
  register: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    confirm_password: Joi.ref("password"),
    telephone: Joi.string().pattern(new RegExp(/^\d+$/)).required(),
    address: Joi.string().min(1).max(255).required(),
    city: Joi.string().min(1).required(),
    area: Joi.string().min(1).required(),
    latitude: Joi.number().precision(8).allow("").optional(),
    longitude: Joi.number().precision(8).allow("").optional(),
  }).with("password", "confirm_password"),
  update: Joi.object({
    name: Joi.string().min(1).max(100).allow("").optional(),
    telephone: Joi.string().pattern(new RegExp(/^\d+$/)).allow("").optional(),
    address: Joi.string().min(1).max(255).allow("").optional(),
    city: Joi.string().min(1).allow("").optional(),
    area: Joi.string().min(1).allow("").optional(),
    latitude: Joi.number().precision(8).allow("").optional(),
    longitude: Joi.number().precision(8).allow("").optional(),
  }),
};

export default LaundryPartnerSchema;
