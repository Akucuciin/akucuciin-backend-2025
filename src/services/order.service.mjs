import CouponQuery from '../database/queries/coupon.query.mjs';
import CustomerQuery from '../database/queries/customer.query.mjs';
import LaundryPartnerQuery from '../database/queries/laundryPartner.query.mjs';
import OrderQuery from '../database/queries/order.query.mjs';
import {
  AuthorizationError,
  BadRequestError,
} from '../errors/customErrors.mjs';
import Logger from '../logger.mjs';
import { withTransaction } from '../utils/db.utils.mjs';
import { formatOrdersFromDb } from '../utils/order.utils.mjs';
import {
  generateCouponName,
  generateNanoidWithPrefix,
} from '../utils/utils.mjs';
import OrderSchema from '../validators/order.schema.mjs';
import validate from '../validators/validator.mjs';
import CouponStaticService from './coupon.static-service.mjs';
import {
  sendOrderConfirmationToCustomer,
  sendOrderConfirmationToLaundry,
} from './whatsapp.service.mjs';

const OrderService = {
  create: async (req) => {
    return await withTransaction(async (trx) => {
      const customer = await CustomerQuery.getCustomerProfileByEmail(
        req.user.email,
        trx
      );
      if (!customer.address?.trim()) {
        throw new AuthorizationError(
          'Gagal, silahkan isi data alamat terlebih dahulu pada profile anda'
        );
      }

      if (!customer.telephone?.trim()) {
        throw new AuthorizationError(
          'Gagal, silahkan isi data nomor telephone (Whatsapp) terlebih dahulu pada profile anda'
        );
      }

      let order = validate(OrderSchema.create, req.body);

      order.id = generateNanoidWithPrefix('ORDER');
      order.customer_id = req.user.id;

      // REFERRAL CODE APPLIED
      if (order.referral_code) {
        if (order.referral_code === customer.referral_code)
          throw new BadRequestError(
            'Gagal, gunakan kode referral selain punya anda'
          );

        const referral_code = await CustomerQuery.isReferralCodeExist(
          order.referral_code,
          trx
        );
        if (!referral_code)
          throw new BadRequestError('Gagal, Kode referral tidak ditemukan');
      }

      // COUPON APPLIED
      if (order.coupon_code) {
        const coupon = await CouponStaticService.validateCouponCodeForOrder(
          order,
          req.user.id,
          trx
        );

        // Gacha voucher, generate new voucher from base coupon code
        if (coupon.name === 'AKUMABA' || coupon.name === 'AKUNGEKOS') {
          const COUPON_GACHA_RULES = [
            { discount: 62, quota: 20 },
            { discount: 16, quota: 50 },
            { discount: 10, quota: 80 },
            { discount: 6, quota: 50 },
          ];

          const TOTAL_CHANCE = 200;

          // global mutex to prevent concurrent gacha attempts
          const [lockResult] = await trx.query(
            `SELECT GET_LOCK('gacha_coupon_lock', 3) AS locked`
          ); // 3 sec timeout
          const gotLock = lockResult[0].locked;
          console.log(lockResult);
          if (!gotLock) {
            throw new BadRequestError(
              'Gagal memproses kupon gacha. Silakan coba lagi beberapa saat.'
            );
          }

          try {
            const [thisUserOrderWithGachaCoupon] = await trx.query(
              `SELECT * FROM orders WHERE coupon_code LIKE ? AND customer_id = ?`,
              [`${coupon.name}-%`, req.user.id]
            );
            if (thisUserOrderWithGachaCoupon.length > 0) {
              throw new BadRequestError(
                `Gagal, Anda sudah pernah menggunakan voucher gacha ${coupon.name} sebelumnya`
              );
            }

            const [gachaCoupons] = await trx.query(
              `SELECT COUNT(*) AS count FROM coupons WHERE name LIKE ?`,
              [`${coupon.name}-%`]
            );
            if (gachaCoupons[0].count >= TOTAL_CHANCE) {
              throw new BadRequestError(
                `Gagal, Kuota kupon gacha ${coupon.name} (${TOTAL_CHANCE} kuota) sudah habis :(`
              );
            }

            async function getRemainingQuotaOfDiscount(discount, trx) {
              const [rows] = await trx.query(
                `SELECT COUNT(*) AS count FROM coupons WHERE name LIKE ? AND multiplier = ?`,
                [`${coupon.name}-%`, discount]
              );
              return rows[0].count;
            }

            function weightedRandomSelect() {
              const roll = Math.floor(Math.random() * TOTAL_CHANCE);
              let cumulative = 0;

              for (const rule of COUPON_GACHA_RULES) {
                cumulative += rule.quota;
                if (roll < cumulative) return rule.discount;
              }

              return 6; // fallback to lowest
            }

            const MAX_TRIES = 10;
            let tries = 0;
            let generatedCoupon = null;

            while (tries++ < MAX_TRIES) {
              const discount = weightedRandomSelect();
              const used = await getRemainingQuotaOfDiscount(discount, trx);
              const rule = COUPON_GACHA_RULES.find(
                (r) => r.discount === discount
              );

              if (used < rule.quota) {
                const generatedName = generateCouponName(
                  coupon.name,
                  5,
                  req.user.email,
                  true
                );

                await CouponQuery.create(
                  generatedName,
                  discount,
                  `Kupon Gacha ${coupon.name} - Diskon ${discount}% untuk ${req.user.email}`,
                  1,
                  1,
                  null,
                  0,
                  0,
                  req.user.id,
                  trx
                );

                generatedCoupon = await CouponQuery.get(generatedName, trx);
                Logger.info(
                  `Generated coupon: ${generatedCoupon.name} with discount ${discount}% for ${order.id}`
                );
                order.coupon_code = generatedCoupon.name;
                break;
              }
            }
            if (!generatedCoupon) {
              throw new BadRequestError(
                `Gagal, tidak bisa menghasilkan kupon gacha ${coupon.name}, silahkan coba lagi`
              );
            }
          } finally {
            await trx.query(`SELECT RELEASE_LOCK('gacha_coupon_lock')`);
          }
        }
      }

      const laundry = await LaundryPartnerQuery.getById(
        order.laundry_partner_id,
        trx
      );
      if (!laundry) {
        throw new BadRequestError('Gagal, laundry tidak ditemukan');
      }

      if (!laundry.is_open) {
        throw new BadRequestError(
          'Gagal, laundry ini sedang tutup, silahkan pilih laundry lain'
        );
      }

      if (!laundry || !laundry.is_active)
        throw new BadRequestError('Gagal, laundry tidak ditemukan');
      const laundryPackages = await LaundryPartnerQuery.getPackageOfPartnerById(
        order.laundry_partner_id,
        order.package_id,
        trx
      );
      if (!laundryPackages)
        throw new BadRequestError('Gagal, paket laundry tidak ditemukan');

      await OrderQuery.create(
        order.id,
        order.customer_id,
        order.laundry_partner_id,
        order.package_id,
        order.content,
        order.status,
        order.maps_pinpoint,
        order.weight,
        order.price,
        order.coupon_code,
        order.note,
        order.pickup_date,
        order.referral_code,
        trx
      );

      const orderFromDb = await OrderQuery.getOrderJoinedById(order.id, trx);

      const ord = formatOrdersFromDb(orderFromDb)[0];

      ord.created_at_tz = new Date(ord.created_at).toLocaleString('id-ID', {
        timeZone: 'Asia/Bangkok',
      });

      try {
        // Send To Whatsapp - Customer
        await sendOrderConfirmationToCustomer(ord);

        // Send To Whatsapp - Laundry
        await sendOrderConfirmationToLaundry(ord);
      } catch (err) {
        Logger.fatal(
          `Gagal mengirim notifikasi Whatsapp untuk order ${ord.id}`,
          err
        );
        throw new BadRequestError(
          'Gagal, tidak bisa mengirim notifikasi Whatsapp, silahkan coba lagi'
        );
      }

      return ord;
    });
  },
};

export default OrderService;
