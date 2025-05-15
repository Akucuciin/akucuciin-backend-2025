import LaundryPartnerAppQuery from "../database/queries/laundryPartnerApp.query.mjs";
import OrderQuery from "../database/queries/order.query.mjs";
import { BadRequestError } from "../errors/customErrors.mjs";
import {
  formatOrderFromDb,
  formatOrdersFromDb,
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

    const ordersJoined = await OrderQuery.getOrderJoinedById(order_id);
    const orderJoined = ordersJoined[0];
    const _order = formatOrderFromDb(orderJoined);

    // ====== DONE UPDATE PRICE, NOW PERFORM PAYMENT !!!! //
    const paymentLink = await PaymentService.Doku.generateOrderPaymentLink(
      order_id,
      _order
    );
    await OrderQuery.updatePaymentLinkOrder(order_id, paymentLink);
    await sendOrderPaymentToCustomer(_order, paymentLink);

    return { url: paymentLink };

    // ====== END PAYMENT //
  },
};

export default LaundryPartnerAppService;
