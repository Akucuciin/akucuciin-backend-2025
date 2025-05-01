import LaundryPartnerAppQuery from "../database/queries/laundryPartnerApp.query.mjs";
import LaundryPartnerAppSchema from "../validators/laundryPartnerApp.schema.mjs";
import validate from "../validators/validator.mjs";
import { BadRequestError, NotFoundError, ServerError } from "../errors/customErrors.mjs";
import { generateNanoidWithPrefix, lowerAndCapitalizeFirstLetter } from "../utils/utils.mjs";
import formatOrdersFromDb from "../utils/order.utils.mjs";
import OrderSchema from "../validators/order.schema.mjs";

const LaundryPartnerAppService = {
  //Profile Create and Edit
  getProfile: async (req) => {
    const email = req.user.email;
    const profileLaundryPartner = await LaundryPartnerAppQuery.getProfile(email);
    return profileLaundryPartner;
  },
  updateProfile: async (req) => {
    const id = req.user.id;
    const email = req.user.email;
    const updatedProfile = validate(LaundryPartnerAppSchema.updateProfile, req.body);

    const currentProfile = await LaundryPartnerAppQuery.getProfile(email);
    if (!currentProfile) throw new NotFoundError("Failed, profile not found");

    const values = {
      id,
      name: updatedProfile.name || currentProfile.name,
      description: updatedProfile.description || currentProfile.description,
      telephone: updatedProfile.telephone || currentProfile.telephone,
      address: updatedProfile.address || currentProfile.address,
      maps_pinpoint: updatedProfile.maps_pinpoint || currentProfile.maps_pinpoint,
      city: updatedProfile.city || currentProfile.city,
      area: updatedProfile.area || currentProfile.area,
      latitude: updatedProfile.latitude || currentProfile.latitude,
      longitude: updatedProfile.longitude || currentProfile.longitude,
    };

    values.city = lowerAndCapitalizeFirstLetter(values.city);
    values.area = lowerAndCapitalizeFirstLetter(values.area);

    await LaundryPartnerAppQuery.updateProfile(
        values.id,
        values.name,
        values.description,
        values.telephone,
        values.address,
        values.maps_pinpoint,
        values.city,
        values.area,
        values.latitude,
        values.longitude
    );
    
    return values;
  },
  //Get and Edit Order
  getOrderById: async (req) => {
    const {id: order_id} = req.params;
    const orderById = await LaundryPartnerAppQuery.getOrderById(order_id);

    const orderByIdFormated = formatOrdersFromDb(orderById);
    return orderByIdFormated;
  },
  getOrdersByLaundryPartnerId: async (req) => {
    const {id: laundry_partner_id} = req.params;
    const orders = await LaundryPartnerAppQuery.getOrdersByLaundryPartnerId(laundry_partner_id);
    const ordersFormatted = formatOrdersFromDb(orders);
    return ordersFormatted
  },
  updateStatusOrder: async (req) => {
    const { id: order_id } = req.params;
    const updated = validate(OrderSchema.updateStatus, req.body);

    const order = await LaundryPartnerAppQuery.getOrderById(order_id);
    if (order.status === "batal")
      throw new BadRequestError(
        `Failed, order status is already [${order.status}]`
      );

    const values = {
      order_id,
      status: updated.status || order.status,
      weight: updated.weight || order.weight,
      price: updated.price || order.price,
      status_payment: updated.status_payment || order.status_payment,
    };

    const result = await LaundryPartnerAppQuery.updateStatusOrder(
      values.order_id,
      values.status,
      values.weight,
      values.price,
      values.status_payment
    );

    if (!result.affectedRows) throw new BadRequestError("Failed to update");

    return values;
  }
};

export default LaundryPartnerAppService;
