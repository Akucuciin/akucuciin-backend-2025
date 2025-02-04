import DriverQuery from "../database/queries/driver.query.mjs";

const DriverService = {
  getProfile: async (req) => {
    const driver = await DriverQuery.getById(req.user.id);

    delete driver.password;

    return driver;
  },
};

export default DriverService;
