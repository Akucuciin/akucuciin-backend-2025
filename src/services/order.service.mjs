import OrderQuery from "../database/queries/order.query.mjs";
import { generateUUID } from "../utils/utils.mjs";
import OrderSchema from "../validators/order.schema.mjs";
import validate from "../validators/validator.mjs";

const OrderService = {
  create: async (req) => {
    const order = validate(OrderSchema.create, req.body);

    order.id = generateUUID("ORDER");
    order.customer_id = req.user.id;

    await OrderQuery.create(
      order.id,
      order.customer_id,
      order.laundry_partner_id,
      order.content,
      order.status,
      order.weight,
      order.price,
      order.coupon_code
    );

    return {
      order,
    };
  },
};

export default OrderService;
