import {Router} from 'express';
import { auth, isStudent } from '../middlewares/index.js';
import {createAssessment, getAllAssessments} from '../../api/controllers/assessments/index.js';

const router = Router();

router.post('/', auth, isStudent, createAssessment);
router.get('/', auth, isStudent, getAllAssessments);

export default router;