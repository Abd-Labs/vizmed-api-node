import { Assessment, DiagnosisProfile } from "../../../models/index.js";
import { validateCreateAssessment } from "../../validators/assessments.validator.js";
import {
  errorHelper,
  logger,
  getText,
  withTransaction,
} from "../../../utils/index.js";

const createAssessment = async (req, res) => {
  // Validate the request body
  const { error } = validateCreateAssessment(req.body);
  if (error) {
    console.log(error);
    let code = "00038"; // Default validation error code
    if (error.details[0].message.includes("firstName")) code = "00096";
    else if (error.details[0].message.includes("learningCaseId"))
      code = "00097";

    return res
      .status(400)
      .json(errorHelper(code, req, error.details[0].message));
  }

  // Use transaction for atomicity
  try {
    const assessment = await withTransaction(
      async (session) => {
        const { type, learningCaseId, title } = req.body;

        const learningCase = await DiagnosisProfile.findById(
          learningCaseId
        ).session(session);

        if (!learningCase) {
          return res.status(400).json(
            errorHelper(
              "00098", // Example error code for learning case not found
              req
            )
          );
        }

        // Create a new assessment
        const newAssessment = new Assessment({
          studentId: req.user._id,
          title: title,
          type,
          learningCaseId: type === "P" ? learningCaseId : null,
          status: "IN_PROGRESS"
        });

        const savedAssessment = await newAssessment.save({ session });

        // Log success
        logger(
          "00103",
          savedAssessment._id,
          getText("en", "00103"),
          "Info",
          req
        );

        return savedAssessment;
      },
      req,
      res
    );

    // Return success response
    return res.status(201).json({
      resultCode: "00103",
      assessment,
    });
  } catch (error) {
    console.error("Error during assessment creation:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
};

export default createAssessment;
