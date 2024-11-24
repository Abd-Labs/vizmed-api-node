import { DiagnosisProfile } from "../../../models/index.js";
import { errorHelper } from "../../../utils/index.js";
import { validateGetDiagnosisProfile } from "../../validators/patient.validator.js";

const getDiagnosisProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user._id;
    const type = req.query.type; // Type of diagnosis profile to retrieve

    const { error } = validateGetDiagnosisProfile(req.query); // Validate the query parameter

    if (error) {
      return res.status(400).json(errorHelper("00103", req));
    }

    let diagnosisProfile;

    if (type === "P") {
      diagnosisProfile = await DiagnosisProfile.findOne({ patient_id: id, doctor_id: doctorId });
    }
    else if (type === "D") {
      diagnosisProfile = await DiagnosisProfile.findOne({ _id: id });
    } 

    if (!diagnosisProfile) {
      return res.status(404).json(errorHelper("00051", req));
    }

    return res.status(200).json({
      diagnosisProfile
    });

  } catch (error) {
    console.error("Error retrieving diagnosis profile:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
}

export default getDiagnosisProfile