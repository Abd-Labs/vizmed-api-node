import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize the S3 client using environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION, // AWS region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const generatePutUrl = async (s3Key) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME, // Use bucket name from environment
    Key: s3Key
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 1800 });
    return url;
  } catch (error) {
    throw new Error("Error generating presigned URL: " + error.message);
  }
};

export const generateGetUrl = async (s3Key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return url;
  } catch (error) {
    throw new Error("Error generating presigned URL: " + error.message);
  }
  
}

export const validateS3Object = async (s3Key) => {
  const command = new HeadObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
  });

  try {
    await s3Client.send(command);
    return true; // Object exists
  } catch (error) {
    if (error.name === "NotFound") {
      return false; // Object does not exist
    }
    throw error; // Other errors
  }
};


export const generateDoctorS3Key = (doctorId, patientId, fileName) => {
  return `mri/doctors/${doctorId}/patients/${patientId}/${fileName}`;
};

export const generateStudentS3Key = (studentId, assessmentId, fileName) => {
  return `mri/student/${studentId}/assessment/${assessmentId}/${fileName}`;
};
