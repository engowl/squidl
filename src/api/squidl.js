import axios from "axios";
import Cookies from "js-cookie";

const apiWithSession = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
  });
  instance.interceptors.request.use(async (req) => {
    const sessionToken = Cookies.get("access_token");
    console.log({ sessionToken });
    req.headers.Authorization = `Bearer ${sessionToken}`;
    return req;
  });
  return instance;
};

const apiNoSession = () => {
  return axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
  });
};

export const squidlAPI = apiWithSession();
export const squidlPublicAPI = apiNoSession();
