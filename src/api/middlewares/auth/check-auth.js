import { User, Token } from '../../../models/index.js';
import { errorHelper } from '../../../utils/index.js';
import { jwtSecretKey } from '../../../config/index.js';
import pkg from 'mongoose';
const { Types } = pkg;
import jwt from 'jsonwebtoken';
const { verify } = jwt;

export default async (req, res, next) => {
  let token = req.header('Authorization');
  if (!token) return res.status(401).json(errorHelper('00006', req));

  if (token.includes('Bearer'))
    token = req.header('Authorization').replace('Bearer ', '');

  try {
    const decoded = verify(token, jwtSecretKey);
    if (!Types.ObjectId.isValid(decoded._id))
      return res.status(400).json(errorHelper('00007', req));

    const user = await User.findById(decoded._id).exec();
    if (!user) return res.status(400).json(errorHelper('00009', req));

    const tokenExists = await Token.exists({ userId: decoded._id, status: true })
      .catch((err) => {
        return res.status(500).json(errorHelper('00008', req, err.message));
      });

    if (!tokenExists) return res.status(401).json(errorHelper('00011', req));

    req.user = user; // Attach full user information to req.user

    next();
  } catch (err) {
    return res.status(401).json(errorHelper('00012', req, err.message));
  }
};

