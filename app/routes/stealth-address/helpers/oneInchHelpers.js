import axios from "axios";
import { sleep } from "../../../utils/miscUtils.js";

let isRequestInProgress = false;
const requestQueue = [];

const executeNextRequest = async () => {
  if (requestQueue.length > 0) {
    const nextRequest = requestQueue.shift(); // Get the next request
    isRequestInProgress = true; // Lock the request

    try {
      await nextRequest();
    } finally {
      isRequestInProgress = false; // Unlock after the request is completed
      executeNextRequest(); // Proceed to the next request
    }
  }
};

const enqueueRequest = (fn) => {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    // If no request is in progress, start processing the queue
    if (!isRequestInProgress) {
      executeNextRequest();
    }
  });
};

export const oneInchGetValueChart = async ({ chainIds, addresses }) => {
  const chainResults = {};
  const mergedChart = {};

  for (const chainId of chainIds) {
    try {
      await enqueueRequest(async () => {
        const res = await axios.get(
          'https://api.1inch.dev/portfolio/portfolio/v4/general/value_chart',
          {
            params: {
              addresses: addresses.join(","),
              chain_id: chainId.toString(),
              timerange: "1year",
            },
            paramsSerializer: {
              indexes: null,
            },
            headers: {
              Authorization: `Bearer ${process.env.ONE_INCH_DEV_PORTAL_API_KEY}`,
            },
          }
        );

        chainResults[chainId] = res.data.result;

        // Merge results
        for (const dataPoint of res.data.result) {
          if (!mergedChart[dataPoint.timestamp]) {
            mergedChart[dataPoint.timestamp] = {
              timestamp: dataPoint.timestamp,
              value_usd: 0,
            };
          }
          mergedChart[dataPoint.timestamp].value_usd += dataPoint.value_usd;
        }

        await sleep(750); // Ensure delay between requests
      });
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
    chart: sortedMergedChart,
  };
};

export const oneInchGetGeneralValue = async ({ chainIds, addresses }) => {
  const chainResults = {};

  for (const chainId of chainIds) {
    try {
      console.log(`Fetching data for chain ${chainId}...`);

      console.log(`Fetching data for chain ${chainId}...`);

      const res = await axios.get(
        'https://api.1inch.dev/portfolio/portfolio/v4/general/current_value',
        {
          params: {
            addresses: addresses.join(","),
            chain_id: chainId.toString(),
          },
          paramsSerializer: {
            indexes: null,
          },
          headers: {
            Authorization: `Bearer ${process.env.ONE_INCH_DEV_PORTAL_API_KEY}`,
          },
        }
      );

      console.log(`Fetched data for chain ${chainId}:`, res.data.result);

      chainResults[chainId] = res.data.result;

      await sleep(1000); // Ensure delay between requests
    } catch (error) {
      console.error(`Error fetching data for chain ${chainId}:`, error.message);
      chainResults[chainId] = null;
    }
  }

  console.log({ chainResults });
  return {
    addresses,
    chainIds,
    results: chainResults,
  };
};