function extractPublicId(cloudinaryUrl) {
    const urlParts = cloudinaryUrl.split('/');
    const versionIndex = urlParts.findIndex((part) => part.startsWith('v'));
  
    if (versionIndex !== -1) {
      // Get everything after "v<version_number>/"
      let publicIdWithExt = urlParts.slice(versionIndex + 1).join('/');
  
      // Remove the file extension (like .jpg, .png)
      return publicIdWithExt.replace(/\.[^/.]+$/, "");
    }
  
    return null; // Return null if format is incorrect
  }

  export default extractPublicId;