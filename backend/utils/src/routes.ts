import express from "express";
import cloudinary from "cloudinary";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    // Handle file upload logic here
    const { buffer, public_id } = req.body;

    if (public_id) {
      await cloudinary.v2.uploader.destroy(public_id);
    }

    const uploadResponse = await cloudinary.v2.uploader.upload(buffer);

    res.json({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
