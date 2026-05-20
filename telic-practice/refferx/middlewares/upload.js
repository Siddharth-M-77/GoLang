import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import path from "path";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const type = req.body.type || "general";

    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(ext, "")
      .replace(/\s+/g, "_")
      .toLowerCase();

    let folder = "Ordimax/general";
    let transformation = [];

    switch (type) {
      case "profile":
        folder = "Ordimax/profiles";
        transformation = [
          { width: 400, height: 400, crop: "fill" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ];
        break;

      case "banner":
        folder = "Ordimax/banners";
        transformation = [
          { width: 1200, height: 600, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ];
        break;

      case "support":
        folder = "Ordimax/support";
        transformation = [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ];
        break;

      case "notification":
        folder = "Ordimax/notifications";
        transformation = [
          { width: 600, height: 600, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ];
        break;

      default:
        folder = "Ordimax/general";
        transformation = [{ quality: "auto" }, { fetch_format: "auto" }];
    }

    return {
      folder,
      resource_type: "image",
      public_id: `${type}_${Date.now()}_${safeName}`,
      transformation,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const type = req.body.type || "general";

  const allowedTypes = {
    profile: ["image/jpeg", "image/png", "image/webp"],
    banner: ["image/jpeg", "image/png", "image/webp"],
    support: ["image/jpeg", "image/png", "image/webp"],
    notification: ["image/jpeg", "image/png", "image/webp"],
    general: ["image/jpeg", "image/png", "image/webp"],
  };

  if (!allowedTypes[type]?.includes(file.mimetype)) {
    return cb(
      new Error(`Invalid file type for ${type}. Only JPG, PNG, WEBP allowed`),
      false,
    );
  }

  cb(null, true);
};

const limits = {
  fileSize: 5 * 1024 * 1024,
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

export default upload;
