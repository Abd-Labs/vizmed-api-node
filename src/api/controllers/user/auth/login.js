import { User, Token } from '../../../../models/index.js';
import { validateLogin } from '../../../validators/user.validator.js';
import { errorHelper, getText, logger, signAccessToken, signRefreshToken } from '../../../../utils/index.js';
import bcrypt from 'bcryptjs';
const { compare } = bcrypt;

export default async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) {
    let code = '00038';
    if (error.details[0].message.includes('email'))
      code = '00039';
    else if (error.details[0].message.includes('password'))
      code = '00040';

    return res.status(400).json(errorHelper(code, req, error.details[0].message));
  }

  try {
    const user = await User.findOne({ email: req.body.email, isActivated: true, isVerified: true });

    if (!user)
      return res.status(404).json(errorHelper('00042', req)); // User not found error

    if (!user.isActivated)
      return res.status(400).json(errorHelper('00043', req));

    if (!user.isVerified)
      return res.status(400).json(errorHelper('00044', req));

    const match = await compare(req.body.password, user.password);
    if (!match)
      return res.status(400).json(errorHelper('00045', req)); // Password mismatch error

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Calculate the expiry date for the refresh token (7 days)
    const expiresIn = new Date(Date.now() + 604800000);

    // Update or create the token in the database
    await Token.updateOne(
      { userId: user._id },
      {
        $set: {
          refreshToken: refreshToken,
          status: true,
          expiresIn: expiresIn,
          createdAt: Date.now()
        },
      },
      { upsert: true } // Create a new token if it doesn't exist
    );

    logger('00047', user._id, getText('en', '00047'), 'Info', req);
    return res.status(200).json({
      // resultMessage: { en: getText('en', '00047'), tr: getText('tr', '00047') },
      resultCode: '00047',
      user,
      accessToken,
      refreshToken
    });
  } catch (err) {
    return res.status(500).json(errorHelper('00041', req, err.message)); // Internal server error
  }
};



/**
 * @swagger
 * /user/login:
 *    post:
 *      summary: Login
 *      requestBody:
 *        description: Email and password information to login
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *      tags:
 *        - User
 *      responses:
 *        "200":
 *          description: You logged in successfully.
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          resultMessage:
 *                              $ref: '#/components/schemas/ResultMessage'
 *                          resultCode:
 *                              $ref: '#/components/schemas/ResultCode'
 *                          user:
 *                              $ref: '#/components/schemas/User'
 *                          accessToken:
 *                              type: string
 *                          refreshToken:
 *                              type: string
 *        "400":
 *          description: Please provide all the required fields!
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