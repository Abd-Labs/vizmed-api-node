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
    mriImages: Joi.array().items(Joi.string()).optional()
  });
  return schema.validate(data);
};


// Validator for retrieving a patient
export const validateGetPatient = (params) => {
  const schema = Joi.object({
    id: Joi.string().required()
  });
  return schema.validate(params);
};

export const validateEditPatient = (data) => {
  const schema = Joi.object({
    patientId: Joi.string(),
    firstName: Joi.string().min(3).max(30),
    lastName: Joi.string().min(3).max(30),
    age: Joi.number().integer().min(0),
    gender: Joi.string().valid('male', 'female', 'other'),
    contactInfo: Joi.object({
      phone: Joi.string()
    }),
    mriImages: Joi.array().items(Joi.string()),
  }).or('patientId', 'firstName', 'lastName', 'age', 'gender', 'contactInfo', 'mriImages');

  return schema.validate(data);
};

// Validator for deleting a patient
export const validateDeletePatient = (params) => {
  const schema = Joi.object({
    id: Joi.string().required()
  });
  return schema.validate(params);
};