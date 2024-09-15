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


// Validator for getPreSignedUrl API endpoint
export const validateGetPreSignedUrl = (data) => {
  const schema = Joi.object({
    fileName: Joi.string().required(), // File name must be a string and is required
    fileType: Joi.string()
      .valid(
        'application/octet-stream', // NIfTI file format
        'image/jpeg',// Optional: In case images might be JPEGs
        'image/png'          
      )
      .required(), // File type must be one of the supported types and is required
  });

  return schema.validate(data);
};