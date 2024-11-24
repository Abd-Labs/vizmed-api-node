import { Assessment } from "../../../models/index.js";

const getAllAssessments = async (req, res) => {
  try {
    const id = req.user._id;
    
    const assessments = await Assessment.find({
      studentId: id
    })

    if (!assessments) {
      return res.status(204).end();
    }
    // Response
    return res.status(200).json({
      data: assessments,
      message: "Assessments fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching Assessments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Assessments",
    });
  }
};

export default getAllAssessments;
