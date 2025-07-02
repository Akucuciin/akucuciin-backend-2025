import Joi from 'joi';

const CustomerSchema = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirm_password: Joi.ref('password'),
    name: Joi.string().min(1).max(120).required(),
    address: Joi.string().min(1).max(255).required(),
    telephone: Joi.string().pattern(new RegExp(/^\d+$/)).required(),
  }).with('password', 'confirm_password'),
  requestResetPassword: Joi.object({
    email: Joi.string().email().required(),
  }),
  resendVerificationEmail: Joi.object({
    email: Joi.string().email().required(),
  }),
  changePassword: Joi.object({
    password: Joi.string().min(8).required(),
    confirm_password: Joi.ref('password'),
  }).with('password', 'confirm_password'),
  update: Joi.object({
    name: Joi.string().min(1).max(120).optional(),
    address: Joi.string().min(1).max(255).optional(),
    telephone: Joi.string().pattern(new RegExp(/^\d+$/)).optional(),
  }),
  createReferralCode: Joi.object({
    referral_code: Joi.string().min(1).max(20).required(),
  }),
};

export default CustomerSchema;
