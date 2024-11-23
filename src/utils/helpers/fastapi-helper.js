export const callFastApiEndpoint = async (url, payload) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    throw new Error("Error calling FastAPI endpoint: " + error.message);
  }
};
