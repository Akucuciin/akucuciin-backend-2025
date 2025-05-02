import axios from "axios";
import crypto from "crypto";
import AppConfig from "../configs/app.config.mjs";

const generateXSignature = (payload) => {
  const payloadStringify = JSON.stringify(payload);
  const xSignature = crypto
    .createHmac("sha256", AppConfig.Whatsapp.HMAC_SECRET)
    .update(payloadStringify)
    .digest("hex");
  return xSignature;
};

export const sendOrderCancellationConfirmationToCustomer = async (ord) => {
  const payload = {
    jid: `${ord.customer.telephone}@s.whatsapp.net`,
    content: `*[Pembatalan Pesanan]*\n\nHalo ${
      ord.customer.name
    }, Terima kasih telah menggunakan layanan AkuCuciin.\n\nPesanan anda dengan ID: ${
      ord.id
    } berhasil dibatalkan.\n\n====================\n\n_Pesan ini dibuat otomatis oleh sistem AkuCuciin._\nID Pesanan: _${
      ord.id
    }`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      "X-Signature": xSignature,
    },
  });
};

export const sendOrderConfirmationToCustomer = async (ord) => {
  const payloadWaCustomer = {
    jid: `${ord.customer.telephone}@s.whatsapp.net`,
    content: `*[Pesanan Anda Telah Diterima]*\n\nHalo ${
      ord.customer.name
    },\n\nTerima kasih telah menggunakan layanan AkuCuciin. Berikut adalah detail pg esanan Anda:\n\n== Detail Pesanan ==\n📦 Paket Laundry: ${
      ord.package.name
    }\n📜 Jenis Laundry: ${ord.content}\n📝 Catatan: ${
      ord.note || "-"
    }\n📅 Tanggal Penjemputan: ${ord.pickup_date || "-"}\n⚖️ Berat Cucian: ${
      ord.weight
    } kg\n💰 Total Harga: Rp ${parseInt(ord.price).toLocaleString(
      "id-ID"
    )}\n🗺️ Pin Lokasi Anda: ${ord.maps_pinpoint}\n🎟️ Kupon: ${
      ord.coupon_code || "-"
    }\n🎟️ Referral Code: ${
      ord.referral_code || "-"
    }\n\n== Informasi Laundry ==\n🏠 Nama Laundry: ${
      ord.laundry_partner.name
    }\n📍 Lokasi: ${ord.laundry_partner.area}, ${
      ord.laundry_partner.city
    }\n📞 Kontak Laundry: https://wa.me/${
      ord.laundry_partner.telephone
    }\n\n====================\n\n_Pesan ini dibuat otomatis oleh sistem AkuCuciin._\nID Pesanan: _${
      ord.id
    }_\n📅 Tanggal Pemesanan: ${ord.created_at}`,
  };
  const xSignature = generateXSignature(payloadWaCustomer);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payloadWaCustomer, {
    headers: {
      "X-Signature": xSignature,
    },
  });
};

export const sendOrderConfirmationToLaundry = async (ord) => {
  const payloadWaLaundry = {
    jid: `${ord.laundry_partner.telephone}@s.whatsapp.net`,
    content: `*[Order baru telah diterima]*\n\nHalo ${
      ord.laundry_partner.name
    }! Order baru telah masuk, Berikut adalah detail pesanan: \n\n==Customer==\nNama: ${
      ord.customer.name
    }\nEmail: ${ord.customer.email}\nAlamat: ${
      ord.customer.address
    }\nPinpoint: ${ord.maps_pinpoint}\n\n==LAUNDRY==\n${
      ord.laundry_partner.name
    }, ${ord.laundry_partner.area}, ${
      ord.laundry_partner.city
    }\nNo HP laundry: https://wa.me/${
      ord.customer.telephone
    }\n\nPaket Laundry: ${ord.package.name}\nContent: ${ord.content}\nNote: ${
      ord.note || "-"
    }\nPickup Date: ${ord.pickup_date || "-"}\n\nKupon: ${
      ord.coupon_code || "-"
    }\nReferral Code: ${
      ord.referral_code || "-"
    }\n====================\n\n_Pesan ini dibuat otomatis oleh sistem Akucuciin_\n_${
      ord.id
    }_\n\nTanggal: ${ord.created_at}`,
  };
  const xSignature = generateXSignature(payloadWaLaundry);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payloadWaLaundry, {
    headers: {
      "X-Signature": xSignature,
    },
  });
};
