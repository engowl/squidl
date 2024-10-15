import axios from "axios";

export const oneInchApi = axios.create({
  baseURL: "https://api.1inch.dev",
  headers: {
    Authorization: `Bearer ${process.env.ONE_INCH_DEV_PORTAL_API_KEY}`,
  },
});
