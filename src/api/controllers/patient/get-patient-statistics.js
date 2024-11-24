import DiagnosisProfile from "../../../models/diagnosisProfile.js";

/**
 * Fetch statistics for completed diagnosis profiles.
 */
const fetchPatientStatistics = async (req, res) => {
  try {
    const doctorId = req.user._id; // Assuming the authenticated user's ID is available

    const totalProfiles = await DiagnosisProfile.countDocuments({ doctor_id: doctorId });

    // Fetch all completed diagnosis profiles for the given doctor
    const completedProfiles = await DiagnosisProfile.find({
      doctor_id: doctorId,
      diagnosis_status: "COMPLETED",
    });

    if (!completedProfiles || completedProfiles.length === 0) {
      return res.status(204).json({
        message: "No completed diagnosis profiles found for the given doctor.",
      });
    }

    // Prepare statistics for `ensemble_prediction`
    const statistics = completedProfiles.reduce((stats, profile) => {
      const prediction = profile.classification_result.ensemble_prediction;
      stats[prediction] = (stats[prediction] || 0) + 1;
      return stats;
    }, {});

    return res.status(200).json({
      message: "Statistics fetched successfully.",
      total_profiles: totalProfiles,
      completed_profiles: completedProfiles.length,
      statistics,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default fetchPatientStatistics;
