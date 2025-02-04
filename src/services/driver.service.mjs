import DriverQuery from "../database/queries/driver.query.mjs";
import OrderQuery from "../database/queries/order.query.mjs";
import formatOrdersFromDb from "../utils/order.utils.mjs";

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
};

export default DriverService;
