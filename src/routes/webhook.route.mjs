import { Router } from "express";
import passport from "../auth/passport.auth.mjs";
import AppConfig from "../configs/app.config.mjs";
import AuthQuery from "../database/queries/auth.query.mjs";
import OrderQuery from "../database/queries/order.query.mjs";
import PaymentService from "../services/payment.service.mjs";
import TokenService from "../services/token.service.mjs";
import { sendOrderPaymentCompletedToCustomer } from "../services/whatsapp.service.mjs";
import { formatOrderFromDb } from "../utils/order.utils.mjs";

const WebhookRouter = Router();
WebhookRouter.post("/api/payment/webhook", async (req, res) => {
  // --- Signature Verification
  try {
    const receivedSignature = req.headers["signature"];
    const requestId = req.headers["request-id"];
    const requestTimestamp = req.headers["request-timestamp"];
    const requestTarget = "/api/payment/webhook";

    if (!receivedSignature) {
      return res.status(401).send("Missing Signature");
    }

    const generatedSignature =
      PaymentService.Doku.generateSignatureForValidation(
        req.rawBody,
        requestId,
        requestTimestamp,
        requestTarget
      );

    if (generatedSignature !== receivedSignature) {
      return res.status(401).send("Invalid Signature");
    }
  } catch (error) {
    return res.status(401).send("Signature verification failed");
  }

  // --- End of Signature Verification

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

  return res.status(200).send("OK");
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
