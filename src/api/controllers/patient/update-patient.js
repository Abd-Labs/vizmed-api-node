import { Patient } from "../../../models/index.js";
import { validateUpdatePatient } from "../../validators/patient.validator.js";
import { errorHelper, logger, getText } from "../../../utils/index.js";
import mongoose from 'mongoose';
const updatePatient = async (req, res) => {
  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    console.log("Came here")

    return res
      .status(400)
      .json(errorHelper("00040", req, "Invalid patient ID format."));
  }

  const { error } = validateUpdatePatient(req.body);
  if (error) {
    console.log(error);
    let code = "00038"; // Default validation error code
    if (error.details[0].message.includes("patientId")) code = "00039";
    else if (error.details[0].message.includes("firstName")) code = "00077";
    else if (error.details[0].message.includes("lastName")) code = "00077";
    else if (error.details[0].message.includes("age")) code = "00080";
    else if (error.details[0].message.includes("gender")) code = "00078";
    else if (error.details[0].message.includes("phone")) code = "00079";
    else if (error.details[0].message.includes("mriImages")) code = "00044";

    return res
      .status(400)
      .json(errorHelper(code, req, error.details[0].message));
  }

  // Check if the user is a doctor
  if (req.user.role !== "Doctor") {
    console.log("Access denied. Only doctors can update patients.");
    return res.status(403).json(errorHelper("00017", req));
  }
  // Start a session and transaction
  const session = await Patient.startSession();
  session.startTransaction();

  try {
    // Find the patient by ID and doctor ID to ensure only the doctor who created the patient can update them
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
    });
    if (!patient) {
      return res.status(404).json(errorHelper("00051", req)); // Patient not found
    }

    // Update patient details
    patient.firstName = req.body.firstName || patient.firstName;
    patient.lastName = req.body.lastName || patient.lastName;
    patient.age = req.body.age || patient.age;
    patient.gender = req.body.gender || patient.gender;
    patient.contactInfo = {
      phone: req.body.contactInfo.phone || patient.contactInfo.phone,
      ...patient.contactInfo,
    };

    // Save the updated patient
    const updatedPatient = await patient.save({ session });

    // Log success
    logger("00090", updatedPatient._id, getText("en", "00090"), "Info", req);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      // resultMessage: { en: getText("en", "00090") },
      resultCode: "00090",
      patient: updatedPatient,
    });
  } catch (error) {
    // Abort transaction if error occurs
    await session.abortTransaction();
    session.endSession();
    console.error("Error during patient update:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
};

export default updatePatient;
