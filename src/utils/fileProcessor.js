import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUploadPath = path.join(__dirname, "..", "upload");

const normalizeImagePath = (filePath) => {
  const relativePath = path.relative(process.cwd(), filePath);
  return relativePath.replace(/\\/g, "/");
};

export const saveTempFileToPermanent = async (tempFileInfo, targetDir) => {
  return new Promise((resolve, reject) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(tempFileInfo.originalname);
    const filename = tempFileInfo.fieldname + "-" + uniqueSuffix + ext;
    const targetPath = path.join(targetDir, filename);
    
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    if (!fs.existsSync(tempFileInfo.tempPath)) {
      reject(new Error(`Temp file not found: ${tempFileInfo.tempPath}`));
      return;
    }
    
    fs.rename(tempFileInfo.tempPath, targetPath, (err) => {
      if (err) {
        // If rename fails (cross-device), copy and delete
        if (err.code === 'EXDEV') {
          const readStream = fs.createReadStream(tempFileInfo.tempPath);
          const writeStream = fs.createWriteStream(targetPath);
          
          readStream.pipe(writeStream);
          
          writeStream.on('finish', () => {
            fs.unlink(tempFileInfo.tempPath, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Error deleting temp file:', unlinkErr);
              }
              resolve({
                originalFieldname: tempFileInfo.fieldname,
                originalname: tempFileInfo.originalname,
                filename: filename,
                path: normalizeImagePath(targetPath),
                size: tempFileInfo.size
              });
            });
          });
          
          writeStream.on('error', reject);
          readStream.on('error', reject);
        } else {
          reject(err);
        }
      } else {
        resolve({
          originalFieldname: tempFileInfo.fieldname,
          originalname: tempFileInfo.originalname,
          filename: filename,
          path: normalizeImagePath(targetPath),
          size: tempFileInfo.size
        });
      }
    });
  });
};

export const processAndSaveFiles = async (tempFiles, basePath) => {
  const savedFiles = [];
  const errors = [];
  
  for (const tempFile of tempFiles) {
    try {
      let targetDir = basePath;
      
      if (
        tempFile.fieldname.startsWith("mainImage") ||
        tempFile.fieldname.startsWith("hoverImage")
      ) {
        targetDir = path.join(basePath, "main");
      } else if (tempFile.fieldname.startsWith("gallery")) {
        targetDir = path.join(basePath, "gallery");
      }
      
      const savedFile = await saveTempFileToPermanent(tempFile, targetDir);
      savedFiles.push(savedFile);
    } catch (error) {
      errors.push({ file: tempFile, error: error.message });
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Failed to save ${errors.length} files: ${errors.map(e => e.error).join(', ')}`);
  }
  
  return savedFiles;
};

export const cleanupTempFiles = (req) => {
  if (req.tempFiles && req.tempFiles.length) {
    req.tempFiles.forEach((tempFile) => {
      if (tempFile.tempPath && fs.existsSync(tempFile.tempPath)) {
        try {
          fs.unlinkSync(tempFile.tempPath);
          console.log(`Cleaned up temp file: ${tempFile.tempPath}`);
        } catch (error) {
          console.error(`Error cleaning up temp file ${tempFile.tempPath}:`, error);
        }
      }
    });
    req.tempFiles = [];
  }
};

export const deleteImageFile = (imagePath) => {
  if (imagePath) {
    const fullPath = path.join(process.cwd(), imagePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`Deleted image: ${fullPath}`);
      } catch (error) {
        console.error(`Error deleting image ${fullPath}:`, error);
      }
    }
  }
};

export const deleteMultipleImageFiles = (images) => {
  if (images && Array.isArray(images)) {
    images.forEach((img) => {
      if (img) {
        deleteImageFile(img);
      }
    });
  }
};