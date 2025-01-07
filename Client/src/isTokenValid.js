import {jwtDecode} from "jwt-decode";

export const isTokenValid = () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return false;

    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    return decoded.exp > currentTime; // Valid if expiration time is in the future
  } catch (error) {
    console.error("Invalid token:", error);
    return false;
  }
};
