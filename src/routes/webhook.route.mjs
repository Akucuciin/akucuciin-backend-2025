import { Router } from "express";
import crypto from "node:crypto";
import passport from "../auth/passport.auth.mjs";
import AppConfig from "../configs/app.config.mjs";
import AuthQuery from "../database/queries/auth.query.mjs";
import OrderQuery from "../database/queries/order.query.mjs";
import { AuthenticationError } from "../errors/customErrors.mjs";
import TokenService from "../services/token.service.mjs";
import { sendOrderPaymentCompletedToCustomer } from "../services/whatsapp.service.mjs";
import { formatOrderFromDb } from "../utils/order.utils.mjs";

const WebhookRouter = Router();

WebhookRouter.post("/api/payment/webhook", async (req, res) => {
  // --- Signature Verification
  const secretKey = AppConfig.PAYMENT.DOKU.secretKey;
  const receivedSignature = req.headers["signature"];

  if (!receivedSignature) {
    throw new AuthenticationError("Signature not found");
  }

  const generatedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(req.rawBody)
    .digest("hex");

  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(generatedSignature, "hex"),
    Buffer.from(receivedSignature, "hex")
  );

  if (!isSignatureValid) {
    throw new AuthenticationError("Invalid signature");
  }
  // --- End

  const notification = req.body;
  const rawInvoice = notification.order.invoice_number;
  const [name, orderId, unique] = rawInvoice.split("::"); // name::orderId::unique
  const status = notification.transaction.status;

  if (status === "SUCCESS") {
    await OrderQuery.updateStatusPayment(orderId, "sudah bayar");
    const ordersJoined = await OrderQuery.getOrderJoinedById(orderId);
    const orderJoined = ordersJoined[0];
    const _order = formatOrderFromDb(orderJoined);

    await sendOrderPaymentCompletedToCustomer(_order, rawInvoice);
    console.log("Pembayaran sukses untuk order", orderId);
  }

  res.status(200).send("OK");
});

WebhookRouter.get(
  "/api/auth/customer/google/webhook",
  passport.authenticate("customer-google-auth", {
    session: false,
    failureRedirect: `${AppConfig.Server.frontendBaseUrl}/login`,
  }),
  async (req, res) => {
    const { id, email } = req.user;
    const accessToken = TokenService.generateAccessToken(id, email);
    const refreshToken = TokenService.generateRefreshToken(id, email);

    try {
      await AuthQuery.addRefreshToken(id, refreshToken);
      console.log("webhook add refresh");
    } catch (e) {
      try {
        await AuthQuery.updateRefreshTokenLogin(id, refreshToken);
        console.log("webhook update refresh");
      } catch (e) {}
    }

    return res.redirect(
      `${AppConfig.Server.frontendBaseUrl}/googleoauthsuccess?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);

export default WebhookRouter;
