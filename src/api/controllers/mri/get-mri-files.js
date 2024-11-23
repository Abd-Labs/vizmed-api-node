import { MRI } from "../../../models/index.js";
import { errorHelper } from "../../../utils/index.js";


const getMriFiles = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the patient by _id and doctorId to ensure the patient belongs to the doctor
    const mriFiles = await MRI.findOne({ _id: id});

    if (!mriFiles) {
      return res.status(404).json(errorHelper("00051", req));
    }

    return res.status(200).json({
      mriFiles
    });

  } catch (error) {
    console.error("Error retrieving MRI files:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
}

export default getMriFiles