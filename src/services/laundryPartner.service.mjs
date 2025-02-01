import LaundryPartnerQuery from "../database/queries/laundryPartner.query.mjs";
import LaundryPartnerImageQuery from "../database/queries/laundryPartnerImage.query.mjs";
import { NotFoundError } from "../errors/customErrors.mjs";
import { lowerAndCapitalizeFirstLetter } from "../utils/utils.mjs";

const LaundryPartnerService = {
  getPartnerByIdWithPackages: async (req) => {
    const { id } = req.params;

    const laundryPartner = await LaundryPartnerQuery.getById(id);
    if (!laundryPartner) throw new NotFoundError("Failed, laundry not found");

    const laundryPartnerPackages =
      await LaundryPartnerQuery.getPackagesOfPartnerById(id);

    const formattedLaundryPartnerPackages = laundryPartnerPackages.map(
      (pkg) => ({
        ...pkg,
        features: pkg.features.split(", ").map((f) => f.trim()),
      })
    );

    laundryPartner.packages = formattedLaundryPartnerPackages;

    return laundryPartner;
  },
  getPartnerImages: async (req) => {
    const { id: laundry_partner_id } = req.params;

    const images = await LaundryPartnerImageQuery.getImagesOfPartnerById(
      laundry_partner_id
    );

    return images;
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

    for (const partner of laundryPartners) {
      const images = await LaundryPartnerImageQuery.getImagesOfPartnerById(
        partner.id
      );
      partner.image = images[0];
    }

    return laundryPartners;
  },
};

export default LaundryPartnerService;
