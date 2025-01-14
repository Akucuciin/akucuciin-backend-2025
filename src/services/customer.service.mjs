import bcrypt from "bcrypt";
import { v7 as uuidV7 } from "uuid";

import AppConfig from "../configs/app.config.mjs";
import CustomerQuery from "../database/queries/customer.query.mjs";
import {
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  TokenInvalidError,
} from "../errors/customErrors.mjs";
import CustomerSchema from "../validators/customer.schema.mjs";
import validate from "../validators/validator.mjs";
import MailService from "./mail.service.mjs";
import TokenService from "./token.service.mjs";

const CustomerService = {
  getProfile: async (req) => {
    const customer = await CustomerQuery.getCustomerProfileByEmail(
      req.user.email
    );
    // customer is guaranteed to be found if authenticated
    return customer;
  },
  register: async (req) => {
    const newCustomer = validate(CustomerSchema.register, req.body);

    const isEmailExists = await CustomerQuery.isEmailExists(newCustomer.email);
    if (isEmailExists) throw new BadRequestError("Email sudah terdaftar");

    newCustomer.id = uuidV7();
    newCustomer.password = await bcrypt.hash(newCustomer.password, 10);

    await CustomerQuery.registerCustomer(
      newCustomer.id,
      newCustomer.email,
      newCustomer.password,
      newCustomer.name,
      newCustomer.address,
      newCustomer.telephone
    );
    const registerToken = TokenService.generateRegisterToken(
      newCustomer.id,
      newCustomer.email
    );
    await MailService.sendVerifyEmail(newCustomer.email, registerToken);

    return {
      id: newCustomer.id,
      email: newCustomer.email,
      name: newCustomer.name,
      address: newCustomer.address,
      telephone: newCustomer.telephone,
    };
  },
  verify: async (req) => {
    const { register_token, email: emailParams } = req.params;
    const { id, email } = TokenService.verifyToken(
      register_token,
      AppConfig.JWT.registerSecret
    );

    if (email !== emailParams) throw new BadRequestError("Email mismatch");

    const isActive = await CustomerQuery.isCustomerActive(email);
    if (isActive === undefined) throw new TokenInvalidError("Invalid");
    if (isActive === 1) throw new AuthenticationError("Akun sudah diaktivasi");

    await CustomerQuery.activateCustomer(email);

    return `${id} ${email} activated`;
  },
  requestResetPassword: async (req) => {
    const { email } = validate(CustomerSchema.requestResetPassword, req.body);
    const resetPasswordToken =
      TokenService.generateRequestResetPasswordToken(email);

    await MailService.sendRequestResetPassword(email, resetPasswordToken);
    return `Requested to ${email}`;
  },
  changePassword: async (req) => {
    let { password: newPassword } = validate(
      CustomerSchema.changePassword,
      req.body
    );

    const { email: emailFromParams, reset_password_token } = req.params;

    const isTokenUsed = await CustomerQuery.isResetPasswordTokenUsed(
      reset_password_token
    );
    if (isTokenUsed) throw new BadRequestError("Token already used");

    const { email: emailFromToken } = TokenService.verifyToken(
      reset_password_token,
      AppConfig.JWT.resetPasswordSecret
    );

    const isEmailSame = emailFromParams === emailFromToken;
    if (!isEmailSame) throw new AuthenticationError("Invalid credentials");

    const isEmailExists = await CustomerQuery.isEmailExists(emailFromToken);
    if (!isEmailExists) throw new NotFoundError("Email not found");

    newPassword = await bcrypt.hash(newPassword, 10);
    await CustomerQuery.changePassword(newPassword, emailFromToken);
    await CustomerQuery.deactivateResetPasswordToken(reset_password_token);
    return `Password for ${emailFromToken} changed succesfully`;
  },
};

export default CustomerService;
