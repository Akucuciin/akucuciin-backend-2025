import crypto from "crypto";
import AppConfig from "../configs/app.config.mjs";
import { generateOrderIdForPayment } from "../utils/order.utils.mjs";

function generateDigest(jsonBody) {
  let jsonStringHash256 = crypto
    .createHash("sha256")
    .update(jsonBody, "utf-8")
    .digest();

  let bufferFromJsonStringHash256 = Buffer.from(jsonStringHash256);
  return bufferFromJsonStringHash256.toString("base64");
}

function generateSignatureDoku(
  clientId,
  requestId,
  requestTimestamp,
  requestTarget,
  digest,
  secret
) {
  // Prepare Signature Component
  let componentSignature = "Client-Id:" + clientId;
  componentSignature += "\n";
  componentSignature += "Request-Id:" + requestId;
  componentSignature += "\n";
  componentSignature += "Request-Timestamp:" + requestTimestamp;
  componentSignature += "\n";
  componentSignature += "Request-Target:" + requestTarget;
  // If body not send when access API with HTTP method GET/DELETE
  if (digest) {
    componentSignature += "\n";
    componentSignature += "Digest:" + digest;
  }

  // Calculate HMAC-SHA256 base64 from all the components above
  let hmac256Value = crypto
    .createHmac("sha256", secret)
    .update(componentSignature.toString())
    .digest();

  let bufferFromHmac256Value = Buffer.from(hmac256Value);
  let signature = bufferFromHmac256Value.toString("base64");
  // Prepend encoded result with algorithm info HMACSHA256=
  return "HMACSHA256=" + signature;
}

const PaymentService = {
  Doku: {
    generateSignature: (rawBody, requestId, timestamp) => {
      const digestHash = generateDigest(rawBody);
      return generateSignatureDoku(
        AppConfig.PAYMENT.DOKU.clientId,
        requestId,
        timestamp,
        AppConfig.PAYMENT.DOKU.signature.requestTarget,
        digestHash,
        AppConfig.PAYMENT.DOKU.secretKey
      );
    },
    generateSignatureWithoutDigest: (requestId, timestamp, _order) => {
      const requestTarget = `${
        AppConfig.PAYMENT.DOKU.signature.checkStatusRequestTarget
      }/${generateOrderIdForPayment(_order.laundry_partner.name, _order.id)}`;

      return generateSignatureDoku(
        AppConfig.PAYMENT.DOKU.clientId,
        requestId,
        timestamp,
        requestTarget,
        null,
        AppConfig.PAYMENT.DOKU.secretKey
      );
    },
  },
};

export default PaymentService;
