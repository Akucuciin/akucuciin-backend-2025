import MitraQuery from "../database/queries/mitra.query.mjs";
import MitraSchema from "../validators/mitra.schema.mjs";
import validate from "../validators/validator.mjs";
import {
    BadRequestError,
    NotFoundError,
    ServerError,
} from "../errors/customErrors.mjs";

const MitraService = {
    getMitraProfile : async (req) => {
        const email = req.user.email;
        const profileMitra = await MitraQuery.getMitraProfile(email);
        return profileMitra;
    },
}

export default MitraService;
