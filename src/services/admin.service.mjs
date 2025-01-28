import bcrypt from "bcrypt";
import { v7 as uuidV7 } from "uuid";

import AdminQuery from "../database/queries/admin.query.mjs";
import LaundryPartnerQuery from "../database/queries/laundryPartner.query.mjs";
import { BadRequestError, NotFoundError } from "../errors/customErrors.mjs";
import { capitalizeFirstLetter } from "../utils/utils.mjs";
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

    laundryPartner.id = uuidV7();
    laundryPartner.password = await bcrypt.hash(laundryPartner.password, 12);
    laundryPartner.city = capitalizeFirstLetter(laundryPartner.city);
    laundryPartner.area = capitalizeFirstLetter(laundryPartner.area);

    await LaundryPartnerQuery.register(
      laundryPartner.id,
      laundryPartner.name,
      laundryPartner.email,
      laundryPartner.password,
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
      telephone: updatedLaundryPartner.telephone || laundryPartner.telephone,
      address: updatedLaundryPartner.address || laundryPartner.address,
      city: updatedLaundryPartner.city || laundryPartner.city,
      area: updatedLaundryPartner.area || laundryPartner.area,
      latitude: updatedLaundryPartner.latitude || laundryPartner.latitude,
      longitude: updatedLaundryPartner.longitude || laundryPartner.longitude,
    };
    values.city = capitalizeFirstLetter(values.city);
    values.area = capitalizeFirstLetter(values.area);

    await LaundryPartnerQuery.update(
      values.id,
      values.name,
      values.telephone,
      values.address,
      values.city,
      values.area,
      values.latitude,
      values.longitude
    );

    return values;
  },
};

export default AdminService;
