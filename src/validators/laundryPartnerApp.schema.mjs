import Joi from "joi";

const LaundryPartnerAppSchema = {
  updateProfile: Joi.object({
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
  updateStatus: Joi.object({
    status: Joi.string().valid("pending", "penjemputan", "pencucian", "pengantaran", "selesai", "batal", "kesalahan").required(),
    weight: Joi.number().min(0).allow("").optional(),
  }),
  updatePrice: Joi.object({
    price: Joi.number().min(0).allow("").optional(),
  }),
};

export default LaundryPartnerAppSchema;
