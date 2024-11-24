import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["N", "P"],
    required: true,
  },
  mriFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MRIFile",
  },
  learningCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DiagnosisProfile",
    required: function () {
      return this.type === "P";
    },
  },
  studentPrediction: {
    disease_class: {
      type: String,
      enum: ["AD", "CN", "EMCI", "LMCI", "MCI"],
    },
    biomarkers: {
      type: [String],
      default: [],
    },
  },
  model_classification_result: {
    axial_classification: { type: String, enum: ['AD', 'CN', 'EMCI', 'LMCI', 'MCI'] },
    coronal_classification: { type: String, enum: ['AD', 'CN', 'EMCI', 'LMCI', 'MCI'] },
    sagittal_classification: { type: String, enum: ['AD', 'CN', 'EMCI', 'LMCI', 'MCI'] },
    ensemble_prediction: { type: String, enum: ['AD', 'CN', 'EMCI', 'LMCI', 'MCI'] },
  },
  report: {
    accuracyComparison: {
      type: String,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  status: {
    type: String,
    enum: ["COMPLETED", "IN_PROGRESS"],
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;
