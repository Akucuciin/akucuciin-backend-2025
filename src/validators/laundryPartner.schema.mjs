import Joi from "joi";

const LaundryPartnerSchema = {
  register: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    description: Joi.string().min(1).max(500).required(),
    confirm_password: Joi.ref("password"),
    telephone: Joi.string().pattern(new RegExp(/^\d+$/)).required(),
    address: Joi.string().min(1).max(255).required(),
    maps_pinpoint: Joi.string().required(),
    city: Joi.string().min(1).required(),
    area: Joi.string().min(1).required(),
    latitude: Joi.number().precision(8).allow("").optional(),
    longitude: Joi.number().precision(8).allow("").optional(),
  }).with("password", "confirm_password"),
  update: Joi.object({
    name: Joi.string().min(1).max(100).allow("").optional(),
    description: Joi.string().min(1).max(500).allow("").optional(),
    telephone: Joi.string().pattern(new RegExp(/^\d+$/)).allow("").optional(),
    address: Joi.string().min(1).max(255).allow("").optional(),
    maps_pinpoint: Joi.string().allow("").optional(),
    city: Joi.string().min(1).allow("").optional(),
    area: Joi.string().min(1).allow("").optional(),
    latitude: Joi.number().precision(8).allow("").optional(),
    longitude: Joi.number().precision(8).allow("").optional(),
  }),
  addPackage: Joi.object({
    name: Joi.string().min(1).max(50).required(),
    description: Joi.string().min(1).max(500).required(),
    features: Joi.string().required(),
    price_text: Joi.number().required(),
  }),
  updatePackage: Joi.object({
    name: Joi.string().min(1).max(50).allow("").optional(),
    description: Joi.string().min(1).max(500).allow("").optional(),
    features: Joi.string().allow("").optional(),
    price_text: Joi.number().allow("").optional(),
  }),
};

export default LaundryPartnerSchema;
