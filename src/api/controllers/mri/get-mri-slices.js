import { Patient, MRI, Assessment } from "../../../models/index.js";
import {
  errorHelper,
  generateGetUrl,
} from "../../../utils/index.js";

const getMriSlicesUrl = async (req, res) => {
  const id  = req.params.id;
  const { _id: userId, role: userRole } = req.user; // User ID and role

  try {

    let resourceObject;

    if (userRole === "Doctor") {
      resourceObject = await Patient.findOne({ _id: id, doctorId: userId });
    }
    else if (userRole === "Student") {
      resourceObject = await Assessment.findOne({ _id: id, studentId: userId })
    }

    if (!resourceObject) {
      return res.status(404).json(errorHelper("00051", req));
    }

    // Retrieve the first MRI file
    const mriFile =  userRole === "Doctor" ?  resourceObject.mriFiles[0] : resourceObject.mriFile;

    if (!mriFile) {
      return res
        .status(404)
        .json(errorHelper("00102", req));
    }

    const mri = await MRI.findOne({ _id: mriFile });

    if (!mri) {
      return res
        .status(404)
        .json(errorHelper("00051", req));
    }

    // Check MRI file status
    if (mri.status === "UNDER_PROCESSING") {
      return res.status(202).json({
        resultCode: "00093", // Message code for "MRI file processing has started"
        message:
          "The MRI file is currently being processed. Please try again later.",
      });
    }

    if (mri.status !== "PROCESSED") {
      return res
        .status(404)
        .json(errorHelper("00051", req, "No processed MRI file found"));
    }

    // Generate pre-signed URL
    const downloadURL = await generateGetUrl(mri.zip_file_key);

    return res.status(200).json({
      resultCode: "00089", // Message code for "MRI slices retrieved successfully"
      downloadURL,
    });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
};

export default getMriSlicesUrl;
