import Joi from "joi";

const LaundryPartnerAppSchema = {
  updateStatus: Joi.object({
    status: Joi.string()
      .valid(
        "pending",
        "penjemputan",
        "pencucian",
        "pengantaran",
        "selesai",
        "batal",
        "kesalahan"
      )
      .required(),
    weight: Joi.number().min(0).allow("").optional(),
  }),
  updatePrice: Joi.object({
    price: Joi.number().min(0).required(),
  }),
};

export default LaundryPartnerAppSchema;
