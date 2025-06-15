import crypto from "crypto";
import { Router } from "express";
import passport from "../auth/passport.auth.mjs";
import AppConfig from "../configs/app.config.mjs";
import AuthQuery from "../database/queries/auth.query.mjs";
import OrderQuery from "../database/queries/order.query.mjs";
import TokenService from "../services/token.service.mjs";
import { sendOrderPaymentCompletedToCustomer } from "../services/whatsapp.service.mjs";
import { formatOrderFromDb } from "../utils/order.utils.mjs";

const WebhookRouter = Router();
WebhookRouter.post("/api/payment/webhook", async (req, res) => {
  // --- Signature Verification
  const receivedSignature = req.headers["signature"];
  const clientId = req.headers["client-id"];
  const requestId = req.headers["request-id"];
  const requestTimestamp = req.headers["request-timestamp"];
  const requestTarget = "/api/payment/webhook";

  const secretKey = AppConfig.PAYMENT.DOKU.secretKey;

  if (!receivedSignature) {
    return res.status(401).send("Missing Signature");
  }

  // ✅ Step 1: Digest = base64(sha256(rawBody))
  const digest = crypto
    .createHash("sha256")
    .update(req.rawBody, "utf8")
    .digest("base64");

  // ✅ Step 2: Construct signature string
  const signatureString = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;

  // ✅ Step 3: Create HMAC SHA256 base64 signature
  const generatedSignature =
    "HMACSHA256=" +
    crypto
      .createHmac("sha256", secretKey)
      .update(signatureString)
      .digest("base64");

  // ✅ Step 4: Compare
  console.log("Generated Signature:", generatedSignature);
  console.log("Received Signature:", receivedSignature);
  if (generatedSignature !== receivedSignature) {
    return res.status(401).send("Invalid Signature");
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
