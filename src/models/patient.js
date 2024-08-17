// models/patient.js
import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  contactInfo: {
    phone: { type: String, required: true },
  },
  mriImages: [{ type: String }], // URLs or paths to MRI images
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
