import { Router } from "express";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getDiagnosisProfile,
  fetchPatientStatistics,
  getAllDiagnosisProfiles
} from "../controllers/patient/index.js";
import { auth, isDoctor } from "../middlewares/index.js";

const router = Router();

// Patient CRUD Operations
router.post("/", auth, createPatient);
router.get("/", auth, getPatients);
router.get("/statistics", auth, isDoctor, fetchPatientStatistics);

// Diagnosis Profile Routes
router.get('/diagnosis-profile', auth, getAllDiagnosisProfiles); // More specific route first
router.get("/:id/diagnosis-profile", auth, getDiagnosisProfile); // Wildcard route after

// Patient-specific Routes
router.get("/:id", auth, getPatientById);
router.put("/:id", auth, updatePatient);
router.delete("/:id", auth, deletePatient);

export default router;
