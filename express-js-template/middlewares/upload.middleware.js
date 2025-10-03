const cloudinary = require("../bin/cloudinary");
class Upload {
  async uploadImage(req, res, next) {
    req.body.image = { public_id: null, avatar_url: null };
    console.log("upload", req.file);
    if (!req.file) return next();
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "ucnucImages",
    });

    req.body.image = {
      public_id: result.public_id,
      avatar_url: result.secure_url,
    };
    return next();
  }

  async deleteImage(err, req, res, next) {
    if (err) {
      console.log(err);
      const { public_id } = req?.body?.image;
      try {
        if (public_id) {
          await cloudinary.uploader.destroy(public_id);
        }
      } catch (error) {
        console.log(error);
      } finally {
        return next(err);
      }
    }
  }
}

module.exports = new Upload();
