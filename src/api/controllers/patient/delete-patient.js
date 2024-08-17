import { Patient } from "../../../models/index.js";
import { errorHelper, logger, getText } from "../../../utils/index.js";

const deletePatient = async (req, res) => {


  const { id } = req.params; // MongoDB ObjectId (_id)

  const doctorId = req.user._id;

  // Start a session and transaction
  const session = await Patient.startSession();
  session.startTransaction();

  try {

    // Find the patient by _id and doctorId to ensure that the patient belongs to the requesting doctor
    const patient = await Patient.findOne({ _id: id, doctorId: doctorId }).session(session);

    if (!patient) {
      // If no patient is found, return a 404 error
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json(errorHelper("00051", req)); // No patient found with this ID
    }

    // Delete the patient
    await Patient.deleteOne({ _id: id }).session(session);

    logger("00090", doctorId, getText("en", "00090"), "Info", req);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      resultCode: "00090",
      resultMessage: getText("en", "00090"),
      _id: id, // Returning the ID of the deleted patient for confirmation
    });

  } catch (error) {
    // Abort transaction if any error occurs
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting patient:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
};

export default deletePatient;
