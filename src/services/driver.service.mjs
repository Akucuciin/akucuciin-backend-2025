import DriverQuery from '../database/queries/driver.query.mjs';
import OrderQuery from '../database/queries/order.query.mjs';
import {
  AuthorizationError,
  BadRequestError,
  NotFoundError,
} from '../errors/customErrors.mjs';
import { formatOrdersFromDb } from '../utils/order.utils.mjs';
import OrderSchema from '../validators/order.schema.mjs';
import validate from '../validators/validator.mjs';

const DriverService = {
  getProfile: async (req) => {
    const driver = await DriverQuery.getById(req.user.id);

    delete driver.password;

    return driver;
  },
  getOrdersAssigned: async (req) => {
    const orders = await OrderQuery.getOrdersJoinedByDriver(req.user.id);
    const ordersFormatted = formatOrdersFromDb(orders);

    return ordersFormatted;
  },
  updateOrderStatus: async (req) => {
    const { id: order_id } = req.params;
    const updatedStatus = validate(OrderSchema.updateStatusByDriver, req.body);

    const order = await OrderQuery.getOrderById(order_id);
    if (!order) throw new NotFoundError('Failed, order not found');
    if (order.driver_id !== req.user.id)
      throw new AuthorizationError('Failed, unauthorized access');
    if (order.status === 'selesai')
      throw new BadRequestError(
        `Failed, order status is already [${order.status}]`
      );

    await OrderQuery.updateStatusByDriver(order_id, updatedStatus.status);

    return `${order_id} status updated to [${updatedStatus.status}]`;
  },
};

export default DriverService;
