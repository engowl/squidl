import { getAuthToken } from "@dynamic-labs/sdk-react-core";
import axios from "axios";

const apiWithSession = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
  });
  let lastSessionToken = null;
  instance.interceptors.request.use(async (req) => {
    const isExpired = await isTokenExpired(lastSessionToken);
    if (lastSessionToken == null || isExpired) {
      console.log("get auth token triggered");
      const sessionToken = getAuthToken();
      lastSessionToken = sessionToken;
    }
    console.log("get auth token not triggered");
    if (lastSessionToken) {
      req.headers.Authorization = `Bearer ${lastSessionToken}`;
    } else {
      req.headers.Authorization = undefined;
    }
    return req;
  });
  return instance;
};

const isTokenExpired = async (token) => {
  if (!token) return true;

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/auth/session`,
      {
        authToken: token,
      }
    );
    const currentTime = Date.now() / 1000;
    return data.decodedToken.exp < currentTime;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return true;
  }
};

export const squidlAPI = apiWithSession();
