import { Router } from 'express';
import { 
  createPatient, 
  getPatients, 
  getPatientById, 
  updatePatient, 
  deletePatient,

} from '../controllers/patient/index.js';
import { auth } from '../middlewares/index.js';

const router = Router();

// Patient CRUD Operations
router.post('/', auth, createPatient);
router.get('/', auth,  getPatients);
router.get('/:id', auth,  getPatientById);
router.put('/:id',auth, updatePatient);
router.delete('/:id',auth, deletePatient);

export default router;