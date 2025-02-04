import bcrypt from "bcrypt";
import AppConfig from "../configs/app.config.mjs";
import AdminQuery from "../database/queries/admin.query.mjs";
import AuthQuery from "../database/queries/auth.query.mjs";
import CustomerQuery from "../database/queries/customer.query.mjs";
import DriverQuery from "../database/queries/driver.query.mjs";
import { AuthenticationError } from "../errors/customErrors.mjs";
import AuthSchema from "../validators/auth.schema.mjs";
import validate from "../validators/validator.mjs";
import TokenService from "./token.service.mjs";

const AuthService = {
  loginAdmin: async (req) => {
    const credentials = validate(AuthSchema.login, req.body);

    const admin = await AdminQuery.getAdminForAuth(credentials.email);
    if (!admin)
      throw new AuthenticationError("Login gagal, akun tidak ditemukan");

    const isPasswordMatch = await bcrypt.compare(
      credentials.password,
      admin.password
    );
    if (!isPasswordMatch)
      throw new AuthenticationError("Login gagal, kredensial salah");

    const { id, email } = admin;
    const accessToken = TokenService.generateAccessToken(id, email);
    const refreshToken = TokenService.generateRefreshToken(id, email);

    try {
      await AuthQuery.addRefreshToken(id, refreshToken);
    } catch (e) {
      try {
        await AuthQuery.updateRefreshTokenLogin(id, refreshToken);
      } catch (e) {}
    }

    return { accessToken, refreshToken };
  },
  loginCustomer: async (req) => {
    const credentials = validate(AuthSchema.login, req.body);

    const customer = await CustomerQuery.getCustomerForAuth(credentials.email);
    if (!customer)
      throw new AuthenticationError("Login gagal, akun tidak ditemukan");
    if (customer.isActive === 0)
      throw new AuthenticationError("Login gagal, akun belum diaktivasi");

    const isPasswordMatch = await bcrypt.compare(
      credentials.password,
      customer.password
    );
    if (!isPasswordMatch)
      throw new AuthenticationError("Login gagal, kredensial salah");

    const { id, email } = customer;
    const accessToken = TokenService.generateAccessToken(id, email);
    const refreshToken = TokenService.generateRefreshToken(id, email);

    try {
      await AuthQuery.addRefreshToken(id, refreshToken);
    } catch (e) {
      try {
        await AuthQuery.updateRefreshTokenLogin(id, refreshToken);
      } catch (e) {}
    }

    return { accessToken, refreshToken };
  },
  loginDriver: async (req) => {
    const credentials = validate(AuthSchema.login, req.body);
    
    const driver = await DriverQuery.getByEmailForAuth(credentials.email);
    if (!driver)
      throw new AuthenticationError("Login gagal, akun tidak ditemukan");

    const isPasswordMatch = await bcrypt.compare(
      credentials.password,
      driver.password
    );
    if (!isPasswordMatch)
      throw new AuthenticationError("Login gagal, kredensial salah");

    const { id, email } = driver;
    const accessToken = TokenService.generateAccessToken(id, email);
    const refreshToken = TokenService.generateRefreshToken(id, email);

    try {
      await AuthQuery.addRefreshToken(id, refreshToken);
    } catch (e) {
      try {
        await AuthQuery.updateRefreshTokenLogin(id, refreshToken);
      } catch (e) {}
    }

    return { accessToken, refreshToken };
  },
  logout: async (req) => {
    const { refresh_token: refreshToken } = validate(
      AuthSchema.logout,
      req.body
    );

    const isRefreshTokenExists = await AuthQuery.isRefreshTokenExists(
      refreshToken
    );
    if (!isRefreshTokenExists || isRefreshTokenExists == 0)
      throw new AuthenticationError("Invalid refresh token");

    await AuthQuery.deleteRefreshToken(refreshToken);

    return "Log out berhasil";
  },
  refresh: async (req) => {
    const { refresh_token: refreshToken } = validate(
      AuthSchema.refresh,
      req.body
    );

    const isRefreshTokenExists = await AuthQuery.isRefreshTokenExists(
      refreshToken
    );
    if (!isRefreshTokenExists)
      throw new AuthenticationError("Invalid refresh token");

    const { id, email } = TokenService.verifyToken(
      refreshToken,
      AppConfig.JWT.refreshTokenSecret
    );
    let newAccessToken = TokenService.generateAccessToken(id, email);
    let newRefreshToken = TokenService.generateRefreshToken(id, email);
    await AuthQuery.updateRefreshToken(id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },
};

export default AuthService;
