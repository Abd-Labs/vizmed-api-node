import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Patient, MRI } from "../../../models/index.js";
import { errorHelper, logger, getText } from "../../../utils/index.js";

// Initialize S3 client (v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getMriSlicesUrl = async (req, res) => {
  const { id } = req.params;
  const doctorId = req.user._id;

  try {
    // Fetch patient and check if doctor has access
    const patient = await Patient.findOne({ _id: id, doctorId: doctorId });
    if (!patient) {
      return res
        .status(404)
        .json(errorHelper("00051", req, "Patient not found or access denied"));
    }

    console.log("Patient Found: ", patient)

    // Retrieve the first MRI file
    const mriFile = patient.mriFiles && patient.mriFiles.length > 0 
      ? patient.mriFiles[0]
      : null;
    console.log(mriFile)

    if (!mriFile) {
      return res
        .status(404)
        .json(errorHelper("00051", req, "No MRI file found"));
    }

    console.log("MRI file Found")

    const mri = await MRI.findOne({ _id: mriFile });
    console.log(mri)
    if (!mri) {
      return res
        .status(404)
        .json(errorHelper("00051", req, "No MRI data found"));
    }


    // Check MRI file status
    if (mri.status === "UNDER_PROCESSING") {
      return res
        .status(202)
        .json({
          resultCode: "00093",  // Message code for "MRI file processing has started"
          message: "The MRI file is currently being processed. Please try again later.",
        });
    }

    if (mri.status !== "PROCESSED") {
      return res
        .status(404)
        .json(errorHelper("00051", req, "No processed MRI file found"));
    }

    console.log("File Processed")

    // Create command to generate pre-signed URL for zip file
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: mri.zip_file_key,
    });

    // Generate pre-signed URL
    const downloadURL = await getSignedUrl(s3, command, { expiresIn: 1800 });

    return res.status(200).json({
      resultCode: "00089",  // Message code for "MRI slices retrieved successfully"
      downloadURL,
    });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
};

export default getMriSlicesUrl;