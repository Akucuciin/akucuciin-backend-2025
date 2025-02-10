import { nanoid } from "nanoid";

function generateUuidWithPrefix(prefix = "") {
  return prefix + "-" + nanoid(21);
}

function lowerAndCapitalizeFirstLetter(val) {
  val = val.toLowerCase();
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export { generateUuidWithPrefix, lowerAndCapitalizeFirstLetter };

