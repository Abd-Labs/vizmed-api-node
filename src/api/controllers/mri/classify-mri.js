import axios from "axios";
import { Patient } from "../../../models/index.js";
import { MRI } from "../../../models/index.js";
import { DiagnosisProfile, Assessment } from "../../../models/index.js";
import { errorHelper, callFastApiEndpoint } from "../../../utils/index.js";

const classifyMRI = async (req, res) => {
  try {
    const id = req.params.id;
    const userRole = req.user.role;

    let resourceObject;

    if (userRole === "Doctor") {
      resourceObject = await Patient.findOne({ _id: id });
      if (!resourceObject) {
        return res.status(404).json(errorHelper("00087", req));
      }
    } else if (userRole === "Student") {
      resourceObject = await Assessment.findOne({ _id: id });

      if (!resourceObject) {
        return res.status(404).json(errorHelper("00100", req));
      }

      if (resourceObject.status === "P") {
        return res.status(403).json(errorHelper("00101", req));
      }
    } else {
      return res.status(403).json(errorHelper("00019", req));
    }

    // Find the latest MRI file for the patient
    const mriFileId =
      userRole === "Doctor"
        ? resourceObject.mriFiles[0]
        : resourceObject.mriFile;

    if (!mriFileId) {
      return res.status(404).json(errorHelper("00102", req));
    }

    // Fetch the full MRI file details from the database
    const mriFile = await MRI.findById(mriFileId);
    if (!mriFile) {
      return res.status(404).json(errorHelper("00102", req));
    }

    // Check if the MRI file is processed
    if (mriFile.status === "UPLOADED") {
      return res.status(422).json({
        message: "Operation not Permitted. File is not processed",
        mriFileStatus: mriFile.status,
      });
    } else if (mriFile.status === "UNDER_PROCESSING") {
      return res.status(422).json({
        message: "File is still under processing",
        mriFileStatus: mriFile.status,
      });
    }

    // Call the FastAPI classification endpoint
    const fastApiUrl = `${process.env.FAST_API_URL}/api/v1/classify`; // Replace with your actual FastAPI URL
    const requestData = {
      s3_key: mriFile.s3_key,
      bucket_name: mriFile.bucket_name,
    };

    const fastApiResponse = await callFastApiEndpoint(fastApiUrl, requestData);

    if (!fastApiResponse.ok) {
      return res.status(500).json({ message: "Failed to classify MRI file" });
    }

    const json = await fastApiResponse.json();
    const classificationResult = json.data;

    let responseData;

    if (userRole === "Doctor") {
      const diagnosisProfile = new DiagnosisProfile({
        patient_id: resourceObject._id,
        doctor_id: resourceObject.doctorId,
        mriFileId: mriFile._id,
        classification_result: {
          axial_classification: classificationResult.axial_classification,
          coronal_classification: classificationResult.coronal_classification,
          sagittal_classification: classificationResult.sagittal_classification,
          ensemble_prediction: classificationResult.ensemble_prediction,
        },
        biomarkers: [], // Empty for now, can be added later
        doctor_notes: "", // Placeholder, can be added later
        diagnosis_status: "INPROGRESS",
      });

      await diagnosisProfile.save();
      responseData = diagnosisProfile;
      
    } else if (userRole === "Student") {
      resourceObject.model_classification_result = {
        axial_classification: classificationResult.axial_classification,
        coronal_classification: classificationResult.coronal_classification,
        sagittal_classification: classificationResult.sagittal_classification,
        ensemble_prediction: classificationResult.ensemble_prediction,
      };

      responseData = await resourceObject.save();
    }

    // Return the diagnosis profile
    return res.status(201).json({
      message: "Classification Successful",
      data: responseData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export default classifyMRI;
