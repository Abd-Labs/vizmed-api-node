import { Assessment, DiagnosisProfile } from "../../../models/index.js";
import { errorHelper } from "../../../utils/index.js";
import { validateUpdateResource } from "../../validators/mri.validator.js"

const updateResource = async (req, res) => {

  const {error} =  validateUpdateResource(req.body)

  if (error) {
    console.log(error);
    return res.status(400).json({message: error.details[0].message}); // Error: Invalid request body
  }

  try {
    const id = req.params.id; // ID of the resource to update
    const userRole = req.user.role; // User's role from request
    const { biomarkers, doctor_notes, disease_prediction } = req.body; // Fields to update

    let resourceObject;

    if (userRole === "Doctor") {
      // Find DiagnosisProfile by ID
      resourceObject = await DiagnosisProfile.findOne({ _id: id });

      if (!resourceObject) {
        return res.status(404).json(errorHelper("00098", req)); // Error: DiagnosisProfile not found
      }

      // Update fields
      if (biomarkers) {
        resourceObject.biomarkers = biomarkers;
      }
      if (doctor_notes !== undefined) {
        resourceObject.doctor_notes = doctor_notes;
      }

      resourceObject.status = "COMPLETED"; 
      
      await resourceObject.save();

      return res.status(200).json({
        message: "Diagnosis Profile updated successfully",
        data: resourceObject,
      });
    } else if (userRole === "Student") {
      // Find Assessment by ID
      resourceObject = await Assessment.findOne({ _id: id });

      if (!resourceObject) {
        return res.status(404).json(errorHelper("00100", req)); // Error: Assessment not found
      }

      // Update studentPrediction
      if (disease_prediction) resourceObject.studentPrediction.disease_class = disease_prediction;
      if (biomarkers) resourceObject.studentPrediction.biomarkers = biomarkers;
      resourceObject.status = "COMPLETED"; // Mark status as COMPLETED
      await resourceObject.save();


      return res.status(200).json({
        message: "Assessment updated successfully",
        data: resourceObject,
      });
    } else {
      return res.status(403).json(errorHelper("00019", req)); // Error: Unauthorized role
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export default updateResource;
