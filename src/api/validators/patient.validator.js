import Joi from "joi";

export const validateCreatePatient = (data) => {
  const schema = Joi.object({
    patientId: Joi.string().required(),
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30).required(),
    age: Joi.number().required(),
    gender: Joi.string().required(),
    contactInfo: Joi.object({
      phone: Joi.string().required(),
    }).required(),
  });
  return schema.validate(data);
};

// Validator for updating a patient
export const validateUpdatePatient = (data) => {
  const schema = Joi.object({
    patientId: Joi.string().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    age: Joi.number().integer().min(0).optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    contactInfo: Joi.object({
      phone: Joi.string().optional(),
    }).optional(),
  });

  return schema.validate(data);
};


// Validator for 'type' query parameter
export const validateGetDiagnosisProfile = (data) => {
  const schema = Joi.object({
    type: Joi.string()
      .valid("P", "D") // Only "P" or "D" are allowed
      .required()       // It must be present
      .messages({
        "any.required": "Query parameter 'type' is required.",
        "string.valid": "Query parameter 'type' must be either 'P' or 'D'.",
      }),
  });

  return schema.validate(data);
};
