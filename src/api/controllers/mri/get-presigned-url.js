import { Patient, Assessment } from "../../../models/index.js";
import {
  errorHelper,
  generateStudentS3Key,
  generateDoctorS3Key,
  generatePresignedUrl,
} from "../../../utils/index.js";
import { validateGetPreSignedUrl } from "../../validators/mri.validator.js";

const getPreSignedUrl = async (req, res) => {
  try {
    // Validate request body for fileName
    // const { error } = validateGetPreSignedUrl(req.body);

    // if (error) {
    //   console.log("validation error" , error)
    //   return res
    //     .status(400)
    //     .json(errorHelper("00016", req, error.details[0].message));
    // }

    const { fileName } = req.body; // Get file name from request body
    const { id } = req.params; // Get assessmentId or patientId from request params

    const userId = req.user._id; // User ID (student or doctor)
    const userRole = req.user.role; // User role (student or doctor)

    let s3Key;

    // Validate if the ID is a valid patient or assessment
    if (userRole === "Doctor") {
      // For Doctor: Validate patient exists
      const patient = await Patient.findById(id);
      if (!patient) {
        return res.status(400).json(errorHelper("00099", req));
      }
      s3Key = generateDoctorS3Key(userId, id, fileName); // id is patientId
    } else if (userRole === "Student") {
      // For Student: Validate assessment exists
      const assessment = await Assessment.findById(id);
      if (!assessment) {
        return res.status(400).json(errorHelper("00100", req));
      }
      s3Key = generateStudentS3Key(userId, id, fileName); // id is assessmentId
    } else {
      return res
        .status(403)
        .json(errorHelper("00015", req, "Unauthorized role"));
    }

    // Generate the presigned URL
    const uploadURL = await generatePresignedUrl(s3Key);

    // Return the presigned URL to the client
    return res.status(200).json({ resultCode: "00089", presignedUrl, s3Key });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
};

export default getPreSignedUrl;
