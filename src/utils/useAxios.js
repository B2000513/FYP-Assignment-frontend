import axios from "axios";
import jwtDecode from "jwt-decode";
import dayjs from "dayjs";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

const baseURL = "http://127.0.0.1:8000/api"; // Adjust API URL if necessary

const useAxios = () => {
  const { authTokens, setUser, setAuthTokens } = useContext(AuthContext);

  const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,  // ✅ Ensures cookies & CSRF token are sent
    headers: {
      Authorization: `Bearer ${authTokens?.access}`,
      "X-CSRFToken": localStorage.getItem("csrftoken") || "", // ✅ CSRF token for Django
    },
  });

  // 🔹 Automatically refresh token if expired
  axiosInstance.interceptors.request.use(async (req) => {
    if (!authTokens) return req;

    const user = jwtDecode(authTokens.access);
    const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

    if (!isExpired) return req;

    try {
      const response = await axios.post(`${baseURL}/token/refresh/`, {
        refresh: authTokens.refresh,
      });

      localStorage.setItem("authTokens", JSON.stringify(response.data));
      setAuthTokens(response.data);
      setUser(jwtDecode(response.data.access));

      req.headers.Authorization = `Bearer ${response.data.access}`;
    } catch (error) {
      console.error("Token refresh failed. Logging out...");
      localStorage.removeItem("authTokens");
      setAuthTokens(null);
      setUser(null);
    }

    return req;
  });

  // 🔹 Fetch customers from API
  const getCustomers = async () => {
    try {
      console.log("Sending request with token:", authTokens?.access);
      const response = await axiosInstance.get("/customers/");
      return response.data;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  };

  // 🔹 Fetch CSRF token (Django requires this for POST requests)
  const getCSRFToken = async () => {
    try {
      const response = await axiosInstance.get("/csrf/");
      localStorage.setItem("csrftoken", response.data.csrfToken);
    } catch (error) {
      console.error("CSRF token fetch failed:", error);
    }
  };

  // 🔹 Upload file function
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("excel_file", file);

    try {
      const response = await axiosInstance.post("/customers/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  const sendMessageToChatbot = async (message) => {
    try {
      const response = await axiosInstance.get("/chatbot/", {
        params: { message },
      });
      return response.data.response; // ✅ Extract chatbot's reply
    } catch (error) {
      console.error("Chatbot API error:", error.response || error.message);
      return "Sorry, I couldn't process your request.";
    }
  };

  return { axiosInstance, getCustomers, uploadFile, getCSRFToken, sendMessageToChatbot };
};

export default useAxios;
