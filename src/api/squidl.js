import axios from "axios";
import Cookies from "js-cookie";
const apiWithSession = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
  });
  instance.interceptors.request.use(async (req) => {
    let access_token = Cookies.get("access_token");
    req.headers.Authorization = `Bearer ${access_token}`;
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
