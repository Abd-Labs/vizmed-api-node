import { Router } from 'express';
import { 
  createPatient, 
  getPatient, 
  // getPatientById, 
  // updatePatient, 
  // deletePatient 
} from '../controllers/patient/index.js';
import { auth } from '../middlewares/index.js';

const router = Router();

// Patient CRUD Operations
router.post('/', createPatient);
router.get('/',  getPatient);
// router.get('/:id', getPatientById);
// router.put('/:id', updatePatient);
// router.delete('/:id', deletePatient);

export default router;
