import axios from "axios";
import crypto from "crypto";
import AppConfig from "../configs/app.config.mjs";
import LaundryPartnerAppQuery from "../database/queries/laundryPartnerApp.query.mjs";
import OrderQuery from "../database/queries/order.query.mjs";
import { BadRequestError } from "../errors/customErrors.mjs";
import {
  formatOrderFromDb,
  formatOrdersFromDb,
  generateInvoiceNumberForPayment,
} from "../utils/order.utils.mjs";
import LaundryPartnerAppSchema from "../validators/laundryPartnerApp.schema.mjs";
import validate from "../validators/validator.mjs";
import PaymentService from "./payment.service.mjs";
import { sendOrderPaymentToCustomer } from "./whatsapp.service.mjs";

const LaundryPartnerAppService = {
  //Profile Create
  getProfile: async (req) => {
    const email = req.user.email;
    const profileLaundryPartner = await LaundryPartnerAppQuery.getProfile(
      email
    );
    return profileLaundryPartner;
  },
  //Get and Edit Order
  getOrderById: async (req) => {
    const { id: order_id } = req.params;
    const orderById = await LaundryPartnerAppQuery.getOrderById(order_id);

    if (orderById.lp_id !== req.user.id) {
      throw new BadRequestError("Access denied. This order is not yours.");
    }

    const orderByIdFormated = formatOrderFromDb(orderById);
    return orderByIdFormated;
  },
  getOrdersByLaundryPartnerId: async (req) => {
    const laundry_partner_id = req.user.id;
    const orders = await LaundryPartnerAppQuery.getOrdersByLaundryPartnerId(
      laundry_partner_id
    );

    const ordersFormatted = formatOrdersFromDb(orders);
    return ordersFormatted;
  },
  updateStatusOrder: async (req) => {
    const { id: order_id } = req.params;
    const updated = validate(LaundryPartnerAppSchema.updateStatus, req.body);

    const order = await LaundryPartnerAppQuery.getOrderById(order_id);

    if (order.lp_id !== req.user.id) {
      throw new BadRequestError("Access denied. This order is not yours.");
    }

    if (order.status === "batal" || order.status === "selesai")
      throw new BadRequestError(
        `Failed, order status is already [${order.status}]`
      );

    const values = {
      order_id,
      status: updated.status || order.status,
      weight: updated.weight || order.weight,
    };

    const result = await LaundryPartnerAppQuery.updateStatusOrder(
      values.order_id,
      values.status,
      values.weight
    );

    if (!result.affectedRows) throw new BadRequestError("Failed to update");

    return values;
  },
  updatePriceOrder: async (req) => {
    const { id: order_id } = req.params;
    const updated = validate(LaundryPartnerAppSchema.updatePrice, req.body);

    const order = await LaundryPartnerAppQuery.getOrderById(order_id);

    if (order.lp_id !== req.user.id) {
      throw new BadRequestError("Access denied. This order is not yours.");
    }

    if (order.weight == 0) {
      throw new BadRequestError("Gagal, update berat terlebih dahulu");
    }

    if (order.price_after != 0) {
      throw new BadRequestError("Gagal, harga tidak dapat dirubah kembali");
    }

    if (order.status === "batal" || order.status === "selesai")
      throw new BadRequestError(
        `Failed, order status is already [${order.status}]`
      );

    const values = {
      order_id,
      price: updated.price || order.price,
    };

    const result = await LaundryPartnerAppQuery.updatePriceOrder(
      values.order_id,
      values.price
    );

    if (!result.affectedRows) throw new BadRequestError("Failed to update");

    // ====== DONE UPDATE PRICE, NOW PERFORM PAYMENT !!!! //
    const ordersJoined = await OrderQuery.getOrderJoinedById(order.id);
    const orderJoined = ordersJoined[0];
    const _order = formatOrderFromDb(orderJoined);

    const calculatePriceAfter = (_order) => {
      const price_after = _order.price * 1.25;

      const hasDriver = _order.driver?.id;
      let service_pay = 0;

      if (hasDriver) {
        service_pay = _order.price >= 20000 ? 3000 : 4000;
      } else {
        service_pay = 1000;
      }

      return { price_after, service_pay };
    };

    const pricing = calculatePriceAfter(_order);
    const pricingTotal = pricing.price_after + pricing.service_pay;

    await LaundryPartnerAppQuery.updatePriceAfterOrder(order_id, pricingTotal);

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
        ), // name::orderId separator
        amount: parseInt(pricingTotal),
        currency: "IDR",
        callback_url_result: "https://akucuciin.com",
        language: "ID",
        line_items: [
          {
            name: `Laundry ${_order.weight} kg - ${_order.laundry_partner.name}`,
            price: parseInt(pricing.price_after),
            quantity: 1,
          },
          {
            name: "Biaya Layanan",
            price: parseInt(pricing.service_pay),
            quantity: 1,
          },
        ],
      },
      payment: {
        payment_due_date: 1440, // in minutes
        type: "SALE",
        payment_method_types: ["QRIS"],
      },
      additional_info: {
        override_notification_url: AppConfig.PAYMENT.DOKU.callback_url,
      },
    };
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString().split(".")[0] + "Z";

    const rawBody = JSON.stringify(payload);
    const headers = {
      "Client-Id": AppConfig.PAYMENT.DOKU.clientId,
      "Request-Id": requestId,
      "Request-Timestamp": timestamp,
      Signature: PaymentService.Doku.generateSignature(
        rawBody,
        requestId,
        timestamp
      ),
    };

    try {
      const response = await axios.post(AppConfig.PAYMENT.DOKU.url, payload, {
        headers,
      });
      const paymentLink = response.data.response.payment.url;
      await OrderQuery.updatePaymentLinkOrder(_order.id, paymentLink);
      await sendOrderPaymentToCustomer(_order, paymentLink);
      return { url: paymentLink };
    } catch (err) {
      console.log(err);
      throw new BadRequestError(
        err.response.data.message || "Error Creating Payment"
      );
    }
    // ====== END PAYMENT //
  },
};

export default LaundryPartnerAppService;
