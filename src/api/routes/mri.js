import { Router } from "express";
import {
  getPreSignedUrl,
  fileUploadedController,
  getMriSlicesUrl,
  classifyMri,
} from "../controllers/mri/index.js";
import { auth } from "../middlewares/index.js";

const router = Router();

router.post("/:id/upload-url", auth, getPreSignedUrl);
router.post("/:id/file-uploaded", auth, fileUploadedController);
router.get("/:id/get-mri-slices", auth, getMriSlicesUrl);
router.get("/:id/classify", auth, classifyMri);

export default router;