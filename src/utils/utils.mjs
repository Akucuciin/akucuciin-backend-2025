import { v7 } from "uuid";

function generateUuidWithPrefix(prefix = "") {
  return prefix + "-" + v7();
}

function lowerAndCapitalizeFirstLetter(val) {
  val = val.toLowerCase();
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export { generateUuidWithPrefix, lowerAndCapitalizeFirstLetter };

