import {Router} from 'express';
import { fileProcessed } from '../controllers/callbacks/index.js';
const router = Router();

router.post('/file-processed', fileProcessed);

export default router;