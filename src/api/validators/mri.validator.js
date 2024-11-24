import Joi from "joi";

// Validator for getPreSignedUrl API endpoint
export const validateGetPreSignedUrl = (data) => {
  const schema = Joi.object({
    fileName: Joi.string().required(),
  });

  return schema.validate(data);
};

// Validator for updating Assessment or DiagnosisProfile
export const validateUpdateResource = (data) => {
  const schema = Joi.object({
    disease_prediction: Joi.string()
      .valid("AD", "CN", "EMCI", "LMCI", "MCI")
      .optional(),
    biomarkers: Joi.array().items(Joi.string()).optional(),
    doctor_notes: Joi.string().optional(),
  });

  return schema.validate(data);
};
