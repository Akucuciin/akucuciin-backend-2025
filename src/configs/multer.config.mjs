import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import { BadRequestError } from "../errors/customErrors.mjs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "storage");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + crypto.randomBytes(32).toString("hex") + ext);
  },
});

const maxSizeMb = 2;
const maxSize = maxSizeMb * 1024 * 1024; // 5MB

const uploadPartnerImage = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new BadRequestError("Failed, image only"));
  }
}

export { uploadPartnerImage };

