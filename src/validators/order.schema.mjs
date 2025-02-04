import Joi from "joi";

const OrderSchema = {
  create: Joi.object({
    laundry_partner_id: Joi.string().required(),
    package_id: Joi.string().required(),
    content: Joi.string().required(),
    status: Joi.string()
      .valid(
        "pending",
        "penjemputan",
        "pencucian",
        "selesai",
        "batal",
        "kesalahan"
      )
      .required(),
    maps_pinpoint: Joi.string().required(),
    weight: Joi.number().min(0).required(),
    price: Joi.number().min(0).required(),
    coupon_code: Joi.string().max(25).allow("").optional(),
    note: Joi.string().max(255).allow("").required(),
    pickup_date: Joi.string().max(255).required(),
  }),
  updateStatus: Joi.object({
    status: Joi.string()
      .valid(
        "pending",
        "penjemputan",
        "pencucian",
        "selesai",
        "batal",
        "kesalahan"
      )
      .required(),
    weight: Joi.number().min(0).allow("").optional(),
    price: Joi.number().min(0).allow("").optional(),
  }),
  updateStatusByDriver: Joi.object({
    status: Joi.string()
      .valid(
        "pending",
        "penjemputan",
        "pencucian",
        "selesai",
        "batal",
        "kesalahan"
      )
      .required(),
  }),
};

export default OrderSchema;
