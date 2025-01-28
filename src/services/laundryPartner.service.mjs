import LaundryPartnerQuery from "../database/queries/laundryPartner.query.mjs";

const LaundryPartnerService = {
  getPartnersLocations: async (req) => {
    const locations = await LaundryPartnerQuery.getPartnersLocations();
    const groupedLocations = {};

    locations.forEach(({ city, area }) => {
      if (!groupedLocations[city]) {
        groupedLocations[city] = new Set();
      }

      groupedLocations[city].add(area);
    });

    Object.keys(groupedLocations).forEach((city) => {
      groupedLocations[city] = Array.from(groupedLocations[city]);
    });

    return groupedLocations;
  },
};

export default LaundryPartnerService;
