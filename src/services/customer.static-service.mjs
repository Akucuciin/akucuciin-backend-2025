import CustomerQuery from "../database/queries/customer.query.mjs";

const CustomerStaticService = {
  performSuccesfullReferralCodePipeline: async function (email) {
    await CustomerQuery.increaseReferralCodeSuccessfulCount(email);

    await CustomerQuery.decreaseReferralCodeUntilNextReward(email);

    const customer = await CustomerQuery.getCustomerProfileByEmail(email);

    if (customer.referral_code_until_next_reward == 0) {
        // customer eligible for referral code voucher
    }
  },
};

export default CustomerStaticService;
