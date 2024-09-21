import axios from "axios"
import { CHAINS } from "../config.js"
import { sleep } from "../utils/miscUtils.js"
import { prismaClient } from "../lib/db/prisma.js"
import cron from "node-cron"

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {*} _
 * @param {Function} done
 */
export const priceWorker = (app, _, done) => {
  // For the testnet and demonstration purpose, instead of identifying the token by it's address and chain, for now it will only identify it by it's symbol, but in the production, it should be identified by it's address and chain.
  // This worker is to potrays the idea of fetching the token prices from the 1Inch Dev Portal API

  console.log('Price worker is running...')

  // const fetchTokenPrices = async () => {
  //   const chains = [
  //     1, // Ethereum Mainnet
  //     137, // Polygon Mainnet
  //   ]

  //   for (const chain of chains) {
  //     const res = await axios.get(
  //       'https://api.1inch.dev/price/v1.1/1',
  //       {
  //         headers: {
  //           Authorization: `Bearer ${process.env.ONE_INCH_DEV_PORTAL_API_KEY}`
  //         },
  //         params: {
  //           currency: "USD"
  //         },
  //         paramsSerializer: {
  //           indexes: null
  //         },
  //         data: {
  //           // "tokens": [
  //           //   "0x111111111117dc0aa78b770fa6a738034120c302"
  //           // ],
  //           currency: "USD"
  //         }
  //       }
  //     )

  //     console.log(res.data)
  //     // {
  //     //     '0xa059b81568fee88791de88232e838465826cf419': '36478383732793',
  //     //     '0x525574c899a7c877a11865339e57376092168258': '1318434774184',
  //     //     '0x9e6be44cc1236eef7e1f197418592d363bedcd5a': '35772380739131',
  //     //     '0x6df0e641fc9847c0c6fde39be6253045440c14d3': '26576890947639',
  //     //     '0xee2a03aa6dacf51c18679c516ad5283d8e7c2637': '34799716270564',
  //     //     '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf': '24651678065089209153',
  //     //     '0xdc035d45d973e3ec169d2276ddab16f1e407384f': '459714437073402',
  //     //     '0x9a0c8ff858d273f57072d714bca7411d717501d7': '107609166031287'
  //     //   }

  //     // convert to array: [{address: address, price: price}]
  //     const tokenPrices = Object.entries(res.data).map(([address, price]) => {
  //       return {
  //         address,
  //         price
  //       }
  //     })

  //     console.log(tokenPrices)
  //   }

  // }
  // fetchTokenPrices()

  const fetchCommonTokenPrices = async () => {
    const targets = [
      {
        id: 'eth',
        name: 'Ethereum',
        symbol: 'ETH',
        chainId: 1,
        tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        isNativeToken: true
      },
      {
        id: 'usdc',
        name: 'USD Coin',
        symbol: 'USDC',
        chainId: 1,
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        isNativeToken: false
      },
      {
        id: 'eurc',
        name: 'Euro Coin',
        symbol: 'EURC',
        chainId: 1,
        tokenAddress: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
        isNativeToken: false
      },
      {
        id: 'matic',
        name: 'Polygon',
        symbol: 'POL',
        chainId: 137,
        tokenAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        isNativeToken: true
      }
    ]

    // Groups by chainId
    const groupedTargets = targets.reduce((acc, target) => {
      if (!acc[target.chainId]) {
        acc[target.chainId] = []
      }

      acc[target.chainId].push(target)
      return acc
    }, {})

    console.log({ groupedTargets })

    for (const chainId in groupedTargets) {
      const targets = groupedTargets[chainId]

      console.log({
        chainId,
        targets
      })

      const res = await axios.post(
        `https://api.1inch.dev/price/v1.1/${chainId}`,
        {
          tokens: targets.map(target => target.tokenAddress),
          currency: "USD"
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ONE_INCH_DEV_PORTAL_API_KEY}`
          },
          params: {},
          paramsSerializer: {
            indexes: null
          }
        }
      )

      for (const target of targets) {
        const price = res.data[target.tokenAddress.toLowerCase()]
        console.log({
          target,
          price: parseFloat(price)
        })

        await prismaClient.commonTokenPrice.upsert({
          where: {
            id: target.id
          },
          update: {
            chainId: parseInt(chainId),
            name: target.name,
            symbol: target.symbol,
            tokenAddress: target.tokenAddress,
            priceUsd: parseFloat(price),
            isNativeToken: target.isNativeToken
          },
          create: {
            id: target.id,
            chainId: parseInt(chainId),
            name: target.name,
            symbol: target.symbol,
            tokenAddress: target.tokenAddress,
            priceUsd: parseFloat(price),
            isNativeToken: target.isNativeToken
          }
        })
      }
      await sleep(2000)
    }

    console.log('Common token prices fetched and saved to the database')
  }

  // Run the worker every 5 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('Running price worker...')
      fetchCommonTokenPrices()
    } catch (error) {
      console.log('Error while running price worker', error)
    }
  })


  const fetchWhitelistedMultichainToken = async () => {
    try {
      const res = await axios.get(
        'https://api.1inch.dev/token/v1.2/multi-chain',
        {
          headers: {
            Authorization: `Bearer ${process.env.ONE_INCH_DEV_PORTAL_API_KEY}`
          },
          params: {},
          paramsSerializer: {
            indexes: null
          }
        },
      )

      console.log(res.data)

      for(const token of res.data) {
        await prismaClient.oneInchTokenList.upsert({
          where: {
            chainId_address: {
              chainId: token.chainId,
              address: token.address.toLowerCase()
            }
          },
          create: {
            address: token.address.toLowerCase(),
            chainId: token.chainId,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            logoURI: token.logoURI,
          },
          update: {
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            logoURI: token.logoURI,
          }
        })
      }

      console.log('Whitelisted multichain tokens fetched and saved to the database')
    } catch (error) {
      console.log('Error while fetching whitelisted multichain tokens', error)
    }
  }

  // Run the worker every 15 minutes
  cron.schedule('*/40 * * * *', async () => {
    try {
      console.log('Running whitelisted multichain token worker...')
      fetchWhitelistedMultichainToken()
    } catch (error) {
      console.log('Error while running whitelisted multichain token worker', error)
    }
  })

  done()
}