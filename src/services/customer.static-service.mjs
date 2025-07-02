import db from '../database/connection.mjs';
import CouponQuery from '../database/queries/coupon.query.mjs';
import CustomerQuery from '../database/queries/customer.query.mjs';
import { generateCouponName } from '../utils/utils.mjs';
import {
  sendReferralCodeSuccessfullyUsedToReferredCustomer,
  sendReferralCodeSuccessfullyUsedToReferredCustomerWithReward,
} from './whatsapp.service.mjs';

const CustomerStaticService = {
  performSuccesfullReferralCodePipeline: async function (
    email,
    referredCustomer,
    trx = db
  ) {
    await CustomerQuery.increaseReferralCodeSuccessfulCount(
      referredCustomer.email,
      trx
    );

    await CustomerQuery.decreaseReferralCodeUntilNextReward(
      referredCustomer.email,
      trx
    );

    const updatedReferredCustomer =
      await CustomerQuery.getCustomerByReferralCode(
        referredCustomer.referral_code,
        trx
      );

    if (updatedReferredCustomer.referral_code_until_next_reward == 0) {
      // customer eligible for referral code voucher
      const newCouponName = generateCouponName(
        'REF',
        5,
        referredCustomer.email,
        true
      );
      const newCouponMultiplier = 10;

      await CouponQuery.create(
        newCouponName,
        newCouponMultiplier,
        `Voucher ${newCouponMultiplier}% off untuk ${referredCustomer.email} hasil referral code`,
        0,
        1,
        null,
        0,
        null,
        referredCustomer.id,
        trx
      );

      await CustomerQuery.resetReferralCodeUntilNextReward(
        referredCustomer.email,
        trx
      );
      const updatedReferredCustomer =
        await CustomerQuery.getCustomerByReferralCode(
          referredCustomer.referral_code,
          trx
        );
      await sendReferralCodeSuccessfullyUsedToReferredCustomerWithReward(
        updatedReferredCustomer,
        newCouponName,
        newCouponMultiplier
      );
    } else {
      // customer not yet eligible for referral code voucher
      const updatedReferredCustomer =
        await CustomerQuery.getCustomerByReferralCode(
          referredCustomer.referral_code,
          trx
        );
      await sendReferralCodeSuccessfullyUsedToReferredCustomer(
        updatedReferredCustomer
      );
    }
  },
};

export default CustomerStaticService;
