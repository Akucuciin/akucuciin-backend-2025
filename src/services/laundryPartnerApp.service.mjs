import AppConfig from '../configs/app.config.mjs';
import CustomerQuery from '../database/queries/customer.query.mjs';
import LaundryPartnerQuery from '../database/queries/laundryPartner.query.mjs';
import LaundryPartnerAppQuery from '../database/queries/laundryPartnerApp.query.mjs';
import OrderQuery from '../database/queries/order.query.mjs';
import { BadRequestError, NotFoundError } from '../errors/customErrors.mjs';
import { withTransaction } from '../utils/db.utils.mjs';
import {
  formatOrderFromDb,
  formatOrdersFromDb,
} from '../utils/order.utils.mjs';
import LaundryPartnerAppSchema from '../validators/laundryPartnerApp.schema.mjs';
import validate from '../validators/validator.mjs';
import CustomerStaticService from './customer.static-service.mjs';
import PaymentService from './payment.service.mjs';
import {
  sendOrderCompletedConfirmationToCustomer,
  sendOrderPaymentToCustomer,
} from './whatsapp.service.mjs';

const LaundryPartnerAppService = {
  // Toggle Open Close
  toggleOpenClose: async (req) => {
    const laundryPartnerId = req.user.id;
    const laundryPartner = await LaundryPartnerQuery.getById(laundryPartnerId);

    const isOpen = !laundryPartner.is_open;

    const result = await LaundryPartnerAppQuery.toogleOpenClose(
      laundryPartnerId,
      isOpen
    );

    if (!result.affectedRows) {
      throw new BadRequestError(
        'Failed to update open/close, please try again'
      );
    }

    const message = isOpen ? 'Now open' : 'Now close';

    return { is_open: isOpen, message: message };
  },
  //Profile Create
  getProfile: async (req) => {
    const email = req.user.email;
    const profileLaundryPartner =
      await LaundryPartnerAppQuery.getProfile(email);
    return profileLaundryPartner;
  },
  //Get and Edit Order
  getOrderById: async (req) => {
    const { id: order_id } = req.params;
    const orderById = await LaundryPartnerAppQuery.getOrderById(order_id);

    if (!orderById) {
      throw new NotFoundError('Gagal, order tidak ditemukan');
    }

    if (orderById.lp_id !== req.user.id) {
      throw new BadRequestError('Access denied. This order is not yours.');
    }

    const orderByIdFormated = formatOrderFromDb(orderById);
    return orderByIdFormated;
  },
  getOrdersByLaundryPartnerId: async (req) => {
    const laundry_partner_id = req.user.id;
    const orders =
      await LaundryPartnerAppQuery.getOrdersByLaundryPartnerId(
        laundry_partner_id
      );

    const ordersFormatted = formatOrdersFromDb(orders);
    return ordersFormatted;
  },
  updateStatusOrder: async (req) => {
    const { id: order_id } = req.params;

    return await withTransaction(async (trx) => {
      const updated = validate(LaundryPartnerAppSchema.updateStatus, req.body);

      const order = await LaundryPartnerAppQuery.getOrderById(order_id, trx);

      if (!order) {
        throw new NotFoundError('Gagal, order tidak ditemukan');
      }

      if (order.lp_id !== req.user.id) {
        throw new BadRequestError('Access denied. This order is not yours.');
      }

      if (order.status === 'batal' || order.status === 'selesai')
        throw new BadRequestError(
          `Failed, order status is already [${order.status}]`
        );

      // Order status changed to selesai then ...
      if (updated.status && updated.status === 'selesai') {
        if (order.weight == 0)
          throw new BadRequestError('Gagal, update berat terlebih dahulu');
        if (order.price_after == 0)
          throw new BadRequestError('Gagal, update harga terlebih dahulu');
        if (order.status_payment === 'belum bayar')
          throw new BadRequestError(
            'Gagal, customer belum membayar pesanan ini'
          );

        await sendOrderCompletedConfirmationToCustomer(
          order.c_telephone,
          order.c_name,
          order_id
        );

        if (order.referral_code) {
          const orderJoinedFormatted = formatOrderFromDb(order);
          const referredCustomer =
            await CustomerQuery.getCustomerByReferralCode(
              order.referral_code,
              trx
            );
          await CustomerStaticService.performSuccesfullReferralCodePipeline(
            orderJoinedFormatted.customer.email,
            referredCustomer,
            trx
          );
        }
      }

      const values = {
        order_id,
        status: updated.status || order.status,
        weight: updated.weight || order.weight,
      };

      const result = await LaundryPartnerAppQuery.updateStatusOrder(
        values.order_id,
        values.status,
        values.weight,
        trx
      );

      if (!result.affectedRows)
        throw new BadRequestError('Failed to update please try again');

      return values;
    });
  },
  updatePriceOrder: async (req) => {
    const { id: order_id } = req.params;

    return await withTransaction(async (trx) => {
      const updated = validate(LaundryPartnerAppSchema.updatePrice, req.body);

      const order = await LaundryPartnerAppQuery.getOrderById(order_id, trx);

      if (!order) {
        throw new NotFoundError('Gagal, order tidak ditemukan');
      }

      if (order.lp_id !== req.user.id) {
        throw new BadRequestError('Access denied. This order is not yours.');
      }

      if (order.weight == 0) {
        throw new BadRequestError('Gagal, update berat terlebih dahulu');
      }

      if (order.price_after != 0) {
        throw new BadRequestError('Gagal, harga tidak dapat dirubah kembali');
      }

      if (order.status_payment === 'sudah bayar') {
        throw new BadRequestError('Gagal, customer sudah membayar pesanan ini');
      }

      if (order.status === 'batal' || order.status === 'selesai')
        throw new BadRequestError(
          `Failed, order status is already [${order.status}]`
        );

      const values = {
        order_id,
        price: updated.price || order.price,
      };

      const result = await LaundryPartnerAppQuery.updatePriceOrder(
        values.order_id,
        values.price,
        trx
      );

      if (!result.affectedRows) throw new BadRequestError('Failed to update');

      const ordersJoined = await OrderQuery.getOrderJoinedById(order_id, trx);
      const orderJoined = ordersJoined[0];
      const _order = formatOrderFromDb(orderJoined);

      // ====== DONE UPDATE PRICE, NOW PERFORM PAYMENT !!!! //
      const expiredAt = new Date(
        Date.now() + AppConfig.PAYMENT.DOKU.expiredTime * 60 * 1000
      );

      const paymentLink = await PaymentService.Doku.generateOrderPaymentLink(
        order_id,
        _order,
        trx
      );

      await OrderQuery.updatePaymentLinkOrder(
        order_id,
        paymentLink,
        expiredAt,
        trx
      );
      await sendOrderPaymentToCustomer(_order, paymentLink);

      return { url: paymentLink };

      // ====== END PAYMENT //
    });
  },
};

export default LaundryPartnerAppService;
