import crypto from "crypto";

import AppConfig from "../configs/app.config.mjs";

export default PaymentService = {
  Doku: {
    generateSignature: (body, requestId, timestamp) => {
      const rawBody = JSON.stringify(body);
      const digestRawBody = crypto
        .createHash("sha256")
        .update(rawBody)
        .digest("base64");

      const digest = crypto
        .createHmac("sha256", AppConfig.PAYMENT.DOKU.secretKey)
        .update(
          `Client-Id:${AppConfig.PAYMENT.DOKU.clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${AppConfig.PAYMENT.DOKU.signature.requestTarget}\nDigest:${digestRawBody}`
        )
        .digest("base64");
      return `HMACSHA256=${digest}`;
    },
  },
};
