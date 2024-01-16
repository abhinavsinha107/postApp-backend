import express from "express";
import multer from "multer";
import { uploadImage } from "../controllers/imageUpload.controller";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/", upload.single("myimage"), uploadImage);

export default router;