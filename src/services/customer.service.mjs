import bcrypt from "bcrypt";

import AppConfig from "../configs/app.config.mjs";
import AuthQuery from "../database/queries/auth.query.mjs";
import CustomerQuery from "../database/queries/customer.query.mjs";
import OrderQuery from "../database/queries/order.query.mjs";
import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  NotFoundError,
  TokenInvalidError,
} from "../errors/customErrors.mjs";
import formatOrdersFromDb from "../utils/order.utils.mjs";
import { generateUuidWithPrefix } from "../utils/utils.mjs";
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
  updateProfile: async (req) => {
    const updatedCustomer = validate(CustomerSchema.update, req.body);

    const customer = await CustomerQuery.getCustomerProfileByEmail(
      req.user.email
    );

    const values = {
      id: req.user.id,
      name: updatedCustomer.name || customer.name,
      address: updatedCustomer.address || customer.address,
      telephone: updatedCustomer.telephone || customer.telephone,
    };

    await CustomerQuery.updateCustomer(
      values.id,
      values.name,
      values.address,
      values.telephone
    );

    return values;
  },
  register: async (req) => {
    const newCustomer = validate(CustomerSchema.register, req.body);

    const isEmailExists = await CustomerQuery.isEmailExists(newCustomer.email);
    if (isEmailExists) throw new BadRequestError("Email sudah terdaftar");

    newCustomer.id = generateUuidWithPrefix("CUST");
    newCustomer.password = await bcrypt.hash(newCustomer.password, 12);

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
    MailService.sendVerifyEmail(newCustomer.email, registerToken);

    return {
      id: newCustomer.id,
      email: newCustomer.email,
      name: newCustomer.name,
      address: newCustomer.address,
      telephone: newCustomer.telephone,
    };
  },
  getOrders: async (req) => {
    const orders = await OrderQuery.getOrdersJoinedByCustomer(req.user.id);
    const ordersFormatted = formatOrdersFromDb(orders);
    return ordersFormatted;
  },
  cancelOrder: async (req) => {
    const { order_id } = req.params;
    const order = await OrderQuery.getOrderById(order_id);
    if (!order) throw new NotFoundError("Failed, order not found");
    if (order.customer_id != req.user.id)
      throw new AuthorizationError("Failed, order is not yours");
    if (
      order.status === "selesai" ||
      order.status === "penjemputan" ||
      order.status === "pencucian" ||
      order.status === "batal"
    )
      throw new BadRequestError(
        `Failed, order status is already [${order.status}]`
      );

    await OrderQuery.cancelOrder(order_id);

    return `Order ${order_id} cancelled, confirm to whatsapp for more informations`;
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

    await AuthQuery.addResetPasswordToken(resetPasswordToken);
    MailService.sendRequestResetPassword(email, resetPasswordToken);
    return `Requested to ${email}`;
  },
  changePassword: async (req) => {
    let { password: newPassword } = validate(
      CustomerSchema.changePassword,
      req.body
    );

    const { email: emailFromParams, reset_password_token } = req.params;

    const isTokenExist = await AuthQuery.isResetPasswordTokenExist(
      reset_password_token
    );
    if (!isTokenExist) throw new BadRequestError("Token not exist");

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
    await AuthQuery.deleteResetPasswordToken(reset_password_token);
    return `Password for ${emailFromToken} changed succesfully`;
  },
};

export default CustomerService;
