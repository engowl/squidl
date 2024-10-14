import { ethers } from 'ethers'
import { bytesToString, decodeFunctionData, encodeFunctionResult, isAddress, isHex, parseAbi, toBytes } from 'viem/utils'
import { z } from 'zod'

import { readFileSync } from 'fs'
export const OffchainResolverAbi = JSON.parse(readFileSync('app/lib/contracts/ens-resolver/abi/OffchainResolver.json', 'utf-8'))

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const EMPTY_CONTENT_HASH = '0x'

export const schema = z.object({
  sender: z.string().refine((data) => isAddress(data)),
  data: z.string().refine((data) => isHex(data)),
});

export const resolverAbi = parseAbi([
  'function resolve(bytes calldata name, bytes calldata data) view returns(bytes memory)',
  'function resolveWithProof(bytes calldata response, bytes calldata extraData) view returns(bytes memory)',
  'function addr(bytes32 node) view returns (address)',
  'function addr(bytes32 node, uint256 coinType) view returns (bytes memory)',
  'function text(bytes32 node, string key) view returns (string memory)',
  'function contenthash(bytes32 node) view returns (bytes memory)',
  'function makeSignatureHash(address target, uint64 expires, bytes request, bytes result) pure returns (bytes32)',
]);

export function dnsDecodeName(encodedName) {
  const bytesName = toBytes(encodedName);
  return bytesToPacket(bytesName);
}

function bytesToPacket(bytes) {
  let offset = 0;
  let result = '';

  while (offset < bytes.length) {
    const len = bytes[offset];
    if (len === 0) {
      offset += 1;
      break;
    }

    result += `${bytesToString(bytes.subarray(offset + 1, offset + len + 1))}.`;
    offset += len + 1;
  }

  return result.replace(/\.$/, '');
}

export async function handleQuery({
  dnsEncodedName,
  encodedResolveCall,
  contractAddress,
  nameData,
}) {
  const { functionName, args } = decodeFunctionData({
    abi: resolverAbi,
    data: encodedResolveCall,
  });

  const abiItem = resolverAbi.find(
    (abi) => abi.name === functionName && abi.inputs.length === args.length
  );

  if (!abiItem) {
    throw new Error(`Unsupported query function ${functionName}`);
  }

  console.log('nameData', nameData);

  let res;
  switch (functionName) {
    case 'addr': {
      // Directly access the 'address' field from nameData
      res = nameData?.address ?? ZERO_ADDRESS;
      break;
    }
    case 'text': {
      const key = args[1];
      // Access the 'records' object instead of 'texts'
      res = nameData?.records?.[key] ?? 'Not Available'; // Default to 'Not Available'
      break;
    }
    case 'contenthash': {
      // Access the 'contenthash' field directly from nameData
      res = nameData?.contenthash ?? '0x'; // Default value if contenthash is missing
      break;
    }
    default: {
      throw new Error(`Unsupported query function ${functionName}`);
    }
  }
  console.log('res', res);

  const result = encodeFunctionResult({
    abi: [abiItem],
    functionName: functionName,
    result: [res]
  });

  const ttl = 300; // 5 minutes
  const validUntil = BigInt(Math.floor(Date.now() / 1000) + ttl);

  const wallet = new ethers.Wallet(process.env.ENS_RESOLVER_PK);

  const iface = new ethers.Interface(OffchainResolverAbi);
  const request = iface.encodeFunctionData("resolve", [dnsEncodedName, encodedResolveCall]);

  const signer = new ethers.SigningKey(wallet.privateKey);

  let messageHash = ethers.solidityPackedKeccak256(
    ['bytes', 'address', 'uint64', 'bytes32', 'bytes32'],
    [
      '0x1900',
      contractAddress,
      validUntil,
      ethers.keccak256(request || '0x'),
      ethers.keccak256(result),
    ]
  )

  const sig = signer.sign(messageHash);
  const sigData = ethers.concat([sig.r, sig.s, new Uint8Array([sig.v])]);

  console.log({
    result,
    validUntil,
    sigData,
  });

  const response = ethers.AbiCoder.defaultAbiCoder().encode(
    [
      { name: 'result', type: 'bytes' },
      { name: 'expires', type: 'uint64' },
      { name: 'sig', type: 'bytes' },
    ],
    [
      result,
      validUntil,
      sigData
    ]
  );

  return { data: response };
}