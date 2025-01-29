import LaundryPartnerQuery from "../database/queries/laundryPartner.query.mjs";
import { NotFoundError } from "../errors/customErrors.mjs";
import { lowerAndCapitalizeFirstLetter } from "../utils/utils.mjs";

const LaundryPartnerService = {
  getPartnerByIdWithPackages: async (req) => {
    const { id } = req.params;

    const laundryPartner = await LaundryPartnerQuery.getById(id);
    if (!laundryPartner) throw new NotFoundError("Failed, laundry not found");

    const laundryPartnerPackages =
      await LaundryPartnerQuery.getPackagesOfPartnerById(id);

    const formattedLaundryPartnerPackages = laundryPartnerPackages.map((pkg) => ({
      ...pkg,
      features: pkg.features.split(", ").map((f) => f.trim()),
    }));

    laundryPartner.packages = formattedLaundryPartnerPackages;

    return laundryPartner;
  },
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
