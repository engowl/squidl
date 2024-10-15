import axios from "axios";

export const moralisApi = axios.create({
  baseURL: "https://deep-index.moralis.io/api/v2.2",
  headers: {
    Accept: "application/json",
    "X-API-Key": process.env.MORALIS_API_KEY,
  },
});
