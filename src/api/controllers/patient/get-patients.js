import { Patient } from "../../../models/index.js";
import { errorHelper, logger, getText } from "../../../utils/index.js";

const getPatients = async (req, res) => {
  try {
    const { name, sortBy } = req.query; // Extracting query parameters
    const doctorId = req.user._id;

    let query = { doctorId: doctorId };

    // // Add search filters if query parameters are provided
    // if (patientId) {
    //   query.patientId = patientId;
    // }
    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } }
      ];
    }

    // Determine the sort order; by default, sort by the most recent patients
    let sortOrder = { createdAt: -1 }; // Default: sort by 'createdAt' in descending order

    if (sortBy === "recent") {
      sortOrder = { createdAt: -1 }; // Most recent first
    } else if (sortBy === "oldest") {
      sortOrder = { createdAt: 1 }; // Oldest first
    }

    // Find patients based on query and apply sorting
    const patients = await Patient.find(query).sort(sortOrder);

    if (patients.length === 0) {
      return res.status(404).json(errorHelper("00051", req)); // No patients found
    }

    logger("00089", doctorId, getText("en", "00089"), "Info", req);

    return res.status(200).json({
      resultCode: "00089",
      patients: patients
    });

  } catch (error) {
    console.error("Error retrieving patients:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
};

export default getPatients;
