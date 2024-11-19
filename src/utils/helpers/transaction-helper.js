import mongoose from 'mongoose';

export const withTransaction = async (fn, req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Execute the function and pass the session
    const result = await fn(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error("Transaction error:", error);

    // Throw the error so the calling controller can handle it
    throw error;
  }
};

export default withTransaction;