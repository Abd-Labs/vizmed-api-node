import { Patient } from "../../../models/index.js";
import { validateGetPatient } from "../../validators/patient.validator.js";
import { errorHelper, logger } from "../../../utils/index.js";

const getPatient = async (req, res) => {
  const { error } = validateGetPatient(req.params);
  if (error) {
    console.log(error);
    return res.status(400).json(errorHelper("00022", req, error.details[0].message));
  }
  try {
    const { search, sort = 'createdAt', order = 'desc', limit = 10, page = 1 } = req.query;

    // Build query based on search parameter
    let query = { doctorId: req.user._id };
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') }
      ];
    }

    // Calculate pagination parameters
    const options = {
      sort: { [sort]: order === 'asc' ? 1 : -1 },
      limit: parseInt(limit, 10),
      skip: (parseInt(page, 10) - 1) * parseInt(limit, 10)
    };

    // Retrieve patients
    const patients = await Patient.find(query, null, options);

    // Log success
    logger("00089", req.user._id, getText("en", "00089"), "Info", req);

    return res.status(200).json({
      resultMessage: { en: getText("en", "00089") },
      resultCode: "00089",
      patients
    });
  } catch (error) {
    console.error("Error during fetching patients:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
};

export default getPatient;
