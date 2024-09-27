import mongoose from 'mongoose';

// Schema for MRI file, including metadata
const mriFileSchema = new mongoose.Schema({
  s3_key: { type: String, required: true }, // S3 key for the MRI file
  bucket_name: { type: String, required: true }, // Bucket name where the MRI file is stored
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User ID associated with the MRI
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true }, // Patient ID associated with the MRI
  status: { 
    type: String, 
    enum: ['UPLOADED', 'UNDER_PROCESSING', 'PROCESSED'], 
    required: true 
  }, // Status of the MRI file
  metadata: {
    axial: {
      num_slices: { type: Number, required: true },
      folder_key: { type: String, required: true }
    },
    sagittal: {
      num_slices: { type: Number, required: true },
      folder_key: { type: String, required: true }
    },
    coronal: {
      num_slices: { type: Number, required: true },
      folder_key: { type: String, required: true }
    },
    zip_file_key: { type: String, required: true } // S3 key for the zipped file
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});