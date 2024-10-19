import userModel from './user.js';
import tokenModel from './token.js';
import logModel from './log.js';
import PatientModel from './patient.js';
import mriModel from './mriFile.js';
import DiagnosisProfileModel from './diagnosisProfile.js';

export const Patient = PatientModel;
export const User = userModel;
export const Token = tokenModel;
export const Log = logModel;
export const MRI = mriModel
export const DiagnosisProfile = DiagnosisProfileModel;
