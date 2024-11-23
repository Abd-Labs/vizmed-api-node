import Joi from "joi";

// Validator for getPreSignedUrl API endpoint
export const validateGetPreSignedUrl = (data) => {
  const schema = Joi.object({
    fileName: Joi.string().required(),
  });

  return schema.validate(data);
};