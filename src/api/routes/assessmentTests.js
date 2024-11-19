import {Router} from 'express';
import { auth, isStudent } from '../middlewares/index.js';
import {createAssessment} from '../../api/controllers/assessments/index.js';

const router = Router();

router.post('/', auth, isStudent, createAssessment);

export default router;