import axios from "axios";
import crypto from "crypto";
import AppConfig from "../configs/app.config.mjs";
import CouponQuery from "../database/queries/coupon.query.mjs";
import LaundryPartnerAppQuery from "../database/queries/laundryPartnerApp.query.mjs";
import { BadRequestError } from "../errors/customErrors.mjs";
import { generateInvoiceNumberForPayment } from "../utils/order.utils.mjs";

export function generateDigest(jsonBody) {
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
    generateSignatureForValidation: (
      rawBody,
      requestId,
      timestamp,
      requestTarget
    ) => {
      const digestHash = generateDigest(rawBody);
      return generateSignatureDoku(
        AppConfig.PAYMENT.DOKU.clientId,
        requestId,
        timestamp,
        requestTarget,
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
    generateOrderPaymentLink: async (orderId, _order, trx) => {
      // === Step 1: Pricing logic
      let discountMultiplier = 0;
      let isCoupon = false;
      let coupon = null;
      let isReferralCode = false;
      // === Step 1.1: Coupon logic
      if (_order.coupon_code) {
        coupon = await CouponQuery.get(_order.coupon_code, trx);
        discountMultiplier = coupon.multiplier / 100; // eg: multipler = 20, the 0.2
        isCoupon = true;
      }

      if (_order.referral_code) {
        isReferralCode = true;
      }

      const calculatePriceAfter = async (_order) => {
        const aggregator = _order.price / _order.weight;
        let price_after_multiplier;

        if (aggregator >= 20000) {
          price_after_multiplier = 1.12;
        } else if (aggregator >= 10000) {
          price_after_multiplier = 1.15;
        } else if (aggregator > 3000) {
          price_after_multiplier = 1.2;
        } else {
          price_after_multiplier = 1.35;
        }

        const price_after = Math.round(_order.price * price_after_multiplier);
        let discountApplied = isCoupon;
        let haveMaxDiscount = false;
        const hasDriver = _order.driver?.id;
        let admin_pay = 1000;
        let driver_pay = 0;
        let discount_cut = 0;

        let referralCodeApplied = isReferralCode;
        let referral_cut = 0;

        if (discountApplied) {
          if (coupon.min_weight && _order.weight < coupon.min_weight) {
            // not meet minimum kg,  set coupon to be used again
            console.error("not meet minimum kg");
            if (coupon.is_used == -1) {
            }
            if (coupon.is_used == 1)
              await CouponQuery.setNotUsed(coupon.name, trx);
            discountApplied = false;
          } else {
            // meet minimum kg
            discount_cut = price_after * discountMultiplier;

            if (coupon.max_discount && discount_cut > coupon.max_discount) {
              discount_cut = coupon.max_discount;
            }

            if (coupon.max_discount) haveMaxDiscount = true;

            if (coupon.multiplier == 100 && !coupon.max_discount) {
              // 100% Discount
              admin_pay = 1;
            }
          }
        }

        if (referralCodeApplied) {
          referral_cut = (5 / 100) * (price_after - discount_cut);
        }

        if (hasDriver) {
          driver_pay = 3000;
        }

        return {
          price_after,
          admin_pay,
          discount_cut,
          driver_pay,
          discountApplied: discountApplied,
          haveMaxDiscount: haveMaxDiscount,
          hasDriver: hasDriver,
          referralCodeApplied: referralCodeApplied,
          referral_cut: referral_cut,
        };
      };

      const pricing = await calculatePriceAfter(_order);
      pricing.discount_cut = parseInt(`-${pricing.discount_cut}`, 10);
      pricing.referral_cut = parseInt(`-${pricing.referral_cut}`, 10);

      const totalPrice =
        pricing.price_after +
        pricing.admin_pay +
        pricing.discount_cut +
        pricing.driver_pay +
        pricing.referral_cut;

      console.error(pricing);

      await LaundryPartnerAppQuery.updatePriceAfterOrder(
        orderId,
        totalPrice,
        trx
      );

      // === Step 2: Build payment payload
      const payload = {
        customer: {
          id: _order.customer.id,
          name: _order.customer.name.replace(/[^a-zA-Z ]/g, ""),
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
              name: `${_order.package.name.replace(/[^a-zA-Z0-9 ]/g, " ")} ${
                _order.weight
              } kg - ${_order.laundry_partner.name}`,
              price: parseInt(pricing.price_after, 10),
              quantity: 1,
            },
            {
              name: "Biaya Admin",
              price: parseInt(pricing.admin_pay, 10),
              quantity: 1,
            },
            {
              name: `Biaya Ongkir`,
              price: parseInt(pricing.driver_pay, 10),
              quantity: 1,
            },
            pricing.discountApplied
              ? {
                  name: `Kupon ${coupon.name} - ${coupon.multiplier}% ${
                    pricing.haveMaxDiscount
                      ? `: Max Rp${coupon.max_discount}`
                      : ""
                  }`,
                  price: pricing.discount_cut,
                  quantity: 1,
                }
              : null,
            pricing.referralCodeApplied
              ? {
                  name: pricing.discountApplied
                    ? `Potongan +5% Referral Code`
                    : `Potongan Referral Code 5%`,
                  price: pricing.referral_cut,
                  quantity: 1,
                }
              : null,
          ].filter(Boolean),
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

      // === Step 3: Prepare headers
      const requestId = crypto.randomUUID();
      const timestamp = new Date().toISOString().split(".")[0] + "Z";
      const rawBody = JSON.stringify(payload);
      const headers = {
        "Client-Id": AppConfig.PAYMENT.DOKU.clientId,
        "Request-Id": requestId,
        "Request-Timestamp": timestamp,
        Signature: localGenerateSignature(rawBody, requestId, timestamp),
      };

      // === Step 4: Send to DOKU
      try {
        const response = await axios.post(AppConfig.PAYMENT.DOKU.url, payload, {
          headers,
        });
        const paymentLink = response.data.response.payment.url;

        if (!paymentLink)
          throw new BadRequestError("Failed to get payment URL from Gateway");

        return paymentLink;
      } catch (err) {
        //console.error(err);
        throw new BadRequestError(
          err?.response?.data?.message || "Error Creating Payment"
        );
      }
    },
  },
};

export default PaymentService;
