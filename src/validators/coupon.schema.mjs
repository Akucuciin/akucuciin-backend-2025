import Joi from 'joi';

const CouponSchema = {
  create: Joi.object({
    name: Joi.string().min(5).max(20).required(),
    multiplier: Joi.number().min(0).max(99).required(),
    description: Joi.string().max(255).required(),
    is_used: Joi.number().integer().valid(0, 1).required(),
  }),
};

export default CouponSchema;
