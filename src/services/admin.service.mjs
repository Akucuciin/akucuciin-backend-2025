import AdminQuery from "../database/queries/admin.query.mjs";

const AdminService = {
  getCustomers: async (req) => {
    const customers = await AdminQuery.getCustomers();
    return customers;
  },
};

export default AdminService;
