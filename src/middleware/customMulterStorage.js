import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUploadPath = path.join(__dirname, "..", "upload");

const getTempDir = () => {
  const tempDir = path.join(os.tmpdir(), "product-uploads");
    
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

const TEMP_DIR = getTempDir();

const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createUploadFolders = () => {
  const dirs = [
    baseUploadPath,
    path.join(baseUploadPath, "main"),
    path.join(baseUploadPath, "gallery"),
  ];
  
  dirs.forEach((dir) => ensureDirectoryExists(dir));
};

createUploadFolders();

const customStorage = {
  _handleFile: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const tempFilename = `temp-${uniqueSuffix}${ext}`;
    const tempPath = path.join(TEMP_DIR, tempFilename);
    
    const writeStream = fs.createWriteStream(tempPath);
    
    req.tempFiles = req.tempFiles || [];
    
    file.stream.pipe(writeStream);
    
    writeStream.on('error', (error) => {
      console.error('Error writing temp file:', error);
      cb(error);
    });
    
    writeStream.on('finish', () => {
      const tempFileInfo = {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        tempPath: tempPath,
        size: writeStream.bytesWritten,
        filename: tempFilename
      };
      
      req.tempFiles.push(tempFileInfo);
      
      cb(null, {
        path: tempPath,
        size: writeStream.bytesWritten,
        tempFileInfo: tempFileInfo
      });
    });
  },
  
  _removeFile: function(req, file, cb) {
    if (file.path && fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error('Error deleting temp file:', err);
        }
        cb(err);
      });
    } else {
      cb();
    }
  }
};

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
  storage: customStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter,
});

export const uploadProductImages = upload.any();
export const updateProductImages = upload.any();

export { TEMP_DIR };