import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Patient, MRI } from "../../../models/index.js";
import { errorHelper, logger } from "../../../utils/index.js";

// Initialize S3 client (v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// File-uploaded controller
const fileUploadedController = async (req, res) => {
  const patientId = req.params.id; // Patient ID from query params
  const { s3Key } = req.body; // S3 key of the uploaded file
  const doctorId = req.user._id; // Doctor ID from the request context
  const callbackUrl = `${req.protocol}://${req.get('host')}/api/callback/file-processed`;


  try {
    // Step 1: Verify the file exists in S3
    const command = new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
    });

    try {
      await s3.send(command); // Check if file exists
    } catch (error) {
      if (error.name === "NotFound") {
        return res
          .status(404)
          .json(errorHelper("00094", req, "File not found on S3"));
      }
    }

    const patient = await Patient.findOne({
      _id: patientId,
      doctorId: doctorId,
    });
    if (!patient) {
      return res
        .status(404)
        .json(errorHelper("00087", req, "Patient not found"));
    }

    // Step 2: Create a new MRI object with status 'UPLOADED'
    const mriFile = new MRI({
      s3_key: s3Key,
      bucket_name: process.env.S3_BUCKET_NAME,
      status: "UPLOADED",
      zip_file_key: null, // Initially null
      metadata: null, // Initially null
    });
    
    await mriFile.save(); // Save MRI file to the database

    // Step 3: Save the MRI file in the patient's record
    patient.mriFiles.push(mriFile._id); // Add the MRI file ID to the mriFiles array
    const updatedPatient = await patient.save(); // Save the updated patient document

    // Step 4: Call the FastAPI endpoint to start file processing
    const fastApiResponse = await fetch(
      `${process.env.FAST_API_URL}/api/v1/file-processing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          s3_key: s3Key,
          bucket_name: process.env.S3_BUCKET_NAME,
          callback_url: callbackUrl,
          user_id: updatedPatient.doctorId,
          patient_id: patientId,
          mriFileId: mriFile._id
        }),
      }
    );

    if (!fastApiResponse.ok) {
      logger.error(
        `Error starting file processing: ${fastApiResponse.statusText}`
      );
      return res
        .status(500)
        .json(errorHelper("00003", req, "Error starting file processing"));
    }

    // Step 5: Update MRI file status to 'UNDER_PROCESSING'
    mriFile.status = "UNDER_PROCESSING";
    await mriFile.save(); // Save updated status in the database

    // Step 6: Send response back to frontend
    return res.status(200).json({
      resultCode: "00093",
      message: "File uploaded and processing started.",
      patient: updatedPatient,
    });
  } 
  catch (error) {
    console.log(error);
    logger.error("Error in file-uploaded controller:", error);
    return res.status(500).json(errorHelper("00005", req, error.message));
  }
};

export default fileUploadedController;
