import { ethers } from 'ethers'
import { bytesToString, decodeFunctionData, encodeFunctionResult, isAddress, isHex, parseAbi, toBytes } from 'viem/utils'
import { z } from 'zod'

export const schema = z.object({
  sender: z.string().refine((data) => isAddress(data)),
  data: z.string().refine((data) => isHex(data)),
})


export const resolverAbi = parseAbi([
  'function resolve(bytes calldata name, bytes calldata data) view returns(bytes memory result, uint64 expires, bytes memory sig)',
  'function resolveWithProof(bytes calldata response, bytes calldata extraData) view returns(bytes memory)',
  'function addr(bytes32 node) view returns (address)',
  'function addr(bytes32 node, uint256 coinType) view returns (bytes memory)',
  'function text(bytes32 node, string key) view returns (string memory)',
  'function contenthash(bytes32 node) view returns (bytes memory)',
])

// export const resolverAbi = parseAbi([
//   'constructor(string _url, address[] _signers)',
//   'error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)',
//   'event NewSigners(address[] signers)',
//   'function makeSignatureHash(address target, uint64 expires, bytes request, bytes result) pure returns (bytes32)',
//   'function resolve(bytes name, bytes data) view returns (bytes)',
//   'function resolveWithProof(bytes response, bytes extraData) view returns (bytes)',
//   'function setSigners(address[] _signers, bool _add) nonpayable',
//   'function setUrl(string _url) nonpayable',
//   'function signers(address) view returns (bool)',
//   'function supportsInterface(bytes4 interfaceID) pure returns (bool)',
//   'function url() view returns (string)'
// ]);


export function dnsDecodeName(encodedName) {
  const bytesName = toBytes(encodedName)
  return bytesToPacket(bytesName)
}

// Taken from ensjs https://github.com/ensdomains/ensjs/blob/main/packages/ensjs/src/utils/hexEncodedName.ts
function bytesToPacket(bytes) {
  let offset = 0
  let result = ''

  while (offset < bytes.length) {
    const len = bytes[offset]
    if (len === 0) {
      offset += 1
      break
    }

    result += `${bytesToString(bytes.subarray(offset + 1, offset + len + 1))}.`
    offset += len + 1
  }

  return result.replace(/\.$/, '')
}

export async function handleQuery({
  dnsEncodedName,
  encodedResolveCall,
  env
}) {
  const name = dnsDecodeName(dnsEncodedName);

  // Decode the internal resolve call like addr(), text() or contenthash()
  const { functionName, args } = decodeFunctionData({
    abi: resolverAbi,
    data: encodedResolveCall,
  })

  let res;

  // We need to find the correct ABI item for each function, otherwise `addr(node)` and `addr(node, coinType)` causes issues
  const abiItem = resolverAbi.find(
    (abi) => abi.name === functionName && abi.inputs.length === args.length
  )
  console.log('abiItem:', abiItem)

  const randomWallet = ethers.Wallet.createRandom().address
  res = randomWallet

  return {
    ttl: 1000,
    result: encodeFunctionResult({
      abi: [abiItem],
      functionName: functionName,
      result: res
    })
  }

}