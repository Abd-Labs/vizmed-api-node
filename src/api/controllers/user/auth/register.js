import { User } from "../../../../models/index.js";
import { validateRegister } from "../../../validators/user.validator.js";
import {
  errorHelper,
  logger,
  getText,
  signAccessToken,
  signRefreshToken,
} from "../../../../utils/index.js";
import bcrypt from "bcryptjs";
const { hash } = bcrypt;

export default async (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) {
    console.log(error);
    let code = "00025";
    if (error.details[0].message.includes("email")) code = "00026";
    else if (error.details[0].message.includes("password")) code = "00027";
    else if (error.details[0].message.includes("name")) code = "00028";

    return res.status(400).json(errorHelper(code, req, error.details[0].message));
  }

  try {
    const exists = await User.exists({ email: req.body.email });
    if (exists) {
      console.log("User already exists");
      return res.status(409).json(errorHelper("00032", req));
    }
  } catch (err) {
    return res.status(500).json(errorHelper("00031", req, err.message));
  }

  const session = await User.startSession();

  session.startTransaction();

  try {
    const hashedPassword = await hash(req.body.password, 10);

    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name,
      role: req.body.role,
      isActivated: true,
      isVerified: false,
    });

    const savedUser = await user.save({ session });
    // console.log("User saved successfully:", savedUser);

    const accessToken = signAccessToken(savedUser._id);
    const refreshToken = signRefreshToken(savedUser._id);

    logger("00035", savedUser._id, getText("en", "00035"), "Info", req);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      resultMessage: { en: getText("en", "00035") },
      resultCode: "00035",
      accessToken,
      refreshToken,
      user: {
        ...savedUser._doc,
        password: null,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error during registration:", error);
    return res.status(500).json(errorHelper("00008", req, error.message));
  }
};


/**
 * @swagger
 * /user:
 *    post:
 *      summary: Registers the user
 *      requestBody:
 *        description: All required information about the user
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
 *                name:
 *                  type: string
 *                language:
 *                  type: string
 *                  enum: ['tr', 'en']
 *                platform:
 *                  type: string
 *                  enum: ['Android', 'IOS']
 *                timezone:
 *                  type: number
 *                deviceId:
 *                  type: string
 *      tags:
 *        - User
 *      responses:
 *        "200":
 *          description: You registered successfully.
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
 *                          confirmToken:
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
