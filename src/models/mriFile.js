import mongoose from "mongoose";

const mriFileSchema = new mongoose.Schema({
  s3_key: { type: String, required: true }, // S3 key for the MRI file
  bucket_name: { type: String, required: true }, // Bucket name where the MRI file is stored
  status: {
    type: String,
    enum: ["UPLOADED", "UNDER_PROCESSING", "PROCESSED"],
    required: true,
  }, // Status of the MRI file
  zip_file_key: { type: String }, // S3 key for the zipped file
  metadata: {
    axial: {
      num_slices: { type: Number },
      folder_key: { type: String},
    },
    sagittal: {
      num_slices: { type: Number},
      folder_key: { type: String},
    },
    coronal: {
      num_slices: { type: Number},
      folder_key: { type: String},
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

 const MRI = mongoose.model('MRIFile',mriFileSchema);

 export default MRI;