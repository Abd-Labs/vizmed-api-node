import { Patient } from "../../../models/index.js";
import { errorHelper, logger, getText } from "../../../utils/index.js";

const getPatientById = async (req, res) => {
  try {
    const { id } = req.params; // Extracting the _id from route parameters
    const doctorId = req.user._id; // Assuming the user is authenticated and `req.user` contains the logged-in doctor's info

    // Find the patient by _id and doctorId to ensure the patient belongs to the doctor
    const patient = await Patient.findOne({ _id: id, doctorId: doctorId });

    if (!patient) {
      return res.status(404).json(errorHelper("00051", req)); // Patient not found
    }

    logger("00089", doctorId, getText("en", "00089"), "Info", req);

    return res.status(200).json({
      resultCode: "00089",
      patient: patient
    });

  } catch (error) {
    console.error("Error retrieving patient:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
};

export default getPatientById;
