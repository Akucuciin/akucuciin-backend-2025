import LaundryPartnerAppQuery from "../database/queries/laundryPartnerApp.query.mjs";
import LaundryPartnerAppSchema from "../validators/laundryPartnerApp.schema.mjs";
import validate from "../validators/validator.mjs";
import {
    BadRequestError,
    NotFoundError,
    ServerError,
} from "../errors/customErrors.mjs";

const LaundryPartnerAppService = {
    getProfile : async (req) => {
        const email = req.user.email;
        const profileLaundryPartner = await LaundryPartnerAppQuery.getProfile(email);
        return profileLaundryPartner;
    },
}

export default LaundryPartnerAppService;
