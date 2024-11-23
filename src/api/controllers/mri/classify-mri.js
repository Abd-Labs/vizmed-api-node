import axios from 'axios';
import { Patient } from "../../../models/index.js";
import { MRI } from "../../../models/index.js";
import { DiagnosisProfile } from "../../../models/index.js";

const classifyMRI = async (req,res) => {

  try {
    const  patientId  = req.params.id;

      // Find the patient by patientId (patientId is a string in the model)
      const patient = await Patient.findOne({ _id: patientId });
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
  
      // Find the latest MRI file for the patient
      const mriFileId = patient.mriFiles[0]; // Assuming the last one is the latest
      if (!mriFileId) {
        return res.status(404).json({ message: 'No MRI files found for this patient' });
      }
  
      // Fetch the full MRI file details from the database
      const mriFile = await MRI.findById(mriFileId);
      if (!mriFile) {
        return res.status(404).json({ message: 'MRI file not found' });
      }
  
      // Check if the MRI file is processed
      if (mriFile.status === 'UPLOADED') {
         return res.status(422).json({ message: 'Operation not Permitted. File is not processed', mriFileStatus: mriFile.status });
      }

      else if (mriFile.status === 'UNDER_PROCESSING') {
        return res.status(422).json({ message: 'File is still under processing', mriFileStatus: mriFile.status });
      } 

      // Call the FastAPI classification endpoint
      const fastApiUrl = `${process.env.FAST_API_URL}/api/v1/classify`; // Replace with your actual FastAPI URL
      const requestData = {
        s3_key: mriFile.s3_key,
        bucket_name: mriFile.bucket_name,
      };
  
      const fastApiResponse = await axios.post(fastApiUrl, requestData);
  
      if (fastApiResponse.status !== 200) {
        return res.status(500).json({ message: 'Failed to classify MRI file' });
      }
  
      const classificationResult = fastApiResponse.data.data;
  
      // Create a new DiagnosisProfile
      const diagnosisProfile = new DiagnosisProfile({
        patient_id: patient._id,
        doctor_id: patient.doctorId,
        mriFileId: mriFile._id,
        classification_result: {
          axial_classification: classificationResult.axial_classification,
          coronal_classification: classificationResult.coronal_classification,
          sagittal_classification: classificationResult.sagittal_classification,
          ensemble_prediction: classificationResult.ensemble_prediction,
        },
        biomarkers: [], // Empty for now, can be added later
        doctor_notes: '', // Placeholder, can be added later
        diagnosis_status: 'INPROGRESS',
      });
  
      await diagnosisProfile.save();
  
      // Return the diagnosis profile
      return res.status(201).json({
        message: 'Classification Successful',
        diagnosisProfile,
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server error'});
    }

}

export default classifyMRI;