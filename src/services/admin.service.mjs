import bcrypt from "bcrypt";

import AdminQuery from "../database/queries/admin.query.mjs";
import LaundryPartnerQuery from "../database/queries/laundryPartner.query.mjs";
import OrderQuery from "../database/queries/order.query.mjs";
import { BadRequestError, NotFoundError } from "../errors/customErrors.mjs";
import {
  generateUuidWithPrefix,
  lowerAndCapitalizeFirstLetter,
} from "../utils/utils.mjs";
import LaundryPartnerSchema from "../validators/laundryPartner.schema.mjs";
import validate from "../validators/validator.mjs";

const AdminService = {
  getCustomers: async (req) => {
    const customers = await AdminQuery.getCustomers();
    return customers;
  },
  getLaundryPartners: async (req) => {
    const laundryPartners = await AdminQuery.getLaundryPartners();
    return laundryPartners;
  },
  registerLaundryPartner: async (req) => {
    const laundryPartner = validate(LaundryPartnerSchema.register, req.body);

    const isEmailExists = await LaundryPartnerQuery.isEmailExists(
      laundryPartner.email
    );
    if (isEmailExists) throw new BadRequestError("Email sudah terdaftar");

    laundryPartner.id = generateUuidWithPrefix("LP");
    laundryPartner.password = await bcrypt.hash(laundryPartner.password, 12);
    laundryPartner.city = lowerAndCapitalizeFirstLetter(laundryPartner.city);
    laundryPartner.area = lowerAndCapitalizeFirstLetter(laundryPartner.area);

    await LaundryPartnerQuery.register(
      laundryPartner.id,
      laundryPartner.name,
      laundryPartner.email,
      laundryPartner.password,
      laundryPartner.description,
      laundryPartner.telephone,
      laundryPartner.address,
      laundryPartner.city,
      laundryPartner.area,
      laundryPartner.latitude,
      laundryPartner.longitude
    );

    return {
      id: laundryPartner.id,
      name: laundryPartner.name,
      email: laundryPartner.email,
      telephone: laundryPartner.telephone,
      address: laundryPartner.address,
      city: laundryPartner.city,
      area: laundryPartner.area,
      latitude: laundryPartner.latitude,
      longitude: laundryPartner.longitude,
    };
  },
  deleteLaundryPartner: async (req) => {
    const { id } = req.params;
    const result = await LaundryPartnerQuery.delete(id);

    if (!result.affectedRows)
      throw new NotFoundError("Failed delete laundry, not found");
    return `Laundry partner with id : ${id}, succesfully deleted`;
  },
  updateLaundryPartner: async (req) => {
    const { id } = req.params;
    const updatedLaundryPartner = validate(
      LaundryPartnerSchema.update,
      req.body
    );

    const laundryPartner = await LaundryPartnerQuery.getById(id);
    if (!laundryPartner) throw new NotFoundError("Failed laundry not found");

    const values = {
      id,
      name: updatedLaundryPartner.name || laundryPartner.name,
      description:
        updatedLaundryPartner.description || laundryPartner.description,
      telephone: updatedLaundryPartner.telephone || laundryPartner.telephone,
      address: updatedLaundryPartner.address || laundryPartner.address,
      city: updatedLaundryPartner.city || laundryPartner.city,
      area: updatedLaundryPartner.area || laundryPartner.area,
      latitude: updatedLaundryPartner.latitude || laundryPartner.latitude,
      longitude: updatedLaundryPartner.longitude || laundryPartner.longitude,
    };
    values.city = lowerAndCapitalizeFirstLetter(values.city);
    values.area = lowerAndCapitalizeFirstLetter(values.area);

    await LaundryPartnerQuery.update(
      values.id,
      values.name,
      values.description,
      values.telephone,
      values.address,
      values.city,
      values.area,
      values.latitude,
      values.longitude
    );

    return values;
  },
  addLaundryPartnerPackage: async (req) => {
    const { id: laundry_partner_id } = req.params;
    const npackage = validate(LaundryPartnerSchema.addPackage, req.body);

    npackage.id = generateUuidWithPrefix("LPPACKAGES");
    npackage.laundry_partner_id = laundry_partner_id;

    const result = await AdminQuery.addLaundryPartnerPackage(
      npackage.id,
      npackage.laundry_partner_id,
      npackage.name,
      npackage.description,
      npackage.features,
      npackage.price_text
    );

    if (!result.affectedRows)
      throw new BadRequestError("Failed, cant add laundry packages");

    return npackage;
  },
  getLaundryPartnerPackage: async (req) => {
    const { id: laundry_partner_id, package_id } = req.params;
    const npackage = await LaundryPartnerQuery.getPackageOfPartnerById(
      laundry_partner_id,
      package_id
    );

    if (!npackage) throw new NotFoundError("Failed package not found");

    return npackage;
  },
  deleteLaundryPartnerPackage: async (req) => {
    const { id: laundry_partner_id, package_id } = req.params;

    const result = await AdminQuery.deleteLaundryPartnerPackage(
      laundry_partner_id,
      package_id
    );

    if (!result.affectedRows)
      throw new BadRequestError("Failed delete package");

    return `${package_id} successfully deleted`;
  },
  updateLaundryPartnerPackage: async (req) => {
    const { id: laundry_partner_id, package_id } = req.params;

    const updatedPackage = validate(
      LaundryPartnerSchema.updatePackage,
      req.body
    );

    const npackage = await LaundryPartnerQuery.getPackageOfPartnerById(
      laundry_partner_id,
      package_id
    );
    if (!npackage)
      throw new NotFoundError("Failed, package of laundry not found");

    const values = {
      id: package_id,
      name: updatedPackage.name || npackage.name,
      description: updatedPackage.description || npackage.description,
      features: updatedPackage.features || npackage.features,
      price_text: updatedPackage.price_text || npackage.price_text,
    };

    const result = await LaundryPartnerQuery.updatePackage(
      values.id,
      values.name,
      values.description,
      values.features,
      values.price_text
    );

    if (!result.affectedRows) throw new BadRequestError("Failed to update");

    return values;
  },
  getOrdersJoined: async (req) => {
    const orders = await OrderQuery.getOrdersJoined();

    const ordersFormatted = orders.map((row) => ({
      id: row.id,
      content: row.content,
      status: row.status,
      weight: row.weight,
      price: row.price,
      coupon_code: row.coupon_code,
      created_at: row.created_at,
      customer: {
        id: row.c_id,
        name: row.c_name,
        email: row.c_email,
        address: row.c_address,
        telephone: row.c_telephone,
      },
      laundry_partner: {
        id: row.lp_id,
        name: row.lp_name,
        email: row.lp_email,
        address: row.lp_address,
        city: row.lp_city,
        area: row.lp_area,
        telephone: row.lp_telephone,
      },
      package: {
        id: row.p_id,
        name: row.p_name,
        price_text: row.p_price_text,
        description: row.p_description
      },
    }));

    return ordersFormatted;
  },
};

export default AdminService;
