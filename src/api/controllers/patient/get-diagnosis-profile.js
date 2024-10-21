import { DiagnosisProfile } from "../../../models/index.js";
import { errorHelper } from "../../../utils/index.js";


const getDiagnosisProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user._id;

    // Find the patient by _id and doctorId to ensure the patient belongs to the doctor
    const diagnosisProfile = await DiagnosisProfile.findOne({ patient_id: id, doctor_id: doctorId });

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