import CouponQuery from "../database/queries/coupon.query.mjs";
import CustomerQuery from "../database/queries/customer.query.mjs";
import { generateCouponName } from "../utils/utils.mjs";
import { sendReferralCodeSuccessfullyUsedToReferredCustomer, sendReferralCodeSuccessfullyUsedToReferredCustomerWithReward } from "./whatsapp.service.mjs";

const CustomerStaticService = {
  performSuccesfullReferralCodePipeline: async function (email, referredCustomer) {
    await CustomerQuery.increaseReferralCodeSuccessfulCount(referredCustomer.email);

    await CustomerQuery.decreaseReferralCodeUntilNextReward(referredCustomer.email);

    const updatedReferredCustomer = await CustomerQuery.getCustomerByReferralCode(referredCustomer.referral_code);

    if (updatedReferredCustomer.referral_code_until_next_reward == 0) {
      // customer eligible for referral code voucher
      const newCouponName = generateCouponName(
        "REF",
        5,
        referredCustomer.email,
        true
      );
      const newCouponMultiplier = 20;

      await CouponQuery.create(
        newCouponName,
        newCouponMultiplier,
        `Voucher 20% off untuk ${referredCustomer.email} hasil referral code`,
        0,
        1,
        null,
        0,
        null,
        referredCustomer.id
      );

      await CustomerQuery.resetReferralCodeUntilNextReward(referredCustomer.email);
      const updatedReferredCustomer = await CustomerQuery.getCustomerByReferralCode(referredCustomer.referral_code);
      await sendReferralCodeSuccessfullyUsedToReferredCustomerWithReward(updatedReferredCustomer, newCouponName, newCouponMultiplier);
    } else {
      // customer not yet eligible for referral code voucher
      const updatedReferredCustomer = await CustomerQuery.getCustomerByReferralCode(referredCustomer.referral_code);
      await sendReferralCodeSuccessfullyUsedToReferredCustomer(updatedReferredCustomer);
    }
  },
};

export default CustomerStaticService;
