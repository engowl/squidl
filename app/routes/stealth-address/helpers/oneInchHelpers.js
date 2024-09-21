import axios from "axios"
import { sleep } from "../../../utils/miscUtils.js";

export const oneInchGetValueChart = async ({ chainIds, addresses }) => {
  const chainResults = {};
  const mergedChart = {};

  for (const chainId of chainIds) {
    try {
      const res = await axios.get(
        'https://api.1inch.dev/portfolio/portfolio/v4/general/value_chart',
        {
          params: {
            addresses: addresses.join(","),
            chain_id: chainId.toString(),
            timerange: "1year"
          },
          paramsSerializer: {
            indexes: null
          },
          headers: {
            Authorization: `Bearer ${process.env.ONE_INCH_DEV_PORTAL_API_KEY}`
          }
        }
      );

      chainResults[chainId] = res.data.result;

      // Merge results
      for (const dataPoint of res.data.result) {
        if (!mergedChart[dataPoint.timestamp]) {
          mergedChart[dataPoint.timestamp] = { timestamp: dataPoint.timestamp, value_usd: 0 };
        }
        mergedChart[dataPoint.timestamp].value_usd += dataPoint.value_usd;
      }

      await sleep(750)
    } catch (error) {
      console.error(`Error fetching data for chain ${chainId}:`, error.message);
      chainResults[chainId] = null;
    }
  }

  // Convert mergedChart object to array and sort by timestamp
  const sortedMergedChart = Object.values(mergedChart).sort((a, b) => a.timestamp - b.timestamp);

  return {
    addresses,
    chainIds,
    chart: sortedMergedChart
  };
};