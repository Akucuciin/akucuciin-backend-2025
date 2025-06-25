import bcrypt from "bcrypt";
import ExcelJs from "exceljs";
import fs from "fs";
import AdminQuery from "../database/queries/admin.query.mjs";

import CustomerQuery from "../database/queries/customer.query.mjs";
import DriverQuery from "../database/queries/driver.query.mjs";
import LaundryPartnerQuery from "../database/queries/laundryPartner.query.mjs";
import LaundryPartnerImageQuery from "../database/queries/laundryPartnerImage.query.mjs";
import OrderQuery from "../database/queries/order.query.mjs";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
} from "../errors/customErrors.mjs";
import {
  formatOrderFromDb,
  formatOrdersFromDb,
} from "../utils/order.utils.mjs";
import {
  generateNanoidWithPrefix,
  lowerAndCapitalizeFirstLetter,
  transformPhoneNumber,
} from "../utils/utils.mjs";
import DriverSchema from "../validators/driver.schema.mjs";
import LaundryPartnerSchema from "../validators/laundryPartner.schema.mjs";
import OrderSchema from "../validators/order.schema.mjs";
import validate from "../validators/validator.mjs";
import CustomerStaticService from "./customer.static-service.mjs";
import {
  sendOrderAssignedPengantaranToDriver,
  sendOrderAssignedToDriver,
  sendOrderCompletedConfirmationToCustomer,
} from "./whatsapp.service.mjs";

const AdminService = {
  getCustomers: async (req) => {
    const customers = await AdminQuery.getCustomers();
    return customers;
  },
  getCustomerOrders: async (req) => {
    const { id: customer_id } = req.params;

    const customerOrders = await OrderQuery.getOrdersJoinedByCustomer(
      customer_id
    );

    const customerOrdersFormatted = formatOrdersFromDb(customerOrders);
    return customerOrdersFormatted;
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

    laundryPartner.id = generateNanoidWithPrefix("LP");
    laundryPartner.password = await bcrypt.hash(laundryPartner.password, 12);
    laundryPartner.city = lowerAndCapitalizeFirstLetter(laundryPartner.city);
    laundryPartner.area = lowerAndCapitalizeFirstLetter(laundryPartner.area);
    laundryPartner.telephone = transformPhoneNumber(laundryPartner.telephone);

    await LaundryPartnerQuery.register(
      laundryPartner.id,
      laundryPartner.name,
      laundryPartner.email,
      laundryPartner.password,
      laundryPartner.description,
      laundryPartner.telephone,
      laundryPartner.address,
      laundryPartner.maps_pinpoint,
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
      maps_pinpoint: laundryPartner.maps_pinpoint,
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

    if (updatedLaundryPartner.email) {
      const isEmailExists = await LaundryPartnerQuery.isEmailExists(
        updatedLaundryPartner.email
      );
      if (isEmailExists) throw new BadRequestError("Email sudah terdaftar");
    }

    const laundryPartner = await LaundryPartnerQuery.getById(id);
    if (!laundryPartner) throw new NotFoundError("Failed laundry not found");

    const values = {
      id,
      name: updatedLaundryPartner.name || laundryPartner.name,
      email: updatedLaundryPartner.email || laundryPartner.email,
      description:
        updatedLaundryPartner.description || laundryPartner.description,
      telephone: updatedLaundryPartner.telephone || laundryPartner.telephone,
      address: updatedLaundryPartner.address || laundryPartner.address,
      maps_pinpoint:
        updatedLaundryPartner.maps_pinpoint || laundryPartner.maps_pinpoint,
      city: updatedLaundryPartner.city || laundryPartner.city,
      area: updatedLaundryPartner.area || laundryPartner.area,
      latitude: updatedLaundryPartner.latitude || laundryPartner.latitude,
      longitude: updatedLaundryPartner.longitude || laundryPartner.longitude,
    };
    values.city = lowerAndCapitalizeFirstLetter(values.city);
    values.area = lowerAndCapitalizeFirstLetter(values.area);
    values.telephone = transformPhoneNumber(values.telephone);

    await LaundryPartnerQuery.update(
      values.email,
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
  addLaundryPartnerPackage: async (req) => {
    const { id: laundry_partner_id } = req.params;
    const npackage = validate(LaundryPartnerSchema.addPackage, req.body);

    npackage.id = generateNanoidWithPrefix("LPPACKAGES");
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
  addLaundryPartnerImage: async (req) => {
    const { id: laundry_partner_id } = req.params;
    const id = generateNanoidWithPrefix("img");

    await LaundryPartnerImageQuery.addImage(
      id,
      laundry_partner_id,
      req.file.filename
    );

    return { id, laundry_partner_id, filepath: req.file.filename };
  },
  deleteLaundryPartnerImage: async (req) => {
    const { image_id } = req.params;

    const image = await LaundryPartnerImageQuery.getImageById(image_id);

    fs.unlink(`storage/${image.filepath}`, (err) => {
      if (err) {
        throw new ServerError("Failed delete image");
      }
    });
    await LaundryPartnerImageQuery.deleteImageById(image_id);

    return "File succesfully deleted";
  },
  exportOrderToExcel: async (req) => {
    let { startDate, endDate } = req.query;
    if (startDate && endDate) {
      const isValidDate = (dateStr) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        throw new BadRequestError("Invalid Query Parameter");
      }
      const parsedEnd = new Date(endDate);
      const endPlusOne = new Date(parsedEnd);
      endPlusOne.setDate(endPlusOne.getDate() + 1);
      endDate = endPlusOne.toISOString().slice(0, 10);
    }

    const orders = await OrderQuery.getOrdersForReport(startDate, endDate);

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    worksheet.columns = Object.keys(orders[0]).map((key) => ({
      header: key.toUpperCase(),
      key: key,
      width: 25,
    }));

    worksheet.addRows(orders);

    return workbook;
  },
  getOrdersJoined: async (req) => {
    let { startDate, endDate } = req.query;

    if (startDate && endDate) {
      const isValidDate = (dateStr) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        throw new BadRequestError(
          "Invalid Query Parameter, should be YYYY-MM-DD"
        );
      }

      startDate = new Date(startDate).toISOString();
      const parsedEnd = new Date(endDate);
      parsedEnd.setDate(parsedEnd.getDate() + 1);
      endDate = parsedEnd.toISOString();
      console.log("startDate", startDate, "endDate", endDate);
    }

    const orders = await OrderQuery.getOrdersJoined(startDate, endDate);

    const ordersFormatted = formatOrdersFromDb(orders);

    return ordersFormatted;
  },
  updateOrderStatus: async (req) => {
    const { id: order_id } = req.params;
    const updated = validate(OrderSchema.updateStatus, req.body);

    const order = await OrderQuery.getOrderById(order_id);
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

    // Order status changed to selesai then ...
    if (updated.status && updated.status === "selesai") {
      if (order.weight == 0)
        throw new BadRequestError("Gagal, update berat terlebih dahulu");
      if (order.price_after == 0)
        throw new BadRequestError("Gagal, mitra belum mengupdate harga");
      if (order.status_payment === "belum bayar")
        throw new BadRequestError("Gagal, customer belum membayar pesanan ini");

      const ordersJoined = await OrderQuery.getOrderJoinedById(order_id);
      const orderJoined = ordersJoined[0];
      await sendOrderCompletedConfirmationToCustomer(
        orderJoined.c_telephone,
        orderJoined.c_name,
        order_id
      );

      if (orderJoined.referral_code) {
        const orderJoinedFormatted = formatOrderFromDb(orderJoined);
        const referredCustomer = await CustomerQuery.getCustomerByReferralCode(
          orderJoined.referral_code
        );
        await CustomerStaticService.performSuccesfullReferralCodePipeline(
          orderJoinedFormatted.customer.email,
          referredCustomer
        );
      }
    }

    const result = await OrderQuery.updateStatus(
      values.order_id,
      values.status,
      values.weight,
      values.price,
      values.status_payment
    );

    if (updated.status && updated.status === "pengantaran") {
      // status is updated, and the updated is 'pengantaran'
      const _orders = await OrderQuery.getOrderJoinedById(order_id);
      const _order = _orders[0];
      const _ord = formatOrdersFromDb(_orders)[0];
      if (_ord.driver.id) {
        await sendOrderAssignedPengantaranToDriver(_ord);
      }
    }

    if (!result.affectedRows) throw new BadRequestError("Failed to update");

    return values;
  },
  assignOrderToDriver: async (req) => {
    const { driver_id, order_id } = req.params;

    const driver = await DriverQuery.getById(driver_id);
    if (!driver) throw new NotFoundError("Failed, driver not found");
    delete driver.password;

    const orders = await OrderQuery.getOrderJoinedById(order_id);
    const order = orders[0];

    if (!order) throw new NotFoundError("Failed, order not found");
    if (
      order.status === "selesai" ||
      order.status === "penjemputan" ||
      order.status === "pencucian" ||
      order.status === "batal"
    )
      throw new BadRequestError(
        `Failed, order status is already [${order.status}]`
      );

    await OrderQuery.assignDriver(order_id, driver_id);

    const ord = formatOrdersFromDb(orders)[0];
    await sendOrderAssignedToDriver(ord);

    return `Assigned ${order_id} to driver ${driver_id}`;
  },
  cancelAssignedDriverOfOrder: async (req) => {
    const { order_id } = req.params;
    const order = await OrderQuery.getOrderById(order_id);
    if (!order) throw new NotFoundError("Failed, order not found");
    if (order.status === "selesai")
      throw new BadRequestError(
        `Failed, order status is already [${order.status}]`
      );

    await OrderQuery.cancelAssignedDriver(order_id);

    return `${order_id} driver removed`;
  },
  registerDriver: async (req) => {
    const driver = validate(DriverSchema.register, req.body);

    const isEmailExists = await DriverQuery.isEmailExists(driver.email);
    if (isEmailExists) throw new BadRequestError("Email sudah terdaftar");

    driver.id = generateNanoidWithPrefix("DRIVER");
    driver.password = await bcrypt.hash(driver.password, 14);
    driver.city = lowerAndCapitalizeFirstLetter(driver.city);

    await DriverQuery.register(
      driver.id,
      driver.name,
      driver.email,
      driver.password,
      driver.telephone,
      driver.address,
      driver.city
    );

    return {
      id: driver.id,
    };
  },
  updateDriver: async (req) => {
    const { id: driver_id } = req.params;

    const updatedDriver = validate(DriverSchema.update, req.body);

    if (updatedDriver.email) {
      const isEmailExists = await DriverQuery.isEmailExists(
        updatedDriver.email
      );
      if (isEmailExists) throw new BadRequestError("Email sudah terdaftar");
    }

    const driver = await DriverQuery.getById(driver_id);
    if (!driver) throw new NotFoundError("Failed, driver not found");

    const values = {
      name: updatedDriver.name || driver.name,
      email: updatedDriver.email || driver.email,
      telephone: updatedDriver.telephone || driver.telephone,
      address: updatedDriver.address || driver.address,
      city: updatedDriver.city || driver.city,
    };
    values.city = lowerAndCapitalizeFirstLetter(values.city);

    await DriverQuery.update(
      driver_id,
      values.name,
      values.email,
      values.telephone,
      values.address,
      values.city
    );

    return values;
  },
  getDrivers: async (req) => {
    const drivers = await DriverQuery.getAll();

    for (const driver of drivers) {
      delete driver.password;
    }

    return drivers;
  },
  deleteDriver: async (req) => {
    const { id: driver_id } = req.params;

    const driver = await DriverQuery.getById(driver_id);
    if (!driver) throw new NotFoundError("Failed, driver not found");

    await DriverQuery.deleteById(driver_id);

    return `Driver with id : ${driver_id}, succesfully deleted`;
  },
};

export default AdminService;
