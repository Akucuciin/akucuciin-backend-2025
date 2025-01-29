import LaundryPartnerQuery from "../database/queries/laundryPartner.query.mjs";
import { lowerAndCapitalizeFirstLetter } from "../utils/utils.mjs";

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
  getPartnersByCity: async (req) => {
    let { city } = req.params;
    city = lowerAndCapitalizeFirstLetter(city);

    const laundryPartners = await LaundryPartnerQuery.getPartnersByCity(city);

    return laundryPartners;
  },
};

export default LaundryPartnerService;
