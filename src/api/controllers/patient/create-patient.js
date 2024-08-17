import { Patient } from "../../../models/index.js";
import { validateCreatePatient } from "../../validators/patient.validator.js";
import { errorHelper, logger ,getText} from "../../../utils/index.js";

const createPatient = async (req, res) => {
  
  const { error } = validateCreatePatient(req.body);
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

    return res.status(400).json(errorHelper(code, req, error.details[0].message));
  }
 
   // Check if the user is a doctor
   if (req.user.role !== 'Doctor') {
    console.log("Access denied. Only doctors can create patients.");
    return res.status(403).json(errorHelper("00017", req))
  }
 
  // Start a session and transaction
  const session = await Patient.startSession();
  session.startTransaction();

  try {
    const patient = new Patient({
      doctorId: req.user._id, // Doctor creating the patient
      patientId: req.body.patientId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      age: req.body.age,
      gender: req.body.gender,
      contactInfo: req.body.contactInfo,
    });

    const savedPatient = await patient.save({session});

    // Log success
    logger("00089", savedPatient._id, getText("en", "00089"), "Info", req);


     // Commit the transaction
     await session.commitTransaction();
     session.endSession();


    return res.status(201).json({
      // resultMessage: { en: getText("en", "00089") },
      resultCode: "00089",
      patient: savedPatient
    });

  } catch (error) {
    // Abort transaction if error occurs
    await session.abortTransaction();
    session.endSession();
    console.error("Error during patient creation:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
};

export default createPatient;
