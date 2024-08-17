import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match:
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    name : {
      type: String,
      required: true,
      lowercase: true,
    },

    googleId: String, // Google ID for users signing up with Google
    
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Require password if Google ID is not present
      },
    },
    role: {
      type: String,
      enum: ['Student', 'Doctor'],
      required: true
    },
    patients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    }],
    isActivated: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
    },
  
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);
export default User;


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email address of the user.
 *         username:
 *           type: string
 *           description: The username of the user.
 *         phoneNo:
 *           type: string
 *           description: The phone number of the user.
 *         googleId:
 *           type: string
 *           description: The Google ID of the user (if signing up with Google).
 *         password:
 *           type: string
 *           description: The password of the user (if signing up regularly).
 *         role:
 *           type: string
 *           enum: ['Student', 'Doctor']
 *           description: The role of the user.
 *         patients:
 *           type: array
 *           items:
 *             type: string
 *           description: An array of ObjectIds referencing the patients the user is working on.
 *       required:
 *         - email
 *         - username
 *         - phoneNo
 *         - role
 */