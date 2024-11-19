import Joi from "joi";

// Validator for getPreSignedUrl API endpoint
export const validateGetPreSignedUrl = (data) => {
  const schema = Joi.object({
    fileName: Joi.string().required(), // File name must be a string and is required
  });

  return schema.validate(data);
};