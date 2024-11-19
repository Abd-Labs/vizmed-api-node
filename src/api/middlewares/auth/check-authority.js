import { errorHelper } from '../../../utils/index.js';

export const isStudent = (req, res, next) => {
  try {
    // Ensure user is attached to the request by checkAuth middleware
    if (!req.user) {
      return res.status(403).json(errorHelper("00017", req)); // Access denied. User not authenticated.
    }

    // Check if the user's role is "Student"
    if (req.user.role !== "Student") {
      return res.status(403).json(errorHelper("00017", req)); // Access denied. Not authorized as Student.
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    return res.status(500).json(errorHelper("00008", req, err.message)); // Internal Server Error
  }
};

export const isDoctor = (req, res, next) => {
  try {
    // Ensure user is attached to the request by checkAuth middleware
    if (!req.user) {
      return res.status(403).json(errorHelper("00017", req)); // Access denied. User not authenticated.
    }

    // Check if the user's role is "Doctor"
    if (req.user.role !== "Doctor") {
      return res.status(403).json(errorHelper("00017", req)); // Access denied. Not authorized as Doctor.
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    return res.status(500).json(errorHelper("00008", req, err.message)); // Internal Server Error
  }
};
