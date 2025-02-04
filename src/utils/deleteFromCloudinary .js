import { v2 as cloudinary } from "cloudinary";

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      console.error("No public ID provided.");
      return null;
    }

    const response = await cloudinary.uploader.destroy(publicId);
    
    if (response.result === "ok") {
      console.log("File deleted successfully from Cloudinary.");
      return true;
    } else {
      console.error("Failed to delete file from Cloudinary.");
      return false;
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return false;
  }
};

export { deleteFromCloudinary };