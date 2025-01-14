import AuthService from "../services/auth.service.mjs";

const AuthController = {
  refresh: async (req, res, next) => {
    try {
      const result = await AuthService.refresh(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (e) {
      next(e);
    }
  },
};

export default AuthController;
