import Joi from "joi";

export const validateCreateAssessment = (data) => {
  const schema = Joi.object({
    title: Joi.string().required().messages({
      "any.required": "Title is required.",
    }),
    type: Joi.string().valid("P", "N").required().messages({
      "any.required": "Type is required.",
      "any.only": "Type must be either 'P' or 'N'.",
    }),
    learningCaseId: Joi.string()
      .when("type", {
        is: "P",
        then: Joi.string().required().messages({
          "any.required":
            "Diagnosis Profile ID is required when using already stored diagnostic profile.",
        }),
        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "Diagnosis Profile ID is only allowed when type is 'P'.",
        }),
      })
      .messages({
        "string.base": "Diagnosis Profile ID must be a string.",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};
