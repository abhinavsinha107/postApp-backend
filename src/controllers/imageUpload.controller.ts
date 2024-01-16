import express from "express";
import cloudinary from "cloudinary";
import sharp from "sharp";

export const uploadImage = async (req: express.Request, res: express.Response) => {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      message: "No image file provided"
    });
  }
  sharp(file.buffer)
    .resize({ width: 800 })
    .toBuffer(async (err, data, info) => {
      if (err) {
        console.error("Image processing error:", err);
        return res
          .status(500)
          .json({ ok: false, error: "Error processing image..." });
      }
    cloudinary.v2.uploader
        .upload_stream({ resource_type: "auto" }, async (error, result) => {
            if (error) {
                console.error("Cloudinary Upload Error:", error);
                return res.status(500).json({
                    ok: false,
                    error: "Error uploading image to Cloudinary...",
                });
            }
            res.json({
                ok: true,
                imageUrl: result?.url, // Add null check here
                message: "Image uploaded successfully",
            });
        })
        .end(data);
    });
};
