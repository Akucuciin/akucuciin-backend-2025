import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  21
);

function generateNanoidWithPrefix(prefix = "") {
  return prefix + "-" + nanoid();
}

export const generateCouponName = (
  prefix = null,
  length = 5,
  customerName = "",
  useTimestamp = true
) => {
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", length);
  const randomCode = nanoid();

  const sanitizedName = customerName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);

  const timestampSuffix = useTimestamp
    ? Date.now().toString(36).toUpperCase().slice(-4)
    : "";

  let parts = [];

  if (prefix && prefix.trim()) parts.push(prefix.toUpperCase());
  if (sanitizedName) parts.push(sanitizedName);
  parts.push(`${randomCode}${timestampSuffix}`);

  return parts.join("-");
};

function lowerAndCapitalizeFirstLetter(val) {
  val = val.toLowerCase();
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export const transformPhoneNumber = (phone) => {
  if (!phone) return "";

  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }

  if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
};

export { generateNanoidWithPrefix, lowerAndCapitalizeFirstLetter };
