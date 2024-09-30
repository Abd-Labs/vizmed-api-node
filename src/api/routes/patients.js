import { Router } from 'express';
import { 
  createPatient, 
  getPatients, 
  getPatientById, 
  updatePatient, 
  deletePatient,
  getPreSignedUrl,
  fileUploadedController,
  getMriSlicesUrl 
} from '../controllers/patient/index.js';
import { auth } from '../middlewares/index.js';

const router = Router();

// Patient CRUD Operations
router.post('/', auth, createPatient);
router.get('/', auth,  getPatients);
router.get('/:id', auth,  getPatientById);
router.put('/:id',auth, updatePatient);
router.delete('/:id',auth, deletePatient);
router.post('/:id/upload-url',auth, getPreSignedUrl);
router.post('/:id/file-uploaded',auth, fileUploadedController);
router.get('/:id/get-mri-slices',auth,getMriSlicesUrl);

export default router;