// import axios from "axios"

// /**
//  *
//  * @param {import("fastify").FastifyInstance} app
//  * @param {*} _
//  * @param {Function} done
//  */
// export const priceWorker = (app, _, done) => {
//   // For the testnet and demonstration purpose, instead of identifying the token by it's address and chain, for now it will only identify it by it's symbol, but in the production, it should be identified by it's address and chain.
//   // This worker is to potrays the idea of fetching the token prices from the 1Inch Dev Portal API

//   console.log('Price worker is running...')

//   const fetchTokenPrices = async () => {
//     const TARGET_TOKENS = [
//       {
//         id: 'usdc',
//         chainId: 1,
//         symbol: 'USDC',
//         address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
//       },
//       {
//         id: 'eurc',
//         chainId: 1,
//         symbol: 'EURC',
//         address: "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c"
//       },
//       {
//         id: 'weth',
//         chainId: 1,
//         symbol: 'WETH',
//         address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
//       }
//     ]

//     const res = await axios.post(
//       'https://api.1inch.dev/price/v1.1/1',
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.ONE_INCH_DEV_PORTAL_API_KEY}`
//         },
//         params: {},
//         paramsSerializer: {
//           indexes: null
//         },
//         data: {
//           "tokens": [
//             "0x111111111117dc0aa78b770fa6a738034120c302"
//           ],
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


//   fetchTokenPrices()


//   done()
// }