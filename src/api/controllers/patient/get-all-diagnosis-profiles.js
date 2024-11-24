import { DiagnosisProfile } from "../../../models/index.js";

const getAllDiagnosisProfiles = async (req, res) => {
  try {
    const doctorId = req.user._id; // Assuming the logged-in doctor information is available in req.user
  
    // Find all completed diagnosis profiles for the doctor
    const completedProfiles = await DiagnosisProfile.find({
      doctor_id: doctorId,
      diagnosis_status: "COMPLETED",
    })// Convert the Mongoose document into plain JS objects for easier manipulation

    // Response
    return res.status(200).json({
      success: true,
      data: completedProfiles,
      message: "Completed diagnosis profiles fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching completed diagnosis profiles:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch completed diagnosis profiles",
    });
  }
};

export default getAllDiagnosisProfiles;
