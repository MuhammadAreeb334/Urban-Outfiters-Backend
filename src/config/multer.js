import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUploadPath = path.join(__dirname, "upload");

const createUploadFolders = () => {
  const dirs = [
    path.join(baseUploadPath),
    path.join(baseUploadPath, "main"),
    path.join(baseUploadPath, "gallery"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadFolders();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = baseUploadPath;

    if (file.fieldname === "mainImage" || file.fieldname === "hoverImage") {
      uploadPath = path.join(baseUploadPath, "main");
    } else if (file.fieldname === "allImages") {
      uploadPath = path.join(baseUploadPath, "gallery");
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: fileFilter,
});

export const uploadProductImages = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "hoverImage", maxCount: 1 },
  { name: "allImages", maxCount: 5 },
]);

export const updateProductImages = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "hoverImage", maxCount: 1 },
  { name: "allImages", maxCount: 5 },
]);
