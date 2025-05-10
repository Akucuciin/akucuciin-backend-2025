import LaundryPartnerAppQuery from "../database/queries/laundryPartnerApp.query.mjs";
import LaundryPartnerAppSchema from "../validators/laundryPartnerApp.schema.mjs";
import validate from "../validators/validator.mjs";
import { BadRequestError } from "../errors/customErrors.mjs";
import formatOrdersFromDb from "../utils/order.utils.mjs";

const LaundryPartnerAppService = {
  //Profile Create
  getProfile: async (req) => {
    const email = req.user.email;
    const profileLaundryPartner = await LaundryPartnerAppQuery.getProfile(email);
    return profileLaundryPartner;
  },
  //Get and Edit Order
  getOrderById: async (req) => {
    const {id: order_id} = req.params;
    const orderById = await LaundryPartnerAppQuery.getOrderById(order_id);

    if (orderById[0].lp_id !== req.user.id) {
      throw new BadRequestError("Access denied. This order is not yours.");
    }
  
    const orderByIdFormated = formatOrdersFromDb(orderById);
    return orderByIdFormated;
  },
  getOrdersByLaundryPartnerId: async (req) => {
    const laundry_partner_id = req.user.id;
    const orders = await LaundryPartnerAppQuery.getOrdersByLaundryPartnerId(laundry_partner_id);

    const ordersFormatted = formatOrdersFromDb(orders);
    return ordersFormatted
  },
  updateStatusOrder: async (req) => {
    const { id: order_id } = req.params;
    const updated = validate(LaundryPartnerAppSchema.updateStatus, req.body);

    const order = await LaundryPartnerAppQuery.getOrderById(order_id);

    if (order[0].lp_id !== req.user.id) {
      throw new BadRequestError("Access denied. This order is not yours.");
    }

    if (order.status === "batal")
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
      values.weight,
    );

    if (!result.affectedRows) throw new BadRequestError("Failed to update");

    return values;
  },
  updatePriceOrder: async (req) => {
    const { id: order_id } = req.params;
    const updated = validate(LaundryPartnerAppSchema.updatePrice, req.body);

    const order = await LaundryPartnerAppQuery.getOrderById(order_id);

    if (order[0].lp_id !== req.user.id) {
      throw new BadRequestError("Access denied. This order is not yours.");
    }

    const values = {
      order_id,
      price: updated.price || order.price,
    };

    const result = await LaundryPartnerAppQuery.updatePriceOrder(
      values.order_id,
      values.price,
    );

    if (!result.affectedRows) throw new BadRequestError("Failed to update");

    return values;
  }
};

export default LaundryPartnerAppService;
