import crypto from "crypto";
import AppConfig from "../configs/app.config.mjs";

const PaymentService = {
  Doku: {
    generateSignature: (body, requestId, timestamp) => {
      const rawBody = JSON.stringify(body);
      const digestHash = crypto
        .createHash("sha256")
        .update(rawBody)
        .digest("base64");

      const signatureString = [
        `Client-Id:${AppConfig.PAYMENT.DOKU.clientId}`,
        `Request-Id:${requestId}`,
        `Request-Timestamp:${timestamp}`,
        `Request-Target:${AppConfig.PAYMENT.DOKU.signature.requestTarget}`,
        `Digest:${digestHash}`,
      ].join("\n");

      const hmacSignature = crypto
        .createHmac("sha256", AppConfig.PAYMENT.DOKU.secretKey)
        .update(signatureString)
        .digest("base64");

      return `HMACSHA256=${hmacSignature}`;
    },
  },
};

export default PaymentService;
