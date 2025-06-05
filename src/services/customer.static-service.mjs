import CouponQuery from "../database/queries/coupon.query.mjs";
import CustomerQuery from "../database/queries/customer.query.mjs";
import { generateCouponName } from "../utils/utils.mjs";
import { sendReferralCodeSuccessfullyUsedToReferredCustomer } from "./whatsapp.service.mjs";

const CustomerStaticService = {
  performSuccesfullReferralCodePipeline: async function (email, referredCustomer) {
    await CustomerQuery.increaseReferralCodeSuccessfulCount(referredCustomer.email);

    await CustomerQuery.decreaseReferralCodeUntilNextReward(referredCustomer.email);

    const customer = await CustomerQuery.getCustomerProfileByEmail(email);

    if (customer.referral_code_until_next_reward == 0) {
      // customer eligible for referral code voucher
      const newCouponName = generateCouponName(
        "REFGIFT",
        5,
        referredCustomer.email,
        true
      );

      await CouponQuery.create(
        newCouponName,
        20,
        `Voucher 20% off untuk ${referredCustomer.name} hasil referral code`,
        0,
        1,
        null,
        0,
        null
      );

      await CustomerQuery.resetReferralCodeUntilNextReward(referredCustomer.email);
      const updatedReferredCustomer = await CustomerQuery.getCustomerByReferralCode(referredCustomer.referral_code);
    } else {
      // customer not yet eligible for referral code voucher
      const updatedReferredCustomer = await CustomerQuery.getCustomerByReferralCode(referredCustomer.referral_code);
      await sendReferralCodeSuccessfullyUsedToReferredCustomer(updatedReferredCustomer);
    }
  },
};

export default CustomerStaticService;
