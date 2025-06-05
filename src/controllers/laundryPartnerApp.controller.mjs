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
    getOrderById: async (req, res, next) => {
        try {
            const result = await LaundryPartnerAppService.getOrderById(req);
            return res.status(200).json({
                success: true,
                data: result,
            })
        } catch (error) {
            next(error);
        }
    },
    getOrdersByLaundryPartnerId: async (req, res, next) => {
        try {
            const result = await LaundryPartnerAppService.getOrdersByLaundryPartnerId(req);
            return res.status(200).json({
                success: true,
                data: result,
            })
        } catch (error) {
            next(error);
        }
    },
    updateStatusOrder: async (req, res, next) => {
        try {
            const result = await LaundryPartnerAppService.updateStatusOrder(req);
            return res.status(200).json({
                success: true,
                data: result,
            })
        } catch (error) {
            next(error);
        }
    },
    updatePriceOrder: async (req, res, next) => {
        try {
            const result = await LaundryPartnerAppService.updatePriceOrder(req);
            return res.status(200).json({
                success: true,
                data: result,
            })
        } catch (error) {
            next(error);
        }
    }
}

export default LaundryPartnerAppController;