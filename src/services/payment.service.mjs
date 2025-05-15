import axios from "axios";
import crypto from "crypto";
import AppConfig from "../configs/app.config.mjs";
import LaundryPartnerAppQuery from "../database/queries/laundryPartnerApp.query.mjs";
import { BadRequestError } from "../errors/customErrors.mjs";
import { generateInvoiceNumberForPayment } from "../utils/order.utils.mjs";

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

function localGenerateSignature(rawBody, requestId, timestamp) {
  const digestHash = generateDigest(rawBody);
  return generateSignatureDoku(
    AppConfig.PAYMENT.DOKU.clientId,
    requestId,
    timestamp,
    AppConfig.PAYMENT.DOKU.signature.requestTarget,
    digestHash,
    AppConfig.PAYMENT.DOKU.secretKey
  );
}

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
      }/${generateInvoiceNumberForPayment(
        _order.laundry_partner.name,
        _order.id
      )}`;

      return generateSignatureDoku(
        AppConfig.PAYMENT.DOKU.clientId,
        requestId,
        timestamp,
        requestTarget,
        null,
        AppConfig.PAYMENT.DOKU.secretKey
      );
    },
    generateOrderPaymentLink: async (orderId, _order) => {
      // === Step 2: Pricing logic
      const calculatePriceAfter = (_order) => {
        const price_after = Math.round(_order.price * 1.25);
        const hasDriver = _order.driver?.id;
        const service_pay = hasDriver
          ? _order.price >= 20000
            ? 3000
            : 4000
          : 1000;
        return { price_after, service_pay };
      };

      const pricing = calculatePriceAfter(_order);
      const totalPrice = pricing.price_after + pricing.service_pay;

      await LaundryPartnerAppQuery.updatePriceAfterOrder(orderId, totalPrice);

      // === Step 3: Build payment payload
      const payload = {
        customer: {
          id: _order.customer.id,
          name: _order.customer.name,
          phone: _order.customer.telephone,
          email: _order.customer.email,
          address: _order.customer.address,
          country: "ID",
        },
        order: {
          invoice_number: generateInvoiceNumberForPayment(
            _order.laundry_partner.name,
            _order.id
          ),
          amount: parseInt(totalPrice, 10),
          currency: "IDR",
          callback_url_result: "https://akucuciin.com",
          language: "ID",
          line_items: [
            {
              name: `Laundry ${_order.weight} kg - ${_order.laundry_partner.name}`,
              price: parseInt(pricing.price_after, 10),
              quantity: 1,
            },
            {
              name: "Biaya Layanan",
              price: parseInt(pricing.service_pay, 10),
              quantity: 1,
            },
          ],
        },
        payment: {
          payment_due_date: AppConfig.PAYMENT.DOKU.expiredTime,
          type: "SALE",
          payment_method_types: ["QRIS"],
        },
        additional_info: {
          override_notification_url: AppConfig.PAYMENT.DOKU.callback_url,
        },
      };

      // === Step 4: Prepare headers
      const requestId = crypto.randomUUID();
      const timestamp = new Date().toISOString().split(".")[0] + "Z";
      const rawBody = JSON.stringify(payload);
      const headers = {
        "Client-Id": AppConfig.PAYMENT.DOKU.clientId,
        "Request-Id": requestId,
        "Request-Timestamp": timestamp,
        Signature: localGenerateSignature(rawBody, requestId, timestamp),
      };
      // === Step 5: Send to DOKU & update DB
      try {
        const response = await axios.post(AppConfig.PAYMENT.DOKU.url, payload, {
          headers,
        });
        const paymentLink = response.data.response.payment.url;

        if (!paymentLink)
          throw new BadRequestError("Failed to get payment URL from Gateway");

        return paymentLink;
      } catch (err) {
        console.error(err);
        throw new BadRequestError(
          err?.response?.data?.message || "Error Creating Payment"
        );
      }
    },
  },
};

export default PaymentService;
