
import {MRI} from "../../../models/index.js";
const fileProcessed = async (req,res) => {
  console.log("Callback received")
  console.log(req.body);

  const { 
    zip_file_key, 
    metadata, 
    user_id, 
    patient_id, 
    mriFileId 
} = req.body;

try {
    // Update the MRI file with new data
    const updatedMRIFile = await MRI.findByIdAndUpdate(
        mriFileId, // The ID of the MRI file to update
        {
            zip_file_key,
            metadata,
            status: 'PROCESSED', // Update status to PROCESSED
            updatedAt: Date.now(), // Update the timestamp
        },
        { new: true } // Return the updated document
    );

    // Check if the MRI file was found and updated
    if (!updatedMRIFile) {
        return res.status(404).json({ message: 'MRI file not found.' });
    }

    // Respond with the updated MRI file
    console.log("Response returned")
    return res.status(200).end();
} catch (error) {
    console.error('Error updating MRI file:', error);
    return res.status(500).end();
}

}

export default fileProcessed;