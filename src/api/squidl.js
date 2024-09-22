import { getAuthToken } from "@dynamic-labs/sdk-react-core";
import axios from "axios";

const apiWithSession = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
  });
  let lastSessionToken = null;
  instance.interceptors.request.use(async (req) => {
    console.log("get auth token triggered");
    const sessionToken = localStorage.getItem("access_token");
    lastSessionToken = console.log("get auth token not triggered");
    req.headers.Authorization = `Bearer ${sessionToken}`;
    return req;
  });
  return instance;
};

const isTokenExpired = async (token) => {
  if (!token) return true;

  try {
    // const { data } = await axios.post(
    //   `${import.meta.env.VITE_BACKEND_URL}/auth/session`,
    //   {
    //     authToken: token,
    //   }
    // );
    const currentTime = Date.now() / 1000;
    return data.decodedToken.exp < currentTime;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return true;
  }
};

export const squidlAPI = apiWithSession();
