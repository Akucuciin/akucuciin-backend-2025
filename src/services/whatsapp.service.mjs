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

export const sendOrderAssignedToDriver = async (ord) => {
  const payload = {
    jid: `${ord.driver.telephone}@s.whatsapp.net`,
    content: `*[Assigned]*\n\nHalo ${ord.driver.name},\n\nAnda telah menerima penugasan pesanan baru. Berikut detailnya : \n\n==Customer==\nNama: ${ord.customer.name}\nEmail: ${ord.customer.email}\nAlamat: ${ord.customer.address}Kontak: https://wa.me/${ord.customer.telephone}\nPinpoint: ${ord.maps_pinpoint}\n\n==LAUNDRY==\n${ord.laundry_partner.name}, ${ord.laundry_partner.area}, ${ord.laundry_partner.city}\nKontak laundry: https://wa.me/${ord.customer.telephone}\n\nTerima kasih atas kerjasamanya!, jangan lupa untuk selalu mengecek dashboard driver anda :D\n\n====================\n\n_Pesan ini dikirim otomatis oleh sistem AkuCuciin._`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      "X-Signature": xSignature,
    },
  });
};

export const sendOrderAssignedPengantaranToDriver = async (ord) => {
  const payload = {
    jid: `${ord.driver.telephone}@s.whatsapp.net`,
    content: `*[Assigned : Pengantaran ke Customer]*\n\nHalo ${ord.driver.name},\n\nAnda telah menerima penugasan pesanan baru. Berikut detailnya : \n\n==Customer==\nNama: ${ord.customer.name}\nEmail: ${ord.customer.email}\nAlamat: ${ord.customer.address}Kontak: https://wa.me/${ord.customer.telephone}\nPinpoint: ${ord.maps_pinpoint}\n\n==LAUNDRY==\n${ord.laundry_partner.name}, ${ord.laundry_partner.area}, ${ord.laundry_partner.city}\nKontak laundry: https://wa.me/${ord.customer.telephone}\n\nTerima kasih atas kerjasamanya!, jangan lupa untuk selalu mengecek dashboard driver anda :D\n\n====================\n\n_Pesan ini dikirim otomatis oleh sistem AkuCuciin._`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      "X-Signature": xSignature,
    },
  });
};

export const sendOrderCancellationConfirmationToCustomer = async (ord) => {
  const payload = {
    jid: `${ord.customer.telephone}@s.whatsapp.net`,
    content: `*[Pembatalan Pesanan]*\n\nHalo ${ord.customer.name}, Terima kasih telah menggunakan layanan AkuCuciin.\n\nPesanan anda dengan ID: _${ord.id}_ berhasil dibatalkan.\n\n====================\n\n_Pesan ini dibuat otomatis oleh sistem AkuCuciin._\nID Pesanan: _${ord.id}_`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      "X-Signature": xSignature,
    },
  });
};

export const sendOrderCancellationConfirmationToLaundry = async (ord) => {
  const payload = {
    jid: `${ord.laundry_partner.telephone}@s.whatsapp.net`,
    content: `*[Pembatalan Pesanan]*\n\nHalo ${ord.laundry_partner.name},\n\nPesanan customer ${ord.customer.name} dengan ID: _${ord.id}_ dibatalkan oleh customer.\n\n====================\n\n_Pesan ini dibuat otomatis oleh sistem AkuCuciin._\nID Pesanan: _${ord.id}_`,
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
    },\n\nTerima kasih telah menggunakan layanan AkuCuciin. Berikut adalah detail pesanan Anda:\n\n== Detail Pesanan ==\n📦 Paket Laundry: ${
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
      ord.laundry_partner.telephone
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

export const sendNewOrderPaymentToCustomer = async (ord, paymentLink) => {
  const payload = {
    jid: `${ord.customer.telephone}@s.whatsapp.net`,
    content: `*[PEMBAYARAN - UPDATED]*\n\nHalo ${
      ord.customer.name
    }\nLink pembayaran diperbaharui, silahkan lakukan pembayaran di link tertera\nLink hanya berlaku selama ${parseFloat(
      (AppConfig.PAYMENT.DOKU.expiredTime / 60).toFixed(2)
    )} jam\n\nID:\n${
      ord.id
    }\n\nLink Pembayaran:\n${paymentLink}\n\nLink pembayaran juga dapat dilihat di dashboard anda di: https://akucuciin.com/order\n\nJika link kadaluwarsa, silahkan kunjungi dashboard order anda dan klik "Pay" / "Bayar" untuk mendapatkan link baru\n\n====================\n\n_Pesan ini dikirim otomatis oleh sistem AkuCuciin._`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      "X-Signature": xSignature,
    },
  });
};

export const sendOrderPaymentToCustomer = async (ord, paymentLink) => {
  const payload = {
    jid: `${ord.customer.telephone}@s.whatsapp.net`,
    content: `*[PEMBAYARAN]*\n\nHalo ${
      ord.customer.name
    }\nSilahkan lakukan pembayaran di link tertera\nLink hanya berlaku selama ${parseFloat(
      (AppConfig.PAYMENT.DOKU.expiredTime / 60).toFixed(2)
    )} jam\n\nID:\n${
      ord.id
    }\n\nLink Pembayaran:\n${paymentLink}\n\nLink pembayaran juga dapat dilihat di dashboard anda di: https://akucuciin.com/order\n\nJika link kadaluwarsa, silahkan kunjungi dashboard order anda dan klik "Pay" / "Bayar" untuk mendapatkan link baru\n\n====================\n\n_Pesan ini dikirim otomatis oleh sistem AkuCuciin._`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      "X-Signature": xSignature,
    },
  });
};
