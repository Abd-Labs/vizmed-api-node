import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Patient, MRI, Assessment } from "../../../models/index.js";
import { errorHelper, logger, validateS3Object, callFastApiEndpoint } from "../../../utils/index.js";

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
  const id = req.params.id; // Patient ID or Assessment ID from query params
  const { s3Key } = req.body; // S3 key of the uploaded file
  const { _id: userId, role: userRole } = req.user; // User ID and role
  const callbackUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/callback/file-processed`;

  try {
    // Step 1: Verify the file exists in S3
    const fileExists = await validateS3Object(s3Key);

    if (!fileExists) {
      return res
        .status(404)
        .json(errorHelper("00094", req, "File not found on S3"));
    }

    let parentObject;

    if (userRole === "Doctor") {
      // Step 2 (Doctor): Validate patient existence
      parentObject = await Patient.findOne({ _id: id, doctorId: userId });
      if (!parentObject) {
        return res.status(404).json(errorHelper("00099", req));
      }
    } else if (userRole === "Student") {
      // Step 2 (Student): Validate assessment existence
      parentObject = await Assessment.findOne({ _id: id, studentId: userId });
      if (!parentObject) {
        return res.status(404).json(errorHelper("00100", req));
      }
    } else {
      return res.status(403).json(errorHelper("00019", req));
    }

    // Step 3: Create a new MRI object with status 'UPLOADED'
    const mriFile = new MRI({
      s3_key: s3Key,
      bucket_name: process.env.S3_BUCKET_NAME,
      status: "UPLOADED",
      zip_file_key: null,
      metadata: null,
    });

    await mriFile.save(); // Save MRI file to the database

    // Step 4: Add MRI object reference to the parent object
    if (userRole === "Doctor") {
      parentObject.mriFiles.push(mriFile._id);
    } else if (userRole === "Student") {
      parentObject.mriFile = mriFile._id;
    }
    await parentObject.save();

    // Step 5: Call FastAPI endpoint to start processing
    const fileProcessingRequest = {
      s3_key: s3Key,
      bucket_name: process.env.S3_BUCKET_NAME,
      callback_url: callbackUrl,
      user_id: userId,
      resource_id: parentObject._id,
      mriFileId: mriFile._id,
    };

    const fastApiResponse = await callFastApiEndpoint(
      `${process.env.FAST_API_URL}/api/v1/file-processing`,
      fileProcessingRequest
    );

    if (!fastApiResponse.ok) {
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
      data: parentObject
    });
  } catch (error) {
    console.log(error);
    logger.error("Error in file-uploaded controller:", error);
    return res.status(500).json(errorHelper("00095", req, error.message));
  }
};

export default fileUploadedController;
