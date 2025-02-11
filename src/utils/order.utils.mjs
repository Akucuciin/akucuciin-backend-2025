const formatOrdersFromDb = function (orders) {
  return orders.map((row) => ({
    id: row.id,
    content: row.content,
    status: row.status,
    status_payment: row.status_payment,
    maps_pinpoint: row.maps_pinpoint,
    weight: row.weight,
    price: row.price,
    coupon_code: row.coupon_code,
    referral_code: row.referral_code,
    created_at: row.created_at,
    note: row.note,
    pickup_date: row.pickup_date,
    customer: {
      id: row.c_id,
      name: row.c_name,
      email: row.c_email,
      address: row.c_address,
      telephone: row.c_telephone,
    },
    laundry_partner: {
      id: row.lp_id,
      name: row.lp_name,
      email: row.lp_email,
      address: row.lp_address,
      city: row.lp_city,
      area: row.lp_area,
      telephone: row.lp_telephone,
      maps_pinpoint: row.lp_maps_pinpoint,
    },
    package: {
      id: row.p_id,
      name: row.p_name,
      price_text: row.p_price_text,
      description: row.p_description,
    },
    driver: {
      id: row.d_id,
      name: row.d_name,
      email: row.d_email,
      telephone: row.d_telephone,
    },
  }));
};

export default formatOrdersFromDb;
