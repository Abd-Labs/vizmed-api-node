

import mongoose from "mongoose";

const diagnosisProfileSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mriFileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MriFile',
    required: true
  },
  classification_result: {
    axial_classification: { type: String, enum: ['AD', 'CN', 'EMCI', 'LMCI', 'MCI'] },
    coronal_classification: { type: String, enum: ['AD', 'CN', 'EMCI', 'LMCI', 'MCI'] },
    sagittal_classification: { type: String, enum: ['AD', 'CN', 'EMCI', 'LMCI', 'MCI'] },
    ensemble_prediction: { type: String, enum: ['AD', 'CN', 'EMCI', 'LMCI', 'MCI'] },
  },
  biomarkers: {
    type: [String],
    default: []
  },
  doctor_notes: {
    type: String,
    default: ''
  },
  diagnosis_status: {
    type: String,
    enum: ['INPROGRESS', 'COMPLETED'],
    default: 'INPROGRESS'
  }
}, { timestamps: true });

const DiagnosisProfile = mongoose.model('DiagnosisProfile', diagnosisProfileSchema);

export default DiagnosisProfile;