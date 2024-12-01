import endpoints from "./endpoints";
import apiClient from "./apiClient";

export const loginUser = async (userName, passwordValue) => {
  try {
    if (!userName || !passwordValue) {
      throw "Username and password are required.";
    }

    console.log("Sending API request with:", { userName, password: "******" }); // Mask password in logs
    
    // Make the API request
    const response = await apiClient.post(endpoints.LOGIN, { userName, passwordValue });

    console.log("API response:", response.data); // Debug log
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Server Error in loginUser:", error.response.data);

      // Improved error handling for specific cases
      if (error.response.status === 429) {
        throw "Too many login attempts. Please try again later.";
      }

      throw error.response.data?.message || "Invalid credentials. Please try again.";
    }

    console.error("Unexpected Error in loginUser:", error.message);
    throw "Unable to connect to the server. Please check your internet connection.";
  }
};
