import { User } from '../../../../models/index.js';
import { validateSendVerificationCode } from '../../../validators/user.validator.js';
import { generateRandomCode, sendCodeToEmail, errorHelper, logger, getText, signConfirmCodeToken } from '../../../../utils/index.js';

export default async (req, res) => {
  // Validate request body
  const { error } = validateSendVerificationCode(req.body);
  if (error) {
    return res.status(400).json(errorHelper('00029', req, error.details[0].message));
  }

  // Find the user based on email and activation status
  const user = await User.findOne({ email: req.body.email, isActivated: true })
    .catch((err) => {
      return res.status(500).json(errorHelper('00030', req, err.message));
    });

  if (!user) {
    return res.status(404).json(errorHelper('00036', req));
  }

  // Generate a random verification code
  const emailCode = generateRandomCode(4);

  // Send the verification code to the user's email
  try {
    await sendCodeToEmail(req.body.email, user.name, emailCode, 'en', 'register', req, res);
  } catch (err) {
    return res.status(500).json(errorHelper('00037', req, err.message));
  }
  // Update user's verification status
  user.isVerified = false;

  // Save updated user information
  await user.save().catch((err) => {
    return res.status(500).json(errorHelper('00037', req, err.message));
  });

  // Generate a confirmation token
  const confirmCodeToken = signConfirmCodeToken(user._id, emailCode);

  // Log the event
  logger('00048', user._id, getText('en', '00048'), 'Info', req);


  // Send a successful response
  return res.status(200).json({
    resultMessage: { en: getText('en', '00048') },
    resultCode: '00048',
    confirmToken: confirmCodeToken
  });
};

/**
 * @swagger
 * /user/send-verification-code:
 *    post:
 *      summary: Sends a verification code to the user.
 *      requestBody:
 *        description: Email of the user
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *      tags:
 *        - User
 *      responses:
 *        "200":
 *          description: The code is sent to your email successfully.
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          resultMessage:
 *                              $ref: '#/components/schemas/ResultMessage'
 *                          resultCode:
 *                              $ref: '#/components/schemas/ResultCode'
 *                          confirmToken:
 *                              type: string
 *        "400":
 *          description: Please provide a valid email!
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Result'
 *        "500":
 *          description: An internal server error occurred, please try again.
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Result'
 */
