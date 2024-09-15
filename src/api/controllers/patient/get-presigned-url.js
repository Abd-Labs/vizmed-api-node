
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Patient } from "../../../models/index.js";
import { errorHelper, logger, getText } from "../../../utils/index.js";
import { validateGetPreSignedUrl } from "../../validators/patient.validator.js";

// Initialize S3 client (v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getPreSignedUrl = async (req, res) => {
  // Validate the request body
  const { error } = validateGetPreSignedUrl(req.body);
  if (error) {
    return res
      .status(400)
      .json(errorHelper("00038", req, error.details[0].message));
  }

  const { id } = req.params; 
  const doctorId = req.user._id; 
  const { fileName, fileType } = req.body;
  try {
    // Verify the patient exists and the user (doctor)  has access to that patient
    const patient = await Patient.findOne({ _id: id, doctorId: doctorId });
    if (!patient) {
      return res
        .status(404)
        .json(errorHelper("00051", req, "Patient not found or access denied"));
    }

    //Define the S3 key (file path)
    const s3Key = `mri/doctors/${doctorId}/patients/${id}/${fileName}`; 

    // Create the PutObjectCommand for S3
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME, // S3 bucket name
      Key: s3Key, // File path in the S3 bucket
      ContentType: fileType, // File type (e.g., application/dicom or application/nifti)
    });

    //Generate the pre-signed URL
    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 1800 });

    //Return the pre-signed URL to the client
    return res.status(200).json({
      resultCode: "00089",
      uploadURL,  
      s3Key, // Store this key later in the database after the file is uploaded
    });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
};

export default getPreSignedUrl;