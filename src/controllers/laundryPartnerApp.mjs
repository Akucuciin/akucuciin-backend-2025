import LaundryPartnerAppService from "../services/laundryPartnerApp.service.mjs";

const LaundryPartnerAppController = {
    getProfile: async (req, res, next) => {
        try {
            const result = await LaundryPartnerAppService.getProfile(req);
            return res.status(200).json({
                success:true,
                data:result,
            })
        } catch (error) {
            next(error);
        }
    },
}

export default LaundryPartnerAppController;