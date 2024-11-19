import userModel from './user.js';
import tokenModel from './token.js';
import logModel from './log.js';
import patientModel from './patient.js';
import mriModel from './mriFile.js';
import diagnosisProfileModel from './diagnosisProfile.js';
import assessmentModel from './assessment.js';

export const Patient = patientModel;
export const User = userModel;
export const Token = tokenModel;
export const Log = logModel;
export const MRI = mriModel
export const DiagnosisProfile = diagnosisProfileModel;
export const Assessment = assessmentModel;