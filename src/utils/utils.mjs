import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  21
);

function generateNanoidWithPrefix(prefix = "") {
  return prefix + "-" + nanoid();
}

function lowerAndCapitalizeFirstLetter(val) {
  val = val.toLowerCase();
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export { generateNanoidWithPrefix, lowerAndCapitalizeFirstLetter };

